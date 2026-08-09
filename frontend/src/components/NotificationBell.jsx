import { useEffect, useRef, useState } from "react";
import {
  FiBell,
  FiCheck,
  FiTrash2,
} from "react-icons/fi";

import api from "../services/api";

function NotificationBell() {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const menuRef = useRef(null);

  async function fetchNotifications() {
    try {
      setLoading(true);

      const response = await api.get("/notifications");

      setNotifications(
        response.data.notifications || []
      );

      setUnreadCount(
        response.data.unreadCount || 0
      );
    } catch (error) {
      console.error(
        "Erreur récupération notifications :",
        error
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchNotifications();

    const interval = setInterval(() => {
      fetchNotifications();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    function handleClickOutside(event) {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target)
      ) {
        setOpen(false);
      }
    }

    document.addEventListener(
      "mousedown",
      handleClickOutside
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleClickOutside
      );
    };
  }, []);

  async function markAsRead(notification) {
    if (notification.is_read) {
      return;
    }

    try {
      await api.put(
        `/notifications/${notification.id}/read`
      );

      setNotifications((current) =>
        current.map((item) =>
          item.id === notification.id
            ? {
                ...item,
                is_read: 1,
              }
            : item
        )
      );

      setUnreadCount((current) =>
        Math.max(0, current - 1)
      );
    } catch (error) {
      console.error(
        "Erreur notification lue :",
        error
      );
    }
  }

  async function markAllAsRead() {
    try {
      await api.put("/notifications/read-all");

      setNotifications((current) =>
        current.map((item) => ({
          ...item,
          is_read: 1,
        }))
      );

      setUnreadCount(0);
    } catch (error) {
      console.error(
        "Erreur lecture notifications :",
        error
      );
    }
  }

  async function deleteNotification(notification) {
    try {
      await api.delete(
        `/notifications/${notification.id}`
      );

      setNotifications((current) =>
        current.filter(
          (item) =>
            item.id !== notification.id
        )
      );

      if (!notification.is_read) {
        setUnreadCount((current) =>
          Math.max(0, current - 1)
        );
      }
    } catch (error) {
      console.error(
        "Erreur suppression notification :",
        error
      );
    }
  }

  function formatDate(date) {
    if (!date) {
      return "";
    }

    return new Date(date).toLocaleString(
      "fr-FR",
      {
        dateStyle: "short",
        timeStyle: "short",
      }
    );
  }

  return (
    <div
      ref={menuRef}
      className="relative"
    >
      <button
        type="button"
        onClick={() =>
          setOpen((current) => !current)
        }
        className="relative flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 transition hover:bg-slate-50"
      >
        <FiBell size={21} />

        {unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 flex min-h-5 min-w-5 items-center justify-center rounded-full bg-red-600 px-1 text-[11px] font-bold text-white">
            {unreadCount > 99
              ? "99+"
              : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 z-50 mt-3 w-[360px] max-w-[90vw] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">

          <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
            <div>
              <h3 className="font-bold text-slate-900">
                Notifications
              </h3>

              <p className="mt-1 text-xs text-slate-500">
                {unreadCount} non lue
                {unreadCount > 1 ? "s" : ""}
              </p>
            </div>

            {unreadCount > 0 && (
              <button
                type="button"
                onClick={markAllAsRead}
                className="inline-flex items-center gap-1 text-sm font-semibold text-blue-600 hover:text-blue-700"
              >
                <FiCheck />
                Tout lire
              </button>
            )}
          </div>

          <div className="max-h-[420px] overflow-y-auto">
            {loading ? (
              <p className="px-5 py-8 text-center text-sm text-slate-500">
                Chargement...
              </p>
            ) : notifications.length === 0 ? (
              <div className="px-5 py-10 text-center">
                <FiBell
                  size={34}
                  className="mx-auto text-slate-300"
                />

                <p className="mt-3 font-semibold text-slate-700">
                  Aucune notification
                </p>
              </div>
            ) : (
              notifications.map(
                (notification) => (
                  <div
                    key={notification.id}
                    className={
                      notification.is_read
                        ? "border-b border-slate-100 px-5 py-4 last:border-none"
                        : "border-b border-slate-100 bg-blue-50/60 px-5 py-4 last:border-none"
                    }
                  >
                    <div className="flex items-start justify-between gap-3">
                      <button
                        type="button"
                        onClick={() =>
                          markAsRead(
                            notification
                          )
                        }
                        className="flex-1 text-left"
                      >
                        <div className="flex items-center gap-2">
                          {!notification.is_read && (
                            <span className="h-2 w-2 rounded-full bg-blue-600" />
                          )}

                          <p className="font-semibold text-slate-900">
                            {
                              notification.title
                            }
                          </p>
                        </div>

                        <p className="mt-2 text-sm leading-6 text-slate-600">
                          {
                            notification.message
                          }
                        </p>

                        <p className="mt-2 text-xs text-slate-400">
                          {formatDate(
                            notification.created_at
                          )}
                        </p>
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          deleteNotification(
                            notification
                          )
                        }
                        title="Supprimer"
                        className="rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-600"
                      >
                        <FiTrash2 />
                      </button>
                    </div>
                  </div>
                )
              )
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default NotificationBell;