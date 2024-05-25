import db from "../db.js";
import { BadRequestError, NotFoundError } from "../expressError.js";
import { sqlForPartialUpdate } from "../helpers/sql.js";

/** Related functions for jobs */
class Job {

  // FIXME: check to make sure that the company for companyHandle
  // actually exists
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

  // TODO: make sure to include the AS "companyHandle"
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
                 company_handle AS "companyHandle"
          FROM jobs
          ORDER BY id`);
    return jobsRes.rows;
  }

  // TODO: grab the data about the company for the job
  /** Given a job id, return data about job.
 *
 *  Returns { id, title, salary, equity, company_handle }
 *
 *  Throws NotFoundError if not found.
 **/
  static async get(id) {
    const jobRes = await db.query(`
        SELECT id,
               title,
               salary,
               equity,
               company_handle AS "companyHandle"
        FROM jobs
        WHERE id = $1`, [id]);

    const job = jobRes.rows[0];

    if (!job) throw new NotFoundError(`No job: ${id}`);

    return job;
  }

  // TODO: findFiltered goes here

  // TODO: think about what you can patch, with respect to this job
  // can't update the companyHandle, so don't need to use sqlFor...
  // think about where it is important for validation errors to be
  // thrown
  /**  */
  static async update(id, data) {
    const { setCols, values } = sqlForPartialUpdate(
      data,
      {
        companyHandle: "company_handle"
      });
    const idValIdx = "$" + (values.length + 1);

    const querySql = `
        UPDATE jobs
        SET ${setCols}
        WHERE id = ${idValIdx}
        RETURNING
            id,
            title,
            salary,
            equity,
            company_handle AS "companyHandle"`;
    const result = await db.query(querySql, [...values, id]);
    const job = result.rows[0];

    if (!job) throw new NotFoundError(`No job: ${id}`);

    return job;
  }

  /**  */

  static async remove(id) {
    const result = await db.query(`
        DELETE
        FROM jobs
        WHERE id = $1
        RETURNING id`, [id]);
    const job = result.rows[0];

    if (!job) throw new NotFoundError(`No job: ${id}`);
  }
}

export default Job;