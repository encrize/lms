#!/usr/bin/env bash
PORT=8080
echo "Запуск локального сервера Moodle фронтпейджа на http://localhost:$PORT ..."
echo "Открыть в браузере: http://localhost:$PORT/index.html"
python3 -m http.server $PORT
