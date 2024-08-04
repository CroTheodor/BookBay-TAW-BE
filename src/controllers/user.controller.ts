import { Request, Response } from "express";
import * as user from '../models/user.model';
import * as listing from '../models/listing.model';
import { HttpResponse, PaginatedList } from "../models/http-response.model";
import moment from "moment";
import { SUPPORTED_COUNTIES } from "../models/utility.models";

const UserModel = user.getModel();
const ListingModel = listing.getModel();

export const getUserById = (req: Request, res: Response) => {
    const id = req.params.id;
    UserModel.findById({ _id: id }, { digest: 0, salt: 0 })
        .then(
            (user: user.UserDTO) => {
                if (user === null)
                    return res.sendStatus(204);
                return res.status(200).json(new HttpResponse<user.UserDTO>(true, "User found", user));
            }
        )
        .catch(
            () => {
                return res.status(500).json(new HttpResponse(false, "DB errror", null));
            }
        )
}

export const getUsers = async (req: Request, res: Response) => {
    let page = req.query.page;

    if (!page) {
        UserModel.find({}, { digest: 0, salt: 0 }).then(
            (users: user.UserDTO[]) => {
                return res.status(200).json(new HttpResponse(true, "User list", { page: 0, content: users }));
            }
        )
            .catch(
                () => {
                    return res.status(500).json(new HttpResponse(false, "DB error", null));
                }
            )
    } else {
        let pageNumber = parseInt(req.query.page as string);
        const limit = parseInt(req.query.limit as string);
        const startIndex = pageNumber   * limit;
        const userDocumentsCount = await UserModel.countDocuments().exec();
        const result = {
            page: page,
            limit: limit,
            totalItems:userDocumentsCount 
        }
        UserModel.find({}, { digest: 0, salt: 0 }).limit(limit).skip(startIndex)
            .then(
                (users: user.UserDTO[]) => {
                    return res.status(200).json(new HttpResponse(true, "User list", { ...result, content: users }));
                }
            )
            .catch(
                () => {
                    return res.status(500).json(new HttpResponse(false, "DB error", null));
                }
            )
    }
}

export const updateUser = (req: Request, res: Response) => {
    const password = req.body.password;
    if (password)
        return res.status(400).json(new HttpResponse(false, "Unexpected field", null));
    const id = req.params.id;
    UserModel.findById(id)
        .then(
            (foundUser: user.UserDTO) => {
                const name = req.body.name;
                const lastname = req.body.lastname;
                const email = req.body.email;
                const shipmentInfo = req.body.shipmentInfo;

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
                console.log(shipmentInfo);

                foundUser.save().then(
                    () => {
                        return res.sendStatus(204);
                    })
                    .catch(
                        () => {
                            return res.sendStatus(500);
                        })
            })
        .catch(
            () => {
                return res.sendStatus(404);
            })
}

export const deleteUser = (req: Request, res: Response) => {
    const id = req.params.id;
    if (!id) {
        return res.status(500).json(new HttpResponse(false, "Invalid id", null));
    }
    UserModel.deleteOne({ _id: id })
        .then(
            (result: any) => res.status(200).json(new HttpResponse(true, "User successfuly deleted", result))
        )
        .catch(
            err => res.status(500).json(new HttpResponse(false, "Unable to delete user (DB error)", null))
        )
}

export const supportedCounties = (req: Request, res: Response) => {
    return res.status(200).json(new HttpResponse(true, "Retrieved available couties", SUPPORTED_COUNTIES));
}

