import sys
import json
import argparse
from pipeline import ResumeAnalyzerPipeline


def read_file(path: str) -> str:
    """Read text content from a file."""
    try:
        with open(path, "r", encoding="utf-8") as file:
            return file.read()
    except Exception as e:
        return None


def main():
    parser = argparse.ArgumentParser(description="Resume Analyzer AI Engine")

    parser.add_argument("--resume_text", type=str, help="Resume text input")
    parser.add_argument("--jd_text", type=str, help="Job description text input")

    parser.add_argument("--resume_file", type=str, help="Path to resume text file")
    parser.add_argument("--jd_file", type=str, help="Path to job description text file")

    args = parser.parse_args()

    # Initialize pipeline once
    pipeline = ResumeAnalyzerPipeline()

    # Determine input source
    if args.resume_file and args.jd_file:
        resume_text = read_file(args.resume_file)
        jd_text = read_file(args.jd_file)

        if resume_text is None or jd_text is None:
            print(json.dumps({"error": "Error reading input files"}))
            sys.exit(1)

    elif args.resume_text and args.jd_text:
        resume_text = args.resume_text
        jd_text = args.jd_text

    else:
        print(json.dumps({
            "error": "Provide either --resume_text and --jd_text OR --resume_file and --jd_file"
        }))
        sys.exit(1)

    result = pipeline.analyze(resume_text, jd_text)

    # Output JSON
    print(json.dumps(result))


if __name__ == "__main__":
    main()