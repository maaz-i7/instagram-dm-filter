from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import tempfile
import zipfile
import json
from datetime import datetime

app = Flask(__name__)
CORS(app)

def parse_timestamp(ms):
    return datetime.fromtimestamp(ms / 1000)

def filter_messages(data, start_date, end_date):
    filtered = []
    for convo in data:
        participants = convo.get("participants", [])
        messages = convo.get("messages", [])
        for msg in messages:
            ts = msg.get("timestamp_ms")
            if ts is None:
                continue
            dt = parse_timestamp(ts)
            if start_date <= dt <= end_date:
                filtered.append({
                    "sender": msg.get("sender_name"),
                    "timestamp": dt.isoformat(),
                    "text": msg.get("content", "")
                })
    return filtered

def extract_conversations(path):
    inbox_dir = os.path.join(path, "messages", "inbox")
    all_data = []
    for root, dirs, files in os.walk(inbox_dir):
        for file in files:
            if file.startswith("message") and file.endswith(".json"):
                with open(os.path.join(root, file), "r", encoding="utf-8") as f:
                    try:
                        convo = json.load(f)
                        all_data.append(convo)
                    except:
                        continue
    return all_data

@app.route("/upload", methods=["POST"])
def upload():
    file = request.files.get("file")
    start = request.form.get("start_date")
    end = request.form.get("end_date")

    if not file or not start or not end:
        return jsonify({"error": "Missing required fields"}), 400

    try:
        start_date = datetime.strptime(start, "%Y-%m-%d")
        end_date = datetime.strptime(end, "%Y-%m-%d")
    except ValueError:
        return jsonify({"error": "Invalid date format"}), 400

    with tempfile.TemporaryDirectory() as tmpdir:
        zip_path = os.path.join(tmpdir, file.filename)
        file.save(zip_path)

        with zipfile.ZipFile(zip_path, 'r') as zip_ref:
            zip_ref.extractall(tmpdir)

        conversations = extract_conversations(tmpdir)
        filtered = filter_messages(conversations, start_date, end_date)

        return jsonify({"messages": filtered})

if __name__ == '__main__':
    app.run(debug=True)
