import os
import logging
import sys

os.environ["TOKENIZERS_PARALLELISM"] = "false"
os.environ["HF_HUB_DISABLE_SYMLINKS_WARNING"] = "1"
os.environ["TRANSFORMERS_NO_ADVISORY_WARNINGS"] = "true"
os.environ["HF_HUB_DISABLE_PROGRESS_BARS"] = "1"

logging.getLogger("sentence_transformers").setLevel(logging.ERROR)
logging.getLogger("transformers").setLevel(logging.ERROR)
logging.getLogger("huggingface_hub").setLevel(logging.ERROR)

from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity


class EmbeddingSimilarity:
    def __init__(self):
        self._original_stdout = sys.stdout
        sys.stdout = open(os.devnull, "w")

        try:
            self.model = SentenceTransformer("all-MiniLM-L6-v2", device="cpu")
        finally:
            sys.stdout.close()
            sys.stdout = self._original_stdout

    def compute_similarity(self, text1: str, text2: str) -> float:
        embeddings = self.model.encode(
            [text1, text2],
            show_progress_bar=False
        )

        similarity = cosine_similarity(
            [embeddings[0]], [embeddings[1]]
        )[0][0]

        return round(similarity * 100, 2)
