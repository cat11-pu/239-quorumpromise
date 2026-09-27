// ui.js：操作面板与视图（原生 DOM，无弹窗）
import { render } from "./app.js";

export function mount(spec, parts) {
  parts.log.textContent = "接受者 " + (spec.acceptors || 0) + " 个，多数派 " + (spec.quorum || 0)
    + "，操作 " + (spec.ops || []).length + " 次。";

  function draw() {
    let view = null;
    try {
      view = render(spec);
    } catch (error) {
      parts.out.textContent = String(error && error.code ? error.code : error);
      parts.log.textContent = "跑不动：" + String(error && error.message ? error.message : error);
      return;
    }
    parts.out.textContent = JSON.stringify(view, null, 1);
    parts.stage.textContent = "";
    (spec.ops || []).forEach(function (op, spot) {
      const row = document.createElement("div");
      row.className = "row";
      const head = document.createElement("span");
      head.textContent = "第 " + (spot + 1) + " 次 票号 " + op.ballot + " 值 " + op.value;
      row.appendChild(head);
      const bar = document.createElement("span");
      bar.className = "bar";
      const fill = document.createElement("i");
      const got = (view.accepted || [])[spot] || 0;
      fill.style.width = Math.min(100, Math.round(got * 100 / Math.max(1, spec.acceptors || 1))) + "%";
      bar.appendChild(fill);
      row.appendChild(bar);
      const mark = document.createElement("span");
      const done = (view.success || []).indexOf(spot + 1) !== -1;
      mark.className = "chip" + (done ? " ok" : " bad");
      mark.textContent = done ? "达到多数派 " + got + " 人" : "只有 " + got + " 人";
      row.appendChild(mark);
      parts.stage.appendChild(row);
    });
    parts.legend.textContent = "成功 " + view.success.length + " 次，失败 " + view.failed.length + " 次，最终值 "
      + view.final;
    parts.log.textContent = "收尾承诺票号 " + JSON.stringify(view.promised);
  }

  const ballotInput = document.createElement("input");
  ballotInput.type = "number";
  ballotInput.value = "3";
  parts.controls.appendChild(ballotInput);

  const valueInput = document.createElement("input");
  valueInput.type = "number";
  valueInput.value = "11";
  parts.controls.appendChild(valueInput);

  const runButton = document.createElement("button");
  runButton.className = "primary";
  runButton.textContent = "算一遍";
  runButton.addEventListener("click", draw);
  parts.controls.appendChild(runButton);

  const addButton = document.createElement("button");
  addButton.textContent = "追加一次操作";
  addButton.addEventListener("click", function () {
    const ballot = Number(ballotInput.value);
    const value = Number(valueInput.value);
    spec.ops = (spec.ops || []).concat([{ ballot: Number.isFinite(ballot) ? Math.max(0, Math.round(ballot)) : 0,
                                         value: Number.isFinite(value) ? Math.max(0, Math.round(value)) : 0 }]);
    draw();
  });
  parts.controls.appendChild(addButton);

  const dropButton = document.createElement("button");
  dropButton.textContent = "删最后一次操作";
  dropButton.addEventListener("click", function () {
    spec.ops = (spec.ops || []).slice(0, Math.max(0, (spec.ops || []).length - 1));
    draw();
  });
  parts.controls.appendChild(dropButton);

  const wideButton = document.createElement("button");
  wideButton.textContent = "接受者加一";
  wideButton.addEventListener("click", function () {
    spec.acceptors = (spec.acceptors || 1) + 1;
    draw();
  });
  parts.controls.appendChild(wideButton);

  draw();
}
