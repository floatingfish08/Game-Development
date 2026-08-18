# Milestone 1: Game Architecture and Narrative Design

Status: **ready for stakeholder review**  
Prototype audience: **6–7 players plus one facilitator**  
Delivery format: **browser app alongside Teams/Zoom**  
Target session: **70 minutes, including a 20-minute debrief**

## Design decision

The prototype will use seven story stages, but they are not seven independent
escape-room puzzles. Every stage uses the same short loop:

1. The station changes.
2. Roles receive different evidence.
3. The crew shares, challenges, and prioritises.
4. The Station Lead commits one team decision.
5. The application records the decision and shows a consequence.

This creates one continuous emergency and keeps rules teachable. No player can
solve the situation from their own screen, and no single failed decision stops
the story. Poor choices reduce later options, clarity, or safety instead.

## Package contents

| Document | Purpose |
|---|---|
| [01-game-architecture.md](01-game-architecture.md) | Product boundaries, core mechanics, experience principles, and technical shape |
| [02-seven-stage-flow.md](02-seven-stage-flow.md) | Timed stage sequence, decisions, reveals, and transitions |
| [03-roles-and-information.md](03-roles-and-information.md) | Role responsibilities, private information, and information matrix |
| [04-state-consequences-and-endings.md](04-state-consequences-and-endings.md) | Automated state model, fail-forward rules, finale resolution, and endings |
| [05-facilitator-flow.md](05-facilitator-flow.md) | Setup, live run-of-show, intervention rules, and debrief |
| [06-content-and-acceptance.md](06-content-and-acceptance.md) | Required content/assets, playtest plan, open decisions, and acceptance criteria |
| [07-session-operations.md](07-session-operations.md) | How the facilitator creates a session, how players join, problems to solve, live controls, and how results are marked |

## Protected design spine

These elements must survive later simplification:

- `LOWER ROUTE` is first understood as a road and later revealed as a legacy
  route beneath the station.
- `OPERATIONAL` describes relay health, not human safety.
- Mara Venn is a live human stake; the Lark Shift is historical proof.
- The storm triggers degraded logic, the chemical release creates the pressure
  clock, and the military cordon creates the trust problem.
- The finale requires both physical action and an evidence-backed correction.
- The system is calm, helpful, and wrong—not evil or supernatural.
- The AI-ready leadership meaning is experienced indirectly during play and
  named explicitly in the debrief.

## Explicit assumptions

- The 70-minute target means 5 minutes of briefing, 43 minutes of play, 20
  minutes of debrief, and 2 minutes of operating buffer.
- The first build supports six distinct core roles and an optional seventh role.
- One facilitator is the product target. The application automates timers,
  private reveals, state changes, and ending calculation.
- Voice conversation remains in Teams/Zoom. The game does not attempt to
  reproduce video conferencing.
- The cinematic and promotional video belong to Milestone 6, not this package.
- Licensing architecture is anticipated through session ownership and role-based
  access, but licensing and payment features are outside the first playable build.

## Approval gate

Milestone 2 can begin once the stakeholder approves the seven-stage sequence,
the six core roles, the 70-minute run time, and the two-axis finale. Anything not
listed as an open decision in the acceptance document should be treated as the
baseline design rather than rediscovered during UI production.
