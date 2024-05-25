import bcrypt from "bcrypt";
import db from "../db.js";
import { BCRYPT_WORK_FACTOR } from "../config.js";

let j1Id, j2Id, j3Id, j4Id;

async function commonBeforeAll() {
  // noinspection SqlWithoutWhere
  await db.query("DELETE FROM companies");
  // noinspection SqlWithoutWhere
  await db.query("DELETE FROM users");

  await db.query(`
      INSERT INTO companies(handle, name, num_employees, description, logo_url)
      VALUES ('c1', 'C1', 1, 'Desc1', 'http://c1.img'),
             ('c2', 'C2', 2, 'Desc2', 'http://c2.img'),
             ('c3', 'C3', 3, 'Desc3', 'http://c3.img')`);


  await db.query(`
      INSERT INTO users(username,
                        password,
                        first_name,
                        last_name,
                        email)
      VALUES ('u1', $1, 'U1F', 'U1L', 'u1@email.com'),
             ('u2', $2, 'U2F', 'U2L', 'u2@email.com')
      RETURNING username`, [
    await bcrypt.hash("password1", BCRYPT_WORK_FACTOR),
    await bcrypt.hash("password2", BCRYPT_WORK_FACTOR),
  ]);

  const jobResults = await db.query(`
      INSERT INTO jobs(
        title,
        salary,
        equity,
        company_handle)
      VALUES ('job1', 50000, 0, 'c1'),
             ('job2', 60000, 0.01, 'c2'),
             ('job3', 70000, 0.02, 'c2'),
             ('job4', 80000, 0, 'c2')
      RETURNING id`);

  j1Id = jobResults.rows[0].id;
  j2Id = jobResults.rows[1].id;
  j3Id = jobResults.rows[2].id;
  j4Id = jobResults.rows[3].id;
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


export {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
  j1Id,
  j2Id,
  j3Id,
  j4Id
};