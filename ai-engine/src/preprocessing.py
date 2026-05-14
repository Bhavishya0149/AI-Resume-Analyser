import re
import spacy
import nltk
from nltk.corpus import stopwords

# Ensure NLTK stopwords are available
try:
    STOPWORDS = set(stopwords.words("english"))
except LookupError:
    nltk.download("stopwords")
    STOPWORDS = set(stopwords.words("english"))

# Load spaCy model once
nlp = spacy.load("en_core_web_sm")


def clean_text(text: str) -> str:
    text = text.lower()
    text = re.sub(r"[^a-z0-9\s]", " ", text)
    text = re.sub(r"\s+", " ", text).strip()
    return text


def preprocess_text(text: str) -> str:
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