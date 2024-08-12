import express from "express";
import passport from "passport";
import passportHTTP from "passport-http";
import * as user from "../models/user.model";
import {
  handleChangePassword,
  handleLogin,
  handleRegister,
  handleRegisterMods,
} from "../controllers/auth.controller";
import { Logger } from "../utility/logger";
import { auth } from "../middleware/auth";
import { isModerator } from "../middleware/isModerator";

const router = express.Router();

passport.use(
  new passportHTTP.BasicStrategy(function (username, password, done: any) {
    Logger.log("New login attempt from " + username);
    user
      .getModel()
      .findOne({ email: username })
      .then((user: any) => {
        if (!user) {
          return done(null, false, {
            statusCode: 500,
            error: true,
            errormessage: "Invalid user",
          });
        }
        if (user.validatePassword(password)) {
          return done(null, user);
        }
        return done(null, false, {
          statusCode: 500,
          error: true,
          errormessage: "Invalid passwrod",
        });
      })
      .catch((err) => {
        Logger.error(err);
        return done({ statusCode: 500, eror: true, errormessage: err });
      });
  }),
);

router.get(
  "/login",
  passport.authenticate("basic", { session: false, failWithError: true }),
  handleLogin,
);
router.post("/register", handleRegister);
router.post("/register/moderator", auth, isModerator, handleRegisterMods);
router.put("/change-password", auth, handleChangePassword);

module.exports = router;
