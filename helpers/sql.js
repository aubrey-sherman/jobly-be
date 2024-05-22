import { BadRequestError } from "../expressError.js";

/** Given data to update in the database, returns data in a parameterized format
 * for the SET clause in an SQL query
 * Throws a Bad Request error if no data was entered.
 *
 * Input:
 * - dataToUpdate: object, data to be converted to a parameterized SQL query
 * that will have placeholders for variables eg. {firstName: 'Aliya', age: 32}
 * - jsToSql: object, key is JS variable name, value is corresponding database
 * column eg. {numEmployees: "num_employees"}
 *
 * Output:
 * Returns an object with the properties `setCols` that contains a string of the
 * SQL columns to be set with the corresponding placeholders and `values` that
 * contains the corresponding values for the placeholders
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

/** Returns conditions for an SQL WHERE clause based on `criteria`
 * Input:
 * - criteria: object that can have one or more of the properties minEmployees,
 * maxEmployees, and nameLike eg. { minEmployees: 2 }
 * Output:
 * Returns a string of conditions for an SQL WHERE clause with values from input
 * eg. "num_employees >= minEmployees & num_employees <= maxEmployees"
*/
function sqlForFiltering(criteria) {
  const filterConds = [];

  if ("minEmployees" in criteria) {
    filterConds.push(`num_employees >= ${criteria.minEmployees}`);
  }

  if ("maxEmployees" in criteria) {
    filterConds.push(`num_employees <= ${criteria.maxEmployees}`);
  }

  if ("nameLike" in criteria) {
    filterConds.push(`name ILIKE '%${criteria.nameLike}%'`);
  }

  return filterConds.join(" & ");
}

/*
input is an object with filter conditions
if minEmployees in filterConditions
push into array a string with num_employees >= filterConditions.minEmployees
if maxEmployees in filterConditions
create string with num_employees <= filterConditions.maxEmployees
if nameLike in filterConditions
create string with name ILIKE '%nameLike%'

return array joined by " & "
*/

export { sqlForPartialUpdate, sqlForFiltering };
