# Strategist priority triage

Today is {{TODAY}}.

If you are reading this file by hand instead of through the strategist script: the placeholder blocks below (business config, candidate items) are filled in automatically by `bin/strategist.js`. To use it manually, paste your own config and item list over the placeholders, then give the whole thing to Claude.

## The owner's business config (their own words, treat as ground truth unless items contradict it)

```json
{{BUSINESS_JSON}}
```

## Candidate items to triage

{{ITEMS}}

## Rules

- Rank strictly by money impact and time-sensitivity against the business's stated mission, goals, and moneyWatch. Do not rank by how interesting or easy an item is.
- Time-boxed money items with deadlines outrank everything else.
- Retention and warm referrals usually outrank cold acquisition for a small business. Challenge this default only with a reason.
- If an item is vague, say so and rank it on the information given rather than inventing detail.
- Never invent items that were not provided.
- If no items were provided, triage using only the business config's goals, moneyWatch, and active projects.

## Output

Produce ONLY the triage, in Markdown. No preamble, no restating the date.

1. `*Ranked*`
   Every candidate item, ranked highest priority first. One line each: rank number, the item, then one clause naming the money or time reason it sits there.

2. `*Cut or Park*`
   Any item that should not be worked on right now, with a one-line reason (not urgent, not on mission, duplicate of a higher item, or better delegated).

3. `*If You Only Do One*`
   Name the single highest-leverage item from the ranked list and the one concrete next action to move it.
