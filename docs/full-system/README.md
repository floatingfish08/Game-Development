# Blackout Ridge — implemented game runtime

## Experience model

The build has four modes:

1. **Game start** — a full-screen, in-world station startup sequence.
2. **Shared station** — the room-facing world view, clock, crew state, evidence,
   system record, and visible consequences.
3. **Private role instrument** — one player’s evidence, crew report channel,
   role override, and the Station Lead’s decision controls.
4. **Facilitator control** — stage decisions, live reports, timers, prompts,
   safety pause, station state, and event history.

All modes consume the same authoritative session state. A player never receives
another role’s private evidence.

## Crew configurations

The runtime supports the playbook's four-, five-, six-, and seven-player
configurations, plus the requested two-player variant. Responsibilities combine
without removing any evidence lens:

- **2 players:** Command & Field; Signal & Systems.
- **4 players:** Command & Protocol; Signal; Systems; Operations & Field.
- **5 players:** Lead; Signal; Systems; Operations; Field & Protocol.
- **6 players:** the six core roles.
- **7 players:** the core roles plus Comms.

Both operators receive different multi-source briefs and must exchange what
they know. All seven stages use the same decisions and consequences as full-crew
play. During the finale, both operators must own at least one of the three lanes;
one operator necessarily carries a second lane.

Duo validation captures: [role selection](screenshots/duo-join.png),
[Command & Field terminal](screenshots/duo-command.png), and
[Signal & Systems terminal](screenshots/duo-technical.png).

## Seven-stage runtime

1. Challenge the handover defaults with three human audit holds.
2. Allocate backup power to exactly three optional circuits.
3. Spend limited signal-processing capacity across competing sources.
4. Send a named runner on a bounded physical check with an abort rule.
5. Choose a containment-hatch procedure and assign scarce protection.
6. Build an evidence-backed correction for Cordon Control.
7. Execute two rounds across Lock, Signal, and People, each with a named lead.

Every stage changes persistent station state. Weak choices do not stop the game;
they change pressure, available evidence, trust, air safety, and the possible
ending.

The Outside Run is an active three-move sequence. The lead first locks a runner,
destination, and explicit abort rule. The runner then chooses to observe,
advance with exposure, or withdraw, while the rest of the crew can send only
three short guidance bursts. Findings and filter condition carry into the hatch.

A rejected first Stage 6 correction opens one shortened retry and worsens the
station state. Stage 7 resolves two separately committed action rounds, produces
a deterministic ending preview, and waits for the facilitator to confirm the
final record before exposing the debrief.

Chemical air, lower-road flooding, storm damage, cordon trust, respirator state,
and the official-status race remain visible as incident telemetry. The Outside
Run carries a live air-meter reading and automatically withdraws the runner at
the hard 18 ppm limit. Private role instruments can archive their current brief
as a text file for remote or accessibility workflows.

## Runtime architecture

- `server/server.js` — HTTP API, static delivery, event stream, persistence.
- `server/game-engine.js` — authorization, timer logic, consequences, endings.
- `server/game-content.js` — roles, stages, evidence, and decision options.
- `prototype/full-app.js` — the four browser modes and interaction routing.
- `prototype/audio.js` — opt-in procedural ambience and feedback cues.
- `prototype/network.js` — REST actions, state loading, and reconnecting events.
- `prototype/styles.css` — cinematic full-viewport game presentation.

## Session operation

1. Run `npm run dev` and open `http://localhost:4173`.
2. Engage the station, choose Command Authority, and arm a two- or four-to-seven-terminal shift.
3. In the assembly screen, copy the crew link and open the shared display.
4. Players claim roles. Read the participant-care statement and confirm it in
   the facilitator console; the shift cannot start until this is done.
5. Players discuss their private evidence and submit short assessments.
6. The Station Lead or facilitator commits each decision.
7. During Stage 4, the named runner completes three field moves while the crew
   uses its three guidance bursts.
8. The facilitator advances after each consequence reveal and confirms the
   calculated final record after Stage 7.
9. Use the synchronized six-step debrief to reconstruct status failures, map
   roles, diagnose hesitation, bridge to AI-enabled work, and capture one bounded
   first step from every participant. Export the complete session record as JSON.
10. After a pilot, open the prototype playtest record, rate all seven playbook
    criteria, record observations, and choose proceed, revise, or stop/reframe.

The audio control is deliberately opt-in because browsers block autoplay and
workshop participants may need reduced stimulation.

## Validation

`npm run check` validates all JavaScript entry points. `npm test` covers complete
high-quality and fail-forward paths plus access-control and timing rules. The
runtime has also been visually checked at 1440×900 for the shared, facilitator,
and private-player modes.

Validation captures: [cinematic video startup and station lever](screenshots/video-boot-background.png),
[mobile station boot](screenshots/realistic-boot-terminal-mobile.png),
[borderless authority controls](screenshots/icon-first-authority.png),
[icon-first terminal configuration](screenshots/icon-first-host-setup.png),
[secure code hardware](screenshots/hardware-code-auth.png),
[borderless role instruments](screenshots/icon-first-role-join.png),
[icon-first host assembly](screenshots/icon-first-host-lobby.png),
[physical shared-station runtime](screenshots/runtime-hardware-shared.png),
[mechanical facilitator controls](screenshots/runtime-hardware-facilitator.png),
[private field instrument](screenshots/runtime-hardware-player.png),
[mobile player instrument](screenshots/runtime-hardware-player-mobile.png),
[physical consequence reveal](screenshots/runtime-hardware-consequence.png),
[stage-specific cinematic consequence](screenshots/runtime-realistic-modal.png),
[collision-free short-screen telemetry](screenshots/runtime-readable-telemetry.png),
[prominent live-stage HUD](screenshots/runtime-stage-header.png),
[playable Outside Run](screenshots/game-logic-outside-run.png),
[mobile Outside Run](screenshots/game-logic-outside-run-mobile.png),
[facilitator game controls](screenshots/game-logic-facilitator.png),
[cinematic Clean Rescue](screenshots/clean-rescue-final.png),
[short-screen Clean Rescue](screenshots/clean-rescue-short.png),
and [mobile Clean Rescue](screenshots/clean-rescue-mobile.png).
