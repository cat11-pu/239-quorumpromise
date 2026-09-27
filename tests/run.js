import assert from "node:assert";
import { judge } from "../acceptor.js";
import { runRound } from "../round.js";
import { render } from "../app.js";

let failed = 0;
function check(name, fn) {
  try { fn(); console.log("ok " + name); } catch (e) { failed += 1; console.log("FAIL " + name + " :: " + e.message); }
}

check("judge returns a promise number", () => {
  assert.strictEqual(typeof judge(0, 2).promised, "number");
});

check("judge returns a flag", () => {
  assert.strictEqual(typeof judge(0, 2).accept, "boolean");
});

check("runRound returns accepted counts", () => {
  assert.ok(Array.isArray(runRound({ acceptors: 2, quorum: 1, ops: [] }).accepted));
});

check("render counts operations", () => {
  assert.strictEqual(typeof render({ acceptors: 2, quorum: 1, ops: [] }).count, "number");
});

check("render exposes quorum flag", () => {
  assert.strictEqual(typeof render({ acceptors: 2, quorum: 1, ops: [] }).quorum_ok, "boolean");
});

console.log("5 cases, " + failed + " failed");
process.exit(failed === 0 ? 0 : 1);
