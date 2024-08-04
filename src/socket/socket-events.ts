import moment from "moment";
import {
  messagesViewed,
  retrieveMessagesForPrivateChatroom,
  retrieveMessagesForPublicChatroom,
  retrieveUserChatrooms,
  sendPrivateMessage,
  sendPublicMessage,
} from "../controllers/messages.controller";
import { PrivateMessageDTO, PublicMessageDTO } from "../models/messages.model";
import { ios } from "../server";
import { verify } from "jsonwebtoken";
import { Logger } from "../utility/logger";
import { UserDTO } from "../models/user.model";

const connectedSockets: Map<string, string> = new Map<string, string>();

const socketAuth = (socket, next) => {
  const token = socket.handshake.auth.token;
  verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
    if (decoded) {
      console.log(decoded);
      socket.userId = decoded._id;
    }
    next();
  });
};

export const initIOS = () => {
  ios.use(socketAuth);
  ios.on("connection", (socket) => {
    const id = socket.userId;
    if (id) {
      connectedSockets.set(id, socket.id);
    }

    socket.on("reconnect", () => {
      console.log(socket.id);
    });

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

    socket.on("retrieve chatrooms", async () => {
      console.log("Retrieving chatrooms");
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
        if (!id) {
          socket.emit("authentication error");
          return;
        }
        const finalMessage = { ...message, date: moment().toString() };
        const isSent = await sendPrivateMessage(roomId, finalMessage, id);
        if (isSent) {
          if (isSent.created) {
            const user1socket = connectedSockets.get(
              (isSent.chatroom.user1 as unknown as UserDTO)._id.toString(),
            );
            const user2socket = connectedSockets.get(
              (isSent.chatroom.user2 as unknown as UserDTO)._id.toString(),
            );
            if (user1socket) {
              ios.to(user1socket).emit("new private room", isSent.chatroom);
            }
            if (user2socket) {
              ios.to(user2socket).emit("new private room", isSent.chatroom);
            }
          }
          ios.to(roomId).emit("private message", finalMessage, roomId);
        } else {
          socket.emit("message failed", roomId);
        }
      },
    );

    socket.on("messages viewed", async (roomId: string) => {
      if (!id) {
        socket.emit("authentication error");
      }
      messagesViewed(roomId, id);
    });

    socket.on("disconnect", () => {
      console.log("disconnect");
      if (id) {
        connectedSockets.delete(id);
      }
    });
    ios.engine.on("connection_error", (err) => {
      console.log(err.req); // the request object
      console.log(err.code); // the error code, for example 1
      console.log(err.message); // the error message, for example "Session ID unknown"
      console.log(err.context); // some additional error context
    });
  });
};
