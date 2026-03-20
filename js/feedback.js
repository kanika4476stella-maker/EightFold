/**
 * feedback.js — Professional Feedback Generator
 * Generates formal selection and rejection letters for internal candidates.
 */

const Feedback = (() => {

  const COMPANY_NAME = "EightFold";

  /**
   * Generates a formal selection letter
   */
  function generateSelection(employee, job, matchData) {
    const date = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    const matchedSkills = matchData.gap.matched_required.slice(0, 3).join(', ');

    return `
Date: ${date}

Subject: Internal Selection – ${job.title}

Dear ${employee.name},

It is with great pleasure that we inform you of your successful selection for the position of ${job.title} within the ${job.department || 'organization'}.

Our internal talent review process was comprehensive, and your profile stood out significantly. In particular, your expertise in ${matchedSkills} and your ${employee.experience_years} years of demonstrated experience align perfectly with the strategic needs of this role.

We believe that your transition into this position will not only provide a significant growth opportunity for your career but will also bring immense value to the ${job.department} team.

Next Steps:
Your current manager and the ${job.department} leadership will be in touch shortly to discuss the transition timeline and onboarding process.

Congratulations on this accomplishment. We look forward to your continued success at ${COMPANY_NAME}.

Sincerely,

The Talent Acquisition Team
${COMPANY_NAME}
    `.trim();
  }

  /**
   * Generates a professional rejection letter with constructive feedback
   */
  function generateRejection(employee, job, matchData) {
    const date = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    const criticalGaps = matchData.gap.critical_gaps;
    const experienceGap = matchData.gap.experience_gap;

    let feedbackSection = "";
    if (criticalGaps.length > 0) {
      feedbackSection += `Specifically, the role currently requires advanced proficiency in: ${criticalGaps.join(', ')}. `;
    }
    if (experienceGap > 0) {
      feedbackSection += `Additionally, the position seeks candidates with more direct experience in ${job.title} responsibilities (approximately ${job.min_experience} years).`;
    }

    return `
Date: ${date}

Subject: Update Regarding Your Internal Application – ${job.title}

Dear ${employee.name},

Thank you for your interest in the ${job.title} position and for participating in our internal talent discovery process. We truly value your dedication to professional growth within ${COMPANY_NAME}.

After a careful review of all candidates, we are writing to inform you that we will not be moving forward with your selection for this specific role at this time.

Constructive Feedback:
Our analysis indicates that while you possess strong foundational skills, there are a few areas where further development would better align with the core requirements of this senior-level role:
- ${feedbackSection || 'Specific technical alignment with the current project needs.'}

Professional Development Recommendation:
We have generated a personalized Upskilling Roadmap for you, which is available in your Skillसेतु dashboard. Focusing on these areas will significantly strengthen your candidacy for future openings in this domain.

Please do not be discouraged by this outcome. We highly value your contributions to ${employee.department} and encourage you to continue leveraging our internal learning resources. We look forward to seeing your progress and reviewing your application for future opportunities.

Thank you again for your continued commitment to ${COMPANY_NAME}.

Sincerely,

The Talent Acquisition Team
${COMPANY_NAME}
    `.trim();
  }

  return { generateSelection, generateRejection };
})();

if (typeof window !== 'undefined') {
  window.Feedback = Feedback;
}
if (typeof module !== 'undefined') {
  module.exports = Feedback;
}
