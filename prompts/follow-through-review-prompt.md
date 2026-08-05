# Strategist follow-through review

Today is {{TODAY}}.

If you are reading this file by hand instead of through the strategist script: the placeholder block below (recent briefs) is filled in automatically by `bin/strategist.js`. To use it manually, paste your own recent briefs over the placeholder, then give the whole thing to Claude.

This is a standalone audit of whether recent Top 3 priorities actually moved. It does not generate a new brief. It exists so a carried priority cannot quietly roll forward forever without ever being named.

## Recent briefs (newest first)

{{RECENT_BRIEFS}}

## Rules

- Judge only from evidence in the briefs above. Do not invent progress that is not stated.
- An item counts as moved/done only if a later brief or its own follow-up explicitly says so.
- If fewer than two previous briefs exist, say plainly that there is not enough history for a review yet, name how many briefs exist, and stop there. Do not fabricate a scorecard from one data point.

## Output

Produce ONLY the review, in Markdown. No preamble.

1. `*Follow-Through Scorecard*`
   Every priority that appeared in a Top 3 across the briefs above, one line each: the item, and its outcome, `✅ moved/done`, `⏳ still open`, or `❓ unclear from the notes`. End with a fraction: X of Y items actually moved.

2. `*Carried Items*`
   Any item that appeared in Top 3 across 3 or more briefs, flagged `🔁 CARRIED <n> BRIEFS`. For each, one call: promote it to #1 with a smaller concrete next step, or state it should be explicitly killed or parked, with a reason either way.

3. `*Pattern*`
   One honest line on what keeps getting bumped and why, if a pattern is visible. If there is no pattern, say so.

4. `*Verdict*`
   One direct line: is this business actually moving on its own stated priorities, or mostly reshuffling the same list.
