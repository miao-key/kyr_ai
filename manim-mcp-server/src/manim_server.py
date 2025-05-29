import os
import json
import subprocess
import tempfile
import base64
import shutil
from pathlib import Path
from mcp import stdio_server

# 配置
MANIM_EXECUTABLE = os.environ.get("MANIM_EXECUTABLE", "manim")
PORT = int(os.environ.get("PORT", 8090))

def run_manim(code):
    # 创建临时文件夹和Python文件
    temp_dir = tempfile.mkdtemp()
    script_path = os.path.join(temp_dir, "animation.py")
    
    # 写入代码到文件
    with open(script_path, "w", encoding="utf-8") as f:
        f.write(code)
    
    # 运行manim命令
    cmd = [MANIM_EXECUTABLE, script_path, "-pqm"]
    result = subprocess.run(cmd, capture_output=True, text=True)
    
    # 检查输出文件
    media_dir = os.path.join(temp_dir, "media", "videos", "animation", "480p15")
    video_path = ""
    
    if os.path.exists(media_dir):
        for file in os.listdir(media_dir):
            if file.endswith(".mp4"):
                video_path = os.path.join(media_dir, file)
                break
    
    response = {
        "success": result.returncode == 0,
        "stdout": result.stdout,
        "stderr": result.stderr
    }
    
    # 如果成功，添加视频数据
    if video_path and os.path.exists(video_path):
        with open(video_path, "rb") as f:
            video_data = f.read()
            response["video"] = base64.b64encode(video_data).decode('utf-8')
    
    return response

def main():
    async def handle_request(request):
        try:
            code = request.get("code", "")
            if not code:
                return {"error": "没有提供代码"}
            
            result = run_manim(code)
            return result
        except Exception as e:
            return {"error": str(e)}
    
    stdio_server(handle_request)

if __name__ == "__main__":
    main()