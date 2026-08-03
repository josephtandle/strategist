# Strategist

A daily chief-of-staff for your business. Every morning it reads what you told it about your business, plus any notes you dropped in, convenes a council of seven world-class strategy thinkers (via Claude Code), and hands you one short brief: the three things that matter today, what is at risk, where the money is, and whether you are drifting off mission.

## What it actually does

Running a business means holding too much in your head. The Strategist takes that job. You describe your business once in a small config file. Each day you (optionally) drop quick notes about what happened. Then one command produces a brief with exactly these sections:

- Top 3 Today: the highest-leverage moves, ranked by money and time-sensitivity
- Follow-Through: whether the last Top 3 actually moved, stalled, or became a carried item that must be resolved
- Risk Radar: relationships and deadlines going stale
- Money Radar: money owed, leaking, or on the table
- Stuck On You vs Stuck On Others: what only you can unblock, and who to nudge
- Mission Check: one honest line about whether you are drifting
- Council verdict: a score out of 10, with disagreement preserved, not averaged away

The council is seven personas with distinct lenses: Ray Dalio (truth and synthesis), Alex Hormozi (offers), April Dunford (positioning), Roger Martin (where to play), Rita McGrath (when to cut), Charlie Munger (inversion and risk), and Greg McKeown (essential focus). Each reasons alone first, then the chairman synthesizes.

It is an advisor, not a doer. It never sends messages, never touches money, never calls any online service itself. The only thing it runs is the Claude Code command on your own machine, and the only thing it writes is a Markdown file in your briefs folder.

## Install

You need [Node.js](https://nodejs.org) and [Claude Code](https://claude.com/claude-code) installed. Then, from this folder:

```bash
node bin/strategist.js setup
```

Open `config/business.json` and replace every example value with the truth about your business, your mission, your goals, and your active projects. The brief is only as sharp as this file. Blunt honesty in, blunt clarity out.

## Daily use

```bash
node bin/strategist.js brief            # today's brief
node bin/strategist.js brief --weekly   # weekly portfolio review instead
node bin/strategist.js focus "rewriting the proposal"  # mid-day drift check
node bin/strategist.js check            # confirm config and setup are healthy
```

Briefs are saved to `briefs/YYYY-MM-DD.md`. If the `claude` command is not installed, the tool writes the full prompt to a file instead and tells you to paste it into Claude yourself. Same brief, one extra step.

`focus` prints a short, mid-day verdict: `ON TRACK`, `DRIFTING`, or `RABBIT HOLE`, tied to today's Top 3. It writes no brief on success. If no brief exists today, it assesses the current activity against the mission in your business config.

## Feeding it context

Two habits make the briefs dramatically better:

1. **Notes.** Drop short `.md` or `.txt` files into `notes/`: what happened, what you are worried about, what a client said. The five most recent notes are read before every brief.

2. **Brief memory.** The three most recent briefs are read newest first. The council compares their Top 3 lists to today's facts, so recurring priorities cannot quietly roll forward forever.

Keep `config/business.json` current as your goals shift. The council scores time-boxed mission goals above everything else, so give your goals real dates.

## Automating it

To get the brief every morning without running anything, add a scheduled job. On a Mac or Linux machine, ask Claude Code to "schedule strategist brief daily at 7am" from this folder, or add a cron line yourself:

```
0 7 * * * node /path/to/strategist/bin/strategist.js brief >> /path/to/strategist/briefs/cron.log 2>&1
```

## Privacy

Everything stays on your machine: your config, your notes, your briefs. The business context is sent to Claude only when a brief is generated, through your own Claude Code login, under your own account.

## License

Personal Use License. You can use this for yourself, but you cannot resell it, share it, or use it in any commercial service. If you need to use it commercially, reach out through the distributor listed with your copy and we can figure out something that makes sense. See LICENSE for the full terms.
