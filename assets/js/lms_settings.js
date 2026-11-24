/**
 * LMS Local Settings & Grades Management System
 * Handles:
 * - Dynamic Profile (Full Name & Initials)
 * - Dynamic Grades (0-100, Letter Grades, GPA calculation)
 * - Persistent storage in localStorage
 * - Empty initial state on first launch
 * - Reports / Settings Modal
 */

(function () {
    const STORAGE_KEY = 'lms_user_data';

    const COURSES = [
        { id: '2759', name: 'Physical Education (Athletics) | Kubyshev Azamat', teacher: 'Azamat Kubyshev' },
        { id: '2678', name: 'Information and Communication Technologies | Basheyeva Zhuldyz', teacher: 'Elvira Aitmukhanbetova, Zhuldyz Basheyeva' },
        { id: '2647', name: 'Sociology | Nurkanat Anel', teacher: 'Assem Kusmanova, Anel Nurkanat, Iliyas Tileubergenov' },
        { id: '2640', name: 'Discrete Mathematics | Mukhambetzhan Manshuk', teacher: 'Akerke Merzetkhan, Manshuk Mukhambetzhan' },
        { id: '2634', name: 'Foreign Language 1 (B1) | Tatia Johnson', teacher: 'Tatia Johnson' },
        { id: '2589', name: 'Psychology | Belessova Nursulu', teacher: 'Nursulu Belessova, Aituar Kospakov, Xeniya Tursunbayeva' },
        { id: '2565', name: 'Introduction to Programming | Kydyrbekova Aigerim', teacher: 'Askar Khaimuldin, Aigerim Kydyrbekova' }
    ];

    function getLetterAndGpa(gradeNum) {
        if (isNaN(gradeNum) || gradeNum === null || gradeNum === '') return { letter: '—', gpa: '—' };
        const g = parseFloat(gradeNum);
        if (g >= 95) return { letter: 'A', gpa: '4.0' };
        if (g >= 90) return { letter: 'A-', gpa: '3.67' };
        if (g >= 85) return { letter: 'B+', gpa: '3.33' };
        if (g >= 80) return { letter: 'B', gpa: '3.0' };
        if (g >= 75) return { letter: 'B-', gpa: '2.67' };
        if (g >= 70) return { letter: 'C+', gpa: '2.33' };
        if (g >= 65) return { letter: 'C', gpa: '2.0' };
        if (g >= 60) return { letter: 'C-', gpa: '1.67' };
        if (g >= 55) return { letter: 'D+', gpa: '1.33' };
        if (g >= 50) return { letter: 'D', gpa: '1.0' };
        if (g >= 25) return { letter: 'FX', gpa: '0' };
        return { letter: 'F', gpa: '0' };
    }

    function getInitials(name) {
        if (!name || typeof name !== 'string') return '';
        const parts = name.trim().split(/\s+/);
        if (parts.length === 0 || parts[0] === '') return '';
        if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
        return (parts[0][0] + parts[1][0]).toUpperCase();
    }

    // Load data with empty initial state on 1st launch
    function loadUserData() {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) {
            return {
                fullName: '',
                grades: {}
            };
        }
        try {
            const parsed = JSON.parse(raw);
            return {
                fullName: parsed.fullName || '',
                grades: parsed.grades || {}
            };
        } catch (e) {
            return {
                fullName: '',
                grades: {}
            };
        }
    }

    function saveUserData(data) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
        updatePageUI();
    }

    function updatePageUI() {
        const data = loadUserData();
        const fullName = data.fullName.trim();
        const initials = getInitials(fullName);

        // Update user dropdown name
        document.querySelectorAll('.usertext').forEach(el => {
            el.textContent = fullName;
        });

        // Update avatar initials
        document.querySelectorAll('.userinitials').forEach(el => {
            el.textContent = initials;
            el.setAttribute('title', fullName);
            el.setAttribute('aria-label', fullName);
            if (!fullName) {
                el.style.opacity = '0.5';
            } else {
                el.style.opacity = '1';
            }
        });

        // Update footer logininfo
        document.querySelectorAll('.logininfo').forEach(el => {
            if (fullName) {
                el.innerHTML = `You are logged in as <a href="#">${fullName}</a> (<a href="javascript:void(0)" onclick="openLmsSettingsModal()">Edit</a> | <a href="./index.html">Log out</a>)`;
            } else {
                el.innerHTML = `You are logged in as <a href="javascript:void(0)" onclick="openLmsSettingsModal()">[Не указано - Нажмите для настройки]</a>`;
            }
        });

        // If on grades.html, render the grades table
        const gradesTableBody = document.getElementById('grades-table-body');
        const gradesTableFoot = document.getElementById('grades-table-foot');
        if (gradesTableBody) {
            renderGradesTable(data, gradesTableBody, gradesTableFoot);
        }

        // If grades page header has user name
        const gradesUserName = document.getElementById('grades-user-name');
        if (gradesUserName) {
            gradesUserName.textContent = fullName || 'Студент (ФИО не указано)';
        }
        const gradesUserAvatar = document.getElementById('grades-user-avatar');
        if (gradesUserAvatar) {
            gradesUserAvatar.textContent = initials || '—';
        }
    }

    function renderGradesTable(data, tbody, tfoot) {
        tbody.innerHTML = '';
        let totalScore = 0;
        let count = 0;

        COURSES.forEach((course, idx) => {
            const rawGrade = data.grades[course.id];
            const hasGrade = rawGrade !== undefined && rawGrade !== null && String(rawGrade).trim() !== '';
            const gradeVal = hasGrade ? String(rawGrade).trim() : '—';
            let letter = '—';
            let percentage = '—';

            if (hasGrade && !isNaN(gradeVal)) {
                const num = parseFloat(gradeVal);
                totalScore += num;
                count++;
                letter = getLetterAndGpa(num).letter;
                percentage = num.toFixed(1) + '%';
            } else if (hasGrade) {
                letter = gradeVal;
            }

            const tr = document.createElement('tr');
            tr.className = idx % 2 === 0 ? 'table-row-even' : 'table-row-odd';
            tr.innerHTML = `
                <td class="align-middle">
                    <a href="./index.html#course-${course.id}" class="fw-bold text-decoration-none">
                        <i class="fa fa-book me-2 text-primary" aria-hidden="true"></i>${course.name}
                    </a>
                    <div class="text-muted small ps-4">${course.teacher}</div>
                </td>
                <td class="text-center align-middle fw-bold ${hasGrade ? 'text-primary' : 'text-muted'}">
                    ${gradeVal}
                </td>
                <td class="text-center align-middle text-muted">0–100</td>
                <td class="text-center align-middle">${percentage}</td>
                <td class="text-center align-middle">
                    <span class="badge ${hasGrade ? 'bg-success text-white' : 'bg-secondary text-light'}" style="font-size: 0.9rem;">
                        ${letter}
                    </span>
                </td>
            `;
            tbody.appendChild(tr);
        });

        if (tfoot) {
            if (count > 0) {
                const avg = (totalScore / count).toFixed(2);
                const info = getLetterAndGpa(totalScore / count);
                tfoot.innerHTML = `
                    <tr>
                        <td class="text-end fw-bold">Средний балл (GPA / Average):</td>
                        <td class="text-center fw-bold text-success">${avg}</td>
                        <td class="text-center text-muted">0–100</td>
                        <td class="text-center fw-bold">${avg}%</td>
                        <td class="text-center"><span class="badge bg-primary fs-6">${info.letter} (${info.gpa})</span></td>
                    </tr>
                `;
            } else {
                tfoot.innerHTML = `
                    <tr>
                        <td class="text-end fw-bold">Средний балл (Average):</td>
                        <td class="text-center text-muted">—</td>
                        <td class="text-center text-muted">0–100</td>
                        <td class="text-center text-muted">—</td>
                        <td class="text-center text-muted">—</td>
                    </tr>
                `;
            }
        }
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
                <h5 class="modal-title m-0 d-flex align-items-center text-primary">
                    <i class="fa fa-sliders me-2"></i> Настройки профиля и оценок
                </h5>
                <button type="button" class="btn-close" id="lms-modal-close-btn" aria-label="Close" style="background:none;border:none;font-size:1.5rem;line-height:1;cursor:pointer;">&times;</button>
            </div>
            <div class="modal-body p-4" style="overflow-y:auto;max-height:calc(90vh - 140px);">
                <div class="alert alert-info py-2 px-3 mb-3" style="font-size: 0.88rem;">
                    <i class="fa fa-info-circle me-1"></i> Здесь вы можете указать своё <strong>Имя и Фамилию</strong> и настроить <strong>оценки</strong> по всем курсам. Все данные сохраняются в вашем браузере (localStorage).
                </div>
                
                <div class="mb-4">
                    <label for="lms-input-fullname" class="form-label fw-bold" style="font-size: 0.95rem;">
                        <i class="fa fa-user me-1 text-primary"></i> Ваше Имя и Фамилия:
                    </label>
                    <input type="text" class="form-control" id="lms-input-fullname" placeholder="Например: Иван Иванов" style="font-size: 1rem;">
                    <div class="form-text text-muted" style="font-size: 0.8rem;">Отображается в правом верхнем углу меню, на аватаре и на странице оценок.</div>
                </div>

                <hr class="my-3">

                <div class="mb-2">
                    <label class="form-label fw-bold d-flex justify-content-between align-items-center" style="font-size: 0.95rem;">
                        <span><i class="fa fa-graduation-cap me-1 text-primary"></i> Оценки по дисциплинам:</span>
                        <span class="badge bg-light text-dark border">Балл 0–100</span>
                    </label>
                    <div class="p-3 bg-light rounded border">
                        ${courseInputsHTML}
                    </div>
                </div>
            </div>
            <div class="modal-footer d-flex justify-content-between p-3 border-top bg-light" style="border-bottom-left-radius:10px;border-bottom-right-radius:10px;">
                <button type="button" class="btn btn-outline-danger btn-sm" id="lms-modal-reset-btn">
                    <i class="fa fa-trash me-1"></i> Очистить всё (Пусто)
                </button>
                <div class="d-flex gap-2">
                    <button type="button" class="btn btn-secondary btn-sm" id="lms-modal-cancel-btn">Отмена</button>
                    <button type="button" class="btn btn-primary btn-sm px-3" id="lms-modal-save-btn">
                        <i class="fa fa-check me-1"></i> Сохранить
                    </button>
                </div>
            </div>
        `;

        document.body.appendChild(backdrop);
        document.body.appendChild(modal);

        // Attach listeners
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

            showToastNotification('Изменения успешно сохранены!');
        };

        document.getElementById('lms-modal-reset-btn').onclick = function () {
            if (confirm('Сбросить имя и все оценки в пустое состояние?')) {
                document.getElementById('lms-input-fullname').value = '';
                document.querySelectorAll('.grade-input').forEach(input => {
                    input.value = '';
                });
                saveUserData({ fullName: '', grades: {} });
                closeLmsSettingsModal();
                showToastNotification('Все данные очищены!');
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

    // Expose globally
    window.openLmsSettingsModal = openLmsSettingsModal;
    window.closeLmsSettingsModal = closeLmsSettingsModal;

    // Attach click listeners to reports and grades menu items
    function setupNavHooks() {
        // Toggle user dropdown reliably
        const userDropdownToggle = document.getElementById('action-menu-toggle-0');
        const userDropdownMenu = document.getElementById('action-menu-0-menu');
        if (userDropdownToggle && userDropdownMenu) {
            userDropdownToggle.addEventListener('click', function (e) {
                e.preventDefault();
                e.stopPropagation();
                const isShown = userDropdownMenu.classList.contains('show');
                if (isShown) {
                    userDropdownMenu.classList.remove('show');
                    userDropdownToggle.setAttribute('aria-expanded', 'false');
                } else {
                    userDropdownMenu.classList.add('show');
                    userDropdownToggle.setAttribute('aria-expanded', 'true');
                }
            });

            document.addEventListener('click', function (e) {
                if (!userDropdownToggle.contains(e.target) && !userDropdownMenu.contains(e.target)) {
                    userDropdownMenu.classList.remove('show');
                    userDropdownToggle.setAttribute('aria-expanded', 'false');
                }
            });
        }

        // Hook Reports to open settings
        document.querySelectorAll('a[data-title*="reports"]').forEach(link => {
            link.addEventListener('click', function (e) {
                e.preventDefault();
                e.stopPropagation();
                if (userDropdownMenu) userDropdownMenu.classList.remove('show');
                openLmsSettingsModal();
            });
        });

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

        // Close button inside notification popover
        const closeNotifBtn = document.querySelector('[data-action="close-notification-popover"]');
        if (closeNotifBtn && notifContainer) {
            closeNotifBtn.addEventListener('click', function (e) {
                e.preventDefault();
                notifContainer.classList.add('collapsed');
                notifContainer.classList.remove('expanded');
            });
        }
    }

    // Initialize on DOM ready
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
