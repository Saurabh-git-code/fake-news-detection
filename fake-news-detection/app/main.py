from pathlib import Path
import pickle
from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI()

BASE_DIR = Path(__file__).resolve().parent

# Paths
logistic_path = BASE_DIR.parent / "models" / "logistic_model.pkl"
nb_path = BASE_DIR.parent / "models" / "nb_model.pkl"
vectorizer_path = BASE_DIR.parent / "models" / "vectorizer.pkl"

# Load models
with open(logistic_path, "rb") as f:
    logistic_model = pickle.load(f)

with open(nb_path, "rb") as f:
    nb_model = pickle.load(f)

with open(vectorizer_path, "rb") as f:
    vectorizer = pickle.load(f)

class NewsInput(BaseModel):
    text: str
    model: str = "logistic"   # default model

@app.get('/')
def home():
  return {
    "message": "Fake news API running!!!"
  }

@app.post("/predict")
def predict(data: NewsInput):
    vec = vectorizer.transform([data.text])

    if data.model == "nb":
        pred = nb_model.predict(vec)
    else:
        pred = logistic_model.predict(vec)

    return {
        "model_used": data.model,
        "prediction": "Fake News" if pred[0] == 1 else "Real News"
    }
    