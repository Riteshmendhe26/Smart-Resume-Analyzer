import re
import math
import nltk
from nltk.corpus import stopwords

stop_words = set(stopwords.words("english"))

def clean_text(text):
    text = re.sub(r'\W+', ' ', text.lower()).strip()
    tokens = [w for w in text.split() if w not in stop_words]
    return tokens

def extract_keywords(tokens):
    freq = {}
    for w in tokens:
        if len(w) > 3:
            freq[w] = freq.get(w, 0) + 1
    keywords = sorted(freq, key=freq.get, reverse=True)[:10]
    return keywords

def text_to_vector(tokens):
    vec = {}
    for word in tokens:
        vec[word] = vec.get(word, 0) + 1
    return vec

def cosine_similarity(vec1, vec2):
    intersection = set(vec1.keys()) & set(vec2.keys())
    num = sum(vec1[x] * vec2[x] for x in intersection)

    sum1 = sum(v * v for v in vec1.values())
    sum2 = sum(v * v for v in vec2.values())
    denom = math.sqrt(sum1) * math.sqrt(sum2)

    if not denom:
        return 0.0
    return float(num) / denom

def parse_resume(text):
    tokens = clean_text(text)
    keywords = extract_keywords(tokens)
    return {
        "clean_text": " ".join(tokens),
        "keywords": keywords,
        "summary": text[:200] + "..."
    }

def compute_match(resume_clean, job_desc):
    resume_tokens = resume_clean.split()
    job_tokens = clean_text(job_desc)

    v1 = text_to_vector(resume_tokens)
    v2 = text_to_vector(job_tokens)

    match = cosine_similarity(v1, v2)
    return round(match * 100, 2)
