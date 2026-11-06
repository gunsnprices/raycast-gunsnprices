import assert from "node:assert/strict";
import { test } from "node:test";
import { computeCost, costRows, costSummary } from "../src/lib/cost.ts";

test("price and a round count", () => {
  const r = computeCost("18.99", "50");
  assert.ok(!("error" in r));
  assert.equal(r.rounds, 50);
  assert.equal(r.roundsFrom, "number");
  assert.ok(Math.abs(r.perRound - 0.3798) < 1e-12);
  assert.deepEqual(
    costRows(r).map((x) => [x.label, x.value, x.exact]),
    [
      ["Cost per round", "$0.38", "0.3798"],
      ["Cents per round", "38.0¢", "37.98"],
      ["Per 100 rounds", "$37.98", "37.98"],
      ["Per 1,000 rounds", "$379.80", "379.8"],
    ],
  );
  assert.equal(costSummary(r), "$18.99 for 50 rounds");
});

test("round count read from a title", () => {
  const r = computeCost("$289.99", "Winchester 9mm 115gr FMJ 1000 Round Case");
  assert.ok(!("error" in r));
  assert.equal(r.rounds, 1000);
  assert.equal(r.roundsFrom, "title");
  assert.equal(costRows(r)[0]?.value, "$0.29");
  assert.equal(costSummary(r), "$289.99 for 1,000 rounds");
  const c = computeCost("449", "1,000");
  assert.ok(!("error" in c) && c.rounds === 1000);
});

test("explains bad input", () => {
  const badPrice = computeCost("abc", "50");
  assert.ok("error" in badPrice && /not a price/.test(badPrice.error));
  const noRounds = computeCost("18.99", "Federal 9mm FMJ");
  assert.ok("error" in noRounds && /No round count/.test(noRounds.error));
  assert.ok("error" in computeCost("18.99", "0"));
});
