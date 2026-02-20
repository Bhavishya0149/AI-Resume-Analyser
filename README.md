# AI Resume–Job Description Matching Engine

This module implements the AI/NLP core for the **AI-Based Resume–Job Description Matching & Skill Gap Analysis System**.

It performs automated analysis between a resume and a job description and returns structured, explainable matching scores.

---

## Features

- TF-IDF based lexical similarity
- BERT-based sentence embedding similarity (MiniLM)
- Skill extraction using a curated skill dictionary
- Skill gap identification
- Qualification score computation (hybrid scoring)
- JSON output for backend integration
- File-based input support for large documents
- Deterministic and explainable results

---

## Input

The engine accepts either:

### File Mode (Recommended)

```bash
python main.py --resume_file <resume_txt_path> --jd_file <jd_txt_path>
````

### Direct Text Mode (Optional)

```bash
python main.py --resume_text "..." --jd_text "..."
```

Input requirements:

* UTF-8 encoded text
* Plain text only
* English language
* Recommended size ≤ 200 KB per file

---

## Output

The engine returns a single JSON object:

```json
{
  "tfidf_similarity": 0.0,
  "embedding_similarity": 0.0,
  "skill_match_percentage": 0.0,
  "qualification_score": 0.0,
  "matched_skills": [],
  "missing_skills": []
}
```

### Field Description

| Field                  | Description                             |
| ---------------------- | --------------------------------------- |
| tfidf_similarity       | Keyword-based similarity score          |
| embedding_similarity   | Semantic similarity score               |
| skill_match_percentage | Percentage of JD skills found in resume |
| qualification_score    | Weighted overall match score            |
| matched_skills         | Skills present in both resume and JD    |
| missing_skills         | JD skills not found in resume           |

All scores are in the range **0–100**.

---

## Scoring Methodology

The final qualification score is computed as:

```
qualification_score =
0.6 × TF-IDF similarity +
0.4 × skill match percentage
```

This combines semantic similarity with explicit skill coverage.

---

## Architecture

This module is designed as a **black-box AI service**:

```
Input Text → NLP Pipeline → Similarity Models → Skill Gap Analysis → JSON Output
```

It is consumed by the backend via CLI invocation.

---

## Project Structure

```
ai-engine/
│── src/
│   ├── main.py                # CLI entry point (JSON output)
│   ├── pipeline.py            # End-to-end analysis pipeline
│   ├── preprocessing.py       # Text normalization
│   ├── skill_extractor.py     # Skill extraction module
│   ├── tfidf_engine.py        # TF-IDF similarity model
│   ├── embedding_engine.py    # BERT-based similarity model
│   ├── scorer.py              # Skill gap + qualification scoring
│   ├── evaluate.py            # Evaluation script
│
│── data/
│   └── skills.csv             # Skill dictionary
│
│── test_data/
│   ├── resume.txt
│   └── jd.txt
│
│── requirements.txt
│── README.md
```

---

## Installation

Create a virtual environment and install dependencies:

```bash
pip install -r requirements.txt
python -m spacy download en_core_web_sm
```

On first run, the embedding model will download automatically.

---

## Example Usage

```bash
python main.py \
  --resume_file test_data/resume.txt \
  --jd_file test_data/jd.txt
```

Example output:

```json
{
  "tfidf_similarity": 40.77,
  "embedding_similarity": 72.29,
  "skill_match_percentage": 50.0,
  "qualification_score": 44.46,
  "matched_skills": ["python"],
  "missing_skills": ["docker"]
}
```

---

## Evaluation

Run the evaluation script to generate comparison results:

```bash
python evaluate.py
```

This produces:

* Console comparison table
* `evaluation_results.csv` for report inclusion

The evaluation demonstrates:

* TF-IDF vs embedding similarity behavior
* Performance across multiple matching scenarios

---

## Methodology Summary

1. Text preprocessing (lowercasing, normalization, lemmatization)
2. Skill extraction using a curated dictionary
3. TF-IDF vectorization + cosine similarity
4. Sentence embedding similarity (MiniLM)
5. Skill gap analysis
6. Hybrid qualification score computation

---

## Limitations

* Skill detection is dictionary-based
* English text only
* No section-wise resume weighting
* No domain-specific embedding fine-tuning
* Heuristic scoring (not a hiring decision system)

---

## Future Work

* NER-based automatic skill extraction
* Section-wise weighted scoring (skills vs experience)
* Multi-resume ranking for ATS integration
* Fine-tuning embeddings on domain-specific resume datasets
* Explainable AI visualizations for score contribution

---

## Integration Contract

This module is designed to be consumed as a **CLI-based AI service**.

The backend must:

1. Provide resume and JD as text files
2. Invoke `main.py`
3. Parse the returned JSON

Internal NLP components should be treated as a black box.

---