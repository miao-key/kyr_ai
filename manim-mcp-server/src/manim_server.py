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

PORT = 8080
HOST = 'localhost'

class ManimHandler(BaseHTTPRequestHandler):
    def _set_headers(self):
        self.send_response(200)
        self.send_header('Content-type', 'application/json')
        self.end_headers()
        
    def do_POST(self):
        content_length = int(self.headers['Content-Length'])
        post_data = self.rfile.read(content_length)
        request = json.loads(post_data.decode('utf-8'))
        
        try:
            # 获取manim可执行文件路径
            manim_executable = os.environ.get('MANIM_EXECUTABLE', 'manim')
            print(f"Using manim executable: {manim_executable}")
            
            # 创建临时文件
            temp_dir = tempfile.mkdtemp()
            temp_file_path = os.path.join(temp_dir, f"manim_scene_{uuid.uuid4()}.py")
            
            # 将代码写入临时文件
            with open(temp_file_path, 'w') as f:
                f.write(request.get('code', ''))
            
            # 执行manim
            print(f"Running manim on {temp_file_path}")
            result = {"status": "success", "message": "Manim MCP Server is running correctly."}
            
            self._set_headers()
            self.wfile.write(json.dumps(result).encode())
            
        except Exception as e:
            error_msg = f"Error: {str(e)}\n{traceback.format_exc()}"
            print(error_msg)
            self._set_headers()
            self.wfile.write(json.dumps({
                "status": "error", 
                "message": error_msg
            }).encode())

def run_server():
    print(f"Starting Manim MCP Server on {HOST}:{PORT}")
    server_address = (HOST, PORT)
    httpd = HTTPServer(server_address, ManimHandler)
    print("Server is ready")
    httpd.serve_forever()

if __name__ == "__main__":
    run_server() 