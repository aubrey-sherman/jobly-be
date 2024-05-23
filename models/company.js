import db from "../db.js";
import { BadRequestError, NotFoundError } from "../expressError.js";
import { sqlForPartialUpdate } from "../helpers/sql.js";

/** Related functions for companies. */

class Company {
  /** Create a company (from data), update db, return new company data.
   *
   * data should be { handle, name, description, numEmployees, logoUrl }
   *
   * Returns { handle, name, description, numEmployees, logoUrl }
   *
   * Throws BadRequestError if company already in database.
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

  /** Find all companies.
   *
   * Returns [{ handle, name, description, numEmployees, logoUrl }, ...]
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

  /** Find all companies matching given filter criteria.
   * Input: object of filter criteria, e.g. {minEmployees: 2, nameLike: "c"}
   * Returns array of objects of company data based on filter conditions, e.g.
   * [{ handle, name, description, numEmployees, logoUrl }, ...]
   */
  static async findFiltered(criteria) {
    const condsAndValues = Company.parameterizeFilterQuery(criteria);
    const conds = condsAndValues.conds;
    const values = condsAndValues.values;

    const companiesRes = await db.query(`
        SELECT handle,
               name,
               description,
               num_employees AS "numEmployees",
               logo_url      AS "logoUrl"
        FROM companies
        WHERE ${conds}
        ORDER BY name`,
      [...values]
    );
    return companiesRes.rows;
  }

  /** Returns conditions and placeholder values for an SQL WHERE clause based on
   * `criteria`
 * Input:
 * - criteria: object that can have one or more of the properties minEmployees,
 * maxEmployees, and nameLike eg. { minEmployees: 2, maxEmployees: 3 }
 * Output:
 * Returns an object with a property filterConds that is a string of conditions
 * for an SQL WHERE clause with values from input and a property condValues that
 * is the corresponding values for the conditions
 * eg. {
 * filterConds: "num_employees >= $1 AND num_employees <= $2",
 * condValues: [2, 3]
 * }
*/

  /** Returns conditions and placeholder values for an SQL WHERE clause based on
   * provided filter criteria
   * eg. { minEmployees: 2, maxEmployees: 3 } => {
   * filterConds: "num_employees >= $1 AND num_employees <= $2",
   * condValues: [2, 3]
   * }
   */
  static parameterizeFilterQuery(criteria) {
    const condsAndValues = {};
    const values = [];
    const conds = [];
    let valuesCount = 1;

    if ("minEmployees" in criteria) {
      conds.push(`num_employees >= $${valuesCount}`);
      values.push(criteria.minEmployees);
      valuesCount++;
    }

    if ("maxEmployees" in criteria) {
      conds.push(`num_employees <= $${valuesCount}`);
      values.push(criteria.maxEmployees);
      valuesCount++;
    }

    if ("nameLike" in criteria) {
      conds.push(`name ILIKE $${valuesCount}`);
      values.push(`%${criteria.nameLike}%`);
      valuesCount++;
    }

    condsAndValues.conds = conds.join(" AND ");
    condsAndValues.values = values;

    return condsAndValues;
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

  /** Update company data with `data`.
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

  /** Delete given company from database; returns undefined.
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