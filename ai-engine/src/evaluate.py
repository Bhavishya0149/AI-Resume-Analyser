import csv
from pipeline import ResumeAnalyzerPipeline

pipeline = ResumeAnalyzerPipeline()

# Define test cases
test_cases = [
    {
        "case": "Exact Match",
        "resume": "Python machine learning NLP pandas data analysis",
        "jd": "Looking for Python machine learning NLP data analysis"
    },
    {
        "case": "Synonym Match",
        "resume": "Worked on NLP and text analytics projects",
        "jd": "Looking for Natural Language Processing engineer"
    },
    {
        "case": "Partial Skill Match",
        "resume": "Python pandas numpy",
        "jd": "Python machine learning docker aws"
    },
    {
        "case": "Different Domain",
        "resume": "Java Spring Boot microservices",
        "jd": "Data scientist machine learning python"
    },
    {
        "case": "High Skill Overlap",
        "resume": "Python machine learning data analysis deep learning",
        "jd": "Machine learning python data analysis deep learning"
    }
]

results = []

for test in test_cases:
    output = pipeline.analyze(test["resume"], test["jd"])

    row = {
        "Case": test["case"],
        "TF-IDF Similarity": output["tfidf_similarity"],
        "Embedding Similarity": output["embedding_similarity"],
        "Skill Match %": output["skill_match_percentage"],
        "Qualification Score": output["qualification_score"]
    }

    results.append(row)

# Print results in console
print("\n===== EVALUATION RESULTS =====\n")
for r in results:
    print(r)

# Save to CSV for report
with open("../evaluation_results.csv", "w", newline="") as file:
    writer = csv.DictWriter(file, fieldnames=results[0].keys())
    writer.writeheader()
    writer.writerows(results)

print("\nResults saved to evaluation_results.csv")