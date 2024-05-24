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
  j1Id,
  j2Id,
  j3Id,
  j4Id
} from "./_testCommon.js";

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

/************************************** create */

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
    expect(job).toEqual({
      id: job.id,
      title: 'Dream Lawyer',
      salary: 600000,
      equity: "0.015",
      companyHandle: "c1"
    });

    // TODO: why did we need double quotes for companyHandle
    const result = await db.query(
      `SELECT id, title, salary, equity, company_handle AS "companyHandle"
       FROM jobs
       WHERE id = ${job.id}`);
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

/************************************** findAll */

describe("findAll", function () {
  test("works: no filter", async function () {
    const jobs = await Job.findAll();
    expect(jobs).toEqual(
      [
        {
          "company_handle": "c1",
          "equity": "0",
          id: expect.any(Number),
          "salary": 50000,
          "title": "job1",
        },
        {
          "company_handle": "c2",
          "equity": "0.01",
          id: expect.any(Number),
          "salary": 60000,
          "title": "job2",
        },
        {
          "company_handle": "c2",
          "equity": "0.02",
          id: expect.any(Number),
          "salary": 70000,
          "title": "job3",
        },
        {
          "company_handle": "c2",
          "equity": "0",
          id: expect.any(Number),
          "salary": 80000,
          "title": "job4",
        }
      ]
    );
  });
});


// filter

// parameterize

/************************************** get */
describe("get", function () {
  test("works", async function () {
    let job = await Job.get(j1Id);
    expect(job).toEqual({
      "companyHandle": "c1",
      "equity": "0",
      id: j1Id,
      "salary": 50000,
      "title": "job1",
    });
  });

  // test("not found if no such company", async function () {
  //   try {
  //     await Company.get("nope");
  //     throw new Error("fail test, you shouldn't get here");
  //   } catch (err) {
  //     expect(err instanceof NotFoundError).toBeTruthy();
  //   }
  // });
});


// update

// remove
;
