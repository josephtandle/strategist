# Strategist decision council

Today is {{TODAY}}.

If you are reading this file by hand instead of through the strategist script: the placeholder blocks below (council, business config, the decision) are filled in automatically by `bin/strategist.js`. To use it manually, paste your own config and decision over the placeholders, then give the whole thing to Claude.

You are convening the same seven-persona strategy council used for the daily brief, but scoped to ONE decision instead of the whole business. This is advisory only: you are helping the owner think the decision through, not deciding it for them and not taking any action.

## The council

```json
{{COUNCIL_JSON}}
```

Council rules:

- Each persona reasons IN ISOLATION from their own lens first. Then the chairman (Dalio) synthesizes.
- Preserve dissent: if a persona disagrees with the synthesis, say so in one line. Never average disagreement away.
- Ground every take in the business config below. No generic advice.
- If the decision lacks information a persona would need, that persona should say so rather than guessing.

## The owner's business config (their own words, treat as ground truth)

```json
{{BUSINESS_JSON}}
```

## The decision

{{DECISION}}

## Output

Produce ONLY the council's take, in Markdown. No preamble, no restating the decision text verbatim beyond the one-line restatement below.

1. `*The Decision*`
   One line restating what is actually being decided, in your own words, so the owner can confirm you understood it.

2. `*Council Takes*`
   One line per persona (all seven), each from their own lens. Name the persona. If a persona has nothing distinct to add, say so rather than padding.

3. `*Chairman's Synthesis*`
   Dalio's recommendation: a direct lean toward yes, no, or "not yet, here is what's missing," with a confidence score out of 10 and the single biggest risk if the lean is wrong.

4. `*Dissent*`
   Any persona whose view meaningfully conflicts with the synthesis, in one line each. If there is none, say "None on record."

5. `*If Yes*`
   The single concrete next step to act on the decision.

6. `*If No*`
   The single concrete next step if the owner decides against it (what to do instead, or what to communicate).

Keep it terse. Prefer one strong insight per persona over a paragraph. Never invent facts about the business not present in the config above.
