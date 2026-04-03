from flask import Flask, request, jsonify
from pipeline import ResumeAnalyzerPipeline

app = Flask(__name__)

# Load pipeline ONCE (very important)
pipeline = ResumeAnalyzerPipeline()


@app.route("/health", methods=["GET"])
def health():
    return jsonify({"status": "ok"}), 200


@app.route("/analyze", methods=["POST"])
def analyze():
    try:
        data = request.get_json()

        if not data:
            return jsonify({"error": "Invalid JSON input"}), 400

        resume_text = data.get("resume_text")
        jd_text = data.get("jd_text")

        if not resume_text or not jd_text:
            return jsonify({
                "error": "Both 'resume_text' and 'jd_text' are required"
            }), 400

        result = pipeline.analyze(resume_text, jd_text)

        return jsonify(result), 200

    except Exception as e:
        return jsonify({
            "error": "Internal server error",
            "details": str(e)
        }), 500


if __name__ == "__main__":
    print("FLASK SERVER SATRTED!")
    app.run(host="0.0.0.0", port=5000, debug=True, use_reloader=False)