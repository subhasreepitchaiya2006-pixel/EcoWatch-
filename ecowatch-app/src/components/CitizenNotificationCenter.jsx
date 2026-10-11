import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import StatusIndicator from "./StatusIndicator";
import {
  getCitizenNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
} from "../lib/citizenNotifications";

export default function CitizenNotificationCenter({ isOpen, onClose }) {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState(getCitizenNotifications);
  const [selectedNotif, setSelectedNotif] = useState(null);

  useEffect(() => {
    const handleUpdate = () => setNotifications(getCitizenNotifications());
    window.addEventListener("ecowatch-notifications-updated", handleUpdate);
    return () => window.removeEventListener("ecowatch-notifications-updated", handleUpdate);
  }, []);

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSelectNotification = (notif) => {
    setSelectedNotif(notif);
  };

  const handleOpenDetailedPage = (notif) => {
    markNotificationAsRead(notif.id);
    setNotifications((prev) =>
      prev.map((n) => (n.id === notif.id ? { ...n, read: true } : n))
    );
    onClose();
    if (notif.targetUrl) {
      navigate(notif.targetUrl);
    }
  };

  const handleMarkAllRead = () => {
    const updated = markAllNotificationsAsRead();
    setNotifications(updated);
  };

  const modalContent = (
    <div
      className="fixed inset-0 z-[99999] flex items-start justify-end p-3 pt-16 sm:p-6 sm:pt-20 bg-black/60 backdrop-blur-xs animate-in fade-in"
      onClick={onClose}
    >
      <div
        className="citizen-notif-dialog w-full max-w-lg bg-surface-container-lowest border border-outline-variant/60 rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] animate-in slide-in-from-top-4 relative z-[100000]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 bg-surface-container border-b border-outline-variant/40 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-[22px]">notifications_active</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-headline-sm text-sm sm:text-base font-bold text-on-surface">
                  Citizen Notifications
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-primary/15 text-primary">
                  {notifications.filter((n) => !n.read).length} new
                </span>
              </div>
              <p className="text-[11px] text-on-surface-variant mt-0.5">
                Real-time civil alerts, community events &amp; environmental updates
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleMarkAllRead}
              className="text-[11px] font-semibold text-primary hover:underline px-2 py-1 cursor-pointer"
              title="Mark all as read"
            >
              Mark all read
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl hover:bg-surface-container-high text-on-surface-variant transition-colors cursor-pointer"
              title="Close notifications"
            >
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>
          </div>
        </div>

        {/* Selected Item Detail Preview (if clicked) */}
        {selectedNotif && (
          <div className="p-4 bg-primary/5 border-b border-primary/20 animate-in fade-in">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                  <StatusIndicator level={selectedNotif.severity} size="xs" />
                  <span className="text-[11px] font-semibold text-on-surface-variant">
                    📍 {selectedNotif.location}
                  </span>
                  <span className="text-[10px] text-on-surface-variant/70">
                    🕒 {selectedNotif.timeAgo}
                  </span>
                </div>
                <h4 className="font-bold text-sm text-on-surface mb-1">
                  {selectedNotif.title}
                </h4>
                <p className="text-xs text-on-surface-variant leading-relaxed mb-3">
                  {selectedNotif.description}
                </p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleOpenDetailedPage(selectedNotif)}
                    className="px-3.5 py-1.5 bg-primary text-white rounded-lg text-xs font-bold hover:bg-primary/90 flex items-center gap-1.5 shadow-xs transition-transform active:scale-95"
                  >
                    <span>Open Detailed Page</span>
                    <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                  </button>
                  <button
                    onClick={() => setSelectedNotif(null)}
                    className="px-3 py-1.5 border border-outline-variant rounded-lg text-xs font-semibold text-on-surface-variant hover:bg-surface-container"
                  >
                    Collapse
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* List of Notifications */}
        <div className="overflow-y-auto flex-1 divide-y divide-outline-variant/30 custom-scrollbar p-2 space-y-1">
          {notifications.map((notif, index) => {
            const isSelected = selectedNotif?.id === notif.id;
            return (
              <div
                key={notif.id}
                onClick={() => handleSelectNotification(notif)}
                onDoubleClick={() => handleOpenDetailedPage(notif)}
                className={`p-3.5 rounded-xl cursor-pointer transition-all border ${
                  isSelected
                    ? "bg-primary/10 border-primary shadow-xs"
                    : notif.read
                    ? "bg-surface-container-lowest border-transparent hover:bg-surface-container/60"
                    : "bg-surface-container-low border-outline-variant/40 hover:border-primary/40 shadow-xs"
                }`}
              >
                <div className="flex items-start justify-between gap-2 mb-1.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[11px] font-mono font-bold text-on-surface-variant/60">
                      #{index + 1}
                    </span>
                    <StatusIndicator level={notif.severity} size="xs" />
                    <span className="text-[11px] font-bold text-on-surface-variant">
                      📍 {notif.location}
                    </span>
                  </div>
                  <span className="text-[10px] text-on-surface-variant/70 font-mono whitespace-nowrap">
                    {notif.timeAgo}
                  </span>
                </div>

                <h4 className="font-bold text-xs sm:text-sm text-on-surface leading-snug">
                  {notif.title}
                </h4>
                <p className="text-xs text-on-surface-variant mt-1 line-clamp-2 leading-relaxed">
                  {notif.description}
                </p>

                <div className="mt-2.5 pt-2 border-t border-outline-variant/20 flex items-center justify-between text-[11px]">
                  <span className="text-[10px] text-on-surface-variant font-medium flex items-center gap-1">
                    <span className="material-symbols-outlined text-[13px] text-primary">touch_app</span>
                    Click to select • Double-click to open
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleOpenDetailedPage(notif);
                    }}
                    className="text-primary font-bold hover:underline flex items-center gap-0.5 text-[11px]"
                  >
                    <span>View details</span>
                    <span className="material-symbols-outlined text-[14px]">chevron_right</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="p-3 bg-surface-container border-t border-outline-variant/40 flex items-center justify-between text-[11px] text-on-surface-variant">
          <span>{notifications.length} Active Notifications</span>
          <span className="font-medium text-[10px] text-on-surface-variant/80">
            Real-Time Push Alerts Synchronized
          </span>
        </div>
      </div>
    </div>
  );

  if (typeof document !== "undefined") {
    return createPortal(modalContent, document.body);
  }
  return modalContent;
}
