import fs from "node:fs";
import { judge } from "./acceptor.js";
import { runRound } from "./round.js";
import { render } from "./app.js";

// 验收断言：上面每条值收进 emit，最后与期望值逐项比对，不符就非零退出。
const __lines = [];
function emit(label, value) { __lines.push([String(label).replace(/ =$/, ""), value]); }


const spec = JSON.parse(fs.readFileSync(process.argv[2] || "sample/rounds.json", "utf8"));
const view = render(spec);

emit("各操作接受人数 =", JSON.stringify(view.accepted));
emit("成功操作列表 =", JSON.stringify(view.success));
emit("失败操作列表 =", JSON.stringify(view.failed));
emit("最终值 =", view.final);
emit("收尾承诺票号列表 =", JSON.stringify(view.promised));
emit("操作数 =", view.count);
emit("多数派复核 =", view.quorum_ok);
emit("承诺推进样例 =", view.tail);


// ---- 异常路径探针：真调用实现，看它报出什么码（不是从样例里抄）----
try {
  runRound({ acceptors: 1, quorum: 1, ops: [] });
  emit("参数写错的错误码", "没有报错");
} catch (error) {
  emit("参数写错的错误码", error && error.code ? error.code : String(error.message));
}
try {
  runRound({ acceptors: 3, quorum: 4, ops: [] });
  emit("多数派写错的错误码", "没有报错");
} catch (error) {
  emit("多数派写错的错误码", error && error.code ? error.code : String(error.message));
}
try {
  runRound({ acceptors: 3, quorum: 2, ops: [{ ballot: 1, value: -5 }] });
  emit("操作写错的错误码", "没有报错");
} catch (error) {
  emit("操作写错的错误码", error && error.code ? error.code : String(error.message));
}


// ---- 期望值（参考模型算出，与题面给的验收数值一致）----
const EXPECTED = {
  "各操作接受人数": [
    3,
    3,
    0,
    3
  ],
  "成功操作列表": [
    1,
    2,
    4
  ],
  "失败操作列表": [
    3
  ],
  "最终值": 7,
  "收尾承诺票号列表": [
    2,
    2,
    2
  ],
  "操作数": 4,
  "多数派复核": true,
  "承诺推进样例": 2,
  "参数写错的错误码": "E_BAD_PARAM",
  "多数派写错的错误码": "E_BAD_QUORUM",
  "操作写错的错误码": "E_BAD_OP"
};
// 有的值在收进来之前已经 stringify 过，比较前先试着解析回来，避免类型错配把正确实现判成不过。
function __same(got, want) {
  if (typeof got === "string") {
    try { const parsed = JSON.parse(got); if (JSON.stringify(parsed) === JSON.stringify(want)) return true; } catch (error) { /* 不是 JSON 就按原文比 */ }
  }
  return JSON.stringify(got) === JSON.stringify(want);
}
let __bad = 0;
for (const [label, want] of Object.entries(EXPECTED)) {
  const found = __lines.find((pair) => pair[0] === label);
  if (!found) { __bad += 1; console.log("缺失验收项 " + label); continue; }
  const got = found[1];
  if (__same(got, want)) { console.log("一致 " + label + " = " + JSON.stringify(got)); }
  else { __bad += 1; console.log("不一致 " + label + " 期望 " + JSON.stringify(want) + " 实际 " + JSON.stringify(got)); }
}
console.log("验收项 " + (Object.keys(EXPECTED).length - __bad) + "/" + Object.keys(EXPECTED).length + " 通过");
process.exit(__bad === 0 ? 0 : 1);
