"""
Automatic Speech Recognition Tool - Flask backend.

The actual speech recognition happens in the browser (Web Speech API).
This Flask app only serves the web page and a small health-check route.

Run with:  python app.py
Then open: http://127.0.0.1:5000
"""

from flask import Flask, jsonify, render_template

app = Flask(__name__)


@app.route("/")
def index():
    """Render the main page."""
    return render_template("index.html")


@app.route("/health")
def health():
    """Simple health check used to confirm the server is running."""
    return jsonify({"status": "ok", "service": "ASR Tool"})


if __name__ == "__main__":
    # debug=True gives helpful error pages and auto-reloads when you edit code.
    app.run(host="127.0.0.1", port=5000, debug=True)
