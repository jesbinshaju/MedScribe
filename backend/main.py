from fastapi import FastAPI, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
import shutil
import os
import uuid
from .processor import process_audio_to_ehr
from .database import save_record

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)
#Code written by JEsbin shaju
UPLOAD_DIR = "backend/uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

@app.post("/process")
async def handle_upload(patient_name: str = Form(...), file: UploadFile = File(...)):
    file_path = f"{UPLOAD_DIR}/{uuid.uuid4()}_{file.filename}"
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    transcript, entities = process_audio_to_ehr(file_path)
    
    symptoms = ", ".join(entities.get("SYMPTOMS", []))
    summary_text = f"Patient {patient_name} discussed {symptoms if symptoms else 'clinical observations'}."

    record = {
        "patient_name": patient_name,
        "transcript": transcript,
        "entities": entities,
        "summary": summary_text
    }
    
    await save_record(record)
    
    # Build response AFTER save (MongoDB mutates record with _id)
    response_data = {
        "patient_name": record["patient_name"],
        "transcript": record["transcript"],
        "summary": record["summary"],
        "entities": record["entities"],
    }

    if os.path.exists(file_path):
        os.remove(file_path)
    
    return response_data