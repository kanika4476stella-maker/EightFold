/**
 * strategic_planning.js — Strategic Workforce Planning Engine
 * Simulates an AI identifying blocked goals and making redeploy/hire/train recommendations.
 */

const StrategicPlanning = (() => {

  const MOCK_GOALS = [
    { id: 'g1', title: 'Launch real-time ML recommendation engine', severity: 'high', depends_on: ['kafka', 'kubernetes', 'spark', 'machine learning', 'pytorch', 'tensorflow'] },
    { id: 'g2', title: 'Migrate core analytics to predictive models', severity: 'medium', depends_on: ['aws architecture', 'python', 'sql'] },
    { id: 'g3', title: 'Enhance internal dashboard reporting', severity: 'low', depends_on: ['tableau', 'powerbi', 'dbt'] }
  ];

  async function generatePlan(skillCoverage, employees) {
    return new Promise((resolve) => {
      setTimeout(() => {
        
        // Calculate Department Risks
        const deptScores = {};
        employees.forEach(emp => {
          if (!deptScores[emp.department]) deptScores[emp.department] = { count: 0, penalty: 0 };
          deptScores[emp.department].count++;
        });

        // Evaluate goals vs gaps
        const blockedGoals = [];
        const gapResolutions = [];

        MOCK_GOALS.forEach(goal => {
          const blockingSkills = [];
          let maxDelay = 0;

          goal.depends_on.forEach(reqSkill => {
            const coverage = skillCoverage.find(c => c.skill.toLowerCase() === reqSkill);
            const count = coverage ? coverage.employee_count : 0;
            
            // If skill is thin or missing, it blocks
            if (count < 2) {
              blockingSkills.push(reqSkill);
              
              // Resolution Logic
              const isHighlySpecialized = ['kafka', 'kubernetes', 'spark', 'pytorch', 'tensorflow', 'aws architecture'].includes(reqSkill);
              const priority = goal.severity === 'high' ? 'P1' : goal.severity === 'medium' ? 'P2' : 'P3';
              
              let recommendation = 'train';
              let redeployment_candidates = null;
              let rationale = "Gap count is low and timeline allows for an 8-week internal upskilling program.";
              
              // Check redeployment matches
              const matches = employees.filter(e => e.skills.length >= 3).slice(0, 1); // Mock 1 match
              if (matches.length > 0 && Math.random() > 0.4) {
                recommendation = 'redeploy';
                redeployment_candidates = [{ name: matches[0].name, match_pct: 75 + Math.floor(Math.random() * 20) }];
                rationale = "Internal match ≥60% found in adjacent profile.";
              } else if (isHighlySpecialized && (4 - count) >= 3) {
                recommendation = 'hire';
                rationale = "High specialization required, high gap count, and training exceeds 12 weeks.";
              }

              // Add delay to goal
              if (priority === 'P1') maxDelay = Math.max(maxDelay, recommendation === 'hire' ? 12 : 8);
              else if (priority === 'P2') maxDelay = Math.max(maxDelay, recommendation === 'hire' ? 8 : 4);

              // Push resolution if unique
              if (!gapResolutions.find(r => r.skill === reqSkill)) {
                gapResolutions.push({
                  skill: reqSkill.charAt(0).toUpperCase() + reqSkill.slice(1),
                  recommendation,
                  priority,
                  redeployment_candidates,
                  rationale
                });
              }

              // Add penalty to departments needing this
              Object.keys(deptScores).forEach(d => {
                if (Math.random() > 0.5) deptScores[d].penalty += (priority === 'P1' ? 15 : 5);
              });
            }
          });

          if (blockingSkills.length > 0) {
            blockedGoals.push({
              goal: goal.title,
              blocked_by_skills: blockingSkills.map(s => s.charAt(0).toUpperCase() + s.slice(1)),
              priority: goal.severity === 'high' ? 'P1' : goal.severity === 'medium' ? 'P2' : 'P3',
              estimated_delay_weeks: maxDelay || null
            });
          }
        });

        const riskScores = Object.keys(deptScores).map(d => ({
          department: d,
          score: Math.min(100, Math.max(10, Math.floor(deptScores[d].penalty / (deptScores[d].count || 1) * 10) + 20))
        })).sort((a, b) => b.score - a.score);

        const execSummary = `The organisation faces critical readiness risks in planned high-severity initiatives. We must aggressively redeploy adjacent talent and hire externally for specialised roles to prevent a ${Math.max(...blockedGoals.map(g => g.estimated_delay_weeks || 0))} week delay on strategic deliverables.`;

        resolve({
          executive_summary: execSummary,
          department_risk_scores: riskScores,
          blocked_goals: blockedGoals,
          gap_resolutions: gapResolutions
        });
      }, 1500);
    });
  }

  return { generatePlan };
})();

window.StrategicPlanning = StrategicPlanning;
