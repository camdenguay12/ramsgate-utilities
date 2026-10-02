# Ramsgate Utilities

A colorful utility dashboard for Camden, Jason, and Alex. Includes Home, Rent, Electric, Gas, and WiFi pages.

## Hosting

Static site with no dependencies or build step. Compatible with GitHub Pages: Settings → Pages → Deploy from a branch → main → / (root).

## Data

`data.json` contains the Google Sheet snapshot read on October 2, 2026. The website reads all four tabs directly from Google Sheets on page load and every 60 seconds while visible. The Sheet must allow Anyone with the link → Viewer. If the live read fails, the dashboard retains the last successful data or this snapshot and clearly reports that status. ChatGPT connector authorization does not transfer to the public website. The entire live workbook will be readable to anyone with its link; no sharing permissions are changed by this code.

July rent is split 50/50 between Camden and Jason; rent from August 17 onward is split three ways. Other bills are prorated by days around August 17, with billing-period end dates exclusive. Before that date Camden and Jason split equally. The $3,000 security deposit is split three ways and displayed separately. All three $1,000 deposit shares are confirmed paid by Camden. The deposit is a one-time refundable amount, held separately from utility costs; no refund is recorded. Paid totals derive from yes/no status cells, rather than bank or Venmo verification. Missing bill amounts remain pending. Share calculations retain fractional cents until display; individual displayed values may differ by a cent from the household total.

Billing-cycle dates are displayed separately from bank withdrawal dates, which are not supplied in the source Sheet.

## Local preview

Run `python -m http.server 8080` in this directory.
