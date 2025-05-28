import requests
import json

# 测试Manim MCP服务器
def test_manim_server():
    url = "http://localhost:8090/v1/run"
    
    # 简单的Manim代码示例
    code = """
from manim import *

class MCPTest(Scene):
    def construct(self):
        circle = Circle()
        circle.set_fill(BLUE, opacity=0.5)
        self.play(Create(circle))
        self.wait()
"""
    
    # 发送请求
    response = requests.post(
        url,
        json={"code": code}
    )
    
    # 打印响应
    print("响应状态码:", response.status_code)
    print("响应内容:", response.json())

if __name__ == "__main__":
    test_manim_server() 