#!/usr/bin/env python3
import os
import re

BASE_DIR = os.path.abspath(os.path.dirname(__file__))

with open(os.path.join(BASE_DIR, 'index.html'), 'r', encoding='utf-8') as f:
    html = f.read()

# 1. Update initial user name and initials in navbar to be empty on first launch
html = re.sub(
    r'<span class="userbutton"><span class="usertext me-1">[^<]*</span><span class="avatars"><span class="avatar current"><span class="userinitials size-35"[^>]*>[^<]*</span></span></span></span>',
    '<span class="userbutton"><span class="usertext me-1"></span><span class="avatars"><span class="avatar current"><span class="userinitials size-35" title="" aria-label="" role="img"></span></span></span></span>',
    html
)

# 2. Update user menu Grades link to local ./grades.html
html = re.sub(
    r'<a href="https://lms\.astanait\.edu\.kz/grade/report/overview/index\.php" class="dropdown-item menu-action" role="menuitem" data-title="grades,grades"[^>]*>\s*<span class="menu-action-text">Grades</span>\s*</a>',
    '<a href="./grades.html" class="dropdown-item menu-action" role="menuitem" data-title="grades,grades" tabindex="-1" id="menu-grades-link"><span class="menu-action-text"><i class="fa fa-graduation-cap me-2 text-primary" aria-hidden="true"></i>Grades</span></a>',
    html
)

# 3. Update Reports link in user menu to trigger settings modal
html = re.sub(
    r'<a href="https://lms\.astanait\.edu\.kz/reportbuilder/index\.php" class="dropdown-item menu-action" role="menuitem" data-title="reports,core_reportbuilder"[^>]*>\s*<span class="menu-action-text">Reports</span>\s*</a>',
    '<a href="javascript:void(0)" onclick="openLmsSettingsModal()" class="dropdown-item menu-action" role="menuitem" data-title="reports,core_reportbuilder" tabindex="-1" id="menu-reports-link"><span class="menu-action-text"><i class="fa fa-sliders me-2 text-primary" aria-hidden="true"></i>Reports (Настройки)</span></a>',
    html
)

# Also update Preferences link in user menu to trigger settings modal
html = re.sub(
    r'<a href="https://lms\.astanait\.edu\.kz/user/preferences\.php" class="dropdown-item menu-action" role="menuitem" data-title="preferences,moodle"[^>]*>\s*<span class="menu-action-text">Preferences</span>\s*</a>',
    '<a href="javascript:void(0)" onclick="openLmsSettingsModal()" class="dropdown-item menu-action" role="menuitem" data-title="preferences,moodle" tabindex="-1"><span class="menu-action-text"><i class="fa fa-gear me-2 text-primary" aria-hidden="true"></i>Preferences</span></a>',
    html
)

# 4. Update footer logininfo to be empty by default on first launch
html = re.sub(
    r'<div class="logininfo">You are logged in as <a href="[^"]*">[^<]*</a> \([^)]*\)</div>',
    '<div class="logininfo">You are logged in as <a href="javascript:void(0)" onclick="openLmsSettingsModal()"></a></div>',
    html
)

# 5. Add a Settings button in navbar header
settings_nav_button = '''
                <div class="nav-item d-flex align-items-center me-2">
                    <button type="button" class="btn btn-sm btn-primary text-white d-flex align-items-center shadow-sm px-2 py-1" onclick="openLmsSettingsModal()" title="Настройки профиля и оценок" style="font-weight: 500; font-size: 0.85rem; border-radius: 4px;">
                        <i class="fa fa-sliders me-1" aria-hidden="true"></i>
                        <span class="d-none d-md-inline">Настройки</span>
                    </button>
                </div>
'''

if 'id="usernavigation"' in html and 'openLmsSettingsModal()' not in html.split('id="usernavigation"')[1].split('</div>')[0]:
    html = html.replace(
        '<div id="usernavigation" class="navbar-nav my-1 ms-auto">',
        '<div id="usernavigation" class="navbar-nav my-1 ms-auto">' + settings_nav_button
    )

# 6. Include lms_settings.js before </body>
if 'lms_settings.js' not in html:
    html = html.replace('</body>', '<script src="./assets/js/lms_settings.js"></script>\n</body>')

with open(os.path.join(BASE_DIR, 'index.html'), 'w', encoding='utf-8') as f:
    f.write(html)

print("Updated index.html successfully!")

# 7. Generate grades.html based on index.html
# Extract parts of index.html
head_match = re.search(r'(<head>.*?</head>)', html, re.DOTALL)
navbar_match = re.search(r'(<nav class="fixed-top navbar.*?</nav>)', html, re.DOTALL)
footer_match = re.search(r'(<footer id="page-footer".*?</footer>)', html, re.DOTALL)

# Extract columnleft and columnright blocks from index.html
left_block_match = re.search(r'(<div class="columnleft blockcolumn.*?</div>\s*</div>\s*</div>)', html, re.DOTALL)
right_block_match = re.search(r'(<div class="columnright blockcolumn.*?</div>\s*</div>\s*</div>)', html, re.DOTALL)

grades_header = '''
        <header id="page-header" class="row" data-for="page-heading">
    <div class="col-12 pt-3 pb-3">
        <div class="card">
            <div class="card-body">
                <div class="d-flex align-items-center">
                    <div class="me-auto">
                        <div class="page-context-header d-flex flex-wrap align-items-center mb-2">
                            <div class="page-header-headings">
                                <h1 class="h2 mb-0"><i class="fa fa-graduation-cap me-2 text-primary" aria-hidden="true"></i>Grades - Overview report</h1>
                            </div>
                        </div>
                    </div>
                    <div class="header-actions-container flex-shrink-0" data-region="header-actions-container">
                        <button type="button" class="btn btn-primary btn-sm d-flex align-items-center shadow-sm" onclick="openLmsSettingsModal()">
                            <i class="fa fa-sliders me-1" aria-hidden="true"></i>
                            <span>Настроить оценки и ФИО</span>
                        </button>
                    </div>
                </div>
                <div class="d-flex flex-wrap">
                    <div id="page-navbar">
                        <nav aria-label="Breadcrumb">
                            <ol class="breadcrumb">
                                <li class="breadcrumb-item">
                                    <a href="./index.html">Home</a>
                                </li>
                                <li class="breadcrumb-item">
                                    <a href="./grades.html" aria-current="page">Grades</a>
                                </li>
                                <li class="breadcrumb-item active" aria-current="page">
                                    Overview report
                                </li>
                            </ol>
                        </nav>
                    </div>
                </div>
            </div>
        </div>
    </div>
</header>
'''

grades_main_content = '''
            <div id="region-main-box" class="region-main">
                <div id="region-main" class="region-main-content">
                    <span class="notifications" id="user-notifications"></span>
                    <div role="main">
                        <span id="maincontent" tabindex="-1"></span>
                        
                        <!-- Student Profile Summary Card -->
                        <div class="card mb-4 border shadow-sm">
                            <div class="card-body p-3 d-flex flex-wrap align-items-center justify-content-between">
                                <div class="d-flex align-items-center me-3 mb-2 mb-md-0">
                                    <div id="grades-user-avatar" class="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center me-3 fw-bold shadow-sm" style="width: 52px; height: 52px; font-size: 20px;">
                                        ST
                                    </div>
                                    <div>
                                        <h4 class="h5 mb-0 fw-bold" id="grades-user-name">Sairan Targynov</h4>
                                        <div class="text-muted small">
                                            <span class="badge bg-light text-dark border me-1">Student</span>
                                            <span>Astana IT University &bull; Bachelor's Degree</span>
                                        </div>
                                    </div>
                                </div>
                                <div>
                                    <button class="btn btn-outline-primary btn-sm" onclick="openLmsSettingsModal()">
                                        <i class="fa fa-pencil me-1"></i> Изменить оценки / ФИО
                                    </button>
                                </div>
                            </div>
                        </div>

                        <!-- Grades Table Card -->
                        <div class="card mb-4 border shadow-sm">
                            <div class="card-header bg-white border-bottom py-3 d-flex justify-content-between align-items-center">
                                <h5 class="card-title mb-0 fw-bold text-dark">
                                    <i class="fa fa-table me-2 text-primary"></i>Сводная ведомость успеваемости (Courses Grades)
                                </h5>
                                <span class="badge bg-secondary text-light">2026–2027 Academic Year</span>
                            </div>
                            <div class="card-body p-0">
                                <div class="table-responsive">
                                    <table class="table table-hover table-striped mb-0 moodle-grades-table" id="grades-table" style="font-size: 0.95rem;">
                                        <thead class="table-light border-bottom">
                                            <tr>
                                                <th scope="col" class="py-3 ps-3" style="width: 44%;">Course name (Дисциплина)</th>
                                                <th scope="col" class="py-3 text-center" style="width: 14%;">Grade (Балл)</th>
                                                <th scope="col" class="py-3 text-center" style="width: 14%;">Range (Диапазон)</th>
                                                <th scope="col" class="py-3 text-center" style="width: 14%;">Percentage (%)</th>
                                                <th scope="col" class="py-3 text-center pe-3" style="width: 14%;">Letter (Буква)</th>
                                            </tr>
                                        </thead>
                                        <tbody id="grades-table-body">
                                            <!-- Dynamically populated by lms_settings.js -->
                                        </tbody>
                                        <tfoot id="grades-table-foot" class="table-light border-top">
                                            <!-- GPA / Average summary -->
                                        </tfoot>
                                    </table>
                                </div>
                            </div>
                        </div>

                        <!-- Info Alert -->
                        <div class="alert alert-info border d-flex align-items-center mb-4">
                            <i class="fa fa-circle-info fa-2x text-info me-3"></i>
                            <div>
                                <strong>Официальная система оценивания AITU:</strong> Оценки от 50 до 100 баллов являются положительными (A, B, C, D). При балле ниже 50 выставляется FX / F. Все данные сохраняются в вашем браузере.
                            </div>
                        </div>

                    </div>
                </div>
            </div>
'''

# Assemble grades.html
head_content = head_match.group(1).replace('<title>Home | frontpage</title>', '<title>Grades - Overview report | AITU LMS</title>')

grades_html = f'''<!DOCTYPE html>
<html dir="ltr" lang="en" xml:lang="en">
{head_content}
<body id="page-grade-report-overview-index" class="limitedwidth format-site course path-grade path-grade-report path-grade-report-overview gecko dir-ltr lang-en yui-skin-sam yui3-skin-sam lms-astanait-edu-kz pagelayout-standard course-1 context-2 theme jsenabled">

<div id="page-wrapper" class="d-print-block">
    <div>
        <a class="visually-hidden-focusable" href="#maincontent">Skip to main content</a>
    </div>

    {navbar_match.group(1)}

    <div id="page" class="container-fluid d-print-block">
        {grades_header}

        <div id="page-content" class="d-flex flex-wrap blocks-pre blocks-post d-print-block">
            {grades_main_content}

            {left_block_match.group(1)}

            {right_block_match.group(1)}
        </div>
    </div>

    {footer_match.group(1)}
</div>

<script src="./assets/js/lms_settings.js"></script>
</body>
</html>
'''

with open(os.path.join(BASE_DIR, 'grades.html'), 'w', encoding='utf-8') as f:
    f.write(grades_html)

print("Generated grades.html successfully!")
