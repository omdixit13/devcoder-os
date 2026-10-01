import React, { useState } from 'react';
import { ExternalLink as ExternalLinkIcon, AlertCircle } from 'lucide-react';
import { isValidHttpUrl, openExternalUrl, sanitizeUrl } from '../../utils/urlValidator';

interface ExternalLinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  href: string;
  children: React.ReactNode;
  className?: string;
  showIcon?: boolean;
  iconSize?: number;
  iconPosition?: 'right' | 'left';
  tooltipText?: string;
  onClick?: (e: React.MouseEvent<HTMLAnchorElement>) => void;
}

export default function ExternalLink({
  href,
  children,
  className = '',
  showIcon = true,
  iconSize = 13,
  iconPosition = 'right',
  tooltipText,
  onClick,
  ...rest
}: ExternalLinkProps) {
  const [showTooltip, setShowTooltip] = useState(false);
  const [hasError, setHasError] = useState(false);

  const isValid = isValidHttpUrl(href);
  const canonicalUrl = sanitizeUrl(href) || href;

  const handleClick = async (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    e.stopPropagation();

    if (onClick) {
      onClick(e);
    }

    if (!isValid) {
      setHasError(true);
      setTimeout(() => setHasError(false), 3000);
      return;
    }

    const success = await openExternalUrl(canonicalUrl);
    if (!success) {
      setHasError(true);
      setTimeout(() => setHasError(false), 3000);
    }
  };

  return (
    <span className="relative inline-flex items-center">
      <a
        href={canonicalUrl}
        target="_blank"
        rel="noopener noreferrer"
        onClick={handleClick}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        className={`inline-flex items-center gap-1.5 transition-colors cursor-pointer ${className}`}
        title={tooltipText || `Open ${canonicalUrl}`}
        {...rest}
      >
        {showIcon && iconPosition === 'left' && (
          <ExternalLinkIcon size={iconSize} className="shrink-0 opacity-70 group-hover:opacity-100 transition-opacity" />
        )}
        <span>{children}</span>
        {showIcon && iconPosition === 'right' && (
          <ExternalLinkIcon size={iconSize} className="shrink-0 opacity-70 group-hover:opacity-100 transition-opacity" />
        )}
      </a>

      {/* Floating Tooltip showing destination */}
      {showTooltip && (
        <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 px-2.5 py-1 bg-surface-2 border border-border-default rounded-md text-2xs text-text-secondary whitespace-nowrap shadow-modal z-50 pointer-events-none animate-fade-in font-mono">
          ↗ {canonicalUrl}
        </span>
      )}

      {/* Error popover if URL is malformed */}
      {hasError && (
        <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 px-2.5 py-1 bg-accent-red/20 border border-accent-red/40 rounded-md text-2xs text-accent-red whitespace-nowrap shadow-modal z-50 animate-scale-in flex items-center gap-1">
          <AlertCircle size={10} />
          Invalid destination URL
        </span>
      )}
    </span>
  );
}
