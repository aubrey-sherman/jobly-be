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
  // FIXME: can we pass in equity as a Number or does it need to be a String?


  test("works", async function () {
    const newJob = {
      title: 'Dream Lawyer',
      salary: 600000,
      equity: 0.015,
      companyHandle: "c1"
    };
    const job = await Job.create(newJob);
    console.log("THIS IS THE JOB ---------->", job);
    expect(job).toEqual({
      id: job.id,
      title: 'Dream Lawyer',
      salary: 600000,
      equity: "0.015",
      companyHandle: "c1"
    });

    // FIXME: may need to change SELECT columns
    // TODO: why did we need double quotes for companyHandle
    const result = await db.query(
      `SELECT id, title, salary, equity, company_handle AS "companyHandle"
       FROM jobs
       WHERE id = ${job.id}`);
    // console.log("THIS IS THE RESULT ---------->", result);
    expect(result.rows[0]).toEqual(
      {
        id: job.id,
        title: 'Dream Lawyer',
        salary: 600000,
        equity: "0.015",
        companyHandle: "c1"
      }
    );
  });
});

// findAll

describe("findAll", function () {
  test("works: no filter", async function () {
    const jobs = await Job.findAll();
    expect(jobs).toEqual(
      [{
        id: expect.any(Number),
        title: "",
        salary: 5,
        equity: 0,
        company_handle: ""
      }
      ]
    );
  });
})


  // filter

  // parameterize

  // get a job



  // update

  // remove
  ;
