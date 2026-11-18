# Show Element String Check

Reads every line that is not a bare code as an element string (bracketed, raw scanner data or Digital Link), splits it into elements with the GS1 identifier table, and checks every value for format, length, character set, mod-10 check digit and date. Lists each string with its form, its number of elements and 'valid' or the first problem found, and counts the bare codes.

The report opens as a new Markdown document next to your file. Your file is never changed.
