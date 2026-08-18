# Blackout Ridge facilitator guide

## Purpose and format

Blackout Ridge is a live, facilitated survival-horror leadership simulation.
Players communicate by voice in the room or on a call while the browser runtime
supplies unequal private evidence, a shared station picture, timed decisions,
consequences, and the facilitator console.

Allow 70 minutes: roughly 43 minutes for the seven-stage game and 20–25 minutes
for the debrief. Use one facilitator, one shared room display, and one private
browser per participant. Headphones are optional; station audio is opt-in.

## Before participants arrive

1. Run `npm run dev` and open `http://localhost:4173`.
2. Create a shift for 2, 4, 5, 6, or 7 players.
3. Open the shared display on the room screen.
4. Send the crew link privately to participants.
5. Confirm that every participant can see only their own role instrument.
6. Keep the facilitator console private because it contains the full evidence
   record, all role reports, outcome preview, and recovery controls.

Role configurations:

- 2: Command & Field; Signal & Systems.
- 4: Command & Protocol; Signal; Systems; Operations & Field.
- 5: Station Lead; Signal; Systems; Operations; Field & Protocol.
- 6: Station Lead; Signal; Systems; Operations; Field; Protocol.
- 7: the six core roles plus Comms.

## Participant-care briefing

Read the statement displayed in the assembly screen. Tell participants that the
scenario includes emergency pressure, a missing person, confinement, and implied
danger. Anyone may privately ask to step out, reduce intensity, or observe; do
not require an explanation and do not announce the request to the group.

Only select **Confirm brief delivered** after reading it. The runtime will not
start the shift until every terminal is connected and the briefing is confirmed.
The Safety Pause control freezes the clock and adds a visible pause state at any
point. Clear it only when the participant is ready or has moved into observer
mode.

## Opening script

“You are the night crew at Blackout Ridge Signal Station. The storm has damaged
the mast. Mara Venn is missing. The station is producing calm operational
answers, but each of you can see different evidence. Share what matters, name
what you are assuming, and make one crew decision before each window closes.
You may be unable to save everything. Operational does not mean safe.”

Do not explain the central twist. Remind players that uncertainty is part of the
game and that weak choices fail forward rather than ending play early.

## Run of play

### Stage 1 — Challenge the handover, 4 minutes

The crew places exactly three audit holds. Listen for whether participants
distinguish observed facts from inferred status labels. If stuck, use the
contextual prompt rather than explaining which holds are correct.

### Stage 2 — Keep the station alive, 5 minutes

The crew powers three optional circuits. Ask what later capability each circuit
protects. Avoid framing this as a points optimization problem: the trade-off is
evidence, air, trust, or control.

### Stage 3 — Decide what to trust, 6 minutes

The crew allocates exactly three reconstruction slots. The visible signal
transmission reflects what was preserved earlier and becomes more or less
legible as decisions compound.

### Stage 4 — Test Lower Route, 6 minutes

The lead names a runner, destination, and explicit abort rule. Once committed,
only the runner may make the three field moves. The crew has three short
guidance bursts. The portable meter rises with outside movement and forces
withdrawal at 18 ppm. Observe whether the crew treats the partial respirator as
a boundary or as permission to take more risk.

### Stage 5 — Open the buried station, 7 minutes

The crew chooses a hatch procedure, respirator use, and watcher. Keep the two
stakes visible: verifying Mara is not the same as preserving crew survival.

### Stage 6 — Build the truth, 6 minutes plus possible retry

The correction must state the invalid status, human and location, current
hazard, evidence, and requested action. A poor first correction opens one
shorter retry and increases pressure. Do not compose the message for the crew.

### Stage 7 — Survive the correction, 9 minutes

The crew completes two rounds across Lock, Signal, and People. Every lane needs
an available role owner; full crews need three distinct owners and duo crews
need both participants represented. The runtime previews the ending privately
to the facilitator. Confirm the record only after checking that no technical
mis-entry occurred.

## Recovery controls

- **Pause / Resume:** ordinary timing control.
- **+30 sec:** compensate for technical delay; avoid using it to improve a
  decision merely because the group is uncomfortable.
- **Safety Pause:** participant-care stop with the clock frozen.
- **Prompt:** sends a stage-specific question without revealing private facts.
- **Observer mode:** temporarily removes an absent participant’s authority.
- **Reassign:** transfers a connected participant to an available responsibility
  and records it in the audit trail.
- **Re-send card:** refresh cue for a participant who lost their private screen.
- **Technical correction:** use only to repair an interface or transcription
  mistake; record the reason.

## Ending interpretation

Always discuss the rescue and survival dimensions separately. The possible
records are Clean Rescue, Costly Rescue, Last Broadcast, Joined Below, Flee
Ridge, Filed Safe, and Station Loss. An ending is a consequence of the crew’s
information handling and safeguards, not a diagnosis of participant ability.

## Six-step debrief, 20–25 minutes

Advance the numbered debrief control so the same prompt appears on every screen.
Use the facilitator note field for observations, not personality labels.

1. **Immediate reactions:** let participants name tension and confusion before
   explaining the system.
2. **Status failures:** reconstruct how OPERATIONAL, GREEN, NO ACTIVE DISTRESS,
   or LOWER ROUTE became misleading.
3. **Role map:** identify what each responsibility protected and which voice was
   easiest to disregard.
4. **Hesitation diagnosis:** separate evidence, risk, people, ownership,
   control, and technical-exposure concerns.
5. **AI workplace bridge:** find real automated outputs or confidence labels
   that may be measuring a system proxy rather than the human outcome.
6. **First step:** every participant records one bounded action they will take
   at work. Do not present the result as psychometric scoring or formal readiness
   certification.

Export the session record from the facilitator panel. It includes decisions,
timing, role contributions, debrief notes, first steps, and the event history.
Handle it according to the host organization’s retention and privacy policy.

## Playtest record

After a pilot, open **Prototype playtest record** in the facilitator debrief
panel. Rate each criterion from one to five, record evidence, and choose proceed,
revise and retest, or stop/heavily reframe. Record:

- total play and debrief duration;
- where rules required facilitator explanation;
- whether every role contributed evidence or an intervention;
- whether participants understood the physical and official stakes separately;
- whether the degraded signal remained legible enough to reason with;
- whether the ending felt caused by earlier decisions;
- whether every participant produced a specific workplace first step;
- any accessibility, comfort, network, or device failures.

Use these observations to tune copy and timing. Do not silently alter decision
logic during a live cohort.
