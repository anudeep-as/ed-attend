# Ed-Attend ML Backend (SVM + XGBoost)

## SIH ML Features
- **XGBoost**: Predicts next attendance % 
- **SVM**: Detects anomalous/fake attendance
- **FastAPI**: `/predict-attendance` + `/detect-anomalies`

## Quick Start (Windows)
```cmd
cd ml-backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
python train.py
uvicorn app:app --reload --port 8001
```

## Test API
```
http://localhost:8001/docs → POST /predict-attendance
Sample: ml-backend/sample_data.json
```

## Firebase Setup
1. Firebase Console → Project Settings → Service Accounts
2. Download JSON → Replace `app.py` cred dict
3. Pull real data: `attendance` collection

## Features Extracted
```
avg_attendance, std, recent_mean, method_diversity, 
time_variance, weekend_ratio, points, streak
```

**Live Demo**: ML predictions in Analytics page (next step)

