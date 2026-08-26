import crypto from "node:crypto";
import { ACTIONS, DEBRIEF_STEPS, INFORMATION_JOINS, PARTICIPANT_CARE, PLAYTEST_CRITERIA, READINESS_PROFILES, ROLES, SIGNAL_TRANSMISSIONS, STAGES, roleCard, roleIdsForCount, roleMapForCount, rolesForCount } from "./game-content.js";

const codeChars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
const STAGE_HINTS = {
  1:"SOURCE AGE AVAILABLE / Which entries were observed, and which were inferred?",
  2:"DEPENDENCY SUMMARY / Protect evidence, air, trust, or control—the station cannot preserve all four.",
  3:"SIGNAL RULE / Decide what to retain. You do not need to decode every fragment.",
  4:"FIELD TEST / What single assumption is the runner testing, and what ends the run?",
  5:"CONTAINMENT RISK / A descent without an upper watcher can turn one trapped person into several.",
  6:"RECEIVER FORMAT / Invalid status. Human and location. Hazard. Evidence. Requested action.",
  7:"FINAL CLARITY / Every lane needs an owner; no action can protect people, lock, and signal alone.",
};
const token = () => crypto.randomBytes(24).toString("base64url");
export const createCode = () => Array.from({ length: 6 }, () => codeChars[crypto.randomInt(codeChars.length)]).join("");

const initialDraft = (stage, playerCount = 7) => ({
  1: { holds: [] }, 2: { powered: [] },
  3: { voice: "preserve", bulletin: "quarantine", correction: "preserve", priority: "voice" },
  4: { runner: playerCount === 2 ? "lead" : "operations", destination: "conduit", abort: "18 ppm or rapid rise" },
  5: { procedure: "controlled", respirator: "reserve", watcher: playerCount === 2 ? "signal" : playerCount === 4 ? "lead" : playerCount === 5 ? "field" : "protocol" },
  6: { invalid: "operational", human: "mara_below", hazard: "lock_air", evidence: "auto", request: "rescue" },
  7: playerCount === 2
    ? { lock: "stabilise", lockLead: "signal", signal: "transmit", signalLead: "signal", people: "supply", peopleLead: "lead" }
    : { lock: "stabilise", lockLead: "systems", signal: "transmit", signalLead: "signal", people: "supply", peopleLead: playerCount === 4 ? "operations" : "field" },
}[stage]);

const activeRoleIds = playerCount => roleIdsForCount(playerCount);

export function createSession({ code = createCode(), playerCount = 7 } = {}) {
  return {
    code, facilitatorToken: token(), revision: 0, playerCount: [2, 4, 5, 6, 7].includes(playerCount) ? playerCount : 7,
    status: "lobby", stage: 0, stageStatus: "briefing", players: {},
    clock: { duration: 0, remaining: 0, running: false, endAt: null },
    reports: {}, chatMessages: [], draft: {}, hint: null, safetyPaused: false, finaleRound: 1, finalePlans: [], fieldRun: null, correctionAttempt: 1, correctionDrafts: [],
    global: { upperAir: 0, trust: 0, official: 0, systems: [], respirator: "partial", evidence: [], lockKnowledge: 0, mara: "missing", correction: "none", lockRisk: false },
    resources: { airHandlingBuffer: 0, safetyGuard: 0, interlockOverride: "available" },
    flags: { assumptions: {}, signal: {}, physical: {}, human: { mara_missing: true }, system: {}, correction: {} },
    interventions: {}, interventionFeedback: {}, absentRoles: {}, outcomes: {}, decisions: {}, history: [], ending: null, pendingEnding: null,
    safetyBriefed: false, debrief: { currentStep: 1, notes: {}, firstSteps: {}, profileSignals: [] },
    playtest: { ratings: {}, notes: "", disposition: "unreviewed", updatedAt: null }, metrics: { startedAt: null, endedAt: null, contributions: {} },
    createdAt: Date.now(), updatedAt: Date.now(),
  };
}

function ensureSession(session) {
  session.resources ||= { airHandlingBuffer: 0, safetyGuard: 0, interlockOverride: "available" };
  session.resources.airHandlingBuffer ??= 0; session.resources.safetyGuard ??= 0; session.resources.interlockOverride ||= "available";
  session.flags ||= { assumptions: {}, signal: {}, physical: {}, human: {}, system: {}, correction: {} };
  for (const group of ["assumptions","signal","physical","human","system","correction"]) session.flags[group] ||= {};
  session.interventionFeedback ||= {}; session.absentRoles ||= {}; session.decisions ||= {}; session.finalePlans ||= []; session.chatMessages ||= [];
  session.fieldRun ??= null; session.correctionAttempt ||= 1; session.correctionDrafts ||= []; session.pendingEnding ??= null;
  session.safetyBriefed ??= false; session.debrief ||= { currentStep: 1, notes: {}, firstSteps: {}, profileSignals: [] }; session.debrief.notes ||= {}; session.debrief.firstSteps ||= {}; session.debrief.profileSignals ||= []; session.debrief.currentStep ||= 1;
  session.playtest ||= { ratings: {}, notes: "", disposition: "unreviewed", updatedAt: null }; session.playtest.ratings ||= {}; session.playtest.notes ||= ""; session.playtest.disposition ||= "unreviewed"; session.playtest.updatedAt ??= null;
  session.metrics ||= { startedAt: null, endedAt: null, contributions: {} }; session.metrics.startedAt ??= null; session.metrics.endedAt ??= null; session.metrics.contributions ||= {};
  return session;
}

export function addPlayer(session, { name, role }) {
  ensureSession(session);
  if(session.status==="ending")throw new Error("This shift has ended");
  if (!ROLES[role] || !activeRoleIds(session.playerCount).includes(role)) throw new Error("Role is not available");
  if (session.players[role]) throw new Error("Role is already occupied");
  const player = { name: String(name || ROLES[role].name).slice(0, 40), role, token: token(), joinedAt: Date.now() };
  session.players[role] = player;
  bump(session, `${ROLES[role].name} joined as ${player.name}`);
  return player;
}

const remaining = (clock, now = Date.now()) => clock.running && clock.endAt ? Math.max(0, Math.ceil((clock.endAt - now) / 1000)) : clock.remaining;
const clamp = (n, min, max) => Math.max(min, Math.min(max, n));
const addEvidence = (session, ...items) => { for (const item of items) if (item && !session.global.evidence.includes(item)) session.global.evidence.push(item); };
const touch = session => { session.revision += 1; session.updatedAt = Date.now(); };
const bump = (session, text) => { touch(session); session.history.push({ at: Date.now(), stage: session.stage, text }); };
const setFlag = (session, group, key, value = true) => { ensureSession(session).flags[group][key] = value; };
const advanceOfficial = (session, amount = 1) => { session.global.official = clamp(session.global.official + amount, 0, 3); };
function advanceAir(session, reason = "Air pressure worsened") {
  ensureSession(session);
  if (session.resources.safetyGuard > 0) { session.resources.safetyGuard--; bump(session, `Safety condition absorbed exposure: ${reason}`); return false; }
  if (session.resources.airHandlingBuffer > 0) { session.resources.airHandlingBuffer--; bump(session, `Air Handling delayed contamination: ${reason}`); return false; }
  session.global.upperAir = clamp(session.global.upperAir + 1, 0, 3); return true;
}

function signalTransmission(session, viewer = { kind: "public" }) {
  if (!session.stage) return null;
  const base = SIGNAL_TRANSMISSIONS[session.stage];
  if (!base) return null;
  const quality = Number(session.outcomes.signalQuality ?? (session.flags.signal?.recovered_fragment ? 1 : 0));
  const retainedEarly = session.flags.signal?.handover_voice_retained || session.flags.signal?.raw_preserved || quality > 0;
  let transcript = base.transcript, integrity = base.integrity, instruction = base.instruction;
  if (session.stage >= 3 && quality === 0 && !retainedEarly) {
    transcript = session.stage >= 5 ? "…hold… [carrier loss] …safe… [unresolved human cadence]…" : "[checksum only] …lower… [source header missing]…";
    integrity = Math.min(14, base.integrity);
    instruction = "SOURCE CONTEXT LOST / PHYSICAL CORROBORATION REQUIRED";
  } else if (session.stage >= 4 && quality === 1) {
    transcript = session.stage >= 5 ? "…do not… blind… hold… [dropout]…" : "…not road… under… [dropout]…";
    integrity = Math.min(36, base.integrity);
    instruction = "PARTIAL RECONSTRUCTION / LOW CONFIDENCE";
  } else if (session.stage >= 4 && quality === 2) {
    integrity = Math.min(68, base.integrity);
    instruction = `${base.instruction} / TWO SOURCES AGREE`;
  }
  if (session.global.mara === "located" && session.stage >= 5) integrity = Math.max(integrity, 76);

  // Shared / non-analyst views stay ambiguous until the buried-station join lands.
  // Signal / Systems / Comms / facilitator get the reconstructed private clarity.
  const analystRoles = new Set(["signal", "systems", "comms"]);
  const canSeePrivateClarity = viewer.kind === "facilitator" || analystRoles.has(viewer.role);
  if (!canSeePrivateClarity && session.stage < 5) {
    return {
      source: base.source,
      integrity: Math.min(integrity, session.stage < 3 ? 18 : 28),
      transcript: session.stage < 3 ? "…[sub-carrier]…[unresolved]…" : "…lower… route… [context incomplete]…",
      instruction: "PUBLIC INTERCEPT / PRIVATE ROLE RECONSTRUCTION REQUIRED",
      preserved: retainedEarly,
      quality,
      privateClarity: false,
    };
  }
  return { ...base, transcript, integrity, instruction, preserved: retainedEarly, quality, privateClarity: canSeePrivateClarity };
}

function environmentState(session) {
  if (!session.stage) return null;
  const basePpm = [0,2,3,5,9,14,17,22][session.stage] || 22;
  const airMeterPpm = clamp(basePpm + session.global.upperAir * 2, 0, 40);
  const airStatus = airMeterPpm >= 22 ? "CRITICAL" : airMeterPpm >= 18 ? "COMPROMISED" : airMeterPpm >= 8 ? "ELEVATED" : "TRACE";
  const roadStatus = session.stage < 4 ? "RISING WATER / ROUTE UNCERTAIN" : session.stage === 4 ? "FLOODED / SHORT WINDOW" : "FLOODED / RIDGE ISOLATED";
  const cordonStatus = session.global.trust >= 2 ? "RESCUE CHANNEL CREDIBLE" : session.global.trust === 1 ? "RIDGE TRAFFIC HEARD" : session.stage < 2 ? "MATERIALS ALERT" : "PERIMETER ACTIVE / RIDGE UNVERIFIED";
  return {
    airMeterPpm, airStatus,
    outsideWindow: session.stage <= 4 && airMeterPpm < 18,
    roadStatus, cordonStatus,
    stormStatus: session.stage < 2 ? "SEVERE / MAST EXPOSED" : "SEVERE / RELAY DEGRADED",
    respirator: session.global.respirator,
  };
}

function officialStatus(session) {
  if (session.global.correction === "accepted") return { code: "HUMAN RESCUE SITE", detail: "CORRECTION ACCEPTED / RESCUE REQUIRED" };
  if (session.global.official >= 3) return { code: "OPERATIONAL / ALL ACCOUNTED FOR", detail: "HUMAN STATUS FILED BY AUTOMATION" };
  if (session.global.official >= 2) return { code: "NO ACTIVE DISTRESS", detail: "FALSE STATUS HARDENING" };
  if (session.global.official >= 1) return { code: "RIDGE RELAY: OPERATIONAL", detail: "UNVERIFIED DEFAULTS REPEATING" };
  return { code: "RIDGE RELAY: OPERATIONAL", detail: "HUMAN STATUS NOT VERIFIED" };
}

function startStage(session, stage) {
  ensureSession(session);
  const definition = STAGES[stage];
  session.status = "stage"; session.stage = stage; session.stageStatus = "live";
  session.reports = {}; session.draft = initialDraft(stage, session.playerCount); session.hint = null;
  if (stage === 4) session.fieldRun = null;
  if (stage === 6) { session.correctionAttempt = 1; session.correctionDrafts=[]; }
  if (stage === 7) { session.finaleRound = 1; session.finalePlans = []; session.pendingEnding = null; }
  session.clock = { duration: definition.duration, remaining: definition.duration, running: true, endAt: Date.now() + definition.duration * 1000 };
  bump(session, `Stage ${stage} started: ${definition.title}`);
  if ([4,5,7].includes(stage)) advanceAir(session, `${definition.kicker} pressure`);
}

function signalCost(draft) {
  return ["voice", "bulletin", "correction"].reduce((n, key) => n + (ACTIONS.signalActions[draft[key]]?.[1] ?? 0), 0);
}

function correctionScore(session, draft = session.draft) {
  const g=session.global,d=draft;
  let score=0;
  if(d.invalid==="operational")score++;
  if(d.human==="mara_below"&&["located","heard"].includes(g.mara))score++;
  if(d.hazard==="lock_air")score++;
  const evidenceValid=d.evidence==="auto"&&g.evidence.length>=3||d.evidence==="physical"&&g.evidence.some(item=>/Conduit|tracks|Repeater|rack B/.test(item))||d.evidence==="status"&&g.evidence.includes("Operational means relay")||d.evidence==="voice"&&g.evidence.some(item=>/voice|fragment|traffic/i.test(item));
  if(evidenceValid)score++;
  if(d.request==="rescue")score++;
  if(g.trust>0||g.systems.includes("military"))score++;
  return {score,evidenceValid};
}

const optionLabel = (entries, id) => entries.find(([value]) => value === id)?.[1] || String(id || "NOT SET").toUpperCase();
const roleName = (session, id) => session.players[id]?.name || rolesForCount(session.playerCount)[id]?.name || String(id || "UNASSIGNED").toUpperCase();

export function decisionPreview(session) {
  ensureSession(session);
  const stage = session.stage, d = session.draft || {}, g = session.global;
  const preview = { summary: "Review the plan before committing.", keeps: [], costs: [], warnings: [], ready: true };
  if (stage === 1) {
    const held = d.holds || [], open = STAGES[1].options.filter(([id]) => !held.includes(id));
    preview.summary = `${held.length} of 3 handover claims paused for human review.`;
    preview.keeps = held.map(id => ({
      mara: "Mara remains officially missing; the search cannot assume she went to the road.",
      voice: "The damaged voice remains available for later reconstruction.",
      road: "The old GREEN road image cannot automatically control the search.",
      event: "The mast incident remains open to causes beyond a local service fault.",
      public: "The station cannot yet file NO WIDER RISK as fact.",
    }[id]));
    preview.costs = open.map(([id]) => ({
      mara: "Mara's inferred field-check location becomes a working fact.",
      voice: "The voice will be treated as weather interference unless recovered later.",
      road: "The stale road feed keeps automatic search priority.",
      event: "LOCAL SERVICE FAULT becomes the working cause.",
      public: "NO WIDER RISK remains in the official baseline.",
    }[id]));
    preview.ready = held.length === 3;
    if (!preview.ready) preview.warnings.push(`Choose exactly 3 holds; ${3 - held.length} selection${3 - held.length === 1 ? " is" : "s are"} still required.`);
  } else if (stage === 2) {
    const powered = d.powered || [], cut = STAGES[2].options.filter(([id]) => !powered.includes(id));
    const liveEffect = {
      buffer: "Signal Buffer: damaged voice can be replayed and reconstructed.", military: "Military Channel: Cordon can hear and read back a later correction.",
      road: "Road Feed: the old road picture remains available, but may reinforce a stale assumption.", lower: "Lower Route Feed: a missing legacy route tag may be recovered.",
      lock: "Lock Control: remote interlock telemetry remains available for the buried hold.", air: "Air Handling: absorbs one later rise in surface contamination.",
    };
    const lostEffect = {
      buffer: "Without Signal Buffer, damaged traffic can be heard only once.", military: "Without Military Channel, a later correction needs stronger proof.",
      road: "Without Road Feed, the crew loses the camera but avoids relying on its stale GREEN label.", lower: "Without Lower Route Feed, the legacy route must be found another way.",
      lock: "Without Lock Control, the finale may require a physical interlock hold.", air: "Without Air Handling, the next contamination rise reaches the crew directly.",
    };
    preview.summary = `${powered.length} of 3 optional circuits selected; every other circuit goes dark.`;
    preview.keeps = powered.map(id => liveEffect[id]); preview.costs = cut.map(([id]) => lostEffect[id]);
    preview.ready = powered.length === 3;
    if (!preview.ready) preview.warnings.push(`Choose exactly 3 optional circuits; ${3 - powered.length} selection${3 - powered.length === 1 ? " is" : "s are"} still required.`);
  } else if (stage === 3) {
    const cost = signalCost(d), actionText = id => `${optionLabel(STAGES[3].options,id)} — ${ACTIONS.signalActions[d[id]]?.[0] || "NOT SET"}`;
    preview.summary = `${cost} of 3 reconstruction slots allocated. Priority: ${optionLabel(STAGES[3].options,d.priority)}.`;
    preview.keeps = ["voice","bulletin","correction"].filter(id => d[id] !== "discard").map(actionText);
    preview.costs = ["voice","bulletin","correction"].filter(id => d[id] === "discard").map(id => `${optionLabel(STAGES[3].options,id)} will not contribute evidence later.`);
    preview.ready = cost === 3;
    if (cost > 3) preview.warnings.push(`Plan exceeds capacity by ${cost - 3} slot${cost - 3 === 1 ? "" : "s"}.`);
    if (cost < 3) preview.warnings.push(`${3 - cost} reconstruction slot${3 - cost === 1 ? " remains" : "s remain"} unused.`);
    if (d.voice === "discard" && d.correction === "discard") preview.warnings.push("Both damaged sources are discarded; the clean official bulletin will dominate the search.");
  } else if (stage === 4) {
    if (session.fieldRun?.active) {
      preview.summary = `${roleName(session,session.fieldRun.runner)} is testing ${optionLabel(STAGES[4].options,session.fieldRun.destination)}.`;
      preview.keeps = [`Abort rule: ${session.fieldRun.abort}`, `Air meter: ${session.fieldRun.meterPpm} / ${session.fieldRun.meterLimit} ppm`, `${session.fieldRun.findings.length} of 3 field findings transmitted.`];
      preview.costs = [`Exposure accepted: ${session.fieldRun.exposure}.`];
    } else {
      preview.summary = `${roleName(session,d.runner)} will test ${optionLabel(STAGES[4].options,d.destination)}.`;
      preview.keeps = [`The run asks one bounded physical question.`, `Abort rule: ${d.abort || "NOT SET"}.`];
      preview.costs = [d.destination === "inside" ? "Staying inside protects the respirator but allows the false outside picture to harden." : "Leaving the cabin exposes one runner to rising contamination."];
      preview.ready = activeRoleIds(session.playerCount).includes(d.runner) && optionIds(STAGES[4].options).has(d.destination) && String(d.abort || "").trim().length >= 8;
      if (!preview.ready) preview.warnings.push("Assign an available runner, destination, and specific abort condition before starting the run.");
    }
  } else if (stage === 5) {
    preview.summary = `${optionLabel(STAGES[5].options,d.procedure)} with ${roleName(session,d.watcher)} watching above.`;
    const procedures = {
      remote: g.systems.includes("lock") ? "Remote inspection can locate Mara and map the interlock without opening the hatch." : "Remote inspection lacks powered Lock Control and may not verify the interlock.",
      controlled: "A controlled crack can verify Mara and the lock rule while the upper watcher protects withdrawal.",
      descent: "A full descent reaches Mara quickly but consumes the override and can destabilise the interlock.",
      delay: "Delay avoids immediate hatch exposure but worsens air and lets the false official status advance.",
    };
    preview.keeps = [procedures[d.procedure], `Respirator plan: ${optionLabel(ACTIONS.hatchResources,d.respirator)}.`];
    preview.costs = [d.procedure === "descent" ? "More crew may become trapped below." : d.procedure === "delay" ? "Mara remains unverified and the rescue window narrows." : "The hatch opens only as far as the selected safeguard allows."];
    preview.ready = optionIds(STAGES[5].options).has(d.procedure) && optionIds(ACTIONS.hatchResources).has(d.respirator) && activeRoleIds(session.playerCount).includes(d.watcher);
    if (d.procedure === "descent") preview.warnings.push("Full descent is a high-risk commitment: the respirator is not permission to ignore the interlock.");
  } else if (stage === 6) {
    const { score, evidenceValid } = correctionScore(session,d);
    preview.summary = `Cordon can currently verify ${score} of 6 receiver requirements.`;
    preview.keeps = [
      `False status: ${optionLabel(ACTIONS.correction.invalid,d.invalid)}.`, `Person and place: ${optionLabel(ACTIONS.correction.human,d.human)}.`,
      `Current hazard: ${optionLabel(ACTIONS.correction.hazard,d.hazard)}.`, `Evidence: ${optionLabel(ACTIONS.correction.evidence,d.evidence)}.`,
      `Requested action: ${optionLabel(ACTIONS.correction.request,d.request)}.`,
    ];
    preview.costs = [score >= 5 ? "Likely result: Cordon can reclassify Ridge as a human rescue site." : score >= 3 ? "Likely result: Cordon will demand final corroboration during the finale." : "Likely result: rejection, 90 seconds lost, and one shortened retry."];
    if (!evidenceValid) preview.warnings.push("The selected evidence is not currently supported by the crew's verified evidence ledger.");
    if (g.trust === 0 && !g.systems.includes("military")) preview.warnings.push("No trusted readback channel is active; the correction needs stronger internal proof.");
  } else if (stage === 7) {
    const assignments = [d.lockLead,d.signalLead,d.peopleLead], unique = new Set(assignments.filter(Boolean));
    preview.summary = `Round ${session.finaleRound || 1}/2: Lock, Signal, and People actions are assigned.`;
    preview.keeps = [
      `Lock — ${optionLabel(ACTIONS.finale.lock,d.lock)} / ${roleName(session,d.lockLead)}.`,
      `Signal — ${optionLabel(ACTIONS.finale.signal,d.signal)} / ${roleName(session,d.signalLead)}.`,
      `People — ${optionLabel(ACTIONS.finale.people,d.people)} / ${roleName(session,d.peopleLead)}.`,
    ];
    preview.costs = ["The final outcome uses both rounds. A lane left unsupported can undo a strong action elsewhere."];
    preview.ready = assignments.every(id => activeRoleIds(session.playerCount).includes(id)) && unique.size >= (session.playerCount === 2 ? 2 : 3);
    if (!preview.ready) preview.warnings.push(session.playerCount === 2 ? "Both operators must own at least one lane." : "Use three different available owners so no one controls every final safeguard.");
    if (d.lock === "stabilise" && !g.systems.includes("lock")) preview.warnings.push("REMOTE STABILISE requires powered Lock Control.");
    if (d.lock === "hold" && g.lockKnowledge < 2) preview.warnings.push("PHYSICAL HOLD needs complete interlock knowledge and an upper watcher.");
    if (d.signal === "transmit" && g.correction !== "accepted") preview.warnings.push("The correction is not accepted yet; final proof may be more useful than retransmission.");
  }
  preview.keeps = preview.keeps.filter(Boolean); preview.costs = preview.costs.filter(Boolean);
  return preview;
}

function resolveStage(session, expired = false) {
  if (session.stageStatus !== "live") return;
  ensureSession(session);
  const stage = session.stage, d = session.draft, g = session.global;
  let headline = "Decision recorded", detail = "The station updates its working model.", quality = "mixed", impacts = [], decision = decisionPreview(session).summary;

  if (stage === 1) {
    const holds = (d.holds || []).slice(0, 3);
    const unheld = ["event","public","mara","road","voice"].filter(id => !holds.includes(id));
    setFlag(session,"assumptions","mara_field_check",unheld.includes("mara"));
    setFlag(session,"assumptions","lower_route_is_road",unheld.includes("road"));
    setFlag(session,"assumptions","voice_is_weather",unheld.includes("voice"));
    if (holds.includes("mara")) { addEvidence(session, "Mara status challenged"); setFlag(session,"human","mara_missing"); }
    if (holds.includes("voice")) { addEvidence(session, "Voice fragment retained"); setFlag(session,"signal","handover_voice_retained"); }
    if (holds.includes("road")) { addEvidence(session, "Road priority challenged"); setFlag(session,"physical","road_priority_challenged"); }
    if (holds.includes("event")) addEvidence(session, "Fault classification challenged");
    if (holds.includes("public")) addEvidence(session, "Public-safety claim challenged");
    advanceOfficial(session, unheld.filter(id => ["mara","road","voice"].includes(id)).length >= 2 ? 1 : 0);
    headline = `${holds.length} defaults held for human review`;
    detail = holds.includes("mara") && holds.includes("voice") ? "Mara and the weak signal remain visible." : "At least one dangerous default is now shaping the search.";
    quality = holds.includes("mara") && holds.includes("voice") ? "strong" : "costly";
    impacts = [`Held for review: ${holds.map(id=>optionLabel(STAGES[1].options,id)).join(", ")}.`, `Now treated as working facts: ${unheld.map(id=>optionLabel(STAGES[1].options,id)).join(", ")}.`];
  } else if (stage === 2) {
    g.systems = [...(d.powered || []).slice(0, 3)];
    if (g.systems.includes("air")) { addEvidence(session, "Air handling retained"); session.resources.airHandlingBuffer = 1; setFlag(session,"system","air_handling_available"); }
    if (g.systems.includes("military")) { g.trust = clamp(g.trust + 1,0,2); setFlag(session,"system","military_channel_available"); }
    if (g.systems.includes("lower")) { addEvidence(session, "Legacy route feed active"); setFlag(session,"system","lower_route_feed_available"); }
    if (g.systems.includes("buffer")) setFlag(session,"system","signal_buffer_available");
    if (g.systems.includes("lock")) setFlag(session,"system","lock_control_available");
    if (g.systems.includes("road")) setFlag(session,"assumptions","road_feed_reinforced");
    headline = `${g.systems.length} optional circuits remain live`;
    detail = `The crew protected ${g.systems.map(x => STAGES[2].options.find(o => o[0] === x)?.[1]).join(", ") || "no optional systems"}.`;
    quality = g.systems.length === 3 ? "strong" : "costly";
    impacts = [`Still available: ${g.systems.map(id=>optionLabel(STAGES[2].options,id)).join(", ")}.`, `Cut and unavailable: ${STAGES[2].options.filter(([id])=>!g.systems.includes(id)).map(([,label])=>label).join(", ")}.`];
  } else if (stage === 3) {
    const voiceSafe = d.voice !== "discard", correctionSafe = d.correction !== "discard";
    let q = voiceSafe || correctionSafe ? 1 : 0;
    if (voiceSafe && correctionSafe) q = 2;
    if ((d.voice === "replay" && correctionSafe) || (d.correction === "replay" && voiceSafe)) q = 3;
    if (g.systems.includes("buffer") && voiceSafe) q++;
    if (d.priority === "voice" && voiceSafe || d.priority === "correction" && correctionSafe) q++;
    if (signalCost(d) > 3) q = Math.min(q, 1);
    if (session.interventions.signal && q < 3) q++;
    q = clamp(q,0,3);
    if (q >= 1) addEvidence(session, "Structured degraded traffic");
    if (q >= 2) addEvidence(session, "Not-road fragment");
    if (q >= 3) addEvidence(session, "Route beneath station");
    setFlag(session,"signal","structured_traffic",q>=1); setFlag(session,"signal","not_road_fragment",q>=2); setFlag(session,"signal","route_beneath_station",q>=3);
    setFlag(session,"signal","raw_preserved",d.voice==="preserve"||d.voice==="replay");
    headline = ["The clean bulletin wins", "A trace survives", "Two weak sources agree", "The road interpretation breaks"][q];
    detail = ["Only a structured checksum remains.", "LOWER ROUTE survives without context.", "The voice says NOT ROAD… UNDER.", "Mara may be beneath the station, not downhill."][q];
    quality = q >= 2 ? "strong" : "costly";
    impacts = [`Reconstruction quality: ${q}/3 — ${detail}`, `Decision priority: ${optionLabel(STAGES[3].options,d.priority)}.`, `Slots used: ${signalCost(d)}/3.`];
    session.outcomes.signalQuality = q;
  } else if (stage === 4) {
    const findings = session.fieldRun?.findings || [];
    if(session.fieldRun){session.fieldRun.active=false;if(session.fieldRun.destination!=="inside"&&expired)g.respirator="spent";}
    addEvidence(session,...findings);
    if (!findings.some(item=>/Conduit beneath|Signal points toward foundations|Lower Route legacy/.test(item))) addEvidence(session,"Indoor evidence points beneath rack B");
    setFlag(session,"physical","no_tracks",g.evidence.includes("No tracks downhill"));
    setFlag(session,"physical","repeater_unopened",g.evidence.includes("Repeater unopened"));
    setFlag(session,"physical","conduit_below",g.evidence.some(item=>/Conduit beneath|points toward foundations|beneath rack B/.test(item)));
    setFlag(session,"assumptions","lower_route_is_road",false);
    if (d.destination === "inside") advanceOfficial(session);
    headline = d.destination === "inside" ? "The crew keeps the mask—and the assumption" : "The physical route contradicts the map";
    detail = findings.length >= 3 && d.destination!=="inside" ? "No tracks. Untouched repeater. The conduit returns beneath Blackout Ridge." : "The crew reaches a costlier contradiction, but Lower Route no longer means the flooded road.";
    quality = findings.length >= 3 && d.destination!=="inside" ? "strong" : "mixed";
    impacts = [`Field question: ${optionLabel(STAGES[4].options,d.destination)}.`, `Findings: ${findings.length ? findings.join(" · ") : "No external findings; indoor evidence carried the contradiction."}`, `Respirator: ${String(g.respirator).replaceAll("_"," ").toUpperCase()}.`];
  } else if (stage === 5) {
    if (d.procedure === "remote" && g.systems.includes("lock")) { g.lockKnowledge = 2; g.mara = "located"; }
    else if (d.procedure === "controlled") { g.lockKnowledge = 2; g.mara = "located"; }
    else if (d.procedure === "descent") { g.lockKnowledge = 1; g.mara = "located"; g.lockRisk = true; session.resources.interlockOverride = "used"; advanceAir(session,"Uncontrolled hatch exposure"); }
    else { advanceAir(session,"Hatch inspection delayed"); advanceOfficial(session); g.mara = "heard"; }
    addEvidence(session, "Operational means relay", "Lark crew not verified safe");
    if (g.mara === "located") addEvidence(session, "Mara located below");
    if (d.respirator === "mara" && g.respirator !== "spent") g.respirator = "with_mara";
    if (d.respirator === "descent" && g.respirator !== "spent") g.respirator = "hatch";
    setFlag(session,"system","operational_means_relay"); setFlag(session,"system","lock_rule_known",g.lockKnowledge>0); setFlag(session,"human","mara_below",["located","heard"].includes(g.mara)); setFlag(session,"human","lark_crew_not_safe");
    headline = "OPERATIONAL was measuring the wrong thing";
    detail = g.mara === "located" ? "Beyond the hatch is an old workplace—relay desks, bunks, used masks and the Lark status log. Mara is verified below; the containment rule can protect or trap the occupied hold." : "Beyond the hatch, an old relay workplace and Lark status log prove the hold was occupied. A current voice is below, but the crew delayed physical verification.";
    quality = g.lockKnowledge === 2 ? "strong" : "costly";
    impacts = [`Mara: ${g.mara === "located" ? "located and verified below" : "heard below, not physically verified"}.`, `Interlock knowledge: ${g.lockKnowledge}/2.`, `Respirator: ${String(g.respirator).replaceAll("_"," ").toUpperCase()}.`];
  } else if (stage === 6) {
    const {score,evidenceValid}=correctionScore(session,d);
    g.correction = score >= 5 ? "accepted" : score >= 3 ? "conditional" : "rejected";
    if (g.correction === "accepted") g.trust = 2; else advanceOfficial(session);
    setFlag(session,"correction","score",score); setFlag(session,"correction","evidence_valid",evidenceValid); setFlag(session,"correction","receiver_result",g.correction);
    headline = { accepted: "Correction accepted", conditional: "Cordon requests final proof", rejected: "Ridge traffic remains unverified" }[g.correction];
    detail = { accepted: "Blackout Ridge is reclassified as a human rescue site.", conditional: "The finale Signal lane must supply one corroboration.", rejected: "One last carrier remains before NO ACTIVE DISTRESS files." }[g.correction];
    quality = g.correction === "accepted" ? "strong" : "costly";
    impacts = [`Receiver result: ${g.correction.toUpperCase()}.`, `Correction strength: ${score}/6 receiver requirements.`, g.correction === "accepted" ? "Cordon now recognises a human rescue site." : "The Signal lane must change the outside record during the finale."];
  } else if (stage === 7) {
    const first = session.finalePlans[0] || d, second = session.finalePlans[1] || d;
    const assignmentsValid = plan => {
      const assignments = [plan.lockLead, plan.signalLead, plan.peopleLead].filter(Boolean);
      const allowed = activeRoleIds(session.playerCount);
      const required = session.playerCount === 2 ? 2 : 3;
      return assignments.length === 3 && assignments.every(id => allowed.includes(id)) && new Set(assignments).size >= required;
    };
    const assigned = assignmentsValid(first) && assignmentsValid(second);
    const lockAction = [first.lock, second.lock];
    const signalAction = [first.signal, second.signal];
    const peopleAction = [first.people, second.people];
    const lock = assigned && ((lockAction.includes("stabilise") && g.systems.includes("lock") && g.lockKnowledge >= 1) || (lockAction.includes("hold") && g.lockKnowledge >= 2) || (lockAction.includes("override") && !g.lockRisk && session.resources.interlockOverride !== "damaged"));
    const signal = assigned && (g.correction === "accepted" && signalAction.some(x=>["transmit","maintain","corroborate"].includes(x)) || g.correction === "conditional" && signalAction.includes("corroborate") || g.correction === "rejected" && signalAction.includes("corroborate") && g.evidence.length >= 5 && g.official < 3);
    const mara = peopleAction.includes("extract") && lock ? "extracted" : peopleAction.some(x => ["supply", "verify"].includes(x)) ? "rescue_path" : "trapped";
    let crew = peopleAction.includes("evacuate") ? "safe" : lock ? (g.upperAir >= 3 && !peopleAction.some(x=>["supply","extract"].includes(x)) ? "compromised" : "safe") : "trapped";
    if (g.upperAir >= 3 && !peopleAction.some(x=>["supply","extract","evacuate"].includes(x))) crew = "incapacitated";
    const endingKey = `${lock ? 1 : 0}${signal ? 1 : 0}`;
    const endings = {
      "11": ["CLEAN RESCUE", "The hold remains controllable and Cordon Control mobilises to an occupied human-rescue site."],
      "10": ["DARK HOLD", "The crew controls the physical danger, but the outside picture remains wrong."],
      "01": ["LAST BROADCAST", "The hold seals, but the emergency correction gets out. Rescue knows the truth."],
      "00": ["FILED SAFE", "The hold seals while Blackout Ridge reports OPERATIONAL / NO ACTIVE DISTRESS."],
    };
    let [title, body] = peopleAction.includes("evacuate") && mara !== "extracted" ? ["FLEE RIDGE", "The surface crew escapes. Mara remains below and her status depends on the signal they left behind."] : endings[endingKey];
    if (lock && signal && mara === "rescue_path") [title,body] = ["COSTLY RESCUE","Mara is verified and Cordon Control has the truth. Extraction remains difficult, but a controlled rescue path now exists."];
    if (!lock && peopleAction.includes("extract") && crew !== "incapacitated") [title,body] = ["JOINED BELOW","The crew reaches Mara without controlling the interlock. More people are now inside the sealing hold, and rescue depends on the signal outside."];
    if (crew === "incapacitated") [title,body] = ["STATION LOSS","Upper Air reaches critical while the crew has neither secured shelter nor completed evacuation. The signal record survives as transmitted."];
    const rescueOutcome = mara === "extracted" ? "MARA EXTRACTED" : mara === "rescue_path" ? "RESCUE PATH ESTABLISHED" : "MARA REMAINS TRAPPED";
    const survivalOutcome = crew === "safe" ? "CREW SURVIVES" : crew === "compromised" ? "CREW COMPROMISED" : crew === "trapped" ? "CREW TRAPPED" : "CREW INCAPACITATED";
    const statusOutcome = signal ? "HUMAN RESCUE STATUS ACCEPTED" : "OPERATIONAL / NO ACTIVE DISTRESS";
    session.pendingEnding = { title, body, lockControlled: lock, correctionAccepted: signal, mara, crew, rescueOutcome, survivalOutcome, statusOutcome };
    headline = title; detail = body; quality = lock && signal ? "strong" : "costly";
    impacts = [`Physical truth: ${lock ? "interlock controlled" : "interlock not controlled"}.`, `Official truth: ${signal ? "human rescue status accepted" : "false operational status remains"}.`, `${rescueOutcome}; ${survivalOutcome}.`];
  }

  session.global.upperAir = clamp(session.global.upperAir, 0, 3);
  session.global.trust = clamp(session.global.trust, 0, 2);
  session.global.official = clamp(session.global.official + (expired ? 1 : 0), 0, 3);
  session.decisions[stage] = stage===7 ? session.finalePlans.map(plan=>({...plan})) : stage===6 ? {attempts:[...session.correctionDrafts.map(item=>({...item})),{...d}]} : stage===4 ? {...d,run:{moves:[...(session.fieldRun?.moves||[])],findings:[...(session.fieldRun?.findings||[])],guidance:(session.fieldRun?.guidance||[]).length,exposure:session.fieldRun?.exposure||0,meterPpm:session.fieldRun?.meterPpm||0,meterLimit:session.fieldRun?.meterLimit||18,forcedAbort:Boolean(session.fieldRun?.forcedAbort)}} : { ...d };
  session.stageStatus = "resolved"; session.clock.remaining = remaining(session.clock); session.clock.running = false; session.clock.endAt = null;
  if (expired) impacts.unshift("Time expired: official pressure advanced before the plan resolved.");
  session.outcomes[stage] = { headline, detail, quality, expired, decision, impacts, next: STAGES[stage]?.story?.next || "The incident continues.", at: Date.now() };
  bump(session, `Stage ${stage} resolved: ${headline}`);
}

function canLead(session, viewer) { return viewer.kind === "facilitator" || viewer.role === "lead"; }

function recordContribution(session, role, kind) {
  if (!role) return;
  const entry = session.metrics.contributions[role] ||= { reports: 0, interventions: 0, guidance: 0, fieldMoves: 0, stages: [] };
  entry[kind] = (entry[kind] || 0) + 1;
  if (session.stage && !entry.stages.includes(session.stage)) entry.stages.push(session.stage);
}

const optionIds = entries => new Set(entries.map(([id])=>id));
function validateDraftUpdate(session, payload) {
  const stage=session.stage, next={...session.draft};
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) throw new Error("Decision update is invalid");
  if (stage===1 && "holds" in payload) {
    const allowed=optionIds(STAGES[1].options), values=[...new Set(Array.isArray(payload.holds)?payload.holds:[])];
    if(values.some(x=>!allowed.has(x))||values.length>3) throw new Error("Audit holds are invalid"); next.holds=values;
  } else if(stage===2 && "powered" in payload) {
    const allowed=optionIds(STAGES[2].options), values=[...new Set(Array.isArray(payload.powered)?payload.powered:[])];
    if(values.some(x=>!allowed.has(x))||values.length>3) throw new Error("Power selection is invalid"); next.powered=values;
  } else if(stage===3) {
    for(const key of ["voice","bulletin","correction"]) if(key in payload){if(!ACTIONS.signalActions[payload[key]])throw new Error("Signal action is invalid");next[key]=payload[key];}
    if("priority" in payload){if(!["voice","bulletin","correction"].includes(payload.priority))throw new Error("Priority source is invalid");next.priority=payload.priority;}
  } else if(stage===4 && !session.fieldRun?.active) {
    if("runner" in payload){if(!activeRoleIds(session.playerCount).includes(payload.runner))throw new Error("Runner is invalid");next.runner=payload.runner;}
    if("destination" in payload){if(!optionIds(STAGES[4].options).has(payload.destination))throw new Error("Destination is invalid");next.destination=payload.destination;}
    if("abort" in payload)next.abort=String(payload.abort||"").trim().slice(0,80);
  } else if(stage===5) {
    if("procedure" in payload){if(!optionIds(STAGES[5].options).has(payload.procedure))throw new Error("Hatch procedure is invalid");next.procedure=payload.procedure;}
    if("respirator" in payload){if(!optionIds(ACTIONS.hatchResources).has(payload.respirator))throw new Error("Respirator assignment is invalid");next.respirator=payload.respirator;}
    if("watcher" in payload){if(!activeRoleIds(session.playerCount).includes(payload.watcher))throw new Error("Watcher is invalid");next.watcher=payload.watcher;}
  } else if(stage===6) {
    for(const [field,entries] of Object.entries(ACTIONS.correction)) if(field in payload){if(!optionIds(entries).has(payload[field]))throw new Error(`${field} selection is invalid`);next[field]=payload[field];}
  } else if(stage===7) {
    for(const [field,entries] of Object.entries(ACTIONS.finale)) {
      if(field in payload){if(!optionIds(entries).has(payload[field]))throw new Error(`${field} action is invalid`);next[field]=payload[field];}
      const leadKey=`${field}Lead`;if(leadKey in payload){if(!activeRoleIds(session.playerCount).includes(payload[leadKey]))throw new Error(`${field} lead is invalid`);next[leadKey]=payload[leadKey];}
    }
  } else if(Object.keys(payload).length) throw new Error("Decision cannot be changed now");
  return next;
}

const fieldClues = {
  conduit:["No tracks downhill","Repeater unopened","Conduit beneath station"],
  gate:["No tracks downhill","Road camera confirmed stale","Signal points toward foundations"],
  repeater:["Repeater unopened","Signal points toward foundations","Conduit beneath station"],
  inside:["Lower Route legacy label found","Signal strongest beneath rack B","Conduit beneath station"],
};
function beginFieldRun(session) {
  const d=session.draft;
  if(!activeRoleIds(session.playerCount).includes(d.runner))throw new Error("Assign an available runner");
  if(!optionIds(STAGES[4].options).has(d.destination))throw new Error("Choose a field destination");
  if(String(d.abort||"").trim().length<8)throw new Error("Name a clear abort condition");
  const meter=environmentState(session)?.airMeterPpm||9;
  session.fieldRun={active:true,runner:d.runner,destination:d.destination,abort:d.abort,step:1,guidance:[],moves:[],findings:[],exposure:0,meterPpm:meter,meterLimit:18,meterTrend:"RISING",forcedAbort:false};
  bump(session,`Outside Run locked: ${d.runner} to ${d.destination}`);
}
function fieldMove(session, viewer, move) {
  const run=session.fieldRun;
  if(session.stage!==4||session.stageStatus!=="live"||!run?.active)throw new Error("No Outside Run is active");
  if(viewer.kind!=="facilitator"&&viewer.role!==run.runner)throw new Error("Only the assigned runner can make this move");
  if(!["observe","advance","withdraw"].includes(move))throw new Error("Field move is invalid");
  run.moves.push(move);
  if(move==="withdraw") { run.active=false;if(run.exposure>=2)session.global.respirator="spent";bump(session,"Runner withdrew under the abort rule"); return resolveStage(session,false); }
  const clues=fieldClues[run.destination]||fieldClues.inside, index=Math.min(run.step-1,2);
  if(!run.findings.includes(clues[index]))run.findings.push(clues[index]);
  const outside=run.destination!=="inside",rise=outside?(move==="advance"?4:1):0;
  run.meterPpm=clamp((run.meterPpm||0)+rise,0,40);run.meterTrend=rise>=4?"RAPID RISE":rise?"RISING":"STABLE";
  if(move==="advance") { run.exposure++; if(index<2&&!run.findings.includes(clues[index+1]))run.findings.push(clues[index+1]); }
  bump(session,`Outside Run move ${run.step}: ${move}`);
  if(outside&&run.meterPpm>=run.meterLimit){run.active=false;run.forcedAbort=true;session.global.respirator="spent";bump(session,`Air meter reached ${run.meterPpm} ppm; abort rule forced withdrawal`);return resolveStage(session,false);}
  if(run.step>=3){run.active=false;if(outside)session.global.respirator=run.exposure>=2?"spent":"partial";return resolveStage(session,false);}
  run.step++;
}

function interventionMessage(session, role) {
  const stage=session.stage,d=session.draft,g=session.global;
  if(role==="lead")return "CLOCK HELD / The next minute is borrowed against station pressure.";
  if(role==="signal")return stage<=3?"PARTIAL FRAGMENT RECOVERED / Structured cadence remains beneath the clean bulletin.":"CARRIER RECOVERY ARMED / One degraded source remains usable.";
  if(role==="systems")return stage===2?`DEPENDENCY TRACE / ${d.powered?.includes("lock")?"Lock Control telemetry survives.":"Lock Control will require a manual safeguard."}`:"DEPENDENCY TRACE / OPERATIONAL reports relay output, not human safety.";
  if(role==="operations")return stage===4?`CONTROLLED TEST / ${d.destination==="inside"?"Staying inside preserves the filter but weakens physical proof.":"A named abort rule limits exposure; advancing trades filter life for evidence."}`:"CONTROLLED TEST / The current action has a recoverable fallback if its safeguard is maintained.";
  if(role==="field")return ["Mara status challenged","Mara located below"].some(x=>g.evidence.includes(x))?"HUMAN CHECK / Mara remains named in the active record.":"HUMAN CHECK / Mara has no verified lower-road gate trace.";
  if(role==="protocol")return "SAFETY CONDITION / The next avoidable exposure escalation will be intercepted.";
  return "READBACK REQUESTED / Cordon Control confirms it is receiving Ridge traffic.";
}

export function authorize(session, suppliedToken) {
  ensureSession(session);
  if (suppliedToken === session.facilitatorToken) return { kind: "facilitator" };
  const player = Object.values(session.players).find(p => p.token === suppliedToken);
  return player ? { kind: "player", role: player.role, name: player.name } : { kind: "public" };
}

export function applyAction(session, viewer, type, payload = {}) {
  ensureSession(session);
  if(viewer.kind==="player"&&session.absentRoles[viewer.role]&&type!=="CHAT_MESSAGE")throw new Error("This role is temporarily in observer mode");
  if (type === "ACK_SAFETY" && viewer.kind === "facilitator" && session.stage === 0) { session.safetyBriefed = true; bump(session,"Participant-care briefing confirmed"); }
  else if (type === "START_GAME" && viewer.kind === "facilitator" && session.stage === 0) { if(Object.keys(session.players).length!==session.playerCount)throw new Error(`Connect all ${session.playerCount} crew terminals before starting`);if(!session.safetyBriefed)throw new Error("Confirm the participant-care briefing before starting");session.metrics.startedAt=Date.now();startStage(session, 1); }
  else if (type === "ADVANCE_STAGE" && viewer.kind === "facilitator" && session.stageStatus === "resolved" && session.stage < 7) startStage(session, session.stage + 1);
  else if (type === "CHAT_MESSAGE" && (viewer.kind === "player" || viewer.kind === "facilitator")) {
    const text = String(payload.message || "").trim().slice(0, 500);
    if (!text) throw new Error("Enter a message before sending it");
    const senderRole = viewer.kind === "player" ? viewer.role : null;
    const senderName = viewer.kind === "player" ? session.players[viewer.role]?.name || ROLES[viewer.role]?.name : "Facilitator";
    session.chatMessages.push({ id: crypto.randomUUID(), at: Date.now(), senderKind: viewer.kind, senderRole, senderName, text });
    if (session.chatMessages.length > 100) session.chatMessages.splice(0, session.chatMessages.length - 100);
    touch(session);
  }
  else if (type === "REPORT" && viewer.kind === "player" && session.stageStatus === "live") {
    const note = String(payload.note || "").trim().slice(0, 160);
    if (!note) throw new Error("Enter a recommendation before sharing it");
    const recommendation = String(payload.recommendation || "shared").trim().slice(0, 80) || "shared";
    const first = !session.reports[viewer.role];
    session.reports[viewer.role] = { recommendation, note };
    if (first) recordContribution(session, viewer.role, "reports");
    bump(session, `${ROLES[viewer.role].name} shared an assessment`);
  }
  else if (type === "UPDATE_DRAFT" && canLead(session, viewer) && session.stageStatus === "live") { session.draft = validateDraftUpdate(session,payload); bump(session, "Crew plan updated"); }
  else if (type === "COMMIT_STAGE" && canLead(session, viewer) && session.stageStatus === "live") {
    if (session.stage === 1 && (session.draft.holds?.length || 0) !== 3) throw new Error("Select exactly three audit holds");
    if (session.stage === 2 && (session.draft.powered?.length || 0) !== 3) throw new Error("Select exactly three optional circuits");
    if (session.stage === 3 && signalCost(session.draft) !== 3) throw new Error("Allocate exactly three signal slots");
    if (session.stage === 4) {
      if (session.fieldRun?.active) throw new Error("The assigned runner must complete or abort the Outside Run");
      if (!session.fieldRun) return beginFieldRun(session);
    }
    if (session.stage === 6 && session.correctionAttempt === 1 && correctionScore(session).score <= 2) {
      session.correctionDrafts.push({...session.draft});session.correctionAttempt=2;advanceOfficial(session);advanceAir(session,"Rejected correction consumed the retry window");
      const value=Math.max(45,remaining(session.clock)-90);session.clock.remaining=value;if(session.clock.running)session.clock.endAt=Date.now()+value*1000;
      bump(session,"Correction rejected; one shortened retry opened");return session;
    }
    if (session.stage === 7 && session.finaleRound === 1) {
      session.finalePlans = [{ ...session.draft }];
      session.finaleRound = 2;
      bump(session, "Finale action round 1 locked; reinforcement round opened");
    } else { if(session.stage===7)session.finalePlans[1]={...session.draft}; resolveStage(session, false); }
  }
  else if(type==="FIELD_GUIDANCE" && session.stage===4 && session.stageStatus==="live" && session.fieldRun?.active && viewer.kind!=="public") {
    const message=String(payload.message||"").trim().slice(0,90);if(!message)throw new Error("Guidance message is empty");if(session.fieldRun.guidance.length>=3)throw new Error("Runner channel is limited to three guidance bursts");session.fieldRun.guidance.push({role:viewer.role||"facilitator",message});if(viewer.role)recordContribution(session,viewer.role,"guidance");bump(session,"Guidance burst sent to runner");
  }
  else if(type==="FIELD_MOVE") { fieldMove(session,viewer,payload.move);if(viewer.role)recordContribution(session,viewer.role,"fieldMoves"); }
  else if(type==="CONFIRM_ENDING" && viewer.kind==="facilitator" && session.stage===7 && session.stageStatus==="resolved" && session.pendingEnding) {
    session.ending={...session.pendingEnding};session.pendingEnding=null;session.status="ending";session.metrics.endedAt=Date.now();bump(session,`Final record confirmed: ${session.ending.title}`);
  }
  else if(type==="SET_DEBRIEF_STEP" && viewer.kind==="facilitator" && session.status==="ending") { const step=Number(payload.step);if(!DEBRIEF_STEPS.some(item=>item.id===step))throw new Error("Debrief step is invalid");session.debrief.currentStep=step;bump(session,`Debrief advanced to step ${step}`); }
  else if(type==="SAVE_DEBRIEF_NOTE" && viewer.kind==="facilitator" && session.status==="ending") { const step=Number(payload.step),note=String(payload.note||"").trim().slice(0,1200);if(!DEBRIEF_STEPS.some(item=>item.id===step))throw new Error("Debrief step is invalid");session.debrief.notes[step]=note;bump(session,`Debrief note saved for step ${step}`); }
  else if(type==="SAVE_FIRST_STEP" && viewer.kind==="player" && session.status==="ending") { const note=String(payload.note||"").trim().slice(0,280);if(note.length<5)throw new Error("Enter a specific first step");session.debrief.firstSteps[viewer.role]={name:viewer.name,note,at:Date.now()};bump(session,`${ROLES[viewer.role].name} recorded a workplace first step`); }
  else if(type==="TOGGLE_PROFILE_SIGNAL" && viewer.kind==="facilitator" && session.status==="ending") { const id=String(payload.id||"");if(!READINESS_PROFILES.some(profile=>profile.id===id))throw new Error("Readiness behavior lens is invalid");session.debrief.profileSignals=session.debrief.profileSignals.includes(id)?session.debrief.profileSignals.filter(item=>item!==id):[...session.debrief.profileSignals,id];bump(session,`Debrief behavior lens ${session.debrief.profileSignals.includes(id)?"observed":"cleared"}: ${id}`); }
  else if(type==="SAVE_PLAYTEST" && viewer.kind==="facilitator" && session.status==="ending") {
    const allowed=new Set(PLAYTEST_CRITERIA.map(item=>item.id)),ratings={};
    for(const [id,value] of Object.entries(payload.ratings||{})){const score=Number(value);if(!allowed.has(id)||!Number.isInteger(score)||score<1||score>5)throw new Error("Playtest rating is invalid");ratings[id]=score;}
    const disposition=String(payload.disposition||"unreviewed");if(!["unreviewed","proceed","revise","kill_reframe"].includes(disposition))throw new Error("Playtest disposition is invalid");
    session.playtest={ratings,notes:String(payload.notes||"").trim().slice(0,1600),disposition,updatedAt:Date.now()};bump(session,"Prototype playtest record saved");
  }
  else if (type === "PAUSE" && viewer.kind === "facilitator" && session.clock.running) { session.clock.remaining = remaining(session.clock); session.clock.running = false; session.clock.endAt = null; bump(session, "Clock paused"); }
  else if (type === "RESUME" && viewer.kind === "facilitator" && session.stageStatus === "live" && !session.clock.running) { session.clock.running = true; session.clock.endAt = Date.now() + session.clock.remaining * 1000; bump(session, "Clock resumed"); }
  else if (type === "ADD_TIME" && viewer.kind === "facilitator" && session.stageStatus === "live") { const value = remaining(session.clock) + 30; session.clock.remaining = value; if (session.clock.running) session.clock.endAt = Date.now() + value * 1000; bump(session, "Thirty seconds added"); }
  else if (type === "HINT" && viewer.kind === "facilitator") { session.hint = String(payload.message || STAGE_HINTS[session.stage] || "Ask what this output measures and which evidence is missing.").slice(0, 200); bump(session, "Facilitator prompt shown"); }
  else if (type === "CLEAR_HINT" && viewer.kind === "facilitator") { session.hint = null; bump(session, "Facilitator prompt cleared"); }
  else if (type === "SAFETY" && viewer.kind === "facilitator") { session.safetyPaused = !session.safetyPaused; if (session.safetyPaused && session.clock.running) { session.clock.remaining = remaining(session.clock); session.clock.running = false; session.clock.endAt = null; } bump(session, session.safetyPaused ? "Safety pause enabled" : "Safety pause cleared"); }
  else if(type==="SET_ABSENT" && viewer.kind==="facilitator") { const role=String(payload.role||"");if(!activeRoleIds(session.playerCount).includes(role))throw new Error("Role is invalid");session.absentRoles[role]=payload.absent!==false;bump(session,`${ROLES[role].name} marked ${session.absentRoles[role]?"temporarily absent":"present"}`); }
  else if(type==="REASSIGN_PLAYER" && viewer.kind==="facilitator") { const from=String(payload.from||""),to=String(payload.to||"");if(!session.players[from]||from===to||session.players[to]&&!session.absentRoles[to]||!activeRoleIds(session.playerCount).includes(to))throw new Error("Role reassignment is invalid");if(session.players[to])delete session.players[to];const player=session.players[from];delete session.players[from];player.role=to;session.players[to]=player;delete session.absentRoles[from];delete session.absentRoles[to];bump(session,`${player.name} reassigned from ${ROLES[from].name} to ${ROLES[to].name}`); }
  else if(type==="RESEND_CARD" && viewer.kind==="facilitator") { const role=String(payload.role||"");if(!session.players[role])throw new Error("Role is not connected");bump(session,`${ROLES[role].name} private card re-sent`); }
  else if(type==="OVERRIDE_DECISION" && viewer.kind==="facilitator" && session.stageStatus==="live") { const note=String(payload.note||"").trim().slice(0,160);if(note.length<5)throw new Error("An audit note is required");session.draft=validateDraftUpdate(session,payload.changes||{});bump(session,`Facilitator technical correction: ${note}`); }
  else if (type === "INTERVENTION" && viewer.kind === "player" && session.stageStatus==="live" && !session.interventions[viewer.role]) {
    session.interventions[viewer.role] = { stage: session.stage, at: Date.now() };
    recordContribution(session,viewer.role,"interventions");
    if (viewer.role === "lead") { const value = remaining(session.clock) + 60; session.clock.remaining = value; if (session.clock.running) session.clock.endAt = Date.now() + value * 1000; advanceOfficial(session); }
    if (viewer.role === "signal") { addEvidence(session,"Recovered degraded fragment");setFlag(session,"signal","recovered_fragment"); }
    if (viewer.role === "systems") { addEvidence(session, "Dependency traced");setFlag(session,"system","dependency_traced"); }
    if (viewer.role === "field") { addEvidence(session, "Named human record exposed");setFlag(session,"human","named_record_exposed"); }
    if (viewer.role === "protocol") session.resources.safetyGuard++;
    if (viewer.role === "comms") { session.global.trust = clamp(session.global.trust + 1, 0, 2);setFlag(session,"correction","readback_requested"); }
    session.interventionFeedback[viewer.role]=interventionMessage(session,viewer.role);
    bump(session, `${ROLES[viewer.role].intervention} used`);
  } else throw new Error("Action is not available");
  return session;
}

export function expireIfNeeded(session, now = Date.now()) {
  ensureSession(session);
  if (session.stageStatus === "live" && session.clock.running && session.clock.endAt <= now) { if(session.stage===7&&session.finalePlans.length<2)session.finalePlans[1]={...session.draft}; resolveStage(session, true); return true; }
  return false;
}

export function publicState(session, viewer) {
  ensureSession(session);
  const stage = STAGES[session.stage] || null;
  const player = viewer.kind === "player" ? session.players[viewer.role] : null;
  const durationSeconds = session.metrics.startedAt ? Math.max(0,Math.round(((session.metrics.endedAt||Date.now())-session.metrics.startedAt)/1000)) : 0;
  return {
    code: session.code, revision: session.revision, playerCount: session.playerCount, finaleRound: session.finaleRound, correctionAttempt: session.correctionAttempt,
    status: session.status, stage: session.stage, stageStatus: session.stageStatus,
    clock: { ...session.clock, remaining: remaining(session.clock) }, safetyPaused: session.safetyPaused,
    players: Object.fromEntries(Object.entries(session.players).map(([role, p]) => [role, { role, name: p.name, joinedAt: p.joinedAt }])),
    reports: viewer.kind === "facilitator" || viewer.role === "lead"
      ? session.reports
      : Object.fromEntries(Object.entries(session.reports).map(([role, report]) => [
          role,
          viewer.kind === "player" && role === viewer.role ? { ...report } : { submitted: true },
        ])),
    chatMessages: viewer.kind === "player" || viewer.kind === "facilitator" ? session.chatMessages.map(message => ({ ...message })) : [],
    draft: canLead(session, viewer) || session.stageStatus === "resolved" ? session.draft : {},
    hint: session.hint, global: session.global, resources: session.resources, environment: environmentState(session), officialStatus: officialStatus(session), decisionPreview: session.stageStatus === "live" ? decisionPreview(session) : null, flags: viewer.kind==="facilitator"?session.flags:undefined, interventions: session.interventions, interventionFeedback: session.interventionFeedback, absentRoles: session.absentRoles, outcomes: session.outcomes, ending: session.ending,
    safetyBriefed: session.safetyBriefed, participantCare: PARTICIPANT_CARE, signalTransmission: signalTransmission(session, viewer),
    debrief: { currentStep: session.debrief.currentStep, steps: DEBRIEF_STEPS, notes: viewer.kind==="facilitator"?session.debrief.notes:undefined, firstSteps: session.debrief.firstSteps, profileSignals: session.debrief.profileSignals, roleMap: roleMapForCount(session.playerCount), readinessProfiles: READINESS_PROFILES },
    playtest: viewer.kind==="facilitator"&&session.status==="ending" ? { ...session.playtest, criteria: PLAYTEST_CRITERIA, needsReframe: session.playtest.disposition==="kill_reframe"||Number(session.playtest.ratings.ai_alignment||5)<=2 } : undefined,
    metrics: viewer.kind==="facilitator"||session.status==="ending" ? { ...session.metrics, durationSeconds } : undefined,
    fieldRun: session.fieldRun ? { ...session.fieldRun, guidance: viewer.kind==="public" ? session.fieldRun.guidance.map(()=>({message:"GUIDANCE RECEIVED"})) : session.fieldRun.guidance } : null,
    pendingEnding: viewer.kind==="facilitator" ? session.pendingEnding : null,
    decisions: viewer.kind==="facilitator"||session.status==="ending" ? session.decisions : undefined,
    history: viewer.kind === "facilitator" || session.status === "ending" ? session.history : session.history.slice(-3),
    stageDefinition: stage, viewer: { ...viewer, name: player?.name || viewer.name },
    privateCard: viewer.kind === "player" && session.stage ? roleCard(session.stage, viewer.role, session.playerCount) : null,
    informationJoins: viewer.kind === "facilitator" ? INFORMATION_JOINS : undefined,
    roles: rolesForCount(session.playerCount), actions: ACTIONS,
    facilitatorCanAdvance: viewer.kind === "facilitator" && session.stageStatus === "resolved" && session.stage < 7,
    facilitatorCanConfirmEnding: viewer.kind==="facilitator"&&session.stage===7&&session.stageStatus==="resolved"&&Boolean(session.pendingEnding),
  };
}
