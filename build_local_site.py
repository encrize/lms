#!/usr/bin/env python3
import os
import re
import sys
import ssl
import json
import urllib.request
import urllib.error
from urllib.parse import urlparse, unquote, quote

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Accept': '*/*',
    'Accept-Language': 'en-US,en;q=0.9,ru;q=0.8',
}

BASE_DIR = os.path.abspath(os.path.dirname(__file__))

DIRS = [
    'assets/css',
    'assets/js',
    'assets/js/amd',
    'assets/js/amd/core',
    'assets/js/esm',
    'assets/js/esm/@moodlehq',
    'assets/js/esm/core',
    'assets/fonts',
    'assets/images',
    'assets/images/css',
    'assets/docs',
]

for d in DIRS:
    os.makedirs(os.path.join(BASE_DIR, d), exist_ok=True)

def fetch(url, dest_path=None, binary=True):
    if dest_path and os.path.exists(dest_path) and os.path.getsize(dest_path) > 0:
        print(f"[CACHE] {os.path.basename(dest_path)}")
        if binary:
            with open(dest_path, 'rb') as f:
                return f.read()
        else:
            with open(dest_path, 'r', encoding='utf-8', errors='ignore') as f:
                return f.read()

    print(f"[FETCH] {url} -> {dest_path if dest_path else 'memory'}")
    req = urllib.request.Request(url, headers=HEADERS)
    try:
        with urllib.request.urlopen(req, context=ctx, timeout=25) as resp:
            data = resp.read()
            if dest_path:
                with open(dest_path, 'wb') as f:
                    f.write(data)
            if binary:
                return data
            return data.decode('utf-8', errors='ignore')
    except Exception as e:
        print(f"[ERROR] Failed fetching {url}: {e}")
        return None

print("=== Step 1: Downloading Main JS files ===")
js_files = {
    'assets/js/polyfill.js': 'https://lms.astanait.edu.kz/lib/javascript.php/1794592381/lib/polyfills/polyfill.js',
    'assets/js/yui-moodlesimple-min.js': 'https://lms.astanait.edu.kz/theme/yui_combo.php?rollup/3.18.1/yui-moodlesimple-min.js',
    'assets/js/javascript-static.js': 'https://lms.astanait.edu.kz/lib/javascript.php/1794592381/lib/javascript-static.js',
    'assets/js/require.min.js': 'https://lms.astanait.edu.kz/lib/javascript.php/1794592381/lib/requirejs/require.min.js',
    'assets/js/jquery-3.7.1.min.js': 'https://lms.astanait.edu.kz/lib/javascript.php/1794592381/lib/jquery/jquery-3.7.1.min.js',
    'assets/js/jquery-ui.min.js': 'https://lms.astanait.edu.kz/lib/javascript.php/1794592381/lib/jquery/ui-1.14.1/jquery-ui.min.js',
    'assets/js/jquery-private.js': 'https://lms.astanait.edu.kz/lib/javascript.php/1794592381/lib/requirejs/jquery-private.js',
    'assets/js/filepicker.js': 'https://lms.astanait.edu.kz/lib/javascript.php/1794592381/repository/filepicker.js',
    'assets/js/comment.js': 'https://lms.astanait.edu.kz/lib/javascript.php/1794592381/comment/comment.js',
    'assets/js/inject.js': 'https://ps1-dev.oes.kz/inject.php?site2=lms.astanait.edu.kz',
    'assets/js/mathjax.js': 'https://cdn.jsdelivr.net/npm/mathjax@4.0.0/tex-mml-chtml.js',
    'assets/js/amd/core/first.js': 'https://lms.astanait.edu.kz/lib/requirejs.php/1794592381/core/first.js',
    'assets/js/esm/@moodlehq/design-system.js': 'https://lms.astanait.edu.kz/r.php/core/esm/1794592381/@moodlehq/design-system',
    'assets/js/esm/react.js': 'https://lms.astanait.edu.kz/r.php/core/esm/1794592381/react',
    'assets/js/esm/react-dom.js': 'https://lms.astanait.edu.kz/r.php/core/esm/1794592381/react-dom',
    'assets/js/esm/react-dom-client.js': 'https://lms.astanait.edu.kz/r.php/core/esm/1794592381/react-dom/client',
    'assets/js/esm/core/react_autoinit.js': 'https://lms.astanait.edu.kz/r.php/core/esm/1794592381/@moodle/lms/core/react_autoinit',
    'assets/js/esm/core/profiler.js': 'https://lms.astanait.edu.kz/r.php/core/esm/1794592381/@moodle/lms/core/profiler',
    'assets/js/esm/core/mount.js': 'https://lms.astanait.edu.kz/r.php/core/esm/1794592381/@moodle/lms/core/mount',
}

for dest, url in js_files.items():
    fetch(url, os.path.join(BASE_DIR, dest))

print("\n=== Step 2: Downloading Page Images ===")
page_images = {
    'assets/images/favicon.png': 'https://lms.astanait.edu.kz/pluginfile.php/1/core_admin/favicon/64x64/1794592381/logo%20AITU%28imageonly%29.png',
    'assets/images/logo.png': 'https://lms.astanait.edu.kz/pluginfile.php/1/core_admin/logocompact/300x300/1794592381/logo%20AITU%28imageonly%29.png',
    'assets/images/f1.png': 'https://lms.astanait.edu.kz/theme/image.php/classic/core/1794592381/u/f1',
    'assets/images/document.svg': 'https://lms.astanait.edu.kz/theme/image.php/classic/core/1794592381/f/document',
    'assets/images/pdf.svg': 'https://lms.astanait.edu.kz/theme/image.php/classic/core/1794592381/f/pdf',
    'assets/images/monologo.svg': 'https://lms.astanait.edu.kz/theme/image.php/classic/forum/1794592381/monologo',
    'assets/images/moodlelogo_grayhat.svg': 'https://lms.astanait.edu.kz/theme/image.php/classic/core/1794592381/moodlelogo_grayhat',
}

for dest, url in page_images.items():
    fetch(url, os.path.join(BASE_DIR, dest))

print("\n=== Step 3: Downloading and Processing CSS ===")
# 3a. YUI CSS
yui_css_url = 'https://lms.astanait.edu.kz/theme/yui_combo.php?rollup/3.18.1/yui-moodlesimple-min.css'
yui_css_raw = fetch(yui_css_url, binary=False)
if yui_css_raw:
    # Look for sprite_icons.png
    sprite_url = 'https://lms.astanait.edu.kz/theme/yui_image.php?file=3.18.1/sprite_icons.png'
    fetch(sprite_url, os.path.join(BASE_DIR, 'assets/images/css/sprite_icons.png'))
    yui_css_rewritten = re.sub(
        r'url\([\'\"]?/theme/yui_image\.php\?file=3\.18\.1/sprite_icons\.png[\'\"]?\)',
        'url("../images/css/sprite_icons.png")',
        yui_css_raw
    )
    with open(os.path.join(BASE_DIR, 'assets/css/yui-moodlesimple-min.css'), 'w', encoding='utf-8') as f:
        f.write(yui_css_rewritten)
    print("Saved assets/css/yui-moodlesimple-min.css")

# 3b. Classic styles.php CSS
styles_url = 'https://lms.astanait.edu.kz/theme/styles.php/classic/1794592381_1794592894/all'
styles_raw = fetch(styles_url, binary=False)

if styles_raw:
    css_urls = set(re.findall(r'url\([\'\"]?([^\'\"\)]+)[\'\"]?\)', styles_raw))
    print(f"Found {len(css_urls)} URLs inside styles.php")
    
    url_replacements = {}
    for u in css_urls:
        if u.startswith('data:'):
            continue
        
        full_u = u
        if full_u.startswith('//'):
            full_u = 'https:' + full_u
        elif full_u.startswith('/'):
            full_u = 'https://lms.astanait.edu.kz' + full_u
        
        # Check if font or image
        parsed = urlparse(full_u)
        path = parsed.path
        filename = os.path.basename(path)
        
        if '/font.php/' in full_u or any(ext in filename.lower() for ext in ['.woff2', '.woff', '.ttf', '.eot']):
            # Font file
            dest_file = filename
            dest_path = os.path.join(BASE_DIR, 'assets/fonts', dest_file)
            fetch(full_u, dest_path)
            url_replacements[u] = f'../fonts/{dest_file}'
        else:
            # Image or other resource
            # Clean filename
            if not filename or filename.startswith('php') or filename == 'all':
                safe_name = re.sub(r'[^a-zA-Z0-9_\-\.]', '_', path.strip('/'))[-40:]
            else:
                safe_name = filename
            if '.' not in safe_name:
                safe_name += '.png'
            safe_name = safe_name.replace('%', '_')
            
            dest_path = os.path.join(BASE_DIR, 'assets/images/css', safe_name)
            fetch(full_u, dest_path)
            url_replacements[u] = f'../images/css/{safe_name}'
    
    # Replace in styles.php
    def replace_css_url(match):
        raw = match.group(1).strip('\'"')
        if raw in url_replacements:
            return f'url("{url_replacements[raw]}")'
        return match.group(0)

    styles_rewritten = re.sub(r'url\((.*?)\)', replace_css_url, styles_raw)
    with open(os.path.join(BASE_DIR, 'assets/css/styles.css'), 'w', encoding='utf-8') as f:
        f.write(styles_rewritten)
    print("Saved assets/css/styles.css with all URLs rewritten locally!")

print("\n=== Step 4: Generating Local Documents / Hot Links Mock Files ===")
# Generate clean placeholder documents for all files listed in the student hot links
doc_files = [
    'AITU_prod_v5_macOS.seb',
    'Safe Exam Browser (SEB) instruction.pdf',
    'Акад.календари 2026-2027 бакалавриат-1 курс.pdf',
    'Акад.календари 2026-2027 бакалавриат-2 курс.pdf',
    'Акад.календари 2026-2027 бакалавриат-3 курс.pdf',
    'Академ календарь 2026-2027_1 курс_МАГ.pdf',
    'Академ календарь 2026-2027_1 курс_ADA_МАГ.pdf',
    'Академ календарь 2026-2027_2 курс_МАГ.pdf',
    'Академ календарь 2026-2027_1 курс_ДОК.pdf',
    'Академ календарь 2026-2027_2 курс_ДОК.pdf',
    'Академ календарь 2026-2027_3 курс_ДОК.pdf',
    'Академ календарь 2026-2027_1 курс_Зимняя_Док.pdf',
    'Академ календарь 2025-2026_2 курс_Зимняя_Док (2).pdf',
    'Академ календарь_2026-2027_1 курс_Зимняя_Маг.pdf',
    'Полож. о порядке предост грантов и скидок.pdf',
    'Military_department.rar',
    '0 Академическая политика.pdf',
    'Методические указания к выполнению дипломных работ и дипломных проектов ТОО «Astana IT University» (1).pdf',
    'МЕТОДИЧЕСКИЕ УКАЗАНИЯ К ВЫПОЛНЕНИЮ ВЫПУСКНОЙ РАБОТЫ, КАК СТАРТАП-ПРОЕКТА (1).pdf',
    '23. Методические указания к выполнению магистерских диссертаций и проектов в ТОО «Astana IT University»_сентябрь 2026.pdf',
    '16 Методические указания по выполнению научно-исследовательской работы и научной стажировки магистранта ТОО «Astana IT University».pdf',
    'Appendix 16 Methodological Guidelines for the Implementation of Master’s Research Work and Scientific Internship of «Astana IT University» LLP.pdf',
    '17. МЕТОДИЧЕСКИЕ УКАЗАНИЯ ПО ВЫПОЛНЕНИЮ НИРД_сентябрь 2026.pdf',
    '20 Правила проведения итоговой аттестации обучающихся ТОО «Astana IT University».pdf',
    'WhatsApp Image 2022-05-18 at 10.08.24.jpeg',
    'Для выпускного курса бакалавриата_магистратуры.pdf',
    'AITU_Diploma_2025-2026.zip',
    'AITU Thesis Template (1) (3).zip',
    'Методические рекомендации  по организации дуального обучения ТОО «Astana IT University».pdf',
    'Справочник-путеводитель_каз_AITU.pdf',
    'Справочник-путеводитель_рус_AITU.pdf',
    'Student Guide for academic year 2025-2026_eng_AITU.pdf',
    'LA_ka171_sm_incoming_learning-agreement-studies.docx',
    'FX retake instructions (kaz,ru,eng).pdf',
    'Instructions for students (kaz,ru,eng).pdf',
    'Instructions for Students Course Credit Transfer.pdf',
    'Білім алушыларға арналған пәндерді қайта есептеу нұсқаулығы.pdf',
    'Инструкция по перезачету.pdf',
]

def make_dummy_pdf(path, title):
    content = f"""%PDF-1.4
1 0 obj
<< /Type /Catalog /Pages 2 0 R >>
endobj
2 0 obj
<< /Type /Pages /Kids [3 0 R] /Count 1 >>
endobj
3 0 obj
<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>
endobj
4 0 obj
<< /Length 85 >>
stream
BT
/F1 16 Tf
50 720 Td
(Astana IT University - Document Archive) Tj
ET
endstream
endobj
5 0 obj
<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>
endobj
xref
0 6
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
0000000244 00000 n 
0000000381 00000 n 
trailer
<< /Size 6 /Root 1 0 R >>
startxref
460
%%EOF
"""
    with open(path, 'wb') as f:
        f.write(content.encode('ascii'))

for doc_name in doc_files:
    dest = os.path.join(BASE_DIR, 'assets/docs', doc_name)
    if not os.path.exists(dest):
        if doc_name.endswith('.pdf'):
            make_dummy_pdf(dest, doc_name.replace('.pdf', ''))
        elif doc_name.endswith('.jpeg') or doc_name.endswith('.jpg') or doc_name.endswith('.png'):
            # Copy logo or 1x1 jpeg
            fetch('https://lms.astanait.edu.kz/theme/image.php/classic/core/1794592381/u/f1', dest)
        else:
            with open(dest, 'wb') as f:
                f.write(f"Astana IT University Local Document Archive: {doc_name}\n".encode('utf-8'))

print("Created all local documents in assets/docs/")

print("\n=== Step 5: Rewriting HTML to create index.html ===")
with open(os.path.join(BASE_DIR, 'original.html'), 'r', encoding='utf-8', errors='ignore') as f:
    html = f.read()

# Only keep the first complete HTML document if duplicated
html_end = html.find('</html>')
if html_end != -1:
    html = html[:html_end + len('</html>')]

# 1. Update favicon
html = re.sub(
    r'<link rel="shortcut icon" href="[^"]*logo%20AITU%28imageonly%29\.png" />',
    '<link rel="shortcut icon" href="./assets/images/favicon.png" />',
    html
)

# 2. Update CSS links
html = re.sub(
    r'<link rel="stylesheet" type="text/css" href="https://lms\.astanait\.edu\.kz/theme/yui_combo\.php\?rollup/3\.18\.1/yui-moodlesimple-min\.css" />',
    '<link rel="stylesheet" type="text/css" href="./assets/css/yui-moodlesimple-min.css" />',
    html
)

html = re.sub(
    r'<link rel="stylesheet" type="text/css" href="https://lms\.astanait\.edu\.kz/theme/styles\.php/classic/[^"]+/all" />',
    '<link rel="stylesheet" type="text/css" href="./assets/css/styles.css" />',
    html
)

# 3. Update importmap
importmap_replacement = """<script type="importmap">{
    "imports": {
        "@moodle/lms/core/profiler": "./assets/js/esm/core/profiler.js",
        "@moodle/lms/core/mount": "./assets/js/esm/core/mount.js",
        "@moodle/lms/core/react_autoinit": "./assets/js/esm/core/react_autoinit.js",
        "@moodle/lms/": "./assets/js/esm/",
        "@moodlehq/design-system": "./assets/js/esm/@moodlehq/design-system.js",
        "react": "./assets/js/esm/react.js",
        "react-dom": "./assets/js/esm/react-dom.js",
        "react-dom/client": "./assets/js/esm/react-dom-client.js"
    }
}</script>"""

html = re.sub(
    r'<script type="importmap">.*?</script>',
    importmap_replacement,
    html,
    flags=re.DOTALL
)

# 4. Update modulepreload
html = re.sub(
    r'<link rel="modulepreload" href="https://lms\.astanait\.edu\.kz/r\.php/core/esm/[^"]+/@moodlehq/design-system" />',
    '<link rel="modulepreload" href="./assets/js/esm/@moodlehq/design-system.js" />',
    html
)
html = re.sub(
    r'<link rel="modulepreload" href="https://lms\.astanait\.edu\.kz/r\.php/core/esm/[^"]+/react" />',
    '<link rel="modulepreload" href="./assets/js/esm/react.js" />',
    html
)
html = re.sub(
    r'<link rel="modulepreload" href="https://lms\.astanait\.edu\.kz/r\.php/core/esm/[^"]+/react-dom" />',
    '<link rel="modulepreload" href="./assets/js/esm/react-dom.js" />',
    html
)

# 5. Update inject.php
html = re.sub(
    r'<script src=[\'"]https://ps1-dev\.oes\.kz/inject\.php\?site2=lms\.astanait\.edu\.kz[\'"]></script>',
    '<script src="./assets/js/inject.js"></script>',
    html
)

# 6. Update Content-Security-Policy
html = re.sub(
    r'<meta http-equiv=[\'"]Content-Security-Policy[\'"][^>]*>',
    '<meta http-equiv="Content-Security-Policy" content="default-src \'self\' \'unsafe-inline\' \'unsafe-eval\' data: blob:;">',
    html
)

# 7. Update core head scripts
html = re.sub(
    r'<script src="https://lms\.astanait\.edu\.kz/lib/javascript\.php/[^"]+/lib/polyfills/polyfill\.js"></script>',
    '<script src="./assets/js/polyfill.js"></script>',
    html
)
html = re.sub(
    r'<script src="https://lms\.astanait\.edu\.kz/theme/yui_combo\.php\?rollup/3\.18\.1/yui-moodlesimple-min\.js"></script>',
    '<script src="./assets/js/yui-moodlesimple-min.js"></script>',
    html
)
html = re.sub(
    r'<script src="https://lms\.astanait\.edu\.kz/lib/javascript\.php/[^"]+/lib/javascript-static\.js"></script>',
    '<script src="./assets/js/javascript-static.js"></script>',
    html
)

# 8. Update require.min.js
html = re.sub(
    r'<script src="https://lms\.astanait\.edu\.kz/lib/javascript\.php/[^"]+/lib/requirejs/require\.min\.js"></script>',
    '<script src="./assets/js/require.min.js"></script>',
    html
)

# 9. Update image sources
html = re.sub(
    r'src="https://lms\.astanait\.edu\.kz/pluginfile\.php/1/core_admin/logocompact/300x300/[^"]+/logo%20AITU%28imageonly%29\.png"',
    'src="./assets/images/logo.png"',
    html
)
html = re.sub(
    r'src="https://lms\.astanait\.edu\.kz/theme/image\.php/classic/core/[^"]+/u/f1"',
    'src="./assets/images/f1.png"',
    html
)
html = re.sub(
    r'src="https://lms\.astanait\.edu\.kz/theme/image\.php/classic/core/[^"]+/f/document"',
    'src="./assets/images/document.svg"',
    html
)
html = re.sub(
    r'src="https://lms\.astanait\.edu\.kz/theme/image\.php/classic/core/[^"]+/f/pdf"',
    'src="./assets/images/pdf.svg"',
    html
)
html = re.sub(
    r'src="https://lms\.astanait\.edu\.kz/theme/image\.php/classic/forum/[^"]+/monologo"',
    'src="./assets/images/monologo.svg"',
    html
)
html = re.sub(
    r'src="https://lms\.astanait\.edu\.kz/theme/image\.php/classic/core/[^"]+/moodlelogo_grayhat"',
    'src="./assets/images/moodlelogo_grayhat.svg"',
    html
)

# 10. Update require config
require_config_replacement = """var require = {
    baseUrl : './assets/js/amd/',
    enforceDefine: false,
    skipDataMain: true,
    waitSeconds : 0,

    paths: {
        jquery: '../jquery-3.7.1.min',
        jqueryui: '../jquery-ui.min',
        jqueryprivate: '../jquery-private'
    },

    map: {
      '*': { jquery: 'jqueryprivate' },
      jqueryprivate: { jquery: 'jquery' }
    }
};"""

html = re.sub(
    r'var require = \{.*?\};\n',
    require_config_replacement + '\n',
    html,
    flags=re.DOTALL
)

# 11. Update mathjax url in require call
html = html.replace(
    '"mathjaxurl":"https:\\/\\/cdn.jsdelivr.net\\/npm\\/mathjax@4.0.0\\/tex-mml-chtml.js"',
    '"mathjaxurl":"./assets/js/mathjax.js"'
)

# 12. Update document links in hot links and forum attachments
for doc in doc_files:
    # Match both URL-encoded and unencoded versions in href
    encoded_doc = quote(doc)
    # in html it might be encoded
    html = html.replace(f'https://lms.astanait.edu.kz/pluginfile.php/39991/block_html/content/{encoded_doc}', f'./assets/docs/{encoded_doc}')
    html = html.replace(f'https://lms.astanait.edu.kz/pluginfile.php/39991/block_html/content/{doc}', f'./assets/docs/{encoded_doc}')
    html = html.replace(f'https://lms.astanait.edu.kz/pluginfile.php/79/mod_forum/attachment/19856/{encoded_doc}?forcedownload=1', f'./assets/docs/{encoded_doc}')
    html = html.replace(f'https://lms.astanait.edu.kz/pluginfile.php/79/mod_forum/attachment/19823/{encoded_doc}?forcedownload=1', f'./assets/docs/{encoded_doc}')
    html = html.replace(f'https://lms.astanait.edu.kz/pluginfile.php/79/mod_forum/attachment/14944/{encoded_doc}?forcedownload=1', f'./assets/docs/{encoded_doc}')

# Also replace any remaining pluginfile.php links that point to files in assets/docs
def replace_pluginfile(match):
    full = match.group(0)
    url = match.group(1)
    fname = os.path.basename(urlparse(url).path)
    decoded_fname = unquote(fname)
    for doc in doc_files:
        if doc == decoded_fname or quote(doc) == fname:
            return f'href="./assets/docs/{quote(doc)}"'
    return full

html = re.sub(r'href="(https://lms\.astanait\.edu\.kz/pluginfile\.php/[^"]+)"', replace_pluginfile, html)

# 13. Update M.cfg and YUI_config
html = html.replace('"wwwroot":"https:\\/\\/lms.astanait.edu.kz"', '"wwwroot":"."')
html = html.replace('"apibase":"https:\\/\\/lms.astanait.edu.kz\\/r.php\\/api"', '"apibase":"./api"')

# Save index.html
with open(os.path.join(BASE_DIR, 'index.html'), 'w', encoding='utf-8') as f:
    f.write(html)

print("SUCCESS: index.html has been generated!")
