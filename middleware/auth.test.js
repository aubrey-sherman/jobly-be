import { describe, test, expect } from "vitest";
import jwt from "jsonwebtoken";

import { UnauthorizedError } from "../expressError.js";
import {
  authenticateJWT,
  ensureLoggedIn,
  ensureIsAdmin,
  ensureMatchingUserorAdmin
} from "./auth.js";
import { SECRET_KEY } from "../config.js";

const testJwt = jwt.sign({ username: "test", isAdmin: false }, SECRET_KEY);
const badJwt = jwt.sign({ username: "test", isAdmin: false }, "wrong");

function next(err) {
  if (err) throw new Error("Got error from middleware");
}

describe("authenticateJWT", function () {
  test("works: via header", function () {
    const req = { headers: { authorization: `Bearer ${testJwt}` } };
    const res = { locals: {} };
    authenticateJWT(req, res, next);
    expect(res.locals).toEqual({
      user: {
        iat: expect.any(Number),
        username: "test",
        isAdmin: false,
      },
    });
  });

  test("works: no header", function () {
    const req = {};
    const res = { locals: {} };
    authenticateJWT(req, res, next);
    expect(res.locals).toEqual({});
  });

  test("works: invalid token", function () {
    const req = { headers: { authorization: `Bearer ${badJwt}` } };
    const res = { locals: {} };
    authenticateJWT(req, res, next);
    expect(res.locals).toEqual({});
  });
});


describe("ensureLoggedIn", function () {
  test("works", function () {
    const req = {};
    const res = { locals: { user: { username: "test" } } };
    ensureLoggedIn(req, res, next);
  });

  test("unauth if no login", function () {
    const req = {};
    const res = { locals: {} };
    expect(() => ensureLoggedIn(req, res, next))
      .toThrow(UnauthorizedError);
  });

  test("unauth if no valid login", function () {
    const req = {};
    const res = { locals: { user: {} } };
    expect(() => ensureLoggedIn(req, res, next))
      .toThrow(UnauthorizedError);
  });
});

describe("ensureIsAdmin", function () {
  test("works", function () {
    const req = {};
    const res = { locals: { user: { username: "user", isAdmin: true } } };
    ensureIsAdmin(req, res, next);
  });

  test("unauth if no login", function () {
    const req = {};
    const res = { locals: {} };
    expect(() => ensureIsAdmin(req, res, next))
      .toThrow(UnauthorizedError);
  });

  test("unauth if not admin", function () {
    const req = {};
    const res = { locals: { user: { isAdmin: false } } };
    expect(() => ensureIsAdmin(req, res, next))
      .toThrow(UnauthorizedError);
  });

  test("unauth if not admin", function () {
    const req = {};
    const res = { locals: { user: { isAdmin: "true" } } };
    expect(() => ensureIsAdmin(req, res, next))
      .toThrow(UnauthorizedError);
  });
});

describe("ensureMatchingUserorAdmin", function () {
  test("works for admin", function () {
    const req = { params: { username: "testUser" } };
    const res = { locals: { user: { isAdmin: true } } };
    ensureMatchingUserorAdmin(req, res, next);
  });

  test("works for matching user", function () {
    const req = { params: { username: "testUser" } };
    const res = { locals: { user: { username: "testUser" } } };
    ensureMatchingUserorAdmin(req, res, next);
  });

  test("unauth if no login", function () {
    const req = { params: { username: "wrongUser" } };
    const res = { locals: {} };
    expect(() => ensureMatchingUserorAdmin(req, res, next))
      .toThrow(UnauthorizedError);
  });

  test("unauth if not auth user", function () {
    const req = { params: { username: "wrongUser" } };
    const res = {
      locals: { user: { username: "correctUser", isAdmin: false } }
    };

    expect(() => ensureMatchingUserorAdmin(req, res, next))
      .toThrow(UnauthorizedError);
  });

  test("error for no username in req.params", function () {
    const req = { params: {} };
    const res = {
      locals: { user: { username: "correctUser", isAdmin: false } }
    };

    expect(() => ensureMatchingUserorAdmin(req, res, next))
      .toThrow(Error);
  });
});