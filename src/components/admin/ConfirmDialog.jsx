import React, { useEffect } from 'react';

/**
 * ConfirmDialog - Custom dialog xác nhận đẹp thay thế window.confirm
 * Props:
 *   open: boolean
 *   title: string
 *   message: string | ReactNode
 *   icon: string emoji (tự động theo type nếu không truyền)
 *   confirmText: string (default 'Xác nhận')
 *   cancelText: string (default 'Hủy')
 *   onConfirm: function
 *   onCancel: function
 *   type: 'danger' | 'warning' | 'success' (default 'danger')
 */
export default function ConfirmDialog({
    open,
    title = 'Xác nhận',
    message,
    icon,
    confirmText = 'Xác nhận',
    cancelText = 'Hủy',
    onConfirm,
    onCancel,
    type = 'danger',
}) {
    useEffect(() => {
        if (!open) return;
        const handler = (e) => { if (e.key === 'Escape') onCancel?.(); };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, [open, onCancel]);

    if (!open) return null;

    const defaultIcons = { danger: '🗑️', warning: '⚠️', success: '✅' };
    const displayIcon = icon || defaultIcons[type] || '⚠️';

    return (
        <div className="confirm-overlay" onClick={onCancel}>
            <div className="confirm-dialog" onClick={e => e.stopPropagation()}>

                {/* Icon */}
                <div className={`confirm-icon-wrap ${type}`}>
                    <span className="confirm-icon">{displayIcon}</span>
                </div>

                {/* Content */}
                <div className="confirm-content">
                    <h3 className="confirm-title">{title}</h3>
                    <p className="confirm-message">{message}</p>
                </div>

                {/* Actions */}
                <div className="confirm-actions">
                    <button className="confirm-btn-cancel" onClick={onCancel}>
                        {cancelText}
                    </button>
                    <button
                        className={`confirm-btn-ok ${type}`}
                        onClick={onConfirm}
                        autoFocus
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
}
