from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

class TfidfSimilarity:
    def __init__(self):
        """
        Initialize TF-IDF vectorizer.
        Using default settings for interpretability and stability.
        """
        self.vectorizer = TfidfVectorizer()

    def compute_similarity(self, text1: str, text2: str) -> float:
        """
        Compute cosine similarity between two texts using TF-IDF.

        Returns:
            similarity_score (0 to 100)
        """
        corpus = [text1, text2]

        tfidf_matrix = self.vectorizer.fit_transform(corpus)

        similarity = cosine_similarity(tfidf_matrix[0:1], tfidf_matrix[1:2])[0][0]

        return round(similarity * 100, 2)