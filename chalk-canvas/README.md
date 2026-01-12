# Chalk Canvas

AI-powered math problem-solving behavior analysis tool.

## Quick Start

### 1. Frontend (Next.js)

```bash
cd chalk-canvas
npm install
npm run dev
```

Opens at: http://localhost:3000

### 2. Backend (Python FastAPI)

```bash
cd chalk-canvas/backend
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

API docs at: http://localhost:8000/docs

## For Data Scientists

**You only need to edit one file:** `backend/core/analyzer.py`

The `analyze_solving_behavior()` function receives all stroke data from the canvas and returns the diagnosis result. The placeholder logic is already implemented using the PRD specs - modify the thresholds and add your own analysis!

### Data Schema

```python
{
    "session_id": "uuid",
    "problem_id": "math_001",
    "session_start": "2026-01-05T10:00:00",
    "strokes": [
        {
            "stroke_id": 1,
            "tool": "pen",       # or "eraser"
            "color": "#ffffff",
            "points": [
                {"t": 0.0, "x": 100, "y": 200, "pressure": 0.5, "type": "start"},
                {"t": 0.016, "x": 102, "y": 201, "pressure": 0.6, "type": "move"},
                ...
            ]
        }
    ]
}
```

### Derived Metrics (auto-calculated)

| Metric | Description |
|--------|-------------|
| `start_latency` | Time to first stroke (seconds) |
| `avg_stroke_speed` | Average writing speed (px/sec) |
| `pause_ratio` | Fraction of time not drawing |
| `erase_count` | Number of eraser strokes |
| `acceleration_end` | Speed change in final 20% |

## Tech Stack

- **Frontend:** Next.js 14 + TypeScript + Tailwind CSS
- **Backend:** FastAPI + Python 3.11+
- **Canvas:** HTML5 Canvas with Catmull-Rom spline interpolation
