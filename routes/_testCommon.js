import db from "../db.js";
import User from "../models/user";
import Company from "../models/company";
import Job from "../models/job";
import { createToken } from "../helpers/tokens";

let j1Id, j2Id, j3Id, j4Id;


async function commonBeforeAll() {
  // noinspection SqlWithoutWhere
  await db.query("DELETE FROM users");
  // noinspection SqlWithoutWhere
  await db.query("DELETE FROM companies");

  await Company.create(
    {
      handle: "c1",
      name: "C1",
      numEmployees: 1,
      description: "Desc1",
      logoUrl: "http://c1.img",
    });
  await Company.create(
    {
      handle: "c2",
      name: "C2",
      numEmployees: 2,
      description: "Desc2",
      logoUrl: "http://c2.img",
    });
  await Company.create(
    {
      handle: "c3",
      name: "C3",
      numEmployees: 3,
      description: "Desc3",
      logoUrl: "http://c3.img",
    });

  const job1 = await Job.create(
    {
      title: "job1",
      salary: 50000,
      equity: 0,
      companyHandle: "c1"
    });
  j1Id = job1.id;

  const job2 = await Job.create(
    {
      title: "job2",
      salary: 60000,
      equity: 0.01,
      companyHandle: "c2"
    });
  j2Id = job2.id;

  const job3 = await Job.create(
    {
      title: "job3",
      salary: 70000,
      equity: 0.02,
      companyHandle: "c2"
    });
  j3Id = job3.id;

  const job4 = await Job.create(
    {
      title: "job4",
      salary: 80000,
      equity: 0,
      companyHandle: "c2"
    });
  j4Id = job4.id;

  await User.register({
    username: "u1",
    firstName: "U1F",
    lastName: "U1L",
    email: "user1@user.com",
    password: "password1",
    isAdmin: false,
  });
  await User.register({
    username: "u2",
    firstName: "U2F",
    lastName: "U2L",
    email: "user2@user.com",
    password: "password2",
    isAdmin: false,
  });
  await User.register({
    username: "u3",
    firstName: "U3F",
    lastName: "U3L",
    email: "user3@user.com",
    password: "password3",
    isAdmin: false,
  });
  await User.register({
    username: "u4",
    firstName: "U4F",
    lastName: "U4L",
    email: "user4@user.com",
    password: "password4",
    isAdmin: true,
  });
}

async function commonBeforeEach() {
  await db.query("BEGIN");
}

async function commonAfterEach() {
  await db.query("ROLLBACK");
}

async function commonAfterAll() {
  await db.end();
}


const u1Token = createToken({ username: "u1", isAdmin: false });
const u2Token = createToken({ username: "u2", isAdmin: false });
const testAdminToken = createToken({ username: "u4", isAdmin: true });


export {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
  u1Token,
  u2Token,
  testAdminToken as u4Token,
  j1Id,
  j2Id,
  j3Id,
  j4Id
};
