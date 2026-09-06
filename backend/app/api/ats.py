from typing import Optional
from datetime import datetime, timezone
from fastapi import APIRouter, UploadFile, File, Form, Depends, HTTPException, status
from app.services.parser_service import parser_service
from app.services.ats_service import ats_evaluator, ROLE_SKILL_BANK
from app.db.mongodb import db_manager
from app.api.deps import get_current_user

router = APIRouter(prefix="/ats", tags=["ATS Evaluation"])

@router.get("/roles")
async def get_supported_roles():
    """Returns the list of curated target roles and popular options."""
    roles = [
        {"id": "software engineer", "title": "Software Engineer"},
        {"id": "full stack developer", "title": "Full Stack Developer"},
        {"id": "frontend developer", "title": "Frontend Developer"},
        {"id": "backend developer", "title": "Backend Developer"},
        {"id": "data scientist", "title": "Data Scientist"},
        {"id": "machine learning engineer", "title": "Machine Learning Engineer"},
        {"id": "devops engineer", "title": "DevOps Engineer"},
        {"id": "data analyst", "title": "Data Analyst"},
        {"id": "product manager", "title": "Product Manager"},
        {"id": "cybersecurity analyst", "title": "Cybersecurity Analyst"},
    ]
    return {"roles": roles}

@router.post("/analyze")
async def analyze_resume(
    file: UploadFile = File(...),
    target_role: str = Form(...),
    job_description: Optional[str] = Form(""),
    current_user: dict = Depends(get_current_user)
):
    """
    Parses an uploaded resume (.pdf or .docx), compares against the target role
    and optional job description, calculates the ATS score (0-100), and produces
    detailed flaw diagnostics & recommendations if score < 90%.
    """
    if not file.filename:
        raise HTTPException(status_code=400, detail="No file provided.")

    allowed_exts = (".pdf", ".docx", ".doc", ".txt")
    if not file.filename.lower().endswith(allowed_exts):
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported format. Please upload one of: {', '.join(allowed_exts)}"
        )

    # Read bytes
    content = await file.read()
    if len(content) > 10 * 1024 * 1024:  # 10MB limit
        raise HTTPException(status_code=400, detail="File too large (max 10MB).")

    try:
        parsed_resume = parser_service.parse_resume(content, file.filename)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"Failed to extract text from resume: {str(e)}"
        )

    # Run ATS evaluation
    evaluation = ats_evaluator.evaluate(
        resume_data=parsed_resume,
        target_role=target_role,
        job_description=job_description or ""
    )

    # Store in MongoDB
    scan_record = {
        "user_email": current_user.get("email"),
        "filename": file.filename,
        "target_role": target_role,
        "job_description_snippet": (job_description[:300] + "...") if job_description and len(job_description) > 300 else job_description,
        "overall_score": evaluation["overall_score"],
        "is_above_threshold": evaluation["is_above_threshold"],
        "threshold": evaluation["threshold"],
        "breakdown": evaluation["breakdown"],
        "flaws": evaluation["flaws"],
        "missing_skills": evaluation["skills_analysis"]["missing"],
        "present_skills": evaluation["skills_analysis"]["present"],
        "recommendations": evaluation["recommendations"],
        "contact_detected": evaluation["contact_detected"],
        "sections": evaluation.get("sections", {}),
        "raw_text": evaluation.get("raw_text", ""),
        "word_count": evaluation["word_count"],
        "bullet_count": evaluation["bullet_count"],
        "created_at": datetime.now(timezone.utc).isoformat()
    }

    scan_id = await db_manager.save_scan(scan_record)
    evaluation["scan_id"] = scan_id

    return {
        "success": True,
        "data": evaluation
    }

@router.get("/history")
async def get_scan_history(current_user: dict = Depends(get_current_user)):
    """Fetches past scans for the logged-in candidate."""
    scans = await db_manager.get_user_scans(current_user.get("email"))
    return {"success": True, "scans": scans}

@router.get("/history/{scan_id}")
async def get_scan_detail(scan_id: str, current_user: dict = Depends(get_current_user)):
    """Fetches details of a specific past scan."""
    scan = await db_manager.get_scan_by_id(scan_id, current_user.get("email"))
    if not scan:
        raise HTTPException(status_code=404, detail="Scan report not found.")
    return {"success": True, "scan": scan}
