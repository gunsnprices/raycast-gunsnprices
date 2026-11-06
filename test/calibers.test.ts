import assert from "node:assert/strict";
import { test } from "node:test";
import { listCalibers, VERSION } from "gunsnprices";
import { CALIBER_DATA, DATA_VERSION } from "../src/lib/caliber-data.ts";
import { allCalibers, caliberMarkdown, compact, searchCalibers } from "../src/lib/calibers.ts";

const top = (q: string): string | undefined => searchCalibers(q)[0]?.name;

test("caliber data matches the installed parser", () => {
  assert.equal(DATA_VERSION, VERSION, "run npm run data after upgrading gunsnprices");
  assert.equal(Object.keys(CALIBER_DATA).length, 293);
  for (const c of listCalibers()) assert.ok(CALIBER_DATA[c.id], `missing ${c.id}`);
});

test("lists every caliber, most common first", () => {
  const all = allCalibers();
  assert.equal(all.length, 293);
  assert.deepEqual(
    all.slice(0, 3).map((c) => c.name),
    ["9×19mm Parabellum", "12 Gauge", ".22 LR"],
  );
  assert.equal(searchCalibers("").length, 293);
  assert.equal(searchCalibers("   ").length, 293);
});

test("finds calibers by any spelling", () => {
  assert.equal(top("9mm Luger"), "9×19mm Parabellum");
  assert.equal(top("9x19"), "9×19mm Parabellum");
  assert.equal(top("300 blk"), ".300 AAC Blackout");
  assert.equal(top("12 ga"), "12 Gauge");
  assert.equal(top("6.5 cm"), "6.5mm Creedmoor");
  assert.equal(top("5.56"), "5.56×45mm NATO");
  assert.equal(top("45 auto"), ".45 ACP");
  assert.equal(top("30-06"), ".30-06 Springfield");
  assert.equal(top("6.8 SPC"), "6.8mm Remington SPC");
});

test("matches partial input while typing", () => {
  assert.ok(searchCalibers("300 bl").some((c) => c.name === ".300 AAC Blackout"));
  assert.ok(searchCalibers("creed").slice(0, 3).some((c) => c.name === "6.5mm Creedmoor"));
  assert.equal(top("tokarev"), "7.62x25mm Tokarev");
  assert.deepEqual(searchCalibers("xyzzy"), []);
});

test("compacts spellings for comparison", () => {
  assert.equal(compact(".300 AAC Blackout"), "300aacblackout");
  assert.equal(compact("9×19mm"), "9x19mm");
});

test("detail markdown shows type and store spellings", () => {
  const nine = allCalibers()[0]!;
  const md = caliberMarkdown(nine);
  assert.match(md, /^# 9×19mm Parabellum/);
  assert.match(md, /\*\*Type:\*\* Handgun/);
  assert.match(md, /`9mm Luger \(9x19\)`/);
});
