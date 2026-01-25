from flask import Flask, request, jsonify, Response, send_file
from flask_cors import CORS
from model_utils import parse_resume, compute_match
from PyPDF2 import PdfReader
from docx import Document
import bcrypt
import jwt
import os
import io
import re
import textwrap
from datetime import datetime, timedelta
from pymongo import MongoClient
from dotenv import load_dotenv
from reportlab.lib.pagesizes import A4
from reportlab.lib.colors import HexColor
from reportlab.pdfgen import canvas

# NEW ➜ Groq SDK
from groq import Groq

# ============================================================
# CONFIG
# ============================================================
SECRET_KEY = "Pass@123"
load_dotenv()

client = MongoClient(os.getenv("MONGO_URI"))
db = client[os.getenv("DB_NAME")]
history = db["history"]
users = db["users"]

groq_client = Groq(api_key=os.getenv("GROQ_API_KEY"))

app = Flask(__name__)
CORS(app)

# ============================================================
# HEALTH CHECK
# ============================================================
@app.route("/health")
def health():
    return jsonify({"status": "Backend running"})


# ============================================================
# RESUME ANALYSIS
# ============================================================
@app.route("/analyze", methods=["POST"])
def analyze_resume():
    resume_file = request.files["resume"]
    job_desc = request.form["job_desc"]

    filename = resume_file.filename.lower()
    text = ""

    if filename.endswith(".pdf"):
        reader = PdfReader(resume_file)
        for page in reader.pages:
            extracted = page.extract_text()
            if extracted:
                text += extracted

    elif filename.endswith(".docx"):
        doc = Document(resume_file)
        text = "\n".join([p.text for p in doc.paragraphs])

    else:
        text = resume_file.read().decode("utf-8", errors="ignore")

    parsed = parse_resume(text)
    score = compute_match(parsed["clean_text"], job_desc)

    return jsonify({
        "match_score": score,
        "parsed_resume": parsed,
        "recommendation": "Strong match!" if score > 70 else "Needs improvement",
        "job_desc": job_desc
    })


# ============================================================
# SIGNUP
# ============================================================
@app.route("/signup", methods=["POST"])
def signup():
    data = request.json
    name = data.get("name")
    email = data.get("email")
    password = data.get("password")

    if users.find_one({"email": email}):
        return jsonify({"error": "Email already exists"}), 400

    hashed_pw = bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt())

    users.insert_one({
        "name": name,
        "email": email,
        "password": hashed_pw,
        "created_at": datetime.now().isoformat()
    })

    return jsonify({"success": True, "message": "User created"}), 201


# ============================================================
# LOGIN
# ============================================================
@app.route("/login", methods=["POST"])
def login():
    data = request.json
    email = data.get("email")
    password = data.get("password")

    user = users.find_one({"email": email})
    if not user:
        return jsonify({"error": "User not found"}), 400

    if not bcrypt.checkpw(password.encode("utf-8"), user["password"]):
        return jsonify({"error": "Wrong password"}), 400

    token = jwt.encode(
        {"email": email, "exp": datetime.utcnow() + timedelta(days=2)},
        SECRET_KEY,
        algorithm="HS256"
    )

    return jsonify({
        "success": True,
        "token": token,
        "name": user["name"],
        "email": user["email"]
    })


# ============================================================
# AI SUGGESTIONS — STREAMING (Groq Mixtral)
# ============================================================
@app.route("/ai-suggestions", methods=["POST"])
def ai_suggestions():

    content = request.json.get("content")
    analysis_data = request.json.get("analysis")
    user_email = request.json.get("user_email")

    prompt = f"""
You are an extremely smart ATS Resume Expert.

STRICT RULES:
- Respond ONLY in clean Markdown
- Use EXACTLY these sections:
## Missing Skills
## Resume Improvements
## How to Increase ATS Score
- Use bullet points
- Do NOT split words
- Do NOT repeat sections

Resume:
{analysis_data["parsed_resume"]["clean_text"]}

Job Description:
{analysis_data["job_desc"]}
"""

    def stream():
        full_output = ""

        response = groq_client.chat.completions.create(
            model="mixtral-8x7b-32768",
            messages=[{"role": "user", "content": prompt}],
            stream=True,
            temperature=0.2,
        )

        for chunk in response:
            if chunk.choices[0].delta.get("content"):
                token = chunk.choices[0].delta["content"]
                full_output += token
                yield f"data:{token}\n\n"

        # Save after streaming ends
        history.insert_one({
            "user_email": user_email,
            "resume_text": analysis_data["parsed_resume"]["clean_text"],
            "job_desc": analysis_data["job_desc"],
            "score": analysis_data["match_score"],
            "keywords": analysis_data["parsed_resume"]["keywords"],
            "ai_suggestions": full_output,
            "timestamp": datetime.now().isoformat()
        })

    return Response(stream(), mimetype="text/event-stream")


# ============================================================
# TOKEN CHECK
# ============================================================
def require_token(func):
    def wrapper(*args, **kwargs):
        token = request.headers.get("Authorization")
        if not token:
            return jsonify({"error": "Token missing"}), 401

        try:
            decoded = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
            request.user_email = decoded["email"]
        except:
            return jsonify({"error": "Invalid token"}), 401

        return func(*args, **kwargs)

    wrapper.__name__ = func.__name__
    return wrapper


# ============================================================
# HISTORY
# ============================================================
@app.route("/history", methods=["GET"])
@require_token
def history_page():
    email = request.user_email
    records = list(history.find({"user_email": email}, {"_id": 0}))
    return jsonify(records)


# ============================================================
# PDF DOWNLOAD (same as yours, perfect)
# ============================================================
@app.route("/download-report", methods=["GET"])
def download_report():

    email = request.args.get("email")
    last = history.find_one({"user_email": email}, sort=[("timestamp", -1)])

    if not last:
        return jsonify({"error": "No report found"}), 404

    buffer = io.BytesIO()
    pdf = canvas.Canvas(buffer, pagesize=A4)

    purple = HexColor("#7C3AED")
    black = HexColor("#111")

    def wrap(text, width=95):
        return textwrap.wrap(text, width=width)

    # HEADER
    pdf.setFillColor(purple)
    pdf.setFont("Helvetica-Bold", 22)
    pdf.drawString(50, 800, "ATS Resume Analysis Report")

    # USER INFO
    pdf.setFillColor(black)
    pdf.setFont("Helvetica", 12)
    pdf.drawString(50, 770, f"Email: {email}")
    pdf.drawString(50, 755, f"Match Score: {last['score']}%")

    y = 735

    # JOB DESCRIPTION SUMMARY (clean)
    pdf.setFillColor(purple)
    pdf.setFont("Helvetica-Bold", 14)
    pdf.drawString(50, y, "Job Description (Summary):")
    y -= 20

    pdf.setFillColor(black)
    pdf.setFont("Helvetica", 11)

    jd_text = last["job_desc"].strip()
    sentences = re.split(r'(?<=[.!?]) +', jd_text)

    summary = ""
    for s in sentences:
        if len(summary + s) < 350:
            summary += s + " "
        else:
            break

    for line in wrap(summary.strip()):
        pdf.drawString(50, y, line)
        y -= 14

    # KEYWORDS
    pdf.setFillColor(purple)
    pdf.setFont("Helvetica-Bold", 14)
    pdf.drawString(50, y - 10, "Matched Keywords:")
    y -= 30

    pdf.setFillColor(black)
    pdf.setFont("Helvetica", 11)

    for k in last["keywords"]:
        pdf.drawString(60, y, f"• {k}")
        y -= 14

    # AI SUGGESTIONS
    pdf.setFillColor(purple)
    pdf.setFont("Helvetica-Bold", 14)
    pdf.drawString(50, y - 10, "AI Suggestions:")
    y -= 30

    pdf.setFillColor(black)
    pdf.setFont("Helvetica", 11)

    for line in last["ai_suggestions"].split("\n"):
        for w in wrap(line, 95):
            pdf.drawString(50, y, w)
            y -= 14

    pdf.save()
    buffer.seek(0)

    return send_file(
        buffer,
        as_attachment=True,
        download_name="ATS_Report.pdf",
        mimetype="application/pdf"
    )


# ============================================================
# RUN
# ============================================================
if __name__ == "__main__":
    app.run(debug=True, port=5000)
