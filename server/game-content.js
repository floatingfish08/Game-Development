export const ROLES = {
  lead: { short: "LEAD", name: "Station Lead", lens: "Accountability", color: "amber", intervention: "Hold the Clock" },
  signal: { short: "SIG", name: "Signal Analyst", lens: "Meaning & provenance", color: "cyan", intervention: "Recover Fragment" },
  systems: { short: "SYS", name: "Systems Engineer", lens: "System boundaries", color: "violet", intervention: "Trace Dependency" },
  operations: { short: "OPS", name: "Operations Officer", lens: "Bounded action", color: "green", intervention: "Controlled Test" },
  field: { short: "FIELD", name: "Field Liaison", lens: "People in the data", color: "rose", intervention: "Human Check" },
  protocol: { short: "PRO", name: "Protocol Officer", lens: "Risk & guardrails", color: "blue", intervention: "Safety Condition" },
  comms: { short: "COMMS", name: "Comms Officer", lens: "Receiver trust", color: "orange", intervention: "Request Readback" },
};

export const DUO_ROLES = {
  lead: { ...ROLES.lead, short: "CMD", name: "Command & Field", lens: "Accountability · action · people", intervention: "Hold the Clock" },
  signal: { ...ROLES.signal, short: "TECH", name: "Signal & Systems", lens: "Provenance · systems · receiver", intervention: "Recover Fragment" },
};

export const ROLE_CONFIGS = {
  2: DUO_ROLES,
  4: {
    lead: { ...ROLES.lead, short: "CMD/PRO", name: "Command & Protocol", lens: "Accountability · risk · guardrails" },
    signal: ROLES.signal,
    systems: ROLES.systems,
    operations: { ...ROLES.operations, short: "OPS/FIELD", name: "Operations & Field", lens: "Bounded action · people in the data" },
  },
  5: {
    lead: ROLES.lead,
    signal: ROLES.signal,
    systems: ROLES.systems,
    operations: ROLES.operations,
    field: { ...ROLES.field, short: "FIELD/PRO", name: "Field & Protocol", lens: "People · risk · guardrails" },
  },
  6: Object.fromEntries(Object.entries(ROLES).filter(([id]) => id !== "comms")),
  7: ROLES,
};

const CARD_BUNDLES = {
  2: { lead: ["lead", "operations", "field", "protocol"], signal: ["signal", "systems", "comms"] },
  4: { lead: ["lead", "protocol"], signal: ["signal"], systems: ["systems"], operations: ["operations", "field"] },
  5: { lead: ["lead"], signal: ["signal"], systems: ["systems"], operations: ["operations"], field: ["field", "protocol"] },
};

export const roleIdsForCount = playerCount => Object.keys(ROLE_CONFIGS[playerCount] || ROLE_CONFIGS[7]);
export const rolesForCount = playerCount => ROLE_CONFIGS[playerCount] || ROLE_CONFIGS[7];

// Each card: [title, body, confidence, speakPrompt]
// Confidence describes evidence quality, never "correct answer" status.
// Decisive Lower Route / OPERATIONAL conclusions are split across roles — no solo card completes the spine.
const cards = {
  1: {
    lead: ["AUTO-HANDOVER", "No human reviewed the weather-interference classification after the mast strike.", "UNKNOWN", "Who owns the risk if we accept this default?"],
    signal: ["SOURCE AGE", "The unidentified voice fragment is newer than the road camera image marked GREEN.", "LIKELY", "Who is treating GREEN as current?"],
    systems: ["DEPENDENCY", "The handover engine copied route priority from a controller that has not answered diagnostics.", "LIKELY", "What is that controller actually measuring?"],
    operations: ["ROAD FEED", "Camera 02 shows GREEN, but the image timestamp is 19:42—ninety-two minutes old.", "STALE", "Should road priority still guide the search?"],
    field: ["MARA VENN", "Mara’s handset never registered at the lower-road gate. ‘Field check’ is an inferred activity.", "CONTRADICTED", "What did LOWER ROUTE mean to Mara?"],
    protocol: ["RULE 8.12", "Silence cannot be classified as safety when the transmitter is known to be degraded.", "CONFIRMED", "Which handover line violates this?"],
    comms: ["PUBLIC FEED", "Cordon Control will retain any unchallenged Ridge handover item as the official baseline.", "CONFIRMED", "What must we challenge before it files?"],
  },
  2: {
    lead: ["CAPACITY", "Main Relay is mandatory. Only three optional circuits can remain powered.", "CONFIRMED", "What later proof dies if we cut the wrong circuit?"],
    signal: ["BUFFER", "Without Signal Buffer, future voice traffic cannot be replayed—only heard once.", "CONFIRMED", "Can we afford one-shot evidence?"],
    systems: ["LOCK CONTROL", "Lock telemetry and hatch power are separate. Telemetry now may prevent a blind manual descent later.", "CONFIRMED", "What does Lock Control not power?"],
    operations: ["AIR HANDLING", "Keeping intake control alive delays surface contamination by one escalation.", "LIKELY", "What do we trade for air time?"],
    field: ["LOWER ROUTE FEED", "Mara was investigating a route tag missing from the current diagram. A legacy feed may retain it.", "UNKNOWN", "Is that feed a road, or something else?"],
    protocol: ["MILITARY CHANNEL", "The cordon will not accept a later correction unless Ridge establishes a verified channel or stronger proof.", "CONFIRMED", "How will outsiders trust us later?"],
    comms: ["CHANNEL PRIORITY", "Military Channel gives the crew a clean readback path; Main Relay alone only broadcasts outward.", "CONFIRMED", "Who needs a verified path to Cordon?"],
  },
  3: {
    lead: ["AUTO-DISCARD", "WEATHER INTERFERENCE was assigned by a confidence rule, not by source comparison.", "UNKNOWN", "What evidence would overturn the discard?"],
    signal: ["RX-04", "Three bursts share a voice cadence. Clearest phonemes: ‘lower’, ‘route’, possibly ‘not’.", "LIKELY", "Who else can name what LOWER ROUTE is not?"],
    systems: ["AUX-RLY-04", "Correction bursts originate from a legacy controller absent from the current diagram. Route tag: LRR-2.", "CONFIRMED", "Where does LRR-2 live if it is not on the road plan?"],
    operations: ["STALE CLEAN DATA", "The road feed looks clean because its picture has frozen; wind and water telemetry continued updating.", "STALE", "Is clean data the same as true data?"],
    field: ["MARA’S NOTE", "At 20:56 Mara wrote: ‘Aux fault returned. Still chasing a route tag the current diagram does not show.’", "LIKELY", "Who can map her missing tag to a live controller?"],
    protocol: ["QUARANTINE", "Uncertain traffic may be quarantined without being treated as true or destroyed.", "CONFIRMED", "What must we preserve without believing yet?"],
    comms: ["COMPRESSION", "Cordon Control drops sub-carrier content unless Ridge preserves its source header.", "CONFIRMED", "Which source header must survive?"],
  },
  4: {
    lead: ["ONE WINDOW", "There is time for one bounded field question, not a full search.", "CONFIRMED", "What single assumption are we testing?"],
    signal: ["DIRECTION FIND", "RX-04 strengthens when the antenna faces the station foundations, not the lower road.", "LIKELY", "Does that match anyone else’s map?"],
    systems: ["CONDUIT MAP", "A mast conduit exits east but its termination is blank on the current plan.", "UNKNOWN", "What would complete the blank termination?"],
    operations: ["AIR METER", "Abort at 18 ppm or rapid rise. The respirator is protection for withdrawal, not permission to continue.", "CONFIRMED", "What is our named abort rule?"],
    field: ["MARA’S PRACTICE", "Mara signs out gate keys for road checks. The lower-road key is still in the cabinet.", "CONTRADICTED", "If she did not take the road key, where did she go?"],
    protocol: ["RESPIRATOR", "One partial filter. A named abort rule reduces exposure; ‘be careful’ does not.", "CONFIRMED", "Who owns the abort call?"],
    comms: ["RUNNER LINK", "Storm compression allows three short data bursts to the runner before the channel drops.", "CONFIRMED", "What three facts does the runner need?"],
  },
  5: {
    lead: ["TWO STAKES", "Reaching Mara without preserving an upper override may turn one trapped person into several.", "CONFIRMED", "Who stays accountable for the upper override?"],
    signal: ["CURRENT VOICE", "A current voice separates from the old loop: ‘Do not come down blind.’", "LIKELY", "Who else can confirm she is below?"],
    systems: ["INTERLOCK", "Pressure difference, contaminated air, or water ingress can seal the hold. The protection logic is automatic.", "CONFIRMED", "What does OPERATIONAL status measure here?"],
    operations: ["CONTROLLED CRACK", "A two-centimetre opening plus upper watcher permits air and latch checks before descent.", "CONFIRMED", "Who watches while we crack?"],
    field: ["LARK LOG", "The old crew roster remained OPEN while the relay status was recorded OPERATIONAL.", "CONTRADICTED", "If OPERATIONAL did not mean the crew was safe, what did it measure?"],
    protocol: ["OVERRIDE LIMIT", "Manual upper override lasts ninety seconds and must be physically maintained.", "CONFIRMED", "What happens when the ninety seconds end?"],
    comms: ["OCCUPANCY PULSE", "The legacy controller emits one occupied-space pulse beneath the cabin every forty seconds.", "CONFIRMED", "Who connects that pulse to Mara?"],
  },
  6: {
    lead: ["CORRECTION", "The message must change an outside decision, not merely express urgency.", "CONFIRMED", "Which outside action must this force?"],
    signal: ["PROVENANCE", "Cite a preserved current fragment or physical observation; unverified voice alone will be compressed.", "CONFIRMED", "What verified evidence can we cite?"],
    systems: ["INVALID STATUS", "OPERATIONAL measures relay transmission. It makes no claim about crew survival or occupied spaces.", "CONFIRMED", "Who can name the human contradiction?"],
    operations: ["ACTION REQUEST", "Ask for a specific reclassification and rescue route; ‘send help’ leaves routing ambiguous.", "CONFIRMED", "What exact action must Cordon take?"],
    field: ["HUMAN FACT", "Name Mara Venn and the Auxiliary Relay Hold. Do not let ‘occupancy’ replace a person.", "CONFIRMED", "Who will refuse a nameless correction?"],
    protocol: ["MESSAGE ORDER", "Invalid status → human/location → current hazard → evidence → requested action.", "CONFIRMED", "Which slot is still empty?"],
    comms: ["CORDON FILTER", "A complete correction gets one clean transmit. An incomplete one gets a shorter retry at a time cost.", "CONFIRMED", "Are we ready for one clean transmit?"],
  },
  7: {
    lead: ["FINAL SEQUENCE", "Lock, signal, and people actions resolve together. Every lane needs an owner.", "CONFIRMED", "Who owns Lock, Signal, and People?"],
    signal: ["LAST CARRIER", "One stable sub-carrier remains. Use it to transmit or corroborate before status files.", "LIKELY", "Is the correction accepted yet?"],
    systems: ["SEAL CYCLE", "Remote stabilise works only if Lock Control is powered and the interlock rule is known.", "CONFIRMED", "Do we have Lock Knowledge?"],
    operations: ["EXTRACTION", "Mara can move if supplied air and a maintained route coincide. A rushed descent risks joining her.", "LIKELY", "Which people action keeps a route open?"],
    field: ["MARA STATUS", "Mara is conscious but exhausted. She asks the crew not to trade every remaining person for her.", "CONFIRMED", "What does she need that we can still give?"],
    protocol: ["SAFEGUARD", "A physical hold requires an upper watcher. Evacuation requires a named route before Upper Air reaches Critical.", "CONFIRMED", "Which safeguard is still unassigned?"],
    comms: ["READBACK", "Only an explicit RESCUE REQUIRED readback confirms the outside picture has changed.", "CONFIRMED", "Have we heard the readback?"],
  },
};

/** P = primary private evidence, S = supporting, D = decision responsibility */
export const INFORMATION_MATRIX = {
  1: { lead: "D", signal: "S", systems: "P", operations: "S", field: "P", protocol: "P", comms: "S" },
  2: { lead: "D", signal: "P", systems: "P", operations: "P", field: "S", protocol: "S", comms: "S" },
  3: { lead: "D", signal: "P", systems: "P", operations: "S", field: "P", protocol: "S", comms: "P" },
  4: { lead: "D", signal: "S", systems: "S", operations: "P", field: "P", protocol: "P", comms: "S" },
  5: { lead: "D", signal: "S", systems: "P", operations: "S", field: "P", protocol: "P", comms: "S" },
  6: { lead: "D", signal: "P", systems: "P", operations: "S", field: "P", protocol: "P", comms: "P" },
  7: { lead: "D", signal: "P", systems: "P", operations: "P", field: "P", protocol: "P", comms: "P" },
};

/** Required joins — no single private view contains a complete conclusion. */
export const INFORMATION_JOINS = [
  { id: "handover_unsafe", conclusion: "A handover label is unsafe", roles: ["signal", "systems", "field", "protocol"] },
  { id: "signal_preserve", conclusion: "Signal deserves preservation", roles: ["signal", "systems", "field"] },
  { id: "outside_bounded", conclusion: "Outside Run is bounded", roles: ["operations", "protocol", "field"] },
  { id: "lower_route_beneath", conclusion: "Lower Route is beneath the station", roles: ["signal", "systems", "field"] },
  { id: "hatch_safe", conclusion: "Hatch can be approached safely", roles: ["systems", "protocol", "operations"] },
  { id: "operational_invalid", conclusion: "OPERATIONAL is invalid", roles: ["field", "systems", "signal"] },
  { id: "cordon_trust", conclusion: "Cordon should trust the correction", roles: ["signal", "protocol", "field", "comms"] },
  { id: "finale_viable", conclusion: "Finale plan is viable", roles: ["systems", "signal", "operations", "field", "protocol"] },
];

/** Unique phrases that must stay role-private (anti solo-solve / anti leak). */
export const PRIVATE_PHRASE_OWNERS = {
  signal: [/newer than the road camera/i, /Clearest phonemes/i, /faces the station foundations/i],
  systems: [/Route tag: LRR-2/i, /termination is blank/i, /OPERATIONAL measures relay transmission/i],
  field: [/never registered at the lower-road gate/i, /lower-road key is still/i, /roster remained OPEN/i],
  operations: [/ninety-two minutes old/i, /Abort at 18 ppm/i, /two-centimetre opening/i],
  protocol: [/Rule 8\.12|RULE 8\.12/i, /named abort rule reduces exposure/i, /ninety seconds/i],
  comms: [/occupied-space pulse beneath the cabin/i, /RESCUE REQUIRED readback/i],
};

/** When Comms is absent (6-player), fold critical Comms clues into other private views. */
const SIX_PLAYER_SUPPLEMENTS = {
  1: { protocol: ["PUBLIC FEED", "Cordon Control will retain any unchallenged Ridge handover item as the official baseline.", "CONFIRMED", "What must we challenge before it files?"] },
  2: { protocol: ["CHANNEL PRIORITY", "Military Channel gives the crew a clean readback path; Main Relay alone only broadcasts outward.", "CONFIRMED", "Who needs a verified path to Cordon?"] },
  3: { signal: ["COMPRESSION", "Cordon Control drops sub-carrier content unless Ridge preserves its source header.", "CONFIRMED", "Which source header must survive?"] },
  4: { operations: ["RUNNER LINK", "Storm compression allows three short data bursts to the runner before the channel drops.", "CONFIRMED", "What three facts does the runner need?"] },
  5: { systems: ["OCCUPANCY PULSE", "The legacy controller emits one occupied-space pulse beneath the cabin every forty seconds.", "CONFIRMED", "Who connects that pulse to Mara?"] },
  6: { protocol: ["CORDON FILTER", "A complete correction gets one clean transmit. An incomplete one gets a shorter retry at a time cost.", "CONFIRMED", "Are we ready for one clean transmit?"] },
  7: { signal: ["READBACK", "Only an explicit RESCUE REQUIRED readback confirms the outside picture has changed.", "CONFIRMED", "Have we heard the readback?"] },
};

export const STAGES = {
  1: {
    title: "Challenge the handover", kicker: "AUTO-HANDOVER", duration: 240,
    image: "relay-control-room.webp", mechanic: "holds",
    objective: "Place three human audit holds before the remaining defaults become working facts.",
    scene: "The outgoing crew left in a hurry. Mara is absent. The station is calmly filling gaps.",
    options: [
      ["event", "LOCAL SERVICE FAULT"], ["public", "NO WIDER RISK CONFIRMED"],
      ["mara", "VENN ON LOWER ROUTE FIELD CHECK"], ["road", "ROAD FEED HAS PRIORITY"],
      ["voice", "DISCARD VOICE AS WEATHER INTERFERENCE"],
    ],
  },
  2: {
    title: "Keep the station alive", kicker: "DEGRADED POWER", duration: 300,
    image: "station-exterior.webp", mechanic: "power",
    objective: "Power three optional circuits. What you preserve changes what the station can prove later.",
    scene: "Lightning damages the mast. Main Relay survives, but capacity does not.",
    options: [["buffer","SIGNAL BUFFER"],["military","MILITARY CHANNEL"],["road","ROAD FEED"],["lower","LOWER ROUTE FEED"],["lock","LOCK CONTROL"],["air","AIR HANDLING"]],
  },
  3: {
    title: "Decide what to trust", kicker: "BAD SIGNAL", duration: 360,
    image: "relay-control-room.webp", mechanic: "signals",
    objective: "Allocate three reconstruction slots across clean and degraded traffic.",
    scene: "Official traffic, correction codes, and a human cadence overlap beneath the storm.",
    options: [["voice","RX-04 / UNIDENTIFIED VOICE"],["bulletin","CV-PUBLIC / OFFICIAL BULLETIN"],["correction","AUX-04 / CORRECTION BURST"]],
  },
  4: {
    title: "Test Lower Route", kicker: "OUTSIDE RUN", duration: 360,
    image: "outside-run.webp", mechanic: "outside",
    objective: "Use one respirator window to test the most dangerous assumption with a clear abort rule.",
    scene: "The lower road is flooding. Cordon Control allows one short external movement window.",
    options: [["gate","LOWER ROAD GATE"],["repeater","EXTERNAL REPEATER"],["conduit","MAST CONDUIT"],["inside","STAY INSIDE"]],
  },
  5: {
    title: "Open the buried station", kicker: "HATCH & HOLD", duration: 420,
    image: "containment-hatch.webp", consequenceImage: "auxiliary-relay-hold.webp", mechanic: "hatch",
    objective: "Verify Mara without letting the containment interlock turn the hold into a trap.",
    scene: "The conduit ends beneath rack B. Upper Air worsens. The old controller recommends the hold as refuge.",
    options: [["remote","REMOTE INSPECT"],["controlled","CONTROLLED CRACK + WATCHER"],["descent","FULL OVERRIDE + DESCENT"],["delay","DELAY"]],
  },
  6: {
    title: "Build the truth", kicker: "EMERGENCY CORRECTION", duration: 360,
    image: "calder-vale-cordon.webp", mechanic: "correction",
    objective: "Construct a specific, corroborated correction strong enough for Cordon Control to act.",
    scene: "Ridge is live but unverified. The outside authority needs evidence, not volume.",
    options: [],
  },
  7: {
    title: "Survive the correction", kicker: "FINALE", duration: 540,
    image: "mara-venn-below.webp", mechanic: "finale",
    objective: "Assign the crew across Lock, Signal, and People. Control the physical truth and the official truth.",
    scene: "The hold is sealing. The surface is failing. The final status is beginning to file.",
    options: [],
  },
};

export const ACTIONS = {
  signalActions: { preserve: ["PRESERVE RAW",1], replay: ["REPLAY & REBUILD",2], quarantine: ["QUARANTINE COPY",1], discard: ["DISCARD",0] },
  fieldMoves: [["observe","OBSERVE / VERIFY"],["advance","ADVANCE / ACCEPT EXPOSURE"],["withdraw","WITHDRAW ON ABORT RULE"]],
  hatchResources: [["reserve","RESERVE RESPIRATOR"],["mara","SEND TO MARA"],["descent","ASSIGN TO DESCENT"]],
  correction: {
    invalid: [["operational","OPERATIONAL STATUS INVALID"],["weather","WEATHER CLASSIFICATION INVALID"],["road","ROAD FEED INVALID"]],
    human: [["mara_below","MARA VENN / LOWER ROUTE HOLD"],["crew_surface","SURFACE CREW / RIDGE CABIN"],["unknown","OCCUPANCY UNKNOWN"]],
    hazard: [["lock_air","CONTAINMENT LOCK + CONTAMINATED AIR"],["storm","STORM DAMAGE"],["road","LOWER ROAD FLOODING"]],
    evidence: [["auto","BEST VERIFIED EVIDENCE"],["voice","DEGRADED VOICE ONLY"],["status","RELAY STATUS LOG"],["physical","PHYSICAL ROUTE EVIDENCE"]],
    request: [["rescue","RECLASSIFY AS HUMAN RESCUE / EXTRACTION"],["inspect","REQUEST TECHNICAL INSPECTION"],["ack","ACKNOWLEDGE RIDGE TRAFFIC"]],
  },
  finale: {
    lock: [["stabilise","REMOTE STABILISE"],["hold","PHYSICAL HOLD + WATCHER"],["override","FULL OVERRIDE"],["leave","LEAVE INTERLOCK"]],
    signal: [["transmit","TRANSMIT CORRECTION"],["corroborate","SUPPLY FINAL PROOF"],["maintain","MAINTAIN CARRIER"],["silent","ABANDON SIGNAL"]],
    people: [["extract","EXTRACT MARA"],["supply","SUPPLY AIR + RESCUE PATH"],["verify","VERIFY LOCATION"],["evacuate","EVACUATE RIDGE"]],
  },
};

export const SIGNAL_TRANSMISSIONS = {
  1: { source: "RX-04 / SUB-CARRIER", integrity: 18, transcript: "…lower… route… not…", instruction: "LOW CONFIDENCE / AUTO-DISCARD PENDING" },
  2: { source: "AUX-04 / FALLBACK BUS", integrity: 24, transcript: "…route tag LRR-2… carrier beneath relay traffic…", instruction: "LEGACY SOURCE / DIAGRAM ABSENT" },
  3: { source: "RX-04 + AUX-04", integrity: 42, transcript: "…not road… under… do not classify silence as safe…", instruction: "RECONSTRUCTION REQUIRED" },
  4: { source: "DIRECTION FIND / RUNNER LINK", integrity: 57, transcript: "…signal strengthens toward foundations… conduit returns beneath station…", instruction: "PHYSICAL CORROBORATION AVAILABLE" },
  5: { source: "CURRENT VOICE / LOWER HOLD", integrity: 71, transcript: "…do not come down blind… hold sealed… it counts you…", instruction: "CURRENT HUMAN CADENCE" },
  6: { source: "MARA VENN / DEGRADED", integrity: 84, transcript: "Operational is the relay. Not us. Tell them the hold is occupied.", instruction: "EVIDENCE-BACKED CORRECTION REQUIRED" },
  7: { source: "LAST CARRIER / MARA VENN", integrity: 93, transcript: "Do not let it call me safe.", instruction: "FINAL READBACK WINDOW" },
};

export const DEBRIEF_STEPS = [
  { id: 1, title: "Immediate reactions", prompt: "What felt tense, confusing, or dangerous before we explain it?" },
  { id: 2, title: "Reconstruct the status failures", prompt: "Where did OPERATIONAL, GREEN, NO ACTIVE DISTRESS, or LOWER ROUTE become misleading?" },
  { id: 3, title: "Role map", prompt: "What did each responsibility protect, and which perspective was easiest to ignore?" },
  { id: 4, title: "Hesitation diagnosis", prompt: "Where did hesitation come from: evidence, risk, people, ownership, control, or technical exposure?" },
  { id: 5, title: "AI workplace bridge", prompt: "Which real dashboard, AI output, vendor tool, or automated label behaves like OPERATIONAL?" },
  { id: 6, title: "First step", prompt: "What one label, output, or workflow will each participant challenge or clarify at work?" },
];

export const PARTICIPANT_CARE = "This is a fictional survival-horror leadership exercise involving emergency pressure, missing-person themes and implied danger. If at any point you need to step out of the scenario, message the facilitator privately and we will accommodate that without drawing attention to it.";

export const ROLE_MAP = {
  lead: { area: "Self-readiness", question: "How did you hold accountability without becoming the only expert?" },
  signal: { area: "Leadership fluency", question: "How did you challenge clean or fluent signals without freezing action?" },
  systems: { area: "Roadmap and learning", question: "What did the system actually measure, and what did the team assume it measured?" },
  operations: { area: "Value discovery", question: "Which bounded test created the most useful evidence?" },
  field: { area: "People and adoption", question: "Who was missing from the data, and how did you keep them visible?" },
  protocol: { area: "Risk and guardrails", question: "Where did uncertainty need to be explicit before action?" },
  comms: { area: "External trust", question: "What made the correction credible to a receiver outside the team?" },
};

export const READINESS_PROFILES = [
  { id: "risk_aware", title: "Risk-Aware Leader", prompt: "Noticed hazards, confidence limits, and guardrails early.", risk: "May over-protect and slow action." },
  { id: "practical_sceptic", title: "Practical Sceptic", prompt: "Challenged clean labels and asked what evidence supported them.", risk: "May keep interrogating after action is needed." },
  { id: "people_first", title: "People-First Leader", prompt: "Kept Mara, the Lark Shift, and responder impact visible.", risk: "May let human urgency outrun system constraints." },
  { id: "stuck_starter", title: "Stuck Starter", prompt: "Waited for clarity while defaults or hazards hardened.", risk: "Needs a smaller bounded first move." },
  { id: "exposed", title: "Exposed Leader", prompt: "Technical ambiguity made it tempting to defer or stay quiet.", risk: "Needs permission and language to question the system." },
];

export const PLAYTEST_CRITERIA = [
  { id: "clarity", title: "Clarity", question: "Did players understand what they were being asked to do?" },
  { id: "thrill", title: "Thrill", question: "Did it feel tense rather than administrative?" },
  { id: "survival", title: "Survival stakes", question: "Did the crew feel personally endangered as well as responsible for Mara?" },
  { id: "ai_alignment", title: "AI alignment", question: "Could players explain the AI-leadership lesson afterwards?" },
  { id: "facilitation", title: "Facilitation", question: "Could one facilitator run it without drowning?" },
  { id: "role_value", title: "Role value", question: "Did each responsibility materially matter?" },
  { id: "remote_fit", title: "Teams / Zoom fit", question: "Did the remote format support coordination?" },
];

export function roleMapForCount(playerCount) {
  const roles = rolesForCount(playerCount);
  return Object.fromEntries(Object.entries(roles).map(([role, configuration]) => {
    const bundle = CARD_BUNDLES[playerCount]?.[role] || [role];
    return [role, {
      name: configuration.name,
      short: configuration.short,
      areas: bundle.map(id => ROLE_MAP[id]?.area).filter(Boolean),
      questions: bundle.map(id => ROLE_MAP[id]?.question).filter(Boolean),
    }];
  }));
}

function cardEntry(stage, role) {
  return cards[stage]?.[role] || ["NO PRIVATE UPDATE", "Coordinate with the crew using the shared station picture.", "UNKNOWN", "Who needs to know this?"];
}

function formatCardLine(roleId, entry) {
  const [title, body, confidence, prompt] = entry;
  return { roleId, title, body, confidence: confidence || "UNKNOWN", prompt: prompt || "Who needs to know this?" };
}

export function roleCard(stage, role, playerCount = 7) {
  const configuration = rolesForCount(playerCount);
  const bundle = CARD_BUNDLES[playerCount]?.[role];
  const lines = [];
  if (bundle) {
    for (const id of bundle) lines.push(formatCardLine(id, cardEntry(stage, id)));
  } else {
    lines.push(formatCardLine(role, cardEntry(stage, role)));
  }
  if (playerCount === 6 && SIX_PLAYER_SUPPLEMENTS[stage]?.[role]) {
    lines.push(formatCardLine("comms", SIX_PLAYER_SUPPLEMENTS[stage][role]));
  }
  const primary = lines[0];
  const title = bundle || lines.length > 1 ? `${configuration[role].name.toUpperCase()} BRIEF` : primary.title;
  const body = lines.length === 1
    ? primary.body
    : lines.map(line => `${ROLES[line.roleId]?.short || line.roleId.toUpperCase()} — ${line.body}`).join("\n");
  const confidence = lines.some(line => line.confidence === "CONTRADICTED") ? "CONTRADICTED"
    : lines.some(line => line.confidence === "STALE") ? "STALE"
    : lines.some(line => line.confidence === "LIKELY") ? "LIKELY"
    : lines.some(line => line.confidence === "UNKNOWN") ? "UNKNOWN"
    : "CONFIRMED";
  return {
    title,
    body,
    confidence,
    prompt: primary.prompt,
    intervention: configuration[role]?.intervention || ROLES[role]?.intervention,
  };
}

export function publicContent() {
  return {
    roles: ROLES, roleConfigs: ROLE_CONFIGS, stages: STAGES, actions: ACTIONS, debriefSteps: DEBRIEF_STEPS,
    participantCare: PARTICIPANT_CARE, roleMap: ROLE_MAP, readinessProfiles: READINESS_PROFILES, playtestCriteria: PLAYTEST_CRITERIA,
    informationMatrix: INFORMATION_MATRIX, informationJoins: INFORMATION_JOINS,
  };
}
