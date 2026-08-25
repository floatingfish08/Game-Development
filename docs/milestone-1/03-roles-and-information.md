# Roles and Information Design

## Role principles

- Six players receive the six core roles; the seventh receives Comms Officer.
- Roles represent leadership perspectives, not specialist exams.
- Every role gets consequential private information in at least four stages.
- Every role owns one once-per-session intervention.
- The Station Lead commits team decisions but cannot see or override all evidence.
- Information should create a reason to speak, not reward secrecy for its own sake.

## Role cards

| Role | What you protect | Private lens | Once-per-session intervention | Debrief lens |
|---|---|---|---|---|
| Station Lead | Accountability and coordinated action | Decision deadlines, declared confidence, unresolved disagreement | **Hold the Clock:** add 60 seconds before a commitment; Upper Air or Official Status advances afterward | Self-readiness |
| Signal Analyst | Meaning and provenance | Waveforms, timestamps, confidence, replay quality | **Recover Fragment:** restore one discarded/degraded signal as a partial transcript | Leadership fluency |
| Systems Engineer | What systems actually measure | Dependencies, controller states, power, telemetry limitations | **Trace Dependency:** reveal what one active status is measuring and which subsystem supplied it | Roadmap and learning |
| Operations Officer | Useful bounded action | Routes, timing, equipment, abort conditions | **Controlled Test:** preview the likely cost—not the result—of one proposed physical action | Value discovery |
| Field Liaison | People absent from clean data | Mara context, staff practice, responder impact, human inconsistencies | **Human Check:** force one system record to display the named person/source evidence behind it | People and adoption |
| Protocol Officer | Guardrails and explicit uncertainty | Containment rules, authority, message requirements, safety thresholds | **Safety Condition:** attach one abort/safeguard condition to an action, reducing its worst physical cost | Risk and guardrails |
| Comms Officer (7th) | Shared understanding and receiver trust | Cordon format, acknowledgements, compression loss, message clarity | **Request Readback:** obtain exact receiver interpretation of one sent message | Cross-functional communication |

Interventions are safeguards, not “correct answer” buttons. The terminal explains
the cost or limitation before confirmation.

## Information matrix

Legend: **P** primary private evidence, **S** supporting private evidence, **D**
decision responsibility, **—** no unique information (shared display still visible).

| Stage | Lead | Signal | Systems | Operations | Field | Protocol | Comms |
|---|---:|---:|---:|---:|---:|---:|---:|
| 1. Handover | D | S | P | S | P | P | S |
| 2. Power | D | P | P | P | S | S | S |
| 3. Trust | D | P | P | S | P | S | P |
| 4. Outside | D | S | S | P | P | P | S |
| 5. Buried station | D | S | P | S | P | P | S |
| 6. Build truth | D | P | P | S | P | P | P |
| 7. Survive | D | P | P | P | P | P | P |

## Required cross-role joins

These joins ensure no one terminal contains a complete conclusion.

| Conclusion/action | Required information join |
|---|---|
| A handover label is unsafe | Source/timestamp from Signal or Systems + human/protocol conflict from Field or Protocol |
| Signal deserves preservation | Signal structure from Signal Analyst + legacy dependency from Systems or Mara pattern from Field Liaison |
| Outside Run is bounded | Route/equipment from Operations + air/abort constraint from Protocol + human objective from Field |
| Lower Route is beneath the station | Signal direction / cadence + Systems LRR-2/legacy naming + Field Mara practice (no road key); physical confirmation in Stage 4 |
| Hatch can be approached safely | Interlock telemetry from Systems + safety rule from Protocol + operating sequence from Operations |
| `OPERATIONAL` is invalid | Lark status evidence + Systems explanation of measured object + named human contradiction |
| Cordon should trust the correction | Signal provenance + protocol-compliant request + human/location fact + receiver feedback |
| Finale plan is viable | Lock state + signal state + people/equipment state, owned by different roles |

## Private content constraints

Each private reveal should fit on one card:

- headline of no more than eight words;
- evidence of no more than 35 words;
- source and timestamp where relevant;
- a confidence label: Confirmed, Likely, Stale, Unknown, or Contradicted;
- one optional prompt such as “Who needs to know this?”

Confidence labels describe evidence quality, never the “correctness” of a player's
interpretation.

## Six- versus seven-player behavior

With six players, Cordon formatting and readback appear as shared Protocol/Signal
prompts. With seven, those prompts move to the Comms Officer and the final signal
lane gains an extra specialist action. Story difficulty and ending thresholds do
not change merely because a seventh person joined.

## Disconnection and absence

The facilitator can reassign a disconnected player's role terminal. If no player
can take it, that role's next primary card becomes shared after 30 seconds with a
fictional reason (“cross-terminal diagnostic copy”). The team pays a small time
cost, but critical evidence is never permanently lost to a technical problem.
