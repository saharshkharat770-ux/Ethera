# ETHERA: AI-Powered Fuel Intelligence, E85 Mileage Prediction & Sustainable Mobility Platform

> **"Know Your Range. Master Your Fuel."**  
> *Academic Entrepreneurship Development Project · Production Architecture*

---

## 1. Executive Summary & Problem Space
Drivers of Flex-Fuel Vehicles (FFVs) using E85 face three core challenges:
1. **Volumetric Energy Density Deficit:** E85 contains ~81,800 BTU/gal compared to ~114,000 BTU/gal for E10 gasoline (~24–28% lower energy content). Factory fuel economy displays are calibrated for gasoline, causing unexpected range drops and driver anxiety.
2. **Deceptive Pump Price Parity:** Drivers often assume E85 is cheaper based on pump price alone. In reality, E85 is only economical when:
   $$\text{Price}_{\text{E85}} \le \text{Price}_{\text{Gas}} \times \left( \frac{\text{MPG}_{\text{E85}}}{\text{MPG}_{\text{Gas}}} \right)$$
3. **Severe Station Scarcity:** With fewer than 5,000 public E85 stations in the United States, planning interstate journeys requires automated range safety buffers and corridor refueling suggestions.

**ETHERA** solves this by unifying calibrated machine learning regression, aerodynamic and thermodynamic physics, geospatial station networks, and evidence-based life-cycle carbon tracking (Argonne GREET model).

---

## 2. Technical Stack
- **Frontend:** Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS, Lucide Icons, Recharts, Framer Motion, Leaflet with CartoDB Dark Matter tiles.
- **Backend:** Python 3.11+, FastAPI, Pydantic v2, SQLAlchemy 2.x, SQLite / PostgreSQL.
- **Security:** Argon2id password hashing, PyJWT bearer token authentication, scoped vehicle isolation.
- **AI/ML Engine:** Calibrated physics baseline + `GradientBoostingRegressor` (140 estimators, max depth 4) with empirical residual standard deviation for 90% confidence intervals ($z = 1.645$).
- **Spatial Engine:** Spherical Haversine trigonometric indexing across pre-seeded nationwide E85 fuel stations.

---

## 3. Quick Start & Execution

### Option A: Dual-Process Local Launch
In separate terminal windows:

**1. Launch Backend API:**
```bash
cd backend
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```
- Interactive API Docs: `http://127.0.0.1:8000/docs`

**2. Launch Frontend:**
```bash
cd frontend
npm run dev
```
- Public Landing Page: `http://localhost:3000`
- Cockpit Dashboard: `http://localhost:3000/dashboard`

### Option B: One-Click Windows Launcher
Double-click `start_dev.bat` or run:
```powershell
.\start_dev.bat
```

---

## 4. Testing & Verification
ETHERA comes with an automated test suite including:
- Standard Pytest suite (`pytest tests/test_ethera_api.py -v`)
- **20x Monte Carlo Load Test Harness (`tests/run_20x_stress_test.py`)** evaluating all 5 core functions 20 consecutive times under varying thermodynamic, weight, elevation, and price loads (100 total executions, 100% pass rate).
