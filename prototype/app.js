import {
  actions,
  assetLibrary,
  outcomeCopy,
  recommendationOptions,
  roleEntries,
  roles,
  SESSION_CODE,
  streams,
} from "./data.js";
import { allocationCost, getRemaining, PrototypeStore } from "./state.js";

const app = document.querySelector("#app");
const params = new URLSearchParams(window.location.search);
const view = ["lobby", "shared", "player", "facilitator", "gallery"].includes(params.get("view"))
  ? params.get("view")
  : "lobby";
const requestedRole = params.get("role");
const roleId = roles[requestedRole] ? requestedRole : "signal";
const store = new PrototypeStore();

const escapeHtml = (value = "") =>
  String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

function formatTime(seconds) {
  const safe = Math.max(0, seconds);
  return `${String(Math.floor(safe / 60)).padStart(2, "0")}:${String(safe % 60).padStart(2, "0")}`;
}

function phaseLabel(phase) {
  return {
    briefing: "STANDBY",
    live: "DECISION LIVE",
    resolved: "CONSEQUENCE",
  }[phase];
}

function appUrl(nextView, nextRole) {
  const url = new URL(window.location.href);
  url.search = "";
  url.searchParams.set("view", nextView);
  if (nextRole) url.searchParams.set("role", nextRole);
  return url.href;
}

function topbar(state, label) {
  return `
    <header class="topbar">
      <a class="brand" href="${appUrl("lobby")}" aria-label="Blackout Ridge prototype home">
        <span class="brand-mark" aria-hidden="true"><i></i><i></i><i></i></span>
        <span><b>BLACKOUT RIDGE</b><small>Emergency Relay Station</small></span>
      </a>
      <div class="topbar-meta">
        <span class="meta-label">${escapeHtml(label)}</span>
        <span class="session-chip"><span class="status-dot"></span>${state.sessionCode}</span>
      </div>
    </header>`;
}

function stageHeader(state, eyebrow = "STAGE 03 / LIVE CIRCUIT") {
  const remaining = getRemaining(state);
  return `
    <section class="stage-heading">
      <div>
        <p class="eyebrow">${eyebrow}</p>
        <h1>Decide what to trust</h1>
        <p class="stage-intro">Three sources compete for three bandwidth slots. Preserve the evidence the crew may need later.</p>
      </div>
      <div class="clock-block ${remaining <= 60 && state.phase === "live" ? "urgent" : ""}">
        <span>${phaseLabel(state.phase)}</span>
        <strong data-clock>${formatTime(remaining)}</strong>
      </div>
    </section>`;
}

function waveform() {
  const bars = [14, 22, 10, 31, 44, 20, 58, 32, 17, 49, 65, 25, 38, 72, 35, 18, 53, 28, 61, 33, 15, 41, 56, 22, 47, 31, 68, 26, 36, 19, 49, 23];
  return `<div class="waveform" aria-hidden="true">${bars.map((height, index) => `<i style="--h:${height}%;--d:${index * -47}ms"></i>`).join("")}</div>`;
}

function track(label, value, max, text, tone) {
  return `
    <div class="track-card">
      <div class="track-title"><span>${label}</span><b class="tone-${tone}">${text}</b></div>
      <div class="track-segments" aria-label="${label}: ${text}">
        ${Array.from({ length: max + 1 }, (_, index) => `<i class="${index <= value ? `filled ${tone}` : ""}"></i>`).join("")}
      </div>
    </div>`;
}

function streamsGrid(state, compact = false) {
  return `
    <div class="signal-grid ${compact ? "compact" : ""}">
      ${Object.values(streams)
        .map((stream) => {
          const action = actions[state.draft[stream.id]];
          return `
            <article class="signal-card ${stream.tone}">
              <div class="signal-topline"><span>${stream.label}</span><span>${state.phase === "briefing" ? "QUEUED" : action.short}</span></div>
              <h3>${stream.title}</h3>
              <p class="signal-preview">${stream.preview}</p>
              <small>${stream.source}</small>
              ${state.phase !== "briefing" ? `<div class="allocation-tag"><i></i>${action.label} · ${action.cost} slot${action.cost === 1 ? "" : "s"}</div>` : ""}
            </article>`;
        })
        .join("")}
    </div>`;
}

function roster(state) {
  return `
    <div class="crew-list">
      ${roleEntries(state.playerCount)
        .map(([id, role]) => {
          const joined = Boolean(state.joinedRoles[id]);
          const reported = Boolean(state.reports[id]);
          return `
            <div class="crew-row">
              <span class="role-code color-${role.color}">${role.short}</span>
              <span><b>${role.name}</b><small>${reported ? "Assessment shared" : joined ? "Terminal connected" : "Awaiting terminal"}</small></span>
              <i class="crew-state ${reported ? "ready" : joined ? "online" : ""}" title="${reported ? "Ready" : joined ? "Connected" : "Not connected"}"></i>
            </div>`;
        })
        .join("")}
    </div>`;
}

function hintBanner(state) {
  if (!state.hint) return "";
  return `<aside class="hint-banner"><span>FACILITATOR PROMPT</span><p>${escapeHtml(state.hint)}</p></aside>`;
}

function outcomePanel(state, includeInterventionNote = true) {
  if (!state.result) return "";
  const outcome = outcomeCopy[state.result.quality];
  return `
    <section class="outcome-panel quality-${state.result.quality}">
      <div class="outcome-copy">
        <p class="eyebrow">ALLOCATION CONSEQUENCE / ${outcome.grade}</p>
        <h2>${outcome.title}</h2>
        <p>${outcome.body}</p>
        <div class="transcript"><span>RECOVERED TRANSCRIPT</span><strong>${outcome.transcript}</strong></div>
      </div>
      <aside class="outcome-facts">
        <div><span>Evidence ledger</span><b>${state.result.evidence.length ? state.result.evidence.join(" · ") : "No direct evidence"}</b></div>
        <div><span>Next-stage effect</span><b>${outcome.consequence}</b></div>
        ${state.result.expired ? "<div><span>Decision condition</span><b>Clock expired; draft auto-applied</b></div>" : ""}
        ${includeInterventionNote && state.result.recovered ? "<div class=\"recovered-note\"><span>Role intervention</span><b>Signal Analyst recovered one quality level</b></div>" : ""}
      </aside>
    </section>`;
}

function noticeBar(state) {
  return `<div class="notice-bar" role="status"><span class="pulse-dot"></span><b>SYSTEM</b><span>${escapeHtml(state.notice)}</span></div>`;
}

function renderLobby(state) {
  const roleLinks = roleEntries(state.playerCount)
    .map(([id, role]) => `
      <a class="launch-role" href="${appUrl("player", id)}" target="_blank">
        <span class="role-code color-${role.color}">${role.short}</span>
        <span><b>${role.name}</b><small>${role.lens}</small></span>
        <span aria-hidden="true">↗</span>
      </a>`)
    .join("");

  app.innerHTML = `
    <div class="app-frame">
      ${topbar(state, "MILESTONE 2 / UX PROTOTYPE")}
      <main class="lobby-layout">
        <section class="hero-panel">
          <div class="hero-copy">
            <p class="eyebrow">AUXILIARY RELAY / NIGHT CREW</p>
            <h1>The station is calm.<br><em>The station is wrong.</em></h1>
            <p>Run one synchronized challenge across separate browser tabs. Teams or Zoom carries the conversation; Blackout Ridge controls what each person can see.</p>
            <div class="hero-actions">
              <a class="button primary" href="${appUrl("shared")}" target="_blank">Open shared console <span>↗</span></a>
              <a class="button secondary" href="${appUrl("facilitator")}" target="_blank">Open facilitator view <span>↗</span></a>
            </div>
          </div>
          <div class="ridge-visual" aria-label="Blackout Ridge relay station in a storm">
            <img src="./assets/images/station-exterior.webp" alt="Remote relay station on Blackout Ridge during a violent night storm">
            <div class="scene-shade"></div>
            <span class="map-label ridge-label">BLACKOUT RIDGE / 821M</span>
            <span class="map-label vale-label">CALDER VALE / CORDON ACTIVE</span>
            <span class="map-label route-label">LOWER ROUTE / UNVERIFIED</span>
            <div class="weather-readout"><span>WIND</span><b>SW 41 KT</b><span>VIS</span><b>0.8 KM</b></div>
          </div>
        </section>

        <section class="launch-grid">
          <div class="launch-card session-launch">
            <div class="section-title"><span>SESSION ARRAY</span><b>${SESSION_CODE}</b></div>
            <div class="session-state">
              <div><small>MODE</small><b>${state.playerCount} PLAYERS</b></div>
              <div><small>PHASE</small><b>${phaseLabel(state.phase)}</b></div>
              <div><small>JOINED</small><b>${Object.keys(state.joinedRoles).length} / ${state.playerCount}</b></div>
            </div>
            <p>Open each view in a separate tab or browser. State synchronizes locally for a no-backend design validation.</p>
          </div>
          <div class="launch-card role-launcher">
            <div class="section-title"><span>PRIVATE TERMINALS</span><b>SELECT ROLE</b></div>
            <div class="role-link-grid">${roleLinks}</div>
          </div>
        </section>

        <section class="prototype-note">
          <span>PROTOTYPE BOUNDARY</span>
          <p>This validates hierarchy, unequal information, facilitation controls, and the complete Stage 3 loop. <a href="${appUrl("gallery")}">View the cinematic asset library →</a></p>
        </section>
      </main>
    </div>`;
}

function renderShared(state) {
  const reportCount = Object.keys(state.reports).length;
  app.innerHTML = `
    <div class="app-frame console-view">
      ${topbar(state, "SHARED STATION CONSOLE")}
      <main class="console-main">
        <div class="shared-scene">
          <img src="./assets/images/relay-control-room.webp" alt="The empty Blackout Ridge relay control room during the storm">
          <div class="shared-scene-shade"></div>
          ${stageHeader(state)}
          <span class="scene-id">CAM 01 / SURFACE RELAY / 21:14</span>
        </div>
        ${hintBanner(state)}
        ${state.phase === "resolved" ? outcomePanel(state) : `
          <div class="console-grid">
            <section class="primary-console panel">
              <div class="feed-header">
                <span><i class="live-dot"></i> DEGRADED SIGNAL BUFFER</span>
                <b>CAPACITY 03</b>
              </div>
              ${waveform()}
              ${streamsGrid(state)}
              <div class="bandwidth-line">
                <span>PROVISIONAL ALLOCATION</span>
                <div><b>${Math.min(allocationCost(state.draft), 3)}</b><span>/ 3 SLOTS</span></div>
              </div>
            </section>
            <aside class="side-console">
              <section class="panel status-panel">
                <div class="section-title"><span>STATION CONDITIONS</span><b>LIVE</b></div>
                ${track("UPPER AIR", 1, 3, "TRACE", "amber")}
                ${track("EXTERNAL TRUST", 0, 2, "UNVERIFIED", "muted")}
                ${track("OFFICIAL STATUS", 1, 3, "REPEATING", "green")}
              </section>
              <section class="panel crew-panel">
                <div class="section-title"><span>CREW ACTIVITY</span><b>${reportCount} / ${state.playerCount} READY</b></div>
                ${roster(state)}
              </section>
            </aside>
          </div>`}
        ${state.phase === "resolved" ? `<section class="next-stage"><span>NEXT / OUTSIDE RUN</span><h3>Test the assumption the signal just challenged.</h3><p>Cordon Control reports a five-minute external movement window. One service respirator remains.</p></section>` : ""}
        ${noticeBar(state)}
      </main>
    </div>`;
}

function recommendationForm(state, currentRoleId) {
  const report = state.reports[currentRoleId];
  if (state.phase === "briefing") {
    return `<div class="waiting-state"><span class="spinner"></span><b>Awaiting facilitator start</b><p>Your evidence will remain private when the challenge opens.</p></div>`;
  }
  if (state.phase === "resolved") {
    return `<div class="report-locked"><span>ASSESSMENT CLOSED</span><b>${report ? "Your recommendation was recorded." : "The decision window closed before you reported."}</b></div>`;
  }
  return `
    <form class="assessment-form" data-report-form>
      <label for="recommendation">Your recommendation to the crew</label>
      <select id="recommendation" name="recommendation">
        ${recommendationOptions.map((option) => `<option value="${option.value}" ${report?.recommendation === option.value ? "selected" : ""}>${option.label}</option>`).join("")}
      </select>
      <label for="note">One reason <span>optional · 120 characters</span></label>
      <textarea id="note" name="note" maxlength="120" placeholder="What should the team understand?">${escapeHtml(report?.note || "")}</textarea>
      <button class="button primary full" type="submit">${report ? "Update assessment" : "Share assessment"}</button>
      ${report ? "<p class=\"form-confirm\">✓ Shared with the Station Lead</p>" : ""}
    </form>`;
}

function leadAllocation(state) {
  if (state.phase === "briefing") return "";
  const cost = allocationCost(state.draft);
  const canCommit = state.phase === "live" && cost <= 3;
  return `
    <section class="terminal-panel allocation-console">
      <div class="section-title"><span>CREW COMMITMENT</span><b>${cost} / 3 SLOTS</b></div>
      <p>Use the crew’s evidence to allocate limited reconstruction bandwidth.</p>
      <div class="allocation-controls">
        ${Object.values(streams).map((stream) => `
          <label><span>${stream.label}<small>${stream.title}</small></span>
            <select data-draft-stream="${stream.id}" ${state.phase !== "live" ? "disabled" : ""}>
              ${Object.entries(actions).map(([id, action]) => `<option value="${id}" ${state.draft[stream.id] === id ? "selected" : ""}>${action.label} · ${action.cost}</option>`).join("")}
            </select>
          </label>`).join("")}
      </div>
      ${cost > 3 ? "<p class=\"allocation-error\">Capacity exceeded. Reduce the allocation before committing.</p>" : ""}
      <button class="button danger full" data-event="commit" ${canCommit ? "" : "disabled"}>Commit crew allocation</button>
    </section>`;
}

function interventionCard(state, currentRoleId) {
  if (currentRoleId !== "signal") return "";
  const usable = state.phase === "resolved" && state.result?.quality < 3 && !state.recoveryUsed;
  return `
    <section class="terminal-panel intervention-card ${usable ? "available" : ""}">
      <div class="section-title"><span>ROLE INTERVENTION</span><b>${state.recoveryUsed ? "USED" : "1 AVAILABLE"}</b></div>
      <h3>Recover Fragment</h3>
      <p>Restore one discarded or degraded signal as a partial transcript. This improves evidence quality; it does not solve the route.</p>
      <button class="button secondary full" data-event="recover" ${usable ? "" : "disabled"}>Recover damaged fragment</button>
      ${state.phase !== "resolved" ? "<small>Available after the crew commits, if evidence was damaged.</small>" : state.result?.quality >= 3 ? "<small>The signal is already fully correlated.</small>" : ""}
    </section>`;
}

function renderPlayer(state) {
  const role = roles[roleId];
  const reportCount = Object.keys(state.reports).length;
  app.innerHTML = `
    <div class="app-frame terminal-view role-${role.color}">
      ${topbar(state, "PRIVATE ROLE TERMINAL")}
      <main class="terminal-main">
        <section class="terminal-identity">
          <div class="role-code large color-${role.color}">${role.short}</div>
          <div><p class="eyebrow">NIGHT CREW / AUTHENTICATED</p><h1>${role.name}</h1><p>Protect: ${role.lens}</p></div>
          <div class="terminal-clock"><span>${phaseLabel(state.phase)}</span><b data-clock>${formatTime(getRemaining(state))}</b></div>
        </section>
        ${hintBanner(state)}
        <div class="terminal-grid">
          <section class="terminal-panel evidence-panel">
            <figure class="evidence-image">
              <img src="./assets/images/${role.visual}" alt="Visual evidence associated with ${role.name}">
              <figcaption>PRIVATE VISUAL / ${role.evidence.kicker}</figcaption>
            </figure>
            <div class="evidence-meta"><span>${role.evidence.kicker}</span><b>${role.evidence.confidence}</b></div>
            <h2>${role.evidence.title}</h2>
            <p class="evidence-body">${role.evidence.body}</p>
            <div class="evidence-source"><span>SOURCE</span><b>${role.evidence.source}</b></div>
            <blockquote>${role.prompt}</blockquote>
          </section>
          <aside class="terminal-stack">
            <section class="terminal-panel assessment-panel">
              <div class="section-title"><span>CREW ASSESSMENT</span><b>${reportCount} / ${state.playerCount}</b></div>
              ${recommendationForm(state, roleId)}
            </section>
            ${interventionCard(state, roleId)}
          </aside>
        </div>
        ${roleId === "lead" ? leadAllocation(state) : ""}
        ${state.phase === "resolved" ? outcomePanel(state, false) : `
          <section class="terminal-panel signal-reference">
            <div class="section-title"><span>SHARED SOURCE ARRAY</span><b>3 STREAMS</b></div>
            ${streamsGrid(state, true)}
          </section>`}
        ${noticeBar(state)}
      </main>
    </div>`;
}

function renderGallery(state) {
  app.innerHTML = `
    <div class="app-frame gallery-view">
      ${topbar(state, "CINEMATIC ASSET ARCHIVE")}
      <main class="gallery-main">
        <section class="gallery-heading">
          <div><p class="eyebrow">VISUAL DIRECTION / SET 01</p><h1>The world of Blackout Ridge</h1><p>Grounded operational horror: infrastructure, evidence, memory, and people under pressure.</p></div>
          <a class="button secondary" href="${appUrl("lobby")}">Return to prototype</a>
        </section>
        <section class="asset-grid">
          ${assetLibrary.map((asset, index) => `
            <figure class="asset-card ${asset.file === "lark-shift-archive.webp" ? "archive" : ""}">
              <img src="./assets/images/${asset.file}" alt="${asset.title}" loading="${index > 2 ? "lazy" : "eager"}">
              <figcaption><span>${String(index + 1).padStart(2, "0")}</span><div><h2>${asset.title}</h2><p>${asset.use}</p></div></figcaption>
            </figure>`).join("")}
        </section>
      </main>
    </div>`;
}

function facilitatorReports(state) {
  return roleEntries(state.playerCount).map(([id, role]) => {
    const report = state.reports[id];
    return `
      <div class="fac-report">
        <span class="role-code color-${role.color}">${role.short}</span>
        <span><b>${role.name}</b><small>${report ? escapeHtml(recommendationOptions.find((item) => item.value === report.recommendation)?.label || report.recommendation) : state.joinedRoles[id] ? "Connected · no report" : "Not connected"}</small></span>
        <p>${report?.note ? `“${escapeHtml(report.note)}”` : "—"}</p>
      </div>`;
  }).join("");
}

function renderFacilitator(state) {
  const remaining = getRemaining(state);
  const cost = allocationCost(state.draft);
  app.innerHTML = `
    <div class="app-frame facilitator-view">
      ${topbar(state, "FACILITATOR CONTROL")}
      <main class="facilitator-main">
        <section class="fac-heading">
          <div><p class="eyebrow">RUN CONTROL / STAGE 03</p><h1>Decide what to trust</h1><p>Keep the decision moving. Clarify rules; do not interpret evidence for the crew.</p></div>
          <div class="fac-clock ${remaining <= 60 && state.phase === "live" ? "urgent" : ""}"><span>${phaseLabel(state.phase)}</span><b data-clock>${formatTime(remaining)}</b></div>
        </section>
        <div class="fac-grid">
          <section class="fac-card run-controls">
            <div class="section-title"><span>RUN CONTROL</span><b>${state.phase.toUpperCase()}</b></div>
            <div class="control-row">
              <button class="button primary" data-event="start" ${state.phase !== "briefing" ? "disabled" : ""}>Start challenge</button>
              <button class="icon-button" data-event="${state.timer.running ? "pause" : "resume"}" ${state.phase !== "live" ? "disabled" : ""}>${state.timer.running ? "Ⅱ Pause" : "▶ Resume"}</button>
              <button class="icon-button" data-event="add-time" ${state.phase === "resolved" ? "disabled" : ""}>+30 sec</button>
            </div>
            <div class="mode-row"><span>Player mode</span><button data-count="6" class="mode-button ${state.playerCount === 6 ? "active" : ""}" ${state.phase !== "briefing" ? "disabled" : ""}>6</button><button data-count="7" class="mode-button ${state.playerCount === 7 ? "active" : ""}" ${state.phase !== "briefing" ? "disabled" : ""}>7</button></div>
            <div class="link-row">
              <button class="text-button" data-copy-link="shared">Copy shared-console link</button>
              <button class="text-button" data-copy-link="lobby">Copy terminal lobby link</button>
            </div>
          </section>

          <section class="fac-card current-state">
            <div class="section-title"><span>LIVE STATE</span><b>REV ${state.revision}</b></div>
            ${track("UPPER AIR", 1, 3, "TRACE", "amber")}
            ${track("EXTERNAL TRUST", 0, 2, "UNVERIFIED", "muted")}
            ${track("OFFICIAL STATUS", 1, 3, "REPEATING", "green")}
          </section>

          <section class="fac-card fac-crew">
            <div class="section-title"><span>ROLE REPORTS</span><b>${Object.keys(state.reports).length} / ${state.playerCount}</b></div>
            <div class="fac-report-list">${facilitatorReports(state)}</div>
          </section>

          <section class="fac-card decision-monitor">
            <div class="section-title"><span>CREW ALLOCATION</span><b class="${cost > 3 ? "bad-text" : ""}">${cost} / 3 SLOTS</b></div>
            <div class="decision-list">
              ${Object.values(streams).map((stream) => `<div><span>${stream.label}<small>${stream.title}</small></span><b>${actions[state.draft[stream.id]].label}</b></div>`).join("")}
            </div>
            <button class="button danger full" data-event="commit" ${state.phase === "live" && cost <= 3 ? "" : "disabled"}>Resolve current allocation</button>
            <small class="control-note">Use only if the Station Lead terminal is unavailable.</small>
          </section>

          <section class="fac-card hint-control">
            <div class="section-title"><span>CONTEXTUAL HINT</span><b>${state.hint ? "VISIBLE" : "READY"}</b></div>
            <p>“Compare each source’s age and purpose—not just its confidence percentage.”</p>
            <button class="button secondary" data-event="${state.hint ? "clear-hint" : "show-hint"}">${state.hint ? "Clear prompt" : "Show to all terminals"}</button>
          </section>

          <section class="fac-card consequence-preview">
            <div class="section-title"><span>CONSEQUENCE</span><b>${state.result ? outcomeCopy[state.result.quality].grade : "PENDING"}</b></div>
            ${state.result ? `<h3>${outcomeCopy[state.result.quality].title}</h3><p>${outcomeCopy[state.result.quality].consequence}</p><div class="evidence-tags">${state.result.evidence.map((item) => `<span>${item}</span>`).join("") || "<i>No direct evidence earned</i>"}</div>` : "<p>The selected allocation will be resolved deterministically when the Station Lead commits or time expires.</p>"}
          </section>

          <section class="fac-card audit-card">
            <div class="section-title"><span>SESSION LOG</span><b>${state.audit.length} EVENTS</b></div>
            <ol>${[...state.audit].reverse().slice(0, 8).map((item) => `<li><time>${new Date(item.at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}</time><span>${escapeHtml(item.text)}</span></li>`).join("") || "<li><span>No events recorded</span></li>"}</ol>
          </section>
        </div>
        <div class="fac-footer"><span>${escapeHtml(state.notice)}</span><button class="text-button danger-text" data-event="reset">Reset prototype</button></div>
      </main>
    </div>`;
}

function render(state = store.read()) {
  document.title = view === "facilitator" ? "Blackout Ridge — Facilitator" : view === "player" ? `Blackout Ridge — ${roles[roleId].name}` : view === "shared" ? "Blackout Ridge — Shared Console" : "Blackout Ridge — Prototype";
  if (view === "shared") renderShared(state);
  else if (view === "player") renderPlayer(state);
  else if (view === "facilitator") renderFacilitator(state);
  else if (view === "gallery") renderGallery(state);
  else renderLobby(state);
}

app.addEventListener("submit", (event) => {
  const form = event.target.closest("[data-report-form]");
  if (!form) return;
  event.preventDefault();
  const data = new FormData(form);
  store.dispatch({
    type: "SUBMIT_REPORT",
    role: roleId,
    recommendation: data.get("recommendation"),
    note: data.get("note"),
  });
});

app.addEventListener("change", (event) => {
  const select = event.target.closest("[data-draft-stream]");
  if (select) store.dispatch({ type: "SET_DRAFT", stream: select.dataset.draftStream, action: select.value });
});

app.addEventListener("click", async (event) => {
  const count = event.target.closest("[data-count]");
  if (count) store.dispatch({ type: "SET_PLAYER_COUNT", count: Number(count.dataset.count) });

  const copy = event.target.closest("[data-copy-link]");
  if (copy) {
    const targetView = copy.dataset.copyLink;
    await navigator.clipboard?.writeText(appUrl(targetView));
    const original = copy.textContent;
    copy.textContent = "Copied";
    window.setTimeout(() => (copy.textContent = original), 1200);
  }

  const button = event.target.closest("[data-event]");
  if (!button || button.disabled) return;
  const action = button.dataset.event;
  if (action === "reset") {
    if (window.confirm("Reset all prototype tabs to the initial briefing state?")) store.dispatch({ type: "RESET" });
    return;
  }
  const events = {
    start: { type: "START" },
    pause: { type: "PAUSE" },
    resume: { type: "RESUME" },
    "add-time": { type: "ADD_TIME", seconds: 30 },
    "show-hint": { type: "SHOW_HINT", message: "Compare each source’s age and purpose—not just its confidence percentage." },
    "clear-hint": { type: "CLEAR_HINT" },
    commit: { type: "COMMIT" },
    recover: { type: "RECOVER_FRAGMENT" },
  };
  if (events[action]) store.dispatch(events[action]);
});

if (view === "player") {
  const state = store.read();
  if (!state.joinedRoles[roleId]) store.dispatch({ type: "JOIN_ROLE", role: roleId, name: roles[roleId].name });
}

store.subscribe(render);
render();

window.setInterval(() => {
  const state = store.read();
  const remaining = getRemaining(state);
  document.querySelectorAll("[data-clock]").forEach((clock) => {
    clock.textContent = formatTime(remaining);
  });
  if (state.phase === "live" && remaining <= 0) store.dispatch({ type: "EXPIRE" });
}, 250);
