# Ramsgate Utilities

A colorful utility dashboard for Camden, Jason, and Alex. Includes Home, Rent, Electric, Gas, and WiFi pages.

## Hosting

Static site with no dependencies or build step. Compatible with GitHub Pages: Settings → Pages → Deploy from a branch → main → / (root).

## Data

`data.json` contains the Google Sheet snapshot read on October 2, 2026. This version does not automatically sync with Google Sheets. Replace the snapshot to refresh the records.

Amounts are assumed to be split equally three ways. Paid totals derive from yes/no status cells, rather than bank or Venmo verification. Missing bill amounts remain pending. Share calculations retain fractional cents until display; individual displayed values may differ by a cent from the household total.

Billing-cycle dates are displayed separately from bank withdrawal dates, which are not supplied in the source Sheet.

## Local preview

Run `python -m http.server 8080` in this directory.
