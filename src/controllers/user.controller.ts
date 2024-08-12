import mongoose, { Mongoose, SchemaType } from "mongoose";
import { Request, Response } from "express";
import * as user from "../models/user.model";
import * as listing from "../models/listing.model";
import { HttpResponse, PaginatedList } from "../models/http-response.model";
import { SUPPORTED_COUNTIES } from "../models/utility.models";
import { Logger } from "../utility/logger";

const UserModel = user.getModel();
const ListingModel = listing.getModel();

export const getUserById = (req: Request, res: Response) => {
  const id = req.params.id;
  UserModel.findById({ _id: id }, { digest: 0, salt: 0 })
    .then((user: user.UserDTO) => {
      if (user === null) return res.sendStatus(204);
      return res
        .status(200)
        .json(new HttpResponse<user.UserDTO>(true, "User found", user));
    })
    .catch(() => {
      return res.status(500).json(new HttpResponse(false, "DB errror", null));
    });
};

export const getUsers = async (req: Request, res: Response) => {
  let page = req.query.page;
  let filter = {};
  if (req.query.id) {
    filter = { _id: req.query.id };
  }
  if (req.query.email) {
    filter = { ...filter, email: req.query.email };
  }
  if (req.query.name) {
    filter = { ...filter, name: req.query.name };
  }
  if (req.query.lastname) {
    filter = { ...filter, lastname: req.query.lastname };
  }
  if (req.query.role) {
    filter = { ...filter, roles: req.query.role };
  }

  if (!page) {
    UserModel.find(filter, { digest: 0, salt: 0 })
      .then((users: user.UserDTO[]) => {
        return res
          .status(200)
          .json(
            new HttpResponse(true, "User list", { page: 0, content: users }),
          );
      })
      .catch(() => {
        return res.status(500).json(new HttpResponse(false, "DB error", null));
      });
  } else {
    let pageNumber = parseInt(req.query.page as string);
    const limit = parseInt(req.query.limit as string);
    const startIndex = pageNumber * limit;
    const userDocumentsCount = await UserModel.countDocuments().exec();
    const result = {
      page: page,
      limit: limit,
      totalItems: userDocumentsCount,
    };
    UserModel.find(filter, { digest: 0, salt: 0 })
      .limit(limit)
      .skip(startIndex)
      .then((users: user.UserDTO[]) => {
        return res
          .status(200)
          .json(
            new HttpResponse(true, "User list", { ...result, content: users }),
          );
      })
      .catch(() => {
        return res.status(500).json(new HttpResponse(false, "DB error", null));
      });
  }
};

export const updateUser = (req: any, res: Response) => {
  const password = req.body.password;
  const isAdministrator = req.auth.roles.includes(user.E_ROLE.ADMINISTRATOR);
  if (password)
    return res
      .status(400)
      .json(new HttpResponse(false, "Unexpected field", null));
  const id = req.params.id;
  UserModel.findById(id)
    .then((foundUser: user.UserDTO) => {
      const name = req.body.name;
      const lastname = req.body.lastname;
      const email = req.body.email;
      const shipmentInfo = req.body.shipmentInfo;
      if (
        (foundUser.roles.includes(user.E_ROLE.MODERATOR) && !isAdministrator) ||
        foundUser.roles.includes(user.E_ROLE.ADMINISTRATOR)
      ) {
        return res
          .status(401)
          .json(
            new HttpResponse(
              false,
              "You do not have permission to delete this user",
              null,
            ),
          );
      }

      if (name) {
        foundUser.name = name;
      }

      if (lastname) {
        foundUser.lastname = lastname;
      }

      if (email) {
        foundUser.email = email;
      }

      if (shipmentInfo) {
        foundUser.shipmentInfo = shipmentInfo;
      }

      foundUser
        .save()
        .then(() => {
          return res
            .status(200)
            .json(
              new HttpResponse(
                true,
                "Successfully updated user.",
                foundUser._id,
              ),
            );
        })
        .catch(() => {
          return res.sendStatus(500);
        });
    })
    .catch(() => {
      return res.sendStatus(404);
    });
};

export const deleteUser = async (req: any, res: Response) => {
  const id = req.params.id;
  const requesterRole = req.auth.roles;
  if (!id) {
    return res.status(500).json(new HttpResponse(false, "Invalid id", null));
  }

  const userToDelete = await UserModel.findById(id);
  if (!userToDelete) {
    return res
      .status(404)
      .json(new HttpResponse(false, "User not found", null));
  }

  if (
    (userToDelete.roles.includes(user.E_ROLE.MODERATOR) &&
      !requesterRole.includes(user.E_ROLE.ADMINISTRATOR)) ||
    userToDelete.roles.includes(user.E_ROLE.ADMINISTRATOR)
  ) {
    return res
      .status(401)
      .json(
        new HttpResponse(
          false,
          "You do not have permission to delete this user",
          null,
        ),
      );
  }

  UserModel.deleteOne({ _id: id })
    .then((result: any) => {
      ListingModel.deleteMany({ postingUser: userToDelete._id }).exec();
      updateListingsAfterUserDeletion(userToDelete._id.toString());
      return res
        .status(200)
        .json(new HttpResponse(true, "User successfuly deleted", result));
    })
    .catch((err) =>
      res
        .status(500)
        .json(
          new HttpResponse(false, "Unable to delete user (DB error)", null),
        ),
    );
};

export const supportedCounties = (req: Request, res: Response) => {
  return res
    .status(200)
    .json(
      new HttpResponse(true, "Retrieved available couties", SUPPORTED_COUNTIES),
    );
};

const updateListingsAfterUserDeletion = async (deletedUserId: string) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try{
    const listings = await ListingModel.find({$or:[{bidingUser : deletedUserId}, {"bids.biderId":deletedUserId}]});
    for(let listing of listings){
      listing.bids = listing.bids.filter((bid)=>bid.biderId.toString() !== deletedUserId);
      if(listing.bids.length === 0){
        listing.bids = null;
        listing.currentBid = null;
        listing.bidingUser = null;
      } else {
        const bid = listing.bids.at(listing.bids.length - 1);
        listing.currentBid = bid.amount;
        listing.bidingUser = bid.biderId;
      }
      await listing.save();
    }
    Logger.log("Successfully updated");
    session.commitTransaction();
  } catch(err){
    Logger.error(err);
    session.abortTransaction();
  } finally{
    session.endSession();
  }
}
