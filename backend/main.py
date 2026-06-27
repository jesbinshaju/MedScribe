from fastapi import FastAPI, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
import shutil
import os
import uuid
from .processor import process_audio_to_ehr
from .database import save_record, get_all_records

app = FastAPI()

# Allow frontend to communicate
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

UPLOAD_DIR = "backend/uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

@app.post("/process")
async def handle_upload(patient_name: str = Form(...), file: UploadFile = File(...)):
    # 1. Save temp audio file
    file_path = f"{UPLOAD_DIR}/{uuid.uuid4()}_{file.filename}"
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    # 2. AI Processing
    transcript, entities = process_audio_to_ehr(file_path)
    
    # 3. Create Record
    record = {
        "patient_name": patient_name,
        "transcript": transcript,
        "entities": entities,
        "summary": f"Clinical encounter for {patient_name}."
    }
    
    # 4. Save to MongoDB
    await save_record(record)
    
    # --- THE FIX STARTS HERE ---
    # Convert MongoDB's special _id into a simple string so the browser can read it
    if "_id" in record:
        record["id"] = str(record.pop("_id"))
    # --- THE FIX ENDS HERE ---
    
    # 5. Cleanup
    if os.path.exists(file_path):
        os.remove(file_path)
    
    return record

@app.get("/records")
async def list_records():
    return await get_all_records()