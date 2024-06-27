import express from "express";
import { auth } from "../middleware/auth";
import { isModerator } from "../middleware/isModerator";
import { listingCreate,  } from "../controllers/listings.controller";

const router = express.Router();
router.route('')
    .post(auth,listingCreate)
    // .get(auth,listingGetAll)

module.exports = router;
