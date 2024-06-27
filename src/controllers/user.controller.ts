import { Request, Response } from "express";
import * as user from '../models/user.model';
import { HttpResponse } from "../models/http-response.model";

export const getUserById = (req: Request,res: Response)=>{
    const id = req.params.id;
    user.getModel().findOne({_id:id, digest:0, salt:0 })
        .then(
            (user: user.UserDTO) =>{
                return res.status(200).json(new HttpResponse<user.UserDTO>(true, "User found", user));
            }
        )
        .catch(
            ()=>{
                return res.status(500).json(new HttpResponse(false, "DB errror", null));
            }
        )
}

export const getUsers = async (req: Request, res: Response)=>{
    const User = user.getModel();
    let page = req.query.page;
    if(!page){
        User.find({digest: 0, salt: 0}).then(
            (users: user.UserDTO[])=>{
                return res.status(200).json(new HttpResponse(true, "User list", {page: 0, content: users }));
            }
        )
        .catch(
            ()=>{
                return res.status(500).json(new HttpResponse(false, "DB error", null));
            }
        )
    }else{
        let pageNumber = parseInt(req.query.page as string);
        const limit = parseInt(req.query.limit as string);
        const startIndex = (pageNumber - 1) * limit;
        const userDocumentsCount = await User.countDocuments().exec();
        const pageCount = userDocumentsCount / limit;
        const result = {
            page: page,
            limit: limit,
            totalPages: pageCount
        }
        User.find({digest:0, salt:0}).limit(limit).skip(startIndex)
            .then(
                (users: user.UserDTO[]) =>{
                    return res.status(200).json(new HttpResponse(true, "User list", {...result, content: users}));
                }
            )
            .catch(
                ()=>{
                    return res.status(500).json(new HttpResponse(false, "DB error", null));
                }
            )
    }
}

export const updateUser = (req: Request, res: Response) => {
    const password = req.body.password;
    if(password)
        return res.status(400).json(new HttpResponse(false, "Unexpected field", null));
    const id = req.params.id;
    user.getModel().findById(id)
        .then(
            (foundUser: user.UserDTO)=>{
                const name = req.body.name;
                const lastname = req.body.name;
                const email = req.body.email;
                
                if(name){
                    foundUser.name = name;
                }

                if(lastname){
                    foundUser.lastname = lastname;
                }

                if(email){
                    foundUser.email = email;
                }

                foundUser.save().then(
                    ()=>{
                        return res.sendStatus(204);
                    }
                )
                .catch(
                    ()=>{
                        return res.sendStatus(500);
                    }
                )
            }
        )
        .catch(
            ()=>{
                return res.sendStatus(404);
            }
        )
}
