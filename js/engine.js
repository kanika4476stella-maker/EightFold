/**
 * engine.js — Core Talent Matching Engine
 * - Skill matching & score computation
 * - Gap analysis (critical vs. minor)
 * - Upskilling roadmap generation
 */

const Engine = (() => {

  // ─── Skill normalization ───────────────────────────────
  function normalizeSkill(s) {
    return s.toLowerCase()
      .replace(/[.\-_]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  function skillsMatch(a, b) {
    const na = normalizeSkill(a);
    const nb = normalizeSkill(b);
    if (na === nb) return true;

    // Allow partial matches for common abbreviations
    const aliases = {
      'js': 'javascript', 'ts': 'typescript', 'py': 'python',
      'ml': 'machine learning', 'dl': 'deep learning',
      'k8s': 'kubernetes', 'tf': 'terraform',
      'rest': 'rest apis', 'api': 'rest apis',
      'db': 'database', 'postgres': 'postgresql',
    };
    const ra = aliases[na] || na;
    const rb = aliases[nb] || nb;
    return ra === rb || ra.includes(rb) || rb.includes(ra);
  }

  function findMatchedSkills(candidateSkills, jobSkills) {
    return jobSkills.filter(js =>
      candidateSkills.some(cs => skillsMatch(cs, js))
    );
  }

  function findMissingSkills(candidateSkills, jobSkills) {
    return jobSkills.filter(js =>
      !candidateSkills.some(cs => skillsMatch(cs, js))
    );
  }

  // ─── Score Computation ─────────────────────────────────
  /**
   * Compute a weighted match score 0–100 for an employee vs. a job
   */
  function computeScore(employee, job) {
    const required    = job.required_skills || [];
    const niceToHave  = job.nice_to_have    || [];
    const minExp      = job.min_experience  || 0;

    // 1. Required skills (60%)
    const reqMatched  = findMatchedSkills(employee.skills, required);
    const reqScore    = required.length > 0
      ? (reqMatched.length / required.length) * 60
      : 60;

    // 2. Nice-to-have skills (20%)
    const nthMatched  = findMatchedSkills(employee.skills, niceToHave);
    const nthScore    = niceToHave.length > 0
      ? (nthMatched.length / niceToHave.length) * 20
      : 20;

    // 3. Experience (15%)
    const expRatio    = Math.min(employee.experience_years / Math.max(minExp, 1), 1.5);
    const expScore    = Math.min(expRatio, 1) * 15;

    // 4. Title/domain affinity (5%)
    const titleScore  = computeTitleAffinity(employee, job) * 5;

    const raw = reqScore + nthScore + expScore + titleScore;
    return Math.min(Math.round(raw), 100);
  }

  function computeTitleAffinity(employee, job) {
    const empTitle = normalizeSkill(employee.title);
    const jobTitle = normalizeSkill(job.title);
    const empDept  = normalizeSkill(employee.department);
    const jobDept  = normalizeSkill(job.department || '');

    const titleWords = jobTitle.split(' ');
    const empWords   = empTitle.split(' ');
    const overlap    = titleWords.filter(w => empWords.includes(w) && w.length > 2);

    const titleSim   = overlap.length / Math.max(titleWords.length, 1);
    const deptMatch  = jobDept && empDept.includes(jobDept.split(' ')[0]) ? 0.4 : 0;

    return Math.min(titleSim + deptMatch, 1);
  }

  // ─── Gap Analysis ──────────────────────────────────────
  function generateGapAnalysis(employee, job) {
    const required   = job.required_skills || [];
    const niceToHave = job.nice_to_have    || [];

    const criticalGaps = findMissingSkills(employee.skills, required);
    const minorGaps    = findMissingSkills(employee.skills, niceToHave);
    const matchedReq   = findMatchedSkills(employee.skills, required);
    const matchedNice  = findMatchedSkills(employee.skills, niceToHave);

    const expGap = Math.max(0, (job.min_experience || 0) - employee.experience_years);

    return {
      matched_required:  matchedReq,
      matched_nice:      matchedNice,
      critical_gaps:     criticalGaps,
      minor_gaps:        minorGaps,
      experience_gap:    expGap,
      gap_severity:      criticalGaps.length === 0 ? 'low'
                       : criticalGaps.length <= 2  ? 'medium' : 'high',
    };
  }

  // ─── Upskilling Roadmap ────────────────────────────────

  // Curated learning resource map
  const LEARNING_MAP = {
    // Data & Engineering
    'python':       { courses: ['Python for Data Engineering (Coursera)', 'Complete Python Bootcamp (Udemy)'],              weeks: 4, level: 'Beginner–Intermediate' },
    'spark':        { courses: ['Apache Spark with Python (Datacamp)', 'Spark & Big Data Essentials (Databricks)'],         weeks: 5, level: 'Intermediate' },
    'sql':          { courses: ['Advanced SQL for Data Engineers (Mode Analytics)', 'SQL for Data Science (Coursera)'],     weeks: 3, level: 'Beginner–Intermediate' },
    'dbt':          { courses: ['dbt Fundamentals (dbt Labs — free)', 'Analytics Engineering with dbt (Udemy)'],            weeks: 2, level: 'Beginner' },
    'airflow':      { courses: ['Apache Airflow: The Hands-On Guide (Udemy)', 'Airflow Fundamentals (Astronomer)'],         weeks: 3, level: 'Intermediate' },
    'kafka':        { courses: ['Apache Kafka for Developers (Udemy)', 'Kafka Fundamentals (Confluent — free)'],            weeks: 3, level: 'Intermediate' },
    'kubernetes':   { courses: ['Kubernetes for the Absolute Beginners (Udemy)', 'CKA Exam Prep (Linux Foundation)'],       weeks: 6, level: 'Intermediate–Advanced' },
    'docker':       { courses: ['Docker & Kubernetes: The Practical Guide (Udemy)', 'Docker Essentials (IBM — edX)'],       weeks: 3, level: 'Beginner' },
    'aws':          { courses: ['AWS Cloud Practitioner (AWS Training)', 'AWS Solutions Architect (A Cloud Guru)'],         weeks: 6, level: 'Beginner–Intermediate' },
    'gcp':          { courses: ['GCP Associate Cloud Engineer (Google Cloud Skills Boost)', 'GCP Fundamentals (Coursera)'], weeks: 5, level: 'Beginner–Intermediate' },
    'azure':        { courses: ['AZ-900 Azure Fundamentals (Microsoft Learn)', 'Azure Administrator (A Cloud Guru)'],       weeks: 5, level: 'Beginner–Intermediate' },
    'terraform':    { courses: ['Terraform for Beginners (Udemy)', 'HashiCorp Terraform Associate Prep (Pluralsight)'],    weeks: 3, level: 'Intermediate' },
    'postgresql':   { courses: ['PostgreSQL for Everybody (Dr. Chuck — Coursera)', 'Advanced PostgreSQL (Udemy)'],         weeks: 3, level: 'Beginner' },
    'mlflow':       { courses: ['MLflow in Action (Databricks)', 'Experiment Tracking with MLflow (Udemy)'],               weeks: 2, level: 'Intermediate' },
    // ML / AI
    'tensorflow':   { courses: ['Introduction to TensorFlow (DeepLearning.AI)', 'TensorFlow Developer Certificate Prep'], weeks: 6, level: 'Intermediate' },
    'pytorch':      { courses: ['Deep Learning with PyTorch (Udacity)', 'PyTorch for Deep Learning & NLP (Udemy)'],        weeks: 5, level: 'Intermediate' },
    'scikit-learn': { courses: ['ML with Scikit-Learn (Datacamp)', 'Machine Learning A–Z (Udemy)'],                        weeks: 4, level: 'Beginner–Intermediate' },
    // Product & Business
    'agile':        { courses: ['Agile with Atlassian JIRA (Coursera)', 'Agile Project Management (Google)'],              weeks: 2, level: 'Beginner' },
    'scrum':        { courses: ['Professional Scrum Master I (Scrum.org)', 'Scrum Master Certification (Udemy)'],          weeks: 2, level: 'Beginner' },
    'roadmapping':  { courses: ['Product Roadmapping (Product School)', 'PM Fundamentals (LinkedIn Learning)'],            weeks: 2, level: 'Beginner' },
    'a/b testing':  { courses: ['A/B Testing by Google (Udacity)', 'Statistics for Data-Driven Decisions (Coursera)'],     weeks: 3, level: 'Intermediate' },
    // Frontend
    'react':        { courses: ['React — The Complete Guide (Udemy)', 'React Fundamentals (Frontend Masters)'],             weeks: 6, level: 'Intermediate' },
    'typescript':   { courses: ['Understanding TypeScript (Udemy)', 'TypeScript Deep Dive (gitbook.io — free)'],           weeks: 3, level: 'Intermediate' },
    'graphql':      { courses: ['GraphQL with React (Udemy)', 'How to GraphQL (howtographql.com — free)'],                 weeks: 2, level: 'Intermediate' },
  };

  function getResourceForSkill(skill) {
    const key = normalizeSkill(skill).toLowerCase();
    for (const [k, v] of Object.entries(LEARNING_MAP)) {
      if (key.includes(k) || k.includes(key)) return { skill, ...v };
    }
    // Generic fallback
    return {
      skill,
      courses: [`${skill} Fundamentals (LinkedIn Learning)`, `${skill} Crash Course (YouTube)`],
      weeks: 3,
      level: 'Varies',
    };
  }

  function generateRoadmap(gapAnalysis, employee, job) {
    const steps = [];

    // Phase 1: Critical gaps (must-have)
    gapAnalysis.critical_gaps.forEach((skill, i) => {
      const res = getResourceForSkill(skill);
      steps.push({
        phase:    1,
        priority: 'Critical',
        skill,
        action:   `Master ${skill}`,
        courses:  res.courses,
        weeks:    res.weeks,
        level:    res.level,
        why:      `Required skill for ${job.title} — ${i === 0 ? 'highest priority gap' : 'critical gap'}.`,
      });
    });

    // Phase 2: Nice-to-have gaps
    gapAnalysis.minor_gaps.forEach(skill => {
      const res = getResourceForSkill(skill);
      steps.push({
        phase:    2,
        priority: 'Recommended',
        skill,
        action:   `Build proficiency in ${skill}`,
        courses:  res.courses,
        weeks:    res.weeks,
        level:    res.level,
        why:      `Nice-to-have for ${job.title} — will strengthen candidacy.`,
      });
    });

    // Phase 3: Experience gap advice
    if (gapAnalysis.experience_gap > 0) {
      steps.push({
        phase:    3,
        priority: 'Growth',
        skill:    'Experience',
        action:   `Bridge ${gapAnalysis.experience_gap} year(s) of experience gap`,
        courses:  [
          'Request stretch assignments in current role',
          'Lead an internal project aligned to the target role',
          `Shadow or co-pilot a ${job.title} on key deliverables`,
        ],
        weeks:    gapAnalysis.experience_gap * 26,
        level:    'On-the-job',
        why:      `The role requires ${job.min_experience}+ years; you currently have ${employee.experience_years}.`,
      });
    }

    // Total estimated weeks (parallelize phase 1 + 2)
    const phase1Weeks = gapAnalysis.critical_gaps.reduce((acc, skill) => {
      return acc + (getResourceForSkill(skill).weeks || 3);
    }, 0);
    const phase2Weeks = gapAnalysis.minor_gaps.reduce((acc, skill) => {
      return acc + (getResourceForSkill(skill).weeks || 3);
    }, 0);

    // Assume phase 1 and 2 can partially overlap (take max + 20%)
    const totalWeeks = Math.round(Math.max(phase1Weeks, phase2Weeks) + Math.min(phase1Weeks, phase2Weeks) * 0.3);

    return { steps, total_weeks: totalWeeks };
  }

  // ─── Main Analysis API ─────────────────────────────────
  /**
   * Analyze all employees against a job description.
   * Returns sorted array of candidate result objects.
   */
  function analyze(employees, job) {
    const results = employees.map(emp => {
      const score   = computeScore(emp, job);
      const gap     = generateGapAnalysis(emp, job);
      const roadmap = generateRoadmap(gap, emp, job);

      return {
        employee: emp,
        score,
        gap,
        roadmap,
        readiness_weeks: gap.critical_gaps.length === 0 ? 0 : roadmap.total_weeks,
        is_ready_now:    gap.critical_gaps.length === 0 && gap.experience_gap === 0,
      };
    });

    // Sort by score descending
    results.sort((a, b) => b.score - a.score);
    return results;
  }

  return { analyze, computeScore, generateGapAnalysis, generateRoadmap };
})();

window.Engine = Engine;
