// acceptor.js：一个接受者的判决
export function judge(promised, ballot) {
  if (ballot >= promised) {
    return { promised: ballot, accept: true };
  }
  return { promised: promised, accept: false };
}
