# Game Architecture

## Experience promise

Players should leave saying: “The information was in front of us, but the clean
status made us interpret it incorrectly.” During play this feels like grounded
survival horror. During debrief it becomes a leadership problem about acting on
confident outputs built from weak or misunderstood evidence.

## Product shape

Blackout Ridge has three coordinated views:

| View | Audience | Purpose |
|---|---|---|
| Shared station console | All players, screen-shared if desired | Common status, phase objective, countdown, official traffic, and committed outcomes |
| Private role terminal | One per player | Role evidence, prompts, limited role action, and private notifications |
| Facilitator console | Facilitator only | Start/pause/advance, pacing cues, state summary, hint controls, safety pause, and ending/debrief output |

The facilitator creates a session and receives a short join code. Players join
in a modern browser, enter a display name, and receive or select a role. A
reconnect must restore the same role and information state.

## Core interaction loop

Every stage follows **Signal → Share → Decide → Consequence**.

- **Signal:** The shared console establishes the new incident. Private terminals
  deliver role-dependent evidence at controlled moments.
- **Share:** Players decide what to disclose and how much confidence to attach to
  it. Evidence is concise enough to paraphrase; the game never rewards reading
  a paragraph aloud.
- **Decide:** The Station Lead submits the crew's committed choice. Other roles
  may prepare or endorse inputs, but no player can silently resolve the stage.
- **Consequence:** The system immediately changes a visible condition, stores a
  hidden consequence, or changes the quality of evidence revealed later.

The application should not measure whether the group inferred a designer's exact
wording. It records decisions and evidence, then lets consequences express
quality. This avoids “guess what the author is thinking” puzzles.

## Five mechanics

### 1. Unequal information

Each private item contains one fact, one interpretation risk, or one operating
constraint. At least two roles must combine information to justify every major
decision. Private information is never a long solo puzzle.

### 2. Bounded team decisions

Each stage has one primary decision with two to four legible options. Limits are
fictional and visible: power capacity, transmission bandwidth, safe exposure,
or time. The group is choosing under pressure, not hunting for an invisible
hotspot in the interface.

### 3. Evidence ledger

The app records evidence the crew has genuinely preserved or verified. The
shared interface shows short evidence labels—not their hidden scoring value.
Evidence can support the final correction, disprove the road assumption, explain
the legacy controller, identify Mara's location, or establish a rescue hazard.

### 4. Once-per-session role interventions

Every role has one small intervention. It creates a useful question or safeguard;
it does not solve a stage. Using it is optional and visible to the team.

### 5. Consequence substitution

The story always reaches the finale. If players destroy the best evidence, the
game substitutes a weaker, costlier route: a broken transcript instead of clear
audio, a hazardous manual inspection instead of remote lock telemetry, or a
low-trust transmission that needs more corroboration. Failure changes the
situation rather than ending the session early.

## Resources players understand

Only three resources need a persistent shared representation:

| Resource | Player-facing form | Meaning |
|---|---|---|
| Upper Air | Stable → Trace → Unsafe → Critical | Remaining safe operating time on the surface |
| External Trust | Unverified → Heard → Credible | Whether Cordon Control will act on Ridge traffic |
| Official Status | Drafting → Repeating → Hardening → Filed | How close the system is to making a false status authoritative |

Power allocation exists in Stage 2 and the respirator exists in Stages 4–7, but
neither needs to become another always-visible scoring track. Evidence, Mara
clarity, signal preservation, road assumption, and lock knowledge are stored as
facts/flags and expressed through content.

## Difficulty and fairness rules

- A countdown creates pace, but expiry invokes a consequence; it never deletes
  the crew's ability to continue.
- Critical facts appear through at least two different channels over the full
  game. The higher-quality channel depends on earlier choices.
- Colour is never the sole carrier of status.
- Audio always has a transcript, although preserving signal quality can determine
  how complete that transcript is.
- A player who disconnects can reconnect. The facilitator can reassign their role.
- The facilitator has one-click contextual hints written as in-world prompts.
- The game never requires specialist engineering, chemistry, military, or AI
  knowledge. Roles supply every domain rule needed for play.

## Tone rules

- Use restrained industrial language and calm system feedback.
- Prefer human traces—names, mugs, shift notes, a half-finished checklist—to gore.
- Do not imply the military, Calder Vale, or the station system is malicious.
- Do not call the degraded signal alien, haunted, or supernatural.
- Let the interface remain orderly as reality becomes unsafe.
- Reserve explicit course and AI terminology for the debrief.

## Out of scope for the first playable version

- Matchmaking, public lobbies, native voice/video, mobile apps, VR, and 3D movement
- A free-roaming explorable station
- Generative AI controlling rules or adjudicating success
- Facilitator licensing commerce, certification, or billing
- A participant psychometric score
- Four- and five-player role merging until the six-player version is validated
