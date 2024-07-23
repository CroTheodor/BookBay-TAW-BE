import * as messaging from "../models/messages.model";
import { Logger } from "../utility/logger";

const PublicChatroomModel = messaging.getPublicChatroomModel();
const PrivateChatroomModel = messaging.getPrivateChatroomModel();

export const retrieveMessagesForPublicChatroom = async (id: string) => {
  try {
    const chatroom: messaging.PublicChatroomDTO =
      await PublicChatroomModel.findOne({ chatroomId: id });
    return chatroom.messages;
  } catch (error) {
    Logger.log(error);
    return null;
  }
};

export const retrieveMessagesForPrivateChatroom = async (id: string) => {
  try {
    const chatroom: messaging.PrivateChatroomDTO =
      await PrivateChatroomModel.findOne({ chatroomId: id });
    return chatroom;
  } catch (error) {
    Logger.error(error);
    return null;
  }
};

export const retrieveUserChatrooms = async (userId) => {
  try {
    const chatrooms: messaging.PrivateChatroomDTO[] =
      await PrivateChatroomModel.find({
        $or: [{ user1: userId }, { user2: userId }],
      });
    return chatrooms.map((chatroom) => chatroom.chatroomId);
  } catch (err) {
    Logger.log(err);
    return null;
  }
};

export const sendPublicMessage = async (
  roomId: string,
  message: messaging.PublicMessageDTO,
) => {
  try {
    const chatroom: messaging.PublicChatroomDTO =
      await PublicChatroomModel.findOne({ chatroomId: roomId });
    let updatedChatroom = chatroom;
    if (!chatroom) {
      updatedChatroom = messaging.newPublicChatroom({
        chatroomId: roomId,
        messages: [],
      });
    }
    updatedChatroom.messages.push(message);
    try {
      const res = await updatedChatroom.save();
      Logger.log("Message sent to room " + roomId);
      return true;
    } catch (err) {
      Logger.error(err);
      return false;
    }
  } catch (err) {
    Logger.log(err);
    return false;
  }
};

export const sendPrivateMessage = async (
  roomId: string,
  message: messaging.PrivateMessageDTO,
) => {
  try {
    const chatroom: messaging.PrivateChatroomDTO =
      await PrivateChatroomModel.findOne({ chatroomId: roomId });
    let updatedChatroom = chatroom;
    if (!chatroom) {
      const splitId = roomId.split("-");
      const user1 = splitId[0];
      const user2 = splitId[1];
      updatedChatroom = messaging.newPrivateChatroom({
        chatroomId: roomId,
        user1: user1,
        user2: user2,
        messages: [],
      });
    }
    updatedChatroom.messages.push(message);
    try {
      const res = await updatedChatroom.save();
      Logger.log("Message sent to room " + roomId);
      return true;
    } catch (err) {
      Logger.error(err);
      return false;
    }
  } catch (err) {
    Logger.log(err);
    return false;
  }
};
