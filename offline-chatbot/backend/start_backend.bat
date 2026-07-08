@echo off
cd /d "%~dp0"
set PYTHONPATH=%PYTHON_RUNTIME_DIR%\site-packages
"%PYTHON_RUNTIME_DIR%\python.exe" -m uvicorn main:app --host 127.0.0.1 --port 8000
