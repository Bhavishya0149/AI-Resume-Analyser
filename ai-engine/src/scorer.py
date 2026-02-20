class ResumeScorer:
    def __init__(self, similarity_weight: float = 0.6, skill_weight: float = 0.4):
        """
        Initialize scoring weights.
        Default:
            similarity = 60%
            skill match = 40%
        """
        self.similarity_weight = similarity_weight
        self.skill_weight = skill_weight

    def skill_gap_analysis(self, resume_skills: set, jd_skills: set):
        """
        Compute:
        - matched skills
        - missing skills
        - skill match percentage
        """
        if not jd_skills:
            return set(), set(), 0.0

        matched_skills = resume_skills.intersection(jd_skills)
        missing_skills = jd_skills.difference(resume_skills)

        skill_match_percentage = (len(matched_skills) / len(jd_skills)) * 100

        return matched_skills, missing_skills, round(skill_match_percentage, 2)

    def compute_qualification_score(self, similarity_score: float, skill_match_percentage: float) -> float:
        """
        Final score = weighted combination of:
        - TF-IDF similarity
        - Skill match percentage
        """
        qualification_score = (
            self.similarity_weight * similarity_score
            + self.skill_weight * skill_match_percentage
        )

        return round(qualification_score, 2)