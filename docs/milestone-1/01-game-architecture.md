# Game Architecture

## Experience promise

Players should leave saying: “The information was in front of us, but the clean
status made us interpret it incorrectly.”

During play this feels like grounded survival horror: chemical exposure, storm
isolation, flood, lock risk, a missing colleague, and a station that continues
to report calm. During debrief it becomes a leadership problem about acting on
confident outputs built from weak, stale, missing, or misunderstood evidence.

## Viability answer

v0.7 asked whether this can work remotely, stay thrilling, and stay runnable by
one facilitator.

**Yes**, if the product has three coordinated views, one decision loop per
stage, and automated state. Hidden-information games fail on Teams/Zoom when
players must decode long cards, track many meters, or wait for the facilitator
to adjudicate. Blackout Ridge avoids that by making every stage a short, shared
commitment.

## Product shape

| View | Audience | Purpose |
|---|---|---|
| Shared station console | All players; may be screen-shared | Common status, phase objective, countdown, official traffic, cordon notices, committed outcomes |
| Private role terminal | One per player | Role evidence, prompts, limited role action, private notifications |
| Facilitator console | Facilitator only | Start/pause/advance, pacing cues, state summary, hint controls, safety pause, ending/debrief output |

The facilitator creates a session and receives a short join code. Players join
in a modern browser, enter a display name, and receive or select a role. A
reconnect must restore the same role and information state.

Voice conversation remains in Teams/Zoom. The game does not attempt to reproduce
video conferencing. Private terminals may offer a simple downloadable role brief
for reconnect or paper fallback.

## Core interaction loop

Every stage follows **Signal → Share → Decide → Consequence**.

- **Signal.** The shared console establishes the new incident. Private terminals
  deliver role-dependent evidence at controlled moments.
- **Share.** Players decide what to disclose and how much confidence to attach
  to it. Evidence is concise enough to paraphrase. The game never rewards
  reading a paragraph aloud.
- **Decide.** The Station Lead submits the crew's committed choice. Other roles
  may prepare or endorse inputs, but no player can silently resolve the stage.
- **Consequence.** The system immediately changes a visible condition, stores a
  hidden consequence, or changes the quality of evidence revealed later.

The application should not measure whether the group inferred a designer's exact
wording. It records decisions and evidence, then lets consequences express
quality. This avoids “guess what the author is thinking” puzzles.

## Five mechanics

### 1. Unequal information

Each private item contains one fact, one interpretation risk, or one operating
constraint. At least two roles must combine information to justify every major
decision. Private information is never a long solo puzzle.

Combined roles in 4- and 5-player sessions create tension, not superpowers. The
player is pulled between two duties under time pressure.

### 2. Bounded team decisions

Each stage has one primary decision with two to four legible options. Limits are
fictional and visible: power capacity, transmission bandwidth, safe exposure, or
time. The group is choosing under pressure, not hunting for an invisible hotspot
in the interface.

### 3. Evidence ledger

The app records evidence the crew has genuinely preserved or verified. The
shared interface shows short evidence labels — not their hidden scoring value.
Evidence can support the final correction, disprove the road assumption, explain
the legacy controller, identify Mara's location, or establish a rescue hazard.

A player saying the correct theory does not set a flag until the crew verifies
it through a game action.

### 4. Once-per-session role interventions

Every role has one small intervention. It creates a useful question or
safeguard; it does not solve a stage. Using it is optional and visible to the
team.

### 5. Consequence substitution

The story always reaches the finale. If players destroy the best evidence, the
game substitutes a weaker, costlier route: a broken transcript instead of clear
audio, a hazardous manual inspection instead of remote lock telemetry, or a
low-trust transmission that needs more corroboration. Failure changes the
situation rather than ending the session early.

## Candidate pressures, reduced for live play

v0.7 listed seven candidate tracked pressures. Tracking all seven as meters
would drown a facilitator and confuse remote players. The playable architecture
keeps **three persistent shared tracks** and stores the rest as facts, flags,
and resources expressed through fiction.

| v0.7 candidate | Playable form |
|---|---|
| Upper Air | Persistent shared track: Stable → Trace → Unsafe → Critical |
| External Trust | Persistent shared track: Unverified → Heard → Credible |
| Status / Signal Race | Persistent shared track: Drafting → Repeating → Hardening → Filed |
| Signal Preservation | Evidence flags and later transcript quality |
| Mara Clarity | Human flags (`mara_missing`, `mara_below`, `mara_voice_verified`) |
| Road Assumption | Assumption flags (`lower_route_is_road`) broken by physical/legacy evidence |
| Lock Control | Resource/knowledge flags (`lock_rule_known`, `lock_control_available`) |

Power allocation exists in Stage 2. The respirator exists in Stages 4–7. Neither
becomes another always-visible scoring track.

## Chemical, mask, and air logic

- Early: trace readings. Outside Run is possible with one mask and air meter.
- Middle: intake worsens. Cabin usable but time-limited. Mask is scarce.
- Late: surface cabin compromised. Hatch, signal, flee, or rescue become urgent.

Recommended external window: **five minutes**. Filter status starts **partial**.
The mask may be spent on the Outside Run, reserved for the hatch, or saved for
Mara. There is no clean solution.

## Difficulty and fairness

- A countdown creates pace, but expiry invokes a consequence; it never deletes
  the crew's ability to continue.
- Critical facts appear through at least two different channels over the full
  game. The higher-quality channel depends on earlier choices.
- Colour is never the sole carrier of status.
- Audio always has a transcript, although preserving signal quality can
  determine how complete that transcript is.
- A player who disconnects can reconnect. The facilitator can reassign their
  role. If nobody can take it, that role's next primary card becomes shared
  after 30 seconds with a fictional reason.
- The facilitator has one-click contextual hints written as in-world prompts.
- The game never requires specialist engineering, chemistry, military, or AI
  knowledge. Roles supply every domain rule needed for play.

## Tone rules

- Use restrained industrial language and calm system feedback.
- Prefer human traces — names, mugs, shift notes, a half-finished checklist —
  to gore.
- Do not imply the military, Calder Vale Materials, or the station system is
  malicious.
- Do not call the degraded signal alien, haunted, or supernatural.
- Let the interface remain orderly as reality becomes unsafe.
- Keep owner branding discrete during play. Reveal the course connection in
  debrief.

## Out of scope for the first playable version

- Matchmaking, public lobbies, native voice/video, mobile apps, VR, and 3D
  movement
- A free-roaming explorable station
- Generative AI controlling rules or adjudicating success
- Facilitator licensing commerce, certification, or billing
- A participant psychometric score
- Milestone 6 cinematic opening and promotional edit (placeholder briefing is
  acceptable)

## Technical shape for later milestones

Milestone 1 does not implement code. It locks the architecture that later
milestones must honour:

- custom browser multiplayer session with join code;
- server-authoritative state;
- private cards filtered by authenticated role;
- facilitator controls listed in the facilitator document;
- deterministic ending calculation with facilitator confirmation.
