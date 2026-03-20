/**
 * results.js — Results page controller
 * Renders candidate cards, score rings, gap analysis, and upskilling roadmaps
 */

// ─── Load data from session ─────────────────────────────────────
let allResults = [];
let allEmployees = [];
let job = {};

(function loadFromSession() {
  const empRaw = sessionStorage.getItem('ts_employees');
  const jobRaw = sessionStorage.getItem('ts_job');

  if (!empRaw || !jobRaw) {
    // If no data in session, load demo data automatically
    loadDemo();
    return;
  }

  try {
    allEmployees = JSON.parse(empRaw);
    job = JSON.parse(jobRaw);
    runAnalysis();
  } catch {
    loadDemo();
  }
})();

async function loadDemo() {
  try {
    allEmployees = Parser.parseCSV(window.TALENTSCOPE_DATA.employees_csv);
    job          = window.TALENTSCOPE_DATA.jobs[0];
    runAnalysis();
  } catch (err) {
    document.getElementById('candidateList').innerHTML = `
      <div class="empty-state">
        <div class="big-icon">⚠️</div>
        <h3>No Data Found</h3>
        <p>Please <a href="index.html" style="color:var(--indigo-light);">go back</a> and upload employee profiles.</p>
      </div>`;
  }
}

// ─── Run analysis ───────────────────────────────────────────────
function runAnalysis() {
  allResults = Engine.analyze(allEmployees, job);
  renderHeader();
  renderSidebarFilters();
  renderResults(allResults);
  spawnParticles();
}

// ─── Particles ─────────────────────────────────────────────────
function spawnParticles() {
  const container = document.getElementById('particles');
  for (let i = 0; i < 12; i++) {
    const p = document.createElement('div');
    p.className = 'particle';
    const size = Math.random() * 5 + 2;
    p.style.cssText = `
      width:${size}px;height:${size}px;
      left:${Math.random() * 100}%;
      animation-duration:${Math.random() * 14 + 10}s;
      animation-delay:${Math.random() * 8}s;
      background:${['#6366f1','#22d3ee','#a855f7'][Math.floor(Math.random()*3)]};
    `;
    container.appendChild(p);
  }
}

// ─── Header ─────────────────────────────────────────────────────
function renderHeader() {
  document.getElementById('jobTitleDisplay').textContent = job.title || 'Role Analysis';
  document.getElementById('jobMetaDisplay').textContent =
    `${job.department || ''}${job.min_experience ? ` · ${job.min_experience}+ years experience` : ''}`;

  const readyCount = allResults.filter(r => r.is_ready_now).length;
  const topScore   = allResults[0]?.score ?? 0;
  const avgScore   = Math.round(allResults.reduce((a,r) => a + r.score, 0) / allResults.length);

  const chips = document.getElementById('summaryChips');
  chips.innerHTML = `
    <span class="badge badge-indigo">👥 ${allResults.length} candidates analyzed</span>
    <span class="badge badge-emerald">✅ ${readyCount} ready now</span>
    <span class="badge badge-cyan">🏆 Top match: ${topScore}%</span>
    <span class="badge badge-purple">📊 Avg score: ${avgScore}%</span>
  `;

  if (allResults[0]) {
    const top = allResults[0];
    document.getElementById('topMatchBadge').innerHTML = `
      <div style="text-align:right;">
        <div style="font-size:0.72rem;color:var(--text-muted);margin-bottom:4px;">TOP MATCH</div>
        <div style="font-size:1rem;font-weight:700;">${top.employee.name}</div>
        <div style="font-size:0.82rem;color:var(--text-secondary);">${top.employee.title}</div>
      </div>
    `;
  }
}

// ─── Sidebar Filters ────────────────────────────────────────────
function renderSidebarFilters() {
  const depts = [...new Set(allEmployees.map(e => e.department).filter(Boolean))].sort();
  const container = document.getElementById('deptFilters');
  container.innerHTML = depts.map(dept => `
    <div class="filter-option">
      <input type="checkbox" id="dept_${dept}" data-dept="${dept}" checked />
      <label for="dept_${dept}">${dept}</label>
    </div>
  `).join('');

  // Bind all filters
  container.querySelectorAll('input').forEach(el => el.addEventListener('change', applyFilters));
  document.getElementById('scoreFilter').addEventListener('input', e => {
    document.getElementById('scoreFilterVal').textContent = e.target.value;
    applyFilters();
  });
  document.getElementById('chk_low').addEventListener('change', applyFilters);
  document.getElementById('chk_med').addEventListener('change', applyFilters);
  document.getElementById('chk_high').addEventListener('change', applyFilters);
  document.getElementById('sortSelect').addEventListener('change', applyFilters);
  document.getElementById('showReadyNow').addEventListener('click', () => {
    document.getElementById('scoreFilter').value = 70;
    document.getElementById('scoreFilterVal').textContent = '70';
    applyFilters();
  });
  document.getElementById('resetFilters').addEventListener('click', resetFilters);
}

function resetFilters() {
  document.getElementById('scoreFilter').value = 0;
  document.getElementById('scoreFilterVal').textContent = '0';
  document.querySelectorAll('#deptFilters input').forEach(el => el.checked = true);
  document.getElementById('chk_low').checked = true;
  document.getElementById('chk_med').checked = true;
  document.getElementById('chk_high').checked = true;
  applyFilters();
}

function applyFilters() {
  const minScore   = parseInt(document.getElementById('scoreFilter').value, 10);
  const activeDepts = [...document.querySelectorAll('#deptFilters input:checked')].map(el => el.dataset.dept);
  const showLow    = document.getElementById('chk_low').checked;
  const showMed    = document.getElementById('chk_med').checked;
  const showHigh   = document.getElementById('chk_high').checked;
  const sortVal    = document.getElementById('sortSelect').value;

  let filtered = allResults.filter(r => {
    if (r.score < minScore) return false;
    if (r.employee.department && !activeDepts.includes(r.employee.department)) return false;
    const sev = r.gap.gap_severity;
    if (sev === 'low'    && !showLow)  return false;
    if (sev === 'medium' && !showMed)  return false;
    if (sev === 'high'   && !showHigh) return false;
    return true;
  });

  // Sort
  if (sortVal === 'score')      filtered.sort((a,b) => b.score - a.score);
  if (sortVal === 'experience') filtered.sort((a,b) => b.employee.experience_years - a.employee.experience_years);
  if (sortVal === 'gaps')       filtered.sort((a,b) => a.gap.critical_gaps.length - b.gap.critical_gaps.length);
  if (sortVal === 'readiness')  filtered.sort((a,b) => a.readiness_weeks - b.readiness_weeks);

  renderResults(filtered);
}

// ─── Score Ring SVG ─────────────────────────────────────────────
function buildScoreRing(score, size = 80) {
  const r       = (size / 2) - 6;
  const circ    = 2 * Math.PI * r;
  const offset  = circ - (score / 100) * circ;
  const color   = score >= 75 ? '#10b981' : score >= 50 ? '#6366f1' : score >= 30 ? '#f59e0b' : '#f43f5e';

  return `
    <div class="score-ring-wrap" style="width:${size}px;height:${size}px;">
      <svg class="score-ring-svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" style="transform:rotate(-90deg)">
        <circle class="track" cx="${size/2}" cy="${size/2}" r="${r}" stroke-width="6"/>
        <circle class="fill" cx="${size/2}" cy="${size/2}" r="${r}" stroke="${color}" stroke-width="6"
          stroke-dasharray="${circ}"
          stroke-dashoffset="${circ}"
          data-target="${offset}"
        />
      </svg>
      <div class="score-label">
        <span class="score-num">${score}</span>
        <span class="score-pct">%</span>
      </div>
    </div>`;
}

// ─── Gap Analysis panel ─────────────────────────────────────────
function buildGapPanel(gap, job) {
  const matchedRows = gap.matched_required.map(s =>
    `<div class="gap-row"><span class="gap-icon">✅</span><span class="gap-label">${s}</span><span class="skill-tag matched">Matched</span></div>`
  ).join('');

  const critRows = gap.critical_gaps.map(s =>
    `<div class="gap-row"><span class="gap-icon">🔴</span><span class="gap-label">${s}</span><span class="skill-tag missing-critical">Critical Gap</span></div>`
  ).join('');

  const minorRows = gap.minor_gaps.map(s =>
    `<div class="gap-row"><span class="gap-icon">🟡</span><span class="gap-label">${s}</span><span class="skill-tag missing-nice">Minor Gap</span></div>`
  ).join('');

  const expRow = gap.experience_gap > 0
    ? `<div class="gap-row"><span class="gap-icon">⏳</span><span class="gap-label">Experience: ${gap.experience_gap} yr(s) short</span><span class="skill-tag missing-critical">Gap</span></div>`
    : '';

  return `
    <div class="analysis-panel">
      <div class="analysis-panel-title">
        <span>📊</span> Skill Match Analysis
        <span class="badge badge-${gap.gap_severity === 'low' ? 'emerald' : gap.gap_severity === 'medium' ? 'amber' : 'rose'}">
          ${gap.gap_severity.toUpperCase()} GAP
        </span>
      </div>
      ${matchedRows}${critRows}${minorRows}${expRow}
      ${!matchedRows && !critRows && !minorRows ? '<div style="font-size:0.82rem;color:var(--text-muted);">No skills data to compare.</div>' : ''}
    </div>`;
}

// ─── Progress breakdown ─────────────────────────────────────────
function buildProgressPanel(gap, job) {
  const reqTotal   = (job.required_skills || []).length;
  const reqMatched = gap.matched_required.length;
  const nthTotal   = (job.nice_to_have || []).length;
  const nthMatched = gap.matched_nice.length;

  const reqPct  = reqTotal  ? Math.round(reqMatched  / reqTotal  * 100) : 100;
  const nthPct  = nthTotal  ? Math.round(nthMatched  / nthTotal  * 100) : 100;

  return `
    <div class="analysis-panel">
      <div class="analysis-panel-title"><span>📈</span> Coverage Breakdown</div>

      <div style="margin-bottom:16px;">
        <div class="match-bar-label">
          <span>Required Skills</span>
          <span style="color:var(--text-primary);font-weight:600;">${reqMatched}/${reqTotal} matched</span>
        </div>
        <div class="progress-bar-wrap">
          <div class="progress-bar-fill" style="width:0%;background:linear-gradient(90deg,#6366f1,#22d3ee)" data-target="${reqPct}%"></div>
        </div>
      </div>

      <div style="margin-bottom:16px;">
        <div class="match-bar-label">
          <span>Nice-to-Have Skills</span>
          <span style="color:var(--text-primary);font-weight:600;">${nthMatched}/${nthTotal} matched</span>
        </div>
        <div class="progress-bar-wrap">
          <div class="progress-bar-fill" style="width:0%;background:linear-gradient(90deg,#f59e0b,#ef4444)" data-target="${nthPct}%"></div>
        </div>
      </div>

      <div>
        <div class="match-bar-label">
          <span>Overall Match Score</span>
        </div>
        <div style="display:flex;flex-wrap:wrap;gap:8px;margin-top:4px;">
          ${gap.matched_required.concat(gap.matched_nice).map(s =>
            `<span class="skill-tag matched">✓ ${s}</span>`
          ).join('')}
          ${gap.critical_gaps.map(s =>
            `<span class="skill-tag missing-critical">✕ ${s}</span>`
          ).join('')}
          ${gap.minor_gaps.map(s =>
            `<span class="skill-tag missing-nice">△ ${s}</span>`
          ).join('')}
        </div>
      </div>
    </div>`;
}

// ─── Roadmap ────────────────────────────────────────────────────
function buildRoadmap(roadmap, isReadyNow, employeeId) {
  if (isReadyNow) {
    return `<div class="ready-now-banner">🚀 This candidate meets all required skills and experience — ready now!</div>
      ${roadmap.steps.length > 0 ? `<div style="font-size:0.82rem;color:var(--text-secondary);margin-bottom:16px;">Optional recommendations to further strengthen fit:</div>` : ''}
      ${buildRoadmapSteps(roadmap.steps)}`;
  }

  const weeks = roadmap.total_weeks;
  const display = weeks === 0 ? 'Ready Now' : weeks > 52 ? `~${Math.round(weeks/52*10)/10} yrs` : `~${weeks} weeks`;

  return `
    <div class="roadmap-title">
      <span>Track: Upskilling Roadmap</span>
      <button class="btn btn-primary btn-sm" onclick="openRoadmapModal('${employeeId}')">✨ View AI Learning DNA</button>
    </div>
    <div style="font-size:0.75rem;color:var(--text-secondary);margin-bottom:14px;">Estimated readiness: <strong>${display}</strong></div>
    ${buildRoadmapSteps(roadmap.steps)}`;
}

// ─── Phase Modal Logic ──────────────────────────────────────────
async function openRoadmapModal(empId) {
  const result = allResults.find(r => r.employee.id === empId);
  if (!result) return;

  const overlay = document.getElementById('roadmapModal');
  const body = document.getElementById('roadmapModalBody');
  overlay.classList.add('show');

  // Fill initially with loading
  body.innerHTML = `
    <div style="text-align:center;padding:80px;">
      <div class="spinner" style="margin:0 auto 20px; width:40px; height:40px;"></div>
      <h3 style="font-size:1.5rem;font-weight:800;margin-bottom:10px;">Generating Personalised DNA...</h3>
      <p style="color:var(--text-secondary);">Analyzing ${result.employee.name}'s skill profile vs. ${job.title}</p>
    </div>
  `;

  // Generate real DNA
  const dna = await GapDNA.generate(result.employee, job, result.gap.critical_gaps.concat(result.gap.minor_gaps));

  body.innerHTML = `
    <div class="stagger-in">
      <div style="display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:32px;">
        <div>
          <div class="section-label">AI-Personalised Learning Path</div>
          <h2 style="font-size:1.8rem;font-weight:900;margin-bottom:6px;">${dna.employee_name} ➔ ${dna.target_role}</h2>
          <div style="display:flex;gap:12px;font-size:0.85rem;color:var(--text-secondary);">
            <span>🗓 Estimated Ready: <strong>${dna.estimated_ready_date}</strong></span>
            <span>⏱ Total Commitment: <strong>${dna.total_weeks} weeks</strong></span>
          </div>
        </div>
        <div style="text-align:right;">
          <div style="font-size:0.7rem;color:var(--text-muted);margin-bottom:4px;">SUCCESS METRIC</div>
          <div style="font-size:0.8rem;font-weight:600;max-width:300px;color:var(--text-primary);">${dna.success_metric}</div>
        </div>
      </div>

      ${dna.phases.map(phase => `
        <div class="dna-phase">
          <div class="dna-phase-title">
            <span>${phase.phase === '30_days' ? '🎯 30-Day Foundation' : '🚀 90-Day Advanced Application'}</span>
            <span class="dna-phase-badge">Focus: ${phase.focus_skill}</span>
          </div>
          <div class="week-grid">
            ${phase.weeks.map(wk => `
              <div class="week-card">
                <div class="week-num">WEEK ${wk.week}</div>
                <div class="week-goal">${wk.goal}</div>
                <div class="week-resource">📖 ${wk.resource}</div>
                <div class="milestone">
                  <input type="checkbox" id="check_${wk.week}" />
                  <label for="check_${wk.week}">Build: ${wk.deliverable}</label>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      `).join('')}

      <div class="dna-success-banner">
        <strong>Manager Tip:</strong> Review the deliverables for weeks ${dna.phases[0].weeks.length} and ${dna.phases[0].weeks.length + (dna.phases[1]?.weeks.length || 0)} as primary readiness validation milestones.
      </div>
    </div>
  `;
}

function closeRoadmapModal() {
  document.getElementById('roadmapModal').classList.remove('show');
}
window.openRoadmapModal = openRoadmapModal;
window.closeRoadmapModal = closeRoadmapModal;

function buildRoadmapSteps(steps) {
  if (!steps || steps.length === 0) {
    return `<div style="font-size:0.82rem;color:var(--text-secondary);">No additional upskilling required.</div>`;
  }
  return steps.map(step => `
    <div class="roadmap-step ${step.priority.toLowerCase()}">
      <div class="step-header">
        <span class="badge badge-${step.priority === 'Critical' ? 'rose' : step.priority === 'Recommended' ? 'amber' : 'emerald'}">${step.priority}</span>
        <span class="step-skill">${step.skill}</span>
      </div>
      <div class="step-why">${step.why}</div>
      <div class="step-courses">
        ${step.courses.map(c => `<div class="step-course">${c}</div>`).join('')}
      </div>
      <div class="step-footer">
        <span class="step-meta">⏱ ~${step.weeks < 52 ? step.weeks + ' weeks' : Math.round(step.weeks/52*10)/10 + ' yrs'}</span>
        <span class="step-meta">📘 Level: ${step.level}</span>
      </div>
    </div>`
  ).join('');
}

// ─── Candidate Card ─────────────────────────────────────────────
function buildCandidateCard(result, globalRank, displayRank, employeeId) {
  const { employee, score, gap, roadmap, is_ready_now, readiness_weeks } = result;

  const avatarColors = ['#6366f1','#22d3ee','#10b981','#f59e0b','#a855f7','#f43f5e','#0891b2'];
  const avatarColor  = avatarColors[globalRank % avatarColors.length];
  const initials     = employee.name.split(' ').map(w => w[0]).join('').slice(0,2).toUpperCase();

  const rankClass = displayRank === 1 ? 'rank-1' : displayRank === 2 ? 'rank-2' : displayRank === 3 ? 'rank-3' : 'rank-other';

  return `
    <div class="candidate-card stagger-in" style="animation-delay:${displayRank * 0.08}s;" id="card_${employee.id}" data-id="${employee.id}">
      <div class="card-summary" onclick="toggleCard('${employee.id}')">
        <!-- Score Ring -->
        <div style="position:relative;flex-shrink:0;">
          <div class="rank-badge ${rankClass}">${displayRank}</div>
          ${buildScoreRing(score, 80)}
        </div>

        <!-- Info -->
        <div class="candidate-info">
          <div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap;margin-bottom:2px;">
            <div style="width:32px;height:32px;border-radius:50%;background:${avatarColor};display:flex;align-items:center;justify-content:center;font-size:0.72rem;font-weight:700;color:#fff;flex-shrink:0;">
              ${initials}
            </div>
            <div class="candidate-name">${employee.name}</div>
            ${is_ready_now ? `<span class="badge badge-emerald">✅ Ready Now</span>` : ''}
          </div>
          <div class="candidate-meta">
            ${employee.title} · ${employee.department} · ${employee.experience_years} yr${employee.experience_years !== 1 ? 's' : ''} exp
          </div>
          <div class="match-bar-label">
            <span style="font-size:0.72rem;">Skill match</span>
          </div>
          <div class="progress-bar-wrap" style="max-width:280px;margin-bottom:10px;">
            <div class="progress-bar-fill" style="width:0%;" data-target="${score}%"></div>
          </div>
          <div class="candidate-skills">
            ${gap.matched_required.slice(0,4).map(s => `<span class="skill-tag matched">✓ ${s}</span>`).join('')}
            ${gap.critical_gaps.slice(0,3).map(s => `<span class="skill-tag missing-critical">✕ ${s}</span>`).join('')}
            ${(gap.matched_required.length + gap.critical_gaps.length > 0 && employee.skills.length > 7)
              ? `<span class="skill-tag neutral">+${Math.max(0,employee.skills.length - 7)} more</span>` : ''}
          </div>
        </div>

        <!-- Expand -->
        <div style="display:flex;flex-direction:column;align-items:flex-end;gap:8px;flex-shrink:0;">
          <div style="text-align:right;">
            <div style="font-size:0.7rem;color:var(--text-muted);margin-bottom:2px;">GAP SEVERITY</div>
            <span class="badge badge-${gap.gap_severity === 'low' ? 'emerald' : gap.gap_severity === 'medium' ? 'amber' : 'rose'}">
              ${gap.gap_severity.toUpperCase()}
            </span>
          </div>
          <div style="text-align:right;">
            <div style="font-size:0.7rem;color:var(--text-muted);margin-bottom:2px;">CRITICAL GAPS</div>
            <span style="font-size:1rem;font-weight:800;">${gap.critical_gaps.length}</span>
          </div>
          <button class="expand-btn" onclick="event.stopPropagation();toggleCard('${employee.id}')">
            View Analysis <span class="chevron">▾</span>
          </button>
        </div>
      </div>

      <!-- Expansion Panel -->
      <div class="card-analysis" id="analysis_${employee.id}">
        <div class="analysis-grid">
          ${buildGapPanel(gap, job)}
          ${buildProgressPanel(gap, job)}
        </div>
        <div class="roadmap-section">
          ${buildRoadmap(roadmap, is_ready_now, employee.id)}
        </div>
      </div>
    </div>`;
}

// ─── Toggle card expansion ──────────────────────────────────────
function toggleCard(empId) {
  const card = document.getElementById(`card_${empId}`);
  const wasExpanded = card.classList.contains('expanded');
  // Collapse all others
  document.querySelectorAll('.candidate-card.expanded').forEach(c => c.classList.remove('expanded'));
  if (!wasExpanded) {
    card.classList.add('expanded');
    // Animate progress bars inside
    setTimeout(() => animateProgressBars(card), 50);
  }
}
window.toggleCard = toggleCard;

// ─── Animate progress bars ──────────────────────────────────────
function animateProgressBars(container) {
  container.querySelectorAll('.progress-bar-fill[data-target]').forEach(bar => {
    bar.style.width = bar.dataset.target;
  });
  // Animate score rings
  container.querySelectorAll('circle.fill[data-target]').forEach(circle => {
    circle.style.strokeDashoffset = circle.dataset.target;
  });
}

// ─── Render results list ────────────────────────────────────────
function renderResults(results) {
  const list = document.getElementById('candidateList');
  document.getElementById('countDisplay').textContent =
    `Showing ${results.length} of ${allResults.length} candidates`;

  if (results.length === 0) {
    list.innerHTML = `
      <div class="empty-state">
        <div class="big-icon">🔍</div>
        <h3>No candidates match current filters</h3>
        <p>Try relaxing the score threshold or department filter.</p>
      </div>`;
    return;
  }

  list.innerHTML = results.map((r, i) => {
    const globalRank = allResults.indexOf(r);
    return buildCandidateCard(r, globalRank, i + 1, r.employee.id);
  }).join('');

  // Animate all visible progress bars and score rings with a short delay
  setTimeout(() => {
    document.querySelectorAll('.candidate-card').forEach(card => {
      // Animate the match score progress bar in card summary
      card.querySelectorAll('.progress-bar-fill[data-target]').forEach(bar => {
        bar.style.transition = 'width 1s cubic-bezier(0.4,0,0.2,1)';
        bar.style.width = bar.dataset.target;
      });
      // Score ring circles
      card.querySelectorAll('circle.fill[data-target]').forEach(circle => {
        circle.style.strokeDashoffset = circle.dataset.target;
      });
    });
  }, 100);
}
