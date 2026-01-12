"""
╔══════════════════════════════════════════════════════════════════════════════╗
║                                                                              ║
║   🎯 CHALK CANVAS - BEHAVIOR ANALYZER                                        ║
║                                                                              ║
║   데이터 사이언티스트(DS)가 수정할 핵심 함수입니다.                                 ║
║   This is the ONLY file the Data Scientist needs to modify.                  ║
║                                                                              ║
╚══════════════════════════════════════════════════════════════════════════════╝
"""

from typing import Dict, List, Any
import math


def analyze_solving_behavior(stroke_data: Dict[str, Any]) -> Dict[str, Any]:
    """
    ╔════════════════════════════════════════════════════════════════════════╗
    ║  [DATA SCIENTIST: EDIT THIS FUNCTION]                                  ║
    ║                                                                        ║
    ║  이 함수가 프론트엔드의 캔버스 데이터를 받아 분석 결과를 반환합니다.          ║
    ║  아래 placeholder 로직을 실제 분석 알고리즘으로 교체하세요.                  ║
    ╚════════════════════════════════════════════════════════════════════════╝
    
    Args:
        stroke_data: Complete session data from frontend canvas
        
        Example structure:
        {
            "session_id": "uuid-string",
            "problem_id": "demo_problem_001",
            "session_start": "2026-01-05T10:00:00",
            "strokes": [
                {
                    "stroke_id": 1,
                    "tool": "pen",
                    "color": "#ffffff",
                    "points": [
                        {"t": 0.0, "x": 100, "y": 200, "pressure": 0.5, "type": "start"},
                        {"t": 0.016, "x": 102, "y": 201, "pressure": 0.6, "type": "move"},
                        {"t": 0.5, "x": 150, "y": 250, "pressure": 0.5, "type": "end"},
                    ]
                },
                ...
            ]
        }
    
    Returns:
        dict with the following structure:
        {
            "diagnosis": "CONCEPT_GAP" | "HESITATION" | "TIME_PRESSURE" | "MISTAKE",
            "confidence": float (0-1),
            "details": str,
            "recommendations": List[str] (optional),
            "metrics": {
                "start_latency": float,
                "avg_stroke_speed": float,
                "pause_ratio": float,
                "erase_count": int,
                "total_time": float,
            } (optional)
        }
    """
    
    # =========================================================================
    # STEP 1: Extract derived features (파생 변수 추출)
    # =========================================================================
    
    strokes = stroke_data.get("strokes", [])
    
    if not strokes:
        return {
            "diagnosis": "ERROR",
            "confidence": 0.0,
            "details": "No strokes detected. Please write something on the canvas.",
            "recommendations": ["Try drawing your solution before submitting."]
        }
    
    # Calculate basic metrics
    metrics = calculate_metrics(strokes)
    
    # =========================================================================
    # STEP 2: Rule-based diagnosis (규칙 기반 진단)
    # =========================================================================
    
    diagnosis, confidence, details, recommendations = apply_diagnostic_rules(metrics)
    
    return {
        "diagnosis": diagnosis,
        "confidence": confidence,
        "details": details,
        "recommendations": recommendations,
        "metrics": metrics
    }


def calculate_metrics(strokes: List[Dict]) -> Dict[str, Any]:
    """
    Calculate derived features from raw stroke data.
    
    파생 변수 정의 (PRD 기준):
    - start_latency: 첫 획까지의 시간
    - avg_stroke_speed: 평균 필기 속도 (px/sec)
    - pause_ratio: 멈춤 시간 비율
    - erase_count: 지우개 사용 횟수
    - acceleration_end: 후반부 가속도
    """
    
    # Separate pen strokes and eraser strokes
    pen_strokes = [s for s in strokes if s.get("tool") == "pen"]
    eraser_strokes = [s for s in strokes if s.get("tool") == "eraser"]
    
    # 1. Start latency (첫 획까지 걸린 시간)
    # Note: For MVP, we assume first stroke starts at t=0
    # In real implementation, compare with problem load time
    first_stroke_start = pen_strokes[0]["points"][0]["t"] if pen_strokes else 0
    start_latency = first_stroke_start
    
    # 2. Calculate total drawing time and stroke speeds
    total_time = 0
    total_distance = 0
    total_drawing_time = 0
    stroke_speeds = []
    
    for stroke in pen_strokes:
        points = stroke.get("points", [])
        if len(points) < 2:
            continue
        
        stroke_distance = 0
        stroke_time = points[-1]["t"] - points[0]["t"]
        
        for i in range(1, len(points)):
            dx = points[i]["x"] - points[i-1]["x"]
            dy = points[i]["y"] - points[i-1]["y"]
            stroke_distance += math.sqrt(dx*dx + dy*dy)
        
        if stroke_time > 0:
            stroke_speeds.append(stroke_distance / stroke_time)
        
        total_distance += stroke_distance
        total_drawing_time += stroke_time
        
        # Update total session time
        if points[-1]["t"] > total_time:
            total_time = points[-1]["t"]
    
    # 3. Average stroke speed
    avg_stroke_speed = sum(stroke_speeds) / len(stroke_speeds) if stroke_speeds else 0
    
    # 4. Pause ratio (time not drawing / total time)
    # Estimate pauses as time between strokes
    pause_time = 0
    all_pen_points = []
    for stroke in pen_strokes:
        if stroke.get("points"):
            all_pen_points.extend([
                (p["t"], "start" if i == 0 else ("end" if i == len(stroke["points"])-1 else "mid"))
                for i, p in enumerate(stroke["points"])
            ])
    
    # Sort by time and calculate gaps
    if len(pen_strokes) > 1:
        for i in range(1, len(pen_strokes)):
            prev_end = pen_strokes[i-1]["points"][-1]["t"]
            curr_start = pen_strokes[i]["points"][0]["t"]
            pause_time += max(0, curr_start - prev_end)
    
    pause_ratio = pause_time / total_time if total_time > 0 else 0
    
    # 5. Erase count
    erase_count = len(eraser_strokes)
    
    # 6. Acceleration at end (후반 20% 속도 변화)
    acceleration_end = 0
    if len(stroke_speeds) >= 5:
        end_portion = int(len(stroke_speeds) * 0.2) or 1
        early_avg = sum(stroke_speeds[:-end_portion]) / (len(stroke_speeds) - end_portion)
        late_avg = sum(stroke_speeds[-end_portion:]) / end_portion
        if early_avg > 0:
            acceleration_end = late_avg / early_avg
    
    return {
        "start_latency": round(start_latency, 2),
        "avg_stroke_speed": round(avg_stroke_speed, 1),
        "pause_ratio": round(pause_ratio, 3),
        "erase_count": erase_count,
        "acceleration_end": round(acceleration_end, 2),
        "total_time": round(total_time, 2),
        "total_strokes": len(pen_strokes),
        "total_distance": round(total_distance, 0)
    }


def apply_diagnostic_rules(metrics: Dict[str, Any]) -> tuple:
    """
    Apply rule-based diagnosis logic.
    
    PRD에 정의된 진단 규칙:
    - Case A: 개념 부족 (Concept Gap)
    - Case B: 멘탈 붕괴/방황 (Hesitation)
    - Case C: 시간 부족 (Time Pressure)
    - Case D: 계산 실수 (Mistake)
    
    ⚠️ TODO: 이 threshold 값들은 실제 데이터로 튜닝해야 합니다!
    """
    
    start_latency = metrics.get("start_latency", 0)
    avg_stroke_speed = metrics.get("avg_stroke_speed", 0)
    pause_ratio = metrics.get("pause_ratio", 0)
    erase_count = metrics.get("erase_count", 0)
    acceleration_end = metrics.get("acceleration_end", 1)
    total_strokes = metrics.get("total_strokes", 0)
    total_time = metrics.get("total_time", 0)
    
    # =========================================================================
    # CASE A: Concept Gap (개념 부족)
    # - 오래 멍하니 있음 (start_latency > 40초)
    # - 거의 안 씀 (total_strokes < 5)
    # - 멈춤이 너무 많음 (pause_ratio > 70%)
    # =========================================================================
    if start_latency > 40 or total_strokes < 5 or pause_ratio > 0.7:
        return (
            "CONCEPT_GAP",
            0.85,
            f"You seem to have difficulty starting or continuing the problem. "
            f"Start latency was {start_latency:.1f}s, and pause ratio was {pause_ratio*100:.0f}%.",
            [
                "Review the foundational concepts for this problem type.",
                "Try solving similar but easier problems first.",
                "Consider watching a tutorial on this topic."
            ]
        )
    
    # =========================================================================
    # CASE B: Hesitation (멘탈 붕괴/방황)
    # - 지우개 많이 씀 (erase_count > 5)
    # - 속도 변동이 큼 (추후 구현)
    # =========================================================================
    if erase_count > 5:
        return (
            "HESITATION",
            0.78,
            f"You erased {erase_count} times, suggesting uncertainty about your approach. "
            f"This indicates you may be second-guessing your solution strategy.",
            [
                "Practice similar problems to build confidence.",
                "Before starting, spend 30 seconds planning your approach.",
                "Don't be afraid to commit to one method."
            ]
        )
    
    # =========================================================================
    # CASE C: Time Pressure (시간 부족)
    # - 마지막에 급격히 빨라짐 (acceleration_end > 1.5)
    # =========================================================================
    if acceleration_end > 1.5:
        return (
            "TIME_PRESSURE",
            0.72,
            f"Your writing speed increased by {(acceleration_end-1)*100:.0f}% in the final section. "
            f"This pattern suggests you were rushing to finish.",
            [
                "Practice time management: allocate time per problem.",
                "Learn to skip and return to difficult problems.",
                "Work on improving calculation speed."
            ]
        )
    
    # =========================================================================
    # CASE D: Simple Mistake (단순 실수) - Default case
    # - 빠르게 시작 (start_latency < 10초)
    # - 일정하고 빠른 속도
    # - 멈춤 적음
    # =========================================================================
    if start_latency < 10 and pause_ratio < 0.3:
        return (
            "MISTAKE",
            0.65,
            f"You started quickly ({start_latency:.1f}s) and wrote steadily. "
            f"If this was incorrect, it's likely a careless calculation error.",
            [
                "Double-check your arithmetic.",
                "Read the question again before answering.",
                "Take a breath before clicking submit."
            ]
        )
    
    # =========================================================================
    # Default: Neutral analysis
    # =========================================================================
    return (
        "ANALYSIS_COMPLETE",
        0.50,
        f"Analysis complete. Total time: {total_time:.1f}s, {total_strokes} strokes recorded.",
        [
            "Review your work carefully.",
            "Compare with practice problems."
        ]
    )


# ============================================================================
# [DS: Add your custom analysis functions below]
# ============================================================================

# def calculate_stroke_variance(strokes):
#     """Calculate how much the stroke speed varies."""
#     pass

# def detect_scratch_out_pattern(strokes):
#     """Detect if user is scratching out previous work."""
#     pass

# def analyze_spatial_distribution(strokes):
#     """Analyze where on the canvas the user writes most."""
#     pass
