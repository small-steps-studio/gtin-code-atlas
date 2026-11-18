'use strict';
// Contract tests: written from the specification examples. Do not edit; fix src/core.js instead.
const test = require('node:test');
const assert = require('node:assert/strict');
const core = require('../src/core');

const plain = (v) => JSON.parse(JSON.stringify(v === undefined ? null : v));

test('core exports every specified function', () => {
  for (const n of ["checkDigit", "decodeValue", "parseElementString", "toDigitalLink", "reportValidation", "reportDecoded", "reportCheckDigits", "reportDigitalLink", "reportSerials"]) assert.equal(typeof core[n], 'function', n);
});

test("checkDigit example 1", () => {
  assert.deepStrictEqual(plain(core.checkDigit("0950600013435")), 2);
});

test("checkDigit example 2", () => {
  assert.deepStrictEqual(plain(core.checkDigit("400638133393")), 1);
});

test("checkDigit example 3", () => {
  assert.deepStrictEqual(plain(core.checkDigit("12a")), -1);
});

test("decodeValue example 1", () => {
  assert.deepStrictEqual(plain(core.decodeValue("17", "261231")), "2026-12-31");
});

test("decodeValue example 2", () => {
  assert.deepStrictEqual(plain(core.decodeValue("17", "261200")), "2026-12-31");
});

test("decodeValue example 3", () => {
  assert.deepStrictEqual(plain(core.decodeValue("15", "261301")), "");
});

test("decodeValue example 4", () => {
  assert.deepStrictEqual(plain(core.decodeValue("7003", "2612311430")), "2026-12-31 14:30");
});

test("decodeValue example 5", () => {
  assert.deepStrictEqual(plain(core.decodeValue("3103", "001250")), "1.250");
});

test("decodeValue example 6", () => {
  assert.deepStrictEqual(plain(core.decodeValue("3922", "1299")), "12.99");
});

test("decodeValue example 7", () => {
  assert.deepStrictEqual(plain(core.decodeValue("3932", "9781299")), "978 12.99");
});

test("decodeValue example 8", () => {
  assert.deepStrictEqual(plain(core.decodeValue("10", "ABC")), "ABC");
});

test("decodeValue example 9", () => {
  assert.deepStrictEqual(plain(core.decodeValue("3302", "012345")), "123.45");
});

test("parseElementString example 1", () => {
  assert.deepStrictEqual(plain(core.parseElementString("(01)09506000134352(17)261231(10)ABC123")), {"ok": true, "form": "bracketed", "elements": [{"id": "01", "value": "09506000134352"}, {"id": "17", "value": "261231"}, {"id": "10", "value": "ABC123"}], "error": ""});
});

test("parseElementString example 2", () => {
  assert.deepStrictEqual(plain(core.parseElementString("]C101095060001343521726120010LOT-7<GS>21SN001")), {"ok": true, "form": "raw", "elements": [{"id": "01", "value": "09506000134352"}, {"id": "17", "value": "261200"}, {"id": "10", "value": "LOT-7"}, {"id": "21", "value": "SN001"}], "error": ""});
});

test("parseElementString example 3", () => {
  assert.deepStrictEqual(plain(core.parseElementString("https://id.gs1.org/01/9506000134352/10/AB%2F12?17=270115&x=1")), {"ok": true, "form": "digital link", "elements": [{"id": "01", "value": "09506000134352"}, {"id": "10", "value": "AB/12"}, {"id": "17", "value": "270115"}], "error": ""});
});

test("parseElementString example 4", () => {
  assert.deepStrictEqual(plain(core.parseElementString("(01)09506000134353(17)261231")), {"ok": false, "form": "bracketed", "elements": [{"id": "01", "value": "09506000134353"}, {"id": "17", "value": "261231"}], "error": "(01) check digit is wrong"});
});

test("parseElementString example 5", () => {
  assert.deepStrictEqual(plain(core.parseElementString("(00)106141411234567897(3302)012345(91)WH-4")), {"ok": true, "form": "bracketed", "elements": [{"id": "00", "value": "106141411234567897"}, {"id": "3302", "value": "012345"}, {"id": "91", "value": "WH-4"}], "error": ""});
});

test("parseElementString example 6", () => {
  assert.deepStrictEqual(plain(core.parseElementString("12345")), {"ok": false, "form": "raw", "elements": [{"id": "12", "value": "345"}], "error": "(12) needs 6 digits"});
});

test("parseElementString example 7", () => {
  assert.deepStrictEqual(plain(core.parseElementString("")), {"ok": false, "form": "unknown", "elements": [], "error": "no element string found"});
});

test("toDigitalLink example 1", () => {
  assert.deepStrictEqual(plain(core.toDigitalLink([{"id": "01", "value": "09506000134352"}, {"id": "17", "value": "261231"}, {"id": "10", "value": "ABC123"}])), "https://id.gs1.org/01/09506000134352/10/ABC123?17=261231");
});

test("toDigitalLink example 2", () => {
  assert.deepStrictEqual(plain(core.toDigitalLink([{"id": "00", "value": "106141411234567897"}, {"id": "3302", "value": "012345"}])), "https://id.gs1.org/00/106141411234567897?3302=012345");
});

test("toDigitalLink example 3", () => {
  assert.deepStrictEqual(plain(core.toDigitalLink([{"id": "01", "value": "09506000134352"}, {"id": "21", "value": "S/1"}, {"id": "91", "value": "X"}])), "https://id.gs1.org/01/09506000134352/21/S%2F1?91=X");
});

test("toDigitalLink example 4", () => {
  assert.deepStrictEqual(plain(core.toDigitalLink([{"id": "10", "value": "X"}])), "");
});

test("reportValidation example 1", () => {
  const md = core.reportValidation("(01)09506000134352(17)261231(10)ABC123\n]C101095060001343521726120010LOT-7<GS>21SN001\nhttps://id.gs1.org/01/09506000134352/10/ABC123/21/SN002?17=270115\n(01)09506000134353(17)261331\n4006381333931\n(00)106141411234567897(3302)012345(91)WH-4\n(01)09506000134352(21)SN001(7003)2612311430(3103)001250(3922)1299\n4006381333932\n(01)09506000134352(10)A_B\n(99)X\nhttps://example.test/01/9506000134352?3103=000500\n");
  assert.equal(typeof md, 'string');
  for (const s of ["9 element strings, 8 valid, 1 with errors.", "2 bare codes (see Show Check Digits).", "| 1 | bracketed | 3 | valid |", "| 2 | raw | 4 | valid |", "| 3 | digital link | 4 | valid |", "| 4 | bracketed | 2 | \\(01\\) check digit is wrong |", "| 9 | bracketed | 2 | valid |", "| 10 | bracketed | 1 | valid |"]) assert.ok(md.includes(s), 'missing: ' + s);
});

test("reportValidation example 2", () => {
  const md = core.reportValidation("");
  assert.equal(typeof md, 'string');
  for (const s of ["# Element String Check", "The file contains no codes."]) assert.ok(md.includes(s), 'missing: ' + s);
});

test("reportDecoded example 1", () => {
  const md = core.reportDecoded("(01)09506000134352(17)261231(10)ABC123\n]C101095060001343521726120010LOT-7<GS>21SN001\nhttps://id.gs1.org/01/09506000134352/10/ABC123/21/SN002?17=270115\n(01)09506000134353(17)261331\n4006381333931\n(00)106141411234567897(3302)012345(91)WH-4\n(01)09506000134352(21)SN001(7003)2612311430(3103)001250(3922)1299\n4006381333932\n(01)09506000134352(10)A_B\n(99)X\nhttps://example.test/01/9506000134352?3103=000500\n");
  assert.equal(typeof md, 'string');
  for (const s of ["| 1 | (17) | USE BY or EXPIRY | 2026-12-31 |", "| 2 | (17) | USE BY or EXPIRY | 2026-12-31 |", "| 3 | (17) | USE BY or EXPIRY | 2027-01-15 |", "| 6 | (3302) | GROSS WEIGHT \\(kg\\) | 123.45 |", "| 6 | (91) | INTERNAL | WH-4 |", "| 7 | (7003) | EXPIRY TIME | 2026-12-31 14:30 |", "| 7 | (3103) | NET WEIGHT \\(kg\\) | 1.250 |", "| 7 | (3922) | PRICE | 12.99 |", "| 11 | (3103) | NET WEIGHT \\(kg\\) | 0.500 |"]) assert.ok(md.includes(s), 'missing: ' + s);
});

test("reportDecoded example 2", () => {
  const md = core.reportDecoded("hello world\n\n");
  assert.equal(typeof md, 'string');
  for (const s of ["# Decoded Elements", "No valid element strings."]) assert.ok(md.includes(s), 'missing: ' + s);
});

test("reportCheckDigits example 1", () => {
  const md = core.reportCheckDigits("(01)09506000134352(17)261231(10)ABC123\n]C101095060001343521726120010LOT-7<GS>21SN001\nhttps://id.gs1.org/01/09506000134352/10/ABC123/21/SN002?17=270115\n(01)09506000134353(17)261331\n4006381333931\n(00)106141411234567897(3302)012345(91)WH-4\n(01)09506000134352(21)SN001(7003)2612311430(3103)001250(3922)1299\n4006381333932\n(01)09506000134352(10)A_B\n(99)X\nhttps://example.test/01/9506000134352?3103=000500\n");
  assert.equal(typeof md, 'string');
  for (const s of ["| 5 | 4006381333931 | GTIN-13 | 1 | valid |", "| 8 | 4006381333932 | GTIN-13 | 2 | wrong check digit (expected 1) |", "1 of 2 bare codes valid."]) assert.ok(md.includes(s), 'missing: ' + s);
});

test("reportCheckDigits example 2", () => {
  const md = core.reportCheckDigits("hello world\n\n");
  assert.equal(typeof md, 'string');
  for (const s of ["# Check Digits", "No bare codes in this file."]) assert.ok(md.includes(s), 'missing: ' + s);
});

test("reportDigitalLink example 1", () => {
  const md = core.reportDigitalLink("(01)09506000134352(17)261231(10)ABC123\n]C101095060001343521726120010LOT-7<GS>21SN001\nhttps://id.gs1.org/01/09506000134352/10/ABC123/21/SN002?17=270115\n(01)09506000134353(17)261331\n4006381333931\n(00)106141411234567897(3302)012345(91)WH-4\n(01)09506000134352(21)SN001(7003)2612311430(3103)001250(3922)1299\n4006381333932\n(01)09506000134352(10)A_B\n(99)X\nhttps://example.test/01/9506000134352?3103=000500\n");
  assert.equal(typeof md, 'string');
  for (const s of ["| 1 | \\(01\\)09506000134352\\(17\\)261231\\(10\\)ABC123 | https\\:\\/\\/id.gs1.org/01/09506000134352/10/ABC123?17=261231 |", "| 6 | \\(00\\)106141411234567897\\(3302\\)012345\\(91\\)WH-4 | https\\:\\/\\/id.gs1.org/00/106141411234567897?3302=012345\\&91=WH-4 |", "| 7 | \\(01\\)09506000134352\\(21\\)SN001\\(7003\\)2612311430\\(3103\\)001250\\(3922\\)1299 | https\\:\\/\\/id.gs1.org/01/09506000134352/21/SN001?7003=2612311430\\&3103=001250\\&3922=1299 |", "| 10 | \\(99\\)X | no primary key |"]) assert.ok(md.includes(s), 'missing: ' + s);
});

test("reportDigitalLink example 2", () => {
  const md = core.reportDigitalLink("hello world\n\n");
  assert.equal(typeof md, 'string');
  for (const s of ["# Digital Link Conversion", "No valid element strings."]) assert.ok(md.includes(s), 'missing: ' + s);
});

test("reportSerials example 1", () => {
  const md = core.reportSerials("(01)09506000134352(17)261231(10)ABC123\n]C101095060001343521726120010LOT-7<GS>21SN001\nhttps://id.gs1.org/01/09506000134352/10/ABC123/21/SN002?17=270115\n(01)09506000134353(17)261331\n4006381333931\n(00)106141411234567897(3302)012345(91)WH-4\n(01)09506000134352(21)SN001(7003)2612311430(3103)001250(3922)1299\n4006381333932\n(01)09506000134352(10)A_B\n(99)X\nhttps://example.test/01/9506000134352?3103=000500\n");
  assert.equal(typeof md, 'string');
  for (const s of ["| 09506000134352 | 6 | 3 | 2 |", "## Duplicate serials", "| 09506000134352 | SN001 | 2, 7 |"]) assert.ok(md.includes(s), 'missing: ' + s);
});

test("reportSerials example 2", () => {
  const md = core.reportSerials("hello world\n\n");
  assert.equal(typeof md, 'string');
  for (const s of ["# GTIN and Serial Inventory", "No valid element strings with a GTIN."]) assert.ok(md.includes(s), 'missing: ' + s);
});
