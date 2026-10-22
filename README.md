# 🏧 Animals World Bank: Loan ATM (Credit Risk Predictor)

An ATM-style web app that predicts whether a loan applicant is a **high or low credit risk**.
Enter the applicant's details on the ATM screen, the padlock rattles, the iron rails slide open,
and a printed note drops out of the dispenser and gets stamped **LOW RISK** or **HIGH RISK**.

🔗 **Live demo:** _coming soon_ <!-- add your deployment link here -->

## ✨ Features

- Opening scene: a **monkey in a suit** walks in, waves and says *"Welcome to the bank! How may we help you with the loan today?"*
- A **turtle** stands at the front holding the **Customers Line** sign (it wobbles when the line gets impatient)
- Bank-hall background with animals at work: a rabbit typing, an owl counting coins, an elephant stamping forms, a fox on the phone and more
- ATM interface with a screen, keypad, loan-decision dispenser and brass-and-steel styling
- The whole machine **shakes** a little as the rails open
- Locked padlock and jail rails that open when the prediction arrives
- Vending-machine style paper note that drops down, then is stamped with the result
- Sounds (generated in the browser, no audio files):
  - Welcome chime, then the monkey's spoken greeting when the app starts
  - Success chime and "The loan can be given" for **Low Risk**
  - Emergency **siren**, flashing red screen and warning voice for **High Risk**
- After **10 seconds** without a submission: *"Other customers are waiting behind you. The rush is heavy, so please hurry a little."*
- `loan_percent_income` is calculated automatically from loan amount ÷ income
- Responsive layout for mobile

## 🧱 Tech stack

| Layer    | Tools                                   |
|----------|-----------------------------------------|
| Backend  | FastAPI, Pydantic, Uvicorn              |
| ML       | scikit-learn pipeline, pandas, joblib   |
| Frontend | HTML, CSS, vanilla JavaScript, Web Audio API, Speech Synthesis |

## 📁 Project structure

```
loan_atm/
├── main.py                  # FastAPI app (serves API and frontend)
├── requirements.txt
├── credit_risk_model.pkl    # ← your trained model (add this)
├── best_threshold.pkl       # ← your tuned threshold (add this)
└── static/
    ├── index.html
    ├── style.css
    └── script.js
```

> The two `.pkl` files come from your notebook. Place them next to `main.py`.

## 🚀 Run locally

```bash
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload
```

Open **http://127.0.0.1:8000** and click **"Insert card to enter the bank"**.
(Browsers block sound until you click once, which is why that button exists.)

## 🔌 API

`POST /predict`

```json
{
  "person_age": 28,
  "person_income": 60000,
  "person_home_ownership": "RENT",
  "person_emp_length": 4,
  "loan_intent": "PERSONAL",
  "loan_grade": "C",
  "loan_amnt": 10000,
  "loan_int_rate": 11.5,
  "loan_percent_income": 0.17,
  "cb_person_default_on_file": "N",
  "cb_person_cred_hist_length": 5
}
```

Response:

```json
{
  "default_probability": 0.12,
  "default_prediction": 0,
  "threshold": 0.35,
  "Result": "Low Risk"
}
```

Interactive docs are available at `/docs`.

## ☁️ Deployment

Start command for most hosts (Render, Railway, etc.):

```bash
uvicorn main:app --host 0.0.0.0 --port $PORT
```

Add your deployment link at the top of this README once it's live.

## ⚠️ Disclaimer

This is a learning project. Predictions come from a machine-learning model and should not be
used for real lending decisions.
