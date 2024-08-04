import express from "express";
import { auth } from "../middleware/auth";
import { isModerator } from "../middleware/isModerator";
import { listingCreate, listingGetActive, listingGetAll, listingGetById, listingsBid, listingStatisticExpiredNoBids, listingUpdateById, userActiveListings, userExpiredListings, userWonListings, } from "../controllers/listings.controller";

const router = express.Router();
router.route('')
    .post(auth, listingCreate)
    .get(listingGetAll)

router.get('/active', listingGetActive);

router.get('/user/active', auth, userActiveListings);

router.get('/user/expired', auth, userExpiredListings);

router.get('/user/won', auth, userWonListings);

router.route('/:id')
    .put(auth, isModerator, listingUpdateById)
    .get(listingGetById)
    .delete(auth, isModerator);

router.route('/:id/bid')
    .post(auth, listingsBid);

router.route('/statistic/expired')
    .get(isModerator, listingStatisticExpiredNoBids);

module.exports = router;
