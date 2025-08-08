## Google Calendar Availability Bookmarklet

Reads your Google Calendar and outputs your availability (free time) in plain text. Perfect for quickly pasting availabilities into an email or chat.

### What it does
- **Finds free slots**: Looks at the current Google Calendar Week/5‑day view and treats visible and accepted events as “busy” time, returning the gaps as your availability.
- **Simple copy**: One click to copy a nicely formatted, plain‑text list of time ranges.
- **Quick settings**: Configure earliest/latest time, minimum free block length, and buffer around events.
- **Private**: Runs entirely in your browser; no data is sent anywhere.

### Setup (create the bookmarklet)
1. Open the `code.js` file in this repo and copy its entire contents (it starts with `javascript:`).
2. Create a new bookmark in your browser:
   - **Name**: Google Calendar Availability (or whatever you like)
   - **URL/Location**: Paste the code you copied from `code.js`
3. Save the bookmark. To update later, just re‑copy the latest `code.js` into the bookmark’s URL.

### Usage
1. Open Google Calendar and switch to the Week (or 5‑day) view.
2. Toggle on the calendars you want included. Whatever events are visible and accepted are considered “busy”.
3. Click the bookmarklet in your bookmarks bar.
4. Adjust settings if desired (earliest/latest, minimum block, buffer), then click OK.
5. Use the Copy button to paste your availability anywhere.

Notes:
- The script prioritizes clearly “busy” time. It includes accepted events and Out‑of‑office; invites that are declined/tentative/unspecified are excluded.
- The panel adapts to your Calendar theme and can be collapsed or closed.

### Credits
This script was created by modifying the "Get Google Calendar Availability" bookmarklet by Kellen Vu, published at [kellenvu.github.io — Bookmarklets](https://kellenvu.github.io/projects/3000-bookmarklets#get-google-calendar-availability).

### License
This project is available under the **MIT License**. See `LICENSE` for details. Use it freely, including in commercial contexts.
