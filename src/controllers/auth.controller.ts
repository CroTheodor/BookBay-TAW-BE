import { TokenDataDTO } from "../models/token-data.model"
import { UserDTO } from "../models/user.model"
import * as user from '../models/user.model'
import jsonwebtoken from 'jsonwebtoken'
import { HttpResponse } from "../models/http-response.model"
import { Logger } from "../utility/logger"

export const handleLogin = (req, res) => {

    const tokenData: TokenDataDTO = {
        name: req.user.name,
        lastname: req.user.lastname,
        email: req.user.email,
        id: req.user.id,
        roles: req.user.roles
    }

    let tokenSigned = jsonwebtoken.sign(tokenData, process.env.ACCESS_TOKEN_SECRET, { expiresIn: "1h" });
    res.status(200).json({ token: tokenSigned });
    Logger.success("Login attemp successful");
}

export const handleRegister = (req, res) => {
    let u = user.newUser(req.body);
    if (!req.body.password) {
        return res.status(500).json(new HttpResponse(false, "Password field missing", null));
    }
    if (!req.body.lastname) {
        return res.status(500).json(new HttpResponse(false, "Lastname field is missing", null));
    }
    u.setPassword(req.body.password);
    u.save().then((data) => {
        return res.status(200).json(new HttpResponse(true, "User successfully registered", { id: data._id }));
    }).catch((reason) => {
        if (reason.code === 11000)
            return res.sendStatus(409)
        return res.status(500).json(new HttpResponse(false, "DB error", null))
    })
}

export const handleChangePassword = (req, res) => {
    const email = req.auth.email;
    user.getModel().findOne({ email: email })
        .then(
            (user: UserDTO) => {
                user.setPassword(req.body.password);
                user.passwordChanged = true;
                user.save()
                    .then(() => {
                        Logger.success("Password successfully changed");
                        return res.status(200).json(new HttpResponse(true, "Password successfull changed", null));
                    })
                    .catch(() => {
                        Logger.error("Failed to save the changes");
                        return res.status(500).json(new HttpResponse(false, "DB error", null));
                    })
            }
        ).catch(
            () => {
                Logger.error("Unable to retrieve user from DB");
                return res.status(404).json(new HttpResponse(false, "User not found", null));
            }
        )
}
