import mongoose, { Document, model, Model, Schema, SchemaTypes } from "mongoose";

export interface PublicMessageDTO {
  _id: Schema.Types.ObjectId;
  userId: Schema.Types.ObjectId;
  userName: string;
  userLastname: string;
  date: string;
  content: string;
}

export interface PrivateMessageDTO {
  _id?: Schema.Types.ObjectId;
  date: string;
  content: string;
  userId: mongoose.Types.ObjectId;
}

export interface PublicChatroomDTO extends Document {
  _id: Schema.Types.ObjectId;
  chatroomId: string;
  messages: PublicMessageDTO[];
}

export interface PrivateChatroomDTO extends Document {
  _id?: Schema.Types.ObjectId;
  chatroomId: string;
  user1: Schema.Types.ObjectId;
  user2: Schema.Types.ObjectId;
  listingId: Schema.Types.ObjectId;
  messages: PrivateMessageDTO[];
  user1read: boolean;
  user2read: boolean;
}

const privateMessage = new Schema<PrivateMessageDTO>({
  date: {
    type: SchemaTypes.String,
    required: true,
  },
  content: {
    type: SchemaTypes.String,
    required: true,
  },
  userId: {
    type: SchemaTypes.ObjectId,
    required: true,
  },
});

const publicMessage = new Schema<PublicMessageDTO>({
  date: {
    type: SchemaTypes.String,
    required: true,
  },
  content: {
    type: SchemaTypes.String,
    required: true,
  },
  userId: {
    type: SchemaTypes.ObjectId,
    required: true,
    ref: "User",
  },
  userName: {
    type: SchemaTypes.String,
    required: true,
  },
  userLastname: {
    type: SchemaTypes.String,
    required: true,
  },
});

const publicChatroom = new Schema<PublicChatroomDTO>({
  chatroomId: {
    type: SchemaTypes.String,
    required: true,
  },
  messages: {
    type: [publicMessage],
    required: true,
  },
});

const privateChatroom = new Schema<PrivateChatroomDTO>({
  chatroomId: {
    type: SchemaTypes.String,
    required: true,
  },
  messages: {
    type: [privateMessage],
    required: true,
  },
  user1: {
    type: SchemaTypes.ObjectId,
    required: true,
    ref: "User",
  },
  user2: {
    type: SchemaTypes.ObjectId,
    required: true,
    ref: "User",
  },
  listingId:{
    type: SchemaTypes.ObjectId,
    required: true,
    ref: "Listing"
  },
  user1read: {
    type: SchemaTypes.Boolean,
    required: true,
  },
  user2read: {
    type: SchemaTypes.Boolean,
    required: true,
  },
});

export function getPrivateChatroomSchema() {
  return privateChatroom;
}

export function getPublicChatroomSchema() {
  return publicChatroom;
}

let privateChatroomModel: any;
export function getPrivateChatroomModel(): Model<PrivateChatroomDTO> {
  if (!privateChatroomModel) {
    privateChatroomModel = model("PrivateChatroom", getPrivateChatroomSchema());
  }
  return privateChatroomModel;
}

export function newPrivateChatroom(data: any): PrivateChatroomDTO {
  let _privateChatroomModel = getPrivateChatroomModel();
  let privateChatroom = new _privateChatroomModel(data);
  return privateChatroom;
}

let publicChatroomModel: any;
export function getPublicChatroomModel(): Model<PublicChatroomDTO> {
  if (!publicChatroomModel) {
    publicChatroomModel = model("PublicChatroom", getPublicChatroomSchema());
  }
  return publicChatroomModel;
}

export function newPublicChatroom(data: any): PublicChatroomDTO {
  let _publicChatroomModel = getPublicChatroomModel();
  let publicChatroom = new _publicChatroomModel(data);
  return publicChatroom;
}
