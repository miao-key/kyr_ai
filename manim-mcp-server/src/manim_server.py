#!/usr/bin/env python3
import os
import sys
import json
import subprocess
from http.server import HTTPServer, BaseHTTPRequestHandler
import tempfile
import uuid
import base64
import traceback
import shutil

# 读取环境变量中的端口设置，默认为8090
PORT = int(os.environ.get('PORT', 8090))
HOST = 'localhost'

class ManimHandler(BaseHTTPRequestHandler):
    def log_message(self, format, *args):
        # 重定向日志到标准错误，这对MCP协议很重要
        print(format % args, file=sys.stderr)
    
    def _set_headers(self, content_type='application/json'):
        self.send_response(200)
        self.send_header('Content-type', content_type)
        self.send_header('Access-Control-Allow-Origin', '*') # 添加CORS头
        self.end_headers()
        
    def do_GET(self):
        # 处理健康检查请求，这对MCP协议很重要
        if self.path == '/health' or self.path == '/v1/health':
            self._set_headers()
            response = {
                "status": "ok",
                "capabilities": ["manim"]
            }
            self.wfile.write(json.dumps(response).encode())
        else:
            # 提供基本的HTML页面，便于浏览器测试
            self._set_headers('text/html')
            response = """
            <html>
            <head><title>Manim MCP 服务器</title></head>
            <body>
            <h1>Manim MCP 服务器运行中</h1>
            <p>这是一个用于Claude与Manim集成的MCP服务器。</p>
            <p>可用端点：</p>
            <ul>
                <li><a href="/health">/health</a> - 健康检查</li>
                <li><a href="/v1/health">/v1/health</a> - 符合MCP协议的健康检查</li>
            </ul>
            </body>
            </html>
            """
            self.wfile.write(response.encode())
    
    # 处理OPTIONS请求
    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()
    
    def do_POST(self):
        # 处理MCP请求
        if self.path == '/' or self.path == '/v1/run':
            content_length = int(self.headers['Content-Length']) if 'Content-Length' in self.headers else 0
            if content_length > 0:
                post_data = self.rfile.read(content_length)
                try:
                    request = json.loads(post_data.decode('utf-8'))
                except:
                    # 处理JSON解析错误
                    self._set_headers()
                    error_msg = "无效的JSON请求"
                    self.wfile.write(json.dumps({
                        "status": "error",
                        "error": {"message": error_msg}
                    }).encode())
                    return
            else:
                # 处理空请求
                request = {}
            
            try:
                # 获取manim可执行文件路径
                manim_executable = os.environ.get('MANIM_EXECUTABLE', 'manim')
                print(f"使用manim可执行文件: {manim_executable}", file=sys.stderr)
                
                # 创建临时文件
                temp_dir = tempfile.mkdtemp()
                scene_name = "ManimScene"
                temp_file_path = os.path.join(temp_dir, f"{scene_name}.py")
                
                # 从请求中获取代码
                code = request.get('code', '')
                
                # 如果code为空，尝试从inputs字段获取
                if not code and 'inputs' in request:
                    inputs = request.get('inputs', {})
                    code = inputs.get('code', '')
                
                if not code:
                    raise ValueError("未找到Manim代码")
                
                # 将代码写入临时文件
                with open(temp_file_path, 'w', encoding='utf-8') as f:
                    f.write(code)
                
                # 执行manim命令
                print(f"在{temp_file_path}上运行manim", file=sys.stderr)
                cmd = [manim_executable, "-pqh", temp_file_path, "MCPTest"]
                print(f"执行命令: {' '.join(cmd)}", file=sys.stderr)
                
                result = subprocess.run(
                    cmd,
                    capture_output=True,
                    text=True,
                    check=False
                )
                
                # 检查是否成功
                if result.returncode == 0:
                    print("Manim渲染成功!", file=sys.stderr)
                    media_dir = os.path.join(os.getcwd(), "media")
                    if os.path.exists(media_dir):
                        print(f"生成的媒体文件位于: {media_dir}", file=sys.stderr)
                        
                    response_data = {
                        "status": "success",
                        "data": {
                            "message": "动画已成功渲染",
                            "output": result.stdout,
                            "media_dir": media_dir
                        }
                    }
                else:
                    print(f"Manim渲染失败: {result.stderr}", file=sys.stderr)
                    response_data = {
                        "status": "error",
                        "error": {
                            "message": "渲染失败",
                            "details": result.stderr,
                            "output": result.stdout
                        }
                    }
                
                # 发送响应
                self._set_headers()
                self.wfile.write(json.dumps(response_data).encode())
                
                # 清理临时文件
                try:
                    shutil.rmtree(temp_dir)
                except Exception as e:
                    print(f"清理临时文件时出错: {str(e)}", file=sys.stderr)
                
            except Exception as e:
                error_msg = f"错误: {str(e)}\n{traceback.format_exc()}"
                print(error_msg, file=sys.stderr)
                self._set_headers()
                self.wfile.write(json.dumps({
                    "status": "error",
                    "error": {
                        "message": str(e),
                        "details": traceback.format_exc()
                    }
                }).encode())
        else:
            self._set_headers()
            self.wfile.write(json.dumps({"status": "error", "message": "不支持的端点"}).encode())

def run_server():
    print(f"在{HOST}:{PORT}上启动Manim MCP服务器", file=sys.stderr)
    server_address = (HOST, PORT)
    
    # 尝试启动服务器
    try:
        httpd = HTTPServer(server_address, ManimHandler)
        print(f"MCP服务器已就绪，监听端口 {PORT}", file=sys.stderr)
        
        # 输出服务器就绪信号，这对MCP协议很重要
        # 注意：MCP协议要求此信号必须发送到标准输出
        sys.stderr.flush()  # 确保之前的日志被输出
        print("SERVER_READY")  # 输出到标准输出
        sys.stdout.flush()  # 确保信号立即发送
        
        httpd.serve_forever()
    except OSError as e:
        if "Address already in use" in str(e):
            print(f"错误：端口 {PORT} 已被占用。请尝试其他端口。", file=sys.stderr)
        else:
            print(f"启动服务器时出错: {str(e)}", file=sys.stderr)
        sys.exit(1)

if __name__ == "__main__":
    run_server() 