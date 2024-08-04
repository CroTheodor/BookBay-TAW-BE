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
    return chatroom.messages;
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
      })
        .populate({ path: "user1", select: "-salt -digest" })
        .populate({ path: "user2", select: "-salt -digest" })
        .populate("listingId");
    return chatrooms;
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
  sendingId: string,
) => {
  try {
    const chatroom: messaging.PrivateChatroomDTO =
      await PrivateChatroomModel.findOne({ chatroomId: roomId });
    let updatedChatroom = chatroom;
    let response = { created: false, chatroom: chatroom };
    if (!chatroom) {
      const splitId = roomId.split("-");
      const user1 = splitId[0];
      const listing = splitId[1];
      const user2 = splitId[2];
      updatedChatroom = messaging.newPrivateChatroom({
        chatroomId: roomId,
        user1: user1,
        user2: user2,
        listingId: listing,
        messages: [],
        user1read: user1 === sendingId,
        user2read: user2 === sendingId,
      });
      response.created = true;
    }
    updatedChatroom.messages.push(message);
    if (updatedChatroom.user1.toString() === sendingId) {
      updatedChatroom.user2read = false;
    } else {
      updatedChatroom.user1read = false;
    }
    try {
      const res = await updatedChatroom.save();
      let newChatroom = null;
      if (res) {
        newChatroom = await PrivateChatroomModel.findById(res._id)
          .populate({ path: "user1", select: "-salt -digest" })
          .populate({ path: "user2", select: "-salt -digest" })
          .populate("listingId");
      }
      response.chatroom = newChatroom;
      Logger.log("Message sent to room " + roomId);
      return response;
    } catch (err) {
      Logger.error(err);
      return null;
    }
  } catch (err) {
    Logger.log(err);
    return null;
  }
};

export const messagesViewed = async (roomId: string, userId: string) => {
  try {
    const room = await PrivateChatroomModel.findOne({chatroomId: roomId});
    room.user1.toString() === userId ? room.user1read = true : room.user2read = true;
    try {
      room.save();
    } catch (err) {
      Logger.error("Failed saving message view update");
      Logger.error(err);
    }
  } catch (err) {
    Logger.error(err);
  }

}
