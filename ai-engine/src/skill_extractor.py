import pandas as pd

class SkillExtractor:
    def __init__(self, skill_file_path: str):
        """
        Load skill dictionary from CSV
        """
        skills_df = pd.read_csv(skill_file_path)
        self.skills = [skill.lower() for skill in skills_df["skill"].dropna().tolist()]

    def extract_skills(self, text: str) -> set:
        """
        Extract skills from preprocessed text.
        Works for both single-word and multi-word skills.
        """
        extracted_skills = set()

        for skill in self.skills:
            # exact phrase match
            if skill in text:
                extracted_skills.add(skill)

        return extracted_skills