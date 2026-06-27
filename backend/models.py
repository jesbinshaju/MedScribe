from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime

class PatientRecord(BaseModel):
    patient_name: str
    transcript: str
    entities: dict
    summary: str
    created_at: datetime = Field(default_factory=datetime.utcnow)
