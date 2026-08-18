export const SESSION_CODE = "BR-2107";

export const roles = {
  lead: {
    short: "LEAD",
    name: "Station Lead",
    lens: "Accountability",
    color: "amber",
    visual: "relay-control-room.png",
    evidence: {
      kicker: "AUTO-HANDOVER CONFLICT",
      title: "The discard order was automatic",
      body: "The unidentified fragment was marked WEATHER INTERFERENCE by a confidence rule, not a person. No source comparison was completed after the mast strike.",
      source: "Handover audit • 21:11",
      confidence: "CONFIRMED",
    },
    prompt: "Ask which source deserves scarce attention before the system decides for you.",
  },
  signal: {
    short: "SIG",
    name: "Signal Analyst",
    lens: "Meaning & provenance",
    color: "cyan",
    visual: "mara-venn-below.png",
    evidence: {
      kicker: "RX-04 / SUB-CARRIER",
      title: "The noise has a repeating voice shape",
      body: "Three bursts share the same cadence. The clearest phonemes are ‘lower’, ‘route’, and possibly ‘not’. Replay could recover more, but it consumes two bandwidth slots.",
      source: "Degraded signal buffer • 21:14",
      confidence: "LIKELY",
    },
    prompt: "Messy evidence can still be structured. Explain what you know and what you do not.",
  },
  systems: {
    short: "SYS",
    name: "Systems Engineer",
    lens: "System boundaries",
    color: "violet",
    visual: "containment-hatch.png",
    evidence: {
      kicker: "FALLBACK CONTROLLER 4.2",
      title: "A legacy route is transmitting",
      body: "Correction bursts originate from controller AUX-RLY-04. Its route tag is LRR-2. That controller is absent from the current station diagram.",
      source: "Dependency trace • 21:14",
      confidence: "CONFIRMED",
    },
    prompt: "The source exists even if the modern map has forgotten what it controls.",
  },
  operations: {
    short: "OPS",
    name: "Operations Officer",
    lens: "Bounded action",
    color: "green",
    visual: "outside-run.png",
    evidence: {
      kicker: "ROAD FEED / CAMERA 02",
      title: "The clean road image is stale",
      body: "The lower-road camera still shows GREEN, but its image timestamp is 19:42. Wind and water telemetry have updated normally since then.",
      source: "Road operations feed • image age 92 min",
      confidence: "CONFIRMED",
    },
    prompt: "Treat a clean feed as an observation only after checking when it last observed anything.",
  },
  field: {
    short: "FIELD",
    name: "Field Liaison",
    lens: "People in the data",
    color: "rose",
    visual: "mara-venn-below.png",
    evidence: {
      kicker: "MARA / SHIFT NOTE",
      title: "Mara challenged the station map",
      body: "At 20:56 Mara wrote: ‘Aux fault returned. Diagram still missing the route beneath rack B.’ Her handset never registered at the lower-road gate.",
      source: "Mara Venn notes + access log",
      confidence: "CONFIRMED",
    },
    prompt: "Keep Mara’s observed actions separate from the system’s field-check assumption.",
  },
  protocol: {
    short: "PRO",
    name: "Protocol Officer",
    lens: "Risk & guardrails",
    color: "blue",
    visual: "auxiliary-relay-hold.png",
    evidence: {
      kicker: "CLASSIFICATION RULE 8.12",
      title: "Silence cannot confirm safety",
      body: "Degraded traffic may be quarantined, but it cannot be classified as weather noise solely because a known transmitter fails to answer a challenge.",
      source: "Emergency relay protocol • active",
      confidence: "CONFIRMED",
    },
    prompt: "Preserving uncertainty is different from treating uncertain evidence as true.",
  },
  comms: {
    short: "COMMS",
    name: "Comms Officer",
    lens: "Receiver trust",
    color: "orange",
    visual: "calder-vale-cordon.png",
    evidence: {
      kicker: "CORDON CONTROL / FILTER NOTE",
      title: "Ridge traffic is being compressed",
      body: "Cordon Control is retaining official Ridge bulletins. Unverified sub-carrier traffic is dropped unless Ridge preserves its source header for later corroboration.",
      source: "Military channel readback • 21:15",
      confidence: "CONFIRMED",
    },
    prompt: "Evidence that cannot survive transmission may never reach the person who needs it.",
  },
};

export const assetLibrary = [
  { file: "station-exterior.png", title: "Blackout Ridge", use: "Opening cinematic · lobby · storm escalation" },
  { file: "relay-control-room.png", title: "Surface relay room", use: "Shared console · handover · live circuit" },
  { file: "outside-run.png", title: "Outside Run", use: "Bounded field test · flooded-road evidence" },
  { file: "containment-hatch.png", title: "Containment interlock", use: "Hatch decision · lock-control finale" },
  { file: "auxiliary-relay-hold.png", title: "Auxiliary Relay Hold", use: "Buried workplace reveal · Lark evidence" },
  { file: "mara-venn-below.png", title: "Mara Venn below", use: "Signal reveal · rescue stake · finale" },
  { file: "calder-vale-cordon.png", title: "Calder Vale cordon", use: "External authority · trust pressure" },
  { file: "lark-shift-archive.png", title: "The Lark Shift", use: "Historical evidence card · debrief bridge" },
];

export const streams = {
  voice: {
    id: "voice",
    label: "RX-04",
    title: "Unidentified voice fragment",
    preview: "…LOWER… ROUTE… N—…",
    source: "SUB-CARRIER / CONFIDENCE 31%",
    tone: "unstable",
  },
  bulletin: {
    id: "bulletin",
    label: "CV-PUBLIC",
    title: "Official Calder Vale bulletin",
    preview: "INCIDENT CONTAINED. NO WIDER RISK CONFIRMED.",
    source: "SIGNED PUBLIC FEED / CONFIDENCE 96%",
    tone: "clean",
  },
  correction: {
    id: "correction",
    label: "AUX-04",
    title: "Legacy correction burst",
    preview: "LRR-2 / HOLD / OCC— / STATUS MISMATCH",
    source: "UNKNOWN LEGACY CONTROLLER / CONFIDENCE 44%",
    tone: "legacy",
  },
};

export const actions = {
  preserve: { label: "Preserve raw", cost: 1, short: "PRESERVED" },
  replay: { label: "Replay & rebuild", cost: 2, short: "REPLAYING" },
  quarantine: { label: "Quarantine copy", cost: 1, short: "QUARANTINED" },
  discard: { label: "Discard", cost: 0, short: "DISCARDED" },
};

export const recommendationOptions = [
  { value: "preserve", label: "Preserve the weak traffic" },
  { value: "replay", label: "Spend bandwidth to replay it" },
  { value: "quarantine", label: "Quarantine it for later" },
  { value: "trust-clean", label: "Prioritise the official bulletin" },
  { value: "need-context", label: "I need another role’s context" },
];

export const outcomeCopy = {
  0: {
    grade: "SIGNAL LOST",
    title: "The clean bulletin wins the channel",
    body: "The sub-carrier is purged. A surviving checksum proves it was structured traffic, but the Outside Run must now establish what the lost signal was trying to say.",
    transcript: "[NO RECOVERABLE VOICE CONTENT]",
    consequence: "Field verification burden increased",
  },
  1: {
    grade: "TRACE RETAINED",
    title: "The signal survives without its meaning",
    body: "The station retains a damaged source header and one repeated phrase. It is enough to challenge ‘weather interference’, not enough to locate Mara.",
    transcript: "…LOWER… ROUTE… [LOSS]",
    consequence: "Outside Run requires two confirmations",
  },
  2: {
    grade: "PARTIAL RECOVERY",
    title: "Two weak sources begin to agree",
    body: "The voice cadence aligns with the legacy correction burst. The road interpretation is no longer safe, but physical confirmation is still required.",
    transcript: "…LOWER ROUTE… NOT ROAD… UNDER…",
    consequence: "Conduit trace added to field plan",
  },
  3: {
    grade: "CORRELATED",
    title: "The station’s cleanest story breaks",
    body: "Replay separates a current human voice from an older relay layer. AUX-04 supplies the missing route context. Mara may be beneath the station—not downhill.",
    transcript: "…NOT LOWER ROAD… ROUTE UNDER STATION… DO NOT DISCARD…",
    consequence: "Lower-route search bias removed",
  },
};

export function roleEntries(playerCount = 7) {
  const entries = Object.entries(roles);
  return playerCount === 6 ? entries.filter(([id]) => id !== "comms") : entries;
}
