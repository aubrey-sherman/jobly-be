import { describe, test, expect } from "vitest";

import { sqlForPartialUpdate, sqlForFiltering } from "./sql.js";

describe("test sqlForPartialUpdate", function () {
  test("valid input", function () {
    const result = sqlForPartialUpdate({
      firstName: 'Aliya', age: 32
    },
      {
        firstName: "first_name",
        age: "age"
      });
    expect(result).toEqual(
      {
        "setCols": '"first_name"=$1, "age"=$2',
        "values": ["Aliya", 32]
      });
  });

  test("invalid input", function () {
    expect(function () {
      sqlForPartialUpdate({}, {});
    }).toThrowError("No data");
  });
});

describe("test sqlForFiltering", function () {
  test("returns a string with multiple valid SQL conditions", function () {
    const result = sqlForFiltering({
      minEmployees: 2,
      maxEmployees: 3,
      nameLike: "c"
    });

    expect(result).toEqual(
      "num_employees >= 2 AND num_employees <= 3 AND name ILIKE '%c%'");
  });
});