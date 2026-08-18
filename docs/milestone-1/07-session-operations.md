# How a Session Runs

This is the practical operating model. It answers: how the facilitator opens a
game, how members join, what problem they solve in each stage, how the
facilitator controls the room, and how results are marked.

There is **no personal points score**. The app records team decisions, station
state, and a named ending. The facilitator marks observation in debrief, not
exam marks.

## 1. How the facilitator creates the game

Voice stays on Teams or Zoom. The game is a separate browser app.

1. The facilitator opens the Blackout Ridge app and chooses **Host / Create
   session**.
2. They pick crew size: **6 or 7** for the first commercial sessions (4 or 5
   later, using combined roles).
3. The app creates a session and gives them:
   - a short **session code** (for example `RIDGE-4K`);
   - a **crew join link**;
   - a **shared display link** for the room / screen-share;
   - a private **facilitator console** (they keep this tab).
4. They start the Teams/Zoom call, paste the join link in chat, and open the
   shared display on the big screen or by screen-sharing that tab.
5. They wait until every required role shows **Connected**, read the safety
   note, run a one-line role check, then press **Start shift**.

The game cannot start until every configured terminal is connected and the
facilitator has acknowledged participant care.

## 2. How members join

Each player uses their own laptop or tablet and a modern browser. They also stay
on the Teams/Zoom call so they can talk.

1. Open the crew join link (or type the session code on the home screen).
2. Enter a display name.
3. Choose one **unclaimed role**. First come, first served. The facilitator can
   reassign later if needed.
4. Their browser becomes their **private terminal**. They only see their own
   evidence, their one special action, and the shared station facts everyone is
   allowed to see.
5. If they refresh or drop off, they reopen the same link. The app restores the
   same role and the same information.

One extra person may open the **shared display** on a TV. That screen has no
private clues.

### What each person is looking at

| Person | Screen | What they do |
|---|---|---|
| Facilitator | Facilitator console | Start, pause, hint, safety, recover players, confirm ending, run debrief |
| All players (room TV or screen-share) | Shared station console | Status tracks, official traffic, timer, committed team decision, consequence |
| Each player | Private role terminal | Their clue card, their input, their one-use intervention |
| Station Lead (also a player) | Private terminal + they submit | They commit the team’s choice when the crew is ready |

Players may read their private card aloud or paraphrase it. Secrecy is optional.
The design makes them *need* each other, not *forbid* sharing.

## 3. Problems they have to solve

This is not seven separate quizzes. It is **one emergency** in seven short
decisions. Every stage uses the same loop:

1. The shared screen shows a new incident.
2. Each role gets a different short card.
3. They talk on Teams/Zoom.
4. The **Station Lead** submits one team decision.
5. The app shows a consequence and stores it for later.

If time runs out, the app still resolves the current legal draft. Nobody is
eliminated. The story gets harder, not shorter.

| Stage | Time | The problem | The team decision |
|---|---:|---|---|
| 1. Challenge the Handover | 4 min | The station is auto-filling five handover defaults. Some are dangerous. | Hold **3 of 5** items for human check. The other two become working assumptions. |
| 2. Keep the Station Alive | 5 min | Backup power cannot run every circuit. | Power **Main Relay + 3 optional circuits**. What they leave off has a later cost. |
| 3. Decide What to Trust | 6 min | Clean official traffic and a strange broken signal overlap. | Spend **3 bandwidth slots**: preserve, replay, quarantine, or discard. |
| 4. Test Lower Route | 6 min | Is “Lower Route” the flooded downhill road? One mask, five-minute window. | Choose a **runner, destination, abort rule**; runner makes 3 moves. |
| 5. Open the Buried Station | 7 min | Hatch to the old hold. Opening it wrong can trap people. | Choose **how to open**, who watches the override, where the respirator goes. |
| 6. Build the Truth | 6 min | Cordon Control will not believe a shout. | Build a **5-part emergency correction**. One shorter retry if rejected. |
| 7. Survive the Correction | 9 min | Hold is sealing; false status is filing. | Two rounds: assign people to **Lock / Signal / People**. |

### What “solving” means

They are not hunting a secret code. A good stage looks like:

- people **share** the one fact only they can see;
- they **challenge** a clean label;
- they make **one bounded choice**;
- the next screen is **visibly different** because of that choice.

A poor stage still continues. Later audio is worse, the mask is spent, Cordon
does not trust them, or the lock is harder. That is fail-forward.

### What each role is doing while they solve

Everyone sees the shared problem. Each role brings one kind of private help:

| Role | Their job while the crew talks | Their one special action (once per session) |
|---|---|---|
| Station Lead | Keep time, hear disagreement, **submit the decision** | Hold the Clock (+60 seconds; a pressure track then advances) |
| Signal Analyst | Source, timestamp, whether a signal is real or noise | Recover Fragment (restore one discarded/degraded piece) |
| Systems Engineer | What a status is actually measuring | Trace Dependency (reveal the subsystem behind one status) |
| Operations Officer | Bounded physical plan: route, timing, abort | Controlled Test (preview the **cost**, not the result) |
| Field Liaison | Mara, people, what the log left out | Human Check (force a record to show the named person behind it) |
| Protocol Officer | Rules, safety, what the receiver will accept | Safety Condition (attach a safeguard; reduces worst physical cost) |
| Comms Officer (7th) | Whether outsiders will understand / believe the message | Request Readback (exact receiver interpretation of one sent message) |

Major conclusions always need **at least two roles**. Nobody’s screen contains
the whole answer.

## 4. How the facilitator controls them

The facilitator does **not** play a role and does **not** calculate scores. They
control **pace, safety, recovery, and debrief**.

### Before play

- Choose crew size and create the session
- Confirm everyone connected
- Safety / off-ramp
- Start shift (unlocks Stage 1)

### During each stage

| Control | When to use it |
|---|---|
| **Spoken cue** (≤ 30 seconds) | Open the stage, then stop talking |
| **Pause / Resume** | Technical mess, confusion, bathroom, late joiner |
| **+30 seconds** | Connection failure only — not to rescue a slow debate |
| **Hint** (one per stage, in-world wording) | Room is stuck on the *rule*, not on the *story* |
| **Ask Station Lead to commit** | Talk is circular |
| **Advance stage** | Only if the app failed to move after a valid commit (recovery) |

Halfway through a clock, and again at 30 seconds, the app (or facilitator)
warns time. When the clock hits zero, the app resolves the current legal draft.

### People problems

| Control | When to use it |
|---|---|
| **Re-send card** | Player says their clue did not appear |
| **Reassign role** | Wrong person took a seat; or a player left |
| **Mark absent / observer** | Someone needs to step out; remaining crew continue |
| **Safety pause** | Distress. Clocks stop. All screens go neutral. No story pressure. |
| **Override decision + audit note** | App recorded the wrong click. Visible in the log. Not for “make them win”. |

### What the facilitator does **not** do

- Adjudicate who is “right”
- Secretly change the ending to be nicer
- Explain `LOWER ROUTE`, Lark Shift, or the AI lesson during play
- Read private cards for players unless a card is shared after a disconnect

## 5. How results are marked (not a scoreboard)

Players are **not** given 0–100 marks, stars, or a winner. v0.7 is explicit:
people are not points, and the game is not a psychometric test.

The app still **records** everything so the facilitator can run debrief and so
the ending is fair and repeatable.

### What the app tracks automatically

**Three shared tracks** (everyone can see the words, not a hidden number):

| Track | Meaning | Labels |
|---|---|---|
| Upper Air | How unsafe the surface cabin is | Stable → Trace → Unsafe → Critical |
| External Trust | Whether Cordon will act on Ridge traffic | Unverified → Heard → Credible |
| Official Status | How close a false calm label is to becoming official | Drafting → Repeating → Hardening → Filed |

**Hidden but stored:** which circuits were powered, whether the signal was
preserved, whether Lower Route is still assumed to be a road, respirator use,
lock knowledge, Mara verified or not, correction accepted/conditional/rejected.

**Stage 6 correction** is the only place that uses a simple checklist (not a
player grade):

- 5–6 required parts present → **Accepted**
- 3–4 → **Conditional** (finale must supply the missing proof)
- 0–2 → **Rejected** (one shorter retry, then the finale)

**Stage 7 ending** is calculated from two yes/no axes plus human modifiers:

- Was the **lock** controlled?
- Was the **correction** accepted?
- What happened to **Mara** and to the **crew**?

That produces a named ending such as Clean Rescue, Costly Rescue, Last
Broadcast, Joined Below, Flee Ridge, Filed Safe, or Station Loss.

The facilitator **previews** that ending and **confirms** it. They may only
override if the app clearly recorded the wrong action.

### What the facilitator marks in debrief

After the freeze, the app shows a timeline. The facilitator does not score
players. They capture:

| Record | Who fills it | Purpose |
|---|---|---|
| Decision timeline | App | What the crew held, powered, preserved, tested, sent |
| Ending card | App + facilitator confirm | System status vs human reality |
| Role-map notes | Facilitator | What each role protected |
| Readiness-profile notes | Facilitator | How the *group* hesitated or acted — not a personality diagnosis |
| First-step line | Each player | One workplace label they will challenge |
| Playtest ratings (internal) | Facilitator / players | Clarity, thrill, survival pressure, AI lesson, facilitation load |

Optional internal playtest targets (for the designer, not shown as a player
score):

- ≥75% felt personally endangered, not only responsible for Mara
- ≥80% can explain why `OPERATIONAL` was unsafe
- ≥80% name a real workplace label to test
- gameplay about 43 minutes before debrief
- facilitator needed no more than one manual state correction

## 6. End-to-end picture

```
Facilitator creates session
        ↓
Players join on phones/laptops + stay on Teams/Zoom
        ↓
Roles claimed → safety → Start
        ↓
Stages 1–7: clue → talk → Station Lead commits → app consequence
        ↓
Facilitator pauses / hints / recovers people only as needed
        ↓
App proposes ending → facilitator confirms
        ↓
20–25 min debrief (this is where the AI-Ready Leader lesson is named)
        ↓
Export session record (timeline, ending, first steps)
```

Licensing other facilitators, payments, and public matchmaking are **not** part
of this first playable version. The owner-facilitator model above is the
product target.
