#!/usr/bin/env bash
PORT=8080
echo "Starting local Moodle LMS server on http://localhost:$PORT ..."
echo "Open in browser: http://localhost:$PORT/index.html"
python3 -m http.server $PORT
