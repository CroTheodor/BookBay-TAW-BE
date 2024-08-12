import express from "express";
import { auth } from "../middleware/auth";
import { isModerator } from "../middleware/isModerator";
import {
  completePayment,
  listingCreate,
  listingGetActive,
  listingGetAll,
  listingGetById,
  listingsBid,
  listingsDeleteById,
  listingUpdateById,
  statistics,
  userActiveListings,
  userExpiredListings,
  userWonListings,
} from "../controllers/listings.controller";

const router = express.Router();
router.route("").post(auth, listingCreate).get(listingGetAll);

router.get("/active", listingGetActive);

router.get("/user/active", auth, userActiveListings);

router.get("/user/expired", auth, userExpiredListings);

router.get("/user/won", auth, userWonListings);

router
  .route("/:id")
  .put(auth, listingUpdateById)
  .get(listingGetById)
  .delete(auth, isModerator, listingsDeleteById);

router.route("/:id/bid").post(auth, listingsBid);

router.route("/:id/payment-complete").post(auth, completePayment);

router
  .route("/statistics/all")
  .get(auth, isModerator, statistics);

module.exports = router;
