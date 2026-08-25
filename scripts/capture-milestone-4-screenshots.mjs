#!/usr/bin/env node
/**
 * Capture current Milestone 4 screenshots against a live dev server.
 * Usage: npm run dev (separate terminal) then node scripts/capture-milestone-4-screenshots.mjs
 */

import { execFileSync, spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const outDir = process.env.CAPTURE_OUT
  ? path.resolve(root, process.env.CAPTURE_OUT)
  : path.join(root, "docs/reports/screenshots/milestone-4-latest");
const base = process.env.CAPTURE_BASE || "http://127.0.0.1:4173";

const chromeCandidates = [
  "google-chrome-stable",
  "google-chrome",
  "chromium-browser",
  "chromium",
];

function chromeBin() {
  for (const name of chromeCandidates) {
    try {
      execFileSync("which", [name], { stdio: "pipe" });
      return name;
    } catch {}
  }
  throw new Error("No headless Chrome found (google-chrome-stable or chromium).");
}

async function api(pathname, { method = "GET", token, body, retries = 3 } = {}) {
  let lastError;
  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      const headers = {};
      if (token) headers.authorization = `Bearer ${token}`;
      if (body) headers["content-type"] = "application/json";
      const response = await fetch(`${base}${pathname}`, {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined,
      });
      const text = await response.text();
      const data = text.trim() ? JSON.parse(text) : {};
      if (!response.ok) throw new Error(data.error || `${method} ${pathname} failed (${response.status})`);
      return data;
    } catch (error) {
      lastError = error;
      await new Promise(resolve => setTimeout(resolve, 250 * (attempt + 1)));
    }
  }
  throw lastError;
}

async function action(code, token, type, payload = {}) {
  return api(`/api/sessions/${code}/action`, { method: "POST", token, body: { type, payload } });
}

function shot(chrome, name, url, { width = 1440, height = 900, skipIfExists = false } = {}) {
  const file = path.join(outDir, name);
  const captureFile = file.endsWith(".webp") ? file.replace(/\.webp$/, ".capture.png") : file;
  fs.mkdirSync(outDir, { recursive: true });
  if (skipIfExists && fs.existsSync(file) && fs.statSync(file).size > 5000) {
    console.log("Skipped (exists)", name);
    return;
  }
  execFileSync(
    chrome,
    [
      "--headless=new",
      "--disable-gpu",
      "--no-first-run",
      "--hide-scrollbars",
      "--virtual-time-budget=8000",
      "--window-size=" + width + "," + height,
      "--screenshot=" + captureFile,
      url,
    ],
    { stdio: "pipe", timeout: 45000 },
  );
  if (captureFile !== file) {
    execFileSync("convert", [captureFile, "-quality", "82", "-define", "webp:method=6", file], {
      stdio: "pipe",
      timeout: 45000,
    });
    fs.unlinkSync(captureFile);
  }
  if (!fs.existsSync(file) || fs.statSync(file).size < 5000) {
    throw new Error(`Screenshot too small or missing: ${name}`);
  }
  console.log("Captured", name);
}

function page(view, code, token, extra = "") {
  const params = new URLSearchParams({ view, snapshot: "1" });
  if (code) params.set("session", code);
  if (token) params.set("token", token);
  for (const part of extra.split("&").filter(Boolean)) {
    const [key, value] = part.split("=");
    params.set(key, value);
  }
  return `${base}/?${params}`;
}

async function healthCheck() {
  try {
    await api("/api/health");
  } catch {
    throw new Error(`Dev server not reachable at ${base}. Run: npm run dev`);
  }
}

async function createDemoSession() {
  const { code, facilitatorToken } = await api("/api/sessions", {
    method: "POST",
    body: { playerCount: 6 },
  });
  const tokens = { facilitator: facilitatorToken };
  const roster = {
    lead: "Avery Chen",
    signal: "Sam Ortiz",
    systems: "Rin Patel",
    operations: "Jordan Blake",
    field: "Mara Ellis",
    protocol: "Lee Nguyen",
  };
  for (const [role, name] of Object.entries(roster)) {
    const joined = await api(`/api/sessions/${code}/join`, {
      method: "POST",
      body: { role, name },
    });
    tokens[role] = joined.playerToken;
  }
  return { code, tokens };
}

async function advanceToStage(code, tokens, targetStage) {
  await action(code, tokens.facilitator, "ACK_SAFETY");
  await action(code, tokens.facilitator, "START_GAME");

  const steps = [
    () => action(code, tokens.facilitator, "UPDATE_DRAFT", { holds: ["mara", "voice", "road"] }),
    () => action(code, tokens.facilitator, "COMMIT_STAGE"),
    () => action(code, tokens.facilitator, "ADVANCE_STAGE"),
    () => action(code, tokens.facilitator, "UPDATE_DRAFT", { powered: ["buffer", "military", "lock"] }),
    () => action(code, tokens.facilitator, "COMMIT_STAGE"),
    () => action(code, tokens.facilitator, "ADVANCE_STAGE"),
    () => action(code, tokens.facilitator, "UPDATE_DRAFT", { voice: "replay", bulletin: "discard", correction: "preserve" }),
    () => action(code, tokens.facilitator, "COMMIT_STAGE"),
    () => action(code, tokens.facilitator, "ADVANCE_STAGE"),
  ];

  let stage = 1;
  for (const step of steps) {
    await step();
    const state = await api(`/api/sessions/${code}/state`, { token: tokens.facilitator });
    stage = state.stage;
    if (stage >= targetStage) return state;
  }
  return api(`/api/sessions/${code}/state`, { token: tokens.facilitator });
}

async function beginOutsideRun(code, tokens) {
  await action(code, tokens.facilitator, "UPDATE_DRAFT", {
    destination: "conduit",
    runner: "operations",
    abort: "Withdraw at 18 ppm or rapid rise",
  });
  await action(code, tokens.facilitator, "COMMIT_STAGE");
}

async function completeOutsideRun(code, tokens) {
  for (let i = 0; i < 3; i++) {
    await action(code, tokens.operations, "FIELD_MOVE", { move: "observe" });
  }
  await action(code, tokens.facilitator, "ADVANCE_STAGE");
}

async function advanceThroughFinale(code, tokens) {
  await action(code, tokens.facilitator, "UPDATE_DRAFT", {
    procedure: "controlled",
    respirator: "mara",
    watcher: "protocol",
  });
  await action(code, tokens.facilitator, "COMMIT_STAGE");
  await action(code, tokens.facilitator, "ADVANCE_STAGE");

  await action(code, tokens.facilitator, "UPDATE_DRAFT", {
    invalid: "operational",
    human: "mara_below",
    hazard: "lock_air",
    evidence: "auto",
    request: "rescue",
  });
  await action(code, tokens.facilitator, "COMMIT_STAGE");
  await action(code, tokens.facilitator, "ADVANCE_STAGE");

  await action(code, tokens.facilitator, "UPDATE_DRAFT", {
    lock: "stabilise",
    lockLead: "systems",
    signal: "transmit",
    signalLead: "signal",
    people: "supply",
    peopleLead: "field",
  });
  await action(code, tokens.facilitator, "COMMIT_STAGE");

  await action(code, tokens.facilitator, "UPDATE_DRAFT", {
    lock: "hold",
    lockLead: "protocol",
    signal: "transmit",
    signalLead: "signal",
    people: "extract",
    peopleLead: "operations",
  });
  await action(code, tokens.facilitator, "COMMIT_STAGE");
  await action(code, tokens.facilitator, "CONFIRM_ENDING");
  await action(code, tokens.facilitator, "SET_DEBRIEF_STEP", { step: 3 });
  await action(code, tokens.lead, "SAVE_FIRST_STEP", {
    note: "I will challenge any dashboard that reports green when a human source is missing.",
  });
}

async function main() {
  await healthCheck();
  const chrome = chromeBin();
  fs.mkdirSync(outDir, { recursive: true });

  // Static entry screens (current UI)
  shot(chrome, "01-home-boot.webp", page("home", "", "", "entry=boot"), { skipIfExists: true });
  shot(chrome, "02-host-config.webp", page("home", "", "", "entry=host"), { skipIfExists: true });

  const lobbySession = await createDemoSession();
  const { code, tokens } = lobbySession;

  // Partial crew for join flow (one role still open)
  const joinCode = code;
  shot(chrome, "03-join-flow.webp", page("join", joinCode));

  shot(chrome, "04-assembly-lobby.webp", page("facilitator", code, tokens.facilitator));

  await action(code, tokens.facilitator, "ACK_SAFETY");
  await action(code, tokens.facilitator, "START_GAME");
  shot(chrome, "04a-shared-stage1.webp", page("shared", code));
  shot(chrome, "04b-player-lead-stage1.webp", page("player", code, tokens.lead));
  shot(chrome, "04c-facilitator-stage1.webp", page("facilitator", code, tokens.facilitator));

  await action(code, tokens.facilitator, "UPDATE_DRAFT", { holds: ["mara", "voice", "road"] });
  await action(code, tokens.facilitator, "COMMIT_STAGE");
  await action(code, tokens.facilitator, "ADVANCE_STAGE");
  shot(chrome, "05-shared-stage2.webp", page("shared", code));
  shot(chrome, "06-facilitator-stage2.webp", page("facilitator", code, tokens.facilitator));

  await action(code, tokens.facilitator, "UPDATE_DRAFT", { powered: ["buffer", "military", "lock"] });
  await action(code, tokens.facilitator, "COMMIT_STAGE");
  await action(code, tokens.facilitator, "ADVANCE_STAGE");

  await action(code, tokens.facilitator, "UPDATE_DRAFT", { voice: "replay", bulletin: "discard", correction: "preserve" });
  shot(chrome, "07-shared-stage3.webp", page("shared", code));
  shot(chrome, "08-player-signal-stage3.webp", page("player", code, tokens.signal));
  shot(chrome, "09-facilitator-stage3.webp", page("facilitator", code, tokens.facilitator));
  await action(code, tokens.lead, "CHAT_MESSAGE", { message: "Hold the road interpretation until we verify the source." });
  await action(code, tokens.systems, "CHAT_MESSAGE", { message: "AUX-04 is a legacy controller, not the current road feed." });
  await action(code, tokens.facilitator, "CHAT_MESSAGE", { message: "Two minutes remain in the reconstruction window." });
  await action(code, tokens.signal, "CHAT_MESSAGE", { message: "I can preserve and replay the voice fragment." });
  shot(chrome, "09a-crew-chat.webp", page("player", code, tokens.signal, "chat=open"));
  shot(chrome, "09b-player-signal-mobile.webp", page("player", code, tokens.signal), {
    width: 390,
    height: 844,
  });

  await action(code, tokens.facilitator, "COMMIT_STAGE");
  await action(code, tokens.facilitator, "ADVANCE_STAGE");

  await beginOutsideRun(code, tokens);
  shot(chrome, "10-outside-run-runner.webp", page("player", code, tokens.operations));
  shot(chrome, "11-outside-run-facilitator.webp", page("facilitator", code, tokens.facilitator));

  await completeOutsideRun(code, tokens);

  await action(code, tokens.facilitator, "UPDATE_DRAFT", {
    procedure: "controlled",
    respirator: "mara",
    watcher: "protocol",
  });
  shot(chrome, "12-hatch-stage5.webp", page("shared", code));
  shot(chrome, "13-facilitator-stage5.webp", page("facilitator", code, tokens.facilitator));

  await action(code, tokens.facilitator, "COMMIT_STAGE");
  await action(code, tokens.facilitator, "ADVANCE_STAGE");

  await action(code, tokens.facilitator, "UPDATE_DRAFT", {
    invalid: "operational",
    human: "mara_below",
    hazard: "lock_air",
    evidence: "auto",
    request: "rescue",
  });
  shot(chrome, "14-correction-stage6.webp", page("facilitator", code, tokens.facilitator));

  await action(code, tokens.facilitator, "COMMIT_STAGE");
  await action(code, tokens.facilitator, "ADVANCE_STAGE");

  await action(code, tokens.facilitator, "UPDATE_DRAFT", {
    lock: "stabilise",
    lockLead: "systems",
    signal: "transmit",
    signalLead: "signal",
    people: "supply",
    peopleLead: "field",
  });
  shot(chrome, "15-finale-stage7.webp", page("shared", code));

  await action(code, tokens.facilitator, "COMMIT_STAGE");
  await action(code, tokens.facilitator, "UPDATE_DRAFT", {
    lock: "hold",
    lockLead: "protocol",
    signal: "transmit",
    signalLead: "signal",
    people: "extract",
    peopleLead: "operations",
  });
  await action(code, tokens.facilitator, "COMMIT_STAGE");
  shot(chrome, "16-ending-preview.webp", page("facilitator", code, tokens.facilitator));

  await action(code, tokens.facilitator, "CONFIRM_ENDING");
  shot(chrome, "17-ending-clean-rescue.webp", page("shared", code));
  shot(chrome, "18-debrief-facilitator.webp", page("facilitator", code, tokens.facilitator));

  await action(code, tokens.facilitator, "SET_DEBRIEF_STEP", { step: 6 });
  await action(code, tokens.signal, "SAVE_FIRST_STEP", {
    note: "Before trusting an AI summary, I will ask which source header was preserved.",
  });
  shot(chrome, "19-debrief-player-mobile.webp", page("player", code, tokens.signal), {
    width: 390,
    height: 844,
  });

  await action(code, tokens.facilitator, "SET_DEBRIEF_STEP", { step: 1 });
  await action(code, tokens.facilitator, "SAVE_PLAYTEST", {
    ratings: {
      clarity: 4,
      thrill: 5,
      survival: 4,
      ai_alignment: 4,
      facilitation: 5,
      role_value: 4,
      remote_fit: 4,
    },
    disposition: "proceed",
    notes: "Pilot session — strong role interdependence; Stage 4 air meter landed well.",
  });
  shot(chrome, "20-playtest-record.webp", page("facilitator", code, tokens.facilitator));

  console.log(`\nDone. ${outDir}`);
}

main().catch(error => {
  console.error(error.message || error);
  process.exit(1);
});
