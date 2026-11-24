/**
 * LMS Local Settings & Dynamic Data Management
 * 100% Authentic Moodle look with hidden settings modal triggered via "Reports".
 * Data persists in localStorage. Empty by default on first launch.
 */

(function () {
    const STORAGE_KEY = 'lms_user_data';

    const COURSES = [
        { id: '2759', rowIdx: 0, name: 'Physical Education (Athletics) | Kubyshev Azamat' },
        { id: '2678', rowIdx: 1, name: 'Information and Communication Technologies | Basheyeva Zhuldyz' },
        { id: '2647', rowIdx: 2, name: 'Sociology | Nurkanat Anel' },
        { id: '2640', rowIdx: 3, name: 'Discrete Mathematics | Mukhambetzhan Manshuk' },
        { id: '2634', rowIdx: 4, name: 'Foreign Language 1 (B1) | Tatia Johnson' },
        { id: '2589', rowIdx: 5, name: 'Psychology | Belessova Nursulu' },
        { id: '2565', rowIdx: 6, name: 'Introduction to Programming | Kydyrbekova Aigerim' }
    ];

    function getInitials(name) {
        if (!name || typeof name !== 'string') return '';
        const parts = name.trim().split(/\s+/);
        if (parts.length === 0 || parts[0] === '') return '';
        if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
        return (parts[0][0] + parts[1][0]).toUpperCase();
    }

    // Load data with fallback across localStorage and sessionStorage
    function loadUserData() {
        let raw = null;
        try {
            raw = localStorage.getItem(STORAGE_KEY);
        } catch (e) {}

        if (!raw) {
            try {
                raw = sessionStorage.getItem(STORAGE_KEY);
            } catch (e) {}
        }

        if (!raw) {
            return {
                fullName: '',
                grades: {}
            };
        }

        try {
            const parsed = JSON.parse(raw);
            const data = {
                fullName: (parsed.fullName || '').trim(),
                grades: parsed.grades || {}
            };
            // Keep both storages synchronized
            try { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); } catch (e) {}
            try { sessionStorage.setItem(STORAGE_KEY, JSON.stringify(data)); } catch (e) {}
            return data;
        } catch (e) {
            return {
                fullName: '',
                grades: {}
            };
        }
    }

    function saveUserData(data) {
        const json = JSON.stringify(data);
        try { localStorage.setItem(STORAGE_KEY, json); } catch (e) {}
        try { sessionStorage.setItem(STORAGE_KEY, json); } catch (e) {}

        try {
            if (window.BroadcastChannel) {
                const bc = new BroadcastChannel('lms_sync_channel');
                bc.postMessage(data);
                bc.close();
            }
        } catch (e) {}

        updatePageUI();
    }

    function updatePageUI() {
        const data = loadUserData();
        const fullName = data.fullName.trim();
        const initials = getInitials(fullName);

        // 1. Navbar user text & avatar
        document.querySelectorAll('.usertext').forEach(el => {
            el.textContent = fullName;
        });

        document.querySelectorAll('.userinitials').forEach(el => {
            el.textContent = initials;
            if (fullName) {
                el.setAttribute('title', fullName);
                el.setAttribute('aria-label', fullName);
            } else {
                el.removeAttribute('title');
                el.removeAttribute('aria-label');
            }
        });

        // 2. Footer logininfo (authentic Moodle look)
        document.querySelectorAll('.logininfo').forEach(el => {
            if (fullName) {
                el.innerHTML = `You are logged in as <a href="#">${fullName}</a> (<a href="./index.html">Log out</a>)`;
            } else {
                el.innerHTML = `You are logged in as <a href="#"></a> (<a href="./index.html">Log out</a>)`;
            }
        });

        // 3. Grades page header & title
        const gradesUserName = document.getElementById('grades-user-name');
        if (gradesUserName) {
            gradesUserName.textContent = fullName;
        }
        const gradesUserAvatar = document.getElementById('grades-user-avatar');
        if (gradesUserAvatar) {
            gradesUserAvatar.textContent = initials;
            if (fullName) {
                gradesUserAvatar.setAttribute('title', fullName);
                gradesUserAvatar.setAttribute('aria-label', fullName);
            } else {
                gradesUserAvatar.removeAttribute('title');
                gradesUserAvatar.removeAttribute('aria-label');
            }
        }
        const pageTitle = document.getElementById('grades-page-title');
        if (pageTitle) {
            document.title = fullName ? `Grades - ${fullName} | frontpage` : `Grades | frontpage`;
        }

        // 4. Grades table rows (authentic Moodle table)
        COURSES.forEach(course => {
            const cell = document.getElementById(`grade-report-overview-19734_r${course.rowIdx}_c1`);
            if (cell) {
                const rawGrade = data.grades[course.id];
                if (rawGrade !== undefined && rawGrade !== null && String(rawGrade).trim() !== '') {
                    const num = parseFloat(rawGrade);
                    cell.textContent = !isNaN(num) ? num.toFixed(2) : String(rawGrade).trim();
                } else {
                    cell.textContent = '';
                }
            }
        });
    }

    // Modal Builder and Controller
    function createModalHTML() {
        if (document.getElementById('lms-settings-modal-backdrop')) return;

        const backdrop = document.createElement('div');
        backdrop.id = 'lms-settings-modal-backdrop';
        backdrop.style.cssText = 'position:fixed;top:0;left:0;width:100vw;height:100vh;background:rgba(0,0,0,0.55);z-index:99999;display:none;opacity:0;transition:opacity 0.2s ease;';

        const modal = document.createElement('div');
        modal.id = 'lms-settings-modal';
        modal.style.cssText = 'position:fixed;top:50%;left:50%;transform:translate(-50%, -50%) scale(0.95);background:#fff;border-radius:10px;box-shadow:0 12px 35px rgba(0,0,0,0.3);width:92%;max-width:680px;max-height:90vh;z-index:100000;display:none;flex-direction:column;opacity:0;transition:all 0.2s ease;font-family:inherit;';

        let courseInputsHTML = '';
        COURSES.forEach(course => {
            courseInputsHTML += `
                <div class="mb-3 row align-items-center">
                    <label class="col-sm-8 col-form-label text-truncate" title="${course.name}" style="font-size: 0.9rem;">
                        ${course.name.split('|')[0].trim()}
                    </label>
                    <div class="col-sm-4">
                        <input type="number" min="0" max="100" step="0.5" class="form-control form-control-sm grade-input" data-courseid="${course.id}" placeholder="0–100" style="text-align:center;">
                    </div>
                </div>
            `;
        });

        modal.innerHTML = `
            <div class="modal-header d-flex justify-content-between align-items-center p-3 border-bottom bg-light" style="border-top-left-radius:10px;border-top-right-radius:10px;">
                <h5 class="modal-title m-0 d-flex align-items-center text-primary" style="font-weight:600;">
                    <i class="fa fa-sliders me-2"></i> Profile & Grade Settings
                </h5>
                <button type="button" class="btn-close" id="lms-modal-close-btn" aria-label="Close" style="background:none;border:none;font-size:1.5rem;line-height:1;cursor:pointer;">&times;</button>
            </div>
            <div class="modal-body p-4" style="overflow-y:auto;max-height:calc(90vh - 140px);">
                <div class="alert alert-info py-2 px-3 mb-3" style="font-size: 0.88rem;">
                    <i class="fa fa-info-circle me-1"></i> Configure your full name and course grades. Changes are stored locally in your browser.
                </div>
                
                <div class="mb-4">
                    <label for="lms-input-fullname" class="form-label fw-bold" style="font-size: 0.95rem;">
                        <i class="fa fa-user me-1 text-primary"></i> Full Name:
                    </label>
                    <input type="text" class="form-control" id="lms-input-fullname" placeholder="e.g. Temirlan Abayev" style="font-size: 1rem;">
                </div>

                <hr class="my-3">

                <div class="mb-2">
                    <label class="form-label fw-bold d-flex justify-content-between align-items-center" style="font-size: 0.95rem;">
                        <span><i class="fa fa-graduation-cap me-1 text-primary"></i> Course Grades (0–100):</span>
                    </label>
                    <div class="p-3 bg-light rounded border">
                        ${courseInputsHTML}
                    </div>
                </div>
            </div>
            <div class="modal-footer d-flex justify-content-between p-3 border-top bg-light" style="border-bottom-left-radius:10px;border-bottom-right-radius:10px;">
                <button type="button" class="btn btn-outline-danger btn-sm" id="lms-modal-reset-btn">
                    <i class="fa fa-trash me-1"></i> Reset All
                </button>
                <div class="d-flex gap-2">
                    <button type="button" class="btn btn-secondary btn-sm" id="lms-modal-cancel-btn">Cancel</button>
                    <button type="button" class="btn btn-primary btn-sm px-3" id="lms-modal-save-btn">
                        <i class="fa fa-check me-1"></i> Save Changes
                    </button>
                </div>
            </div>
        `;

        document.body.appendChild(backdrop);
        document.body.appendChild(modal);

        document.getElementById('lms-modal-close-btn').onclick = closeLmsSettingsModal;
        document.getElementById('lms-modal-cancel-btn').onclick = closeLmsSettingsModal;
        backdrop.onclick = closeLmsSettingsModal;

        document.getElementById('lms-modal-save-btn').onclick = function () {
            const fullName = document.getElementById('lms-input-fullname').value.trim();
            const grades = {};
            document.querySelectorAll('.grade-input').forEach(input => {
                const cid = input.getAttribute('data-courseid');
                const val = input.value.trim();
                if (val !== '') {
                    grades[cid] = val;
                }
            });

            saveUserData({ fullName, grades });
            closeLmsSettingsModal();
            showToastNotification('Changes saved successfully!');
        };

        document.getElementById('lms-modal-reset-btn').onclick = function () {
            if (confirm('Reset full name and all course grades?')) {
                document.getElementById('lms-input-fullname').value = '';
                document.querySelectorAll('.grade-input').forEach(input => {
                    input.value = '';
                });
                saveUserData({ fullName: '', grades: {} });
                closeLmsSettingsModal();
                showToastNotification('All data cleared!');
            }
        };
    }

    function showToastNotification(message) {
        let toast = document.getElementById('lms-toast');
        if (!toast) {
            toast = document.createElement('div');
            toast.id = 'lms-toast';
            toast.style.cssText = 'position:fixed;bottom:25px;right:25px;background:#28a745;color:#fff;padding:12px 20px;border-radius:6px;box-shadow:0 6px 16px rgba(0,0,0,0.25);z-index:100001;font-size:0.95rem;transition:all 0.3s ease;transform:translateY(30px);opacity:0;pointer-events:none;';
            document.body.appendChild(toast);
        }
        toast.innerHTML = `<i class="fa fa-check-circle me-1"></i> ${message}`;
        toast.style.transform = 'translateY(0)';
        toast.style.opacity = '1';
        setTimeout(() => {
            toast.style.transform = 'translateY(30px)';
            toast.style.opacity = '0';
        }, 2500);
    }

    function openLmsSettingsModal() {
        createModalHTML();
        const data = loadUserData();
        const inputName = document.getElementById('lms-input-fullname');
        if (inputName) {
            inputName.value = data.fullName || '';
        }
        document.querySelectorAll('.grade-input').forEach(input => {
            const cid = input.getAttribute('data-courseid');
            input.value = data.grades[cid] !== undefined ? data.grades[cid] : '';
        });

        const backdrop = document.getElementById('lms-settings-modal-backdrop');
        const modal = document.getElementById('lms-settings-modal');
        if (backdrop && modal) {
            backdrop.style.display = 'block';
            modal.style.display = 'flex';
            setTimeout(() => {
                backdrop.style.opacity = '1';
                modal.style.opacity = '1';
                modal.style.transform = 'translate(-50%, -50%) scale(1)';
            }, 10);
        }
    }

    function closeLmsSettingsModal() {
        const backdrop = document.getElementById('lms-settings-modal-backdrop');
        const modal = document.getElementById('lms-settings-modal');
        if (backdrop && modal) {
            backdrop.style.opacity = '0';
            modal.style.opacity = '0';
            modal.style.transform = 'translate(-50%, -50%) scale(0.95)';
            setTimeout(() => {
                backdrop.style.display = 'none';
                modal.style.display = 'none';
            }, 200);
        }
    }

    window.openLmsSettingsModal = openLmsSettingsModal;
    window.closeLmsSettingsModal = closeLmsSettingsModal;

    function setupNavHooks() {
        const userDropdownToggle = document.getElementById('action-menu-toggle-0');
        const userDropdownMenu = document.getElementById('action-menu-0-menu');
        if (userDropdownToggle && userDropdownMenu) {
            userDropdownToggle.removeAttribute('data-bs-toggle');

            userDropdownToggle.addEventListener('click', function (e) {
                e.preventDefault();
                e.stopPropagation();
                const isShown = userDropdownMenu.classList.contains('show');
                if (isShown) {
                    userDropdownMenu.classList.remove('show');
                    userDropdownToggle.classList.remove('show');
                    userDropdownToggle.setAttribute('aria-expanded', 'false');
                } else {
                    userDropdownMenu.classList.add('show');
                    userDropdownToggle.classList.add('show');
                    userDropdownToggle.setAttribute('aria-expanded', 'true');
                }
            });

            document.addEventListener('click', function (e) {
                if (!userDropdownToggle.contains(e.target) && !userDropdownMenu.contains(e.target)) {
                    userDropdownMenu.classList.remove('show');
                    userDropdownToggle.classList.remove('show');
                    userDropdownToggle.setAttribute('aria-expanded', 'false');
                }
            });

            document.addEventListener('keydown', function (e) {
                if (e.key === 'Escape') {
                    userDropdownMenu.classList.remove('show');
                    userDropdownToggle.classList.remove('show');
                    userDropdownToggle.setAttribute('aria-expanded', 'false');
                }
            });
        }

        // Language dropdown toggle
        const langToggle = document.getElementById('drop-down-6b05b49b20c8e6b05b49b1ac8d14') || document.querySelector('[data-bs-toggle="dropdown"][title="Language"]');
        const langMenu = document.getElementById('drop-down-menu-6b05b49b20c8e6b05b49b1ac8d14') || (langToggle ? langToggle.nextElementSibling : null);
        if (langToggle && langMenu) {
            langToggle.removeAttribute('data-bs-toggle');
            langToggle.addEventListener('click', function (e) {
                e.preventDefault();
                e.stopPropagation();
                const isShown = langMenu.classList.contains('show');
                if (isShown) {
                    langMenu.classList.remove('show');
                    langToggle.classList.remove('show');
                    langToggle.setAttribute('aria-expanded', 'false');
                } else {
                    langMenu.classList.add('show');
                    langToggle.classList.add('show');
                    langToggle.setAttribute('aria-expanded', 'true');
                }
            });
            document.addEventListener('click', function (e) {
                if (!langToggle.contains(e.target) && !langMenu.contains(e.target)) {
                    langMenu.classList.remove('show');
                    langToggle.classList.remove('show');
                    langToggle.setAttribute('aria-expanded', 'false');
                }
            });
        }

        // Hook Reports to open settings modal secretly
        const reportsLink = document.getElementById('menu-reports-link') || document.querySelector('a[data-title*="reports"]');
        if (reportsLink) {
            reportsLink.addEventListener('click', function (e) {
                e.preventDefault();
                e.stopPropagation();
                if (userDropdownMenu) {
                    userDropdownMenu.classList.remove('show');
                    if (userDropdownToggle) userDropdownToggle.classList.remove('show');
                }
                openLmsSettingsModal();
            });
        }

        // Hook Grades to navigate to grades.html
        document.querySelectorAll('a[data-title*="grades"]').forEach(link => {
            link.setAttribute('href', './grades.html');
        });

        // Notifications popover toggle
        const notifToggle = document.querySelector('[data-region="popover-region-toggle"]');
        const notifContainer = document.querySelector('.popover-region-notifications');
        const notifPopover = document.querySelector('.popover-region-container');
        if (notifToggle && notifContainer) {
            notifToggle.addEventListener('click', function (e) {
                e.preventDefault();
                e.stopPropagation();
                const isCollapsed = notifContainer.classList.contains('collapsed');
                if (isCollapsed) {
                    notifContainer.classList.remove('collapsed');
                    notifContainer.classList.add('expanded');
                    if (notifPopover) notifPopover.setAttribute('aria-hidden', 'false');
                } else {
                    notifContainer.classList.add('collapsed');
                    notifContainer.classList.remove('expanded');
                    if (notifPopover) notifPopover.setAttribute('aria-hidden', 'true');
                }
            });
            document.addEventListener('click', function (e) {
                if (!notifContainer.contains(e.target)) {
                    notifContainer.classList.add('collapsed');
                    notifContainer.classList.remove('expanded');
                    if (notifPopover) notifPopover.setAttribute('aria-hidden', 'true');
                }
            });
        }

        const closeNotifBtn = document.querySelector('[data-action="close-notification-popover"]');
        if (closeNotifBtn && notifContainer) {
            closeNotifBtn.addEventListener('click', function (e) {
                e.preventDefault();
                notifContainer.classList.add('collapsed');
                notifContainer.classList.remove('expanded');
            });
        }
    }

    // Sync across tabs & pages
    window.addEventListener('storage', updatePageUI);
    try {
        if (window.BroadcastChannel) {
            const bc = new BroadcastChannel('lms_sync_channel');
            bc.onmessage = function (ev) {
                if (ev && ev.data) {
                    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(ev.data)); } catch (e) {}
                    try { sessionStorage.setItem(STORAGE_KEY, JSON.stringify(ev.data)); } catch (e) {}
                    updatePageUI();
                }
            };
        }
    } catch (e) {}

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            setupNavHooks();
            updatePageUI();
        });
    } else {
        setupNavHooks();
        updatePageUI();
    }
})();
