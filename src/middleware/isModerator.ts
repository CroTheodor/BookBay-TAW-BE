import * as user from "../models/user.model";

export const isModerator = function (req, res, next) {
  const auth = req.auth;
  if (!auth) {
    return res.sendStatus(401);
  }
  if (
    !(auth.roles.includes(user.E_ROLE.MODERATOR) ||
    !auth.roles.includes(user.E_ROLE.ADMINISTRATOR))
  ) {
    return res.sendStatus(401);
  }
  next();
};
