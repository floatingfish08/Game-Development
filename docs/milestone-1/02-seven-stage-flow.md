# Seven-Stage Flow

## Run time

| Segment | Minutes | Cumulative |
|---|---:|---:|
| Welcome, safety, role check | 5 | 5 |
| 1. Challenge the Handover | 4 | 9 |
| 2. Keep the Station Alive | 5 | 14 |
| 3. Decide What to Trust | 6 | 20 |
| 4. Test Lower Route | 6 | 26 |
| 5. Open the Buried Station | 7 | 33 |
| 6. Build the Truth | 6 | 39 |
| 7. Survive the Correction | 9 | 48 |
| Operating buffer | 2 | 50 |
| Debrief | 20 | 70 |

Stage clocks include the reveal and consequence. The facilitator can pause for
a safety or technical issue. They should not routinely extend decision clocks;
time pressure is part of the evidence.

## Stage 1 — Challenge the Handover

**Story:** The former shift left hurriedly. Mara is absent. The handover engine
is completing gaps with plausible defaults while the storm builds.

**Shared display:** Five proposed handover entries:

1. Event classification: local service fault
2. Public safety: no wider risk confirmed
3. Mara Venn: Lower Route field check
4. Routing source: road feed has priority
5. Unidentified fragment: discard as weather interference

**Private evidence:** Each role receives one reason a default may be weak, stale,
or outside its source's authority. No item reveals what Lower Route means.

**Decision:** The team has three audit holds. It chooses which three entries to
hold for human verification; the remaining two become provisional working facts.

**Mechanical result:** Held items delay related false assumptions. Unheld items
do not become permanently true, but they add a later cost or reduce initial
clarity.

**Required reveal:** `21:07 — VENN, MARA — LOWER ROUTE` remains ambiguous.

**Transition:** A mast strike interrupts the handover and initiates degraded mode.

## Stage 2 — Keep the Station Alive

**Story:** Backup power is stable but insufficient for every circuit. The station
offers a calm automatic recommendation optimised for relay uptime.

**Available circuits:** Main Relay, Signal Buffer, Military Channel, Road Feed,
Lower Route Feed, Lock Control, Air Handling. Main Relay consumes one mandatory
capacity unit; the crew can power three of the remaining six.

**Private evidence:** Roles see different dependencies. Examples: the Signal
Analyst knows buffering permits replay; the Protocol Officer knows Lock Control
telemetry is not the same as hatch power; the Field Liaison knows the Road Feed
last verified its camera hours ago.

**Decision:** Select three optional circuits and confirm the power plan.

**Mechanical result:**

- Signal Buffer improves later degraded evidence.
- Military Channel gives an earlier path to External Trust.
- Road Feed makes the road hypothesis look stronger but can later expose stale data.
- Lower Route Feed reveals legacy traffic earlier.
- Lock Control enables remote telemetry and a safer finale.
- Air Handling delays one Upper Air deterioration.

Every unpowered circuit retains a manual or degraded fallback with a cost.

**Transition:** Degraded mode reveals traffic beneath an official bulletin.

## Stage 3 — Decide What to Trust

**Story:** Official traffic, automatic correction codes, old Lark fragments, and
Mara's current signal overlap. Clean messages sound safe; weak ones sound wrong.

**Interaction:** Each role receives a short fragment plus source metadata that
another role needs to interpret. The team can assign three bandwidth slots:

- **Preserve** retains raw material for later reconstruction.
- **Replay** improves one fragment now but occupies two slots.
- **Quarantine** keeps a fragment without letting it affect the relay.
- **Discard** frees capacity and destroys the best copy.

**Decision:** Allocate the three slots and name which source the crew currently
considers most decision-relevant. Naming a source is a confidence statement, not
a scored trivia answer.

**Mechanical result:** Good preservation produces `...not road...under...` and a
recognisable cadence later. Poor preservation produces a partial transcript and
forces physical confirmation in Stages 4–5.

**Required reveal:** At minimum, the crew learns the odd signal is structured and
responsive, not random weather noise.

**Transition:** Cordon Control announces a narrowing five-minute external window.

## Stage 4 — Test Lower Route

**Story:** The lower road is flooding. One service respirator and portable air
meter allow one bounded check before the plume reaches the ridge.

**Interaction:** The crew chooses a runner, one destination, and an abort rule.
The runner sees a simple branching route on their private terminal. Other roles
have map, weather, equipment, and protocol fragments. The team may send the
runner three short guidance messages through the app; normal voice remains open,
but the runner's visual information is private.

**Destination choices:** Lower road gate, external repeater, mast conduit, or stay
inside. A good plan uses a clear test and abort condition rather than attempting
to search everything.

**Decision:** Submit the field plan, then the runner completes three timed moves.

**Mechanical result:** The safest high-value route can verify:

- no fresh tracks lead downhill;
- the repeater has not been opened; and
- a labelled conduit returns beneath the station.

Poor guidance can spend the respirator filter, worsen Upper Air through exposure,
or return only one clue. Staying inside preserves the mask but leaves the road
assumption to be broken through weaker indoor evidence.

**Required reveal:** By the end of the transition, the crew has credible reason
to stop treating Lower Route as the lower road.

**Transition:** The lower hold controller reports containment activation beneath
the cabin.

## Stage 5 — Open the Buried Station

**Story:** Upper Air worsens. The crew finds the service hatch and realises the
old “route” ends in an occupied emergency relay workplace. The hold may preserve
cleaner air, but its containment interlock can seal people inside.

**Private evidence:** System, protocol, and human evidence is distributed:

- pressure and airflow sequence;
- interlock rule and override duration;
- Lark Shift status log;
- Mara's likely fault-investigation path;
- structural/water warning; and
- a fragment warning, `do not come down blind`.

**Decision:** Choose a hatch procedure: remote inspect, controlled crack with a
watcher, full override/descent, or delay. The team also assigns the respirator
and names who remains responsible for the upper override.

**Mechanical result:** A controlled approach can establish Lock Knowledge and
retain a safe route. A reckless descent gives faster Mara evidence but risks a
trapped person and consumes the override. Delay worsens Upper Air and advances
Official Status.

**Required reveal:** `RIDGE RELAY ACTIVE / CREW STATUS: OPERATIONAL` proves the
historic status measured the relay, not the crew. Mara is verified below through
voice, personal evidence, or current occupancy telemetry.

**Transition:** Cordon Control challenges Ridge to provide a concise, corroborated
human-distress correction.

## Stage 6 — Build the Truth

**Story:** Ridge traffic is considered unreliable. Shouting that Mara is trapped
is insufficient; the crew must construct a correction supported by what it has
actually verified.

**Interaction:** The team builds a five-part emergency message:

1. **Invalid status:** what official label is wrong?
2. **Human fact:** who is affected and where?
3. **Current hazard:** what threatens them now?
4. **Evidence:** what verified observation supports the claim?
5. **Requested action:** what must the receiver do?

Private terminals recommend different priorities. The Comms Officer, when
present, sees word count, required format, and receiver feedback.

**Decision:** Submit one primary transmission. If it is rejected, the team gets
one shorter retry at the cost of time and worsening conditions.

**Mechanical result:** The message's credibility comes from ledger evidence,
specificity, powered communication routes, and External Trust—not exact prose.
It can be accepted, conditionally heard, or rejected pending final proof.

**Required reveal:** The outside response explicitly distinguishes relay status
from human status.

**Transition:** The containment controller starts a final seal sequence while the
false official status begins filing.

## Stage 7 — Survive the Correction

**Story:** Mara is below, the surface is becoming unsafe, the hold is preparing
to seal, and the status correction is not necessarily secure. The crew has two
timed action rounds.

**Action lanes:**

- **Lock:** stabilise, override, or physically hold the interlock.
- **Signal:** transmit, corroborate, or maintain the emergency correction.
- **People:** reach Mara, supply the respirator, prepare extraction, or evacuate.

Each lane needs one assigned lead. Six-player teams can reinforce three lanes
with a second person. A seventh player provides one additional reinforcement.
Actions depend on preserved systems, evidence, equipment, and role interventions.

**Decision:** For each round, assign players/resources and choose the crew's
priority. The Station Lead commits; the app resolves simultaneous consequences.

**Mechanical result:** Finale resolution uses two primary axes—Lock Controlled and
Correction Accepted—with Mara and team condition as modifiers. The app selects
an ending, then shows a final calm status screen before revealing the human cost.

**Best achievable message:**

> RIDGE STATUS FALSE. MARA VENN LOCATED BELOW. LOWER ROUTE HOLD OCCUPIED.
> OPERATIONAL STATUS INVALID. RESCUE REQUIRED.

**Final transition:** Freeze the result. Do not explain the lesson. Give players
a breath, then move directly into the debrief.
