// app.js：渲染结果
import { judge } from "./acceptor.js";
import { runRound } from "./round.js";

export function render(spec) {
  const ops = spec.ops || [];
  const count = spec.acceptors || 0;
  const view = runRound(spec);
  const accepted = view.accepted || [];
  return { accepted: accepted, success: view.success || [], failed: view.failed || [],
           final: view.final === undefined ? -1 : view.final, promised: view.promised || [],
           count: ops.length,
           quorum_ok: accepted.every(function (got) { return got <= count; }),
           tail: judge(0, 2).promised };
}
