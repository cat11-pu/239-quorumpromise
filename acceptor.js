// acceptor.js：一个接受者的判决（基线：一律接受）
export function judge(promised, ballot) {
  return { promised: promised, accept: true };
}
