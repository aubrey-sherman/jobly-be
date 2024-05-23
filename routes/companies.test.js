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
  u4Token,
} from "./_testCommon.js";


beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

/************************************** POST /companies */

describe("POST /companies", function () {
  const newCompany = {
    handle: "new",
    name: "New",
    logoUrl: "http://new.img",
    description: "DescNew",
    numEmployees: 10,
  };

  const newCompany2 = {
    handle: "new2",
    name: "New2",
    logoUrl: "http://new2.img",
    description: "DescNew2",
    numEmployees: 102,
  };

  test("ok for admin users", async function () {
    const resp = await request(app)
      .post("/companies")
      .send(newCompany)
      .set("authorization", `Bearer ${u4Token}`);
    expect(resp.statusCode).toEqual(201);
    expect(resp.body).toEqual({
      company: newCompany,
    });
  });

  test("unauthorized for non admin user", async function () {
    const resp = await request(app)
      .post("/companies")
      .send(newCompany2)
      .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(401);
    expect(resp.body).toEqual({
      "error": {
        "message": "Unauthorized",
        "status": 401,
      },
    });
  });

  // COOL: good example of readable test description
  test("bad request with missing data", async function () {
    const resp = await request(app)
      .post("/companies")
      .send({
        handle: "new",
        numEmployees: 10,
      })
      .set("authorization", `Bearer ${u4Token}`);
    expect(resp.statusCode).toEqual(400);
  });

  test("bad request with invalid data", async function () {
    const resp = await request(app)
      .post("/companies")
      .send({
        ...newCompany,
        logoUrl: "not-a-url",
      })
      .set("authorization", `Bearer ${u4Token}`);
    expect(resp.statusCode).toEqual(400);
  });
});

/************************************** GET /companies */

describe("GET /companies", function () {
  test("ok for anon", async function () {
    const resp = await request(app).get("/companies");
    expect(resp.body).toEqual({
      companies:
        [
          {
            handle: "c1",
            name: "C1",
            description: "Desc1",
            numEmployees: 1,
            logoUrl: "http://c1.img",
          },
          {
            handle: "c2",
            name: "C2",
            description: "Desc2",
            numEmployees: 2,
            logoUrl: "http://c2.img",
          },
          {
            handle: "c3",
            name: "C3",
            description: "Desc3",
            numEmployees: 3,
            logoUrl: "http://c3.img",
          },
        ],
    });
  });

  test("filter by nameLike (case insensitive)", async function () {
    const resp = await request(app)
      .get("/companies")
      .query({ nameLike: "2" });

    expect(resp.body).toEqual({
      companies:
        [
          {
            handle: "c2",
            name: "C2",
            description: "Desc2",
            numEmployees: 2,
            logoUrl: "http://c2.img",
          },
        ],
    });
  });

  test("filter by minEmployees", async function () {
    const resp = await request(app)
      .get("/companies")
      .query({ minEmployees: 3 });

    expect(resp.body).toEqual({
      companies:
        [
          {
            handle: "c3",
            name: "C3",
            description: "Desc3",
            numEmployees: 3,
            logoUrl: "http://c3.img",
          },
        ],
    });
  });

  test("filter by maxEmployees", async function () {
    const resp = await request(app)
      .get("/companies")
      .query({ maxEmployees: 1 });

    expect(resp.body).toEqual({
      companies:
        [
          {
            handle: "c1",
            name: "C1",
            description: "Desc1",
            numEmployees: 1,
            logoUrl: "http://c1.img",
          },
        ],
    });
  });

  test("all valid query params", async function () {
    const resp = await request(app)
      .get("/companies")
      .query({ nameLike: "C", minEmployees: 3, maxEmployees: 4 });

    expect(resp.body).toEqual({
      companies:
        [
          {
            handle: "c3",
            name: "C3",
            description: "Desc3",
            numEmployees: 3,
            logoUrl: "http://c3.img",
          },
        ],
    });
  });

  test("too many query parameters", async function () {
    const resp = await request(app)
      .get("/companies")
      .query({ nameLike: "2", minEmployees: 2, maxEmployees: 4, bad: "nono" });

    expect(resp.body).toEqual({
      "error": {
        "message": [
          "instance is not allowed to have the additional property \"bad\"",
        ],
        "status": 400,
      }
    });
  });

  test("error for minEmployees > maxEmployees", async function () {
    const resp = await request(app)
      .get("/companies")
      .query(
        {
          minEmployees: 4,
          maxEmployees: 2
        });

    expect(resp.body).toEqual(
      {
        "error": {
          "message": "Min can't be greater than max.",
          "status": 400
        }
      }
    );
  });

  test("handles invalid data types for inputs", async function () {
    const resp = await request(app)
      .get("/companies")
      .query(
        {
          minEmployees: "four"
        });

    expect(resp.body).toEqual({
      "error": {
        "message": ["instance.minEmployees is not of a type(s) integer"],
        "status": 400
      }
    });
  });
});

/************************************** GET /companies/:handle */

describe("GET /companies/:handle", function () {
  test("works for anon", async function () {
    const resp = await request(app).get(`/companies/c1`);
    expect(resp.body).toEqual({
      company: {
        handle: "c1",
        name: "C1",
        description: "Desc1",
        numEmployees: 1,
        logoUrl: "http://c1.img",
      },
    });
  });

  test("works for anon: company w/o jobs", async function () {
    const resp = await request(app).get(`/companies/c2`);
    expect(resp.body).toEqual({
      company: {
        handle: "c2",
        name: "C2",
        description: "Desc2",
        numEmployees: 2,
        logoUrl: "http://c2.img",
      },
    });
  });

  test("not found for no such company", async function () {
    const resp = await request(app).get(`/companies/nope`);
    expect(resp.statusCode).toEqual(404);
  });
});

/************************************** PATCH /companies/:handle */

describe("PATCH /companies/:handle", function () {
  test("works for admin users", async function () {
    const resp = await request(app)
      .patch(`/companies/c1`)
      .send({
        name: "C1-new",
      })
      .set("authorization", `Bearer ${u4Token}`);
    expect(resp.body).toEqual({
      company: {
        handle: "c1",
        name: "C1-new",
        description: "Desc1",
        numEmployees: 1,
        logoUrl: "http://c1.img",
      },
    });
  });

  test("unauthorized for admin users", async function () {
    const resp = await request(app)
      .patch(`/companies/c1`)
      .send({
        name: "C1-new-won't-work",
      })
      .set("authorization", `Bearer ${u1Token}`);
    expect(resp.body).toEqual({
      "error": {
        "message": "Unauthorized",
        "status": 401,
      },
    });
  });

  test("unauth for anon", async function () {
    const resp = await request(app)
      .patch(`/companies/c1`)
      .send({
        name: "C1-new",
      });
    expect(resp.statusCode).toEqual(401);
  });

  test("404 for no such company", async function () {
    const resp = await request(app)
      .patch(`/companies/nope`)
      .send({
        name: "new nope",
      })
      .set("authorization", `Bearer ${u4Token}`);
    expect(resp.statusCode).toEqual(404);
  });

  test("bad request on handle change attempt", async function () {
    const resp = await request(app)
      .patch(`/companies/c1`)
      .send({
        handle: "c1-new",
      })
      .set("authorization", `Bearer ${u4Token}`);
    expect(resp.statusCode).toEqual(400);
  });

  test("bad request on invalid data", async function () {
    const resp = await request(app)
      .patch(`/companies/c1`)
      .send({
        logoUrl: "not-a-url",
      })
      .set("authorization", `Bearer ${u4Token}`);
    expect(resp.statusCode).toEqual(400);
  });
});

/************************************** DELETE /companies/:handle */

describe("DELETE /companies/:handle", function () {
  test("works for admin users", async function () {
    const resp = await request(app)
      .delete(`/companies/c1`)
      .set("authorization", `Bearer ${u4Token}`);
    expect(resp.body).toEqual({ deleted: "c1" });
  });

  test("unauthorized for non admin users", async function () {
    const resp = await request(app)
      .delete(`/companies/c1`)
      .set("authorization", `Bearer ${u1Token}`);
    expect(resp.body).toEqual({
      "error": {
        "message": "Unauthorized",
        "status": 401,
      },
    });
  });

  test("unauth for anon", async function () {
    const resp = await request(app)
      .delete(`/companies/c1`);
    expect(resp.statusCode).toEqual(401);
  });

  test("not found for no such company", async function () {
    const resp = await request(app)
      .delete(`/companies/nope`)
      .set("authorization", `Bearer ${u4Token}`);
    expect(resp.statusCode).toEqual(404);
  });
});
