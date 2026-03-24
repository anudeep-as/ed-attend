import pandas as pd
import numpy as np
from sklearn.svm import OneClassSVM
from sklearn.ensemble import IsolationForest
from xgboost import XGBRegressor
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_squared_error
import joblib
from sklearn.preprocessing import StandardScaler

print("Generating synthetic attendance data for training...")
np.random.seed(42)

# Generate 1000 student attendance records
n_samples = 1000
data = {
    'student_id': np.random.choice(['CS2024001', 'CS2024002', 'CS2024003'], n_samples),
    'date': pd.date_range('2024-01-01', periods=n_samples, freq='D'),
    'status': np.random.choice([1.0, 0.0, 0.5], n_samples, p=[0.8, 0.15, 0.05]),  # 80% present
    'method': np.random.choice([0, 1, 2, 3], n_samples),  # 0:manual,1:BLE,2:face,3:fingerprint
    'time_hour': np.random.randint(8, 18, n_samples),
    'points': np.random.randint(0, 200, n_samples),
    'streak_days': np.random.randint(0, 15, n_samples),
    'weekend': np.random.choice([0, 1], n_samples, p=[0.7, 0.3])
}

df = pd.DataFrame(data)

# Feature engineering
def extract_features(df):
    features = pd.DataFrame({
        'avg_attendance': df.groupby('student_id')['status'].transform('mean'),
        'attendance_std': df.groupby('student_id')['status'].transform('std'),
        'recent_5_mean': df.groupby('student_id')['status'].transform(lambda x: x.tail(5).mean()),
        'method_diversity': df.groupby('student_id')['method'].transform('nunique'),
        'attendance_count': df.groupby('student_id').cumcount() + 1,
        'time_variance': df.groupby('student_id')['time_hour'].transform('std'),
        'weekend_ratio': df.groupby('student_id')['weekend'].transform('mean'),
        'points_avg': df.groupby('student_id')['points'].transform('mean'),
        'streak_factor': df.groupby('student_id')['streak_days'].transform('max')
    })
    return features.fillna(0)

X = extract_features(df).values

# SVM: Anomaly Detection (One-Class SVM)
print("Training SVM Anomaly Detector...")
svm_model = OneClassSVM(nu=0.1, kernel='rbf', gamma='scale')
svm_model.fit(X[:800])  # Train on normal data
joblib.dump(svm_model, 'models/svm_anomaly.pkl')
print("✓ SVM model saved")

# XGBoost: Next Attendance Prediction
print("Training XGBoost Predictor...")
# Create target: next day's attendance probability
y = df['status'].shift(-1).fillna(0.8).values  # Assume 80% if no next day

X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

xgb_model = XGBRegressor(n_estimators=100, learning_rate=0.1, max_depth=6, random_state=42)
xgb_model.fit(X_train, y_train)

# Evaluate
y_pred = xgb_model.predict(X_test)
rmse = np.sqrt(mean_squared_error(y_test, y_pred))
print(f"✓ XGBoost RMSE: {rmse:.4f}")

joblib.dump(xgb_model, 'models/xgb_predict.pkl')
print("✓ XGBoost model saved")

# Create models directory if needed
import os
os.makedirs('models', exist_ok=True)

print("\n✅ Training complete!")
print("Run: uvicorn app:app --reload --port 8001")
print("Test: http://localhost:8001/docs")

