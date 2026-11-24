# Astana IT University LMS Moodle (Offline Clone)

A standalone, 100% offline replica of the Astana IT University LMS Moodle portal homepage and grades overview.

## Features

- **Fully Offline:** All stylesheets, JavaScript runtime, React/ESM modules, FontAwesome webfonts, icons, and documents are bundled locally without external network calls.
- **Authentic UI:** Exact Moodle Classic/Boost theme layout, navbar, course announcements, navigation tree, and grades table.
- **Grades Overview (`grades.html`):** Native Moodle two-column course grade overview with local navigation.
- **Persistent Session:** Profile name, avatar initials, and course grades persist across pages and tabs via local storage.

## Quick Start

Start the local server:
```bash
./start.sh
```
Or directly via Python:
```bash
python3 -m http.server 8080
```
Open in browser: [http://localhost:8080/index.html](http://localhost:8080/index.html) (or open `index.html` directly).

## Project Structure

```text
.
├── index.html                   # Moodle portal homepage
├── grades.html                  # Authentic grades overview page
├── start.sh                     # Lightweight server startup script
├── assets/
│   ├── css/                     # Local stylesheets
│   ├── fonts/                   # FontAwesome webfonts (.woff2, .ttf)
│   ├── images/                  # Local icons and logos
│   ├── js/                      # Local scripts (Moodle core, RequireJS, jQuery, ESM)
│   └── docs/                    # Local documents and study guides
└── lib/ajax/service-nologin.php # Local mock handler for background AJAX calls
```
