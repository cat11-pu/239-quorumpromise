// acceptor.js：一个接受者的判决（票号不小于已承诺票号才接受，并推进承诺票号）
export function judge(promised, ballot) {
  if (ballot >= promised) {
    return { promised: ballot, accept: true };
  }
  return { promised: promised, accept: false };
}
