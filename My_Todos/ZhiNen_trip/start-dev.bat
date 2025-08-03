@echo off
echo 启动智旅开发服务器...
cd /d "%~dp0"
echo 当前目录: %CD%
npm run dev
pause