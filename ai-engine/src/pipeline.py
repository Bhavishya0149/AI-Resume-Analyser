import os

from preprocessing import preprocess_text
from skill_extractor import SkillExtractor
from tfidf_engine import TfidfSimilarity
from scorer import ResumeScorer
from embedding_engine import EmbeddingSimilarity


class ResumeAnalyzerPipeline:
    def __init__(self):
        """
        Initialize all components once for performance.
        """

        # Resolve absolute path to skills.csv
        base_dir = os.path.dirname(os.path.dirname(__file__))
        skill_path = os.path.join(base_dir, "data", "skills.csv")

        self.skill_extractor = SkillExtractor(skill_path)
        self.tfidf_model = TfidfSimilarity()
        self.scorer = ResumeScorer()
        self.embedding_model = EmbeddingSimilarity()

    def analyze(self, resume_text: str, jd_text: str) -> dict:
        """
        Full pipeline:
        1. Preprocess text
        2. Extract skills
        3. Compute TF-IDF similarity
        4. Skill gap analysis
        5. Qualification score
        """

        # Preprocess
        clean_resume = preprocess_text(resume_text)
        clean_jd = preprocess_text(jd_text)

        # Skill extraction
        resume_skills = self.skill_extractor.extract_skills(clean_resume)
        jd_skills = self.skill_extractor.extract_skills(clean_jd)

        # Similarity
        similarity_score = self.tfidf_model.compute_similarity(clean_resume, clean_jd)

        # Skill gap analysis
        matched_skills, missing_skills, skill_match_percentage = self.scorer.skill_gap_analysis(
            resume_skills, jd_skills
        )

        # Final score
        qualification_score = self.scorer.compute_qualification_score(
            similarity_score, skill_match_percentage
        )

        embedding_similarity = self.embedding_model.compute_similarity(
            resume_text, jd_text
        )

        return {
            "tfidf_similarity": similarity_score,
            "embedding_similarity": embedding_similarity,
            "skill_match_percentage": skill_match_percentage,
            "qualification_score": qualification_score,
            "matched_skills": sorted(list(matched_skills)),
            "missing_skills": sorted(list(missing_skills)),
        }
