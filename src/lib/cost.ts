import { roundsPerBox } from "gunsnprices";
import { formatCount, formatMoney, formatPerRound, parsePrice } from "./format.ts";

export interface CostResult {
  price: number;
  rounds: number;
  /** "number" when rounds were typed, "title" when read from a listing title */
  roundsFrom: "number" | "title";
  perRound: number;
}

export interface CostRow {
  label: string;
  value: string;
  /** unrounded number, for the "Copy Exact Value" action */
  exact: string;
}

/** Work out cost per round from a price and either a round count or an ammo listing title. */
export function computeCost(priceText: string, roundsText: string): CostResult | { error: string } {
  const price = parsePrice(priceText);
  if (price === null) return { error: `"${priceText.trim()}" is not a price. Type it like 18.99 or $18.99.` };
  const r = roundsText.trim();
  let rounds: number | null = null;
  let roundsFrom: CostResult["roundsFrom"] = "number";
  if (/^\d{1,3}(?:,\d{3})+$|^\d+$/.test(r)) {
    rounds = parseInt(r.replace(/,/g, ""), 10);
  } else {
    rounds = roundsPerBox(r);
    roundsFrom = "title";
  }
  if (!rounds || rounds <= 0) {
    return { error: `No round count in "${r}". Type a number like 50, or a title with 50rd, 20 rounds or box of 25.` };
  }
  return { price, rounds, roundsFrom, perRound: price / rounds };
}

function exact(n: number): string {
  return String(Math.round(n * 1e6) / 1e6);
}

/** The result in the units people compare ammo prices in. */
export function costRows(r: CostResult): CostRow[] {
  const cents = r.perRound * 100;
  return [
    { label: "Cost per round", value: formatPerRound(r.perRound), exact: exact(r.perRound) },
    { label: "Cents per round", value: `${cents.toFixed(1)}¢`, exact: exact(cents) },
    { label: "Per 100 rounds", value: formatMoney(r.perRound * 100), exact: exact(r.perRound * 100) },
    { label: "Per 1,000 rounds", value: formatMoney(r.perRound * 1000), exact: exact(r.perRound * 1000) },
  ];
}

/** "$18.99 for 50 rounds" */
export function costSummary(r: CostResult): string {
  return `${formatMoney(r.price)} for ${formatCount(r.rounds)} rounds`;
}
