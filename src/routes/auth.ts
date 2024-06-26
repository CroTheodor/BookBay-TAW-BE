import express from "express";
import passport from "passport";
import passportHTTP from "passport-http"
import * as user from "../models/user.model"
import { handleLogin, handleRegister } from "../controllers/auth.controller";

const router = express.Router();

passport.use(new passportHTTP.BasicStrategy(
    function(username, password, done: any){
        console.log("New login attempt from " + username);
        user.getModel().findOne({email: username}, (err: any, user : any)=>{
            if(err){
                console.log(err);
                return done( {statusCode:500, eror: true, errormessage:err} );
            }

            if(!user){
                return done(null, false, {statusCode: 500, error: true, errormessage:"Invalid user"});
            }

            if(user.validatePassword(password)){
                return done(null, user);
            }

            return done(null,false,{statusCode: 500, error: true, errormessage:"Invalid passwrod"});
        })
    }
));

router.get('/login', passport.authenticate('basic',{session: false, failWithError:true}), handleLogin);
router.post('/register', handleRegister);

module.exports = router;

