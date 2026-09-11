import NotificationModel from "../model/notification.js";
import { emitToUser } from "./socket.js";

// Creates the DB row (so it's visible later even if the user is
// offline right now) and pushes it live if they're connected.
export const sendNotification = async ({ recipientID, type, message, articleID = null }) => {
  const notification = await NotificationModel.create({
    recipientID,
    type,
    message,
    articleID,
  });

  emitToUser(recipientID, "notification:new", notification);

  return notification;
};