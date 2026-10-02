# Ramsgate iPhone reminders

Status: prepared, not installed or sending. Uses your phone's Messages app and existing plan. No Twilio account is needed. Phone numbers stay on your iPhone.

Default schedule: Monday at 6 p.m. in the iPhone's local timezone. This checks once weekly, rather than sending daily. Only explicit `no` payment statuses with known bill amounts qualify. Missing amounts, unknown payment statuses, Alex's zero first-month share, and the fully paid security deposit do not trigger messages. Shares use the same August 17 move-in proration as the dashboard. Billing period end dates are excluded.

## 1. Publish the read-only reminder feed

1. Open the Ramsgate Google Sheet. Select **Extensions → Apps Script**.
2. Replace the default contents of `Code.gs` with the supplied `Code.gs` in this folder. Save as **Ramsgate Reminders**.
3. Select **Deploy → New deployment → Web app**.
4. Choose **Execute as: Me**, and **Who has access: Anyone**, then deploy and complete Google's authorization prompt for this script. This script needs permission to fetch public web data; it neither edits spreadsheets nor sends texts or emails. The endpoint exposes only utility balances already derived from your public Sheet.
5. Copy the deployed **Web app URL** ending in `/exec`. Open it to verify JSON with `status: "ok"`. Do not use the `/dev` URL. If there are no unpaid bills, Jason and Alex should each have `send: "no"`.

## 2. Create the iPhone Shortcut

Action names/settings can vary with iOS. In **Shortcuts**, make a new shortcut called **Ramsgate Reminders**.

1. Add **URL**. Paste the deployed `/exec` URL.
2. Add **Get Contents of URL** with method **GET**.
3. Add **Get Dictionary from Input**, using the previous response.
4. Add **Set Variable**, naming the dictionary **ReminderData**.
5. Add **Get Dictionary Value** for key `status` from **ReminderData**.
6. Add **If** the result **is** `ok`. Put all remaining actions inside this If. If it fails or the status isn't `ok`, send nothing.
7. Add **Get Dictionary Value** for key `Jason` from **ReminderData**; set it as variable **JasonData**.
8. Get key `send` from **JasonData**. Add **If** it **is** `yes`.
9. Inside that If, get key `message` from **JasonData**. Add **Send Message**, with that message as the text. Select **Jason McIlwrath's correct contact** on your iPhone. Do not select a group conversation. During initial testing, keep **Show When Run** enabled, if available, so you can inspect before sending.
10. After Jason's End If, repeat steps 7–9 for `Alex`, variable **AlexData**, and **Alex Meehan's correct contact**.
11. End the outer status If. Do not add Send Message actions outside these conditions.

## 3. Test before scheduling

- With all recorded bills paid, run the Shortcut. It should send nothing.
- To test the sending actions, use a **duplicate Shortcut** with a Text action containing sample JSON, pointed at **your own contact** instead of Jason or Alex. Example:

```json
{"status":"ok","Jason":{"send":"yes","message":"Ramsgate TEST only: sample outstanding WiFi share $20.00"},"Alex":{"send":"no","message":""}}
```

- In that disposable copy, parse the Text as the dictionary instead of fetching the live URL. Verify only the Jason branch runs and that you can receive the sample text yourself.
- Delete the test copy. In the real Shortcut, verify the live URL, the actual recipients, and both conditional branches. With the roommates' agreement, test a real reminder when a genuinely unpaid bill exists.
- To send without the compose window, turn off **Show When Run** on both Send Message actions if your iOS exposes that setting. Test once while locked. If the phone requires confirmation, leave the automation as a tap-to-send reminder rather than assuming unattended sending works.

## 4. Enable the weekly automation on your iPhone

In **Shortcuts → Automation**, create a **Time of Day** automation for **6:00 p.m.**, **Weekly**, **Monday**. Choose **Run Immediately** where available, then **Run Shortcut → Ramsgate Reminders**. Disable **Notify When Run** if offered and desired. Newer iOS versions may expose automation/locked-running controls inside the Shortcut's settings instead. Keep the phone's timezone correct.

This is not a background server: your iPhone must have power and internet access. Messages use your usual SMS/iMessage service. Replies come to your normal conversations. The schedule checks once weekly; manually running it again can send another reminder for the same unpaid balance. There is no separate sent-message history or deduplication service.

To stop reminders, disable the automation. To stop a specific bill reminder, mark that person's bill `yes` in the Sheet after payment. Changes to Code.gs require a new version of the existing web-app deployment.
