import assert from "node:assert/strict";
import { test } from "node:test";
import { fieldsTable, listingJson, listingMarkdown, parseListing, splitInlinePrice } from "../src/lib/title.ts";

const fields = (title: string, price?: string) =>
  Object.fromEntries(parseListing(title, price).fields.map((f) => [f.label, f.value]));

test("parses an ammo title with a separate price", () => {
  assert.deepEqual(fields("Federal 9mm 115gr 50rd", "18.99"), {
    Type: "Ammo",
    Caliber: "9×19mm Parabellum",
    "Rounds per box": "50",
    Price: "$18.99",
    "Cost per round": "$0.38",
  });
});

test("takes a price written in the title", () => {
  assert.deepEqual(splitInlinePrice("Federal 9mm 115gr 50rd $18.99"), { title: "Federal 9mm 115gr 50rd", price: 18.99 });
  assert.deepEqual(splitInlinePrice("Glock 19 - $549"), { title: "Glock 19", price: 549 });
  assert.equal(fields("PMC Bronze 5.56 NATO 55gr FMJ 1000rd $449")["Cost per round"], "$0.45");
  assert.equal(fields("Federal 9mm 50rd $18.99", "20")["Price"], "$20.00");
});

test("parses a firearm title", () => {
  assert.deepEqual(fields('Glock 19 Gen 5 MOS 9mm 4.02" 15rd Pistol'), {
    Type: "Firearm",
    Brand: "Glock",
    Model: "Glock 19 Gen 5 MOS",
    "Model family": "Glock 19",
    Generation: "5",
    Configuration: "MOS",
    Caliber: "9×19mm Parabellum",
    Capacity: "15 rounds",
    Barrel: '4.02"',
  });
});

test("renders markdown and JSON", () => {
  const p = parseListing("Federal 9mm 115gr 50rd", "18.99");
  assert.equal(
    fieldsTable(p),
    [
      "| Field | Value |",
      "|---|---|",
      "| Type | Ammo |",
      "| Caliber | 9×19mm Parabellum |",
      "| Rounds per box | 50 |",
      "| Price | $18.99 |",
      "| Cost per round | $0.38 |",
    ].join("\n"),
  );
  assert.match(listingMarkdown(p), /^## Federal 9mm 115gr 50rd\n\n\| Field \| Value \|/);
  const json = JSON.parse(listingJson(p));
  assert.equal(json.kind, "ammo");
  assert.deepEqual(json.calibers, ["9×19mm Parabellum"]);
  assert.equal(json.rounds, 50);
  assert.equal(json.costPerRound, 0.3798);
});

test("explains a missing round count", () => {
  assert.match(listingMarkdown(parseListing("Federal 9mm 115gr FMJ ammo")), /No round count found/);
});
