import { TokenDataDTO } from "../models/TokenDataDTO"
import { UserDTO, getSchema, getModel } from "../models/user.model"
import * as user from '../models/user.model'
import jsonwebtoken from 'jsonwebtoken'
import { HttpResponse } from "../models/http-response.model"

export const handleLogin = (req, res) => {
    const tokenData: TokenDataDTO = {
        name: req.user.name,
        lastname: req.user.lastname,
        email: req.user.email,
        id: req.user.id,
        role: req.user.role
    }

    let tokenSigned = jsonwebtoken.sign(tokenData,process.env.ACCESS_TOKEN_SECRET, {expiresIn:"1h"});
    user.getModel().findOne({'email':req.user.email}, (err,user: UserDTO)=>{
        if(user){
            user.save();
        }
    });
    res.status(200).json({token:tokenSigned});

}

export const handleRegister=(req,res)=>{
    let u = user.newUser( req.body );
    if(!req.body.password){
        return res.status(500).json(new HttpResponse(false,"Password field missing", null));
    }
    u.setPassword(req.body.password);
    u.save().then((data)=>{
        return res.status(200).json(new HttpResponse(true, "User successfully registered", {id: data._id}));
    }).catch((reason)=>{
        if( reason.code === 11000)
            return res.sendStatus(409)
        return res.status(500).son(new HttpResponse(false, "DB error", null))
    })
}
