const { pool } = require("../config/database");

// =====================================================
// GET /api/notifications
// Récupérer les notifications de l'utilisateur connecté
// =====================================================
async function getNotifications(req, res) {
  try {
    const [notifications] = await pool.execute(
      `
      SELECT
        id,
        title,
        message,
        is_read,
        created_at
      FROM notifications
      WHERE user_id = ?
      ORDER BY created_at DESC
      `,
      [req.user.id]
    );

    const unreadCount = notifications.filter(
      (notification) => !notification.is_read
    ).length;

    return res.status(200).json({
      success: true,
      count: notifications.length,
      unreadCount,
      notifications,
    });
  } catch (error) {
    console.error(
      "Erreur récupération notifications :",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Impossible de récupérer les notifications.",
    });
  }
}

// =====================================================
// PUT /api/notifications/:id/read
// Marquer une notification comme lue
// =====================================================
async function markNotificationAsRead(req, res) {
  const notificationId = Number(req.params.id);

  if (
    !Number.isInteger(notificationId) ||
    notificationId <= 0
  ) {
    return res.status(400).json({
      success: false,
      message: "Identifiant de notification invalide.",
    });
  }

  try {
    const [result] = await pool.execute(
      `
      UPDATE notifications
      SET is_read = 1
      WHERE id = ?
        AND user_id = ?
      `,
      [
        notificationId,
        req.user.id,
      ]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message:
          "Notification introuvable.",
      });
    }

    return res.status(200).json({
      success: true,
      message:
        "Notification marquée comme lue.",
    });
  } catch (error) {
    console.error(
      "Erreur modification notification :",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Impossible de modifier la notification.",
    });
  }
}

// =====================================================
// PUT /api/notifications/read-all
// Marquer toutes les notifications comme lues
// =====================================================
async function markAllNotificationsAsRead(req, res) {
  try {
    await pool.execute(
      `
      UPDATE notifications
      SET is_read = 1
      WHERE user_id = ?
      `,
      [req.user.id]
    );

    return res.status(200).json({
      success: true,
      message:
        "Toutes les notifications ont été marquées comme lues.",
    });
  } catch (error) {
    console.error(
      "Erreur notifications read-all :",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Impossible de modifier les notifications.",
    });
  }
}

// =====================================================
// DELETE /api/notifications/:id
// Supprimer une notification
// =====================================================
async function deleteNotification(req, res) {
  const notificationId = Number(req.params.id);

  if (
    !Number.isInteger(notificationId) ||
    notificationId <= 0
  ) {
    return res.status(400).json({
      success: false,
      message:
        "Identifiant de notification invalide.",
    });
  }

  try {
    const [result] = await pool.execute(
      `
      DELETE FROM notifications
      WHERE id = ?
        AND user_id = ?
      `,
      [
        notificationId,
        req.user.id,
      ]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message:
          "Notification introuvable.",
      });
    }

    return res.status(200).json({
      success: true,
      message:
        "Notification supprimée avec succès.",
    });
  } catch (error) {
    console.error(
      "Erreur suppression notification :",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Impossible de supprimer la notification.",
    });
  }
}

module.exports = {
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
};