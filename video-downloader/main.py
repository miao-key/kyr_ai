
import sys
import os
from PyQt5.QtWidgets import (QApplication, QMainWindow, QWidget, QVBoxLayout, 
                            QHBoxLayout, QLabel, QLineEdit, QPushButton, 
                            QProgressBar, QComboBox, QFileDialog, QMessageBox)
from PyQt5.QtCore import Qt, QThread, pyqtSignal

from downloader import VideoDownloader

class DownloadThread(QThread):
    """下载线程类"""
    
    def __init__(self, downloader, url, format_id=None):
        super().__init__()
        self.downloader = downloader
        self.url = url
        self.format_id = format_id
        
    def run(self):
        """运行线程"""
        self.downloader.download_video(self.url, self.format_id)

class FormatThread(QThread):
    """获取格式线程类"""
    
    formats_ready = pyqtSignal(list)
    
    def __init__(self, downloader, url):
        super().__init__()
        self.downloader = downloader
        self.url = url
        
    def run(self):
        """运行线程"""
        formats = self.downloader.get_available_formats(self.url)
        self.formats_ready.emit(formats)

class VideoDownloaderApp(QMainWindow):
    """视频下载器应用类"""
    
    def __init__(self):
        super().__init__()
        
        # 设置窗口标题和尺寸
        self.setWindowTitle("视频下载器")
        self.setMinimumSize(600, 400)
        
        # 创建下载器实例
        self.downloader = VideoDownloader()
        self.downloader.progress_signal.connect(self.update_progress)
        self.downloader.complete_signal.connect(self.download_complete)
        self.downloader.error_signal.connect(self.show_error)
        
        # 创建主窗口部件
        central_widget = QWidget()
        self.setCentralWidget(central_widget)
        
        # 创建主布局
        main_layout = QVBoxLayout(central_widget)
        
        # 创建URL输入区域
        url_layout = QHBoxLayout()
        url_label = QLabel("视频URL:")
        self.url_input = QLineEdit()
        self.url_input.setPlaceholderText("输入视频链接...")
        url_layout.addWidget(url_label)
        url_layout.addWidget(self.url_input)
        
        # 添加分析按钮
        self.analyze_btn = QPushButton("分析")
        self.analyze_btn.clicked.connect(self.analyze_url)
        url_layout.addWidget(self.analyze_btn)
        
        main_layout.addLayout(url_layout)
        
        # 创建格式选择区域
        format_layout = QHBoxLayout()
        format_label = QLabel("格式:")
        self.format_combo = QComboBox()
        self.format_combo.setEnabled(False)
        format_layout.addWidget(format_label)
        format_layout.addWidget(self.format_combo)
        
        main_layout.addLayout(format_layout)
        
        # 创建输出目录选择区域
        output_layout = QHBoxLayout()
        output_label = QLabel("保存位置:")
        self.output_path = QLineEdit()
        self.output_path.setText(os.path.abspath(self.downloader.output_path))
        self.output_path.setReadOnly(True)
        output_layout.addWidget(output_label)
        output_layout.addWidget(self.output_path)
        
        # 添加浏览按钮
        browse_btn = QPushButton("浏览...")
        browse_btn.clicked.connect(self.browse_output)
        output_layout.addWidget(browse_btn)
        
        main_layout.addLayout(output_layout)
        
        # 创建进度条
        self.progress_bar = QProgressBar()
        self.progress_bar.setValue(0)
        main_layout.addWidget(self.progress_bar)
        
        # 创建状态标签
        self.status_label = QLabel("准备就绪")
        main_layout.addWidget(self.status_label)
        
        # 创建下载按钮
        self.download_btn = QPushButton("下载")
        self.download_btn.setEnabled(False)
        self.download_btn.clicked.connect(self.start_download)
        main_layout.addWidget(self.download_btn)
        
        # 初始化线程
        self.download_thread = None
        self.format_thread = None
    
    def analyze_url(self):
        """分析URL获取可用格式"""
        url = self.url_input.text().strip()
        if not url:
            QMessageBox.warning(self, "错误", "请输入视频URL")
            return
            
        # 更新UI状态
        self.analyze_btn.setEnabled(False)
        self.format_combo.clear()
        self.format_combo.setEnabled(False)
        self.download_btn.setEnabled(False)
        self.status_label.setText("正在分析视频...")
        
        # 创建并启动格式获取线程
        self.format_thread = FormatThread(self.downloader, url)
        self.format_thread.formats_ready.connect(self.update_formats)
        self.format_thread.start()
    
    def update_formats(self, formats):
        """更新格式下拉框"""
        self.format_combo.clear()
        
        if not formats:
            self.status_label.setText("无法获取视频格式")
            self.analyze_btn.setEnabled(True)
            return
            
        # 添加"最佳质量"选项
        self.format_combo.addItem("最佳质量", None)
        
        # 添加所有可用格式
        for format_id, desc in formats:
            self.format_combo.addItem(desc, format_id)
            
        # 更新UI状态
        self.format_combo.setEnabled(True)
        self.download_btn.setEnabled(True)
        self.analyze_btn.setEnabled(True)
        self.status_label.setText("请选择格式并开始下载")
    
    def browse_output(self):
        """选择输出目录"""
        directory = QFileDialog.getExistingDirectory(
            self, "选择保存位置", 
            self.output_path.text()
        )
        
        if directory:
            self.output_path.setText(directory)
            self.downloader.output_path = directory
            
            # 确保目录存在
            if not os.path.exists(directory):
                os.makedirs(directory)
    
    def start_download(self):
        """开始下载视频"""
        url = self.url_input.text().strip()
        format_id = self.format_combo.currentData()
        
        # 更新UI状态
        self.download_btn.setEnabled(False)
        self.analyze_btn.setEnabled(False)
        self.format_combo.setEnabled(False)
        self.progress_bar.setValue(0)
        self.status_label.setText("正在下载...")
        
        # 创建并启动下载线程
        self.download_thread = DownloadThread(self.downloader, url, format_id)
        self.download_thread.start()
    
    def update_progress(self, percentage, filename):
        """更新下载进度"""
        self.progress_bar.setValue(int(percentage))
        self.status_label.setText(f"正在下载: {filename} ({percentage:.1f}%)")
    
    def download_complete(self, filename):
        """下载完成处理"""
        self.progress_bar.setValue(100)
        self.status_label.setText(f"下载完成: {filename}")
        
        # 恢复UI状态
        self.download_btn.setEnabled(True)
        self.analyze_btn.setEnabled(True)
        self.format_combo.setEnabled(True)
        
        # 显示完成消息
        QMessageBox.information(self, "下载完成", f"视频 {filename} 已下载完成")
    
    def show_error(self, error_msg):
        """显示错误消息"""
        self.status_label.setText(f"错误: {error_msg}")
        
        # 恢复UI状态
        self.download_btn.setEnabled(True)
        self.analyze_btn.setEnabled(True)
        self.format_combo.setEnabled(True)
        
        # 显示错误消息
        QMessageBox.critical(self, "错误", error_msg)

if __name__ == "__main__":
    app = QApplication(sys.argv)
    window = VideoDownloaderApp()
    window.show()
    sys.exit(app.exec_()) 