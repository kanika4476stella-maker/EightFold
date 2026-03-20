/**
 * parser.js — Employee profile parser (CSV + JSON)
 * Handles both file formats and normalizes to a common schema
 */

const Parser = (() => {

  /**
   * Parse CSV string into employee profile array
   */
  function parseCSV(text) {
    const lines = text.trim().split('\n').filter(l => l.trim());
    if (lines.length < 2) throw new Error('CSV must have a header row and at least one data row.');

    const headers = lines[0].split(',').map(h => h.trim().toLowerCase().replace(/\s+/g, '_'));
    const employees = [];

    for (let i = 1; i < lines.length; i++) {
      const values = smartSplitCSV(lines[i]);
      if (values.length < headers.length - 1) continue;

      const row = {};
      headers.forEach((h, idx) => {
        row[h] = (values[idx] || '').trim().replace(/^"|"$/g, '');
      });

      employees.push(normalizeEmployee(row, 'csv'));
    }

    return employees;
  }

  /**
   * Handle quoted CSV fields that may contain commas
   */
  function smartSplitCSV(line) {
    const result = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (ch === '"') {
        inQuotes = !inQuotes;
      } else if (ch === ',' && !inQuotes) {
        result.push(current.trim());
        current = '';
      } else {
        current += ch;
      }
    }
    result.push(current.trim());
    return result;
  }

  /**
   * Parse JSON string into employee profile array
   */
  function parseJSON(text) {
    let data;
    try {
      data = JSON.parse(text);
    } catch (e) {
      throw new Error('Invalid JSON format. Please check your file.');
    }

    // Support both array and { employees: [...] }
    const arr = Array.isArray(data) ? data : (data.employees || []);
    if (arr.length === 0) throw new Error('No employee records found in JSON.');

    return arr.map(emp => normalizeEmployee(emp, 'json'));
  }

  /**
   * Normalize any employee row (CSV row or JSON obj) to canonical schema
   */
  function normalizeEmployee(raw, source) {
    const skillsRaw =
      source === 'csv'
        ? (raw.skills || '').replace(/^"|"$/g, '').split(',').map(s => s.trim()).filter(Boolean)
        : (Array.isArray(raw.skills) ? raw.skills : (raw.skills || '').split(',').map(s => s.trim()).filter(Boolean));

    const certsRaw =
      source === 'csv'
        ? (raw.certifications || '').replace(/^"|"$/g, '').split(',').map(s => s.trim()).filter(Boolean)
        : (Array.isArray(raw.certifications) ? raw.certifications : (raw.certifications || '').split(',').map(s => s.trim()).filter(Boolean));

    return {
      id:               raw.id || `emp_${Math.random().toString(36).slice(2, 7)}`,
      name:             raw.name || 'Unknown',
      title:            raw.title || raw.job_title || raw.role || '',
      department:       raw.department || raw.dept || '',
      experience_years: parseInt(raw.experience_years || raw.experience || raw.years || 0, 10),
      skills:           skillsRaw,
      certifications:   certsRaw,
      education:        raw.education || raw.degree || '',
    };
  }

  /**
   * Simulate AI extraction from PDF/DOCX files
   */
  function parseDocument(file) {
    return new Promise((resolve) => {
      // Fake a 1.5s delay to simulate "AI parsing" of the resume
      setTimeout(() => {
        const rawName = file.name.replace(/\.(pdf|docx?)$/i, '').replace(/[-_]/g, ' ');
        const niceName = rawName.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ') || "Extracted Candidate";
        
        // Return a single extracted candidate wrapped in an array
        resolve([normalizeEmployee({
          name: niceName,
          title: 'Software Engineer',
          department: 'Engineering',
          experience_years: Math.floor(Math.random() * 5) + 3,
          skills: ['Python', 'SQL', 'Git', 'Agile'], // Default mock skills
          certifications: [],
          education: "Extracted from Resume"
        }, 'json')]);
      }, 1500);
    });
  }

  /**
   * Parse file object (auto-detect format from extension)
   * Returns a Promise resolving to normalized employee array
   */
  function parseFile(file) {
    return new Promise((resolve, reject) => {
      const ext = file.name.split('.').pop().toLowerCase();
      
      // Handle PDF and Word Docs via simulated AI parse
      if (['pdf', 'doc', 'docx'].includes(ext)) {
        resolve(parseDocument(file));
        return;
      }

      const reader = new FileReader();

      reader.onload = e => {
        try {
          const text = e.target.result;
          if (ext === 'json') {
            resolve(parseJSON(text));
          } else if (ext === 'csv') {
            resolve(parseCSV(text));
          } else {
            try {
              resolve(parseJSON(text));
            } catch {
              resolve(parseCSV(text));
            }
          }
        } catch (err) {
          reject(err);
        }
      };

      reader.onerror = () => reject(new Error('Failed to read file.'));
      reader.readAsText(file);
    });
  }

  return { parseCSV, parseJSON, parseFile, normalizeEmployee };
})();

window.Parser = Parser;
