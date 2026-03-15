export interface StudentRiskData {
  student_id: string;
  name: string;
  major: string;
  year: string;
  stress_level: number;
  sleep_hours: number;
  sentiment_score: number;
  screen_time_hours: number;
  risk_score: number;
  confidence_score: number;
  risk_level: string;
  ai_explanation: string[];
  recommendations: string[];
  timestamp: string;
}
