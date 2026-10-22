# 🏧 Animals World Bank: Loan ATM (Credit Risk Predictor)

An ATM-style web app that predicts whether a loan applicant is a **high or low credit risk**.
Enter the applicant's details on the ATM screen, the padlock rattles, the iron rails slide open,
and a printed note drops out of the dispenser and gets stamped **LOW RISK** or **HIGH RISK**.

🔗 **Live demo:** [https://loan-giving-app.fastapicloud.dev/](https://loan-giving-app.fastapicloud.dev/)

## 📸 Preview

![Animals World Bank ATM: locked machine on the left, LOW RISK result on the right](<atm_side_by_side.png>)

*Left: the locked ATM waiting for an applicant. Right: the printed note stamped **LOW RISK**.*

👉 **[Try the ATM yourself](https://loan-giving-app.fastapicloud.dev/)**: enter an applicant, press ENTER, and watch the rails open.

## ✨ Features

- **Animated bank scene:** a monkey in a suit greets you, a turtle holds the "Customers Line" sign, and other animals work in the background
- **ATM interface:** screen, keypad and loan-decision dispenser, with a padlock and jail rails that open when the prediction arrives
- **Animated result:** the machine shakes, a paper note drops out of the dispenser and gets stamped **LOW RISK** or **HIGH RISK**
- **Sound and voice**, generated in the browser with no audio files:
  - Success chime and spoken approval for Low Risk
  - Siren, flashing red screen and warning voice for High Risk
- **Impatience timer:** after 10 seconds without a submission, the app asks you to hurry up because other customers are waiting
- **Automatic calculation** of `loan_percent_income` from loan amount ÷ income
- **Responsive layout** for mobile

## 🧱 Tech stack

| Layer    | Tools                                   |
|----------|-----------------------------------------|
| Backend  | FastAPI, Pydantic, Uvicorn              |
| ML       | scikit-learn pipeline, pandas, joblib   |
| Frontend | HTML, CSS, vanilla JavaScript, Web Audio API, Speech Synthesis |

## 📁 Files in this repo

```
loan_giving_app/
├── main.py                        # FastAPI app (serves the API and the frontend)
├── requirements.txt               # Python dependencies
├── Dockerfile                     # Container setup for deployment
├── .python-version                # Python version used by the host
├── credit_risk_model.pkl          # Trained scikit-learn pipeline
├── best_threshold.pkl             # Tuned decision threshold
├── grant_the_loan_on_the_go.ipynb # Notebook: data cleaning, training and threshold tuning
├── credit_risk_dataset.csv        # Training data
├── atm_side_by_side.png           # Preview image used in this README
└── static/
    ├── index.html
    ├── style.css
    └── script.js
```

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

Interactive docs are available at [`/docs`](https://loan-giving-app.fastapicloud.dev/docs).

## ☁️ Deployment

Deployed on FastAPI Cloud: https://loan-giving-app.fastapicloud.dev/

Start command for most other hosts (Render, Railway, etc.):

```bash
uvicorn main:app --host 0.0.0.0 --port $PORT
```

## ⚠️ Disclaimer

This is a learning project. Predictions come from a machine-learning model and should not be
used for real lending decisions.
