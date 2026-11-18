# Reports

Every report reads the text of the active editor and opens its result as a new Markdown document. Your file is never changed and nothing is sent anywhere. The examples below come from the sample file (Open Sample File).

## Show Element String Check

Command: **GTIN Code Atlas: Show Element String Check**

Reads every line that is not a bare code as an element string (bracketed, raw scanner data or Digital Link), splits it into elements with the GS1 identifier table, and checks every value for format, length, character set, mod-10 check digit and date. Lists each string with its form, its number of elements and 'valid' or the first problem found, and counts the bare codes.

Example (sample file):

> # Element String Check
>
> 7 element strings, 6 valid, 1 with errors.
>
> 3 bare codes (see Show Check Digits).
>
> | Line | Form | Elements | Status |
> | ---: | --- | ---: | --- |
> | 1 | bracketed | 4 | valid |
> | 2 | bracketed | 4 | valid |
> | 3 | raw | 4 | valid |
> | 4 | bracketed | 4 | valid |
> | 5 | bracketed | 2 | \(01\) check digit is wrong |
> | 6 | digital link | 3 | valid |
> | 7 | bracketed | 3 | valid |

## Show Decoded Elements

Command: **GTIN Code Atlas: Show Decoded Elements**

Lists every element of every valid element string with its identifier in brackets, its GS1 title and its value in plain form: dates as YYYY-MM-DD (day 00 is the last day of the month), date and time values with their time, weights, measures and prices with their implied decimals, and currency amounts with their currency code.

Example (sample file):

> # Decoded Elements
>
> | Line | Identifier | Title | Value |
> | ---: | --- | --- | --- |
> | 1 | (01) | GTIN | 09506000134352 |
> | 1 | (17) | USE BY or EXPIRY | 2027-12-31 |
> | 1 | (10) | BATCH/LOT | LOT-2207 |
> | 1 | (21) | SERIAL | SN0001 |
> | 2 | (01) | GTIN | 09506000134352 |
> | 2 | (17) | USE BY or EXPIRY | 2027-12-31 |
> | 2 | (10) | BATCH/LOT | LOT-2207 |
> | 2 | (21) | SERIAL | SN0002 |
> | 3 | (01) | GTIN | 09506000134352 |
> | 3 | (17) | USE BY or EXPIRY | 2027-12-31 |
> | 3 | (10) | BATCH/LOT | LOT-2208 |
> | 3 | (21) | SERIAL | SN0001 |
> | 4 | (00) | SSCC | 106141411234567897 |
> | 4 | (02) | CONTENT | 09506000134352 |
> | 4 | (37) | COUNT | 24 |
> | 4 | (400) | ORDER NUMBER | PO-10023 |
> | 6 | (01) | GTIN | 09506000134352 |
> | 6 | (10) | BATCH/LOT | LOT-2207 |
> | 6 | (17) | USE BY or EXPIRY | 2027-12-31 |
> | 7 | (01) | GTIN | 09506000134352 |

## Show Check Digits

Command: **GTIN Code Atlas: Show Check Digits**

Checks every line of 8, 12, 13, 14 or 18 digits as a GTIN-8, GTIN-12, GTIN-13, GTIN-14 or SSCC: shows the check digit it has and, when it is wrong, the one the GS1 mod-10 rule expects.

Example (sample file):

> # Check Digits
>
> | Line | Code | Type | Check digit | Status |
> | ---: | --- | --- | ---: | --- |
> | 8 | 4006381333931 | GTIN-13 | 1 | valid |
> | 9 | 4006381333932 | GTIN-13 | 2 | wrong check digit (expected 1) |
> | 10 | 96385074 | GTIN-8 | 4 | valid |
>
> 2 of 3 bare codes valid.

## Show Digital Link Conversion (Pro)

Command: **GTIN Code Atlas: Show Digital Link Conversion** (Pro; part of the 14-day trial)

Builds the GS1 Digital Link for each valid element string on https://id.gs1.org: the first primary key (such as GTIN or SSCC) in the path, its qualifiers (such as lot and serial) in GS1 order, and the other elements as query parameters. Elements that a Digital Link cannot carry are named. Lines that already are Digital Links are shown with their elements.

Example (sample file):

> # Digital Link Conversion
>
> | Line | Element string | Digital Link |
> | ---: | --- | --- |
> | 1 | \(01\)09506000134352\(17\)271231\(10\)LOT-2207\(21\)SN0001 | https\:\/\/id.gs1.org/01/09506000134352/10/LOT-2207/21/SN0001?17=271231 |
> | 2 | \(01\)09506000134352\(17\)271231\(10\)LOT-2207\(21\)SN0002 | https\:\/\/id.gs1.org/01/09506000134352/10/LOT-2207/21/SN0002?17=271231 |
> | 3 | \(01\)09506000134352\(17\)271231\(10\)LOT-2208\(21\)SN0001 | https\:\/\/id.gs1.org/01/09506000134352/10/LOT-2208/21/SN0001?17=271231 |
> | 4 | \(00\)106141411234567897\(02\)09506000134352\(37\)24\(400\)PO-10023 | https\:\/\/id.gs1.org/00/106141411234567897?02=09506000134352\&37=24\&400=PO-10023 |
> | 6 | \(01\)09506000134352\(10\)LOT-2207\(17\)271231 | https\:\/\/id.gs1.org/01/09506000134352/10/LOT-2207?17=271231 |
> | 7 | \(01\)09506000134352\(3103\)001250\(91\)BIN-4 | https\:\/\/id.gs1.org/01/09506000134352?3103=001250\&91=BIN-4 |

## Show GTIN And Serial Inventory (Pro)

Command: **GTIN Code Atlas: Show GTIN And Serial Inventory** (Pro; part of the 14-day trial)

Counts, for every GTIN in the valid element strings, how many lines carry it and how many different lots and serial numbers they have, and lists every GTIN and serial number pair that appears on more than one line, with the line numbers, a common sign of a scanning or labelling error.

Example (sample file):

> # GTIN and Serial Inventory
>
> | GTIN | Lines | Lots | Serials |
> | --- | ---: | ---: | ---: |
> | 09506000134352 | 5 | 2 | 2 |
>
> ## Duplicate serials
>
> | GTIN | Serial | Lines |
> | --- | --- | --- |
> | 09506000134352 | SN0001 | 1, 3 |
