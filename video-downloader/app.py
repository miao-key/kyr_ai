from flask import Flask, render_template, request, jsonify, send_from_directory
import os
import yt_dlp
import uuid
import threading
import time
import subprocess
import re
import sys
import importlib.util

app = Flask(__name__)

# 存储下载任务状态
download_tasks = {}
# 下载目录
# DOWNLOAD_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "downloads")
DOWNLOAD_DIR = r"F:\下载的视频"
if not os.path.exists(DOWNLOAD_DIR):
    os.makedirs(DOWNLOAD_DIR)

class DownloadTask:
    def __init__(self, url, format_id=None):
        self.task_id = str(uuid.uuid4())
        self.url = url
        self.format_id = format_id
        self.progress = 0
        self.status = "pending"  # pending, downloading, completed, error
        self.filename = None
        self.error_message = None
        
    def progress_hook(self, d):
        """下载进度回调函数"""
        if d['status'] == 'downloading':
            p = d.get('_percent_str', 'unknown')
            p = p.replace('%', '').strip()
            try:
                self.progress = float(p)
                self.filename = d.get('filename', '').split('/')[-1]
            except (ValueError, TypeError):
                pass
        elif d['status'] == 'finished':
            self.progress = 100
            self.status = "completed"
            self.filename = d.get('filename', '').split('/')[-1]

def install_package(package):
    """安装Python包"""
    try:
        subprocess.check_call([sys.executable, "-m", "pip", "install", package])
        return True
    except Exception as e:
        print(f"安装{package}失败: {str(e)}")
        return False

def download_video(task):
    """下载视频的函数"""
    task.status = "downloading"
    
    # 检查是否是爱奇艺、优酷或其他国内视频平台
    chinese_video_sites = [
        'iqiyi.com', 'youku.com', 'le.com', 'mgtv.com', 
        'sohu.com', 'pptv.com', 'bilibili.com', '1905.com'
    ]
    
    is_chinese_site = any(site in task.url for site in chinese_video_sites)
    
    # 尝试使用yt-dlp下载
    try:
        ydl_opts = {
            'format': task.format_id if task.format_id else 'best',
            'outtmpl': os.path.join(DOWNLOAD_DIR, '%(title)s.%(ext)s'),
            'progress_hooks': [task.progress_hook],
        }
        
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            ydl.download([task.url])
        
        # 如果到这里没有报错，说明下载成功
        return
    except Exception as e:
        # 如果是中国视频网站且yt-dlp失败，尝试使用备选方法
        if is_chinese_site:
            try:
                task.error_message = f"yt-dlp失败，尝试备选方法: {str(e)}"
                
                # 安装you-get
                if not install_package("you-get"):
                    raise Exception("无法安装you-get包")
                
                task.progress = 20
                
                # 方法1: 尝试使用Python API方式调用you-get
                try:
                    # 动态导入you-get
                    import you_get.common as you_get
                    
                    # 设置命令行参数
                    sys.argv = ['you-get', '--output-dir', DOWNLOAD_DIR, task.url]
                    
                    # 记录原始sys.stdout
                    original_stdout = sys.stdout
                    original_stderr = sys.stderr
                    
                    try:
                        # 重定向输出
                        sys.stdout = open(os.devnull, 'w')
                        sys.stderr = open(os.devnull, 'w')
                        
                        # 执行下载
                        task.progress = 30
                        you_get.main()
                        task.progress = 100
                        
                        # 搜索下载目录获取最新文件
                        files = os.listdir(DOWNLOAD_DIR)
                        if files:
                            files.sort(key=lambda x: os.path.getmtime(os.path.join(DOWNLOAD_DIR, x)), reverse=True)
                            task.filename = files[0]
                            task.status = "completed"
                            return
                        
                    finally:
                        # 恢复stdout和stderr
                        sys.stdout = original_stdout
                        sys.stderr = original_stderr
                        
                except (ImportError, Exception) as api_e:
                    # 方法2: 尝试使用子进程方式
                    task.progress = 40
                    
                    # 找到you-get可执行文件路径
                    you_get_path = None
                    for path in sys.path:
                        possible_path = os.path.join(path, 'Scripts', 'you-get.exe')
                        if os.path.exists(possible_path):
                            you_get_path = possible_path
                            break
                    
                    if not you_get_path:
                        # 尝试使用sys.executable的父目录
                        python_dir = os.path.dirname(sys.executable)
                        possible_path = os.path.join(python_dir, 'Scripts', 'you-get.exe')
                        if os.path.exists(possible_path):
                            you_get_path = possible_path
                    
                    if you_get_path:
                        # 使用找到的you-get路径
                        cmd = [
                            you_get_path, "--output-dir", DOWNLOAD_DIR, task.url
                        ]
                    else:
                        # 使用python -m方式调用
                        cmd = [
                            sys.executable, "-m", "you_get", "--output-dir", DOWNLOAD_DIR, task.url
                        ]
                    
                    task.error_message = f"尝试使用命令: {' '.join(cmd)}"
                    task.progress = 50
                    
                    try:
                        result = subprocess.run(cmd, capture_output=True, text=True)
                        
                        if result.returncode == 0:
                            # 下载成功，查找最近修改的文件
                            task.progress = 100
                            files = os.listdir(DOWNLOAD_DIR)
                            if files:
                                files.sort(key=lambda x: os.path.getmtime(os.path.join(DOWNLOAD_DIR, x)), reverse=True)
                                task.filename = files[0]
                                task.status = "completed"
                                return
                            else:
                                raise Exception("下载似乎成功但找不到文件")
                        else:
                            raise Exception(f"命令失败: {result.stderr}")
                    except Exception as cmd_e:
                        raise Exception(f"命令执行失败: {str(cmd_e)}")
                
            except Exception as youget_e:
                # 如果备选方法也失败，尝试直接ffmpeg录制爱奇艺视频
                task.error_message = f"备选下载失败: {str(youget_e)}"
                
                # 告知用户使用录屏方法
                task.status = "error"
                task.error_message += "。请尝试使用浏览器录屏功能或OBS录制此视频。"
                return
        else:
            # 不是中国视频网站，直接报错
            task.status = "error"
            task.error_message = str(e)
            return

def get_available_formats(url):
    """获取视频可用的格式"""
    # 检查是否是爱奇艺或其他中国视频网站
    chinese_video_sites = [
        'iqiyi.com', 'youku.com', 'le.com', 'mgtv.com', 
        'sohu.com', 'pptv.com', 'bilibili.com', '1905.com'
    ]
    
    is_chinese_site = any(site in url for site in chinese_video_sites)
    
    # 对于中国视频网站，提供简化选项
    if is_chinese_site:
        return [
            {"format_id": "best", "description": "最佳质量 (自动)"},
            {"format_id": "worst", "description": "最低质量 (更快)"}
        ]
    
    # 对于其他网站使用原有的格式获取方法
    ydl_opts = {
        'listformats': True,
        'quiet': True,
    }
    
    formats = []
    try:
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            info = ydl.extract_info(url, download=False)
            if 'formats' in info:
                for f in info['formats']:
                    format_note = f.get('format_note', '')
                    resolution = f.get('resolution', 'unknown')
                    format_id = f.get('format_id', '')
                    ext = f.get('ext', 'unknown')
                    desc = f"{format_note} ({resolution}, {ext})"
                    formats.append({"format_id": format_id, "description": desc})
        return formats
    except Exception as e:
        return [{"format_id": "best", "description": "最佳质量 (自动)"}]

@app.route('/')
def index():
    """网页首页"""
    return render_template('index.html')

@app.route('/analyze', methods=['POST'])
def analyze():
    """分析视频URL获取可用格式"""
    url = request.json.get('url', '')
    if not url:
        return jsonify({"error": "请输入视频URL"}), 400
    
    formats = get_available_formats(url)
    return jsonify({"formats": formats})

@app.route('/download', methods=['POST'])
def download():
    """开始下载视频"""
    url = request.json.get('url', '')
    format_id = request.json.get('format_id')
    
    if not url:
        return jsonify({"error": "请输入视频URL"}), 400
    
    # 创建下载任务
    task = DownloadTask(url, format_id)
    download_tasks[task.task_id] = task
    
    # 在后台线程中开始下载
    thread = threading.Thread(target=download_video, args=(task,))
    thread.daemon = True
    thread.start()
    
    return jsonify({"task_id": task.task_id})

@app.route('/status/<task_id>', methods=['GET'])
def status(task_id):
    """获取下载任务状态"""
    task = download_tasks.get(task_id)
    if not task:
        return jsonify({"error": "任务不存在"}), 404
    
    return jsonify({
        "task_id": task.task_id,
        "status": task.status,
        "progress": task.progress,
        "filename": task.filename,
        "error_message": task.error_message
    })

@app.route('/downloads/<filename>', methods=['GET'])
def download_file(filename):
    """下载已完成的文件"""
    return send_from_directory(DOWNLOAD_DIR, filename, as_attachment=True)

@app.route('/downloads', methods=['GET'])
def list_downloads():
    """列出所有已下载的文件"""
    files = []
    for file in os.listdir(DOWNLOAD_DIR):
        if os.path.isfile(os.path.join(DOWNLOAD_DIR, file)):
            files.append(file)
    return jsonify({"files": files})

if __name__ == "__main__":
    app.run(debug=True) 