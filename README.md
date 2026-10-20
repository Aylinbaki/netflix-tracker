# Netflix Tracker

A Flask app that keeps your movie and TV watch list locally. An optional Chrome extension can add a record automatically when Netflix playback reaches 88%.

## Features

- Add and list titles in a Tailwind CSS UI
- SQLite database (`netflix_tracker.db`)
- `POST /api/add` and `GET /api/titles` endpoints
- Manifest v3 Chrome extension (`https://www.netflix.com/*`)
- TMDB API key loaded from `.env` (`TMDB_API_KEY`)

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
└── .env                 # local only, not committed
```

## Setup

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

Create a `.env` file in the project root:

```
TMDB_API_KEY=your_key_here
```

Start the server:

```bash
python app.py
```

UI: [http://127.0.0.1:5000](http://127.0.0.1:5000)

## API

### `POST /api/add`

JSON body:

| Field     | Required | Description                              |
|-----------|----------|------------------------------------------|
| `title`   | yes      | Movie / show name                        |
| `status`  | no       | `watchlist`, `watching`, or `completed`  |
| `rating`  | no       | 1–10                                     |
| `notes`   | no       | free text                                |
| `season`  | no       | season number                            |
| `episode` | no       | episode number                           |

Example:

```bash
curl -X POST http://127.0.0.1:5000/api/add \
  -H "Content-Type: application/json" \
  -d '{"title":"Dark","status":"completed","season":1,"episode":8}'
```

### `GET /api/titles`

Lists saved titles.

## Chrome extension

1. Make sure Flask is running at `http://127.0.0.1:5000`.
2. Open `chrome://extensions` in Chrome.
3. Enable Developer mode.
4. Choose **Load unpacked** and select the `extension` folder.
5. Play a title on Netflix. When the video reaches 88%, the extension posts a `completed` record to `/api/add`.

The extension uses the player `video` element and the `data-uia="video-title"` node. If Netflix changes its UI, the selectors may need an update.

## Security

`.gitignore` excludes virtualenvs, `__pycache__`, SQLite databases, `.env`, and OS/editor folders. Do not hardcode API keys.
