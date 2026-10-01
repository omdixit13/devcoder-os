import { useState, useEffect } from 'react';
import { Bell, X, CheckCircle2, AlertCircle } from 'lucide-react';
import { getNotificationPermissionStatus, requestNotificationPermission, isNotificationSupported } from '../../utils/notificationService';
import { soundManager } from '../../utils/soundManager';

export default function NotificationPermissionPrompt() {
  const [showPrompt, setShowPrompt] = useState(false);
  const [permissionState, setPermissionState] = useState<'prompt' | 'granted' | 'denied' | 'default'>('prompt');
  const [isRequesting, setIsRequesting] = useState(false);

  useEffect(() => {
    // Only check if notifications are supported and user hasn't explicitly dismissed this session
    if (!isNotificationSupported()) return;

    const dismissed = sessionStorage.getItem('devcareer_notif_dismissed');
    if (dismissed) return;

    getNotificationPermissionStatus().then(status => {
      setPermissionState(status.permission);
      if (status.permission === 'prompt' || status.permission === 'default') {
        // Show subtle prompt after a short delay so user has seen the app
        const timer = setTimeout(() => setShowPrompt(true), 1500);
        return () => clearTimeout(timer);
      }
    });
  }, []);

  const handleRequest = async () => {
    setIsRequesting(true);
    soundManager.play('click');
    const granted = await requestNotificationPermission();
    setIsRequesting(false);
    if (granted) {
      soundManager.play('milestone');
      setPermissionState('granted');
      setTimeout(() => setShowPrompt(false), 2500);
    } else {
      setPermissionState('denied');
      setTimeout(() => setShowPrompt(false), 3000);
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    sessionStorage.setItem('devcareer_notif_dismissed', 'true');
  };

  if (!showPrompt) return null;

  return (
    <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 mb-4 animate-slide-up">
      <div className="bg-surface-2/95 backdrop-blur-md border border-accent-blue/30 rounded-xl p-3.5 sm:p-4 shadow-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-start sm:items-center gap-3 min-w-0 flex-1">
          <div className="w-9 h-9 rounded-xl bg-accent-blue/15 text-accent-blue flex items-center justify-center shrink-0 mt-0.5 sm:mt-0">
            {permissionState === 'granted' ? (
              <CheckCircle2 size={18} className="text-accent-green" />
            ) : permissionState === 'denied' ? (
              <AlertCircle size={18} className="text-accent-red" />
            ) : (
              <Bell size={18} className="animate-bounce" />
            )}
          </div>
          <div className="min-w-0">
            <h4 className="text-xs sm:text-sm font-semibold text-text-primary">
              {permissionState === 'granted'
                ? 'Notifications Enabled!'
                : permissionState === 'denied'
                ? 'Notifications Blocked in Browser Settings'
                : 'Turn On Daily Career & Contest Alerts'}
            </h4>
            <p className="text-2xs sm:text-xs text-text-tertiary mt-0.5">
              {permissionState === 'granted'
                ? 'You will receive reminders for daily LeetCode streaks and contest alerts.'
                : permissionState === 'denied'
                ? 'To enable alerts later, allow notifications in your device or browser settings.'
                : 'Get notified for revision spaced repetition, deadlines, and daily goals.'}
            </p>
          </div>
        </div>

        {permissionState !== 'granted' && permissionState !== 'denied' && (
          <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
            <button
              onClick={handleDismiss}
              className="px-3 py-1.5 rounded-lg text-2xs sm:text-xs text-text-tertiary hover:text-text-secondary transition-colors"
            >
              Maybe Later
            </button>
            <button
              onClick={handleRequest}
              disabled={isRequesting}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-accent-blue hover:bg-blue-600 text-white text-2xs sm:text-xs font-semibold shadow-sm transition-all"
            >
              <Bell size={13} />
              <span>{isRequesting ? 'Asking...' : 'Enable Alerts'}</span>
            </button>
            <button
              onClick={handleDismiss}
              className="p-1 rounded-md text-text-tertiary hover:text-text-primary transition-colors sm:hidden"
              aria-label="Close"
            >
              <X size={14} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
