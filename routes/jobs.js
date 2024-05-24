/** Routes for jobs. */

import jsonschema from "jsonschema";
import { Router } from "express";

import { BadRequestError } from "../expressError.js";
import { ensureLoggedIn, ensureIsAdmin } from "../middleware/auth.js";
import Job from "../models/job.js";

const router = new Router();

/*
Create jobs in the _testCommon.js

General model - write test then method for all (fail-to-pass pattern)
model tests
Job model (update should not change the id or the company_handle)

JSON schema

General routes - write test then method for all (fail-to-pass pattern)
routes tests
Job routes

add method on Company class for showing all jobs
check if we need to change the companies/:handle route
add filter method for jobs (lowest priority)
*/

// TODO: is fine to convert the String to Number going from SQL numeric to JS
// what are the number types for JSON schema? Do we make the numeric a number in
// JSON schema?

/**  */
router.get("/", async function (req, res) {
  const jobs = await Job.findAll();
  return res.json({ jobs });
});

export default router;