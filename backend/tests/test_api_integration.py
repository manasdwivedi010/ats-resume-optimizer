import pytest
import io
from httpx import AsyncClient, ASGITransport
from app.main import app

@pytest.mark.anyio
async def test_full_auth_and_resume_scan_flow():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        # 1. Health check
        res = await client.get("/api/health")
        assert res.status_code == 200
        assert res.json()["status"] == "healthy"

        # 2. Request Email OTP
        email = "applicant.test@example.com"
        otp_res = await client.post("/api/auth/send-otp", json={"email": email})
        assert otp_res.status_code == 200
        data = otp_res.json()
        assert data["success"] is True
        # In dev mode, dev_otp is provided
        code = data["dev_otp"]
        assert code is not None

        # 3. Verify OTP
        verify_res = await client.post("/api/auth/verify-otp", json={"email": email, "otp": code})
        assert verify_res.status_code == 200
        auth_data = verify_res.json()
        assert "access_token" in auth_data
        token = auth_data["access_token"]

        headers = {"Authorization": f"Bearer {token}"}

        # 4. Verify /me endpoint
        me_res = await client.get("/api/auth/me", headers=headers)
        assert me_res.status_code == 200
        assert me_res.json()["user"]["email"] == email

        # 5. Test Resume Upload & ATS Analysis (< 90% case)
        sample_resume_content = b"""
        Alex Carter
        alex.carter@testmail.com | 555-019-2834
        
        Summary:
        Backend developer with experience in building web apps.
        
        Experience:
        Developer at WebCo | 2022 - 2024
        - Worked on server side logic and fixed database queries.
        - Responsible for maintaining endpoints and assisted team members.
        
        Skills:
        Python, SQL
        
        Education:
        B.S. in Computer Science
        """

        files = {
            "file": ("alex_carter_resume.txt", io.BytesIO(sample_resume_content), "text/plain")
        }
        form_data = {
            "target_role": "Backend Developer",
            "job_description": "We need an engineer experienced with Node.js, FastAPI, Docker, Kubernetes, Redis, AWS, and Microservices."
        }

        analyze_res = await client.post(
            "/api/ats/analyze",
            headers=headers,
            data=form_data,
            files=files
        )
        assert analyze_res.status_code == 200
        scan_output = analyze_res.json()
        assert scan_output["success"] is True
        ats_data = scan_output["data"]

        # Verify < 90% flaw recommendation behavior
        assert ats_data["overall_score"] < 90
        assert ats_data["is_above_threshold"] is False
        assert len(ats_data["flaws"]) > 0
        assert len(ats_data["recommendations"]) > 0
        assert "Docker" in ats_data["skills_analysis"]["missing"] or "Kubernetes" in ats_data["skills_analysis"]["missing"]

        # 6. Verify scan history persistence
        history_res = await client.get("/api/ats/history", headers=headers)
        assert history_res.status_code == 200
        history = history_res.json()["scans"]
        assert len(history) >= 1
        assert history[0]["target_role"] == "Backend Developer"
