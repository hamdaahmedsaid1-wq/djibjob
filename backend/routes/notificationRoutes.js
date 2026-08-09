const express = require("express");

const {
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
} = require("../controllers/notificationController");

const {
  protect,
} = require("../middlewares/authMiddleware");

const router = express.Router();

// =====================================================
// GET /api/notifications
// Notifications de l'utilisateur connecté
// =====================================================
router.get(
  "/",
  protect,
  getNotifications
);

// =====================================================
// PUT /api/notifications/read-all
// Marquer toutes les notifications comme lues
// IMPORTANT : doit rester avant /:id/read
// =====================================================
router.put(
  "/read-all",
  protect,
  markAllNotificationsAsRead
);

// =====================================================
// PUT /api/notifications/:id/read
// Marquer une notification précise comme lue
// =====================================================
router.put(
  "/:id/read",
  protect,
  markNotificationAsRead
);

// =====================================================
// DELETE /api/notifications/:id
// Supprimer une notification
// =====================================================
router.delete(
  "/:id",
  protect,
  deleteNotification
);

module.exports = router;
