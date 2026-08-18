# Content Plan, Playtest, and Acceptance

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
- Downloadable current brief for reconnect / paper fallback

### Facilitator materials

- Facilitator console described in the flow document
- Seven opening cues, seven contextual hints, and stage consequence summaries
- Safety/off-ramp script from v0.7
- Automated decision timeline and ending preview
- Twenty-to-twenty-five-minute debrief guide and participant first-step prompt

### Narrative media

- Official handover/status messages, including `OPERATIONAL`,
  `NO ACTIVE DISTRESS`, `GREEN`, and `ACCOUNTED FOR` where earned
- Cordon Control / military net traffic
- Four progressive degraded-signal treatments, each with transcript variants
- Mara voice fragments and Lark Shift fragments
- Environmental loops: storm, mast strike, relay hum, pressure/hatch sounds
- Lower-hold workplace stills or interface illustrations (workplace before tomb)

The cinematic opening and promotional edit are Milestone 6 deliverables. The
first playable build can use a short in-app motion/sound briefing placeholder.
AI imagery is acceptable where it improves atmosphere without becoming the
thing players notice.

## Milestone 2 validation slice

The UX/UI prototype should implement the lobby/view hierarchy and **Stage 3:
Decide What to Trust** end to end. That slice tests the riskiest interaction
named in v0.7: shared official traffic, role-specific fragments, voice
collaboration, limited bandwidth, a committed decision, and a visible
consequence.

The slice should demonstrate:

- shared console and private terminal at the same time;
- six- and seven-player information distribution;
- one intervention (Recover Fragment);
- timer and facilitator pause/hint;
- state update and Stage 4 transition teaser;
- legible desktop and mobile-width private views; and
- restrained “calm, helpful, wrong” visual language.

## Milestone 1 acceptance criteria

Milestone 1 is complete when the stakeholder can answer “yes” to all of these.

### Experience

- Is the game clearly survival horror during play and leadership development in
  the debrief?
- Does each stage have one understandable primary decision?
- Do earlier choices visibly affect later evidence, safety, or options?
- Does the story continue after poor decisions without making choices
  meaningless?
- Do players face personal danger, not only responsibility for Mara?

### Story

- Are storm, chemical release, flood, military cordon, degraded signal, Mara,
  Lark Shift, Lower Route / Auxiliary Relay Hold, and `OPERATIONAL` each
  performing a necessary job?
- Is Mara's investigation credible rather than reckless?
- Is the system's failure operational and inherited rather than malicious?
- Does the lower workplace reveal precede the strongest horror beat?
- Does the finale require both lock control and an evidence-backed correction?

### Collaboration

- Does every major conclusion require information from at least two roles?
- Does each role have a clear responsibility and meaningful intervention?
- Can 4–7 player sessions use the same story/state model, with 6–7 as the first
  commercial target?
- Does the Station Lead coordinate decisions without becoming the only solver?

### Facilitation

- Can one facilitator run the experience without manual state calculations?
- Does the standard run fit about 70 minutes including a 20–25 minute debrief?
- Are hints, disconnections, safety pauses, and ending review accounted for?
- Does the debrief keep role map and readiness profiles as two distinct lenses?
- Does it connect observed behaviour to a bounded workplace action without
  claiming psychometric validity?

### Build readiness

- Are the shared, private, and facilitator views defined?
- Are state transitions deterministic enough to implement and test?
- Is one high-risk vertical slice named for Milestone 2?
- Are production media and later licensing features clearly separated from the
  first playable scope?

## Playtest success measures

v0.7 asked seven qualitative questions. Capture them in the first internal
sessions, plus the operational targets below.

| Criterion from v0.7 | Question |
|---|---|
| Clarity | Did players understand what they were being asked to do? |
| Thrill | Did it feel tense, not administrative? |
| Survival stakes | Did the team feel personally endangered, not just responsible for Mara? |
| AI alignment | Could players explain the leadership lesson afterwards? |
| Facilitation | Could one facilitator run it without drowning? |
| Role value | Did each role matter? |
| Teams/Zoom fit | Did the remote format help or hinder? |

Operational targets for the first three internal sessions:

| Measure | Target |
|---|---|
| Players who can state the stage objective without facilitator restatement | At least 5 of 6 |
| Players who contribute unique role information in four or more stages | Every core role |
| Gameplay completes before debrief | 43 minutes ± 5 |
| Facilitator manual state corrections | No more than one |
| Players who report personal survival pressure, not only rescue responsibility | At least 75% |
| Players who can explain why `OPERATIONAL` was unsafe | At least 80% |
| Players who identify a real workplace label/output to test | At least 80% |

**Kill/reframe condition:** if two successive revised playtests are tense and
clear but fewer than half of players can connect their behaviour to the
leadership lesson during debrief, pause production and redesign the learning
bridge. Entertainment is not enough for this product.

## Open stakeholder decisions

These choices do not block Milestone 2's interaction prototype, but should be
settled before full content production:

1. Is 70 minutes inclusive of the debrief the firm commercial format, or may the
   debrief extend the total session to 80–90 minutes?
2. What brand name, logo, typefaces, and colour/accessibility requirements
   should appear in the lobby and debrief? (Play branding stays discrete.)
3. Will sessions always be facilitator-led by the owner initially, or must the
   first release already support invited external facilitators?
4. What participant data may be retained after a session — display names only,
   decision logs, debrief notes, or nothing?
5. Which content rating and geographic audience should guide emergency,
   military, and chemical-incident terminology?
6. Are previously shown UI prototype images available as visual references?

## v0.7 coverage matrix

| Client request in v0.7 §16 | How this package answers |
|---|---|
| Assess Teams/Zoom viability | Viable with three views, short cards, one decision per stage, and automated state |
| Challenge phase count | Six sketches become seven stages so lock and signal do not collapse |
| Challenge role count | Six core + optional seventh; 4/5 combined maps defined; banned merges stated |
| Challenge state tracking | Seven candidate pressures reduced to three visible tracks plus flags |
| Simplify confusing mechanics | Same loop every stage; fail-forward substitution; no generative adjudication |
| Test lock-plus-signal finale | Kept and strengthened; seven named endings remain expressible |
| Protect central story and learning | Full story bible and course-alignment tables |
| Recommend prototype structure | Milestone 2 = lobby + Stage 3 vertical slice |
| Advise on one facilitator | One facilitator is the product target; app is the tracker |
| Define assets for internal playtest | Content inventory in this document |

## Change-control note

Approval of this package fixes the experience architecture, not every line of
content. Copy, clue wording, exact balance thresholds, and audio treatment
should be iterated through playtesting. A change that adds a new persistent
track, stage, role, or primary mechanic should be treated as a scope/design
change because it affects facilitation and multiplayer implementation.
