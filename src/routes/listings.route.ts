import express from "express";
import { auth } from "../middleware/auth";
import { isModerator } from "../middleware/isModerator";
import { listingCreate, listingGetActive, listingGetAll, listingGetById, listingsBid, listingUpdateById, listingUserListings, } from "../controllers/listings.controller";

const router = express.Router();
router.route('')
    .post(auth, listingCreate)
    .get(listingGetAll)

router.route('/:id')
    .put(auth, isModerator, listingUpdateById)
    .get(listingGetById)
    .delete(auth, isModerator);

router.route('/:id/bid')
    .post(auth, listingsBid);

router.get('/active', listingGetActive);

router.get('/user/:id', listingUserListings);

module.exports = router;
