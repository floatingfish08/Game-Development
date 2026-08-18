import test from "node:test";
import assert from "node:assert/strict";

import {
  addPlayer,
  applyAction,
  authorize,
  createSession,
  expireIfNeeded,
  publicState,
} from "../server/game-engine.js";

const facilitator = { kind: "facilitator" };
const rolesByCount={
  2:["lead","signal"],
  4:["lead","signal","systems","operations"],
  5:["lead","signal","systems","operations","field"],
  6:["lead","signal","systems","operations","field","protocol"],
  7:["lead","signal","systems","operations","field","protocol","comms"],
};
function connectCrew(session){
  for(const role of rolesByCount[session.playerCount])if(!session.players[role])addPlayer(session,{name:`QA ${role}`,role});
}

function startShift(session){
  applyAction(session,facilitator,"ACK_SAFETY");
  applyAction(session,facilitator,"START_GAME");
}

function update(session, payload) {
  applyAction(session, facilitator, "UPDATE_DRAFT", payload);
}

function commitAndAdvance(session) {
  applyAction(session, facilitator, "COMMIT_STAGE");
  if (session.stage === 4 && session.fieldRun?.active) for (let move = 0; move < 3; move++) applyAction(session, facilitator, "FIELD_MOVE", { move: "observe" });
  if (session.stage === 6 && session.stageStatus === "live") applyAction(session, facilitator, "COMMIT_STAGE");
  if (session.stage < 7 && session.stageStatus === "resolved") applyAction(session, facilitator, "ADVANCE_STAGE");
}

function confirmEnding(session) {
  assert.equal(session.stageStatus, "resolved");
  assert.ok(session.pendingEnding);
  applyAction(session, facilitator, "CONFIRM_ENDING");
}

test("complete strong path reaches Clean Rescue with accepted correction", () => {
  const session = createSession({ code: "TEST01", playerCount: 7 });
  for (const role of ["lead", "signal", "systems", "operations", "field", "protocol", "comms"]) addPlayer(session, { role, name: role });

  startShift(session);
  assert.equal(session.stage, 1);
  update(session, { holds: ["mara", "voice", "road"] });
  commitAndAdvance(session);

  update(session, { powered: ["buffer", "military", "lock"] });
  commitAndAdvance(session);

  update(session, { voice: "replay", bulletin: "discard", correction: "preserve" });
  commitAndAdvance(session);
  assert.equal(session.outcomes.signalQuality, 3);

  update(session, { destination: "conduit", runner: "operations", abort: "18 ppm or rapid rise" });
  commitAndAdvance(session);
  assert.ok(session.global.evidence.includes("Conduit beneath station"));

  update(session, { procedure: "controlled", respirator: "mara", watcher: "protocol" });
  commitAndAdvance(session);
  assert.equal(session.global.mara, "located");
  assert.equal(session.global.lockKnowledge, 2);

  update(session, { invalid: "operational", human: "mara_below", hazard: "lock_air", evidence: "auto", request: "rescue" });
  commitAndAdvance(session);
  assert.equal(session.global.correction, "accepted");

  update(session, { lock: "stabilise", lockLead: "systems", signal: "transmit", signalLead: "signal", people: "supply", peopleLead: "field" });
  applyAction(session, facilitator, "COMMIT_STAGE");
  assert.equal(session.finaleRound, 2);
  assert.equal(session.status, "stage");
  update(session, { lock: "hold", lockLead: "protocol", signal: "transmit", signalLead: "comms", people: "extract", peopleLead: "operations" });
  applyAction(session, facilitator, "COMMIT_STAGE");
  confirmEnding(session);
  assert.equal(session.status, "ending");
  assert.equal(session.ending.title, "CLEAN RESCUE");
  assert.equal(session.ending.lockControlled, true);
  assert.equal(session.ending.correctionAccepted, true);
});

test("weak decisions still fail forward through every stage", () => {
  const session = createSession({ code: "TEST02", playerCount: 6 });
  connectCrew(session);
  startShift(session);

  update(session, { holds: ["event", "public", "road"] }); commitAndAdvance(session);
  update(session, { powered: ["road", "lower", "buffer"] }); commitAndAdvance(session);
  update(session, { voice: "discard", bulletin: "replay", correction: "preserve", priority: "bulletin" }); commitAndAdvance(session);
  update(session, { destination: "inside", abort: "withdraw if unsafe" }); commitAndAdvance(session);
  update(session, { procedure: "delay", respirator: "reserve", watcher: "lead" }); commitAndAdvance(session);
  update(session, { invalid: "weather", human: "unknown", hazard: "storm", evidence: "voice", request: "ack" }); commitAndAdvance(session);
  update(session, { lock: "leave", lockLead: "lead", signal: "silent", signalLead: "lead", people: "verify", peopleLead: "lead" });
  applyAction(session, facilitator, "COMMIT_STAGE");
  assert.equal(session.finaleRound, 2);
  update(session, { lock: "leave", signal: "silent", people: "verify" });
  applyAction(session, facilitator, "COMMIT_STAGE");
  confirmEnding(session);

  assert.equal(session.stage, 7);
  assert.equal(session.status, "ending");
  assert.equal(session.ending.title, "STATION LOSS");
  assert.equal(session.global.official, 3);
});

test("two-player mode completes all seven stages with combined roles", () => {
  const session = createSession({ code: "DUO001", playerCount: 2 });
  const command = addPlayer(session, { name: "Avery", role: "lead" });
  addPlayer(session, { name: "Noor", role: "signal" });
  assert.throws(() => addPlayer(session, { name: "Extra", role: "systems" }), /not available/);

  startShift(session);
  update(session, { holds: ["mara", "voice", "road"] }); commitAndAdvance(session);
  update(session, { powered: ["buffer", "military", "lock"] }); commitAndAdvance(session);
  update(session, { voice: "replay", bulletin: "discard", correction: "preserve" }); commitAndAdvance(session);
  update(session, { destination: "conduit", runner: "lead", abort: "18 ppm or rapid rise" }); commitAndAdvance(session);
  update(session, { procedure: "controlled", respirator: "mara", watcher: "signal" }); commitAndAdvance(session);
  update(session, { invalid: "operational", human: "mara_below", hazard: "lock_air", evidence: "auto", request: "rescue" }); commitAndAdvance(session);
  update(session, { lock: "stabilise", lockLead: "signal", signal: "transmit", signalLead: "signal", people: "supply", peopleLead: "lead" });
  applyAction(session, facilitator, "COMMIT_STAGE");
  update(session, { lock: "hold", lockLead: "lead", signal: "transmit", signalLead: "signal", people: "extract", peopleLead: "lead" });
  applyAction(session, facilitator, "COMMIT_STAGE");
  confirmEnding(session);

  assert.equal(session.status, "ending");
  assert.equal(session.ending.title, "CLEAN RESCUE");
  const state = publicState(session, authorize(session, command.token));
  assert.deepEqual(Object.keys(state.roles), ["lead", "signal"]);
  assert.equal(state.roles.lead.name, "Command & Field");
  assert.match(state.privateCard.body, /OPS —|FIELD —/);
});

test("private state exposes only the authenticated role card", () => {
  const session = createSession({ code: "TEST03" });
  const signal = addPlayer(session, { name: "Sam", role: "signal" });
  connectCrew(session);
  startShift(session);
  const viewer = authorize(session, signal.token);
  const state = publicState(session, viewer);
  assert.equal(state.viewer.role, "signal");
  assert.match(state.privateCard.body, /newer than the road camera/i);
  assert.deepEqual(state.draft, {});
  assert.equal(JSON.stringify(state).includes(signal.token), false);
  assert.equal(JSON.stringify(state).includes(session.facilitatorToken), false);
});

test("Station Lead can commit but another player cannot", () => {
  const session = createSession({ code: "TEST04" });
  const lead = addPlayer(session, { name: "Lee", role: "lead" });
  const field = addPlayer(session, { name: "Finn", role: "field" });
  connectCrew(session);
  startShift(session);
  applyAction(session, authorize(session, lead.token), "UPDATE_DRAFT", { holds: ["mara", "voice", "road"] });
  assert.throws(() => applyAction(session, authorize(session, field.token), "COMMIT_STAGE"), /not available/);
  applyAction(session, authorize(session, lead.token), "COMMIT_STAGE");
  assert.equal(session.stageStatus, "resolved");
});

test("timer expiry resolves the current stage and advances official pressure", () => {
  const session = createSession({ code: "TEST05" });
  connectCrew(session);
  startShift(session);
  session.clock.endAt = 10;
  assert.equal(expireIfNeeded(session, 11), true);
  assert.equal(session.stageStatus, "resolved");
  assert.equal(session.outcomes[1].expired, true);
  assert.ok(session.global.official >= 1);
});

test("role intervention is limited to once per session", () => {
  const session = createSession({ code: "TEST06" });
  const lead = addPlayer(session, { name: "Lee", role: "lead" });
  connectCrew(session);
  startShift(session);
  const viewer = authorize(session, lead.token);
  const before = session.clock.remaining;
  applyAction(session, viewer, "INTERVENTION");
  assert.ok(session.clock.remaining >= before + 60);
  assert.throws(() => applyAction(session, viewer, "INTERVENTION"), /not available/);
});

test("Outside Run locks a bounded plan, accepts three guidance bursts, and resolves runner moves", () => {
  const session = createSession({ code: "FIELD1", playerCount: 7 });
  const operations = addPlayer(session, { name: "Omar", role: "operations" });
  const signal = addPlayer(session, { name: "Sia", role: "signal" });
  connectCrew(session);
  startShift(session);
  update(session, { holds: ["mara", "voice", "road"] }); commitAndAdvance(session);
  update(session, { powered: ["air", "lower", "lock"] }); commitAndAdvance(session);
  update(session, { voice: "replay", bulletin: "discard", correction: "preserve", priority: "voice" }); commitAndAdvance(session);
  update(session, { runner: "operations", destination: "conduit", abort: "18 ppm or rapid rise" });
  applyAction(session, facilitator, "COMMIT_STAGE");
  assert.equal(session.fieldRun.step, 1);
  for (const message of ["Check ground", "Trace the label", "Withdraw on rise"]) applyAction(session, authorize(session, signal.token), "FIELD_GUIDANCE", { message });
  assert.throws(() => applyAction(session, authorize(session, signal.token), "FIELD_GUIDANCE", { message: "Fourth" }), /three guidance/);
  assert.throws(() => applyAction(session, authorize(session, signal.token), "FIELD_MOVE", { move: "observe" }), /assigned runner/);
  for (let step = 0; step < 3; step++) applyAction(session, authorize(session, operations.token), "FIELD_MOVE", { move: "observe" });
  assert.equal(session.stageStatus, "resolved");
  assert.ok(session.global.evidence.includes("Conduit beneath station"));
  assert.equal(session.global.respirator, "partial");
  assert.equal(session.decisions[4].run.meterLimit,18);
  assert.ok(session.decisions[4].run.meterPpm<18);
});

test("a rejected first correction opens one shortened retry before resolving", () => {
  const session = createSession({ code: "RETRY1" });
  session.status = "stage"; session.stage = 6; session.stageStatus = "live";
  session.clock = { duration: 360, remaining: 360, running: false, endAt: null };
  session.draft = { invalid: "weather", human: "unknown", hazard: "storm", evidence: "voice", request: "ack" };
  applyAction(session, facilitator, "COMMIT_STAGE");
  assert.equal(session.stageStatus, "live");
  assert.equal(session.correctionAttempt, 2);
  assert.equal(session.clock.remaining, 270);
  applyAction(session, facilitator, "UPDATE_DRAFT", { invalid: "operational", human: "mara_below", hazard: "lock_air", evidence: "status", request: "rescue" });
  applyAction(session, facilitator, "COMMIT_STAGE");
  assert.equal(session.stageStatus, "resolved");
  assert.equal(session.global.correction, "conditional");
});

test("the finale is previewed before the facilitator confirms the final record", () => {
  const session = createSession({ code: "FINAL1", playerCount: 2 });
  session.status="stage";session.stage=7;session.stageStatus="live";session.clock={duration:540,remaining:540,running:false,endAt:null};
  session.global.systems=["lock"];session.global.lockKnowledge=2;session.global.correction="accepted";
  session.draft={lock:"stabilise",lockLead:"signal",signal:"transmit",signalLead:"signal",people:"supply",peopleLead:"lead"};
  applyAction(session,facilitator,"COMMIT_STAGE");
  update(session,{lock:"hold",lockLead:"lead",signal:"maintain",signalLead:"signal",people:"extract",peopleLead:"lead"});
  applyAction(session,facilitator,"COMMIT_STAGE");
  assert.equal(session.status,"stage");
  assert.equal(session.pendingEnding.title,"CLEAN RESCUE");
  confirmEnding(session);
  assert.equal(session.status,"ending");
});

test("facilitator can mark absence and reassign a connected operator with an audit trail", () => {
  const session=createSession({code:"ADMIN1",playerCount:7});
  const player=addPlayer(session,{name:"Rae",role:"operations"});
  applyAction(session,facilitator,"SET_ABSENT",{role:"operations",absent:true});
  assert.equal(session.absentRoles.operations,true);
  assert.throws(()=>applyAction(session,authorize(session,player.token),"INTERVENTION"),/observer mode/);
  applyAction(session,facilitator,"REASSIGN_PLAYER",{from:"operations",to:"field"});
  assert.equal(authorize(session,player.token).role,"field");
  assert.match(session.history.at(-1).text,/reassigned/);
});

test("a shift cannot start until every configured terminal is connected", () => {
  const session=createSession({code:"CREW01",playerCount:2});
  addPlayer(session,{name:"Avery",role:"lead"});
  assert.throws(()=>applyAction(session,facilitator,"START_GAME"),/all 2 crew terminals/);
  addPlayer(session,{name:"Noor",role:"signal"});
  assert.throws(()=>applyAction(session,facilitator,"START_GAME"),/participant-care briefing/);
  applyAction(session,facilitator,"ACK_SAFETY");
  applyAction(session,facilitator,"START_GAME");
  assert.equal(session.stage,1);
});

test("server rejects forged and incomplete decision payloads", () => {
  const session=createSession({code:"RULES1",playerCount:2});connectCrew(session);startShift(session);
  assert.throws(()=>update(session,{holds:["mara","voice","forged"]}),/invalid/);
  update(session,{holds:["mara","voice"]});
  assert.throws(()=>applyAction(session,facilitator,"COMMIT_STAGE"),/exactly three audit holds/);
  update(session,{holds:["mara","voice","road"]});commitAndAdvance(session);
  update(session,{powered:["buffer","lock","air"]});commitAndAdvance(session);
  update(session,{voice:"replay",bulletin:"discard",correction:"discard"});
  assert.throws(()=>applyAction(session,facilitator,"COMMIT_STAGE"),/exactly three signal slots/);
});

test("role interventions apply distinct persistent effects", () => {
  const session=createSession({code:"ROLEFX",playerCount:7});connectCrew(session);startShift(session);
  const protocol=authorize(session,session.players.protocol.token),comms=authorize(session,session.players.comms.token),systems=authorize(session,session.players.systems.token);
  applyAction(session,protocol,"INTERVENTION");
  applyAction(session,comms,"INTERVENTION");
  applyAction(session,systems,"INTERVENTION");
  assert.equal(session.resources.safetyGuard,1);
  assert.equal(session.global.trust,1);
  assert.ok(session.global.evidence.includes("Dependency traced"));
  assert.match(session.interventionFeedback.protocol,/SAFETY CONDITION/);
});

test("four- and five-player configurations expose only valid combined terminals", () => {
  const four=createSession({code:"FOUR01",playerCount:4});connectCrew(four);
  assert.deepEqual(Object.keys(publicState(four,facilitator).roles),rolesByCount[4]);
  assert.equal(publicState(four,facilitator).roles.lead.name,"Command & Protocol");
  assert.equal(publicState(four,facilitator).roles.operations.name,"Operations & Field");
  assert.throws(()=>addPlayer(four,{name:"Extra",role:"field"}),/not available/);
  startShift(four);
  const fourLead=publicState(four,authorize(four,four.players.lead.token));
  assert.match(fourLead.privateCard.body,/LEAD —/);
  assert.match(fourLead.privateCard.body,/PRO —/);
  assert.doesNotMatch(fourLead.privateCard.body,/COMMS —/);
  assert.deepEqual(fourLead.debrief.roleMap.lead.areas,["Self-readiness","Risk and guardrails"]);
  four.stage=6;four.stageStatus="resolved";
  applyAction(four,facilitator,"ADVANCE_STAGE");
  assert.equal(four.draft.peopleLead,"operations");

  const five=createSession({code:"FIVE01",playerCount:5});connectCrew(five);startShift(five);
  assert.equal(publicState(five,facilitator).roles.field.name,"Field & Protocol");
  assert.match(publicState(five,authorize(five,five.players.field.token)).privateCard.body,/FIELD —|PRO —/);
  assert.doesNotMatch(publicState(five,authorize(five,five.players.lead.token)).privateCard.body,/COMMS —/);
});

test("the shared signal becomes less useful when early evidence is discarded", () => {
  const preserved=createSession({code:"SIG001",playerCount:2});connectCrew(preserved);startShift(preserved);
  update(preserved,{holds:["mara","voice","road"]});commitAndAdvance(preserved);
  update(preserved,{powered:["buffer","military","lock"]});commitAndAdvance(preserved);
  update(preserved,{voice:"replay",bulletin:"discard",correction:"preserve",priority:"voice"});commitAndAdvance(preserved);
  const good=publicState(preserved,facilitator).signalTransmission;

  const lost=createSession({code:"SIG002",playerCount:2});connectCrew(lost);startShift(lost);
  update(lost,{holds:["event","public","road"]});commitAndAdvance(lost);
  update(lost,{powered:["road","lower","air"]});commitAndAdvance(lost);
  update(lost,{voice:"discard",bulletin:"replay",correction:"preserve",priority:"bulletin"});commitAndAdvance(lost);
  const bad=publicState(lost,facilitator).signalTransmission;
  assert.ok(good.integrity>bad.integrity);
  assert.match(good.transcript,/beneath station|not road|under/i);
  assert.match(bad.transcript,/dropout|carrier loss|source header missing/i);
});

test("finale distinguishes costly rescue and joined-below outcomes", () => {
  const finale=(code,{lock,people})=>{
    const session=createSession({code,playerCount:4});
    session.status="stage";session.stage=7;session.stageStatus="live";session.clock={duration:540,remaining:540,running:false,endAt:null};
    session.global.systems=lock?["lock"]:[];session.global.lockKnowledge=lock?2:0;session.global.correction="accepted";
    session.draft={lock:lock?"stabilise":"leave",lockLead:"systems",signal:"transmit",signalLead:"signal",people,peopleLead:"operations"};
    applyAction(session,facilitator,"COMMIT_STAGE");
    applyAction(session,facilitator,"COMMIT_STAGE");
    return session.pendingEnding;
  };
  const costly=finale("COST01",{lock:true,people:"supply"});
  assert.equal(costly.title,"COSTLY RESCUE");
  assert.equal(costly.rescueOutcome,"RESCUE PATH ESTABLISHED");
  assert.equal(costly.survivalOutcome,"CREW SURVIVES");
  const joined=finale("JOIN01",{lock:false,people:"extract"});
  assert.equal(joined.title,"JOINED BELOW");
  assert.equal(joined.lockControlled,false);
});

test("six-step debrief is synchronized, private-safe, and captures each first action", () => {
  const session=createSession({code:"DBRF01",playerCount:2});
  const lead=addPlayer(session,{name:"Avery",role:"lead"});
  addPlayer(session,{name:"Noor",role:"signal"});
  session.status="ending";session.ending={title:"COSTLY RESCUE"};
  applyAction(session,facilitator,"SET_DEBRIEF_STEP",{step:5});
  applyAction(session,facilitator,"SAVE_DEBRIEF_NOTE",{step:5,note:"The vendor confidence label hid a human verification gap."});
  const player=authorize(session,lead.token);
  applyAction(session,player,"SAVE_FIRST_STEP",{note:"Ask who verified the weekly automated safety status."});
  const facilitatorState=publicState(session,facilitator),playerState=publicState(session,player);
  assert.equal(facilitatorState.debrief.steps.length,6);
  assert.equal(facilitatorState.debrief.currentStep,5);
  assert.match(facilitatorState.debrief.notes[5],/confidence label/);
  assert.equal(playerState.debrief.notes,undefined);
  assert.match(playerState.debrief.firstSteps.lead.note,/who verified/);
  assert.throws(()=>applyAction(session,player,"SET_DEBRIEF_STEP",{step:6}),/not available/);
});

test("readiness lenses and prototype viability evidence remain facilitator-controlled", () => {
  const session=createSession({code:"PILOT1",playerCount:2});
  const lead=addPlayer(session,{name:"Avery",role:"lead"});addPlayer(session,{name:"Noor",role:"signal"});
  session.status="ending";session.ending={title:"FILED SAFE"};
  applyAction(session,facilitator,"TOGGLE_PROFILE_SIGNAL",{id:"practical_sceptic"});
  applyAction(session,facilitator,"SAVE_PLAYTEST",{ratings:{clarity:4,thrill:4,survival:3,ai_alignment:2,facilitation:3,role_value:4,remote_fit:3},disposition:"kill_reframe",notes:"Players enjoyed the horror but could not explain the workplace transfer."});
  const facilitatorState=publicState(session,facilitator),playerState=publicState(session,authorize(session,lead.token));
  assert.deepEqual(facilitatorState.debrief.profileSignals,["practical_sceptic"]);
  assert.equal(facilitatorState.playtest.criteria.length,7);
  assert.equal(facilitatorState.playtest.needsReframe,true);
  assert.equal(playerState.playtest,undefined);
});

test("Outside Run air meter forces withdrawal at the hard exposure limit", () => {
  const session=createSession({code:"METER1",playerCount:4});connectCrew(session);
  session.status="stage";session.stage=4;session.stageStatus="live";session.global.upperAir=1;
  session.clock={duration:360,remaining:360,running:false,endAt:null};
  session.draft={runner:"operations",destination:"conduit",abort:"18 ppm or rapid rise"};
  applyAction(session,facilitator,"COMMIT_STAGE");
  assert.equal(session.fieldRun.meterLimit,18);
  applyAction(session,facilitator,"FIELD_MOVE",{move:"advance"});
  applyAction(session,facilitator,"FIELD_MOVE",{move:"advance"});
  assert.equal(session.stageStatus,"resolved");
  assert.equal(session.fieldRun.forcedAbort,true);
  assert.ok(session.fieldRun.meterPpm>=18);
  assert.equal(session.global.respirator,"spent");
  assert.equal(publicState(session,facilitator).environment.roadStatus,"FLOODED / SHORT WINDOW");
});

test("contribution metrics record reports, role overrides, guidance, and field moves", () => {
  const session=createSession({code:"METR01",playerCount:4});connectCrew(session);startShift(session);
  const lead=authorize(session,session.players.lead.token);
  applyAction(session,lead,"REPORT",{recommendation:"Hold Mara and voice",note:"Two inferred labels lack a current source."});
  applyAction(session,lead,"INTERVENTION");
  assert.equal(session.metrics.contributions.lead.reports,1);
  assert.equal(session.metrics.contributions.lead.interventions,1);
  assert.deepEqual(session.metrics.contributions.lead.stages,[1]);
});
