import assert from "node:assert/strict";
import { test } from "node:test";
import { cell, formatCount, formatMoney, formatPerRound, parsePrice } from "../src/lib/format.ts";

test("parses prices people type", () => {
  assert.equal(parsePrice("18.99"), 18.99);
  assert.equal(parsePrice("$18.99"), 18.99);
  assert.equal(parsePrice(" $ 1,299.00 "), 1299);
  assert.equal(parsePrice("449 USD"), 449);
  assert.equal(parsePrice(".99"), 0.99);
  assert.equal(parsePrice(""), null);
  assert.equal(parsePrice(undefined), null);
  assert.equal(parsePrice("0"), null);
  assert.equal(parsePrice("abc"), null);
  assert.equal(parsePrice("18.99.1"), null);
});

test("formats money, cost per round and counts", () => {
  assert.equal(formatMoney(1234.5), "$1,234.50");
  assert.equal(formatPerRound(0.3798), "$0.38");
  assert.equal(formatPerRound(0.066), "$0.066");
  assert.equal(formatCount(1000), "1,000");
  assert.equal(cell("a | b"), "a \\| b");
});
