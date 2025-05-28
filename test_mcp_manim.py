import requests
import json
import os
import base64
import time

# MCP服务器端口和地址 - 根据实际配置调整
HOST = "localhost"
PORT = 8080

def send_manim_request(code):
    """
    向manim-server发送代码请求
    """
    url = f"http://{HOST}:{PORT}"
    headers = {"Content-Type": "application/json"}
    data = {"code": code}
    
    print("发送请求到Manim MCP服务器...")
    try:
        response = requests.post(url, headers=headers, data=json.dumps(data), timeout=60)
        return response.json()
    except Exception as e:
        return {"status": "error", "message": str(e)}

# 创建一个简单的Manim场景
manim_code = """
from manim import *

class MCPTest(Scene):
    def construct(self):
        # 创建标题
        title = Text("通过MCP调用Manim的测试").scale(0.8)
        self.play(Write(title))
        self.wait(1)
        self.play(title.animate.to_edge(UP))
        
        # 创建几何图形
        circle = Circle(radius=2, color=BLUE)
        square = Square(side_length=2, color=GREEN)
        triangle = Triangle().scale(2).set_color(RED)
        
        # 依次展示各个图形
        self.play(Create(circle))
        self.wait(1)
        self.play(Transform(circle, square))
        self.wait(1)
        self.play(Transform(circle, triangle))
        self.wait(1)
        
        # 添加说明
        explanation = Text("由Claude通过MCP创建").scale(0.6).to_edge(DOWN)
        self.play(FadeIn(explanation))
        self.wait(2)
"""

if __name__ == "__main__":
    print("测试MCP与Manim的整合")
    result = send_manim_request(manim_code)
    print(f"服务器响应: {json.dumps(result, indent=2, ensure_ascii=False)}")
    print("测试完成!") 