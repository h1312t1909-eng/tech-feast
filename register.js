/* ============================================================
   TECH FEST 2026 | Registration Form JS — Firebase Edition
   ============================================================ */

'use strict';

// ─── Firebase Imports (ES Module, loaded via type="module") ─
import { saveRegistration, uploadFile, generateRegId }
    from './firebase-config.js';

// ─── Utilities ───────────────────────────────────────────────
const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

function setFieldState(input, state, message = '') {
    const wrap = input.closest('.form-group');
    if (!wrap) return;
    input.classList.remove('error', 'success');
    const existing = wrap.querySelector('.field-message');
    if (existing) existing.remove();
    if (state) {
        input.classList.add(state);
        if (message) {
            const msg = document.createElement('div');
            msg.className = `field-message ${state}`;
            msg.innerHTML = `${state === 'error' ? '✗' : '✓'} ${message}`;
            wrap.appendChild(msg);
        }
    }
}

// ─── Validators ──────────────────────────────────────────────
const validators = {
    required: (v) => v.trim() !== '',
    email: (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()),
    phone: (v) => /^[6-9]\d{9}$/.test(v.trim().replace(/[\s\-]/g, '')),
    name: (v) => /^[A-Za-z\s'-]{2,}$/.test(v.trim()),
    url: (v) => v === '' || /^https?:\/\/.+/.test(v.trim()),
};

function validateField(input) {
    const val = input.value;
    const rules = (input.dataset.validate || '').split(',').map(r => r.trim()).filter(Boolean);
    for (const rule of rules) {
        if (!validators[rule] || !validators[rule](val)) {
            const messages = {
                required: 'This field is required.',
                email: 'Please enter a valid email address.',
                phone: 'Enter a valid 10-digit Indian mobile number.',
                name: 'Name should contain only letters (min 2 chars).',
                url: 'Enter a valid URL (starting with http:// or https://).',
            };
            setFieldState(input, 'error', messages[rule] || 'Invalid value.');
            return false;
        }
    }
    if (val.trim()) setFieldState(input, 'success', '');
    else setFieldState(input, null);
    return true;
}

// ─── Real-time Validation ────────────────────────────────────
function setupValidation(form) {
    const inputs = $$('input[data-validate], select[data-validate], textarea[data-validate]', form);
    inputs.forEach(input => {
        input.addEventListener('blur', () => validateField(input));
        input.addEventListener('input', () => {
            if (input.classList.contains('error')) validateField(input);
        });
    });
}

// ─── Progress Bar ────────────────────────────────────────────
function updateProgress(form) {
    const bar = document.getElementById('form-progress-bar');
    const label = document.getElementById('form-progress-label');
    if (!bar) return;
    const inputs = $$('input[data-validate]:not([type=checkbox]):not([type=radio]), select[data-validate], textarea[data-validate]', form);
    const filled = inputs.filter(i => i.value.trim() !== '').length;
    const pct = inputs.length ? Math.round((filled / inputs.length) * 100) : 0;
    bar.style.width = pct + '%';
    if (label) label.textContent = pct + '% Complete';
}

// ─── Multi-step Form ─────────────────────────────────────────
function setupMultiStep() {
    const steps = $$('[data-step]');
    const nextBtns = $$('[data-next]');
    const prevBtns = $$('[data-prev]');
    const stepItems = $$('.step-item');
    const connectors = $$('.step-connector');
    let current = 1;

    function showStep(n) {
        steps.forEach(s => { s.style.display = parseInt(s.dataset.step) === n ? '' : 'none'; });
        stepItems.forEach((item, i) => {
            item.classList.remove('active', 'done');
            if (i + 1 === n) item.classList.add('active');
            if (i + 1 < n) item.classList.add('done');
        });
        connectors.forEach((c, i) => c.classList.toggle('done', i + 1 < n));
    }

    nextBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const currentStepEl = $(`[data-step="${current}"]`);
            const inputs = $$('input[data-validate], select[data-validate], textarea[data-validate]', currentStepEl);
            let valid = true;
            inputs.forEach(input => { if (!validateField(input)) valid = false; });
            if (!valid) { currentStepEl.querySelector('.error')?.focus(); return; }
            current++;
            showStep(current);
            window.scrollTo({ top: 0, behavior: 'smooth' });
            if (current === 3) buildSummary();
        });
    });

    prevBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            current = Math.max(1, current - 1);
            showStep(current);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    });

    showStep(current);
}

// ─── Build Summary (Step 3) ──────────────────────────────────
function buildSummary() {
    const summaryEl = document.getElementById('summary-content');
    if (!summaryEl) return;

    const getVal = (id) => {
        const el = document.getElementById(id);
        if (!el) return '—';
        if (el.type === 'checkbox') return el.checked ? 'Yes' : 'No';
        return el.value || '—';
    };

    const selectedEvents = [];
    $$('[name="events"]:checked').forEach(cb => selectedEvents.push(cb.value));

    summaryEl.innerHTML = `
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:0.75rem;">
      <div class="sum-item"><span class="sum-label">Name</span><span class="sum-val">${getVal('fullname')}</span></div>
      <div class="sum-item"><span class="sum-label">Email</span><span class="sum-val">${getVal('email')}</span></div>
      <div class="sum-item"><span class="sum-label">Phone</span><span class="sum-val">${getVal('phone')}</span></div>
      <div class="sum-item"><span class="sum-label">Roll No.</span><span class="sum-val">${getVal('rollno')}</span></div>
      <div class="sum-item"><span class="sum-label">Year</span><span class="sum-val">${getVal('year')}</span></div>
      <div class="sum-item"><span class="sum-label">Department</span><span class="sum-val">${getVal('dept')}</span></div>
      ${selectedEvents.length ? `<div class="sum-item" style="grid-column:1/-1;"><span class="sum-label">Selected Events</span><span class="sum-val">${selectedEvents.join(', ')}</span></div>` : ''}
    </div>
  `;

    if (!document.getElementById('sum-style')) {
        const style = document.createElement('style');
        style.id = 'sum-style';
        style.textContent = `.sum-item{padding:.6rem;background:rgba(0,212,255,.03);border-radius:6px;border:1px solid rgba(0,212,255,.1)}.sum-label{display:block;font-size:.72rem;color:var(--text-muted);text-transform:uppercase;letter-spacing:.08em;margin-bottom:.25rem}.sum-val{font-size:.9rem;font-weight:600;color:var(--text)}`;
        document.head.appendChild(style);
    }
}

// ─── Determine which event collection to use ─────────────────
function detectCollectionKey() {
    const path = location.pathname;
    if (path.includes('coding')) return 'coding';
    if (path.includes('quiz')) return 'quiz';
    if (path.includes('robotics')) return 'robotics';
    if (path.includes('exhibition')) return 'exhibition';
    return 'general';
}

// ─── Collect all form data into an object ────────────────────
function collectFormData(form) {
    const data = {};
    const inputs = $$('input, select, textarea', form);

    inputs.forEach(input => {
        if (!input.name) return;
        const val = input.value.trim();

        if (input.type === 'checkbox') {
            if (input.name.endsWith('[]')) {
                if (!data[input.name]) data[input.name] = [];
                if (input.checked) data[input.name].push(val);
            } else {
                data[input.name] = input.checked;
            }
            return;
        }

        if (input.type === 'radio') {
            if (input.checked) data[input.name] = val;
            return;
        }

        if (input.type === 'file') return; // handled separately

        if (input.name.endsWith('[]')) {
            if (!data[input.name]) data[input.name] = [];
            if (val) data[input.name].push(val);
        } else {
            data[input.name] = val;
        }
    });

    return data;
}

// ─── Form Submission Handler ──────────────────────────────────
function setupSubmit(form) {
    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        // Validate all fields
        const inputs = $$('[data-validate]', form);
        let valid = true;
        inputs.forEach(i => { if (!validateField(i)) valid = false; });

        // Consent checks
        const consent = document.getElementById('consent');
        const privacy = document.getElementById('privacy');
        if (consent && !consent.checked) { alert('Please agree to the Terms & Conditions to continue.'); return; }
        if (privacy && !privacy.checked) { alert('Please agree to the Data Privacy policy to continue.'); return; }
        if (!valid) return;

        // Show loading
        const overlay = document.getElementById('loading-overlay');
        if (overlay) overlay.classList.add('show');

        try {
            // Collect base form data
            const formData = collectFormData(form);

            // Handle file upload (project cover image, if present)
            const fileInput = document.getElementById('cover-image');
            if (fileInput && fileInput.files[0]) {
                try {
                    formData.coverImageUrl = await uploadFile(fileInput.files[0], 'project-covers');
                } catch (uploadErr) {
                    console.warn('File upload failed (non-critical):', uploadErr);
                    formData.coverImageUrl = null;
                }
            }

            // Determine which Firestore collection to use
            const collectionKey = detectCollectionKey();

            // Save to Firestore
            const { regId, docId } = await saveRegistration(formData, collectionKey);

            if (overlay) overlay.classList.remove('show');
            showSuccess(regId);

        } catch (err) {
            console.error('Registration error:', err);
            if (overlay) overlay.classList.remove('show');
            showError(err.message || 'Something went wrong. Please try again.');
        }
    });
}

// ─── Show Success Screen ──────────────────────────────────────
function showSuccess(regId) {
    const formWrap = document.getElementById('form-container');
    const successWrap = document.getElementById('success-screen');
    if (formWrap) formWrap.style.display = 'none';
    if (successWrap) {
        successWrap.style.display = 'block';
        const idEl = document.getElementById('reg-id-display');
        if (idEl) idEl.textContent = regId;
        const qrEl = document.getElementById('qr-placeholder');
        if (qrEl) qrEl.innerHTML = `<div style="width:100px;height:100px;background:rgba(0,212,255,.1);border:2px solid rgba(0,212,255,.3);border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:2rem;margin:0 auto;">📱</div>`;
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ─── Show Error Toast ─────────────────────────────────────────
function showError(message) {
    let toast = document.getElementById('error-toast');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'error-toast';
        toast.style.cssText = `
      position:fixed;bottom:2rem;left:50%;transform:translateX(-50%);
      background:#ef4444;color:#fff;padding:1rem 2rem;border-radius:12px;
      font-weight:600;font-size:.9rem;z-index:9999;
      box-shadow:0 8px 30px rgba(239,68,68,.4);
      animation:fadeUp .3s ease forwards;
    `;
        document.body.appendChild(toast);
    }
    toast.textContent = '⚠️ ' + message;
    toast.style.display = 'block';
    setTimeout(() => { toast.style.display = 'none'; }, 5000);
}

// ─── Team Members (Dynamic Add/Remove) ───────────────────────
function setupTeamMembers() {
    const addBtn = document.getElementById('add-member');
    const container = document.getElementById('team-members');
    if (!addBtn || !container) return;

    let count = parseInt(addBtn.dataset.max || 4, 10) === 3 ? 1 : 1;
    const max = parseInt(addBtn.dataset.max || 4, 10);

    addBtn.addEventListener('click', () => {
        const currentCount = container.children.length;
        if (currentCount >= max - 1) {
            addBtn.disabled = true;
            addBtn.textContent = `Maximum ${max} members reached`;
            return;
        }
        count++;
        const memberNum = currentCount + 2;
        const member = document.createElement('div');
        member.className = 'glass-card team-member-dynamic';
        member.style.cssText = 'padding:1.5rem;margin-top:1rem;position:relative;';
        member.innerHTML = `
      <button type="button" class="remove-member"
        style="position:absolute;top:1rem;right:1rem;background:rgba(239,68,68,.15);border:1px solid rgba(239,68,68,.3);color:#ef4444;border-radius:6px;padding:.3rem .75rem;cursor:pointer;font-size:.8rem;"
        onclick="this.closest('.team-member-dynamic').remove();document.getElementById('add-member').disabled=false;document.getElementById('add-member').textContent='+ Add Team Member';">
        ✕ Remove
      </button>
      <h4 style="font-family:var(--font-display);font-size:.82rem;color:var(--primary);margin-bottom:.75rem;letter-spacing:.08em;">MEMBER ${memberNum}</h4>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:1rem;">
        <div class="form-group">
          <label class="form-label">Name <span class="required">*</span></label>
          <input type="text" class="form-input" name="member_name[]" placeholder="Full name" data-validate="required,name" />
        </div>
        <div class="form-group">
          <label class="form-label">Email <span class="required">*</span></label>
          <input type="email" class="form-input" name="member_email[]" placeholder="email@college.edu" data-validate="required,email" />
        </div>
        <div class="form-group">
          <label class="form-label">Mobile <span class="required">*</span></label>
          <input type="tel" class="form-input" name="member_phone[]" placeholder="10-digit" data-validate="required,phone" />
        </div>
      </div>
    `;
        container.appendChild(member);

        // Setup validation on new member
        $$('input[data-validate]', member).forEach(input => {
            input.addEventListener('blur', () => validateField(input));
        });
    });
}

// ─── File Drop Zone ──────────────────────────────────────────
function setupFileInputs() {
    $$('.file-drop-zone').forEach(zone => {
        const input = zone.querySelector('input[type=file]');
        if (!input) return;
        zone.addEventListener('click', () => input.click());
        zone.addEventListener('dragover', (e) => { e.preventDefault(); zone.classList.add('drag-over'); });
        zone.addEventListener('dragleave', () => zone.classList.remove('drag-over'));
        zone.addEventListener('drop', (e) => {
            e.preventDefault();
            zone.classList.remove('drag-over');
            const dt = e.dataTransfer;
            if (dt.files.length) {
                // Assign files to input
                const list = new DataTransfer();
                list.items.add(dt.files[0]);
                input.files = list.files;
                showFileName(zone, input);
            }
        });
        input.addEventListener('change', () => showFileName(zone, input));
    });
}

function showFileName(zone, input) {
    const label = zone.querySelector('.file-label, #cover-label-text');
    if (label && input.files.length) {
        label.innerHTML = `✓ <span style="color:var(--success);">${input.files[0].name}</span>`;
    }
}

// ─── Init ────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('reg-form');
    if (!form) return;

    setupValidation(form);
    setupSubmit(form);
    setupMultiStep();
    setupTeamMembers();
    setupFileInputs();

    form.addEventListener('input', () => updateProgress(form));
    updateProgress(form);
});
