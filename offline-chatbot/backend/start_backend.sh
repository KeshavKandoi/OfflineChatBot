#!/bin/bash
cd "$(dirname "$0")"
export PYTHONPATH="$PYTHON_RUNTIME_DIR/site-packages"
"$PYTHON_RUNTIME_DIR/python/bin/python3" -m uvicorn main:app --host 127.0.0.1 --port 8000
