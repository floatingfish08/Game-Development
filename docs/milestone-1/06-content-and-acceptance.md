# Content Plan and Acceptance Criteria

## Content inventory for the playable version

### Shared interface

- Session lobby and connection/role state
- Blackout Ridge station shell and seven stage panels
- Three persistent status tracks
- Handover queue, power board, signal workspace, Outside Run status, hatch/hold
  console, correction builder, three-lane finale, and ending screens
- Countdown and consequence notifications
- Evidence ledger using short earned labels

### Private terminals

- Seven role cards
- Approximately 35–42 private evidence cards (five to six per role, with the
  seventh role's content redistributed in six-player mode)
- Seven intervention controls with confirmation/cost text
- Runner route view for Stage 4
- Role-specific finale actions

### Facilitator materials

- Facilitator console described in the flow document
- Seven opening cues, seven contextual hints, and stage consequence summaries
- Safety/off-ramp script
- Automated decision timeline and ending preview
- Twenty-minute debrief guide and participant first-step prompt

### Narrative media

- Official handover/status messages
- Cordon Control traffic
- Four progressive degraded-signal treatments, each with transcript variants
- Mara voice fragments and Lark Shift fragments
- Environmental loops: storm, mast strike, relay hum, pressure/hatch sounds
- Lower-hold workplace stills or interface illustrations

The cinematic opening and promotional edit are Milestone 6 deliverables. The
first playable build can use a short in-app motion/sound briefing placeholder.

## Milestone 2 validation slice

The UX/UI prototype should implement the lobby/view hierarchy and **Stage 3:
Decide What to Trust** end to end. That slice tests the riskiest interaction:
shared official traffic, role-specific fragments, voice collaboration, limited
bandwidth, a committed decision, and a visible consequence.

The slice should demonstrate:

- shared console and private terminal at the same time;
- six- and seven-player information distribution;
- one intervention (Recover Fragment);
- timer and facilitator pause/hint;
- state update and Stage 4 transition teaser;
- legible desktop and mobile-width private views; and
- restrained “calm, helpful, wrong” visual language.

## Milestone 1 acceptance criteria

Milestone 1 is complete when the stakeholder can answer “yes” to all of these:

### Experience

- Is the game clearly survival horror during play and leadership development in
  the debrief?
- Does each stage have one understandable primary decision?
- Do earlier choices visibly affect later evidence, safety, or options?
- Does the story continue after poor decisions without making choices meaningless?

### Story

- Are storm, chemical release, flood, military cordon, degraded signal, Mara,
  Lark Shift, Lower Route, and `OPERATIONAL` each performing a necessary job?
- Is Mara's investigation credible rather than reckless?
- Is the system's failure operational and inherited rather than malicious?
- Does the lower workplace reveal precede the strongest horror beat?

### Collaboration

- Does every major conclusion require information from at least two roles?
- Does each role have a clear responsibility and meaningful intervention?
- Can six- and seven-player sessions use the same story/state model?
- Does the Station Lead coordinate decisions without becoming the only solver?

### Facilitation

- Can one facilitator run the experience without manual state calculations?
- Does the standard run fit 70 minutes including the 20-minute debrief?
- Are hints, disconnections, safety pauses, and ending review accounted for?
- Does the debrief connect observed behavior to a bounded workplace action without
  claiming psychometric validity?

### Build readiness

- Are the shared, private, and facilitator views defined?
- Are state transitions deterministic enough to implement and test?
- Is one high-risk vertical slice named for Milestone 2?
- Are production media and later licensing features clearly separated from the
  first playable scope?

## Playtest success measures

For the first three internal sessions, capture:

| Measure | Target |
|---|---|
| Players who can state the stage objective without facilitator restatement | At least 5 of 6 |
| Players who contribute unique role information in four or more stages | Every core role |
| Gameplay completes before debrief | 43 minutes ± 5 |
| Facilitator manual state corrections | No more than one |
| Players who report personal survival pressure, not only rescue responsibility | At least 75% |
| Players who can explain why `OPERATIONAL` was unsafe | At least 80% |
| Players who identify a real workplace label/output to test | At least 80% |

Kill/reframe condition: if two successive revised playtests are tense and clear
but fewer than half of players can connect their behavior to the leadership
lesson during debrief, pause production and redesign the learning bridge.

## Open stakeholder decisions

These choices do not block Milestone 2's interaction prototype, but should be
settled before full content production:

1. Is 70 minutes inclusive of the debrief the firm commercial format, or may the
   debrief extend the total session to 80–90 minutes?
2. What brand name, logo, typefaces, and color/accessibility requirements should
   appear in the lobby and debrief?
3. Will sessions always be facilitator-led by the owner initially, or must the
   first release already support invited external facilitators?
4. What participant data may be retained after a session—display names only,
   decision logs, debrief notes, or nothing?
5. Which content rating and geographic audience should guide emergency, military,
   and chemical-incident terminology?
6. Are the previously shown UI prototype images available as visual references?

## Change-control note

Approval of this package fixes the experience architecture, not every line of
content. Copy, clue wording, exact balance thresholds, and audio treatment should
be iterated through playtesting. A change that adds a new persistent track, stage,
role, or primary mechanic should be treated as a scope/design change because it
affects facilitation and multiplayer implementation.
