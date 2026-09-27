// round.js：整轮投票（一次扫描，每个接受者每轮只看一次）
import { judge } from "./acceptor.js";

function fail(code, message) {
  const error = new Error(message);
  error.code = code;
  return error;
}

function isNonNegInt(value) {
  return Number.isInteger(value) && value >= 0;
}

export function runRound(spec) {
  const input = spec || {};
  const acceptorCount = input.acceptors;
  if (!Number.isInteger(acceptorCount) || acceptorCount < 2) {
    throw fail("E_BAD_PARAM", "acceptors 必须是不小于 2 的正整数");
  }
  const quorum = input.quorum;
  if (!Number.isInteger(quorum) || quorum < 1 || quorum > acceptorCount) {
    throw fail("E_BAD_QUORUM", "quorum 必须是不超过接受者总数的正整数");
  }
  const ops = input.ops;
  if (!Array.isArray(ops)) {
    throw fail("E_BAD_OP", "ops 必须是操作表");
  }

  const promised = new Array(acceptorCount).fill(0);
  const accepted = [];
  const success = [];
  const failed = [];
  let finalValue = -1;

  for (let spot = 0; spot < ops.length; spot += 1) {
    const op = ops[spot];
    if (!op || !isNonNegInt(op.ballot) || !isNonNegInt(op.value)) {
      throw fail("E_BAD_OP", "票号与值都必须是非负整数");
    }
    let nods = 0;
    for (let index = 0; index < acceptorCount; index += 1) {
      const verdict = judge(promised[index], op.ballot);
      promised[index] = verdict.promised;
      if (verdict.accept) {
        nods += 1;
      }
    }
    accepted.push(nods);
    if (nods >= quorum) {
      success.push(spot + 1);
      finalValue = op.value;
    } else {
      failed.push(spot + 1);
    }
  }

  return { accepted: accepted, success: success, failed: failed,
           final: finalValue, promised: promised };
}
