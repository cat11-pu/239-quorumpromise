// round.js：整轮投票
import { judge } from "./acceptor.js";

function fail(code, message) {
  const error = new Error(message);
  error.code = code;
  throw error;
}

function isNonNegativeInteger(n) {
  return typeof n === "number" && Number.isInteger(n) && n >= 0;
}

export function runRound(spec) {
  const acceptors = spec && spec.acceptors;
  const quorum = spec && spec.quorum;
  const ops = (spec && spec.ops) || [];

  if (!Number.isInteger(acceptors) || acceptors < 2) {
    fail("E_BAD_PARAM", "acceptors 必须是不小于 2 的正整数");
  }
  if (!Number.isInteger(quorum) || quorum < 1 || quorum > acceptors) {
    fail("E_BAD_QUORUM", "quorum 必须是不超过接受者总数的正整数");
  }
  for (let i = 0; i < ops.length; i += 1) {
    const op = ops[i];
    if (!op || !isNonNegativeInteger(op.ballot) || !isNonNegativeInteger(op.value)) {
      fail("E_BAD_OP", "票号与值必须是非负整数");
    }
  }

  const promised = new Array(acceptors).fill(0);
  const accepted = [];
  const success = [];
  const failed = [];
  let final = -1;

  for (let i = 0; i < ops.length; i += 1) {
    const ballot = ops[i].ballot;
    let got = 0;
    for (let a = 0; a < acceptors; a += 1) {
      const verdict = judge(promised[a], ballot);
      promised[a] = verdict.promised;
      if (verdict.accept) got += 1;
    }
    accepted.push(got);
    if (got >= quorum) {
      success.push(i + 1);
      final = ops[i].value;
    } else {
      failed.push(i + 1);
    }
  }

  return { accepted: accepted, success: success, failed: failed, final: final, promised: promised };
}
