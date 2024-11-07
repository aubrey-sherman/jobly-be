import { BadRequestError } from "../expressError.js";

/** Returns data to update in database in a parameterized format.
 *
 * Throws a Bad Request error if no data is entered.
 *
 * Takes two parameters:
 * - dataToUpdate, e.g. { firstName: 'Aliya', age: 32}
 * - jsToSql: { numEmployees: "num_employees"}
 *
 * Output: object with two properties--
 *  `setCols`: contains a string of the SQL columns to be set with the corresponding placeholders
 *  `values`: contains the corresponding values for the placeholders
 *
 * Example: { setCols: '"first_name"=$1', '"age"=$2', values: ["Aliya", 32]}
 */

function sqlForPartialUpdate(dataToUpdate, jsToSql) {
  const keys = Object.keys(dataToUpdate);
  if (keys.length === 0) throw new BadRequestError("No data");

  // {firstName: 'Aliya', age: 32} => ['"first_name"=$1', '"age"=$2']
  const cols = keys.map((colName, idx) =>
    `"${jsToSql[colName] || colName}"=$${idx + 1}`,
  );

  return {
    setCols: cols.join(", "),
    values: Object.values(dataToUpdate),
  };
}

export { sqlForPartialUpdate };
