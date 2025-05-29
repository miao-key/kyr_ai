# -*- coding: utf-8 -*-
import json
import base64
import requests
import sys

# 打印调试信息
print("开始测试...")
print(f"Python版本: {sys.version}")

# Manim代码
manim_code = """
from manim import *

class CreateCircle(Scene):
    def construct(self):
        circle = Circle()
        circle.set_fill(PINK, opacity=0.5)
        self.play(Create(circle))
"""

try:
    # 发送请求到manim-server
    print("正在发送请求到服务器...")
    response = requests.post(
        "http://localhost:8090/run",
        json={"code": manim_code},
        timeout=30
    )
    
    print(f"服务器响应状态码: {response.status_code}")
    
    # 尝试解析JSON响应
    try:
        result = response.json()
        print("完整服务器响应:")
        print(json.dumps(result, ensure_ascii=False, indent=2))
        
        if result.get("success"):
            print("动画生成成功!")
            
            # 如果有视频数据，保存为文件
            if "video" in result:
                video_data = base64.b64decode(result["video"])
                with open("circle_animation.mp4", "wb") as f:
                    f.write(video_data)
                print("视频已保存为circle_animation.mp4")
            else:
                print("服务器返回成功但没有视频数据")
        else:
            print("动画生成失败:")
            print(f"标准输出: {result.get('stdout', '无')}")
            print(f"标准错误: {result.get('stderr', '无')}")
    except json.JSONDecodeError:
        print("无法解析服务器响应为JSON:")
        print(response.text[:500])  # 只打印前500个字符
        
except Exception as e:
    print(f"发生错误: {type(e).__name__}: {e}")
