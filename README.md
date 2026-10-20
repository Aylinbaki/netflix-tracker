# Netflix Tracker

A modern, automated Flask web application and Chrome extension to locally track, categorize, and rate your Netflix watch history. 

An optional Chrome extension automatically logs a record to your database when Netflix video playback reaches 88%.

## Features

- **Automated Tracking:** Chrome extension automatically records watched shows/movies at 88% playback.
- **Glassmorphism UI:** Modern dark mode interface built with Tailwind CSS and Font Awesome icons.
- **Stats Summary Dashboard:** Real-time counters for unique titles tracked, total episodes watched, and last activity date.
- **Smart Categorization:** Automatically distinguishes between TV Series and Movies (using runtime thresholds $\ge 90$ mins or season/episode data).
- **Interactive Rating:** Rate any watched content directly from the UI on a 1–5 star scale.
- **Manual Management:** Delete any record directly from the web interface.
- **SQLite Database:** Zero-config local persistence (`netflix_tracker.db`).

## Project structure

```
netflix-tracker/
├── app.py
├── requirements.txt
├── templates/index.html
├── extension/
│   ├── manifest.json
│   └── content.js
├── .gitignore
└── .env                 # Local environment file (TMDB API key, etc.)
```

## Setup

1-Clone the repository
```bash
git clone [https://github.com/Aylinbaki/netflix-tracker.git](https://github.com/Aylinbaki/netflix-tracker.git)
cd netflix-tracker
```
2-Create and activate a virtual environment:
```bash
python3 -m venv .venv
source .venv/bin/activate
```
3-Install dependencies:
```bash
pip install -r requirements.txt
```
4-Environment Variables:
Create a `.env` file in the project root:
```bash
TMDB_API_KEY=your_tmdb_api_key_here
```
5-Run the Flask server:
```bash
python app.py
```

UI: [http://127.0.0.1:5000](http://127.0.0.1:5000)

## API
### `GET /api/titles`
### `POST /api/add`
### `POST /api/rate/<id>`
### `DELETE /api/delete/<id>`

Example (POST/api/add):

```json
{
  "title": "Dark",
  "status": "completed",
  "season": 1,
  "episode": 8,
  "notes": "S1:E8 Episode 8"
}
```

Lists saved titles.

## Chrome extension

1. Make sure Flask is running at `http://127.0.0.1:5000`.
2. Open `chrome://extensions` in Chrome.
3. Enable Developer mode.
4. Choose **Load unpacked** and select the `extension` folder.
5. Stream any show or movie on Netflix. Once playback reaches 88%, the extension automatically posts the log to `/api/add` .

The extension uses the player `video` element and the `data-uia="video-title"` node. If Netflix changes its UI, the selectors may need an update.

## Security

`.gitignore` excludes virtual environments `(.venv)`, SQLite database files `(*.db)`, `.env`, and temporary system files.
Do not commit real API keys or personal database entries to public repositories.
