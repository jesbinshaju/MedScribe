from fastapi import FastAPI, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
import shutil
import os
import uuid
from .processor import process_audio_to_ehr
from .database import save_record, get_all_records

app = FastAPI()
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])

UPLOAD_DIR = "backend/uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

@app.post("/process")
async def handle_upload(patient_name: str = Form(...), file: UploadFile = File(...)):
    file_path = f"{UPLOAD_DIR}/{uuid.uuid4()}_{file.filename}"
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    transcript, entities = process_audio_to_ehr(file_path)
    record = {
        "patient_name": patient_name,
        "transcript": transcript,
        "entities": entities,
        "summary": f"Clinical encounter for {patient_name}."
    }
    await save_record(record)
    os.remove(file_path)
    return record

@app.get("/records")
async def list_records():
    return await get_all_records()
