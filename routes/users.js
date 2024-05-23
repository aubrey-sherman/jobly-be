/** Routes for users. */

import jsonschema from "jsonschema";
import { Router } from "express";

import { ensureLoggedIn, ensureIsAdmin } from "../middleware/auth.js";
import { BadRequestError } from "../expressError.js";
import User from "../models/user.js";
import { createToken } from "../helpers/tokens.js";

import userNewSchema from "../schemas/userNew.json" with { type: "json" };
import userUpdateSchema from "../schemas/userUpdate.json" with { type: "json" };

const router = Router();

// TODO:
// Add middleware to handle checking user is self
// Users should GET, PATCH, DELETE their own pages
// Admin check shouldn't automatically throw a 401 for these cases
// Handle checking that curr user matches user endpoint
// Check if any additional testing is needed

/** POST / { user }  => { user, token }
 *
 * Adds a new user. This is not the registration endpoint --- instead, this is
 * only for admin users to add new users. The new user being added can be an
 * admin.
 *
 * This returns the newly created user and an authentication token for them:
 *  {user: { username, firstName, lastName, email, isAdmin }, token }
 *
 * Authorization required: login AND admin
 **/

router.post("/", ensureLoggedIn, ensureIsAdmin, async function (req, res, next) {
  const validator = jsonschema.validate(
    req.body,
    userNewSchema,
    { required: true },
  );
  if (!validator.valid) {
    const errs = validator.errors.map(e => e.stack);
    throw new BadRequestError(errs);
  }

  const user = await User.register(req.body);
  const token = createToken(user);
  return res.status(201).json({ user, token });
});


/** GET / => { users: [ {username, firstName, lastName, email }, ... ] }
 *
 * Returns list of all users.
 *
 * Authorization required: login AND admin
 **/

router.get("/", ensureLoggedIn, ensureIsAdmin, async function (req, res, next) {
  const users = await User.findAll();
  return res.json({ users });
});


/** GET /[username] => { user }
 *
 * Returns { username, firstName, lastName, email, isAdmin }
 *
 * Authorization required: login
 **/

// FIXME: Should allow a user to get themselves; admin can always access
router.get("/:username", ensureLoggedIn, async function (req, res, next) {
  const user = await User.get(req.params.username);
  return res.json({ user });
});


/** PATCH /[username] { user } => { user }
 *
 * Data can include:
 *   { firstName, lastName, password, email }
 *
 * Returns { username, firstName, lastName, email, isAdmin }
 *
 * Authorization required: login
 **/

// FIXME: Allows user to patch their own profile; admin can always access
router
  .patch("/:username", ensureLoggedIn, ensureIsAdmin, async function (req, res) {
    const validator = jsonschema.validate(
      req.body,
      userUpdateSchema,
      { required: true },
    );
    if (!validator.valid) {
      const errs = validator.errors.map(e => e.stack);
      throw new BadRequestError(errs);
    }

    const user = await User.update(req.params.username, req.body);
    return res.json({ user });
  });


/** DELETE /[username]  =>  { deleted: username }
 *
 * Authorization required: login
 **/
// FIXME: A user can delete their own profile
router
  .delete("/:username", ensureLoggedIn, ensureIsAdmin, async function (req, res) {
    await User.remove(req.params.username);
    return res.json({ deleted: req.params.username });
  });


export default router;
