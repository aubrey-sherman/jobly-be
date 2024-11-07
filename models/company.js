import db from "../db.js";
import { BadRequestError, NotFoundError } from "../expressError.js";
import { sqlForPartialUpdate } from "../helpers/sql.js";

/** Related functions for companies. */

class Company {
  /** Creates a company from data, inserts in database.
   *
   * Returns new company data as
   *    { handle, name, description, numEmployees, logoUrl }
   *
   * Throws BadRequestError if the company already exists in the database.
   * */
  static async create({ handle, name, description, numEmployees, logoUrl }) {
    const duplicateCheck = await db.query(`
        SELECT handle
        FROM companies
        WHERE handle = $1`, [handle]);

    if (duplicateCheck.rows[0])
      throw new BadRequestError(`Duplicate company: ${handle}`);

    const result = await db.query(`
                INSERT INTO companies (handle,
                                       name,
                                       description,
                                       num_employees,
                                       logo_url)
                VALUES ($1, $2, $3, $4, $5)
                RETURNING
                    handle,
                    name,
                    description,
                    num_employees AS "numEmployees",
                    logo_url AS "logoUrl"`, [
      handle,
      name,
      description,
      numEmployees,
      logoUrl,
    ],
    );
    const company = result.rows[0];

    return company;
  }

  /** Finds all companies.
   *
   * Returns list as [{ handle, name, description, numEmployees, logoUrl }, ...]
   * */

  static async findAll() {
    const companiesRes = await db.query(`
        SELECT handle,
               name,
               description,
               num_employees AS "numEmployees",
               logo_url      AS "logoUrl"
        FROM companies
        ORDER BY name`);
    return companiesRes.rows;
  }

  /** Given filter criteria as {
   *  minEmployees?: number,
   *  maxEmployees?: number,
   *  nameLike?: string
   * },
   *
   * returns list of matching company objects like
   *  [{ handle, name, description, numEmployees, logoUrl }, ...]
   */
  static async findFiltered(criteria) {

    const { conditions, values } = Company.parameterizeFilterQuery(criteria);

    const companiesRes = await db.query(`
        SELECT handle,
               name,
               description,
               num_employees AS "numEmployees",
               logo_url      AS "logoUrl"
        FROM companies
        WHERE ${conditions}
        ORDER BY name`,
      values
    );
    return companiesRes.rows;
  }


  /** Returns conditions and placeholder values for an SQL WHERE clause based on
   * provided filter criteria as {
   *                              minEmployees?: number,
   *                              maxEmployees?: number,
   *                              nameLike?: string
   *                             }
   *
   * Example:
   * Input: { minEmployees: 2, maxEmployees: 3 }
   * Output: {
   *          filterConditions: "num_employees >= $1 AND num_employees <= $2",
   *          conditionValues: [2, 3]
   *         }
   */
  static parameterizeFilterQuery(criteria) {
    const conditionsAndValues = {};
    const values = [];
    const conditions = [];

    if ("minEmployees" in criteria) {
      conditions.push(`num_employees >= $${values.length + 1}`);
      values.push(criteria.minEmployees);
    }

    if ("maxEmployees" in criteria) {
      conditions.push(`num_employees <= $${values.length + 1}`);
      values.push(criteria.maxEmployees);
    }

    if ("nameLike" in criteria) {
      conditions.push(`name ILIKE $${values.length + 1}`);
      values.push(`%${criteria.nameLike}%`);
    }

    conditionsAndValues.conds = conds.join(" AND ");
    conditionsAndValues.values = values;

    return conditionsAndValues;
  }

  /** Given a company handle, return data about company.
   *
   * Returns { handle, name, description, numEmployees, logoUrl, jobs }
   *   where jobs is [{ id, title, salary, equity, companyHandle }, ...]
   *
   * Throws NotFoundError if not found.
   **/

  static async get(handle) {
    const companyRes = await db.query(`
        SELECT handle,
               name,
               description,
               num_employees AS "numEmployees",
               logo_url      AS "logoUrl"
        FROM companies
        WHERE handle = $1`, [handle]);

    const company = companyRes.rows[0];

    if (!company) throw new NotFoundError(`No company: ${handle}`);

    return company;
  }

  /** Updates company data with `data`.
   *
   * This is a "partial update" --- it's fine if data doesn't contain all the
   * fields; this only changes provided ones.
   *
   * Data can include: {name, description, numEmployees, logoUrl}
   *
   * Returns {handle, name, description, numEmployees, logoUrl}
   *
   * Throws NotFoundError if not found.
   */

  static async update(handle, data) {
    const { setCols, values } = sqlForPartialUpdate(
      data,
      {
        numEmployees: "num_employees",
        logoUrl: "logo_url",
      });
    const handleVarIdx = "$" + (values.length + 1);

    const querySql = `
        UPDATE companies
        SET ${setCols}
        WHERE handle = ${handleVarIdx}
        RETURNING
            handle,
            name,
            description,
            num_employees AS "numEmployees",
            logo_url AS "logoUrl"`;
    const result = await db.query(querySql, [...values, handle]);
    const company = result.rows[0];

    if (!company) throw new NotFoundError(`No company: ${handle}`);

    return company;
  }

  /** Deletes given company from database and returns undefined.
   *
   * Throws NotFoundError if company not found.
   **/

  static async remove(handle) {
    const result = await db.query(`
        DELETE
        FROM companies
        WHERE handle = $1
        RETURNING handle`, [handle]);
    const company = result.rows[0];

    if (!company) throw new NotFoundError(`No company: ${handle}`);
  }
}


export default Company;