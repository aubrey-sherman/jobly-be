import db from "../db.js";
import { BadRequestError, NotFoundError } from "../expressError.js";

/** Related functions for jobs */
class Job {

  /** */
  static async create({ title, salary, equity, companyHandle }) {
    const result = await db.query(`
                INSERT INTO jobs (title,
                                  salary,
                                  equity,
                                  company_handle)
                VALUES ($1, $2, $3, $4)
                RETURNING
                    id,
                    title,
                    salary,
                    equity,
                    company_handle AS "companyHandle"`, [
      title,
      salary,
      equity,
      companyHandle,
    ]
    );
    const job = result.rows[0];

    return job;
  }

  /** Find all jobs.
 *
 * Returns [{ id, title, salary, equity, company_handle }, ...]
 * */

  static async findAll() {
    const jobsRes = await db.query(`
          SELECT id,
                 title,
                 salary,
                 equity,
                 company_handle
          FROM jobs
          ORDER BY equity`);
    return jobsRes.rows;
  }
}

export default Job;