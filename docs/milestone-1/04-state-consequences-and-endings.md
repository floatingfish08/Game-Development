# State, Consequences, and Endings

## State model

The application tracks state; the facilitator does not calculate it.
Player-facing tracks use words and fiction. Internal values exist to make
behaviour deterministic and testable.

v0.7 asked for consequences that feel like story, not points. If players discard
the signal, later audio should be broken. If they let Mara default to field
check, later search bias should point downhill. If they ignore air pressure,
mask time and hatch choices become harsher. If they fail to build external
trust, the final correction may be rejected. If they fail to understand the
lock, reaching Mara may trap them too.

### Persistent tracks

| State | Internal range | Initial | Player visibility | Advances when |
|---|---:|---:|---|---|
| Upper Air | 0–3 | 0 Stable | Always visible | Stage transitions, unsafe exterior/hatch choices; Air Handling can cancel one advance |
| External Trust | 0–2 | 0 Unverified | Always visible | Military Channel, good evidence, compliant transmission, readback |
| Official Status | 0–3 | 0 Drafting | Always visible | Unchallenged defaults, delays, weak/rejected transmission |

Track labels:

- Upper Air: 0 Stable, 1 Trace, 2 Unsafe, 3 Critical
- External Trust: 0 Unverified, 1 Heard, 2 Credible
- Official Status: 0 Drafting, 1 Repeating, 2 Hardening, 3 Filed

Filed official language may present as `OPERATIONAL`, `NO ACTIVE DISTRESS`,
`GREEN`, or `ACCOUNTED FOR` depending on what the system is simplifying.

### Systems and resources

| State | Values |
|---|---|
| Optional circuits | powered / unpowered, plus manual fallback used flag |
| Respirator | unused / runner / hatch / Mara; filter full / partial / spent |
| Interlock override | available / used / damaged |
| Role interventions | available / used per role |

### Knowledge and evidence flags

| Group | Example flags |
|---|---|
| Assumptions | `mara_field_check`, `lower_route_is_road`, `voice_is_weather` |
| Signal | `raw_preserved`, `mara_cadence`, `not_road_fragment`, `lark_fragment` |
| Physical | `no_tracks`, `repeater_unopened`, `conduit_below`, `hatch_found` |
| Human | `mara_missing`, `mara_below`, `mara_voice_verified`, `lark_crew_not_safe` |
| System | `legacy_controller_active`, `operational_means_relay`, `lock_rule_known`, `lock_control_available` |
| Correction | selected message components, evidence cited, receiver result |

Flags record what the crew has earned. A participant saying the correct theory
does not set a flag until the crew verifies it through a game action.

## Consequence rules

1. **No early dead ends.** Stages 1–5 can worsen safety or clarity, not end play.
2. **One cause, one visible effect.** Avoid changing three tracks after a minor
   choice. Large finale choices may affect multiple axes and must preview the
   risk.
3. **Earlier choices change quality.** They should alter evidence completeness,
   time, resource availability, or finale options — not hide whole stages.
4. **Defaults harden when unchallenged.** Official Status advances through delay
   or unsupported claims, reinforcing the learning metaphor.
5. **People are not points.** Mara and crew outcomes are described explicitly;
   they are never reduced to a generic score.

## Consequence map

| Earlier decision | Strong consequence | Costly substitute |
|---|---|---|
| Hold Mara/voice handover defaults | False assumptions remain provisional | Defaults harden; later contradiction costs time; search bias points downhill |
| Power Signal Buffer | Clear replay and evidence provenance | Signal Analyst recovers partial transcript with intervention, or physical proof is required |
| Power Military Channel | Trust can reach Heard before Stage 6 | First correction is treated as unverified |
| Power Lock Control | Remote telemetry and stabilise action available | Manual watcher/override required at physical risk |
| Power Air Handling | Cancel one Upper Air advance | Surface reaches Critical earlier |
| Preserve weak signal | Mara/Lark fragments separate cleanly | Current and historic fragments remain ambiguous |
| Perform bounded Outside Run | Multiple physical facts, respirator retained partially | Fewer facts, spent filter, or indoor substitute evidence |
| Controlled hatch approach | Lock Known and route retained | Fast Mara verification with trap/exposure risk |
| Evidence-backed correction | Trust reaches Credible / accepted | Conditional or rejected result; one costly retry |

## Correction resolution

The Stage 6 transmission receives one point for each applicable condition:

- invalid status named correctly (`OPERATIONAL`, `NO ACTIVE DISTRESS`, or the
  live false label);
- Mara and the Lower Route Hold identified;
- current hazard stated;
- at least one earned, relevant evidence flag cited;
- concrete rescue/reclassification request made;
- External Trust is already Heard or Military Channel is powered.

Resolution:

| Conditions | Result |
|---:|---|
| 5–6 | **Accepted:** correction is live; External Trust becomes Credible |
| 3–4 | **Conditional:** receiver requests one missing proof; finale Signal lane must supply it |
| 0–2 | **Rejected:** Official Status advances; one shortened retry is offered before the finale |

This is a content-matching system with facilitator override, not generative-AI
judgment. UI choices can populate structured message slots while still rendering
the result as natural emergency prose.

## Finale resolution

Stage 7 calculates two primary booleans and two condition grades.

### Primary axes

**Lock Controlled** is true when the crew completes a viable lock action with
its required safeguard: remote stabilisation, upper watcher plus manual
override, or a maintained physical hold. Availability depends on prior power and
knowledge.

**Correction Accepted** is true when Stage 6 was Accepted or the Signal lane
satisfies a Conditional/Rejected correction with required corroboration before
Official Status becomes Filed.

### Condition modifiers

**Mara:** Extracted / Located with rescue path / Trapped / Unverified  
**Crew:** Safe / Compromised / Trapped / Incapacitated

No ending claims instant helicopter rescue during the storm. “Rescue” means the
crew has created a credible extraction path and responders know the truth.

## Ending matrix from v0.7

v0.7 said this table is illustrative, not a required branching novel. The
playable architecture keeps all seven outcome states expressible. The 2×2
lock/signal grid is the engine. Mara and crew modifiers select the named
ending.

| Lock | Signal | Canonical engine result | Named ending when modifiers fit |
|---|---|---|---|
| Controlled | Accepted | Best ending. Credible extraction or rescue path exists. | **Clean Rescue** |
| Controlled | Accepted, but extraction is difficult / crew compromised | Physical success with cost | **Costly Rescue** |
| Failed | Accepted | Tragic but recoverable. Rescue knows the truth. | **Last Broadcast** |
| Controlled | Not accepted | Physical survival may be possible, but outside picture remains wrong or delayed | **Dark Hold** (status still filing calm) |
| Failed / reckless descent | Not necessarily accepted | One or more crew trapped below; hold may still report operational | **Joined Below** |
| Any, if crew deliberately evacuates without verifying or supporting Mara | Usually not accepted | Team physically escapes; Mara may be filed as operational/accounted for | **Flee Ridge** |
| Failed | Not accepted | Worst engine result. Hold seals while the station reports calm | **Filed Safe** |
| Upper Air Critical and neither shelter nor evacuation succeeds | Signal as achieved | Team incapacitated by air, exposure, or failed evacuation | **Station Loss** |

### Named endings in full

| Ending | Mara outcome | Team outcome | Status outcome |
|---|---|---|---|
| Clean Rescue | Mara located and reachable | Team survives | Emergency correction accepted |
| Costly Rescue | Mara found, extraction difficult | Team survives but compromised | False status partially corrected |
| Last Broadcast | Mara found | Team trapped or dying | Emergency correction gets out |
| Joined Below | Mara found too late or reached recklessly | One or more crew trapped below | Hold may still report operational |
| Flee Ridge | Mara not found or abandoned | Team physically escapes | Mara may be filed as operational/accounted for |
| Filed Safe | Mara not verified | Team may survive | System records no active distress or operational status |
| Station Loss | Unknown | Team incapacitated by air, exposure, or failed evacuation | Station remains calm or silent |

Do not label an ending “win,” “loss,” or award points.

## Ending presentation

The ending uses three beats:

1. A calm system card: relay, hold, occupancy, and official status.
2. A human consequence card: Mara, crew, and responder reality.
3. A final line selected from the evidence trail, ending with Mara's request
   when available: `DO NOT LET IT CALL ME SAFE.`

The debrief then compares the system record with the human reality.
