export type Opportunity = {
  id: string; title: string; provider: string; url: string | null;
  amount: number | null; amountMin: number | null; amountMax: number | null;
  date: string | null; category: string; work: string; description: string; criteria: string;
  degreeLevels: string | null; majors: string | null; minGpa: number | null;
  states: string | null; citizenship: string | null; schools: string | null;
  enrollment: string | null; financialNeed: boolean | null;
};
export type ScholarshipMatch = { id: string; score: number; reason: string; status: "potential" | "unlikely" | "uncertain" };
export function awardLabel(item: Opportunity) {
  const usd = (value: number) => value.toLocaleString("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 0, maximumFractionDigits: 2 });
  if (item.amountMin !== null && item.amountMax !== null && item.amountMin !== item.amountMax) return usd(item.amountMin) + " – " + usd(item.amountMax);
  if (item.amountMax !== null) return item.amountMin === null ? "Up to " + usd(item.amountMax) : usd(item.amountMax);
  if (item.amountMin !== null) return "From " + usd(item.amountMin);
  return "Amount not listed";
}
