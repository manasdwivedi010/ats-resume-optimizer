import pytest
from app.services.ats_service import ats_evaluator
from app.core.security import generate_otp, hash_otp, verify_otp_hash, create_access_token, decode_access_token

def test_otp_security():
    otp = generate_otp()
    assert len(otp) == 6
    assert otp.isdigit()

    email = "test@example.com"
    hashed = hash_otp(otp, email)
    assert verify_otp_hash(otp, email, hashed) is True
    assert verify_otp_hash("000000", email, hashed) is False

def test_jwt_token():
    token = create_access_token({"sub": "candidate@example.com"})
    payload = decode_access_token(token)
    assert payload is not None
    assert payload["sub"] == "candidate@example.com"

def test_ats_scoring_under_90_triggers_flaws():
    """Test that a basic resume with missing skills and passive phrasing scores < 90% and lists flaws."""
    raw_resume_text = """
    John Doe
    Email: john@example.com | Phone: 555-123-4567
    
    Summary:
    Software engineer with some experience in web development.
    
    Experience:
    Junior Dev at Startup
    Worked on fixing bugs and helped with website maintenance.
    Handled user tickets and participated in team standups.
    
    Skills:
    HTML, CSS, JavaScript
    
    Education:
    B.S. in Computer Science, 2023
    """

    resume_data = {
        "raw_text": raw_resume_text,
        "word_count": len(raw_resume_text.split()),
        "bullet_count": 2,
        "contact": {"email": "john@example.com", "phone": "555-123-4567"},
        "sections": {
            "summary": "Software engineer with some experience in web development.",
            "experience": "Junior Dev at Startup. Worked on fixing bugs...",
            "skills": "HTML, CSS, JavaScript",
            "education": "B.S. in Computer Science, 2023"
        }
    }

    result = ats_evaluator.evaluate(
        resume_data=resume_data,
        target_role="Full Stack Developer"
    )

    # Must be below 90%
    assert result["overall_score"] < 90
    assert result["is_above_threshold"] is False

    # Must contain flaws
    assert len(result["flaws"]) > 0
    categories = [f["category"] for f in result["flaws"]]
    assert "Missing Target Skills" in categories
    assert "Weak Passive Phrasing" in categories

    # Missing skills must pinpoint full stack requirements like React, Node.js, Docker, etc.
    missing = result["skills_analysis"]["missing"]
    assert any("Docker" in s for s in missing)
    assert any("Node.Js" in s or "Node.js" in s for s in missing)

    # Must produce actionable recommendations
    assert len(result["recommendations"]) > 0

def test_ats_scoring_high_score():
    """Test that a well-crafted resume with metrics, power verbs, and complete role keywords scores highly."""
    optimized_text = """
    Jane Doe
    jane.doe@techcorp.io | (555) 987-6543 | linkedin.com/in/janedoe | github.com/janedoe
    
    Professional Summary:
    Full Stack Developer with 4+ years of experience architecting high-scale distributed applications using React, Node.js, TypeScript, PostgreSQL, and AWS.
    
    Technical Skills:
    React, Node.js, TypeScript, JavaScript, PostgreSQL, MongoDB, REST API, Docker, AWS, Git, Tailwind CSS, GraphQL, CI/CD, System Design, HTML5, CSS3, Agile, Collaboration
    
    Professional Experience:
    Senior Software Engineer | Tech Global | 2021 - Present
    - Architected microservices platform using Node.js and PostgreSQL, cutting API latency by 45% for 150,000+ daily users.
    - Engineered responsive React and Tailwind CSS web application, driving user retention by 28%.
    - Automated CI/CD deployment pipelines using Docker and AWS ECS, accelerating release velocity by 60%.
    - Spearheaded cross-functional team of 6 engineers, orchestrating agile sprints and mentoring junior developers.
    
    Education:
    Bachelor of Science in Software Engineering, 2020
    """

    resume_data = {
        "raw_text": optimized_text,
        "word_count": len(optimized_text.split()),
        "bullet_count": 5,
        "contact": {"email": "jane.doe@techcorp.io", "phone": "(555) 987-6543"},
        "sections": {
            "summary": "Full Stack Developer with 4+ years...",
            "skills": "React, Node.js, TypeScript, PostgreSQL, Docker, AWS...",
            "experience": "Senior Software Engineer... Architected microservices...",
            "education": "Bachelor of Science in Software Engineering, 2020"
        }
    }

    result = ats_evaluator.evaluate(
        resume_data=resume_data,
        target_role="Full Stack Developer"
    )

    assert result["overall_score"] >= 90
    assert result["is_above_threshold"] is True
    assert len(result["skills_analysis"]["present"]) >= 10
