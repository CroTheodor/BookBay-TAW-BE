import express from "express";
import { auth } from "../middleware/auth";
import { isModerator } from "../middleware/isModerator";
import { listingCreate, listingGetActive, listingGetAll, listingGetById, listingsBid, listingStatisticExpiredNoBids, listingUpdateById, } from "../controllers/listings.controller";

const router = express.Router();
router.route('')
    .post(auth, listingCreate)
    .get(listingGetAll)

router.get('/active', listingGetActive);

router.route('/:id')
    .put(auth, isModerator, listingUpdateById)
    .get(listingGetById)
    .delete(auth, isModerator);

router.route('/:id/bid')
    .post(auth, listingsBid);

router.route('/statistic/expired')
    .get(isModerator, listingStatisticExpiredNoBids);

module.exports = router;
