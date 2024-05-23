import { describe, test, expect } from "vitest";

import { sqlForPartialUpdate } from "./sql.js";

describe("test sqlForPartialUpdate", function () {
  test("valid input", function () {
    const result = sqlForPartialUpdate({
      firstName: 'Aliya', age: 32
    },
      {
        firstName: "first_name"
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