'use strict';
// Builds a code list of about `bytes` characters for the large-file test (invented codes).
function make(bytes) {
  const parts = []; let size = 0, i = 0;
  while (size < bytes) {
    const s = (i % 3 === 0 ? '(01)09506000134352(17)271231(10)L' + (i % 900) + '(21)S' + i : i % 3 === 1 ? ']C10109506000134352172712311OL' + (i % 50) + '<GS>21S' + i : '4006381333931') + '\n';
    parts.push(s); size += s.length; i++;
  }
  return parts.join('');
}
module.exports = { make };
