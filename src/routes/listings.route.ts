import express from "express";
import { auth } from "../middleware/auth";
import { isModerator } from "../middleware/isModerator";
import { listingCreate, listingGetAll, listingGetById, listingUpdateById,  } from "../controllers/listings.controller";

const router = express.Router();
router.route('')
    .post(auth, listingCreate)
    .get(listingGetAll)

router.route('/:id')
    .put(auth, isModerator, listingUpdateById)
    .get(listingGetById)
    .delete(auth, isModerator);

module.exports = router;
