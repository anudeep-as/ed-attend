from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict
import joblib
import pandas as pd
import numpy as np
import firebase_admin
from firebase_admin import credentials, firestore
import os
from datetime import datetime
import uvicorn

# Initialize Firebase
cred = credentials.Certificate({
    "type": "service_account",
    # Add your Firebase service account JSON here after download
    "project_id": "ed-attendance",
    # ... (download from Firebase Console → Project Settings → Service Accounts)
})
firebase_admin.initialize_app(cred)
db = firestore.client()

app = FastAPI(title="Ed-Attend ML Backend", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Update for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load models (train first)
try:
    svm_model = joblib.load('models/svm_anomaly.pkl')
    xgb_model = joblib.load('models/xgb_predict.pkl')
    print("Models loaded successfully")
except:
    print("Models not found - run train.py first")
    svm_model = None
    xgb_model = None

class AttendanceData(BaseModel):
    student_id: str
    historical_attendance: List[Dict[str, float]]  # [{"date": "2025-01-01", "status": 1.0, "method": 1}]
    features: Dict[str, float] = {}

@app.get("/")
async def root():
    return {"message": "Ed-Attend ML Backend - SVM + XGBoost", "models_loaded": svm_model is not None}

@app.post("/predict-attendance")
async def predict_attendance(data: AttendanceData):
    if xgb_model is None:
        raise HTTPException(status_code=500, detail="XGBoost model not loaded")
    
    # Extract features
    df = pd.DataFrame(data.historical_attendance)
    features = extract_features(df)
    
    prediction = xgb_model.predict([features])[0]
    probability = xgb_model.predict_proba([features])[0]
    
    return {
        "predicted_attendance_pct": float(prediction * 100),
        "confidence": float(max(probability) * 100),
        "features_used": features
    }

@app.post("/detect-anomalies")
async def detect_anomalies(data: AttendanceData):
    if svm_model is None:
        raise HTTPException(status_code=500, detail="SVM model not loaded")
    
    df = pd.DataFrame(data.historical_attendance)
    features = extract_features(df)
    
    anomaly_score = svm_model.decision_function([features])[0]
    is_anomaly = anomaly_score < 0
    
    return {
        "is_anomaly": is_anomaly,
        "anomaly_score": float(anomaly_score),
        "risk_level": "HIGH" if is_anomaly else "NORMAL",
        "features_used": features
    }

def extract_features(df: pd.DataFrame) -> np.ndarray:
    """Feature engineering for ML models"""
    features = {
        'avg_attendance': df['status'].mean() if len(df) > 0 else 0.8,
        'attendance_std': df['status'].std() if len(df) > 1 else 0,
        'recent_attendance': df['status'].tail(5).mean() if len(df) >= 5 else 0.8,
        'method_diversity': len(df['method'].unique()) / len(df['method'].unique().max()),
        'attendance_count': len(df),
        'weekend_ratio': 0.2,  # Placeholder
        'time_variance': 0.1   # Placeholder
    }
    return list(features.values())

@app.get("/health")
async def health():
    return {"status": "healthy", "firebase": "connected", "models": svm_model is not None}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8001)

