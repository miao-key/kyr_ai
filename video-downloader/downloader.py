import os
import yt_dlp
from PyQt5.QtCore import QObject, pyqtSignal

class VideoDownloader(QObject):
    """视频下载器类，处理视频下载逻辑"""
    
    # 定义信号
    progress_signal = pyqtSignal(float, str)
    complete_signal = pyqtSignal(str)
    error_signal = pyqtSignal(str)
    
    def __init__(self, output_path="downloads"):
        """初始化下载器
        
        Args:
            output_path: 视频保存路径
        """
        super().__init__()
        self.output_path = output_path
        
        # 确保下载目录存在
        if not os.path.exists(output_path):
            os.makedirs(output_path)
            
    def _progress_hook(self, d):
        """下载进度回调函数"""
        if d['status'] == 'downloading':
            p = d.get('_percent_str', 'unknown')
            p = p.replace('%', '').strip()
            try:
                percentage = float(p)
                filename = d.get('filename', '').split('/')[-1]
                self.progress_signal.emit(percentage, filename)
            except (ValueError, TypeError):
                pass
        elif d['status'] == 'finished':
            filename = d.get('filename', '').split('/')[-1]
            self.complete_signal.emit(filename)
            
    def download_video(self, url, format_id=None):
        """下载视频
        
        Args:
            url: 视频链接
            format_id: 视频格式ID，默认为None（最佳质量）
        """
        ydl_opts = {
            'format': format_id if format_id else 'best',
            'outtmpl': os.path.join(self.output_path, '%(title)s.%(ext)s'),
            'progress_hooks': [self._progress_hook],
        }
        
        try:
            with yt_dlp.YoutubeDL(ydl_opts) as ydl:
                ydl.download([url])
            return True
        except Exception as e:
            self.error_signal.emit(f"下载错误: {str(e)}")
            return False
            
    def get_available_formats(self, url):
        """获取视频可用的格式
        
        Args:
            url: 视频链接
            
        Returns:
            list: 格式列表，每个元素为(format_id, description)
        """
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
                        formats.append((format_id, desc))
            return formats
        except Exception as e:
            self.error_signal.emit(f"获取格式错误: {str(e)}")
            return [] 