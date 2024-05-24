import {
  describe,
  test,
  expect,
  beforeAll,
  afterAll,
  beforeEach,
  afterEach,
} from "vitest";

import db from "../db.js";
import { BadRequestError, NotFoundError } from "../expressError.js";
import Job from "./job.js";
import {
  commonAfterAll,
  commonAfterEach,
  commonBeforeAll,
  commonBeforeEach,
} from "./_testCommon.js";

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

// TODO: create test

describe("create", function () {
  // FIXME: confirm string or num?
  const newJob = {
    title: 'Dream Lawyer',
    salary: 600000,
    equity: 0.015,
    company_handle: "Dream Law Firm"
  };

  test("works", async function () {
    const job = await Job.create(newJob);
    expect(job).toEqual(newJob);

    // FIXME: may need to change SELECT columns
    const result = await db.query(
      `SELECT id, title, salary, equity, company_handle
       FROM jobs
       WHERE id = ${job.id}`);
    expect(result.rows).toEqual([
      {
        id: job.id,
        title: 'Dream Lawyer',
        salary: 600000,
        equity: 0.015,
        company_handle: "Dream Law Firm"
      }
    ]);
  });
});

// findAll


// filter

// parameterize

// get A job

// update

// remove
;
