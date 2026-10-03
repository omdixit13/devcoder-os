/**
 * DevCareer OS — Real Python Execution Worker (Pyodide CPython WebAssembly)
 * Runs in a background Web Worker so the main UI thread never freezes.
 * Captures real stdin (input()), stdout (print()), and real tracebacks (IndexError, etc.).
 */

let pyodideInstance = null;
let isInitializing = false;
let initPromise = null;

async function getPyodide() {
  if (pyodideInstance) return pyodideInstance;
  if (initPromise) return initPromise;

  initPromise = (async () => {
    try {
      importScripts('https://cdn.jsdelivr.net/pyodide/v0.26.4/full/pyodide.js');
      const py = await loadPyodide({
        indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.26.4/full/',
      });
      pyodideInstance = py;
      return py;
    } catch (err) {
      initPromise = null;
      throw err;
    }
  })();

  return initPromise;
}

// Listen for execution commands from the main thread
self.onmessage = async (e) => {
  const { type, id, code, stdin = '' } = e.data || {};

  if (type === 'init') {
    try {
      await getPyodide();
      self.postMessage({ type: 'init_success' });
    } catch (err) {
      self.postMessage({ type: 'init_error', error: String(err) });
    }
    return;
  }

  if (type === 'execute') {
    const startTime = Date.now();
    try {
      const py = await getPyodide();

      // Pass user code and stdin safely across JS-Python boundary via globals
      py.globals.set('__user_code__', code);
      py.globals.set('__user_stdin__', stdin);

      // Execute with redirected stdin, stdout, stderr and error handling
      py.runPython(`
import sys, io, traceback

# Prepare stdin from input string
sys.stdin = io.StringIO(__user_stdin__)

# Prepare stdout and stderr string buffers
_out_buf = io.StringIO()
_err_buf = io.StringIO()
sys.stdout = _out_buf
sys.stderr = _err_buf

__exec_status__ = 0
__exec_error__ = ""

try:
    # Compile and execute the user's code in a dedicated global namespace
    _user_ns = {
        '__name__': '__main__',
        '__doc__': None,
        '__package__': None,
    }
    exec(__user_code__, _user_ns)
except SystemExit as se:
    __exec_status__ = getattr(se, 'code', 0) or 0
except Exception as ex:
    __exec_status__ = 1
    __exec_error__ = traceback.format_exc()
except BaseException as be:
    __exec_status__ = 1
    __exec_error__ = traceback.format_exc()
finally:
    # Restore standard streams
    sys.stdout = sys.__stdout__
    sys.stderr = sys.__stderr__

__stdout_res__ = _out_buf.getvalue()
__stderr_res__ = __exec_error__ if __exec_error__ else _err_buf.getvalue()
`);

      const stdout = py.globals.get('__stdout_res__') || '';
      const stderr = py.globals.get('__stderr_res__') || '';
      const exitCode = py.globals.get('__exec_status__') || 0;

      const executionTimeMs = Date.now() - startTime;

      let status = 'passed';
      if (exitCode !== 0 || (stderr && stderr.trim().length > 0)) {
        if (stderr.includes('SyntaxError') || stderr.includes('IndentationError')) {
          status = 'compilation_error';
        } else {
          status = 'runtime_error';
        }
      }

      self.postMessage({
        type: 'execute_result',
        id,
        status,
        stdout,
        stderr,
        exitCode,
        executionTimeMs,
      });
    } catch (err) {
      self.postMessage({
        type: 'execute_result',
        id,
        status: 'runtime_error',
        stdout: '',
        stderr: String(err?.message || err),
        exitCode: 1,
        executionTimeMs: Date.now() - startTime,
      });
    }
  }
};
