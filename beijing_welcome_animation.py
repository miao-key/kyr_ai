#!/usr/bin/env python
# -*- coding: utf-8 -*-

import requests
import json
import os
import base64
import time

# MCP服务器端口和地址 - 根据实际配置调整
HOST = "localhost"
PORT = 8090  # 根据manim_server.py中的配置

def send_manim_request(code):
    """
    向manim MCP服务器发送代码请求
    """
    url = f"http://{HOST}:{PORT}"
    headers = {"Content-Type": "application/json"}
    data = {"code": code}
    
    print("发送请求到Manim MCP服务器...")
    try:
        response = requests.post(url, headers=headers, data=json.dumps(data), timeout=120)
        return response.json()
    except Exception as e:
        return {"status": "error", "message": str(e)}

# 创建"北京欢迎您"的Manim场景
manim_code = """
from manim import *

class MCPTest(Scene):
    def construct(self):
        # 创建标题
        title = Text("北京欢迎您", font="SimHei").scale(1.5)
        subtitle = Text("Beijing Welcomes You", font="Arial").scale(0.8)
        subtitle.next_to(title, DOWN, buff=0.5)
        
        # 设置颜色 - 使用中国红
        title.set_color("#DE2910")
        
        # 创建背景元素 - 天安门剪影（使用基本图形）
        # 建筑主体
        building = Rectangle(height=1.2, width=2.0, color=BLACK, fill_opacity=1)
        building.to_edge(DOWN, buff=0.5)
        
        # 顶部
        top1 = Rectangle(height=0.3, width=2.8, color=BLACK, fill_opacity=1)
        top1.next_to(building, UP, buff=0)
        
        top2 = Rectangle(height=0.3, width=3.5, color=BLACK, fill_opacity=1)
        top2.next_to(top1, UP, buff=0)
        
        # 屋顶中央塔
        tower = Rectangle(height=0.4, width=0.5, color=BLACK, fill_opacity=1)
        tower.next_to(top2, UP, buff=0)
        
        # 将所有部分组合成天安门
        tiananmen = VGroup(building, top1, top2, tower)
        
        # 创建五星
        star = Star(n=5, outer_radius=0.5, inner_radius=0.2, color=YELLOW)
        stars = VGroup(*[star.copy() for _ in range(5)])
        stars.arrange(RIGHT, buff=0.4)
        stars.to_edge(UP, buff=1)
        
        # 动画序列
        # 先显示五星
        self.play(LaggedStart(*[FadeIn(s, scale=1.5) for s in stars], lag_ratio=0.2))
        self.wait(0.5)
        
        # 显示天安门
        self.play(DrawBorderThenFill(tiananmen))
        self.wait(0.5)
        
        # 显示标题
        self.play(Write(title))
        self.wait(0.5)
        
        # 显示副标题
        self.play(Write(subtitle))
        self.wait(0.5)
        
        # 添加动态效果
        self.play(
            title.animate.scale(1.2).set_color_by_gradient(RED, YELLOW),
            subtitle.animate.set_color(BLUE),
            stars.animate.shift(UP*0.3),
            run_time=2
        )
        self.wait(1)
        
        # 最后闪烁效果
        for _ in range(3):
            self.play(
                *[s.animate.set_opacity(0.3) for s in stars],
                title.animate.set_opacity(0.7),
                run_time=0.3
            )
            self.play(
                *[s.animate.set_opacity(1) for s in stars],
                title.animate.set_opacity(1),
                run_time=0.3
            )
            
        # 结束
        final_text = Text("欢迎来到中国", font="SimHei").scale(0.7)
        final_text.next_to(subtitle, DOWN, buff=0.5)
        self.play(FadeIn(final_text))
        self.wait(2)
"""

if __name__ == "__main__":
    # 确保服务器运行中
    print("确保Manim MCP服务器正在运行...")
    
    # 发送动画创建请求
    print("创建'北京欢迎您'动画...")
    result = send_manim_request(manim_code)
    
    if result.get("status") == "success":
        print("动画创建成功!")
        print(f"输出信息: {result.get('data', {}).get('message', '')}")
        media_dir = result.get('data', {}).get('media_dir', '')
        if media_dir:
            print(f"生成的媒体文件位于: {media_dir}")
    else:
        print("动画创建失败:")
        print(json.dumps(result.get("error", {}), indent=2, ensure_ascii=False)) 