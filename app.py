import os
import sqlite3
from pathlib import Path

from dotenv import load_dotenv
from flask import Flask, g, jsonify, render_template, request
from flask_cors import CORS

load_dotenv()

TMDB_API_KEY = os.getenv("TMDB_API_KEY")

BASE_DIR = Path(__file__).resolve().parent
DATABASE = BASE_DIR / "netflix_tracker.db"

app = Flask(__name__)
CORS(app)


def get_db():
    if "db" not in g:
        g.db = sqlite3.connect(DATABASE)
        g.db.row_factory = sqlite3.Row
    return g.db


@app.teardown_appcontext
def close_db(exception):
    db = g.pop("db", None)
    if db is not None:
        db.close()


def init_db():
    db = sqlite3.connect(DATABASE)
    db.execute(
        """
        CREATE TABLE IF NOT EXISTS titles (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            status TEXT NOT NULL DEFAULT 'watchlist',
            rating INTEGER,
            notes TEXT,
            season INTEGER,
            episode INTEGER,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
        """
    )
    existing = {
        row[1] for row in db.execute("PRAGMA table_info(titles)").fetchall()
    }
    if "season" not in existing:
        db.execute("ALTER TABLE titles ADD COLUMN season INTEGER")
    if "episode" not in existing:
        db.execute("ALTER TABLE titles ADD COLUMN episode INTEGER")
    db.commit()
    db.close()


@app.route("/")
def index():
    return render_template("index.html")


@app.route("/api/titles", methods=["GET"])
def list_titles():
    db = get_db()
    rows = db.execute(
        "SELECT id, title, status, rating, notes, season, episode, created_at FROM titles ORDER BY id DESC"
    ).fetchall()
    return jsonify([dict(row) for row in rows])


@app.route("/api/add", methods=["POST"])
def add_title():
    data = request.get_json(silent=True) or {}
    title = (data.get("title") or "").strip()
    status = (data.get("status") or "watchlist").strip()
    notes = (data.get("notes") or "").strip()
    rating = data.get("rating")
    season = data.get("season")
    episode = data.get("episode")

    if not title:
        return jsonify({"error": "title is required"}), 400

    allowed_status = {"watchlist", "watching", "completed"}
    if status not in allowed_status:
        return jsonify({"error": "invalid status"}), 400

    if rating is not None and rating != "":
        try:
            rating = int(rating)
        except (TypeError, ValueError):
            return jsonify({"error": "rating must be an integer"}), 400
        if rating < 1 or rating > 10:
            return jsonify({"error": "rating must be between 1 and 10"}), 400
    else:
        rating = None

    def parse_optional_int(value, field_name):
        if value is None or value == "":
            return None
        try:
            return int(value)
        except (TypeError, ValueError):
            raise ValueError(field_name)

    try:
        season = parse_optional_int(season, "season")
        episode = parse_optional_int(episode, "episode")
    except ValueError as field_name:
        return jsonify({"error": f"{field_name} must be an integer"}), 400

    db = get_db()
    cursor = db.execute(
        "INSERT INTO titles (title, status, rating, notes, season, episode) VALUES (?, ?, ?, ?, ?, ?)",
        (title, status, rating, notes or None, season, episode),
    )
    db.commit()

    row = db.execute(
        "SELECT id, title, status, rating, notes, season, episode, created_at FROM titles WHERE id = ?",
        (cursor.lastrowid,),
    ).fetchone()
    return jsonify(dict(row)), 201


init_db()

if __name__ == "__main__":
    app.run(debug=True, host="127.0.0.1", port=5000)
