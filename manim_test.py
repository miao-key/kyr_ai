from manim import *

class CreateCircle(Scene):
    def construct(self):
        circle = Circle()  # 创建一个圆
        circle.set_fill(BLUE, opacity=0.5)  # 设置填充颜色和透明度
        self.play(Create(circle))  # 播放创建圆的动画

        # 添加文字
        text = Text("Claude + Manim 演示").next_to(circle, UP)
        self.play(Write(text))

        # 圆变形为正方形
        square = Square()
        square.set_fill(RED, opacity=0.5)
        self.play(Transform(circle, square))

        # 创建评论
        caption = Text("由Claude生成的动画").scale(0.5).to_edge(DOWN)
        self.play(FadeIn(caption))
        
        # 暂停几秒
        self.wait(2) 