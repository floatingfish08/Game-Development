import { GameClient, getContent } from "./network.js";
import { stationAudio } from "./audio.js";

const app = document.querySelector("#app");
const query = new URLSearchParams(location.search);
const view = query.get("view") || "home";
const code = (query.get("session") || "").toUpperCase();
const explicitToken = query.get("token") || "";
const snapshotMode = query.get("snapshot") === "1";
const storedToken = code ? localStorage.getItem(`blackout-token-${code}`) || "" : "";
const client = new GameClient({ code, token: explicitToken || storedToken });
let content;
let error = "";
const requestedEntryMode = query.get("entry");
let entryMode = snapshotMode && ["boot", "access", "host", "join"].includes(requestedEntryMode) ? requestedEntryMode : "boot";
let entryCrewSize = 7;

const e = (value = "") => String(value).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#039;");
const seconds = state => state.clock.running && state.clock.endAt ? Math.max(0, Math.ceil((state.clock.endAt - Date.now()) / 1000)) : state.clock.remaining;
const time = value => `${String(Math.floor(value / 60)).padStart(2,"0")}:${String(value % 60).padStart(2,"0")}`;
const roleList = state => Object.entries(state.roles);
const joinRole = (id, role, playerCount) => playerCount === 2
  ? id === "lead" ? { ...role, short:"CMD", name:"Command & Field", lens:"Accountability · action · people" }
    : { ...role, short:"TECH", name:"Signal & Systems", lens:"Provenance · systems · receiver" }
  : role;
const challengeNames = ["Challenge defaults","Allocate power","Decode signal","Run reconnaissance","Open containment","Build correction","Survive finale"];
const brandLogo = className => `<img class="brand-logo ${className || ""}" src="./assets/images/logo2.png" alt="Blackout Ridge">`;
const gameIcon = (file, alt, className = "") => `<img class="game-icon ${className}" src="./assets/images/${file}" alt="${e(alt)}">`;
const roleAsset = id => `role-${id}.png`;
const crewAsset = count => count === 2 ? "control-duo-terminals.png" : count === 7 ? "control-seven-terminals.png" : "control-six-terminals.png";
const crewProtocol = count => count === 2 ? "DUO PROTOCOL" : count < 6 ? "COMBINED CREW" : count === 6 ? "CORE CREW" : "FULL CREW";

function url(nextView, session = code, token = "") {
  const result = new URL(location.origin + location.pathname);
  result.searchParams.set("view", nextView);
  if (session) result.searchParams.set("session", session);
  if (token) result.searchParams.set("token", token);
  return result.href;
}

function topbar(label, session = code) {
  return `<header class="topbar"><a class="brand" href="${url("home", "")}">${brandLogo("topbar-logo")}</a><div class="topbar-meta"><span class="meta-label">${e(label)}</span>${session ? `<span class="session-chip"><span class="status-dot"></span>${e(session)}</span>` : ""}</div></header>`;
}

function button(text, action, kind = "primary", disabled = false) {
  return `<button class="button ${kind}" data-action="${action}" ${disabled ? "disabled" : ""}>${text}</button>`;
}

function stationAccess() {
  if (entryMode === "boot") return `<section class="station-entry boot-entry"><button class="engage-device" data-entry-mode="access" aria-label="Engage Blackout Ridge station"><img src="./assets/images/device-station-engage.png" alt="Frozen emergency station engagement lever"><span class="engage-state"><small>RIDGE RELAY LINK</small><b><i></i>OFFLINE</b><em>MANUAL AUTH REQUIRED</em></span><span class="engage-command"><b>ENGAGE STATION</b><small>ARM NIGHT-SHIFT CHANNEL</small></span><span class="engage-cursor">INTERACT&nbsp;&nbsp;›</span></button></section>`;
  if (entryMode === "access") return `<section class="station-entry access-entry"><header><span>AUTHORITY SELECT</span><b>CHOOSE CHANNEL</b><button data-entry-mode="boot">×</button></header><div class="authority-select"><button data-entry-mode="host">${gameIcon("control-host-authority.png","Command authority key","authority-icon")}<span><b>COMMAND AUTHORITY</b><small>Initialize a new night shift</small></span><em>HOST</em></button><button data-entry-mode="join">${gameIcon("control-crew-channel.png","Secure crew radio","authority-icon")}<span><b>CREW CHANNEL</b><small>Connect to an active station</small></span><em>JOIN</em></button></div></section>`;
  if (entryMode === "host") return `<section class="station-entry configure-entry"><header><span>COMMAND AUTHORITY</span><b>SHIFT CONFIGURATION</b><button data-entry-mode="access">←</button></header><div class="crew-selector"><span>ACTIVE TERMINALS</span><div>${[2,4,5,6,7].map(count=>`<button class="${entryCrewSize===count?"active":""}" data-crew-size="${count}">${gameIcon(crewAsset(count),`${count} linked terminals`)}<span><i>${String(count).padStart(2,"0")}</i><small>${count===2?"DUO":"CREW"}</small></span></button>`).join("")}</div></div><button class="station-confirm illustrated-control" data-create-session>${gameIcon("control-host-authority.png","Authority key")}<span><b data-control-label>ARM NEW SESSION</b><small>GENERATE PRIVATE CREW CHANNELS</small></span><i></i></button>${error?`<p class="station-error">${e(error)}</p>`:""}</section>`;
  return `<section class="station-entry configure-entry join-entry"><header><span>CREW CHANNEL</span><b>SESSION AUTHENTICATION</b><button data-entry-mode="access">←</button></header><form data-enter>${gameIcon("control-code-auth.png","Secure relay code lock","code-auth-icon")}<label>ENTER SIX-CHARACTER RELAY CODE<input name="code" maxlength="6" autocomplete="off" placeholder="BR2107" required autofocus></label><button class="station-confirm illustrated-control">${gameIcon("control-crew-channel.png","Crew channel radio")}<span><b>CONNECT TERMINAL</b><small>REQUEST ROLE ASSIGNMENT</small></span><i></i></button></form>${error?`<p class="station-error">${e(error)}</p>`:""}</section>`;
}

function activateStartBackground() {
  const videos = [...document.querySelectorAll("[data-start-video]")];
  if (videos.length < 2 || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  let active = 0;
  let transitioning = false;
  const crossfade = async () => {
    if (transitioning || !videos[active]?.isConnected) return;
    transitioning = true;
    const next = (active + 1) % videos.length;
    const currentVideo = videos[active];
    const nextVideo = videos[next];
    nextVideo.currentTime = 0;
    try { await nextVideo.play(); } catch { transitioning = false; return; }
    nextVideo.classList.add("active");
    currentVideo.classList.remove("active");
    setTimeout(() => {
      if (!currentVideo.isConnected) return;
      currentVideo.pause();
      currentVideo.currentTime = 0;
      active = next;
      transitioning = false;
    }, 1300);
  };
  videos.forEach(video => {
    video.addEventListener("timeupdate", () => {
      if (video === videos[active] && video.duration - video.currentTime < 1.35) crossfade();
    });
    video.addEventListener("ended", crossfade);
  });
  videos[0].play().catch(() => {});
}

function renderHome() {
  app.innerHTML = `<div class="game-start">
    <img class="game-start-bg" src="./assets/images/first-screen-v2.png" alt="Blackout Ridge relay station in a violent storm">
    ${[1,2,3,4].map((number,index)=>`<video class="start-bg-video ${index===0?"active":""}" data-start-video muted playsinline preload="auto" poster="./assets/images/first-screen-v2.png" aria-hidden="true"><source src="./assets/video/${number}.mp4" type="video/mp4"></video>`).join("")}
    <div class="game-start-grade"></div><div class="storm-flash"></div>
    <header class="start-ident"><i></i><div><b>CALDER VALE / NODE 04</b><small>EMERGENCY RELAY · NIGHT SHIFT</small></div></header>
    <section class="start-title"><p>RIDGE EMERGENCY RELAY // NIGHT SHIFT</p>${brandLogo("start-main-logo")}<h2>OPERATIONAL DOES NOT MEAN SAFE.</h2><strong>SYSTEM STARTUP REQUIRES HUMAN CREW.</strong><small>SUPPORTED SHIFT: 02 / 04 / 05 / 06 / 07 TERMINALS</small></section>
    ${stationAccess()}
    <div class="start-coordinates">CALDER VALE RELAY NETWORK / NODE 04<br>WEATHER CHANNEL: SEVERE</div>
  </div>`;
  activateStartBackground();
}

async function renderJoin() {
  if (!content) content = await getContent();
  let session;
  try { session = await client.load(); } catch (cause) { error = cause.message; }
  if (!session) return renderError();
  const available = Object.entries(session.roles).filter(([id]) => !session.players[id]).map(([id,role])=>[id,joinRole(id,role,session.playerCount)]);
  app.innerHTML = `<div class="game-runtime join-runtime"><div class="runtime-world"><img src="./assets/images/relay-control-room.png" alt="Blackout Ridge control room"><div class="runtime-grade"></div><div class="scan-sweep"></div></div>
    <header class="assembly-header">${brandLogo("assembly-logo")}<div><small>CREW INTAKE / PRIVATE CHANNEL</small></div><strong>SESSION ${e(code)}</strong></header>
    <form class="join-terminal join-hardware" data-join><header>${gameIcon("control-code-auth.png","Terminal authentication lock")}<div><span>TERMINAL ASSIGNMENT</span><h1>CLAIM A RESPONSIBILITY</h1><small>One instrument. One private evidence channel.</small></div><i>AUTH // ${e(code)}</i></header><label class="callsign-control"><span>CREW IDENTIFIER</span><input name="name" maxlength="40" required placeholder="ENTER CALLSIGN"></label><div class="participant-care-mini"><b>PARTICIPANT CARE</b><span>${e(session.participantCare)}</span></div><div class="role-choice-grid">${available.map(([id,r],i) => `<label class="role-choice role-pod"><input type="radio" name="role" value="${id}" ${i===0?"checked":""}><span class="role-art color-${r.color}">${gameIcon(roleAsset(id),`${r.name} instrument`)}<i></i></span><span class="role-data"><em>${r.short}</em><b>${r.name}</b><small>${r.lens}</small></span></label>`).join("")}</div>${error ? `<p class="inline-error">${e(error)}</p>` : ""}<button class="role-connect illustrated-control" ${available.length ? "" : "disabled"}>${gameIcon("control-crew-channel.png","Secure crew radio")}<span><b>CONNECT ROLE TERMINAL</b><small>OPEN PRIVATE EVIDENCE CHANNEL</small></span><i></i></button></form>
    <div class="join-transmission"><span>INCOMING SHIFT</span><b>${available.length} RESPONSIBILITIES UNCLAIMED</b><small>Every crew member receives different evidence. Speak carefully.</small></div>
  </div>`;
}

function progress(state) {
  return `<nav class="stage-progress" aria-label="Game progress">${Array.from({length:7},(_,i)=>i+1).map(n => `<span class="${n < state.stage ? "done" : n === state.stage ? "active" : ""}"><i>${n}</i><b>${n===state.stage ? state.stageDefinition?.kicker : ""}</b></span>`).join("")}</nav>`;
}

function runtimeHud(state, label, role = null) {
  const stageNumber = String(state.stage).padStart(2,"0");
  const stageName = state.status === "ending" ? "MISSION COMPLETE" : state.stageDefinition?.kicker || "STANDBY";
  return `<header class="runtime-hud">
    <div class="hud-brand">${brandLogo("hud-logo")}<span><small>${e(label)}</small></span></div>
    <div class="hud-stage ${state.status === "ending" ? "complete" : ""}"><span class="hud-stage-counter"><small>STAGE</small><strong>${stageNumber}</strong><em>/ 07</em></span><div>${Array.from({length:7},(_,i)=>`<i class="${i+1<state.stage?"done":i+1===state.stage?"active":""}"></i>`).join("")}</div><b><small>CURRENT MISSION</small>${e(stageName)}</b></div>
    ${role ? `<div class="hud-role color-${role.color}"><span>${role.short}</span><b>${e(role.name)}</b></div>` : ""}
    <div class="hud-clock ${seconds(state)<=60&&state.stageStatus==="live"?"urgent":""}"><span>${state.stageStatus.toUpperCase()}</span><b data-clock>${time(seconds(state))}</b></div>
    <button class="sound-toggle ${stationAudio.enabled?"active":""}" data-sound aria-label="Toggle station ambience"><span>◉</span> ${stationAudio.enabled?"AUDIO ON":"AUDIO"}</button>
    <div class="hud-session"><span>${state.playerCount===2?"DUO":"CREW"}</span><i></i>${e(state.code)}</div>
  </header>`;
}

function runtimeBackground(state) {
  return `<div class="runtime-world"><img src="./assets/images/${state.stageDefinition.image}" alt="${e(state.stageDefinition.title)}"><div class="runtime-grade"></div><div class="storm-flash"></div><div class="scan-sweep"></div></div>`;
}

function waveform(count = 46) {
  return `<div class="signal-wave" aria-hidden="true">${Array.from({length:count},(_,i)=>`<i style="--h:${18+((i*17+i*i*3)%79)}%"></i>`).join("")}</div>`;
}

function signalIntercept(state, compact = false) {
  const signal=state.signalTransmission;if(!signal)return "";
  return `<section class="signal-intercept ${compact?"compact":""} ${signal.integrity<30?"weak":""}"><header><span>DEGRADED SIGNAL / STAGE ${String(state.stage).padStart(2,"0")}</span><b>${signal.integrity}% INTEGRITY</b></header>${waveform(compact?22:38)}<p>${e(signal.transcript)}</p><small>${e(signal.source)} · ${e(signal.instruction)}</small></section>`;
}

function environmentStrip(state, compact = false) {
  const x=state.environment;if(!x)return "";
  const entries=[
    ["CHEMICAL AIR",`${x.airMeterPpm} PPM / ${x.airStatus}`],
    ["LOWER ROAD",x.roadStatus],
    ["CORDON",x.cordonStatus],
    ["STORM",x.stormStatus],
  ];
  return `<section class="environment-strip ${compact?"compact":""}"><header><span>INCIDENT PRESSURES</span><b>OUTSIDE WINDOW ${x.outsideWindow?"OPEN":"CLOSED"}</b></header><div>${entries.map(([name,value])=>`<i><small>${e(name)}</small><strong>${e(value)}</strong></i>`).join("")}</div></section>`;
}

function challengeStack(state) {
  return `<aside class="challenge-stack"><header><span>THE 7 CHALLENGES</span><b>${state.stage}/7</b></header>${challengeNames.map((name,i)=>{const n=i+1,status=n<state.stage?"complete":n===state.stage?"active":"locked";return `<div class="${status}"><i>${n}</i><span>${name}</span><b>${status==="active"?"IN PROGRESS":status==="complete"?"CLEARED":"PENDING"}</b></div>`}).join("")}</aside>`;
}

function stationFeed(state) {
  const entries=state.history.slice(-3);
  return `<section class="station-feed"><header><span>AUDIO / STATION FEED</span><b>SECURE CHANNEL</b></header>${waveform()}<div>${entries.map(item=>`<p><i>${new Date(item.at).toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"})}</i>${e(item.text)}</p>`).join("")}</div></section>`;
}

function missionPlate(state) {
  return `<section class="mission-plate"><span>${e(state.stageDefinition.kicker)}</span><h1>${e(state.stageDefinition.title)}</h1><p>${e(state.stageDefinition.scene)}</p><strong>${e(state.stageDefinition.objective)}</strong></section>`;
}

function immersiveOutcome(state, facilitator = false) {
  const result=state.outcomes[state.stage]; if(!result)return "";
  const facilitatorControl=state.facilitatorCanConfirmEnding?button("Confirm final record","CONFIRM_ENDING","danger"):state.facilitatorCanAdvance?button("Continue emergency","ADVANCE_STAGE","primary"):"";
  return `<section class="consequence-overlay ${result.quality}"><div class="consequence-scan"></div><div class="consequence-inner"><img class="consequence-scene" src="./assets/images/${state.stageDefinition.consequenceImage||state.stageDefinition.image}" alt="${e(state.stageDefinition.title)} consequence scene"><div class="consequence-shade"></div><span>STAGE ${String(state.stage).padStart(2,"0")} / CONSEQUENCE</span><h2>${e(result.headline)}</h2><p>${e(result.detail)}</p><div class="consequence-telemetry">${tracks(state)}</div>${facilitator&&facilitatorControl?facilitatorControl:`<small>${state.stage===7?"FINAL RECORD AWAITING FACILITATOR CONFIRMATION":"AWAITING FACILITATOR"}</small>`}</div></section>`;
}

function tracks(state) {
  const item = (name, value, max, labels, tone) => `<div class="full-track"><div><span>${name}</span><b class="tone-${tone}">${labels[value]}</b></div><div>${Array.from({length:max+1},(_,i)=>`<i class="${i<=value?`on ${tone}`:""}"></i>`).join("")}</div></div>`;
  return `<div class="full-tracks">${item("UPPER AIR",state.global.upperAir,3,["STABLE","TRACE","UNSAFE","CRITICAL"],"amber")}${item("EXTERNAL TRUST",state.global.trust,2,["UNVERIFIED","HEARD","CREDIBLE"],"cyan")}${item("OFFICIAL STATUS",state.global.official,3,["DRAFTING","REPEATING","HARDENING","FILED"],"green")}</div>`;
}

function scene(state, compact = false) {
  const s = state.stageDefinition;
  if (!s) return "";
  return `<section class="game-scene ${compact?"compact":""}"><img src="./assets/images/${s.image}" alt="${e(s.title)}"><div class="game-scene-shade"></div><div class="game-scene-copy"><p class="eyebrow">STAGE ${String(state.stage).padStart(2,"0")} / ${e(s.kicker)}</p><h1>${e(s.title)}</h1><p>${e(s.scene)}</p><strong>${e(s.objective)}</strong></div><div class="game-clock ${seconds(state)<=60?"urgent":""}"><span>${state.stageStatus.toUpperCase()}</span><b data-clock>${time(seconds(state))}</b></div></section>`;
}

function roster(state) {
  return `<div class="full-roster">${roleList(state).map(([id,r])=>{const p=state.players[id], ready=state.reports[id], absent=state.absentRoles?.[id];return `<div class="${absent?"absent":""}"><span class="role-code color-${r.color}">${r.short}</span><span><b>${p?e(p.name):r.name}</b><small>${absent?"Temporarily absent":ready?"Assessment shared":p?"Connected":"Awaiting player"}</small></span><i class="${absent?"":ready?"ready":p?"online":""}"></i></div>`}).join("")}</div>`;
}

function assemblyRoster(state) {
  return `<div class="assembly-roster">${roleList(state).map(([id,r])=>{const p=state.players[id];return `<article class="${p?"connected":""}">${gameIcon(roleAsset(id),`${r.name} instrument`)}<span><em>${r.short}</em><b>${p?e(p.name):r.name}</b><small>${p?"CHANNEL LOCKED":"AWAITING OPERATOR"}</small></span><i></i></article>`}).join("")}</div>`;
}

function evidence(state) {
  return `<div class="evidence-ledger">${state.global.evidence.length ? state.global.evidence.slice(-8).map(x=>`<span>${e(x)}</span>`).join("") : "<p>No verified evidence entered</p>"}</div>`;
}

function outcome(state) {
  const result = state.outcomes[state.stage];
  if (!result) return "";
  return `<section class="full-outcome ${result.quality}"><p class="eyebrow">CONSEQUENCE / ${result.expired?"TIME EXPIRED":"CREW DECISION"}</p><h2>${e(result.headline)}</h2><p>${e(result.detail)}</p><div>${tracks(state)}</div></section>`;
}

function safety(state) { return state.safetyPaused ? `<div class="safety-screen"><div><span>SESSION PAUSED</span><h2>Take the time you need.</h2><p>The game clock is stopped. The facilitator will resume when the group is ready.</p></div></div>` : ""; }
function observerMode(state){return state.viewer.kind==="player"&&state.absentRoles?.[state.viewer.role]?`<div class="observer-screen"><div><span>OBSERVER MODE</span><h2>Your controls are safely isolated.</h2><p>You remain connected. The facilitator can restore this role without requiring an explanation.</p></div></div>`:"";}

function renderShared(state) {
  if (state.status === "lobby") return renderWaiting(state, "SHARED STATION DISPLAY");
  if (state.status === "ending") return renderEnding(state, "shared");
  app.innerHTML = `<div class="game-runtime shared-runtime">${runtimeBackground(state)}${runtimeHud(state,"SHARED STATION")}
    ${challengeStack(state)}
    ${missionPlate(state)}
    <aside class="telemetry-rack"><header><span>STATION TELEMETRY</span><i>LIVE</i></header>${tracks(state)}<div class="telemetry-evidence"><span>VERIFIED / ${state.global.evidence.length}</span>${evidence(state)}</div></aside>
    <aside class="crew-rack"><header>NIGHT CREW / ${Object.keys(state.players).length}.${state.playerCount}</header>${roster(state)}</aside>
    ${environmentStrip(state)}
    ${signalIntercept(state)}
    ${stationFeed(state)}
    <section class="system-broadcast ${state.global.official>=2?"degraded":""}"><span>STATION STATUS</span><strong>${e(state.officialStatus.code)}</strong><i>${e(state.officialStatus.detail)}</i></section>
    ${state.hint?`<div class="runtime-alert"><b>FACILITATOR</b><span>${e(state.hint)}</span></div>`:""}
    ${state.stageStatus==="resolved"?immersiveOutcome(state):""}${safety(state)}
  </div>`;
}

function renderWaiting(state, label) {
  const full=Object.keys(state.players).length===state.playerCount,ready=full&&state.safetyBriefed;
  app.innerHTML = `<div class="game-runtime assembly-runtime"><div class="runtime-world"><img src="./assets/images/station-exterior.png" alt="Blackout Ridge"><div class="runtime-grade"></div><div class="storm-flash"></div></div>
    <header class="assembly-header">${brandLogo("assembly-logo")}<div><small>${e(label)}</small></div><strong>SESSION ${e(state.code)}</strong></header>
    <section class="assembly-console assembly-machine"><header>${gameIcon(crewAsset(state.playerCount),`${state.playerCount} terminal station ring`)}<div><span>SHIFT AUTHENTICATION / ${crewProtocol(state.playerCount)}</span><h1>${state.playerCount===2?"DUO CREW":state.playerCount<6?"COMBINED CREW":"NIGHT CREW"} ASSEMBLING</h1><p><b>${Object.keys(state.players).length}</b> / ${state.playerCount} TERMINALS LOCKED</p></div><i></i></header>${assemblyRoster(state)}<div class="assembly-care ${state.safetyBriefed?"confirmed":""}"><span>PARTICIPANT CARE / REQUIRED</span><p>${e(state.participantCare)}</p>${state.viewer.kind==="facilitator"&&!state.safetyBriefed?`<button data-action="ACK_SAFETY">CONFIRM BRIEF DELIVERED</button>`:`<b>${state.safetyBriefed?"BRIEF CONFIRMED":"AWAITING FACILITATOR BRIEF"}</b>`}</div>${state.viewer.kind==="facilitator"?`<div class="assembly-tools"><button data-copy-view="join">${gameIcon("control-copy-link.png","Crew link connector")}<span><b>TRANSMIT CREW LINK</b><small>COPY SECURE INTAKE ADDRESS</small></span><i></i></button><a href="${url("shared",state.code)}" target="_blank">${gameIcon("control-shared-display.png","Shared command display")}<span><b>ROOM DISPLAY</b><small>OPEN STATION WORLD VIEW</small></span><i></i></a></div><button class="assembly-start illustrated-control" data-action="START_GAME" ${ready?"":"disabled"}>${gameIcon("control-start-emergency.png","Emergency start lever")}<span><b>${!full?"AWAITING FULL CREW":!state.safetyBriefed?"CONFIRM CARE BRIEF":"INITIATE EMERGENCY"}</b><small>LOCK ROLES · START STAGE 01</small></span><i></i></button>`:`<div class="assembly-wait">${gameIcon("control-crew-channel.png","Crew radio waiting")}<span><b>CHANNEL SECURED</b><small>${state.safetyBriefed?"AWAITING COMMAND AUTHORITY":"PARTICIPANT BRIEF PENDING"}</small></span><i></i></div>`}</section>
  </div>`;
}

function choiceOptions(entries, selected) { return entries.map(([id,label])=>`<option value="${id}" ${selected===id?"selected":""}>${label}</option>`).join(""); }

function decisionControls(state) {
  if (state.stageStatus !== "live") return "";
  const s=state.stageDefinition,d=state.draft,a=state.actions;
  if (s.mechanic === "holds" || s.mechanic === "power") { const key=s.mechanic==="holds"?"holds":"powered", max=3,fixed=s.mechanic==="power"?`<div class="fixed-circuit"><span>MAIN RELAY</span><b>MANDATORY / FORCED LIVE</b><i>OPTIONAL CAPACITY: 3 CIRCUITS</i></div>`:""; return `${fixed}<div class="decision-checks">${s.options.map(([id,label])=>`<label><input type="checkbox" data-array="${key}" value="${id}" ${(d[key]||[]).includes(id)?"checked":""}><span><i></i>${label}</span></label>`).join("")}</div><p class="decision-limit">SELECT ${max} / CURRENT ${(d[key]||[]).length}</p>`; }
  if (s.mechanic === "signals") return `<div class="decision-selects">${s.options.map(([id,label])=>`<label><span>${label}</span><select data-field="${id}">${choiceOptions(Object.entries(a.signalActions).map(([k,v])=>[k,`${v[0]} · ${v[1]} SLOT${v[1]===1?"":"S"}`]),d[id])}</select></label>`).join("")}<label><span>MOST DECISION-RELEVANT SOURCE</span><select data-field="priority">${choiceOptions(s.options,d.priority)}</select></label></div>`;
  if (s.mechanic === "outside") {
    if(state.fieldRun?.active)return `<div class="field-run-state"><span>OUTSIDE RUN / MOVE ${state.fieldRun.step} OF 3</span><b>${e(state.players[state.fieldRun.runner]?.name||state.roles[state.fieldRun.runner]?.name||state.fieldRun.runner)} · ${e(state.fieldRun.destination.toUpperCase())}</b><p>${state.fieldRun.findings.length?state.fieldRun.findings.map(e).join(" · "):"NO FINDINGS TRANSMITTED"}</p><small class="${state.fieldRun.meterPpm>=state.fieldRun.meterLimit?"critical":""}">AIR METER ${state.fieldRun.meterPpm} / ${state.fieldRun.meterLimit} PPM · ${e(state.fieldRun.meterTrend)} · GUIDANCE ${state.fieldRun.guidance.length}/3 · EXPOSURE ${state.fieldRun.exposure}</small>${state.viewer.kind==="facilitator"?`<div class="field-move-controls">${a.fieldMoves.map(([id,label])=>`<button type="button" data-field-move="${id}">${label}</button>`).join("")}</div>`:""}</div>`;
    return `<div class="decision-selects"><label><span>RUNNER</span><select data-field="runner">${choiceOptions(roleList(state).map(([id,r])=>[id,state.players[id]?.name||r.name]),d.runner)}</select></label><label><span>DESTINATION</span><select data-field="destination">${choiceOptions(s.options,d.destination)}</select></label><label><span>ABORT RULE</span><input data-field="abort" value="${e(d.abort||"")}" maxlength="80"></label></div>`;
  }
  if (s.mechanic === "hatch") return `<div class="decision-selects"><label><span>PROCEDURE</span><select data-field="procedure">${choiceOptions(s.options,d.procedure)}</select></label><label><span>RESPIRATOR</span><select data-field="respirator">${choiceOptions(a.hatchResources,d.respirator)}</select></label><label><span>UPPER WATCHER</span><select data-field="watcher">${choiceOptions(roleList(state).map(([id,r])=>[id,state.players[id]?.name||r.name]),d.watcher)}</select></label></div>`;
  if (s.mechanic === "correction") return `<div class="correction-attempt">TRANSMISSION ${state.correctionAttempt||1} / 2${state.correctionAttempt===2?" · SHORT RETRY WINDOW":""}</div><div class="correction-builder">${Object.entries(a.correction).map(([field,entries],i)=>`<label><i>${i+1}</i><span>${field.toUpperCase()}<select data-field="${field}">${choiceOptions(entries,d[field])}</select></span></label>`).join("")}</div>`;
  if (s.mechanic === "finale") return `<div class="finale-round">ACTION ROUND ${state.finaleRound || 1} / 2${state.playerCount===2?" · BOTH OPERATORS MUST OWN AT LEAST ONE LANE":""}</div><div class="finale-lanes">${Object.entries(a.finale).map(([field,entries])=>`<label class="lane-${field}"><span>${field.toUpperCase()}</span><select data-field="${field}">${choiceOptions(entries,d[field])}</select><select data-field="${field}Lead">${choiceOptions(roleList(state).map(([id,r])=>[id,state.players[id]?.name||r.name]),d[`${field}Lead`])}</select><small>ASSIGNED LEAD · ${field==="lock"?"Control the interlock":field==="signal"?"Change the outside truth":"Protect Mara and the crew"}</small></label>`).join("")}</div>`;
  return "";
}

function playerReport(state) {
  const report=state.reports[state.viewer.role];
  return state.stageStatus==="live"?`<form class="role-report" data-report><label>YOUR RECOMMENDATION<textarea name="note" maxlength="160" placeholder="What must the crew understand?">${e(report?.note||"")}</textarea></label><button class="button secondary full">${report?"Update assessment":"Share with crew"}</button></form>`:`<p class="closed-copy">Decision window closed.</p>`;
}

function fieldPlayerControl(state) {
  const run=state.fieldRun;if(state.stage!==4||state.stageStatus!=="live"||!run?.active)return "";
  const isRunner=state.viewer.role===run.runner;
  return `<section class="field-player-control ${isRunner?"runner":"crew"}"><header><span>${isRunner?`RUNNER MOVE ${run.step} / 3`:"RUNNER GUIDANCE CHANNEL"}</span><b>${e(state.players[run.runner]?.name||state.roles[run.runner]?.name||run.runner)}</b></header><div class="field-air-meter ${run.meterPpm>=run.meterLimit?"critical":""}"><span>AIR METER</span><b>${run.meterPpm} PPM</b><i>${e(run.meterTrend)} / ABORT ${run.meterLimit}</i></div><div class="field-findings">${run.findings.length?run.findings.map(item=>`<i>${e(item)}</i>`).join(""):"<i>NO FINDINGS YET</i>"}</div>${isRunner?`<div class="field-move-controls">${state.actions.fieldMoves.map(([id,label])=>`<button type="button" data-field-move="${id}">${label}</button>`).join("")}</div>`:`<form data-guidance><label>BURST ${run.guidance.length+1} / 3<input name="message" maxlength="90" placeholder="Short instruction or safeguard" ${run.guidance.length>=3?"disabled":""}></label><button ${run.guidance.length>=3?"disabled":""}>SEND GUIDANCE</button></form>`}<small>ABORT RULE: ${e(run.abort||"RUNNER-CONTROLLED WITHDRAWAL")}</small></section>`;
}

function renderPlayer(state) {
  if (state.status === "lobby") return renderWaiting(state,"PRIVATE ROLE TERMINAL");
  if (state.status === "ending") return renderEnding(state,"player");
  const role=state.roles[state.viewer.role], card=state.privateCard, isLead=state.viewer.role==="lead";
  app.innerHTML=`<div class="game-runtime player-runtime role-${role.color} ${state.playerCount===2?"duo-runtime":""}">${runtimeBackground(state)}${runtimeHud(state,"PRIVATE TERMINAL",role)}
    <section class="role-instrument"><header><span>${e(state.viewer.name)} / ${role.lens}</span><i>${card.confidence}</i></header><div class="instrument-signal"><b>PRIVATE EVIDENCE</b><span>CHANNEL ${String(state.stage).padStart(2,"0")}.${role.short}</span></div>${waveform(34)}<h1>${e(card.title)}</h1><p>${e(card.body)}</p><div class="instrument-prompt"><span>SHARE ONLY WHAT THE CREW NEEDS TO ACT.</span><button data-download-role>ARCHIVE ROLE BRIEF</button></div></section>
    <aside class="role-actions"><section><header>CREW LINK <b>${Object.keys(state.reports).length}/${state.playerCount}</b></header>${playerReport(state)}</section><section><header>ROLE OVERRIDE <b>${state.viewer.role in (state.interventions||{})?"USED":"READY"}</b></header><h2>${e(card.intervention)}</h2>${state.interventionFeedback?.[state.viewer.role]?`<p class="intervention-feedback">${e(state.interventionFeedback[state.viewer.role])}</p>`:button("Execute override","INTERVENTION","secondary",state.stageStatus!=="live"||state.viewer.role in (state.interventions||{}))}</section></aside>
    ${fieldPlayerControl(state)}
    ${isLead&&state.stageStatus==="live"&&!(state.stage===4&&state.fieldRun?.active)?`<section class="lead-command"><header><span>CREW COMMITMENT / STAGE ${state.stage}</span><b>${state.stageDefinition.objective}</b></header><div class="lead-controls">${decisionControls(state)}</div>${button(state.stage===7?`Commit action round ${state.finaleRound||1}`:state.stage===6&&state.correctionAttempt===2?"Transmit correction retry":"Commit crew decision","COMMIT_STAGE","danger")}</section>`:""}
    ${state.hint?`<div class="runtime-alert"><b>FACILITATOR</b><span>${e(state.hint)}</span></div>`:""}${state.stageStatus==="resolved"?immersiveOutcome(state):""}${safety(state)}${observerMode(state)}
  </div>`;
}

function facReports(state) { return `<div class="fac-full-reports">${roleList(state).map(([id,r])=>{const p=state.players[id],report=state.reports[id],absent=state.absentRoles?.[id];return `<div class="${absent?"absent":""}"><span class="role-code color-${r.color}">${r.short}</span><span><b>${p?e(p.name):r.name}</b><small>${absent?"Temporarily absent":report?e(report.note||report.recommendation||"Assessment shared"):p?"No assessment":"Not connected"}</small></span></div>`}).join("")}</div>`; }

function facilitatorRoleTools(state){
  const connected=roleList(state).filter(([id])=>state.players[id]&&!state.absentRoles?.[id]),empty=roleList(state).filter(([id])=>!state.players[id]||state.absentRoles?.[id]);
  return `<div class="fac-role-tools"><span>CREW RECOVERY</span>${connected.map(([id,r])=>`<div><b>${r.short}</b><button data-absent-role="${id}">${state.absentRoles?.[id]?"MARK PRESENT":"MARK ABSENT"}</button><button data-resend-role="${id}">RE-SEND CARD</button></div>`).join("")}${connected.length&&empty.length?`<form data-reassign><select name="from">${choiceOptions(connected.map(([id,r])=>[id,state.players[id].name||r.name]),connected[0][0])}</select><select name="to">${choiceOptions(empty.map(([id,r])=>[id,r.name]),empty[0][0])}</select><button>REASSIGN ROLE</button></form>`:""}</div>`;
}

function renderFacilitator(state) {
  if (state.status === "lobby") return renderWaiting(state,"FACILITATOR CONTROL");
  if (state.status === "ending") return renderEnding(state,"facilitator");
  app.innerHTML=`<div class="game-runtime director-runtime">${runtimeBackground(state)}${runtimeHud(state,"FACILITATOR / GAME MASTER")}
    <aside class="director-left"><header>LIVE CONTROL</header><div class="director-buttons">${state.clock.running?button("Pause","PAUSE","secondary"):button("Resume","RESUME","secondary",state.stageStatus!=="live")}${button("+30 sec","ADD_TIME","secondary",state.stageStatus!=="live")}${button(state.safetyPaused?"Clear safety":"Safety pause","SAFETY","secondary")}${state.hint?button("Clear prompt","CLEAR_HINT","secondary"):button("Send prompt","HINT","secondary")}</div><div class="director-reports"><span>ROLE COMMS</span>${facReports(state)}</div>${facilitatorRoleTools(state)}</aside>
    <section class="director-center"><div class="director-mission"><span>STAGE ${String(state.stage).padStart(2,"0")} / ${state.stageDefinition.kicker}</span><h1>${e(state.stageDefinition.title)}</h1><p>${e(state.stageDefinition.objective)}</p></div><div class="director-decision"><header><span>CREW DECISION ENGINE</span><b>${state.stageStatus.toUpperCase()}</b></header>${state.stageStatus==="live"?decisionControls(state):`<h2>${e(state.outcomes[state.stage]?.headline||"")}</h2><p>${e(state.outcomes[state.stage]?.detail||"")}</p>`}${state.stageStatus==="live"&&!(state.stage===4&&state.fieldRun?.active)?button(state.stage===7?`Resolve round ${state.finaleRound||1}`:state.stage===6&&state.correctionAttempt===2?"Resolve correction retry":"Resolve decision","COMMIT_STAGE","danger"):state.facilitatorCanConfirmEnding?button("Confirm final record","CONFIRM_ENDING","danger"):state.facilitatorCanAdvance?button("Trigger next stage","ADVANCE_STAGE","primary"):""}</div></section>
    <aside class="director-right"><header>STATION STATE</header>${tracks(state)}<div class="director-resources"><span>RESPIRATOR <b>${e(state.global.respirator.toUpperCase())}</b></span><span>LOCK KNOWLEDGE <b>${state.global.lockKnowledge}/2</b></span><span>AIR BUFFER <b>${state.resources.airHandlingBuffer}</b></span><span>SAFEGUARD <b>${state.resources.safetyGuard}</b></span></div>${environmentStrip(state,true)}${signalIntercept(state,true)}<div class="director-evidence"><span>EVIDENCE / ${state.global.evidence.length}</span>${evidence(state)}</div><div class="director-log"><span>EVENT LOG</span>${state.history.slice(-6).reverse().map(h=>`<p><b>${new Date(h.at).toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"})}</b>${e(h.text)}</p>`).join("")}</div></aside>
    ${state.stageStatus==="resolved"?immersiveOutcome(state,true):""}${safety(state)}
  </div>`;
}

const compactValue=value=>Array.isArray(value)?value.map(compactValue).join("+"):value&&typeof value==="object"?Object.entries(value).map(([key,item])=>`${key}:${compactValue(item)}`).join(", "):String(value);
const decisionSummary=decision=>Array.isArray(decision)?decision.map((round,index)=>`R${index+1}: ${decisionSummary(round)}`).join(" / "):Object.entries(decision||{}).map(([key,value])=>`${key}=${compactValue(value)}`).join(" · ");

function debriefContext(state,current,mode){
  if(current?.id===2)return `<section class="debrief-context status-failure-map">${[["OPERATIONAL","Relay transmitting—not people safe"],["GREEN","May describe a stale frozen feed"],["NO ACTIVE DISTRESS","Silence compressed into certainty"],["LOWER ROUTE","Legacy station route—not downhill road"]].map(([label,meaning])=>`<article><b>${label}</b><span>${meaning}</span></article>`).join("")}</section>`;
  if(current?.id===3)return `<section class="debrief-context role-map-grid">${Object.entries(state.debrief?.roleMap||{}).map(([role,item])=>`<article><header><i>${e(item.short)}</i><b>${e(item.name)}</b></header><strong>${item.areas.map(e).join(" · ")}</strong><p>${item.questions.map(e).join(" ")}</p></article>`).join("")}</section>`;
  if(current?.id===4){const active=state.debrief?.profileSignals||[];return `<section class="debrief-context readiness-grid"><header>OBSERVED BEHAVIOUR LENSES — NOT PERSONALITY SCORES</header>${(state.debrief?.readinessProfiles||[]).map(profile=>`${mode==="facilitator"?`<button class="${active.includes(profile.id)?"active":""}" data-profile-signal="${profile.id}">`:`<article class="${active.includes(profile.id)?"active":""}">`}<b>${e(profile.title)}</b><span>${e(profile.prompt)}</span><small>WATCH: ${e(profile.risk)}</small>${mode==="facilitator"?"</button>":"</article>"}`).join("")}</section>`;}
  if(current?.id===5)return `<section class="debrief-context ai-bridge"><article><b>FIND THE FALSE PROXY</b><span>Which dashboard or AI label measures system activity rather than the human outcome?</span></article><article><b>NAME THE MISSING SOURCE</b><span>What evidence, user, colleague, or operating context is absent?</span></article><article><b>BOUND THE TEST</b><span>What is the smallest safeguarded action that could challenge the label?</span></article></section>`;
  return "";
}

function debriefPanel(state, mode) {
  const steps=state.debrief?.steps||[],current=steps.find(item=>item.id===state.debrief.currentStep)||steps[0];
  const submitted=state.viewer.kind==="player"?state.debrief?.firstSteps?.[state.viewer.role]:null;
  return `<section class="ending-debrief"><header><span>AFTER-ACTION SIGNAL</span><b>AI-READY LEADER DEBRIEF · STEP ${String(current?.id||1).padStart(2,"0")} / 06</b></header><h2>${e(current?.title||"Immediate reactions")}</h2><p class="debrief-current-prompt">${e(current?.prompt||"")}</p><div class="debrief-step-rail">${steps.map(step=>`<i data-step="${step.id}" class="${step.id===current?.id?"active":step.id<current?.id?"done":""}"><b>${e(step.title)}</b></i>`).join("")}</div>${debriefContext(state,current,mode)}${mode==="player"&&current?.id===6?`<form class="first-step-form" data-first-step><label>YOUR BOUNDED WORKPLACE ACTION<textarea name="note" maxlength="280" required placeholder="I will challenge or clarify…">${e(submitted?.note||"")}</textarea></label><button>${submitted?"UPDATE FIRST STEP":"RECORD FIRST STEP"}</button></form>`:""}</section>`;
}

function playtestForm(state){
  const record=state.playtest||{ratings:{},criteria:[],disposition:"unreviewed"};
  const options=[["","—"],["1","1 / FAILED"],["2","2 / WEAK"],["3","3 / MIXED"],["4","4 / STRONG"],["5","5 / EXCELLENT"]];
  const dispositions=[["unreviewed","NOT REVIEWED"],["proceed","PROCEED"],["revise","REVISE & RETEST"],["kill_reframe","STOP / HEAVILY REFRAME"]];
  return `<details class="playtest-record" ${record.updatedAt?"open":""}><summary>PROTOTYPE PLAYTEST RECORD ${record.updatedAt?"/ SAVED":"/ REQUIRED AFTER PILOT"}</summary>${record.needsReframe?`<div class="reframe-alert">AI ALIGNMENT FAILED — STOP OR HEAVILY REFRAME BEFORE PRODUCTION.</div>`:""}<form data-playtest><div>${(record.criteria||[]).map(item=>`<label><span>${e(item.title)}</span><small>${e(item.question)}</small><select name="rating_${item.id}">${options.map(([value,label])=>`<option value="${value}" ${String(record.ratings?.[item.id]||"")===value?"selected":""}>${label}</option>`).join("")}</select></label>`).join("")}</div><label>DESIGN DISPOSITION<select name="disposition">${dispositions.map(([value,label])=>`<option value="${value}" ${record.disposition===value?"selected":""}>${label}</option>`).join("")}</select></label><label>PLAYTEST OBSERVATIONS<textarea name="notes" maxlength="1600" placeholder="Clarity, role value, remote friction, survival pressure, debrief transfer…">${e(record.notes||"")}</textarea></label><button>SAVE PLAYTEST EVIDENCE</button></form></details>`;
}

function facilitatorDebrief(state) {
  const steps=state.debrief?.steps||[],current=steps.find(item=>item.id===state.debrief.currentStep)||steps[0],note=state.debrief?.notes?.[current?.id]||"";
  const firstSteps=Object.entries(state.debrief?.firstSteps||{});
  return `<aside class="ending-log debrief-facilitator"><header>FACILITATOR DEBRIEF / 20–25 MIN</header><nav>${steps.map(step=>`<button class="${step.id===current?.id?"active":""}" data-debrief-step="${step.id}">${String(step.id).padStart(2,"0")}</button>`).join("")}</nav><strong>${e(current?.title||"")}</strong><p class="fac-debrief-prompt">${e(current?.prompt||"")}</p><form data-debrief-note><input type="hidden" name="step" value="${current?.id||1}"><textarea name="note" maxlength="1200" placeholder="Capture observations without diagnosing participants…">${e(note)}</textarea><button>SAVE FACILITATOR NOTE</button></form><section><b>FIRST-STEP RECORD / ${firstSteps.length}/${state.playerCount}</b>${firstSteps.length?firstSteps.map(([role,item])=>`<p><i>${e(state.roles[role]?.short||role)}</i>${e(item.name)} — ${e(item.note)}</p>`).join(""):"<p>Waiting for participant commitments at Step 06.</p>"}</section><button class="debrief-export" data-download-summary>EXPORT SESSION RECORD</button>${playtestForm(state)}</aside>`;
}

function renderEnding(state, mode) {
  const x=state.ending;
  const clean=x.title==="CLEAN RESCUE";
  const finalImage=clean?"mara-venn-below.png":"auxiliary-relay-hold.png";
  app.innerHTML=`<div class="game-runtime ending-runtime ${clean?"clean-rescue":"critical-ending"} ${mode==="facilitator"?"facilitator-ending":""}"><div class="runtime-world"><img src="./assets/images/${finalImage}" alt="Final Blackout Ridge outcome"><div class="runtime-grade"></div><div class="scan-sweep"></div></div>${runtimeHud(state,mode==="facilitator"?"FACILITATOR / FINAL RECORD":"FINAL TRANSMISSION")}
    <div class="ending-stage-seal" aria-label="Stage 7 of 7 complete"><span>FINAL CHALLENGE</span><strong>07</strong><i>/ 07</i><b>${clean?"RESCUE SECURED":"FINAL RECORD"}</b></div>
    <section class="ending-transmission"><span>STAGE 07 / 07&nbsp;&nbsp;·&nbsp;&nbsp;FINAL OUTCOME</span><h1>${e(x.title)}</h1><p>${e(x.body)}</p><div class="ending-verdict"><i class="${x.lockControlled?"confirmed":"failed"}"><b>${x.lockControlled?"✓":"×"}</b>${x.lockControlled?"INTERLOCK CONTROLLED":"INTERLOCK FAILED"}</i><i class="${x.correctionAccepted?"confirmed":"failed"}"><b>${x.correctionAccepted?"✓":"×"}</b>${x.correctionAccepted?"CORRECTION ACCEPTED":"OUTSIDE RECORD UNCORRECTED"}</i></div></section>
    <aside class="ending-truth"><header><span>PARALLEL STAKES</span><i>${clean?"LIVE / CONFIRMED":"FINAL / DEGRADED"}</i></header><div><span>STATUS OUTCOME</span><b>${e(x.statusOutcome||(x.correctionAccepted?"HUMAN RESCUE SITE":"OPERATIONAL / NO ACTIVE DISTRESS"))}</b></div><div><span>RESCUE / SURVIVAL</span><b>${e(x.rescueOutcome||`MARA: ${x.mara.toUpperCase().replaceAll("_"," ")}`)}</b><small>${e(x.survivalOutcome||`CREW ${x.crew.toUpperCase()}`)} · INTERLOCK ${x.lockControlled?"CONTROLLED":"FAILED"}</small></div><footer><i></i><span>${clean?"EXTRACTION CHANNEL OPEN":"OUTCOME ARCHIVED"}</span></footer></aside>
    ${debriefPanel(state,mode)}
    ${mode==="facilitator"?facilitatorDebrief(state):""}
  </div>`;
}

function renderGallery() {
  const assets=[["station-exterior.png","Blackout Ridge"],["relay-control-room.png","Surface relay room"],["outside-run.png","Outside Run"],["containment-hatch.png","Containment interlock"],["auxiliary-relay-hold.png","Auxiliary Relay Hold"],["mara-venn-below.png","Mara Venn below"],["calder-vale-cordon.png","Calder Vale cordon"],["lark-shift-archive.png","The Lark Shift"]];
  app.innerHTML=`<div class="app-frame gallery-view">${topbar("CINEMATIC ASSET ARCHIVE","")}<main class="gallery-main"><section class="gallery-heading"><div><p class="eyebrow">VISUAL DIRECTION / SET 01</p><h1>The world of Blackout Ridge</h1><p>Grounded operational horror—no monsters, no evil AI, no decorative fiction.</p></div><a class="button secondary" href="${url("home","")}">Return</a></section><section class="asset-grid">${assets.map(([file,title],i)=>`<figure class="asset-card ${file.includes("lark")?"archive":""}"><img src="./assets/images/${file}" alt="${title}"><figcaption><span>${String(i+1).padStart(2,"0")}</span><div><h2>${title}</h2><p>Game environment and evidence asset</p></div></figcaption></figure>`).join("")}</section></main></div>`;
}

function renderError() { app.innerHTML=`<div class="app-frame">${topbar("CONNECTION ERROR")}<main class="error-main"><p class="eyebrow">UNABLE TO CONTINUE</p><h1>${e(error||"Session unavailable")}</h1><a class="button secondary" href="${url("home","")}">Return home</a></main></div>`; }

function render(state) {
  if (!state) return;
  if (view==="shared") renderShared(state); else if (view==="player") renderPlayer(state); else if (view==="facilitator") renderFacilitator(state);
}

app.addEventListener("submit",async event=>{
  event.preventDefault(); error="";
  try {
    if (event.target.matches("[data-create]")) { const data=new FormData(event.target), result=await client.create(Number(data.get("playerCount"))); localStorage.setItem(`blackout-token-${result.code}`,result.facilitatorToken); location.href=url("facilitator",result.code,result.facilitatorToken); }
    if (event.target.matches("[data-enter]")) { const data=new FormData(event.target); location.href=url("join",String(data.get("code")).toUpperCase()); }
    if (event.target.matches("[data-join]")) { const data=new FormData(event.target),result=await client.join(data.get("name"),data.get("role")); localStorage.setItem(`blackout-token-${code}`,result.playerToken); location.href=url("player",code,result.playerToken); }
    if (event.target.matches("[data-report]")) { const data=new FormData(event.target); await client.action("REPORT",{note:data.get("note"),recommendation:"shared"}); }
    if (event.target.matches("[data-guidance]")) { const data=new FormData(event.target); await client.action("FIELD_GUIDANCE",{message:data.get("message")}); }
    if (event.target.matches("[data-reassign]")) { const data=new FormData(event.target); await client.action("REASSIGN_PLAYER",{from:data.get("from"),to:data.get("to")}); }
    if (event.target.matches("[data-debrief-note]")) { const data=new FormData(event.target); await client.action("SAVE_DEBRIEF_NOTE",{step:Number(data.get("step")),note:data.get("note")}); }
    if (event.target.matches("[data-first-step]")) { const data=new FormData(event.target); await client.action("SAVE_FIRST_STEP",{note:data.get("note")}); }
    if (event.target.matches("[data-playtest]")) { const data=new FormData(event.target),ratings={};for(const item of client.state.playtest?.criteria||[]){const value=data.get(`rating_${item.id}`);if(value)ratings[item.id]=Number(value);}await client.action("SAVE_PLAYTEST",{ratings,disposition:data.get("disposition"),notes:data.get("notes")}); }
  } catch(cause) { error=cause.message; if(view==="join") renderJoin(); else if(view==="home") renderHome(); else renderError(); }
});

app.addEventListener("change",async event=>{
  const state=client.state;if(!state)return;
  try {
    if(event.target.matches("[data-field]")) await client.action("UPDATE_DRAFT",{[event.target.dataset.field]:event.target.value});
    if(event.target.matches("[data-array]")){const key=event.target.dataset.array,current=[...(state.draft[key]||[])];const next=event.target.checked?[...new Set([...current,event.target.value])]:current.filter(x=>x!==event.target.value);await client.action("UPDATE_DRAFT",{[key]:next});}
  }catch(cause){error=cause.message;render(client.state);}
});

app.addEventListener("click",async event=>{
  const entry=event.target.closest("[data-entry-mode]");
  if(entry){entryMode=entry.dataset.entryMode;error="";renderHome();return;}
  const crew=event.target.closest("[data-crew-size]");
  if(crew){entryCrewSize=Number(crew.dataset.crewSize);renderHome();return;}
  const create=event.target.closest("[data-create-session]");
  if(create){
    create.disabled=true;const label=create.querySelector("[data-control-label]");if(label)label.textContent="INITIALIZING…";
    try{const result=await client.create(entryCrewSize);localStorage.setItem(`blackout-token-${result.code}`,result.facilitatorToken);location.href=url("facilitator",result.code,result.facilitatorToken);}catch(cause){error=cause.message;entryMode="host";renderHome();}
    return;
  }
  const sound=event.target.closest("[data-sound]");
  if(sound){await stationAudio.toggle();render(client.state);return;}
  const copy=event.target.closest("[data-copy-view]");
  if(copy){await navigator.clipboard.writeText(url(copy.dataset.copyView,code));const label=copy.querySelector("b");if(label)label.textContent="CREW LINK COPIED";stationAudio.cue("confirm");return;}
  const fieldMove=event.target.closest("[data-field-move]");
  if(fieldMove){try{await client.action("FIELD_MOVE",{move:fieldMove.dataset.fieldMove});stationAudio.cue(fieldMove.dataset.fieldMove==="withdraw"?"commit":"confirm");}catch(cause){stationAudio.cue("error");alert(cause.message);}return;}
  const absent=event.target.closest("[data-absent-role]");
  if(absent){await client.action("SET_ABSENT",{role:absent.dataset.absentRole,absent:!client.state.absentRoles?.[absent.dataset.absentRole]});return;}
  const resend=event.target.closest("[data-resend-role]");
  if(resend){await client.action("RESEND_CARD",{role:resend.dataset.resendRole});stationAudio.cue("confirm");return;}
  const debriefStep=event.target.closest("[data-debrief-step]");
  if(debriefStep){await client.action("SET_DEBRIEF_STEP",{step:Number(debriefStep.dataset.debriefStep)});stationAudio.cue("confirm");return;}
  const profileSignal=event.target.closest("[data-profile-signal]");
  if(profileSignal){await client.action("TOGGLE_PROFILE_SIGNAL",{id:profileSignal.dataset.profileSignal});stationAudio.cue("confirm");return;}
  const roleDownload=event.target.closest("[data-download-role]");
  if(roleDownload){const state=client.state,card=state.privateCard,role=state.roles[state.viewer.role],body=["BLACKOUT RIDGE / PRIVATE ROLE BRIEF",`SESSION: ${state.code}`,`STAGE: ${String(state.stage).padStart(2,"0")} / ${state.stageDefinition.kicker}`,`ROLE: ${role.name}`,`LENS: ${role.lens}`,`CONFIDENCE: ${card.confidence}`,"",card.title,card.body,"",`ROLE OVERRIDE: ${card.intervention}`,"",state.participantCare].join("\n"),blob=new Blob([body],{type:"text/plain"}),href=URL.createObjectURL(blob),anchor=document.createElement("a");anchor.href=href;anchor.download=`blackout-ridge-${state.code}-${state.viewer.role}-stage-${state.stage}.txt`;anchor.click();setTimeout(()=>URL.revokeObjectURL(href),500);return;}
  const download=event.target.closest("[data-download-summary]");
  if(download){const state=client.state,payload={session:state.code,ending:state.ending,metrics:state.metrics,decisions:state.decisions,debrief:state.debrief,playtest:state.playtest,environment:state.environment,officialStatus:state.officialStatus,history:state.history};const blob=new Blob([JSON.stringify(payload,null,2)],{type:"application/json"}),href=URL.createObjectURL(blob),anchor=document.createElement("a");anchor.href=href;anchor.download=`blackout-ridge-${state.code}-session-record.json`;anchor.click();setTimeout(()=>URL.revokeObjectURL(href),500);return;}
  const target=event.target.closest("[data-action]");if(!target||target.disabled)return;
  try{await client.action(target.dataset.action);stationAudio.cue(target.dataset.action==="COMMIT_STAGE"?"commit":"confirm");}catch(cause){error=cause.message;stationAudio.cue("error");alert(error);}
});

function tick(){const state=client.state;if(!state)return;document.querySelectorAll("[data-clock]").forEach(node=>node.textContent=time(seconds(state)));}
setInterval(tick,250);

async function boot(){
  if(view==="home")return renderHome();if(view==="gallery")return renderGallery();if(view==="join")return renderJoin();
  if(!code){error="No session code supplied";return renderError();}
  try{client.subscribe(render);await client.load();if(!snapshotMode)client.connect();}catch(cause){error=cause.message;renderError();}
}
boot();
