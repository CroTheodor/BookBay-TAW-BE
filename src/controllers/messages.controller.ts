import mongoose from "mongoose";
import * as messaging from "../models/messages.model";
import { Logger } from "../utility/logger";
import moment from "moment";
import { NotificationServiceFactory } from "../utility/notification.service";

const PublicChatroomModel = messaging.getPublicChatroomModel();
const PrivateChatroomModel = messaging.getPrivateChatroomModel();
const notificationService = NotificationServiceFactory.getInstance();

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
  const sysAdminId = notificationService.getSysadminId();
  const splitId = roomId.split("-");
  if(splitId.at(0) === sysAdminId || splitId.at(2) === sysAdminId){
    return null;
  }
  try {
    const chatroom: messaging.PrivateChatroomDTO =
      await PrivateChatroomModel.findOne({ chatroomId: roomId });
    let updatedChatroom = chatroom;
    let response = { created: false, chatroom: chatroom };
    if (!chatroom) {
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

export const sendSystemMessage = async (userId: string, listingId: string, message: string)=>{
  try {
    const chatroomId = `${notificationService.getSysadminId()}-${listingId}-${userId}`;
    const room: messaging.PrivateChatroomDTO = await PrivateChatroomModel.findOne({chatroomId:chatroomId});
    let newChatroom = room;
    let created = false;
    if(!room){
      created = true;
      newChatroom = messaging.newPrivateChatroom({
        chatroomId: chatroomId,
        user1: userId,
        user2: notificationService.getSysadminId(),
        listingId: listingId,
        messages: [],
        user1read: false,
        user2read: true,
      })
    }
    const messageToAdd = {
      content: message,
      userId:new mongoose.Types.ObjectId(notificationService.getSysadminId()),
      date: moment().toDate().toString(),

    }
    newChatroom.messages.push(messageToAdd);
    newChatroom.user1read = false;
    const saved = await newChatroom.save();
    return {
      message:saved.messages.at(saved.messages.length - 1),
      created: created,
    }
  } catch (err){
    Logger.log(err);
    return null;
  }
}

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
