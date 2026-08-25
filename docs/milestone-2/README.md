# Milestone 2: UX/UI Prototype

Status: **implemented and ready for browser review**

## What is implemented

The prototype validates the three-view product architecture and the complete
Stage 3 interaction loop:

- atmospheric Blackout Ridge lobby;
- shared station console;
- seven private role terminals, with six-player mode support;
- facilitator dashboard;
- six-minute synchronized countdown with pause/resume and time recovery;
- role-specific evidence and assessment submission;
- Station Lead three-slot signal allocation;
- deterministic consequence states from lost signal to full correlation;
- Signal Analyst's Recover Fragment intervention;
- contextual facilitator hint;
- session event log, reset, and cross-tab synchronization;
- responsive role-terminal layout and reduced-motion support.
- eight cinematic game images integrated into the lobby, shared console, private
  evidence terminals, and a dedicated visual archive.

## Run locally

From the project directory:

```bash
npm run dev
```

Then visit [http://localhost:4173](http://localhost:4173). Open the shared console,
facilitator view, and several role terminals in separate tabs. All tabs in the
same browser profile share prototype state through local storage and a broadcast
channel.

The visual archive is available at
[http://localhost:4173/?view=gallery](http://localhost:4173/?view=gallery). Image
usage and prompt summaries are documented in
[`prototype/assets/images/README.md`](../../prototype/assets/images/README.md).

Run the automated state tests with:

```bash
npm test
npm run check
```

## Suggested review script

1. Open the shared console and facilitator dashboard from the lobby.
2. Open Station Lead, Signal Analyst, Systems Engineer, and Field Liaison terminals.
3. Start the challenge from the facilitator dashboard.
4. Submit different role assessments.
5. On the Station Lead terminal, set RX-04 to **Replay & rebuild**, CV-PUBLIC to
   **Discard**, and AUX-04 to **Preserve raw**.
6. Commit the allocation and confirm every view displays the correlated outcome.
7. Reset, commit a weak allocation, and use **Recover Fragment** from the Signal
   Analyst terminal to confirm the outcome improves by one level.

## Prototype boundary

This is intentionally a UX validation prototype. Synchronization is local to one
browser profile; it does not yet include a multiplayer server, authentication,
database persistence, remote session codes, or production security. Those belong
to Milestone 3 after the screen hierarchy and interaction loop are approved.

The interface uses code-native CSS/SVG-style visuals and contains no external
assets or runtime dependencies, which makes it quick to review and revise.

## Review captures

- [Lobby](screenshots/blackout-ridge-lobby.webp)
- [Shared station console](screenshots/blackout-ridge-shared.webp)
- [Signal Analyst terminal](screenshots/blackout-ridge-player.webp)
- [Facilitator dashboard](screenshots/blackout-ridge-facilitator.webp)
- [Mobile-width Field Liaison terminal](screenshots/blackout-ridge-mobile.webp)

## Acceptance mapping

| Milestone 2 requirement | Implementation |
|---|---|
| Shared Blackout Ridge interface | Shared stage heading, sources, waveform, status tracks, role activity, consequence, and next-stage teaser |
| Individual role terminals | Seven distinct evidence views, assessments, role identity, and Signal Analyst intervention |
| Facilitator dashboard | Run controls, player mode, hint, report monitor, allocation monitor, state, audit, consequence, and reset |
| One complete interactive challenge | Briefing → live timer → reports → three-slot allocation → deterministic consequence |
| Unequal information validation | Each role receives one unique source and prompt; only summary readiness is public |
| Earlier-choice consequence | Allocation quality changes transcript, evidence ledger, and Outside Run burden |
| Desktop and mobile-width roles | Responsive terminal layout at 720px and 1050px breakpoints |
| Accessibility baseline | Keyboard focus, semantic controls, text alternatives, transcripts, reduced-motion mode, no color-only status |
