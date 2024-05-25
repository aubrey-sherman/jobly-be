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

// TODO: be consistent and keep equity as a string for precision
// make the decision of how to handle operations at the point you need to

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

  // TODO: add test for checking it will 404 if you try to create a job for a
  // company that doesn't exist
});

/************************************** findAll */

describe("findAll", function () {
  test("works: no filter", async function () {
    const jobs = await Job.findAll();
    expect(jobs).toEqual(
      [
        {
          "companyHandle": "c1",
          "equity": "0",
          id: expect.any(Number),
          "salary": 50000,
          "title": "job1",
        },
        {
          "companyHandle": "c2",
          "equity": "0.01",
          id: expect.any(Number),
          "salary": 60000,
          "title": "job2",
        },
        {
          "companyHandle": "c2",
          "equity": "0.02",
          id: expect.any(Number),
          "salary": 70000,
          "title": "job3",
        },
        {
          "companyHandle": "c2",
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
    console.log("HERE IS THE ID -------------->", j1Id);
    let job = await Job.get(j1Id);
    expect(job).toEqual({
      "companyHandle": "c1",
      "equity": "0",
      id: j1Id,
      "salary": 50000,
      "title": "job1",
    });
  });

  test("not found if no such job", async function () {
    try {
      await Job.get(2424); // NOTE: does this need to be an int?
      throw new Error("fail test, you shouldn't get here");
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });
});


/************************************** update */

describe("update", function () {
  const updatedJob = {
    "equity": "0",
    "salary": 700000,
    "title": "job3",
  };

  test("works", async function () {
    let job = await Job.update(j3Id, updatedJob);
    expect(job).toEqual({
      id: j3Id,
      companyHandle: "c2",
      ...updatedJob
    });

    const result = await db.query(`
    SELECT id, title, salary, equity, company_handle AS "companyHandle"
    FROM jobs
    WHERE id = ${j3Id}
    `);
    expect(result.rows).toEqual([{
      id: j3Id,
      equity: "0",
      salary: 700000,
      title: "job3",
      companyHandle: "c2"
    }]);
  });

  test("works: null fields", async function () {
    const updatedJobNullSets = {
      "equity": null,
      "salary": null,
      "title": "job3"
    };

    let job = await Job.update(j3Id, updatedJobNullSets);
    expect(job).toEqual({
      id: j3Id,
      companyHandle: "c2",
      ...updatedJobNullSets
    });

    const result = await db.query(`
      SELECT id, title, salary, equity, company_handle AS "companyHandle"
      FROM jobs
      WHERE id = ${j3Id}`);
    expect(result.rows).toEqual([{
      id: j3Id,
      "equity": null,
      "salary": null,
      "title": "job3",
      companyHandle: "c2"
    }]);
  });

  test("not found if no such job", async function () {
    try {
      await Job.update(2424, updatedJob);
      throw new Error("fail test, you shouldn't get here");
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });

  test("bad request with no data", async function () {
    try {
      await Job.update(2424, {});
      throw new Error("fail test, you shouldn't get here");
    } catch (err) {
      expect(err instanceof BadRequestError).toBeTruthy();
    }
  });
});

/************************************** remove */

describe("remove", function () {
  test("works", async function () {
    await Job.remove(j1Id);
    const res = await db.query(
      `SELECT id FROM jobs WHERE id=${j1Id}`);
    expect(res.rows.length).toEqual(0);
  });

  test("not found if no such job", async function () {
    try {
      await Job.remove(2424);
      throw new Error("fail test, you shouldn't get here");
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });
});

// TODO: add tests that you can't update the company handle for a job

