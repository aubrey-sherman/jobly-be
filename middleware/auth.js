/** Convenience middleware to handle common auth cases in routes. */

import jwt from "jsonwebtoken";
import { SECRET_KEY } from "../config.js";
import { UnauthorizedError } from "../expressError.js";


/** Middleware: Authenticate user.
 *
 * If a token was provided, verify it, and, if valid, store the token payload
 * on res.locals (this will include the username and isAdmin field.)
 *
 * It's not an error if no token was provided or if the token is not valid.
 */

function authenticateJWT(req, res, next) {
  const authHeader = req.headers?.authorization;
  if (authHeader) {
    const token = authHeader.replace(/^[Bb]earer /, "").trim();

    try {
      res.locals.user = jwt.verify(token, SECRET_KEY);
    } catch (err) {
      /* ignore invalid tokens (but don't store user!) */
    }
  }
  return next();

}

/** Middleware to use when they must be logged in.
 *
 * If not, raises Unauthorized.
 */

function ensureLoggedIn(req, res, next) {
  if (res.locals.user?.username) return next();
  throw new UnauthorizedError();
}

/** Middleware to use when they must be an admin.
 *
 * If not, raises Unauthorized.
 */

function ensureIsAdmin(req, res, next) {
  if (res.locals.user?.isAdmin === true) {
    return next();
  }

  throw new UnauthorizedError();
}

// FIXME: mention the error thrown in the docstring
// be clear with names, ensureMatchingUserorAdmin
/** Middleware to use to check for admin or matching user.
 *
 * If not, raises Unauthorized.
 */

function ensureAuthUser(req, res, next) {
  if (!("username" in req.params)) {
    throw new Error("wrongly registered");
  }

  if (res.locals.user?.isAdmin === true) {
    return next();
  }

  if (res.locals.user && res.locals.user.username === req.params.username) {
    return next();
  }

  throw new UnauthorizedError();
}


export {
  authenticateJWT,
  ensureLoggedIn,
  ensureIsAdmin,
  ensureAuthUser
};
