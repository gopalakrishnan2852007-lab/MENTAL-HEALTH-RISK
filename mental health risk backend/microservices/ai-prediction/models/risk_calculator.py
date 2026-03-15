from models.schemas import StudentBehavioralData
from typing import List, Tuple

def calculate_mental_health_risk(data: StudentBehavioralData) -> Tuple[float, str, List[str], List[str]]:
    risk_score = 0.0
    explanations = []
    recommendations = []
    
    # Stress Level Weight (40%)
    risk_score += (data.stress_level / 100) * 40
    if data.stress_level > 70:
        explanations.append(f"Severely elevated stress index ({round(data.stress_level, 1)}/100).")
        recommendations.append("Immediate clinical check-in requested")
    elif data.stress_level > 40:
        explanations.append("Moderate stress elevation detected.")
        recommendations.append("Practice 4-7-8 breathing exercises")

    # Sleep Hours Weight (30%)
    sleep_deficit = max(0, 8 - data.sleep_hours)
    risk_score += (sleep_deficit / 4) * 30 if sleep_deficit > 0 else 0
    if data.sleep_hours < 5:
        explanations.append(f"Critical sleep deprivation ({round(data.sleep_hours, 1)}h). High risk of cognitive fatigue.")
        recommendations.append("Prioritize 8h rest cycle tonight")
    elif data.sleep_hours < 7:
        explanations.append("Sub-optimal rest patterns identified.")

    # Sentiment Score Weight (20%)
    sentiment_deficit = (1 - data.sentiment_score) / 2
    risk_score += sentiment_deficit * 20
    if data.sentiment_score < -0.2:
        explanations.append("NLP patterns indicate significant emotional distress.")
        recommendations.append("Connect with a peer support group")

    # Screen Time Weight (10%)
    if data.screen_time_hours > 8:
        excess_screen = (data.screen_time_hours - 8) / 6
        risk_score += min(excess_screen * 10, 10)
        explanations.append(f"Digital fatigue from excessive screen time ({round(data.screen_time_hours, 1)}h).")
        recommendations.append("Digital detox: 15min break every hour")

    risk_score = min(max(risk_score, 0.0), 100.0)
    
    risk_level = "LOW"
    if risk_score > 75:
        risk_level = "HIGH"
    elif risk_score > 45:
        risk_level = "MODERATE"
        
    if not explanations:
        explanations.append("All behavioral indicators are within healthy baseline ranges.")
        recommendations.append("Maintain current healthy routines")
        recommendations.append("Encourage regular physical activity")

    return risk_score, risk_level, explanations, recommendations

def determine_sentiment_trend(current_score: float) -> str:
    if current_score > 0.5:
        return "Resilient and Positive"
    elif current_score > 0:
        return "Stable but Cautious"
    elif current_score > -0.5:
        return "Declining Emotional Baseline"
    else:
        return "Acute Distress Detected"
