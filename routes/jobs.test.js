import {
  describe,
  test,
  expect,
  beforeAll,
  afterAll,
  beforeEach,
  afterEach,
} from "vitest";
import request from "supertest";

import app from "../app.js";
import {
  commonAfterAll,
  commonAfterEach,
  commonBeforeAll,
  commonBeforeEach,
  u1Token,
  u4Token as testAdminToken,
  j1Id,
  j2Id,
  j3Id,
  j4Id
} from "./_testCommon.js";


beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

/************************************** POST /jobs */

/************************************** GET /jobs */

describe("GET /jobs", function () {
  test("ok for anon", async function () {
    const resp = await request(app).get("/jobs");
    expect(resp.body).toEqual({
      jobs:
        [
          {
            "companyHandle": "c1",
            "equity": "0",
            "id": expect.any(Number),
            "salary": 50000,
            "title": "job1",
          },
          {
            "companyHandle": "c2",
            "equity": "0.01",
            "id": expect.any(Number),
            "salary": 60000,
            "title": "job2",
          },
          {
            "companyHandle": "c2",
            "equity": "0.02",
            "id": expect.any(Number),
            "salary": 70000,
            "title": "job3",
          },
          {
            "companyHandle": "c2",
            "equity": "0",
            "id": expect.any(Number),
            "salary": 80000,
            "title": "job4",
          }
        ]
    });
  });
});