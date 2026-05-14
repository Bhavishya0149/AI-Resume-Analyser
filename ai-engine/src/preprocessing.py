import re
import spacy
from nltk.corpus import stopwords

# Load spaCy model once (important for performance)
nlp = spacy.load("en_core_web_sm")

# Load stopwords once
STOPWORDS = set(stopwords.words("english"))


def clean_text(text: str) -> str:
    """
    Basic cleaning:
    - Lowercase
    - Remove special characters
    - Remove extra whitespace
    """
    text = text.lower()
    text = re.sub(r"[^a-z0-9\s]", " ", text)
    text = re.sub(r"\s+", " ", text).strip()
    return text


def preprocess_text(text: str) -> str:
    """
    Full preprocessing pipeline using spaCy:
    1. Clean text
    2. Tokenize with spaCy
    3. Remove stopwords
    4. Lemmatize
    5. Return processed string
    """
    text = clean_text(text)

    doc = nlp(text)

    tokens = [
        token.lemma_
        for token in doc
        if token.text not in STOPWORDS
        and not token.is_punct
        and not token.is_space
    ]

    return " ".join(tokens)
