@echo off
echo 正在后台启动 Manim MCP 服务器...
taskkill /F /IM python.exe 2>nul
timeout /t 1
set logfile=manim_server_log_%random%.txt
start /b python C:/Users/why/Desktop/lesson_ai/manim-mcp-server/src/manim_server.py > %logfile% 2>&1
echo 服务器已在后台启动。日志输出到 %logfile%
echo 服务器地址：http://localhost:8090
echo 健康检查：http://localhost:8090/health 