import NotificationModel from "../model/notification.js";

// GET MY NOTIFICATIONS
export const getMyNotifications = async (req, res) => {
  try {
    const data = await NotificationModel.findAll({
      where: { recipientID: req.user.id },
      order: [["createdAt", "DESC"]],
    });

    res.status(200).json({ message: "Notifications fetched successfully", data });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Error fetching notifications" });
  }
};

// MARK ONE AS READ
export const markAsRead = async (req, res) => {
  const { id } = req.params;

  try {
    const notification = await NotificationModel.findByPk(id);

    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }

    if (notification.recipientID !== req.user.id) {
      return res.status(403).json({ message: "This isn't your notification" });
    }

    await notification.update({ isRead: true });

    res.status(200).json({ message: "Marked as read" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Error updating notification" });
  }
};

// MARK ALL AS READ
export const markAllAsRead = async (req, res) => {
  try {
    await NotificationModel.update(
      { isRead: true },
      { where: { recipientID: req.user.id, isRead: false } }
    );

    res.status(200).json({ message: "All notifications marked as read" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Error updating notifications" });
  }
};