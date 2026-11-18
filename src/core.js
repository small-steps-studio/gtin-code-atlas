'use strict';
// GS1 Application Identifier table and exact value checks, built from the
// GS1 Barcode Syntax Dictionary (Copyright GS1 AISBL, the BWIPP project and the Zint project; Apache License 2.0).
// Names defined here:
//   GS1_IDS[id] = [title, format, fixed, linkAttribute, linkKey]   (id is a string such as '01', '3103', '7003')
//     format: space-separated components such as 'N14,csum,gcppos2', 'X..20', 'N6,yymmd0', 'N3,iso4217 N..15', '[N2],ss' (optional)
//     fixed: 1 when the identifier has a predefined length and needs no separator; linkAttribute: 1 when it may be a GS1 Digital Link query attribute
//     linkKey: null, or an array of qualifier sequences when it is a Digital Link primary key (for '01': [['22','10','21'],['235']])
//   idTitle(id) -> title or ''                     isKnownId(id) -> boolean
//   idAt(text, pos) -> the identifier that starts at pos in a raw string (the table decides 2, 3 or 4 digits) or ''
//   fixedLength(id) -> total length of a predefined-length identifier's value, else 0
//   checkValue(id, value) -> '' when the value is valid, else an error text: '(01) needs 14 digits', '(01) check digit is wrong',
//     '(17) is not a valid date', '(10) is longer than 20 characters', '(10) contains characters outside the GS1 set', ...
//   gs1Date(yymmdd, dayZeroAllowed) -> 'YYYY-MM-DD' or '' (GS1 century window; day 00 = last day of the month when allowed)
//   checkDigit(digits) -> GS1 mod-10 check digit of a digit string WITHOUT its check digit, or -1 for non-digits
const GS1_IDS = {
  "00": ["SSCC", "N18,csum,gcppos2", 1, 1, [[]]],
  "01": ["GTIN", "N14,csum,gcppos2", 1, 1, [["22", "10", "21"], ["235"]]],
  "02": ["CONTENT", "N14,csum,gcppos2", 1, 1, null],
  "03": ["MTO GTIN", "N14,csum,gcppos2", 1, 0, null],
  "10": ["BATCH/LOT", "X..20", 0, 1, null],
  "11": ["PROD DATE", "N6,yymmd0", 1, 1, null],
  "12": ["DUE DATE", "N6,yymmd0", 1, 1, null],
  "13": ["PACK DATE", "N6,yymmd0", 1, 1, null],
  "15": ["BEST BEFORE or BEST BY", "N6,yymmd0", 1, 1, null],
  "16": ["SELL BY", "N6,yymmd0", 1, 1, null],
  "17": ["USE BY or EXPIRY", "N6,yymmd0", 1, 1, null],
  "20": ["VARIANT", "N2", 1, 1, null],
  "21": ["SERIAL", "X..20", 0, 0, null],
  "22": ["CPV", "X..20", 0, 0, null],
  "235": ["TPX", "X..28", 0, 0, null],
  "240": ["ADDITIONAL ID", "X..30", 0, 1, null],
  "241": ["CUST. PART No.", "X..30", 0, 1, null],
  "242": ["MTO VARIANT", "N..6", 0, 1, null],
  "243": ["PCN", "X..20", 0, 1, null],
  "250": ["SECONDARY SERIAL", "X..30", 0, 1, null],
  "251": ["REF. TO SOURCE", "X..30", 0, 1, null],
  "253": ["GDTI", "N13,csum,gcppos1 [X..17]", 0, 1, [[]]],
  "254": ["GLN EXTENSION COMPONENT", "X..20", 0, 0, null],
  "255": ["GCN", "N13,csum,gcppos1 [N..12]", 0, 1, [[]]],
  "30": ["VAR. COUNT", "N..8", 0, 1, null],
  "3100": ["NET WEIGHT (kg)", "N6", 1, 1, null],
  "3101": ["NET WEIGHT (kg)", "N6", 1, 1, null],
  "3102": ["NET WEIGHT (kg)", "N6", 1, 1, null],
  "3103": ["NET WEIGHT (kg)", "N6", 1, 1, null],
  "3104": ["NET WEIGHT (kg)", "N6", 1, 1, null],
  "3105": ["NET WEIGHT (kg)", "N6", 1, 1, null],
  "3110": ["LENGTH (m)", "N6", 1, 1, null],
  "3111": ["LENGTH (m)", "N6", 1, 1, null],
  "3112": ["LENGTH (m)", "N6", 1, 1, null],
  "3113": ["LENGTH (m)", "N6", 1, 1, null],
  "3114": ["LENGTH (m)", "N6", 1, 1, null],
  "3115": ["LENGTH (m)", "N6", 1, 1, null],
  "3120": ["WIDTH (m)", "N6", 1, 1, null],
  "3121": ["WIDTH (m)", "N6", 1, 1, null],
  "3122": ["WIDTH (m)", "N6", 1, 1, null],
  "3123": ["WIDTH (m)", "N6", 1, 1, null],
  "3124": ["WIDTH (m)", "N6", 1, 1, null],
  "3125": ["WIDTH (m)", "N6", 1, 1, null],
  "3130": ["HEIGHT (m)", "N6", 1, 1, null],
  "3131": ["HEIGHT (m)", "N6", 1, 1, null],
  "3132": ["HEIGHT (m)", "N6", 1, 1, null],
  "3133": ["HEIGHT (m)", "N6", 1, 1, null],
  "3134": ["HEIGHT (m)", "N6", 1, 1, null],
  "3135": ["HEIGHT (m)", "N6", 1, 1, null],
  "3140": ["AREA (m\u00b2)", "N6", 1, 1, null],
  "3141": ["AREA (m\u00b2)", "N6", 1, 1, null],
  "3142": ["AREA (m\u00b2)", "N6", 1, 1, null],
  "3143": ["AREA (m\u00b2)", "N6", 1, 1, null],
  "3144": ["AREA (m\u00b2)", "N6", 1, 1, null],
  "3145": ["AREA (m\u00b2)", "N6", 1, 1, null],
  "3150": ["NET VOLUME (l)", "N6", 1, 1, null],
  "3151": ["NET VOLUME (l)", "N6", 1, 1, null],
  "3152": ["NET VOLUME (l)", "N6", 1, 1, null],
  "3153": ["NET VOLUME (l)", "N6", 1, 1, null],
  "3154": ["NET VOLUME (l)", "N6", 1, 1, null],
  "3155": ["NET VOLUME (l)", "N6", 1, 1, null],
  "3160": ["NET VOLUME (m\u00b3)", "N6", 1, 1, null],
  "3161": ["NET VOLUME (m\u00b3)", "N6", 1, 1, null],
  "3162": ["NET VOLUME (m\u00b3)", "N6", 1, 1, null],
  "3163": ["NET VOLUME (m\u00b3)", "N6", 1, 1, null],
  "3164": ["NET VOLUME (m\u00b3)", "N6", 1, 1, null],
  "3165": ["NET VOLUME (m\u00b3)", "N6", 1, 1, null],
  "3200": ["NET WEIGHT (lb)", "N6", 1, 1, null],
  "3201": ["NET WEIGHT (lb)", "N6", 1, 1, null],
  "3202": ["NET WEIGHT (lb)", "N6", 1, 1, null],
  "3203": ["NET WEIGHT (lb)", "N6", 1, 1, null],
  "3204": ["NET WEIGHT (lb)", "N6", 1, 1, null],
  "3205": ["NET WEIGHT (lb)", "N6", 1, 1, null],
  "3210": ["LENGTH (in)", "N6", 1, 1, null],
  "3211": ["LENGTH (in)", "N6", 1, 1, null],
  "3212": ["LENGTH (in)", "N6", 1, 1, null],
  "3213": ["LENGTH (in)", "N6", 1, 1, null],
  "3214": ["LENGTH (in)", "N6", 1, 1, null],
  "3215": ["LENGTH (in)", "N6", 1, 1, null],
  "3220": ["LENGTH (ft)", "N6", 1, 1, null],
  "3221": ["LENGTH (ft)", "N6", 1, 1, null],
  "3222": ["LENGTH (ft)", "N6", 1, 1, null],
  "3223": ["LENGTH (ft)", "N6", 1, 1, null],
  "3224": ["LENGTH (ft)", "N6", 1, 1, null],
  "3225": ["LENGTH (ft)", "N6", 1, 1, null],
  "3230": ["LENGTH (yd)", "N6", 1, 1, null],
  "3231": ["LENGTH (yd)", "N6", 1, 1, null],
  "3232": ["LENGTH (yd)", "N6", 1, 1, null],
  "3233": ["LENGTH (yd)", "N6", 1, 1, null],
  "3234": ["LENGTH (yd)", "N6", 1, 1, null],
  "3235": ["LENGTH (yd)", "N6", 1, 1, null],
  "3240": ["WIDTH (in)", "N6", 1, 1, null],
  "3241": ["WIDTH (in)", "N6", 1, 1, null],
  "3242": ["WIDTH (in)", "N6", 1, 1, null],
  "3243": ["WIDTH (in)", "N6", 1, 1, null],
  "3244": ["WIDTH (in)", "N6", 1, 1, null],
  "3245": ["WIDTH (in)", "N6", 1, 1, null],
  "3250": ["WIDTH (ft)", "N6", 1, 1, null],
  "3251": ["WIDTH (ft)", "N6", 1, 1, null],
  "3252": ["WIDTH (ft)", "N6", 1, 1, null],
  "3253": ["WIDTH (ft)", "N6", 1, 1, null],
  "3254": ["WIDTH (ft)", "N6", 1, 1, null],
  "3255": ["WIDTH (ft)", "N6", 1, 1, null],
  "3260": ["WIDTH (yd)", "N6", 1, 1, null],
  "3261": ["WIDTH (yd)", "N6", 1, 1, null],
  "3262": ["WIDTH (yd)", "N6", 1, 1, null],
  "3263": ["WIDTH (yd)", "N6", 1, 1, null],
  "3264": ["WIDTH (yd)", "N6", 1, 1, null],
  "3265": ["WIDTH (yd)", "N6", 1, 1, null],
  "3270": ["HEIGHT (in)", "N6", 1, 1, null],
  "3271": ["HEIGHT (in)", "N6", 1, 1, null],
  "3272": ["HEIGHT (in)", "N6", 1, 1, null],
  "3273": ["HEIGHT (in)", "N6", 1, 1, null],
  "3274": ["HEIGHT (in)", "N6", 1, 1, null],
  "3275": ["HEIGHT (in)", "N6", 1, 1, null],
  "3280": ["HEIGHT (ft)", "N6", 1, 1, null],
  "3281": ["HEIGHT (ft)", "N6", 1, 1, null],
  "3282": ["HEIGHT (ft)", "N6", 1, 1, null],
  "3283": ["HEIGHT (ft)", "N6", 1, 1, null],
  "3284": ["HEIGHT (ft)", "N6", 1, 1, null],
  "3285": ["HEIGHT (ft)", "N6", 1, 1, null],
  "3290": ["HEIGHT (yd)", "N6", 1, 1, null],
  "3291": ["HEIGHT (yd)", "N6", 1, 1, null],
  "3292": ["HEIGHT (yd)", "N6", 1, 1, null],
  "3293": ["HEIGHT (yd)", "N6", 1, 1, null],
  "3294": ["HEIGHT (yd)", "N6", 1, 1, null],
  "3295": ["HEIGHT (yd)", "N6", 1, 1, null],
  "3300": ["GROSS WEIGHT (kg)", "N6", 1, 1, null],
  "3301": ["GROSS WEIGHT (kg)", "N6", 1, 1, null],
  "3302": ["GROSS WEIGHT (kg)", "N6", 1, 1, null],
  "3303": ["GROSS WEIGHT (kg)", "N6", 1, 1, null],
  "3304": ["GROSS WEIGHT (kg)", "N6", 1, 1, null],
  "3305": ["GROSS WEIGHT (kg)", "N6", 1, 1, null],
  "3310": ["LENGTH (m), log", "N6", 1, 1, null],
  "3311": ["LENGTH (m), log", "N6", 1, 1, null],
  "3312": ["LENGTH (m), log", "N6", 1, 1, null],
  "3313": ["LENGTH (m), log", "N6", 1, 1, null],
  "3314": ["LENGTH (m), log", "N6", 1, 1, null],
  "3315": ["LENGTH (m), log", "N6", 1, 1, null],
  "3320": ["WIDTH (m), log", "N6", 1, 1, null],
  "3321": ["WIDTH (m), log", "N6", 1, 1, null],
  "3322": ["WIDTH (m), log", "N6", 1, 1, null],
  "3323": ["WIDTH (m), log", "N6", 1, 1, null],
  "3324": ["WIDTH (m), log", "N6", 1, 1, null],
  "3325": ["WIDTH (m), log", "N6", 1, 1, null],
  "3330": ["HEIGHT (m), log", "N6", 1, 1, null],
  "3331": ["HEIGHT (m), log", "N6", 1, 1, null],
  "3332": ["HEIGHT (m), log", "N6", 1, 1, null],
  "3333": ["HEIGHT (m), log", "N6", 1, 1, null],
  "3334": ["HEIGHT (m), log", "N6", 1, 1, null],
  "3335": ["HEIGHT (m), log", "N6", 1, 1, null],
  "3340": ["AREA (m\u00b2), log", "N6", 1, 1, null],
  "3341": ["AREA (m\u00b2), log", "N6", 1, 1, null],
  "3342": ["AREA (m\u00b2), log", "N6", 1, 1, null],
  "3343": ["AREA (m\u00b2), log", "N6", 1, 1, null],
  "3344": ["AREA (m\u00b2), log", "N6", 1, 1, null],
  "3345": ["AREA (m\u00b2), log", "N6", 1, 1, null],
  "3350": ["VOLUME (l), log", "N6", 1, 1, null],
  "3351": ["VOLUME (l), log", "N6", 1, 1, null],
  "3352": ["VOLUME (l), log", "N6", 1, 1, null],
  "3353": ["VOLUME (l), log", "N6", 1, 1, null],
  "3354": ["VOLUME (l), log", "N6", 1, 1, null],
  "3355": ["VOLUME (l), log", "N6", 1, 1, null],
  "3360": ["VOLUME (m\u00b3), log", "N6", 1, 1, null],
  "3361": ["VOLUME (m\u00b3), log", "N6", 1, 1, null],
  "3362": ["VOLUME (m\u00b3), log", "N6", 1, 1, null],
  "3363": ["VOLUME (m\u00b3), log", "N6", 1, 1, null],
  "3364": ["VOLUME (m\u00b3), log", "N6", 1, 1, null],
  "3365": ["VOLUME (m\u00b3), log", "N6", 1, 1, null],
  "3370": ["KG PER m\u00b2", "N6", 1, 1, null],
  "3371": ["KG PER m\u00b2", "N6", 1, 1, null],
  "3372": ["KG PER m\u00b2", "N6", 1, 1, null],
  "3373": ["KG PER m\u00b2", "N6", 1, 1, null],
  "3374": ["KG PER m\u00b2", "N6", 1, 1, null],
  "3375": ["KG PER m\u00b2", "N6", 1, 1, null],
  "3400": ["GROSS WEIGHT (lb)", "N6", 1, 1, null],
  "3401": ["GROSS WEIGHT (lb)", "N6", 1, 1, null],
  "3402": ["GROSS WEIGHT (lb)", "N6", 1, 1, null],
  "3403": ["GROSS WEIGHT (lb)", "N6", 1, 1, null],
  "3404": ["GROSS WEIGHT (lb)", "N6", 1, 1, null],
  "3405": ["GROSS WEIGHT (lb)", "N6", 1, 1, null],
  "3410": ["LENGTH (in), log", "N6", 1, 1, null],
  "3411": ["LENGTH (in), log", "N6", 1, 1, null],
  "3412": ["LENGTH (in), log", "N6", 1, 1, null],
  "3413": ["LENGTH (in), log", "N6", 1, 1, null],
  "3414": ["LENGTH (in), log", "N6", 1, 1, null],
  "3415": ["LENGTH (in), log", "N6", 1, 1, null],
  "3420": ["LENGTH (ft), log", "N6", 1, 1, null],
  "3421": ["LENGTH (ft), log", "N6", 1, 1, null],
  "3422": ["LENGTH (ft), log", "N6", 1, 1, null],
  "3423": ["LENGTH (ft), log", "N6", 1, 1, null],
  "3424": ["LENGTH (ft), log", "N6", 1, 1, null],
  "3425": ["LENGTH (ft), log", "N6", 1, 1, null],
  "3430": ["LENGTH (yd), log", "N6", 1, 1, null],
  "3431": ["LENGTH (yd), log", "N6", 1, 1, null],
  "3432": ["LENGTH (yd), log", "N6", 1, 1, null],
  "3433": ["LENGTH (yd), log", "N6", 1, 1, null],
  "3434": ["LENGTH (yd), log", "N6", 1, 1, null],
  "3435": ["LENGTH (yd), log", "N6", 1, 1, null],
  "3440": ["WIDTH (in), log", "N6", 1, 1, null],
  "3441": ["WIDTH (in), log", "N6", 1, 1, null],
  "3442": ["WIDTH (in), log", "N6", 1, 1, null],
  "3443": ["WIDTH (in), log", "N6", 1, 1, null],
  "3444": ["WIDTH (in), log", "N6", 1, 1, null],
  "3445": ["WIDTH (in), log", "N6", 1, 1, null],
  "3450": ["WIDTH (ft), log", "N6", 1, 1, null],
  "3451": ["WIDTH (ft), log", "N6", 1, 1, null],
  "3452": ["WIDTH (ft), log", "N6", 1, 1, null],
  "3453": ["WIDTH (ft), log", "N6", 1, 1, null],
  "3454": ["WIDTH (ft), log", "N6", 1, 1, null],
  "3455": ["WIDTH (ft), log", "N6", 1, 1, null],
  "3460": ["WIDTH (yd), log", "N6", 1, 1, null],
  "3461": ["WIDTH (yd), log", "N6", 1, 1, null],
  "3462": ["WIDTH (yd), log", "N6", 1, 1, null],
  "3463": ["WIDTH (yd), log", "N6", 1, 1, null],
  "3464": ["WIDTH (yd), log", "N6", 1, 1, null],
  "3465": ["WIDTH (yd), log", "N6", 1, 1, null],
  "3470": ["HEIGHT (in), log", "N6", 1, 1, null],
  "3471": ["HEIGHT (in), log", "N6", 1, 1, null],
  "3472": ["HEIGHT (in), log", "N6", 1, 1, null],
  "3473": ["HEIGHT (in), log", "N6", 1, 1, null],
  "3474": ["HEIGHT (in), log", "N6", 1, 1, null],
  "3475": ["HEIGHT (in), log", "N6", 1, 1, null],
  "3480": ["HEIGHT (ft), log", "N6", 1, 1, null],
  "3481": ["HEIGHT (ft), log", "N6", 1, 1, null],
  "3482": ["HEIGHT (ft), log", "N6", 1, 1, null],
  "3483": ["HEIGHT (ft), log", "N6", 1, 1, null],
  "3484": ["HEIGHT (ft), log", "N6", 1, 1, null],
  "3485": ["HEIGHT (ft), log", "N6", 1, 1, null],
  "3490": ["HEIGHT (yd), log", "N6", 1, 1, null],
  "3491": ["HEIGHT (yd), log", "N6", 1, 1, null],
  "3492": ["HEIGHT (yd), log", "N6", 1, 1, null],
  "3493": ["HEIGHT (yd), log", "N6", 1, 1, null],
  "3494": ["HEIGHT (yd), log", "N6", 1, 1, null],
  "3495": ["HEIGHT (yd), log", "N6", 1, 1, null],
  "3500": ["AREA (in\u00b2)", "N6", 1, 1, null],
  "3501": ["AREA (in\u00b2)", "N6", 1, 1, null],
  "3502": ["AREA (in\u00b2)", "N6", 1, 1, null],
  "3503": ["AREA (in\u00b2)", "N6", 1, 1, null],
  "3504": ["AREA (in\u00b2)", "N6", 1, 1, null],
  "3505": ["AREA (in\u00b2)", "N6", 1, 1, null],
  "3510": ["AREA (ft\u00b2)", "N6", 1, 1, null],
  "3511": ["AREA (ft\u00b2)", "N6", 1, 1, null],
  "3512": ["AREA (ft\u00b2)", "N6", 1, 1, null],
  "3513": ["AREA (ft\u00b2)", "N6", 1, 1, null],
  "3514": ["AREA (ft\u00b2)", "N6", 1, 1, null],
  "3515": ["AREA (ft\u00b2)", "N6", 1, 1, null],
  "3520": ["AREA (yd\u00b2)", "N6", 1, 1, null],
  "3521": ["AREA (yd\u00b2)", "N6", 1, 1, null],
  "3522": ["AREA (yd\u00b2)", "N6", 1, 1, null],
  "3523": ["AREA (yd\u00b2)", "N6", 1, 1, null],
  "3524": ["AREA (yd\u00b2)", "N6", 1, 1, null],
  "3525": ["AREA (yd\u00b2)", "N6", 1, 1, null],
  "3530": ["AREA (in\u00b2), log", "N6", 1, 1, null],
  "3531": ["AREA (in\u00b2), log", "N6", 1, 1, null],
  "3532": ["AREA (in\u00b2), log", "N6", 1, 1, null],
  "3533": ["AREA (in\u00b2), log", "N6", 1, 1, null],
  "3534": ["AREA (in\u00b2), log", "N6", 1, 1, null],
  "3535": ["AREA (in\u00b2), log", "N6", 1, 1, null],
  "3540": ["AREA (ft\u00b2), log", "N6", 1, 1, null],
  "3541": ["AREA (ft\u00b2), log", "N6", 1, 1, null],
  "3542": ["AREA (ft\u00b2), log", "N6", 1, 1, null],
  "3543": ["AREA (ft\u00b2), log", "N6", 1, 1, null],
  "3544": ["AREA (ft\u00b2), log", "N6", 1, 1, null],
  "3545": ["AREA (ft\u00b2), log", "N6", 1, 1, null],
  "3550": ["AREA (yd\u00b2), log", "N6", 1, 1, null],
  "3551": ["AREA (yd\u00b2), log", "N6", 1, 1, null],
  "3552": ["AREA (yd\u00b2), log", "N6", 1, 1, null],
  "3553": ["AREA (yd\u00b2), log", "N6", 1, 1, null],
  "3554": ["AREA (yd\u00b2), log", "N6", 1, 1, null],
  "3555": ["AREA (yd\u00b2), log", "N6", 1, 1, null],
  "3560": ["NET WEIGHT (tr oz)", "N6", 1, 1, null],
  "3561": ["NET WEIGHT (tr oz)", "N6", 1, 1, null],
  "3562": ["NET WEIGHT (tr oz)", "N6", 1, 1, null],
  "3563": ["NET WEIGHT (tr oz)", "N6", 1, 1, null],
  "3564": ["NET WEIGHT (tr oz)", "N6", 1, 1, null],
  "3565": ["NET WEIGHT (tr oz)", "N6", 1, 1, null],
  "3570": ["NET VOLUME (oz)", "N6", 1, 1, null],
  "3571": ["NET VOLUME (oz)", "N6", 1, 1, null],
  "3572": ["NET VOLUME (oz)", "N6", 1, 1, null],
  "3573": ["NET VOLUME (oz)", "N6", 1, 1, null],
  "3574": ["NET VOLUME (oz)", "N6", 1, 1, null],
  "3575": ["NET VOLUME (oz)", "N6", 1, 1, null],
  "3600": ["NET VOLUME (qt (US))", "N6", 1, 1, null],
  "3601": ["NET VOLUME (qt (US))", "N6", 1, 1, null],
  "3602": ["NET VOLUME (qt (US))", "N6", 1, 1, null],
  "3603": ["NET VOLUME (qt (US))", "N6", 1, 1, null],
  "3604": ["NET VOLUME (qt (US))", "N6", 1, 1, null],
  "3605": ["NET VOLUME (qt (US))", "N6", 1, 1, null],
  "3610": ["NET VOLUME (gal.)", "N6", 1, 1, null],
  "3611": ["NET VOLUME (gal.)", "N6", 1, 1, null],
  "3612": ["NET VOLUME (gal.)", "N6", 1, 1, null],
  "3613": ["NET VOLUME (gal.)", "N6", 1, 1, null],
  "3614": ["NET VOLUME (gal.)", "N6", 1, 1, null],
  "3615": ["NET VOLUME (gal.)", "N6", 1, 1, null],
  "3620": ["VOLUME (qt (US)), log", "N6", 1, 1, null],
  "3621": ["VOLUME (qt (US)), log", "N6", 1, 1, null],
  "3622": ["VOLUME (qt (US)), log", "N6", 1, 1, null],
  "3623": ["VOLUME (qt (US)), log", "N6", 1, 1, null],
  "3624": ["VOLUME (qt (US)), log", "N6", 1, 1, null],
  "3625": ["VOLUME (qt (US)), log", "N6", 1, 1, null],
  "3630": ["VOLUME (gal (US)), log", "N6", 1, 1, null],
  "3631": ["VOLUME (gal (US)), log", "N6", 1, 1, null],
  "3632": ["VOLUME (gal (US)), log", "N6", 1, 1, null],
  "3633": ["VOLUME (gal (US)), log", "N6", 1, 1, null],
  "3634": ["VOLUME (gal (US)), log", "N6", 1, 1, null],
  "3635": ["VOLUME (gal (US)), log", "N6", 1, 1, null],
  "3640": ["NET VOLUME (in\u00b3)", "N6", 1, 1, null],
  "3641": ["NET VOLUME (in\u00b3)", "N6", 1, 1, null],
  "3642": ["NET VOLUME (in\u00b3)", "N6", 1, 1, null],
  "3643": ["NET VOLUME (in\u00b3)", "N6", 1, 1, null],
  "3644": ["NET VOLUME (in\u00b3)", "N6", 1, 1, null],
  "3645": ["NET VOLUME (in\u00b3)", "N6", 1, 1, null],
  "3650": ["NET VOLUME (ft\u00b3)", "N6", 1, 1, null],
  "3651": ["NET VOLUME (ft\u00b3)", "N6", 1, 1, null],
  "3652": ["NET VOLUME (ft\u00b3)", "N6", 1, 1, null],
  "3653": ["NET VOLUME (ft\u00b3)", "N6", 1, 1, null],
  "3654": ["NET VOLUME (ft\u00b3)", "N6", 1, 1, null],
  "3655": ["NET VOLUME (ft\u00b3)", "N6", 1, 1, null],
  "3660": ["NET VOLUME (yd\u00b3)", "N6", 1, 1, null],
  "3661": ["NET VOLUME (yd\u00b3)", "N6", 1, 1, null],
  "3662": ["NET VOLUME (yd\u00b3)", "N6", 1, 1, null],
  "3663": ["NET VOLUME (yd\u00b3)", "N6", 1, 1, null],
  "3664": ["NET VOLUME (yd\u00b3)", "N6", 1, 1, null],
  "3665": ["NET VOLUME (yd\u00b3)", "N6", 1, 1, null],
  "3670": ["VOLUME (in\u00b3), log", "N6", 1, 1, null],
  "3671": ["VOLUME (in\u00b3), log", "N6", 1, 1, null],
  "3672": ["VOLUME (in\u00b3), log", "N6", 1, 1, null],
  "3673": ["VOLUME (in\u00b3), log", "N6", 1, 1, null],
  "3674": ["VOLUME (in\u00b3), log", "N6", 1, 1, null],
  "3675": ["VOLUME (in\u00b3), log", "N6", 1, 1, null],
  "3680": ["VOLUME (ft\u00b3), log", "N6", 1, 1, null],
  "3681": ["VOLUME (ft\u00b3), log", "N6", 1, 1, null],
  "3682": ["VOLUME (ft\u00b3), log", "N6", 1, 1, null],
  "3683": ["VOLUME (ft\u00b3), log", "N6", 1, 1, null],
  "3684": ["VOLUME (ft\u00b3), log", "N6", 1, 1, null],
  "3685": ["VOLUME (ft\u00b3), log", "N6", 1, 1, null],
  "3690": ["VOLUME (yd\u00b3), log", "N6", 1, 1, null],
  "3691": ["VOLUME (yd\u00b3), log", "N6", 1, 1, null],
  "3692": ["VOLUME (yd\u00b3), log", "N6", 1, 1, null],
  "3693": ["VOLUME (yd\u00b3), log", "N6", 1, 1, null],
  "3694": ["VOLUME (yd\u00b3), log", "N6", 1, 1, null],
  "3695": ["VOLUME (yd\u00b3), log", "N6", 1, 1, null],
  "37": ["COUNT", "N..8", 0, 1, null],
  "3900": ["AMOUNT", "N..15", 0, 1, null],
  "3901": ["AMOUNT", "N..15", 0, 1, null],
  "3902": ["AMOUNT", "N..15", 0, 1, null],
  "3903": ["AMOUNT", "N..15", 0, 1, null],
  "3904": ["AMOUNT", "N..15", 0, 1, null],
  "3905": ["AMOUNT", "N..15", 0, 1, null],
  "3906": ["AMOUNT", "N..15", 0, 1, null],
  "3907": ["AMOUNT", "N..15", 0, 1, null],
  "3908": ["AMOUNT", "N..15", 0, 1, null],
  "3909": ["AMOUNT", "N..15", 0, 1, null],
  "3910": ["AMOUNT", "N3,iso4217 N..15", 0, 1, null],
  "3911": ["AMOUNT", "N3,iso4217 N..15", 0, 1, null],
  "3912": ["AMOUNT", "N3,iso4217 N..15", 0, 1, null],
  "3913": ["AMOUNT", "N3,iso4217 N..15", 0, 1, null],
  "3914": ["AMOUNT", "N3,iso4217 N..15", 0, 1, null],
  "3915": ["AMOUNT", "N3,iso4217 N..15", 0, 1, null],
  "3916": ["AMOUNT", "N3,iso4217 N..15", 0, 1, null],
  "3917": ["AMOUNT", "N3,iso4217 N..15", 0, 1, null],
  "3918": ["AMOUNT", "N3,iso4217 N..15", 0, 1, null],
  "3919": ["AMOUNT", "N3,iso4217 N..15", 0, 1, null],
  "3920": ["PRICE", "N..15", 0, 1, null],
  "3921": ["PRICE", "N..15", 0, 1, null],
  "3922": ["PRICE", "N..15", 0, 1, null],
  "3923": ["PRICE", "N..15", 0, 1, null],
  "3924": ["PRICE", "N..15", 0, 1, null],
  "3925": ["PRICE", "N..15", 0, 1, null],
  "3926": ["PRICE", "N..15", 0, 1, null],
  "3927": ["PRICE", "N..15", 0, 1, null],
  "3928": ["PRICE", "N..15", 0, 1, null],
  "3929": ["PRICE", "N..15", 0, 1, null],
  "3930": ["PRICE", "N3,iso4217 N..15", 0, 1, null],
  "3931": ["PRICE", "N3,iso4217 N..15", 0, 1, null],
  "3932": ["PRICE", "N3,iso4217 N..15", 0, 1, null],
  "3933": ["PRICE", "N3,iso4217 N..15", 0, 1, null],
  "3934": ["PRICE", "N3,iso4217 N..15", 0, 1, null],
  "3935": ["PRICE", "N3,iso4217 N..15", 0, 1, null],
  "3936": ["PRICE", "N3,iso4217 N..15", 0, 1, null],
  "3937": ["PRICE", "N3,iso4217 N..15", 0, 1, null],
  "3938": ["PRICE", "N3,iso4217 N..15", 0, 1, null],
  "3939": ["PRICE", "N3,iso4217 N..15", 0, 1, null],
  "3940": ["PRCNT OFF", "N4", 0, 1, null],
  "3941": ["PRCNT OFF", "N4", 0, 1, null],
  "3942": ["PRCNT OFF", "N4", 0, 1, null],
  "3943": ["PRCNT OFF", "N4", 0, 1, null],
  "3950": ["PRICE/UoM", "N6", 0, 1, null],
  "3951": ["PRICE/UoM", "N6", 0, 1, null],
  "3952": ["PRICE/UoM", "N6", 0, 1, null],
  "3953": ["PRICE/UoM", "N6", 0, 1, null],
  "3954": ["PRICE/UoM", "N6", 0, 1, null],
  "3955": ["PRICE/UoM", "N6", 0, 1, null],
  "400": ["ORDER NUMBER", "X..30", 0, 1, null],
  "401": ["GINC", "X..30,gcppos1", 0, 1, [[]]],
  "402": ["GSIN", "N17,csum,gcppos1", 0, 1, [[]]],
  "403": ["ROUTE", "X..30", 0, 1, null],
  "410": ["SHIP TO LOC", "N13,csum,gcppos1", 1, 1, null],
  "411": ["BILL TO", "N13,csum,gcppos1", 1, 1, null],
  "412": ["PURCHASE FROM", "N13,csum,gcppos1", 1, 1, null],
  "413": ["SHIP FOR LOC", "N13,csum,gcppos1", 1, 1, null],
  "414": ["LOC No.", "N13,csum,gcppos1", 1, 1, [["254"], ["7040"]]],
  "415": ["PAY TO", "N13,csum,gcppos1", 1, 1, [["8020"]]],
  "416": ["PROD/SERV LOC", "N13,csum,gcppos1", 1, 1, null],
  "417": ["PARTY", "N13,csum,gcppos1", 1, 1, [["7040"]]],
  "420": ["SHIP TO POST", "X..20", 0, 1, null],
  "421": ["SHIP TO POST", "N3,iso3166 X..9", 0, 1, null],
  "422": ["ORIGIN", "N3,iso3166", 0, 1, null],
  "423": ["COUNTRY - INITIAL PROCESS", "N3,iso3166 [N3],iso3166 [N3],iso3166 [N3],iso3166 [N3],iso3166", 0, 1, null],
  "424": ["COUNTRY - PROCESS", "N3,iso3166", 0, 1, null],
  "425": ["COUNTRY - DISASSEMBLY", "N3,iso3166 [N3],iso3166 [N3],iso3166 [N3],iso3166 [N3],iso3166", 0, 1, null],
  "426": ["COUNTRY - FULL PROCESS", "N3,iso3166", 0, 1, null],
  "427": ["ORIGIN SUBDIVISION", "X..3", 0, 1, null],
  "4300": ["SHIP TO COMP", "X..35,pcenc", 0, 1, null],
  "4301": ["SHIP TO NAME", "X..35,pcenc", 0, 1, null],
  "4302": ["SHIP TO ADD1", "X..70,pcenc", 0, 1, null],
  "4303": ["SHIP TO ADD2", "X..70,pcenc", 0, 1, null],
  "4304": ["SHIP TO SUB", "X..70,pcenc", 0, 1, null],
  "4305": ["SHIP TO LOC", "X..70,pcenc", 0, 1, null],
  "4306": ["SHIP TO REG", "X..70,pcenc", 0, 1, null],
  "4307": ["SHIP TO COUNTRY", "X2,iso3166alpha2", 0, 1, null],
  "4308": ["SHIP TO PHONE", "X..30", 0, 1, null],
  "4309": ["SHIP TO GEO", "N10,latitude N10,longitude", 0, 1, null],
  "4310": ["RTN TO COMP", "X..35,pcenc", 0, 1, null],
  "4311": ["RTN TO NAME", "X..35,pcenc", 0, 1, null],
  "4312": ["RTN TO ADD1", "X..70,pcenc", 0, 1, null],
  "4313": ["RTN TO ADD2", "X..70,pcenc", 0, 1, null],
  "4314": ["RTN TO SUB", "X..70,pcenc", 0, 1, null],
  "4315": ["RTN TO LOC", "X..70,pcenc", 0, 1, null],
  "4316": ["RTN TO REG", "X..70,pcenc", 0, 1, null],
  "4317": ["RTN TO COUNTRY", "X2,iso3166alpha2", 0, 1, null],
  "4318": ["RTN TO POST", "X..20", 0, 1, null],
  "4319": ["RTN TO PHONE", "X..30", 0, 1, null],
  "4320": ["SRV DESCRIPTION", "X..35,pcenc", 0, 1, null],
  "4321": ["DANGEROUS GOODS", "N1,yesno", 0, 1, null],
  "4322": ["AUTH TO LEAVE", "N1,yesno", 0, 1, null],
  "4323": ["SIG REQUIRED", "N1,yesno", 0, 1, null],
  "4324": ["NOT BEF DEL DT", "N6,yymmd0 N4,hhmi", 0, 1, null],
  "4325": ["NOT AFT DEL DT", "N6,yymmd0 N4,hhmi", 0, 1, null],
  "4326": ["REL DATE", "N6,yymmdd", 0, 1, null],
  "4330": ["MAX TEMP F.", "N6 [X1],hyphen", 0, 1, null],
  "4331": ["MAX TEMP C.", "N6 [X1],hyphen", 0, 1, null],
  "4332": ["MIN TEMP F.", "N6 [X1],hyphen", 0, 1, null],
  "4333": ["MIN TEMP C.", "N6 [X1],hyphen", 0, 1, null],
  "7001": ["NSN", "N13", 0, 1, null],
  "7002": ["MEAT CUT", "X..30", 0, 1, null],
  "7003": ["EXPIRY TIME", "N6,yymmdd N4,hhmi", 0, 1, null],
  "7004": ["ACTIVE POTENCY", "N..4", 0, 1, null],
  "7005": ["CATCH AREA", "X..12", 0, 1, null],
  "7006": ["FIRST FREEZE DATE", "N6,yymmdd", 0, 1, null],
  "7007": ["HARVEST DATE", "N6,yymmdd [N6],yymmdd", 0, 1, null],
  "7008": ["AQUATIC SPECIES", "X..3", 0, 1, null],
  "7009": ["FISHING GEAR TYPE", "X..10", 0, 1, null],
  "7010": ["PROD METHOD", "X..2", 0, 1, null],
  "7011": ["TEST BY DATE", "N6,yymmdd [N4],hhmi", 0, 1, null],
  "7020": ["REFURB LOT", "X..20", 0, 1, null],
  "7021": ["FUNC STAT", "X..20", 0, 1, null],
  "7022": ["REV STAT", "X..20", 0, 1, null],
  "7023": ["GIAI - ASSEMBLY", "X..30,gcppos1", 0, 1, null],
  "7030": ["PROCESSOR # 0", "N3,iso3166999 X..27", 0, 1, null],
  "7031": ["PROCESSOR # 1", "N3,iso3166999 X..27", 0, 1, null],
  "7032": ["PROCESSOR # 2", "N3,iso3166999 X..27", 0, 1, null],
  "7033": ["PROCESSOR # 3", "N3,iso3166999 X..27", 0, 1, null],
  "7034": ["PROCESSOR # 4", "N3,iso3166999 X..27", 0, 1, null],
  "7035": ["PROCESSOR # 5", "N3,iso3166999 X..27", 0, 1, null],
  "7036": ["PROCESSOR # 6", "N3,iso3166999 X..27", 0, 1, null],
  "7037": ["PROCESSOR # 7", "N3,iso3166999 X..27", 0, 1, null],
  "7038": ["PROCESSOR # 8", "N3,iso3166999 X..27", 0, 1, null],
  "7039": ["PROCESSOR # 9", "N3,iso3166999 X..27", 0, 1, null],
  "7040": ["UIC+EXT", "N1 X1 X1 X1,importeridx", 0, 0, null],
  "7041": ["UFRGT UNIT TYPE", "X..4,packagetype", 0, 0, null],
  "710": ["NHRN PZN", "X..20", 0, 1, null],
  "711": ["NHRN CIP", "X..20", 0, 1, null],
  "712": ["NHRN CN", "X..20", 0, 1, null],
  "713": ["NHRN DRN", "X..20", 0, 1, null],
  "714": ["NHRN AIM", "X..20", 0, 1, null],
  "715": ["NHRN NDC", "X..20", 0, 1, null],
  "716": ["NHRN AIC", "X..20", 0, 1, null],
  "717": ["NHRN SRN", "X..20", 0, 1, null],
  "7230": ["CERT # 1", "X2 X..28", 0, 1, null],
  "7231": ["CERT # 2", "X2 X..28", 0, 1, null],
  "7232": ["CERT # 3", "X2 X..28", 0, 1, null],
  "7233": ["CERT # 4", "X2 X..28", 0, 1, null],
  "7234": ["CERT # 5", "X2 X..28", 0, 1, null],
  "7235": ["CERT # 6", "X2 X..28", 0, 1, null],
  "7236": ["CERT # 7", "X2 X..28", 0, 1, null],
  "7237": ["CERT # 8", "X2 X..28", 0, 1, null],
  "7238": ["CERT # 9", "X2 X..28", 0, 1, null],
  "7239": ["CERT # 10", "X2 X..28", 0, 1, null],
  "7240": ["PROTOCOL", "X..20", 0, 1, null],
  "7241": ["AIDC MEDIA TYPE", "N2,mediatype", 0, 1, null],
  "7242": ["VCN", "X..25", 0, 1, null],
  "7250": ["DOB", "N8,yyyymmdd", 0, 1, null],
  "7251": ["DOB TIME", "N8,yyyymmdd N4,hhmi", 0, 1, null],
  "7252": ["BIO SEX", "N1,iso5218", 0, 1, null],
  "7253": ["FAMILY NAME", "X..40,pcenc", 0, 1, null],
  "7254": ["GIVEN NAME", "X..40,pcenc", 0, 1, null],
  "7255": ["SUFFIX", "X..10", 0, 1, null],
  "7256": ["FULL NAME", "X..90,pcenc", 0, 1, null],
  "7257": ["PERSON ADDR", "X..70,pcenc", 0, 1, null],
  "7258": ["BIRTH SEQUENCE", "X3,posinseqslash", 0, 1, null],
  "7259": ["BABY", "X..40,pcenc", 0, 1, null],
  "8001": ["DIMENSIONS", "N4,nonzero N5,nonzero N3,nonzero N1,winding N1", 0, 1, null],
  "8002": ["CMT No.", "X..20", 0, 1, null],
  "8003": ["GRAI", "N1,zero N13,csum,gcppos1 [X..16]", 0, 1, [[]]],
  "8004": ["GIAI", "X..30,gcppos1", 0, 1, [["7040"]]],
  "8005": ["PRICE PER UNIT", "N6", 0, 1, null],
  "8006": ["ITIP", "N14,csum,gcppos2 N4,pieceoftotal", 0, 1, [["22", "10", "21"]]],
  "8007": ["IBAN", "X..34,iban", 0, 1, null],
  "8008": ["PROD TIME", "N6,yymmdd N2,hh [N2],mi [N2],ss", 0, 1, null],
  "8009": ["OPTSEN", "X..50", 0, 1, null],
  "8010": ["CPID", "Y..30,gcppos1", 0, 1, [["8011"]]],
  "8011": ["CPID SERIAL", "N..12,nozeroprefix", 0, 0, null],
  "8012": ["VERSION", "X..20", 0, 1, null],
  "8013": ["GMN", "X..25,csumalpha,gcppos1", 0, 1, [[]]],
  "8014": ["MUDI", "X..25,csumalpha,gcppos1,hasnondigit", 0, 0, null],
  "8017": ["GSRN - PROVIDER", "N18,csum,gcppos1", 0, 1, [["8019"]]],
  "8018": ["GSRN - RECIPIENT", "N18,csum,gcppos1", 0, 1, [["8019"]]],
  "8019": ["SRIN", "N..10", 0, 0, null],
  "8020": ["REF No.", "X..25", 0, 0, null],
  "8026": ["ITIP CONTENT", "N14,csum,gcppos2 N4,pieceoftotal", 0, 1, null],
  "8030": ["DIGSIG", "Z..90", 0, 1, null],
  "8040": ["IMEI", "N15", 0, 0, null],
  "8041": ["IMEI2", "N15", 0, 0, null],
  "8042": ["ESIM", "N32", 0, 0, null],
  "8043": ["PSIM", "N18 [N..2]", 0, 0, null],
  "8110": ["", "X..70,couponcode", 0, 1, null],
  "8111": ["POINTS", "N4", 0, 1, null],
  "8112": ["", "X..70,couponposoffer", 0, 1, null],
  "8200": ["PRODUCT URL", "X..70", 0, 0, null],
  "90": ["INTERNAL", "X..30", 0, 1, null],
  "91": ["INTERNAL", "X..90", 0, 1, null],
  "92": ["INTERNAL", "X..90", 0, 1, null],
  "93": ["INTERNAL", "X..90", 0, 1, null],
  "94": ["INTERNAL", "X..90", 0, 1, null],
  "95": ["INTERNAL", "X..90", 0, 1, null],
  "96": ["INTERNAL", "X..90", 0, 1, null],
  "97": ["INTERNAL", "X..90", 0, 1, null],
  "98": ["INTERNAL", "X..90", 0, 1, null],
  "99": ["INTERNAL", "X..90", 0, 1, null]
};
const isKnownId = (id) => Object.prototype.hasOwnProperty.call(GS1_IDS, id);
const idTitle = (id) => (isKnownId(id) ? GS1_IDS[id][0] : '');
function idAt(text, pos) {
  for (const n of [2, 3, 4]) { const id = String(text).substr(pos, n); if (id.length === n && /^\d+$/.test(id) && isKnownId(id)) return id; }
  return '';
}
const SPEC_CACHE = new Map();
function components(id) {
  if (SPEC_CACHE.has(id)) return SPEC_CACHE.get(id);
  const out = String(GS1_IDS[id][1]).split(/\s+/).filter(Boolean).map((c) => {
    const opt = c.startsWith('[');
    const m = /^\[?([NXYZ])(\.\.)?(\d+)\]?(?:,(.*))?$/.exec(c);
    return { type: m[1], min: m[2] ? 1 : +m[3], max: +m[3], opt, lint: m[4] ? m[4].split(',') : [] };
  });
  SPEC_CACHE.set(id, out); return out;
}
function fixedLength(id) {
  if (!isKnownId(id) || !GS1_IDS[id][2]) return 0;
  return components(id).reduce((n, c) => n + (c.opt ? 0 : c.max), 0);
}
function checkDigit(d) {
  if (!/^\d+$/.test(String(d))) return -1;
  let s = 0; const a = String(d).split('').reverse();
  a.forEach((c, i) => { s += +c * (i % 2 === 0 ? 3 : 1); });
  return (10 - (s % 10)) % 10;
}
function gs1Date(v, dayZero) {
  if (!/^\d{6}$/.test(v)) return '';
  const yy = +v.slice(0, 2), mm = +v.slice(2, 4), dd = +v.slice(4, 6);
  if (mm < 1 || mm > 12) return '';
  const cy = new Date().getFullYear(); const diff = yy - (cy % 100); let cent = Math.floor(cy / 100) * 100;
  if (diff >= 51) cent -= 100; else if (diff <= -50) cent += 100;
  const y = cent + yy; const last = new Date(Date.UTC(y, mm, 0)).getUTCDate();
  if (dd === 0 && !dayZero) return '';
  const d = dd === 0 ? last : dd; if (d > last) return '';
  return y + '-' + String(mm).padStart(2, '0') + '-' + String(d).padStart(2, '0');
}
const CSET = { N: /^[0-9]*$/, X: /^[A-Za-z0-9!"%&'()*+,\-./:;<=>?_]*$/, Y: /^[A-Z0-9#\-/]*$/, Z: /^[A-Za-z0-9_\-]*=*$/ };
const LINT = {
  csum: (v) => checkDigit(v.slice(0, -1)) === +v.slice(-1) || 'check digit is wrong',
  yymmd0: (v) => !!gs1Date(v, true) || 'is not a valid date',
  yymmdd: (v) => !!gs1Date(v, false) || 'is not a valid date',
  hhmi: (v) => (/^\d{4}$/.test(v) && +v.slice(0, 2) < 24 && +v.slice(2) < 60) || 'is not a valid time',
  hh: (v) => +v < 24 || 'is not a valid hour',
  mi: (v) => +v < 60 || 'is not a valid minute',
  ss: (v) => +v < 60 || 'is not a valid second',
  yesno: (v) => v === '0' || v === '1' || 'must be 0 or 1',
};
function checkValue(id, value) {
  if (!isKnownId(id)) return 'unknown Application Identifier (' + id + ')';
  const v = String(value == null ? '' : value); const comps = components(id); let p = 0;
  const total = comps.reduce((n, c) => n + c.max, 0);
  if (v.length > total) return '(' + id + ') is longer than ' + total + ' characters';
  for (let i = 0; i < comps.length; i++) {
    const c = comps[i];
    if (p >= v.length) { if (c.opt) break; return comps.every((x) => x.type === 'N') && comps.length === 1 && c.min === c.max ? '(' + id + ') needs ' + c.max + ' digits' : '(' + id + ') is too short'; }
    const rest = v.length - p;
    const take = c.min === c.max ? c.max : Math.min(c.max, rest);
    if (rest < c.min) return comps.length === 1 && c.type === 'N' && c.min === c.max ? '(' + id + ') needs ' + c.max + ' digits' : '(' + id + ') is too short';
    const part = v.substr(p, take); p += take;
    if (!CSET[c.type].test(part)) return c.type === 'N' ? (comps.length === 1 && c.min === c.max ? '(' + id + ') needs ' + c.max + ' digits' : '(' + id + ') needs digits only') : '(' + id + ') contains characters outside the GS1 set';
    for (const l of c.lint) { const f = LINT[l]; if (f) { const r = f(part); if (r !== true) return '(' + id + ') ' + r; } }
  }
  if (p < v.length) return '(' + id + ') is longer than ' + total + ' characters';
  if (v.length === 0) return '(' + id + ') is empty';
  return '';
}

// ---- element strings, decoding, Digital Link conversion and reports, checked against the full GS1 identifier table above.
const isObj = (v) => v !== null && typeof v === 'object';
const DECIMAL_IDS = /^(3[1-6]\d\d|390\d|392\d|394\d|395\d|7007)$/;

// Display value of one element: dates as YYYY-MM-DD (with time when the format has one), implied decimals, currency amounts.
function decodeValue(id, value) {
  const v = String(value == null ? '' : value); id = String(id == null ? '' : id);
  if (!isKnownId(id)) return v;
  const comps = components(id);
  const first = comps[0];
  if (first && first.type === 'N' && first.max === 6 && (first.lint.includes('yymmd0') || first.lint.includes('yymmdd'))) {
    const d = gs1Date(v.slice(0, 6), first.lint.includes('yymmd0'));
    if (!d) return '';
    let rest = v.slice(6), out = d;
    for (let i = 1; i < comps.length && rest; i++) {
      const c = comps[i];
      if (c.lint.includes('hhmi')) { out += ' ' + rest.slice(0, 2) + ':' + rest.slice(2, 4); rest = rest.slice(4); }
      else if (c.lint.includes('hh')) { out += ' ' + rest.slice(0, 2); rest = rest.slice(2); }
      else if (c.lint.includes('mi') || c.lint.includes('ss')) { out += ':' + rest.slice(0, 2); rest = rest.slice(2); }
      else if (c.lint.includes('yymmdd') || c.lint.includes('yymmd0')) { const d2 = gs1Date(rest.slice(0, 6), c.lint.includes('yymmd0')); if (!d2) return ''; out += ' to ' + d2; rest = rest.slice(6); }
      else break;
    }
    return out;
  }
  if (/^(391\d|393\d)$/.test(id) && /^\d{4,}$/.test(v)) return v.slice(0, 3) + ' ' + withDecimals(v.slice(3), +id[3]);
  if (/^(3[1-6]\d\d|390\d|392\d|394\d|395\d)$/.test(id) && /^\d+$/.test(v)) return withDecimals(v, +id[3]);
  return v;
}
function withDecimals(digits, n) {
  const s = digits.padStart(n + 1, '0'); const ip = s.slice(0, s.length - n).replace(/^0+(?=\d)/, '');
  return n ? ip + '.' + s.slice(s.length - n) : ip;
}

function split(text) {
  const s = String(text == null ? '' : text).trim();
  if (!s) return { form: 'unknown', els: [], err: 'no element string found' };
  if (/^https?:\/\//i.test(s)) {
    let u; try { u = new URL(s); } catch (e) { return { form: 'digital link', els: [], err: 'not a valid web address' }; }
    let seg; try { seg = u.pathname.split('/').filter(Boolean).map(decodeURIComponent); } catch (e) { return { form: 'digital link', els: [], err: 'not a valid web address' }; }
    const i = seg.findIndex((x, k) => isKnownId(x) && GS1_IDS[x][4] !== null && k + 1 < seg.length);
    const els = [];
    if (i >= 0) for (let k = i; k + 1 < seg.length; k += 2) {
      let value = seg[k + 1];
      if (seg[k] === '01' && /^(\d{8}|\d{12}|\d{13})$/.test(value)) value = value.padStart(14, '0');
      els.push({ id: seg[k], value });
    }
    for (const [k, v] of u.searchParams) if (/^\d{2,4}$/.test(k)) els.push({ id: k, value: v });
    return { form: 'digital link', els, err: els.length ? '' : 'no element string found' };
  }
  if (s[0] === '(') {
    const els = []; const re = /\((\d{2,4})\)/g; const marks = []; let m;
    while ((m = re.exec(s))) marks.push({ id: m[1], start: m.index, end: re.lastIndex });
    if (!marks.length || marks[0].start !== 0) return { form: 'bracketed', els, err: 'no element string found' };
    marks.forEach((mk, i) => els.push({ id: mk.id, value: s.slice(mk.end, i + 1 < marks.length ? marks[i + 1].start : s.length) }));
    return { form: 'bracketed', els, err: '' };
  }
  const r = s.replace(/^\](C1|e0|d2|Q3|J1)/, '').replace(/<GS>/g, '\u001d'); const els = []; let p = 0;
  while (p < r.length) {
    if (r[p] === '\u001d') { p++; continue; }
    const id = idAt(r, p);
    if (!id) return { form: 'raw', els, err: 'unknown Application Identifier at character ' + (p + 1) };
    p += id.length; const fl = fixedLength(id); let v;
    if (fl) { v = r.substr(p, fl); p += fl; } else { const e = r.indexOf('\u001d', p); v = r.slice(p, e < 0 ? r.length : e); p = e < 0 ? r.length : e + 1; }
    els.push({ id, value: v });
  }
  return { form: 'raw', els, err: els.length ? '' : 'no element string found' };
}

function parseElementString(text) {
  const sp = split(text); let err = sp.err;
  if (!err) for (const e of sp.els) { const x = checkValue(e.id, e.value); if (x) { err = x; break; } }
  return { ok: !err, form: sp.form, elements: sp.els, error: err };
}

// GS1 Digital Link URI on https://id.gs1.org. Returns { link, leftOut } (leftOut = identifiers a Digital Link cannot carry).
function linkParts(elements) {
  const els = (Array.isArray(elements) ? elements : []).filter((e) => isObj(e) && isKnownId(String(e.id)));
  const pk = els.find((e) => GS1_IDS[e.id][4] !== null);
  if (!pk) return { link: '', leftOut: [] };
  const used = new Set([pk]); let path = '/' + pk.id + '/' + encodeURIComponent(String(pk.value));
  const seqs = GS1_IDS[pk.id][4] || [];
  const seq = seqs.find((q) => q.some((x) => els.some((e) => e.id === x))) || [];
  for (const q of seq) { const e = els.find((x) => x.id === q && !used.has(x)); if (e) { used.add(e); path += '/' + q + '/' + encodeURIComponent(String(e.value)); } }
  const qs = [], leftOut = [];
  for (const e of els) { if (used.has(e)) continue; if (GS1_IDS[e.id][3]) qs.push(e.id + '=' + encodeURIComponent(String(e.value))); else leftOut.push(e.id); }
  return { link: 'https://id.gs1.org' + path + (qs.length ? '?' + qs.join('&') : ''), leftOut };
}
function toDigitalLink(elements) { return linkParts(elements).link; }

const esc = (s) => String(s).replace(/[\r\n]+/g, ' ').replace(/([\\`*_{}\[\]()#+!|<>~&$])/g, '\\$1')
  .split('://').join('\\:\\/\\/').replace(/(^|[^A-Za-z0-9])www\./gi, (m, pre) => pre + m.slice(pre.length, pre.length + 3) + '\\.');
const cell = (s) => { s = String(s == null ? '' : s); return s === '' ? '-' : esc(s); };
const pl = (n, w) => n + ' ' + w + (n === 1 ? '' : 's');
function lines(text) {
  return String(text == null ? '' : text).replace(/^﻿/, '').split('\n').map((l, i) => ({ n: i + 1, t: l.replace(/\r$/, '').trim() })).filter((x) => x.t)
    .map((x) => (/^(\d{8}|\d{12}|\d{13}|\d{14}|\d{18})$/.test(x.t) ? Object.assign(x, { bare: true }) : Object.assign(x, { p: parseElementString(x.t) })));
}
const head = (t, ls) => (ls.length ? null : '# ' + t + '\n\nThe file contains no codes.');
const brk = (els) => els.map((e) => '(' + e.id + ')' + e.value).join('');

function reportValidation(text) {
  const ls = lines(text); const h = head('Element String Check', ls); if (h) return h;
  const es = ls.filter((x) => !x.bare), b = ls.length - es.length, v = es.filter((x) => x.p.ok).length;
  let md = '# Element String Check\n\n' + pl(es.length, 'element string') + ', ' + v + ' valid, ' + (es.length - v) + ' with errors.' + (b ? '\n\n' + pl(b, 'bare code') + ' (see Show Check Digits).' : '');
  if (es.length) md += '\n\n| Line | Form | Elements | Status |\n| ---: | --- | ---: | --- |\n' + es.map((x) => '| ' + x.n + ' | ' + x.p.form + ' | ' + x.p.elements.length + ' | ' + cell(x.p.ok ? 'valid' : x.p.error) + ' |').join('\n');
  return md;
}
const valid = (ls) => ls.filter((x) => !x.bare && x.p.ok);
function reportDecoded(text) {
  const ls = lines(text); const h = head('Decoded Elements', ls); if (h) return h; const v = valid(ls);
  if (!v.length) return '# Decoded Elements\n\nNo valid element strings.';
  return '# Decoded Elements\n\n| Line | Identifier | Title | Value |\n| ---: | --- | --- | --- |\n' +
    v.map((x) => x.p.elements.map((e) => '| ' + x.n + ' | (' + e.id + ') | ' + cell(idTitle(e.id)) + ' | ' + cell(decodeValue(e.id, e.value)) + ' |').join('\n')).join('\n');
}
function reportCheckDigits(text) {
  const ls = lines(text); const h = head('Check Digits', ls); if (h) return h; const b = ls.filter((x) => x.bare);
  if (!b.length) return '# Check Digits\n\nNo bare codes in this file.'; let ok = 0;
  const rows = b.map((x) => { const exp = checkDigit(x.t.slice(0, -1)), got = +x.t.slice(-1); if (exp === got) ok++;
    const ty = x.t.length === 18 ? 'SSCC' : 'GTIN-' + x.t.length; return '| ' + x.n + ' | ' + x.t + ' | ' + ty + ' | ' + got + ' | ' + (exp === got ? 'valid' : 'wrong check digit (expected ' + exp + ')') + ' |'; });
  return '# Check Digits\n\n| Line | Code | Type | Check digit | Status |\n| ---: | --- | --- | ---: | --- |\n' + rows.join('\n') + '\n\n' + ok + ' of ' + pl(b.length, 'bare code') + ' valid.';
}
function reportDigitalLink(text) {
  const ls = lines(text); const h = head('Digital Link Conversion', ls); if (h) return h; const v = valid(ls);
  if (!v.length) return '# Digital Link Conversion\n\nNo valid element strings.';
  return '# Digital Link Conversion\n\n| Line | Element string | Digital Link |\n| ---: | --- | --- |\n' + v.map((x) => {
    let linkCell;
    if (x.p.form === 'digital link') linkCell = cell(x.t);
    else { const lp = linkParts(x.p.elements); linkCell = lp.link ? cell(lp.link) + (lp.leftOut.length ? ' \\(left out, not allowed in a Digital Link: ' + lp.leftOut.map((i) => '\\(' + i + '\\)').join(', ') + '\\)' : '') : 'no primary key'; }
    return '| ' + x.n + ' | ' + cell(brk(x.p.elements)) + ' | ' + linkCell + ' |'; }).join('\n');
}
function reportSerials(text) {
  const ls = lines(text); const h = head('GTIN and Serial Inventory', ls); if (h) return h;
  const v = valid(ls).filter((x) => x.p.elements.some((e) => e.id === '01'));
  if (!v.length) return '# GTIN and Serial Inventory\n\nNo valid element strings with a GTIN.';
  const g = new Map(), pairs = new Map();
  v.forEach((x) => { const get = (a) => (x.p.elements.find((e) => e.id === a) || {}).value; const gt = get('01');
    if (!g.has(gt)) g.set(gt, { n: 0, lots: new Set(), sers: new Set() }); const r = g.get(gt); r.n++;
    if (get('10')) r.lots.add(get('10'));
    if (get('21')) { r.sers.add(get('21')); const k = gt + '\u0000' + get('21'); if (!pairs.has(k)) pairs.set(k, []); pairs.get(k).push(x.n); } });
  const dup = [...pairs.entries()].filter(([, l]) => l.length >= 2);
  return '# GTIN and Serial Inventory\n\n| GTIN | Lines | Lots | Serials |\n| --- | ---: | ---: | ---: |\n' + [...g.keys()].sort().map((k) => '| ' + k + ' | ' + g.get(k).n + ' | ' + g.get(k).lots.size + ' | ' + g.get(k).sers.size + ' |').join('\n') +
    '\n\n## Duplicate serials\n\n' + (dup.length ? '| GTIN | Serial | Lines |\n| --- | --- | --- |\n' + dup.map(([k, l]) => { const [a, b] = k.split('\u0000'); return '| ' + a + ' | ' + cell(b) + ' | ' + l.join(', ') + ' |'; }).join('\n') : 'No duplicate serials.');
}
module.exports = { checkDigit, decodeValue, parseElementString, toDigitalLink, reportValidation, reportDecoded, reportCheckDigits, reportDigitalLink, reportSerials };

// Caps every Markdown table of a report at 500 rows and says how many there were (a 50 MB file would otherwise give a report
// too large to open). Applied to every exported report.
function capTables(md) {
  if (typeof md !== 'string') return md;
  const lines = md.split('\n'), out = [];
  for (let i = 0; i < lines.length; i++) {
    out.push(lines[i]);
    if (lines[i].startsWith('|') && /^\|[ :-]+\|/.test(lines[i + 1] || '')) {
      out.push(lines[++i]);
      let n = 0;
      while (i + 1 < lines.length && lines[i + 1].startsWith('|')) { i++; n++; if (n <= 500) out.push(lines[i]); }
      if (n > 500) { out.push(''); out.push('Showing the first 500 of ' + n + ' rows.'); }
    }
  }
  return out.join('\n');
}
for (const k of Object.keys(module.exports)) {
  if (k.startsWith('report')) { const f = module.exports[k]; module.exports[k] = function (text) { return capTables(f(text)); }; }
}
