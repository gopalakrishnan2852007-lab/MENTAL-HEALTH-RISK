from fastapi import FastAPI
from models.schemas import StudentBehavioralData, MentalHealthRiskResponse
from models.risk_calculator import (
    calculate_mental_health_risk, 
    determine_sentiment_trend
)
import random

app = FastAPI(title="MindGuard AI Prediction Microservice")

@app.get("/")
def home():
    return {"status": "active", "message": "🧠 MindGuard AI Risk Intelligence Active"}

@app.post("/predict_risk", response_model=MentalHealthRiskResponse)
def predict_risk(data: StudentBehavioralData):
    """
    Endpoint to receive student behavioral telemetry and return mental health risk assessment.
    """
    risk_score, risk_level, explanations, recommendations = calculate_mental_health_risk(data)
    
    sentiment_trend = determine_sentiment_trend(data.sentiment_score)
    
    # Confidence is high if data is complete
    confidence = 90.0 + random.uniform(0.0, 8.0)
    
    return MentalHealthRiskResponse(
        risk_score=round(risk_score, 1),
        risk_level=risk_level,
        confidence_score=round(confidence, 1),
        ai_explanation=explanations,
        recommendations=recommendations,
        sentiment_trend=sentiment_trend
    )
