from pydantic import BaseModel
from typing import Literal, List, Optional

class StudentBehavioralData(BaseModel):
    student_id: str
    stress_level: float
    sleep_hours: float
    sentiment_score: float
    screen_time_hours: float

class MentalHealthRiskResponse(BaseModel):
    risk_score: float
    risk_level: Literal["LOW", "MODERATE", "HIGH"]
    confidence_score: float
    ai_explanation: List[str]
    recommendations: List[str]
    sentiment_trend: str
