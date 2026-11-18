# Troubleshooting

## The report says the file is not valid

Each line is read on its own. Lines of 8, 12, 13, 14 or 18 digits are bare codes (checked in Show Check Digits); other lines are element strings: bracketed '(01)…', raw scanner data (an optional ]C1, ]e0, ]d2, ]Q3 or ]J1 prefix, separators written as <GS> or the group separator character), or a web address with a GS1 Digital Link path. An identifier that is not in the GS1 table stops the reading of a raw string, and the report says at which character.

## The file is too large

Reports read files up to the size set in `gtinCodeAtlas.maxFileSizeMB` (50 MB by default and at most). VS Code passes files only up to 50 MB to extensions, so a larger file cannot be read by any extension: split it, or save a shorter one.

## The preview does not open

The report always opens as a Markdown document. If the preview stays closed, set `gtinCodeAtlas.openReportsAsPreview` to true and check that the built-in Markdown extension is enabled.

## Pro or the trial does not unlock

Run **GTIN Code Atlas: Show Licence Status**. It tells whether a key is stored, whether it was checked, and how many trial days are left. Details are in [licence.md](licence.md).

## Something else

Run **GTIN Code Atlas: Report A Problem**. It copies a diagnostics block (versions, settings, licence state; no file contents) and opens the issues page.
