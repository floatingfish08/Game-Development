# Blackout Ridge

Blackout Ridge is a full-screen, live-facilitated multiplayer decision game for
2 or 4–7 players. It is designed as a cinematic emergency-station experience—not a
content website. Voice conversation happens in the room or on a call while the
game supplies a shared station display, private role instruments, timed
decisions, consequences, and a dedicated facilitator console.

The original concept is in
`blackout_ridge_game_designer_viability_brief_v0_7 (1).docx`.

## Run the game

Requires Node.js 20 or newer. No package installation is needed.

```bash
npm run dev
```

Open `http://localhost:4173`, create a session, copy the crew link, and open the
shared display on the room screen. Each player joins from their own browser and
chooses one unclaimed role.

## Implemented system

- Seven playable stages with server-authoritative decisions and fail-forward
  consequences.
- An escalating narrative spine: each consequence explains why the next
  emergency happens instead of presenting stages as disconnected puzzles.
- Live decision previews that separate preserved capabilities, costs, warnings,
  and commit readiness before the crew locks in a choice.
- Plain-language Participant Notes structured as what you know, confidence,
  why it matters, and what to say aloud.
- A playable three-move Outside Run with an assigned runner, three private
  guidance bursts, exposure, abort, findings, and respirator consequences.
- A two-attempt structured emergency correction, including the shortened,
  worsening retry after a rejected first transmission.
- Playbook role configurations for 4–7 players, plus a two-player variant. Combined
  terminals preserve every responsibility, private evidence, and one-use role override.
- Shared cinematic station HUD, private player instruments, and a game-master
  facilitator console.
- Live synchronization through server-sent events.
- Session codes, private role tokens, reconnect support, and persisted sessions.
- Timers, pause/resume, time extensions, safety pause, facilitator prompts, and
  an event record.
- A two-round three-lane finale with named responsibility assignments, parallel
  rescue/survival stakes, seven outcome records, facilitator preview, and confirmation.
- Deterministic propagation of held defaults, powered circuits, preserved
  signals, physical findings, lock knowledge, trust, air pressure, safeguards,
  and official-status pressure through all seven stages.
- Facilitator role recovery controls, temporary observer mode, card re-send,
  audited reassignment, contextual hints, and a complete decision record.
- Required participant-care briefing, synchronized six-step debrief, facilitator
  notes, per-player workplace first steps, contribution metrics, and JSON export.
- Explicit chemical-air, flood, storm, cordon, respirator, and false-status
  telemetry; the Outside Run includes a rising air meter and forced cutoff.
- Distinct role-map and readiness-behaviour lenses, downloadable private role
  briefs, and a seven-criterion pilot record with the playbook's reframe gate.
- Opt-in procedural station ambience and interface cues generated in-browser.
- Desktop and mobile layouts; all play surfaces stay inside the viewport.

## Quality checks

```bash
npm run check
npm test
```

The automated suite exercises strong and weak complete-game paths, role privacy,
authority rules, timer expiry, intervention limits, and the WebP-only raster
asset policy.

Milestone summaries and evidence are consolidated in
[`docs/reports`](docs/reports). The implemented runtime is documented in
[`docs/full-system/README.md`](docs/full-system/README.md), with a practical
[`facilitator guide`](docs/full-system/FACILITATOR-GUIDE.md) and
[`playbook coverage matrix`](docs/full-system/PLAYBOOK-COVERAGE.md).
The complete documentation map and regeneration commands are in
[`docs/README.md`](docs/README.md).

## Deployment boundary

The current server is complete for local play, workshops, and controlled remote
testing. It stores sessions in a local JSON file and runs as one Node process.
A public production deployment should add TLS, a managed datastore, rate
limiting, observability, and an explicit data-retention policy.
