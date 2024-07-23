import {
  retrieveMessagesForPrivateChatroom,
  retrieveMessagesForPublicChatroom,
  retrieveUserChatrooms,
} from "../controllers/messages.controller";
import { ios } from "../server";

export const initIOS = () => {
  ios.on("connection", (socket) => {
    const id = socket.handshake.query.id;

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
      let chatrooms = await retrieveUserChatrooms(id);
      socket.emit("user chatrooms", chatrooms);
    });
  });
};
