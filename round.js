// round.js：整轮投票（基线：一律给空表）
import { judge } from "./acceptor.js";

export function runRound(spec) {
  return { accepted: [], success: [], failed: [], final: -1, promised: [] };
}
