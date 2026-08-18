import { actions, SESSION_CODE } from "./data.js";

export const STORAGE_KEY = "blackout-ridge-m2-state-v1";
const CHANNEL_NAME = "blackout-ridge-m2";

export function createInitialState() {
  return {
    revision: 0,
    sessionCode: SESSION_CODE,
    playerCount: 7,
    phase: "briefing",
    timer: {
      duration: 360,
      remaining: 360,
      running: false,
      endAt: null,
    },
    joinedRoles: {},
    reports: {},
    draft: {
      voice: "preserve",
      bulletin: "quarantine",
      correction: "preserve",
    },
    hint: null,
    notice: "Awaiting facilitator start",
    recoveryUsed: false,
    recoveryApplied: false,
    result: null,
    audit: [],
  };
}

function timerRemaining(timer, now = Date.now()) {
  if (!timer.running || !timer.endAt) return timer.remaining;
  return Math.max(0, Math.ceil((timer.endAt - now) / 1000));
}

export function getRemaining(state, now = Date.now()) {
  return timerRemaining(state.timer, now);
}

export function allocationCost(draft) {
  return Object.values(draft).reduce((total, action) => total + (actions[action]?.cost ?? 0), 0);
}

export function evaluateAllocation(draft, recoveryApplied = false) {
  const voice = draft.voice;
  const correction = draft.correction;
  const voiceSafe = ["preserve", "replay", "quarantine"].includes(voice);
  const correctionSafe = ["preserve", "replay", "quarantine"].includes(correction);

  let quality = 0;
  if (voiceSafe || correctionSafe) quality = 1;
  if (voiceSafe && correctionSafe) quality = 2;
  if ((voice === "replay" && correctionSafe) || (correction === "replay" && voiceSafe)) quality = 3;
  if (recoveryApplied && quality < 3) quality += 1;

  const evidence = [];
  if (quality >= 1) evidence.push("Structured traffic");
  if (quality >= 2) evidence.push("‘Not road’ fragment");
  if (quality >= 3) evidence.push("Route beneath station");

  return {
    quality,
    cost: allocationCost(draft),
    evidence,
    resolvedAt: Date.now(),
  };
}

function audit(state, text) {
  return [...state.audit.slice(-11), { at: Date.now(), text }];
}

export function reduceState(state, event, now = Date.now()) {
  const next = structuredClone(state);

  switch (event.type) {
    case "SET_PLAYER_COUNT":
      if (next.phase !== "briefing") return state;
      next.playerCount = event.count === 6 ? 6 : 7;
      if (next.playerCount === 6) delete next.joinedRoles.comms;
      next.audit = audit(next, `${next.playerCount}-player mode selected`);
      break;
    case "JOIN_ROLE":
      next.joinedRoles[event.role] = {
        name: event.name || "Connected",
        joinedAt: now,
      };
      next.audit = audit(next, `${event.role} terminal connected`);
      break;
    case "START":
      if (next.phase === "resolved") return state;
      next.phase = "live";
      next.timer.running = true;
      next.timer.endAt = now + next.timer.remaining * 1000;
      next.notice = "Challenge live — three bandwidth slots available";
      next.audit = audit(next, "Challenge started");
      break;
    case "PAUSE": {
      if (!next.timer.running) return state;
      next.timer.remaining = timerRemaining(next.timer, now);
      next.timer.running = false;
      next.timer.endAt = null;
      next.notice = "Clock paused by facilitator";
      next.audit = audit(next, "Clock paused");
      break;
    }
    case "RESUME":
      if (next.phase !== "live" || next.timer.running) return state;
      next.timer.running = true;
      next.timer.endAt = now + next.timer.remaining * 1000;
      next.notice = "Challenge resumed";
      next.audit = audit(next, "Clock resumed");
      break;
    case "ADD_TIME": {
      const addition = event.seconds ?? 30;
      const remaining = timerRemaining(next.timer, now) + addition;
      next.timer.remaining = remaining;
      if (next.timer.running) next.timer.endAt = now + remaining * 1000;
      next.audit = audit(next, `${addition} seconds added`);
      break;
    }
    case "SET_DRAFT":
      if (next.phase !== "live" || !actions[event.action]) return state;
      next.draft[event.stream] = event.action;
      next.audit = audit(next, `Lead set ${event.stream} to ${event.action}`);
      break;
    case "SUBMIT_REPORT":
      if (next.phase !== "live") return state;
      next.reports[event.role] = {
        recommendation: event.recommendation,
        note: String(event.note || "").slice(0, 120),
        submittedAt: now,
      };
      next.audit = audit(next, `${event.role} shared an assessment`);
      break;
    case "SHOW_HINT":
      next.hint = event.message || "Compare source age and purpose—not just confidence.";
      next.audit = audit(next, "Contextual hint shown");
      break;
    case "CLEAR_HINT":
      next.hint = null;
      break;
    case "COMMIT":
      if (next.phase !== "live" || allocationCost(next.draft) > 3) return state;
      next.phase = "resolved";
      next.timer.remaining = timerRemaining(next.timer, now);
      next.timer.running = false;
      next.timer.endAt = null;
      next.result = evaluateAllocation(next.draft, next.recoveryApplied);
      next.notice = "Allocation committed — consequence available";
      next.audit = audit(next, `Allocation resolved at quality ${next.result.quality}`);
      break;
    case "EXPIRE":
      if (next.phase !== "live") return state;
      next.timer.remaining = 0;
      next.timer.running = false;
      next.timer.endAt = null;
      next.phase = "resolved";
      next.result = evaluateAllocation(next.draft, next.recoveryApplied);
      next.result.expired = true;
      next.notice = "Decision window closed — current allocation applied";
      next.audit = audit(next, "Timer expired; current allocation resolved");
      break;
    case "RECOVER_FRAGMENT":
      if (next.phase !== "resolved" || next.recoveryUsed || next.result?.quality >= 3) return state;
      next.recoveryUsed = true;
      next.recoveryApplied = true;
      next.result = evaluateAllocation(next.draft, true);
      next.result.recovered = true;
      next.notice = "Signal Analyst recovered a partial fragment";
      next.audit = audit(next, "Recover Fragment intervention used");
      break;
    case "RESET":
      return createInitialState();
    default:
      return state;
  }

  next.revision = state.revision + 1;
  return next;
}

export class PrototypeStore {
  constructor() {
    this.listeners = new Set();
    this.channel = "BroadcastChannel" in window ? new BroadcastChannel(CHANNEL_NAME) : null;
    this.channel?.addEventListener("message", (event) => this.receive(event.data));
    window.addEventListener("storage", (event) => {
      if (event.key === STORAGE_KEY && event.newValue) this.receive(JSON.parse(event.newValue));
    });
  }

  read() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : createInitialState();
    } catch {
      return createInitialState();
    }
  }

  dispatch(event) {
    const current = this.read();
    const next = reduceState(current, event);
    if (next === current) return current;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    this.channel?.postMessage(next);
    this.emit(next);
    return next;
  }

  receive(incoming) {
    const current = this.read();
    if (!incoming || incoming.revision < current.revision) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(incoming));
    this.emit(incoming);
  }

  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  emit(state) {
    this.listeners.forEach((listener) => listener(state));
  }
}
