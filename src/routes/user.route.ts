import express from "express";
import { auth } from "../middleware/auth";
import { deleteUser, getUserById, getUsers, listingUserListings as userListings, updateUser, supportedCounties } from "../controllers/user.controller";
import { isModerator } from "../middleware/isModerator";

const router = express.Router();

router.route('/:id')
    .get(auth, getUserById)
    .put(auth, updateUser)
    .delete(auth, isModerator, deleteUser);

router.get('/', auth, isModerator, getUsers);
router.get('/:id/listings', auth, userListings);
router.get('/info/counties', supportedCounties);

module.exports = router;
