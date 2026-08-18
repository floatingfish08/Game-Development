import test from "node:test";
import assert from "node:assert/strict";

import {
  allocationCost,
  createInitialState,
  evaluateAllocation,
  getRemaining,
  reduceState,
} from "../prototype/state.js";

test("initial state is a seven-player briefing with three-slot draft", () => {
  const state = createInitialState();
  assert.equal(state.playerCount, 7);
  assert.equal(state.phase, "briefing");
  assert.equal(getRemaining(state, 0), 360);
  assert.equal(allocationCost(state.draft), 3);
});

test("start and pause preserve the correct remaining time", () => {
  const initial = createInitialState();
  const started = reduceState(initial, { type: "START" }, 1_000);
  assert.equal(started.phase, "live");
  assert.equal(started.timer.endAt, 361_000);

  const paused = reduceState(started, { type: "PAUSE" }, 61_000);
  assert.equal(paused.timer.running, false);
  assert.equal(paused.timer.remaining, 300);
});

test("a correlated allocation produces the strongest evidence", () => {
  const result = evaluateAllocation({
    voice: "replay",
    bulletin: "discard",
    correction: "preserve",
  });
  assert.equal(result.cost, 3);
  assert.equal(result.quality, 3);
  assert.deepEqual(result.evidence, [
    "Structured traffic",
    "‘Not road’ fragment",
    "Route beneath station",
  ]);
});

test("an allocation over capacity cannot be committed", () => {
  let state = reduceState(createInitialState(), { type: "START" }, 0);
  state = reduceState(state, { type: "SET_DRAFT", stream: "voice", action: "replay" }, 1);
  state = reduceState(state, { type: "SET_DRAFT", stream: "bulletin", action: "replay" }, 2);
  state = reduceState(state, { type: "SET_DRAFT", stream: "correction", action: "replay" }, 3);
  assert.equal(allocationCost(state.draft), 6);
  const afterCommit = reduceState(state, { type: "COMMIT" }, 4);
  assert.equal(afterCommit, state);
  assert.equal(afterCommit.phase, "live");
});

test("reports are role-specific and safely length-limited", () => {
  let state = reduceState(createInitialState(), { type: "START" }, 0);
  state = reduceState(state, {
    type: "SUBMIT_REPORT",
    role: "field",
    recommendation: "preserve",
    note: "x".repeat(200),
  }, 10);
  assert.equal(state.reports.field.recommendation, "preserve");
  assert.equal(state.reports.field.note.length, 120);
});

test("Recover Fragment improves a damaged result once", () => {
  let state = reduceState(createInitialState(), { type: "START" }, 0);
  state = reduceState(state, { type: "SET_DRAFT", stream: "voice", action: "discard" }, 1);
  state = reduceState(state, { type: "SET_DRAFT", stream: "bulletin", action: "preserve" }, 2);
  state = reduceState(state, { type: "SET_DRAFT", stream: "correction", action: "discard" }, 3);
  state = reduceState(state, { type: "COMMIT" }, 4);
  assert.equal(state.result.quality, 0);

  const recovered = reduceState(state, { type: "RECOVER_FRAGMENT" }, 5);
  assert.equal(recovered.result.quality, 1);
  assert.equal(recovered.recoveryUsed, true);

  const secondAttempt = reduceState(recovered, { type: "RECOVER_FRAGMENT" }, 6);
  assert.equal(secondAttempt, recovered);
});

test("expiry resolves the current legal draft and records expiry", () => {
  let state = reduceState(createInitialState(), { type: "START" }, 0);
  state = reduceState(state, { type: "EXPIRE" }, 360_000);
  assert.equal(state.phase, "resolved");
  assert.equal(state.timer.remaining, 0);
  assert.equal(state.result.expired, true);
  assert.equal(state.result.quality, 2);
});

test("reset returns a clean prototype state", () => {
  const live = reduceState(createInitialState(), { type: "START" }, 0);
  const reset = reduceState(live, { type: "RESET" }, 1);
  assert.deepEqual(reset, createInitialState());
});
