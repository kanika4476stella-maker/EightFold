/**
 * analytics.js — Workforce Analytics Engine
 * Analyzes the complete employee skill map to reveal gaps, risks, and strengths.
 */

const Analytics = (() => {

  /**
   * Performs full workforce analysis.
   * @param {Array} employees - List of normalized employee objects.
   * @param {Array} jobs - List of open roles (optional).
   */
  async function analyze(employees, jobs = []) {
    if (!employees || employees.length === 0) return null;

    const totalCount = employees.length;
    const skillMap = {}; // { skillName: [employeeNames] }

    employees.forEach(emp => {
      emp.skills.forEach(skill => {
        const s = skill.toLowerCase().trim();
        if (!skillMap[s]) skillMap[s] = [];
        skillMap[s].push(emp.name);
      });
    });

    const allSkills = Object.keys(skillMap);
    const coverage = allSkills.map(s => {
      const count = skillMap[s].length;
      const pct = (count / totalCount) * 100;
      let risk = "healthy";
      let reason = "";

      if (count === 1) {
        risk = "critical";
        reason = "Single point of failure (only 1 employee has this skill).";
      } else if (pct < 15) {
        risk = "thin";
        reason = `Low coverage (${count} employees). Risk of capacity bottleneck.`;
      }

      return {
        skill: capitalize(s),
        employee_count: count,
        coverage_pct: Math.round(pct),
        risk_level: risk,
        risk_reason: reason,
        employees: skillMap[s]
      };
    }).sort((a, b) => b.employee_count - a.employee_count);

    const strengths = coverage.slice(0, 5).map(c => c.skill);
    
    // Critical gaps: Skills required by open roles but barely present in current workforce
    const roleSkills = new Set();
    jobs.forEach(j => {
      [...(j.required_skills || []), ...(j.nice_to_have_skills || [])].forEach(s => roleSkills.add(s.toLowerCase().trim()));
    });

    const criticalGaps = Array.from(roleSkills).filter(s => {
      const cov = coverage.find(c => c.skill.toLowerCase() === s);
      return !cov || cov.employee_count <= 1;
    }).map(s => capitalize(s));

    const spofs = coverage.filter(c => c.employee_count === 1).map(c => ({
      skill: c.skill,
      only_employee: c.employees[0]
    }));

    const recommendations = coverage.filter(c => c.risk_level !== 'healthy' || criticalGaps.includes(c.skill)).map(c => {
      const isHighlySpecialized = ['kafka', 'kubernetes', 'spark', 'pytorch', 'tensorflow', 'aws architecture'].includes(c.skill.toLowerCase());
      const needsCount = 4; // Arbitrary gap target
      const gapCount = needsCount - c.employee_count;
      
      const rec = (gapCount > 2 && isHighlySpecialized) ? "hire" : "train";
      
      return {
        skill: c.skill,
        recommendation: rec,
        reason: rec === "hire" 
          ? `Gap of ${gapCount} experts in specialized tech. Faster than training.`
          : `Upskill internal high-potentials to build 15% bench strength.`
      };
    });

    return {
      total_employees: totalCount,
      skill_coverage: coverage,
      top_strengths: strengths,
      critical_gaps: criticalGaps,
      single_points_of_failure: spofs,
      hire_vs_train_recommendation: recommendations.slice(0, 8) // Limit for UI
    };
  }

  function capitalize(s) {
    return s.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  }

  return { analyze };
})();

window.Analytics = Analytics;
