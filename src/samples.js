'use strict';
// The sample files of the Open Sample commands. All data is invented for this product; it names no real company, person or system.

const SAMPLES = {
 "openSample": {
  "title": "Open Sample File",
  "fileName": "warehouse-codes.txt",
  "languageId": "plaintext",
  "text": "(01)09506000134352(17)271231(10)LOT-2207(21)SN0001\n(01)09506000134352(17)271231(10)LOT-2207(21)SN0002\n]C101095060001343521727123110LOT-2208<GS>21SN0001\n(00)106141411234567897(02)09506000134352(37)24(400)PO-10023\n(01)09506000134353(17)271331\nhttps://id.gs1.org/01/09506000134352/10/LOT-2207?17=271231\n(01)09506000134352(3103)001250(91)BIN-4\n4006381333931\n4006381333932\n96385074\n"
 }
};

/** The sample with the given id, or null. */
function sampleFor(id) { return SAMPLES[id] || null; }

module.exports = { sampleFor: sampleFor, SAMPLE_IDS: Object.keys(SAMPLES) };
