import re
from typing import Dict, Any, List, Set, Tuple

# Curated role-specific knowledge bank of essential skills, tools, and keywords
ROLE_SKILL_BANK = {
    "software engineer": [
        "python", "java", "c++", "data structures", "algorithms", "git", "rest api", "sql",
        "ci/cd", "unit testing", "system design", "microservices", "docker", "agile", "debugging"
    ],
    "frontend developer": [
        "react", "javascript", "typescript", "html5", "css3", "tailwind css", "next.js",
        "redux", "responsive design", "web performance", "rest api", "graphql", "webpack", "vite", "git"
    ],
    "backend developer": [
        "node.js", "python", "golang", "java", "fastapi", "django", "express", "postgresql",
        "mongodb", "redis", "docker", "kubernetes", "rest api", "graphql", "microservices", "aws", "jwt", "sql"
    ],
    "full stack developer": [
        "react", "node.js", "typescript", "javascript", "postgresql", "mongodb", "rest api",
        "docker", "aws", "git", "tailwind css", "graphql", "ci/cd", "system design", "html5", "css3"
    ],
    "data scientist": [
        "python", "r", "machine learning", "deep learning", "pandas", "numpy", "scikit-learn",
        "tensorflow", "pytorch", "sql", "data visualization", "tableau", "statistics", "feature engineering", "nlp"
    ],
    "machine learning engineer": [
        "python", "pytorch", "tensorflow", "mlops", "docker", "kubernetes", "data pipelines",
        "model deployment", "cuda", "feature store", "scikit-learn", "hugging face", "transformer", "git"
    ],
    "devops engineer": [
        "docker", "kubernetes", "aws", "terraform", "ci/cd", "jenkins", "github actions",
        "linux", "bash", "ansible", "prometheus", "grafana", "helm", "cloudformation", "networking"
    ],
    "data analyst": [
        "sql", "excel", "power bi", "tableau", "python", "data cleaning", "statistics",
        "dashboards", "business intelligence", "etl", "reporting", "stakeholder communication"
    ],
    "product manager": [
        "product strategy", "roadmap", "agile", "scrum", "user stories", "kpis", "a/b testing",
        "user research", "wireframing", "jira", "market analysis", "cross-functional leadership"
    ],
    "cybersecurity analyst": [
        "network security", "siem", "incident response", "vulnerability assessment", "firewalls",
        "penetration testing", "linux", "wireshark", "compliance", "soc", "nist", "threat analysis"
    ]
}

# Strong action verbs favored by ATS scanners
POWER_ACTION_VERBS = [
    "architected", "engineered", "spearheaded", "accelerated", "optimized", "implemented",
    "designed", "developed", "automated", "streamlined", "delivered", "deployed", "scaled",
    "reduced", "increased", "orchestrated", "transformed", "mentored", "maximized", "integrated"
]

WEAK_PASSIVE_VERBS = [
    "worked on", "responsible for", "helped with", "assisted in", "handled", "participated in",
    "tried to", "did tasks", "was involved in", "part of the team that"
]

class ATSEvaluationService:
    @staticmethod
    def extract_keywords_from_text(text: str) -> Set[str]:
        """Extracts technical terms and alphanumeric skills from text."""
        cleaned = text.lower()
        tokens = re.findall(r"\b[a-z0-9\.\+#\-]{2,}\b", cleaned)
        keywords = set(tokens)
        
        phrases = [
            "data structures", "machine learning", "deep learning", "system design",
            "rest api", "responsive design", "web performance", "ci/cd", "tailwind css",
            "next.js", "unit testing", "feature engineering", "cross-functional leadership",
            "product strategy", "network security", "incident response"
        ]
        for phrase in phrases:
            if phrase in cleaned:
                keywords.add(phrase)
                
        return keywords

    @staticmethod
    def evaluate(
        resume_data: Dict[str, Any],
        target_role: str,
        job_description: str = ""
    ) -> Dict[str, Any]:
        raw_text = resume_data["raw_text"].lower()
        word_count = resume_data.get("word_count", 0)
        sections = resume_data.get("sections", {})
        contact = resume_data.get("contact", {})
        bullet_count = resume_data.get("bullet_count", 0)

        # 1. Determine Target Required Skills
        matched_role_key = None
        target_skills: Set[str] = set()
        
        # Check standard role bank
        role_lower = target_role.lower().strip()
        for bank_key, bank_skills in ROLE_SKILL_BANK.items():
            if bank_key in role_lower or role_lower in bank_key:
                matched_role_key = bank_key
                target_skills.update(bank_skills)
                break
        
        if not target_skills and ROLE_SKILL_BANK:
            target_skills.update(ROLE_SKILL_BANK["software engineer"])

        # Extract extra skills if user provided custom job description
        if job_description.strip():
            jd_keywords = ATSEvaluationService.extract_keywords_from_text(job_description)
            for k in jd_keywords:
                if len(k) > 2 and (k in target_skills or any(k in s for s in ROLE_SKILL_BANK.values())):
                    target_skills.add(k)

        # 2. Hard Skills Match (Max 40 points)
        present_skills = []
        missing_skills = []
        for skill in target_skills:
            pattern = r"(?:\b|_)" + re.escape(skill) + r"(?:\b|_)"
            if re.search(pattern, raw_text):
                present_skills.append(skill.title())
            else:
                missing_skills.append(skill.title())

        total_skills_count = len(target_skills) if target_skills else 1
        skill_ratio = len(present_skills) / total_skills_count
        hard_skills_score = round(skill_ratio * 40, 1)

        # 3. Experience & Title Alignment (Max 25 points)
        exp_text = (sections.get("experience", "") + " " + sections.get("summary", "")).lower() or raw_text
        exp_score = 15.0  # baseline
        # Check role title words in experience or summary
        role_words = [w for w in role_lower.split() if len(w) > 2]
        if any(w in exp_text for w in role_words) or any(w in raw_text for w in role_words):
            exp_score += 5.0
        # Check years/duration indicators (e.g. 2021-2024, 4+ years)
        if re.search(r"\b(19|20)\d{2}\b", raw_text) or re.search(r"\b\d+\+?\s*years?\b", raw_text):
            exp_score += 5.0
        exp_score = min(25.0, exp_score)

        # 4. Action Verbs & Metrics (Max 15 points)
        action_verb_count = 0
        for verb in POWER_ACTION_VERBS:
            if re.search(r"\b" + verb + r"\b", raw_text):
                action_verb_count += 1
        
        # Regex matching percentages (45%), multiplier (10x), currency ($50k), counts (150,000+ or 50+ users)
        metrics_pattern = re.compile(
            r"(?:\b\d+(?:\.\d+)?%|\b\d+x\b|\$\s*\d+(?:,\d+)?|\b\d+(?:,\d+)?\+\s*|\b\d+\s*(?:ms|k|m|million|users|clients|percent)\b)",
            re.IGNORECASE
        )
        metrics_matches = metrics_pattern.findall(raw_text)
        metrics_count = len(metrics_matches)

        action_score = min(8.0, action_verb_count * 1.5)
        metric_score = min(7.0, metrics_count * 1.5)
        verbs_and_metrics_score = round(action_score + metric_score, 1)

        # 5. Soft Skills & Industry Terms (Max 10 points)
        soft_skills_bank = ["collaboration", "communication", "leadership", "problem solving", "mentoring", "agile", "cross-functional"]
        soft_matches = [s for s in soft_skills_bank if s in raw_text]
        soft_skills_score = round(min(10.0, (len(soft_matches) / 3) * 10), 1)

        # 6. Formatting & ATS Parsability (Max 10 points)
        formatting_score = 0.0
        if 250 <= word_count <= 1100:
            formatting_score += 3.0
        elif word_count > 100:
            formatting_score += 1.5

        # Section structure check
        standard_sections = ["skills", "experience", "education"]
        sections_found_count = sum(1 for s in standard_sections if s in sections)
        formatting_score += (sections_found_count / len(standard_sections)) * 4.0

        # Bullet points check
        if bullet_count >= 4:
            formatting_score += 2.0
        elif bullet_count >= 1:
            formatting_score += 1.0

        # Contact info check (Email + Phone)
        if contact.get("email") and contact.get("phone"):
            formatting_score += 1.0
        elif contact.get("email"):
            formatting_score += 0.5
        formatting_score = round(min(10.0, formatting_score), 1)

        # Total Calculation
        overall_score = round(
            hard_skills_score + exp_score + verbs_and_metrics_score + soft_skills_score + formatting_score
        )
        overall_score = max(0, min(100, overall_score))
        is_above_threshold = overall_score >= 90

        # 7. Flaw Detection & Recommendation Generation
        flaws: List[Dict[str, Any]] = []
        recommendations: List[Dict[str, Any]] = []

        # A. Missing skills flaws
        if missing_skills:
            severity = "High" if len(missing_skills) > 4 else "Medium"
            top_missing = missing_skills[:6]
            flaws.append({
                "category": "Missing Target Skills",
                "severity": severity,
                "description": f"Your resume is missing {len(missing_skills)} key skills expected for a {target_role}: {', '.join(top_missing)}."
            })
            recommendations.append({
                "section": "Technical Skills & Summary",
                "priority": "Critical",
                "advice": f"Integrate priority keywords ({', '.join(top_missing[:4])}) into your 'Skills' table and reference them in your recent project bullet points.",
                "example_rewrite": f"Add to your Skills section: 'Tools & Technologies: {', '.join(top_missing[:4])}'"
            })

        # B. Passive verbs detection
        passive_found = [p for p in WEAK_PASSIVE_VERBS if p in raw_text]
        if passive_found:
            flaws.append({
                "category": "Weak Passive Phrasing",
                "severity": "Medium",
                "description": f"Found passive expressions like '{passive_found[0]}'. ATS algorithms prioritize active accomplishments."
            })
            recommendations.append({
                "section": "Experience Bullets",
                "priority": "High",
                "advice": "Replace passive phrases with high-impact power verbs such as 'Architected', 'Engineered', 'Optimized', or 'Automated'.",
                "example_rewrite": "Before: 'Responsible for building the user interface'\nAfter: 'Architected responsive frontend components with React, accelerating page load speeds by 32%.'"
            })

        # C. Lack of quantified metrics
        if metrics_count < 3:
            flaws.append({
                "category": "Lack of Quantified Impact",
                "severity": "High",
                "description": f"Only {metrics_count} numerical metric(s) found. High-ranking ATS resumes use numbers (%, $, latency, user scale) to validate achievements."
            })
            recommendations.append({
                "section": "Work Experience",
                "priority": "High",
                "advice": "Add measurable outcomes to at least 3 bullet points using the XYZ formula: 'Accomplished [X] as measured by [Y], by doing [Z]'.",
                "example_rewrite": "Example: 'Optimized PostgreSQL database queries and indexing, cutting API response times from 450ms to 120ms for 50,000+ daily active users.'"
            })

        # D. Section & Structure flaws
        missing_std_sections = [s.capitalize() for s in standard_sections if s not in sections]
        if missing_std_sections:
            flaws.append({
                "category": "Missing Standard ATS Sections",
                "severity": "High",
                "description": f"Could not clearly identify standard section headers: {', '.join(missing_std_sections)}."
            })
            recommendations.append({
                "section": "Document Layout",
                "priority": "Medium",
                "advice": f"Use standard headings ({', '.join(missing_std_sections)}) rather than creative titles so ATS parsers can categorize your data accurately.",
                "example_rewrite": "Use clear single-column markdown or bold headings like 'EXPERIENCE', 'SKILLS', 'EDUCATION'."
            })

        # E. Bullet point check
        if bullet_count < 4:
            flaws.append({
                "category": "Formatting / Bullet Structure",
                "severity": "Medium",
                "description": "Resume has very few standard bullet points. ATS parsers read bulleted accomplishments significantly better than long paragraphs."
            })
            recommendations.append({
                "section": "Typography & Formatting",
                "priority": "Medium",
                "advice": "Break dense paragraphs into 3-5 concise bullet points per role.",
                "example_rewrite": "Use standard bullet symbols (• or -) with one action verb and outcome per bullet point."
            })

        # F. Word count flaw
        if word_count < 300:
            flaws.append({
                "category": "Resume Length / Depth",
                "severity": "Medium",
                "description": f"Resume is brief ({word_count} words). A competitive tech resume typically contains 400 - 800 words."
            })
        elif word_count > 1200:
            flaws.append({
                "category": "Resume Length / Conciseness",
                "severity": "Low",
                "description": f"Resume is lengthy ({word_count} words). Consider condensing to 1-2 pages of high-relevance experience."
            })

        # G. Contact info check
        if not contact.get("email"):
            flaws.append({
                "category": "Missing Email Address",
                "severity": "High",
                "description": "ATS parser could not detect a valid email address."
            })
        if not contact.get("phone"):
            flaws.append({
                "category": "Missing Phone Number",
                "severity": "Medium",
                "description": "No recognizable phone number detected in header."
            })

        # Role-specific tailored recommendations
        role_specific_upskill = {
            "software engineer": "Focus on System Design, CI/CD automated pipelines, and cloud deployment (AWS/GCP).",
            "frontend developer": "Highlight TypeScript, Next.js App Router, state management, and Core Web Vitals optimization.",
            "backend developer": "Highlight distributed caching (Redis), message queues (Kafka/RabbitMQ), and API security (OAuth/JWT).",
            "full stack developer": "Demonstrate end-to-end ownership: database design, robust REST/GraphQL APIs, and responsive React/Vue UI.",
            "data scientist": "Include production ML deployments, A/B testing frameworks, and quantifiable model lift metrics.",
            "devops engineer": "Emphasize Infrastructure as Code (Terraform), Kubernetes cluster orchestration, and GitOps.",
            "data analyst": "Spotlight executive dashboard creations, SQL data modeling, and business KPI revenue impacts.",
            "product manager": "Quantify user retention gains, feature adoption rates, and Agile roadmapping triumphs."
        }

        role_advice = role_specific_upskill.get(
            role_lower,
            f"Tailor experience bullets specifically to match technical prerequisites for {target_role}."
        )
        recommendations.append({
            "section": f"Strategic Upgrade for {target_role}",
            "priority": "Informational",
            "advice": role_advice,
            "example_rewrite": "Review top job listings for this role and ensure at least 80% of required technical qualifications appear explicitly in your resume."
        })

        return {
            "overall_score": overall_score,
            "is_above_threshold": is_above_threshold,
            "threshold": 90,
            "target_role": target_role,
            "word_count": word_count,
            "bullet_count": bullet_count,
            "breakdown": {
                "hard_skills": {
                    "score": hard_skills_score,
                    "max": 40,
                    "percentage": round((hard_skills_score / 40) * 100)
                },
                "experience": {
                    "score": exp_score,
                    "max": 25,
                    "percentage": round((exp_score / 25) * 100)
                },
                "action_verbs_and_metrics": {
                    "score": verbs_and_metrics_score,
                    "max": 15,
                    "percentage": round((verbs_and_metrics_score / 15) * 100)
                },
                "soft_skills": {
                    "score": soft_skills_score,
                    "max": 10,
                    "percentage": round((soft_skills_score / 10) * 100)
                },
                "formatting": {
                    "score": formatting_score,
                    "max": 10,
                    "percentage": round((formatting_score / 10) * 100)
                }
            },
            "skills_analysis": {
                "present": present_skills,
                "missing": missing_skills
            },
            "flaws": flaws,
            "recommendations": recommendations,
            "contact_detected": contact,
            "sections": sections,
            "raw_text": resume_data.get("raw_text", "")
        }

ats_evaluator = ATSEvaluationService()
