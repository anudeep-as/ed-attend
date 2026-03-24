#!/bin/bash
echo "Setting up ML Backend..."
python -m venv venv
source venv/bin/activate  # Linux/Mac
# Windows: venv\Scripts\activate

pip install -r requirements.txt
mkdir -p models

echo "✅ Setup complete!"
echo "1. Train: python train.py"
echo "2. Run: uvicorn app:app --reload --port 8001"
echo "3. Test: http://localhost:8001/docs"

