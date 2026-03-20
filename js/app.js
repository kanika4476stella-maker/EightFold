/**
 * app.js — Landing page controller
 * Handles file upload, demo data loading, preset JD selection, and form validation
 */

// ─── Constants ─────────────────────────────────────────────────
const DEMO_CSV_PATH = 'data/sample_employees.csv';
const DEMO_JSON_PATH = 'data/sample_jobs.json';

// ─── State ─────────────────────────────────────────────────────
let state = {
  employees: null,
  job: null,
  presetsLoaded: false,
  presets: [],
};

// ─── DOM Refs ──────────────────────────────────────────────────
const els = {
  uploadZone:     document.getElementById('uploadZone'),
  employeeFile:   document.getElementById('employeeFile'),
  uploadFilename: document.getElementById('uploadFilename'),
  loadDemoBtn:    document.getElementById('loadDemoBtn'),
  employeeChip:   document.getElementById('employeeChip'),
  jobTitle:       document.getElementById('jobTitle'),
  jobRequired:    document.getElementById('jobRequired'),
  jobNice:        document.getElementById('jobNice'),
  jobExp:         document.getElementById('jobExp'),
  jobDept:        document.getElementById('jobDept'),
  jobChip:        document.getElementById('jobChip'),
  presetBtns:     document.querySelectorAll('.preset-btn'),
  analyzeBtn:     document.getElementById('analyzeBtn'),
  analyzeBtnText: document.getElementById('analyzeBtnText'),
  analyzeBtnIcon: document.getElementById('analyzeBtnIcon'),
  errorMsg:       document.getElementById('errorMsg'),
  errorText:      document.getElementById('errorText'),
  statEmployees:  document.getElementById('statEmployees'),
  statSkills:     document.getElementById('statSkills'),
};

// ─── Particles ─────────────────────────────────────────────────
function spawnParticles() {
  const container = document.getElementById('particles');
  for (let i = 0; i < 18; i++) {
    const p = document.createElement('div');
    p.className = 'particle';
    const size = Math.random() * 6 + 3;
    p.style.cssText = `
      width:${size}px; height:${size}px;
      left:${Math.random() * 100}%;
      animation-duration:${Math.random() * 15 + 10}s;
      animation-delay:${Math.random() * 10}s;
      background:${['#6366f1','#22d3ee','#a855f7'][Math.floor(Math.random()*3)]};
    `;
    container.appendChild(p);
  }
}

// ─── Counter animation ─────────────────────────────────────────
function animateCounter(el, target, suffix = '') {
  let current = 0;
  const step = Math.ceil(target / 40);
  const interval = setInterval(() => {
    current = Math.min(current + step, target);
    el.textContent = current + suffix;
    if (current >= target) clearInterval(interval);
  }, 30);
}

// ─── Update employee stats ─────────────────────────────────────
function updateEmployeeStats(employees) {
  const uniqueSkills = new Set(employees.flatMap(e => e.skills.map(s => s.toLowerCase())));
  animateCounter(els.statEmployees, employees.length);
  animateCounter(els.statSkills, uniqueSkills.size);
}

// ─── Set employee data ─────────────────────────────────────────
function setEmployees(employees, label) {
  state.employees = employees;
  els.employeeChip.className = 'status-chip';
  els.employeeChip.textContent = `✅ ${employees.length} employees loaded`;
  els.uploadFilename.textContent = label;
  els.uploadFilename.style.display = 'block';
  updateEmployeeStats(employees);
  checkReady();
}

// ─── Load demo data ────────────────────────────────────────────
async function loadDemoEmployees() {
  els.loadDemoBtn.disabled = true;
  els.loadDemoBtn.textContent = '⏳ Loading…';
  try {
    const text = window.TALENTSCOPE_DATA.employees_csv;
    const employees = Parser.parseCSV(text);
    setEmployees(employees, '✨ sample_employees.csv (demo)');
    els.loadDemoBtn.textContent = '✅ Demo Data Loaded';
  } catch (err) {
    showError('Could not load demo data: ' + err.message);
    els.loadDemoBtn.disabled = false;
    els.loadDemoBtn.textContent = '✨ Load 15 Sample Employees';
  }
}

// ─── Load presets ──────────────────────────────────────────────
async function loadPresets() {
  state.presets = window.TALENTSCOPE_DATA.jobs;
  state.presetsLoaded = true;
}

function applyPreset(idx) {
  if (!state.presetsLoaded || !state.presets[idx]) return;
  const jd = state.presets[idx];
  els.jobTitle.value    = jd.title || '';
  els.jobRequired.value = (jd.required_skills || []).join(', ');
  els.jobNice.value     = (jd.nice_to_have    || []).join(', ');
  els.jobExp.value      = jd.min_experience   || '';
  els.jobDept.value     = jd.department       || '';

  els.presetBtns.forEach(b => b.classList.remove('active'));
  document.getElementById(`preset${idx}`).classList.add('active');

  updateJobStatus();
}

// ─── Build job object from form ────────────────────────────────
function buildJobFromForm() {
  const title = els.jobTitle.value.trim();
  const req   = els.jobRequired.value.split(',').map(s => s.trim()).filter(Boolean);
  const nice  = els.jobNice.value.split(',').map(s => s.trim()).filter(Boolean);
  const exp   = parseInt(els.jobExp.value, 10) || 0;
  const dept  = els.jobDept.value.trim();

  if (!title || req.length === 0) return null;

  return { title, required_skills: req, nice_to_have: nice, min_experience: exp, department: dept };
}

function updateJobStatus() {
  const job = buildJobFromForm();
  state.job = job;
  if (job) {
    els.jobChip.className = 'status-chip';
    els.jobChip.textContent = `✅ "${job.title}" configured`;
  } else {
    els.jobChip.className = 'status-chip waiting';
    els.jobChip.textContent = '⏳ Fill in title + required skills';
  }
  checkReady();
}

// ─── Validate & enable analyze button ─────────────────────────
function checkReady() {
  const ready = state.employees && state.employees.length > 0 && state.job;
  els.analyzeBtn.disabled = !ready;
}

// ─── Show error ────────────────────────────────────────────────
function showError(msg) {
  els.errorMsg.classList.add('show');
  els.errorText.textContent = msg;
  setTimeout(() => els.errorMsg.classList.remove('show'), 6000);
}

// ─── File upload handling ──────────────────────────────────────
els.employeeFile.addEventListener('change', async e => {
  const file = e.target.files[0];
  if (!file) return;
  try {
    const employees = await Parser.parseFile(file);
    setEmployees(employees, `📂 ${file.name} (${employees.length} records)`);
  } catch (err) {
    showError('Parse error: ' + err.message);
  }
});

els.uploadZone.addEventListener('dragover', e => {
  e.preventDefault();
  els.uploadZone.classList.add('dragging');
});
els.uploadZone.addEventListener('dragleave', () => els.uploadZone.classList.remove('dragging'));
els.uploadZone.addEventListener('drop', async e => {
  e.preventDefault();
  els.uploadZone.classList.remove('dragging');
  const file = e.dataTransfer?.files[0];
  if (!file) return;
  try {
    const employees = await Parser.parseFile(file);
    setEmployees(employees, `📂 ${file.name} (${employees.length} records)`);
  } catch (err) {
    showError('Parse error: ' + err.message);
  }
});

// ─── Event listeners ───────────────────────────────────────────
els.loadDemoBtn.addEventListener('click', loadDemoEmployees);

els.presetBtns.forEach(btn => {
  btn.addEventListener('click', () => applyPreset(parseInt(btn.dataset.idx)));
});

[els.jobTitle, els.jobRequired, els.jobNice, els.jobExp, els.jobDept].forEach(el => {
  el.addEventListener('input', updateJobStatus);
});

els.analyzeBtn.addEventListener('click', () => {
  const job = buildJobFromForm();
  if (!job || !state.employees) return;

  // Store data in sessionStorage for results page
  sessionStorage.setItem('ts_employees', JSON.stringify(state.employees));
  sessionStorage.setItem('ts_job', JSON.stringify(job));

  // Show loading state
  els.analyzeBtnText.textContent = 'Analyzing…';
  els.analyzeBtnIcon.textContent = '⏳';
  els.analyzeBtn.disabled = true;

  setTimeout(() => {
    window.location.href = 'results.html';
  }, 400);
});

// ─── Init ──────────────────────────────────────────────────────
(async function init() {
  spawnParticles();
  await loadPresets();
  // Auto-apply first preset as default
  if (state.presetsLoaded) applyPreset(0);
})();
