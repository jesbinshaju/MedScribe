import whisper
import spacy
import os

# Load models (Will download on first run)
model = whisper.load_model("base")
nlp = spacy.load("en_core_web_sm")

def process_audio_to_ehr(file_path: str):
    result = model.transcribe(file_path)
    transcript = result['text']
    doc = nlp(transcript)
    entities = {"DIAGNOSIS": [], "MEDICATION": [], "SYMPTOMS": []}
    for ent in doc.ents:
        if ent.label_ in ["CONDITION", "DISEASE"]:
            entities["DIAGNOSIS"].append(ent.text)
        elif ent.label_ in ["DRUG", "CHEMICAL"]:
            entities["MEDICATION"].append(ent.text)
        else:
            entities["SYMPTOMS"].append(ent.text)
    return transcript, entities
