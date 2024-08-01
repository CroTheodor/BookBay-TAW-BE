import moment from "moment";
import {
  retrieveMessagesForPrivateChatroom,
  retrieveMessagesForPublicChatroom,
  retrieveUserChatrooms,
  sendPrivateMessage,
  sendPublicMessage,
} from "../controllers/messages.controller";
import { PrivateMessageDTO, PublicMessageDTO } from "../models/messages.model";
import { ios } from "../server";

export const initIOS = () => {
  ios.on("connection", (socket) => {
    socket.on("retrieve private messages", async (roomId: string) => {
      const messages = await retrieveMessagesForPrivateChatroom(roomId);
      if (messages) {
        socket.emit("old private messages", messages, roomId);
      }
    });

    socket.on("retrieve public messages", async (roomId: string) => {
      const messages = await retrieveMessagesForPublicChatroom(roomId);
      if (messages) {
        socket.emit("old public messages", messages, roomId);
      }
    });

    socket.on("retrieve chatrooms", async (id) => {
      if (!id) {
        socket.emit("user chatrooms", null);
      } else {
        let chatrooms = await retrieveUserChatrooms(id);
        socket.emit("user chatrooms", chatrooms);
      }
    });

    socket.on("join room", async (roomId) => {
      socket.join(roomId);
    });

    socket.on(
      "send public message",
      async (roomId: string, message: PublicMessageDTO) => {
        const finalMessage = { ...message, date: moment().toString() };
        const isSent = await sendPublicMessage(roomId, finalMessage);
        if (isSent) {
          ios.to(roomId).emit("public message", message, roomId);
        } else {
          socket.emit("message failed", roomId);
        }
      },
    );

    socket.on(
      "send private message",
      async (roomId: string, message: PrivateMessageDTO) => {
        const finalMessage = { ...message, date: moment().toString() };
                console.log(message);
        const isSent = await sendPrivateMessage(roomId, finalMessage);
        if (isSent) {
          ios.to(roomId).emit("private message", message, roomId);
        } else {
          socket.emit("message failed", roomId);
        }
      },
    );

    socket.on("join room", async (roomId: string) => {
      socket.join(roomId);
    });
  });
};
