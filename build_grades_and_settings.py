#!/usr/bin/env python3
"""
Build script to sync authentic index.html and grades.html with local assets,
seamless local navigation between pages, and hidden settings.
"""
import os
import re

BASE_DIR = os.path.abspath(os.path.dirname(__file__))

def process_index():
    path = os.path.join(BASE_DIR, 'index.html')
    with open(path, 'r', encoding='utf-8') as f:
        html = f.read()

    # Ensure no extra Settings button in navbar
    html = re.sub(r'<div class="nav-item d-flex align-items-center me-2">\s*<button[^>]*>[\s\S]*?</button>\s*</div>', '', html)

    # Clean navbar logo link to local index.html
    html = re.sub(r'<a\s+href="[^"]*"\s+class="navbar-brand d-flex align-items-center m-1 p-0 aabtn">', '<a href="./index.html" class="navbar-brand d-flex align-items-center m-1 p-0 aabtn">', html)

    # Empty name/initials by default
    html = re.sub(
        r'<span class="userbutton"><span class="usertext me-1">[^<]*</span><span class="avatars"><span class="avatar current"><span class="userinitials size-35"[^>]*>[^<]*</span></span></span></span>',
        '<span class="userbutton"><span class="usertext me-1"></span><span class="avatars"><span class="avatar current"><span class="userinitials size-35" title="" aria-label="" role="img"></span></span></span></span>',
        html
    )

    # Dropdown toggle without data-bs-toggle
    html = html.replace('id="action-menu-toggle-0" aria-label="User menu" data-bs-toggle="dropdown"', 'id="action-menu-toggle-0" aria-label="User menu" data-toggle="action-menu"')

    # Authentic menu links
    html = re.sub(
        r'<a href="[^"]*" class="dropdown-item menu-action" role="menuitem" data-title="grades,grades"[^>]*>[\s\S]*?</a>',
        '<a href="./grades.html" class="dropdown-item menu-action" role="menuitem" data-title="grades,grades" tabindex="-1" id="menu-grades-link">\n                                <span class="menu-action-text">Grades</span>\n                        </a>',
        html
    )

    html = re.sub(
        r'<a href="[^"]*" class="dropdown-item menu-action" role="menuitem" data-title="reports,core_reportbuilder"[^>]*>[\s\S]*?</a>',
        '<a href="javascript:void(0)" onclick="openLmsSettingsModal()" class="dropdown-item menu-action" role="menuitem" data-title="reports,core_reportbuilder" tabindex="-1" id="menu-reports-link">\n                                <span class="menu-action-text">Reports</span>\n                        </a>',
        html
    )

    # Navigation links to local index.html
    html = html.replace('https://lms.astanait.edu.kz/my/', './index.html')
    html = html.replace('https://lms.astanait.edu.kz/my/courses.php', './index.html')
    html = html.replace('<div class="homelink"><a href="https://lms.astanait.edu.kz/">Home</a></div>', '<div class="homelink"><a href="./index.html">Home</a></div>')
    html = html.replace('href="https://lms.astanait.edu.kz/login/logout.php?sesskey=TBIHNVHEH8"', 'href="./index.html"')
    html = re.sub(r'(<li class="breadcrumb-item">\s*<a href=")https://lms\.astanait\.edu\.kz/(")', r'\g<1>./index.html\g<2>', html)

    if 'assets/js/lms_settings.js' not in html:
        html = html.replace('</body>', '<script src="./assets/js/lms_settings.js"></script>\n</body>')

    with open(path, 'w', encoding='utf-8') as f:
        f.write(html)
    print("Processed index.html successfully.")

def process_grades():
    orig_path = os.path.join(BASE_DIR, 'original_grades.html')
    if not os.path.exists(orig_path):
        print("original_grades.html not found, skipping grades generation.")
        return

    with open(orig_path, 'r', encoding='utf-8') as f:
        c = f.read()

    replacements = [
        ('https://lms.astanait.edu.kz/pluginfile.php/1/core_admin/favicon/64x64/1794592381/logo%20AITU%28imageonly%29.png', './assets/images/favicon.png'),
        ('https://lms.astanait.edu.kz/pluginfile.php/1/core_admin/logocompact/300x300/1794592381/logo%20AITU%28imageonly%29.png', './assets/images/logo.png'),
        ('https://lms.astanait.edu.kz/theme/yui_combo.php?rollup/3.18.1/yui-moodlesimple-min.css', './assets/css/yui-moodlesimple-min.css'),
        ('https://lms.astanait.edu.kz/theme/styles.php/classic/1794592381_1794592894/all', './assets/css/styles.css'),
        ('https://ps1-dev.oes.kz/inject.php?site2=lms.astanait.edu.kz', './assets/js/inject.js'),
        ('https://lms.astanait.edu.kz/lib/javascript.php/1794592381/lib/polyfills/polyfill.js', './assets/js/polyfill.js'),
        ('https://lms.astanait.edu.kz/theme/yui_combo.php?rollup/3.18.1/yui-moodlesimple-min.js', './assets/js/yui-moodlesimple-min.js'),
        ('https://lms.astanait.edu.kz/lib/javascript.php/1794592381/lib/javascript-static.js', './assets/js/javascript-static.js'),
        ('https://lms.astanait.edu.kz/theme/image.php/classic/forum/1794592381/monologo', './assets/images/monologo.svg'),
        ('https://lms.astanait.edu.kz/lib/javascript.php/1794592381/lib/requirejs/require.min.js', './assets/js/require.min.js'),
        ('https://lms.astanait.edu.kz/lib/javascript.php/1794592381/lib/jquery/jquery-3.7.1.min', './assets/js/jquery-3.7.1.min'),
        ('https://lms.astanait.edu.kz/lib/javascript.php/1794592381/lib/jquery/ui-1.14.1/jquery-ui.min', './assets/js/jquery-ui.min'),
        ('https://lms.astanait.edu.kz/lib/javascript.php/1794592381/lib/requirejs/jquery-private', './assets/js/jquery-private'),
        ('https://lms.astanait.edu.kz/r.php/core/esm/1794592381/@moodle/lms/', './assets/js/esm/'),
        ('https://lms.astanait.edu.kz/r.php/core/esm/1794592381/@moodlehq/design-system', './assets/js/esm/@moodlehq/design-system.js'),
        ('https://lms.astanait.edu.kz/r.php/core/esm/1794592381/react-dom/', './assets/js/esm/'),
        ('https://lms.astanait.edu.kz/r.php/core/esm/1794592381/react-dom', './assets/js/esm/react-dom.js'),
        ('https://lms.astanait.edu.kz/r.php/core/esm/1794592381/react/', './assets/js/esm/'),
        ('https://lms.astanait.edu.kz/r.php/core/esm/1794592381/react', './assets/js/esm/react.js'),
        ('https://cdn.jsdelivr.net/npm/mathjax@4.0.0/tex-mml-chtml.js', './assets/js/mathjax.js'),
        ('https://lms.astanait.edu.kz/theme/yui_combo.php?m/1794592381/', './assets/js/amd/core/first.js'),
        ("baseUrl : 'https://lms.astanait.edu.kz/lib/requirejs.php/1794592381/'", "baseUrl : './assets/js/'"),
    ]

    for old, new in replacements:
        c = c.replace(old, new)

    c = c.replace('"imports": {', '''"imports": {
        "@moodle/lms/core/profiler": "./assets/js/esm/core/profiler.js",
        "react-dom/client": "./assets/js/esm/react-dom-client.js",''')

    # Navbar logo link -> ./index.html
    c = re.sub(r'<a\s+href="[^"]*"\s+class="navbar-brand d-flex align-items-center m-1 p-0 aabtn"[^>]*>', '<a href="./index.html" class="navbar-brand d-flex align-items-center m-1 p-0 aabtn">', c)

    # Breadcrumbs -> ./index.html and ./grades.html
    c = re.sub(r'<a href="https://lms\.astanait\.edu\.kz/">\s*Home\s*</a>', '<a href="./index.html">Home</a>', c)
    c = c.replace('href="https://lms.astanait.edu.kz/grade/report/overview/index.php"', 'href="./grades.html"')

    # Navigation tree block links -> ./index.html
    c = c.replace('href="https://lms.astanait.edu.kz/my/"', 'href="./index.html"')
    c = c.replace('href="https://lms.astanait.edu.kz/my/courses.php"', 'href="./index.html"')
    c = c.replace('href="https://lms.astanait.edu.kz/mod/forum/view.php?id=1"', 'href="./index.html"')
    c = re.sub(r'href="https://lms\.astanait\.edu\.kz/course/view\.php\?id=(\d+)"', r'href="./index.html#course-\1"', c)
    c = c.replace('href="https://lms.astanait.edu.kz/"', 'href="./index.html"')

    # Footer links -> ./index.html
    c = c.replace('<div class="homelink"><a href="https://lms.astanait.edu.kz/">Home</a></div>', '<div class="homelink"><a href="./index.html">Home</a></div>')
    c = c.replace('href="https://lms.astanait.edu.kz/login/logout.php?sesskey=TBIHNVHEH8"', 'href="./index.html"')

    # Title
    c = re.sub(r'<title>Grades[^<]*</title>', '<title id="grades-page-title">Grades | frontpage</title>', c)
    c = re.sub(r'<meta name="keywords" content="moodle, Grades[^"]*" />', '<meta name="keywords" content="moodle, Grades | frontpage" />', c)

    # User dropdown toggle
    c = c.replace('data-bs-toggle="dropdown"', 'data-toggle="action-menu"')
    c = re.sub(r'<span class="usertext me-1">[^<]*</span>', '<span class="usertext me-1"></span>', c)
    c = re.sub(r'<span class="userinitials size-35"[^>]*>[^<]*</span>', '<span class="userinitials size-35" title="" aria-label="" role="img"></span>', c)

    # Dropdown items
    c = c.replace('<a href="https://lms.astanait.edu.kz/grade/report/overview/index.php" class="dropdown-item menu-action" role="menuitem" data-title="grades,grades" tabindex="-1" >', '<a href="./grades.html" class="dropdown-item menu-action" role="menuitem" data-title="grades,grades" tabindex="-1" id="menu-grades-link">')
    c = c.replace('<a href="https://lms.astanait.edu.kz/reportbuilder/index.php" class="dropdown-item menu-action" role="menuitem" data-title="reports,core_reportbuilder" tabindex="-1" >', '<a href="javascript:void(0)" onclick="openLmsSettingsModal()" class="dropdown-item menu-action" role="menuitem" data-title="reports,core_reportbuilder" tabindex="-1" id="menu-reports-link">')

    # Header card student info
    c = re.sub(r'<span class="userinitials size-100"[^>]*>[^<]*</span>', '<span class="userinitials size-100" id="grades-user-avatar" title="" aria-label="" role="img"></span>', c)
    c = re.sub(r'<h1 class="h2 mb-0"[^>]*>[^<]*</h1>', '<h1 class="h2 mb-0" id="grades-user-name"></h1>', c)

    # Table course links
    course_ids = ['2759', '2678', '2647', '2640', '2634', '2589', '2565']
    for idx, cid in enumerate(course_ids):
        c = c.replace(f'https://lms.astanait.edu.kz/course/user.php?mode=grade&amp;id={cid}&amp;user=19734', f'./index.html#course-{cid}')

    # Empty default grades
    for i in range(7):
        c = re.sub(
            rf'(<td class="cell c1" id="grade-report-overview-19734_r{i}_c1">)[^<]*(</td>)',
            r'\g<1>\g<2>',
            c
        )

    # Footer logininfo
    c = c.replace('<div class="logininfo">You are logged in as <a href="https://lms.astanait.edu.kz/user/profile.php?id=19734">Temirlan Abayev</a> (<a href="https://lms.astanait.edu.kz/login/logout.php?sesskey=TBIHNVHEH8">Log out</a>)</div>',
                  '<div class="logininfo">You are logged in as <a href="#" id="footer-user-name"></a> (<a href="./index.html">Log out</a>)</div>')

    if 'assets/js/lms_settings.js' not in c:
        c = c.replace('</body>', '<script src="./assets/js/lms_settings.js"></script>\n</body>')

    out_path = os.path.join(BASE_DIR, 'grades.html')
    with open(out_path, 'w', encoding='utf-8') as f:
        f.write(c)
    print("Generated authentic grades.html successfully.")

if __name__ == '__main__':
    process_index()
    process_grades()
