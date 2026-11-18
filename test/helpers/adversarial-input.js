'use strict';
// Hostile and odd input for the adversarial test (invented; payloads must come out as plain escaped text).
const PAY = ['x|y', '<b>y</b>', '[link](https://evil.test)', '<img src=https://evil.test/i.png>', '*b*', '_i_', '$x$', 'www.evil.test', '`code`'];
const cases = [];
PAY.forEach((p, i) => {
  cases.push({ name: 'payload ' + i, text: '(01)09506000134352(10)' + p + '(91)' + p + '\n(01)09506000134352(21)' + p + '\n(01)09506000134352(21)' + p + '\nhttps://id.gs1.org/01/09506000134352/10/' + encodeURIComponent(p) + '?91=' + encodeURIComponent(p) + '\n' + p + '\n' });
});
cases.push({ name: 'prototype names', text: '(01)09506000134352(21)__proto__\n(01)09506000134352(21)__proto__\n(01)09506000134352(10)constructor(21)toString\n(__proto__)x\nhttps://id.gs1.org/01/09506000134352?__proto__=1&constructor=2\n' });
cases.push({ name: 'huge line', text: '(01)09506000134352(10)' + 'A'.repeat(200000) + '\n' + '('.repeat(100000) + '\n' });
cases.push({ name: 'many ids', text: '(91)X'.repeat(30000) + '\n' + ']C1' + '91X<GS>'.repeat(30000) + '\n' });
cases.push({ name: 'bad urls', text: 'https://\nhttp://[::1\nhttps://id.gs1.org/%E0%A4%A/01/x\nhttps://id.gs1.org/01\n' });
module.exports = { cases };
