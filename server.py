#!/usr/bin/env python3
import json
import os
import re
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import urlparse

ROOT = Path(__file__).resolve().parent
HOST = "127.0.0.1"
PORT = 8000


def normalize_text(value):
    return re.sub(r"\s+", " ", (value or "")).strip()


def detect_topic(article):
    lowered = article.lower()
    if any(word in lowered for word in ["election", "government", "minister", "policy", "parliament"]):
        return "politics", ["🗳️", "🏛️", "📢"]
    if any(word in lowered for word in ["market", "stock", "share", "price", "trade", "inflation"]):
        return "finance", ["📈", "💸", "🏦"]
    if any(word in lowered for word in ["climate", "storm", "flood", "solar", "sea", "ocean", "energy", "warming"]):
        return "science", ["☀️", "🌊", "🔬"]
    if any(word in lowered for word in ["goal", "match", "team", "coach", "league", "cup", "sport"]):
        return "sport", ["⚽", "🏆", "🎯"]
    if any(word in lowered for word in ["ai", "tech", "startup", "software", "robot", "cyber", "digital"]):
        return "technology", ["🤖", "💻", "⚡"]
    return "general", ["📰", "✨", "🎭"]


def build_story_lines(article):
    article = normalize_text(article)
    pieces = re.split(r"(?<=[.!?])\s+", article)
    pieces = [piece.strip() for piece in pieces if piece.strip()]
    if not pieces:
        return [
            "The story arrives with a dramatic opening, ready for the front page.",
            "A new twist changes the angle, and the drama builds fast.",
            "By the end, the headline lands with a punchline and a clear takeaway."
        ]

    story = []
    for piece in pieces[:3]:
        sentence = piece.strip(" \n\r")
        if len(sentence) > 220:
            sentence = sentence[:210].rstrip() + "..."
        story.append(sentence)

    while len(story) < 3:
        story.append("The story keeps moving, adding one more twist before the final reveal.")
    return story[:3]


def generate_panels(article):
    topic, icons = detect_topic(article)
    lines = build_story_lines(article)

    captions = [
        f"{lines[0]} The opening frame sets up the scene before the main plot lands.",
        f"{lines[1]} The middle panel adds pressure, stakes, and a sharp turn in the story.",
        f"{lines[2]} The final panel delivers the punchline, closing with a clear headline-worthy takeaway."
    ]

    if topic == "politics":
        captions = [
            f"{lines[0]} The policy debate begins as everyone claims the moral high ground.",
            f"{lines[1]} The pressure builds as the numbers, promises, and reactions collide.",
            f"{lines[2]} By the end, the vote, the headline, and the spin all point to the same cliffhanger."
        ]
    elif topic == "finance":
        captions = [
            f"{lines[0]} The market opens with a nervous gasp and a wave of speculation.",
            f"{lines[1]} Analysts pivot as the numbers move faster than the headlines can explain.",
            f"{lines[2]} The closing scene lands on the big question: who wins, who loses, and who blames the chart?"
        ]
    elif topic == "science":
        captions = [
            f"{lines[0]} The breakthrough arrives with a fresh splash of innovation and a lot of buzz.",
            f"{lines[1]} Scientists track the impact while the public imagines the next big possibility.",
            f"{lines[2]} The final panel asks the real question: what does this change for the future?"
        ]
    elif topic == "sport":
        captions = [
            f"{lines[0]} The crowd leans in as the opening move shifts the momentum.",
            f"{lines[1]} The pressure rises, the scoreboard tightens, and the drama gets louder.",
            f"{lines[2]} In the final beat, the team lands the move that turns the match into a legend."
        ]
    elif topic == "technology":
        captions = [
            f"{lines[0]} A new idea drops into the market and suddenly everyone wants the demo.",
            f"{lines[1]} The buzz turns into adoption, bugs, and a very public question: is it real or hype?",
            f"{lines[2]} The closing frame makes the big reveal: the future is here, and it arrives faster than expected."
        ]

    return [
        {"caption": captions[0], "icon": icons[0]},
        {"caption": captions[1], "icon": icons[1]},
        {"caption": captions[2], "icon": icons[2]},
    ]


class CartoonHandler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(ROOT), **kwargs)

    def do_GET(self):
        if self.path == "/api/cartoon":
            self.send_error(405, "Method not allowed. Use POST for cartoon generation.")
            return
        return super().do_GET()

    def do_POST(self):
        if self.path != "/api/cartoon":
            self.send_error(404, "Endpoint not found.")
            return

        content_length = int(self.headers.get("Content-Length", "0"))
        raw_body = self.rfile.read(content_length) if content_length > 0 else b"{}"

        try:
            payload = json.loads(raw_body.decode("utf-8")) if raw_body else {}
        except json.JSONDecodeError:
            self.send_error(400, "Request body must be valid JSON.")
            return

        article = normalize_text(payload.get("article", ""))
        if not article:
            self.send_error(400, "Missing article text.")
            return

        panels = generate_panels(article)
        response = json.dumps({"panels": panels}).encode("utf-8")

        self.send_response(200)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(response)))
        self.end_headers()
        self.wfile.write(response)

    def log_message(self, format, *args):
        return


if __name__ == "__main__":
    print(f"Headline Toons API running at http://{HOST}:{PORT}")
    httpd = ThreadingHTTPServer((HOST, PORT), CartoonHandler)
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\nShutting down server.")
    finally:
        httpd.server_close()
