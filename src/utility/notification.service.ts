import { Model } from "mongoose";
import { sendSystemMessage } from "../controllers/messages.controller";
import { getModel, newUser, UserDTO } from "../models/user.model";
import { ios } from "../server";
import { Logger } from "./logger";
import crypto from "crypto";
import { connectedSockets } from "../socket/socket-events";

class NotificationService {
  private userModel: Model<UserDTO>;
  private sysadminId: string | null = null;

  constructor(){
    this.userModel = getModel();
    this.initSystemAdmin();
  }

  public async sendNotification(userId: string, listingId: string, message: string){
    const sendResponse = await sendSystemMessage(userId, listingId, message);
    if(sendResponse){
      if(sendResponse.created){
        const socketId = connectedSockets.get(userId);
        if(socketId){
          ios.to(socketId).emit("new private room", `${this.sysadminId}-${listingId}-${userId}`);
        }
      }
      ios.to(`${this.sysadminId}-${listingId}-${userId}`).emit("send private message", sendResponse.message);
    }
  }

  public getSysadminId(){
    return this.sysadminId;
  }

  private async initSystemAdmin(){
    try {
      let sysAdmin = await this.userModel.findOne({email:"no-reply@sysadmin.master.it"});
      let newSysAdmin = null;
      if(!sysAdmin){
        newSysAdmin = newUser({
          name:"System",
          lastname:"(no-reply)",
          email:"no-reply@sysadmin.master.it",
          roles:["r_administrator"],
        })
        newSysAdmin.setPassword(crypto.randomBytes(16).toString('hex'));
        const savedUser = await newSysAdmin.save();
        if(savedUser){
          this.sysadminId = savedUser._id;
        }
      } else {
        this.sysadminId = sysAdmin._id.toString();
      }
    } catch(err){
      Logger.log(err);
    }

  }
}

export class NotificationServiceFactory{
  private static instance: NotificationService | null = null;

  public static getInstance(){
    if(!this.instance){
      this.instance = new NotificationService();
    }
    return this.instance;
  }
}

