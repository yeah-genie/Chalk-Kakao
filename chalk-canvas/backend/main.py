"""
Chalk Canvas - FastAPI Backend

Run with: uvicorn main:app --reload --port 8000
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
from core.analyzer import analyze_solving_behavior

app = FastAPI(
    title="Chalk Canvas API",
    description="Backend for analyzing math problem-solving behavior",
    version="0.1.0"
)

# CORS configuration for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ============================================================
# Data Models (matches frontend types)
# ============================================================

class Point(BaseModel):
    t: float          # Timestamp (seconds from stroke start)
    x: float          # X coordinate
    y: float          # Y coordinate
    pressure: float   # Pressure (0-1)
    type: str         # 'start', 'move', 'end'


class Stroke(BaseModel):
    stroke_id: int
    tool: str         # 'pen' or 'eraser'
    color: str        # Hex color
    points: List[Point]


class SessionData(BaseModel):
    session_id: str
    problem_id: str
    session_start: str
    strokes: List[Stroke]


class AnalysisResult(BaseModel):
    diagnosis: str
    confidence: float
    details: str
    recommendations: Optional[List[str]] = None
    metrics: Optional[dict] = None


# ============================================================
# API Endpoints
# ============================================================

@app.get("/")
async def root():
    return {
        "message": "Chalk Canvas API is running",
        "version": "0.1.0",
        "docs": "/docs"
    }


@app.post("/api/analyze", response_model=AnalysisResult)
async def analyze_session(data: SessionData):
    """
    Analyze a problem-solving session from stroke data.
    
    This endpoint receives all stroke data from the frontend canvas
    and passes it to the analyzer function for processing.
    """
    try:
        # Convert to dict for the analyzer function
        session_dict = data.model_dump()
        
        # Call the analyzer (this is where DS logic lives)
        result = analyze_solving_behavior(session_dict)
        
        return AnalysisResult(**result)
    
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Analysis failed: {str(e)}"
        )


@app.get("/api/health")
async def health_check():
    return {"status": "healthy"}
