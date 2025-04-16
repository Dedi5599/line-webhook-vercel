import os
import requests
from flask import Flask, request, jsonify

app = Flask(__name__)

LINE_TOKEN = os.getenv("LINE_TOKEN")
LINE_TO = os.getenv("LINE_TO")

def send_to_line(message):
    url = "https://api.line.me/v2/bot/message/push"
    headers = {
        "Authorization": f"Bearer {LINE_TOKEN}",
        "Content-Type": "application/json"
    }
    payload = {
        "to": LINE_TO,
        "messages": [{"type": "text", "text": message}]
    }
    requests.post(url, headers=headers, json=payload)

@app.route("/webhook", methods=["POST"])
def telegram_webhook():
    data = request.json
    try:
        message = data["message"]["text"]
        sender = data["message"]["from"].get("first_name", "unknown")
        send_to_line(f"[Telegram] {sender}: {message}")
    except Exception as e:
        print("Error handling webhook:", e)
    return jsonify({"ok": True})
