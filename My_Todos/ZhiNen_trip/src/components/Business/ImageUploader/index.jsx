import { useState, useRef, useCallback } from 'react'
import { Toast, Dialog } from 'react-vant'
import { Plus, DeleteO, PhotoO, Edit } from '@react-vant/icons'
import styles from './imageUploader.module.css'

const ImageUploader = ({ 
  images = [], 
  onChange, 
  maxCount = 9, 
  maxSize = 10 * 1024 * 1024, // 10MB
  accept = 'image/*',
  compress = true,
  quality = 0.8
}) => {
  const fileInputRef = useRef(null)
  const [uploading, setUploading] = useState(false)
  
  // 压缩图片
  const compressImage = useCallback((file, quality = 0.8) => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      const img = new Image()
      
      img.onload = () => {
        // 计算压缩后的尺寸
        let { width, height } = img
        const maxWidth = 1200
        const maxHeight = 1200
        
        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height)
          width *= ratio
          height *= ratio
        }
        
        canvas.width = width
        canvas.height = height
        
        // 绘制图片
        ctx.drawImage(img, 0, 0, width, height)
        
        // 转换为blob
        canvas.toBlob((blob) => {
          const compressedFile = new File([blob], file.name, {
            type: file.type,
            lastModified: Date.now()
          })
          resolve(compressedFile)
        }, file.type, quality)
      }
      
      img.src = URL.createObjectURL(file)
    })
  }, [])
  
  // 验证文件
  const validateFile = useCallback((file) => {
    // 检查文件类型
    if (!file.type.startsWith('image/')) {
      Toast.fail('只能上传图片文件')
      return false
    }
    
    // 检查文件大小
    if (file.size > maxSize) {
      Toast.fail(`图片大小不能超过${Math.round(maxSize / 1024 / 1024)}MB`)
      return false
    }
    
    return true
  }, [maxSize])
  
  // 处理文件选择
  const handleFileSelect = useCallback(async (files) => {
    if (images.length >= maxCount) {
      Toast.fail(`最多只能上传${maxCount}张图片`)
      return
    }
    
    const fileArray = Array.from(files)
    const remainingSlots = maxCount - images.length
    const filesToProcess = fileArray.slice(0, remainingSlots)
    
    setUploading(true)
    
    try {
      const newImages = []
      
      for (const file of filesToProcess) {
        if (!validateFile(file)) continue
        
        // 压缩图片（如果需要）
        const finalFile = compress ? await compressImage(file, quality) : file
        
        // 创建预览URL
        const previewUrl = URL.createObjectURL(finalFile)
        
        newImages.push({
          id: Date.now() + Math.random(),
          file: finalFile,
          url: previewUrl,
          name: file.name,
          size: finalFile.size,
          type: file.type,
          status: 'ready' // ready, uploading, uploaded, error
        })
      }
      
      if (newImages.length > 0) {
        onChange([...images, ...newImages])
        Toast.success(`成功添加${newImages.length}张图片`)
      }
    } catch (error) {
      console.error('处理图片失败:', error)
      Toast.fail('处理图片失败，请重试')
    } finally {
      setUploading(false)
      // 清空input值，允许重复选择同一文件
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }, [images, maxCount, validateFile, compress, compressImage, quality, onChange])
  
  // 删除图片
  const handleDeleteImage = useCallback((imageId) => {
    Dialog.confirm({
      title: '删除图片',
      message: '确定要删除这张图片吗？',
      confirmButtonText: '删除',
      cancelButtonText: '取消'
    }).then(() => {
      const imageToDelete = images.find(img => img.id === imageId)
      if (imageToDelete?.url) {
        URL.revokeObjectURL(imageToDelete.url)
      }
      
      const newImages = images.filter(img => img.id !== imageId)
      onChange(newImages)
      Toast.success('图片已删除')
    }).catch(() => {
      // 用户取消删除
    })
  }, [images, onChange])
  
  // 移动图片位置
  const handleMoveImage = useCallback((fromIndex, toIndex) => {
    const newImages = [...images]
    const [movedImage] = newImages.splice(fromIndex, 1)
    newImages.splice(toIndex, 0, movedImage)
    onChange(newImages)
  }, [images, onChange])
  
  // 图片预览
  const handleImagePreview = useCallback((index) => {
    // 这里可以集成图片预览组件
    console.log('预览图片:', index)
  }, [])
  
  // 格式化文件大小
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
  }
  
  return (
    <div className={styles.imageUploader}>
      <div className={styles.header}>
        <div className={styles.title}>
          <PhotoO className={styles.titleIcon} />
          <span>添加图片</span>
          <span className={styles.count}>({images.length}/{maxCount})</span>
        </div>
        {images.length > 0 && (
          <div className={styles.hint}>
            长按图片可调整顺序
          </div>
        )}
      </div>
      
      <div className={styles.imageGrid}>
        {images.map((image, index) => (
          <div 
            key={image.id} 
            className={styles.imageItem}
            draggable
            onDragStart={(e) => {
              e.dataTransfer.setData('text/plain', index.toString())
            }}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault()
              const fromIndex = parseInt(e.dataTransfer.getData('text/plain'))
              handleMoveImage(fromIndex, index)
            }}
          >
            <div className={styles.imageWrapper}>
              <img 
                src={image.url} 
                alt={image.name}
                onClick={() => handleImagePreview(index)}
              />
              
              {/* 图片信息 */}
              <div className={styles.imageInfo}>
                <div className={styles.imageName}>{image.name}</div>
                <div className={styles.imageSize}>{formatFileSize(image.size)}</div>
              </div>
              
              {/* 操作按钮 */}
              <div className={styles.imageActions}>
                <button 
                  className={styles.deleteBtn}
                  onClick={(e) => {
                    e.stopPropagation()
                    handleDeleteImage(image.id)
                  }}
                  title="删除图片"
                >
                  <DeleteO />
                </button>
              </div>
              
              {/* 状态指示器 */}
              {image.status === 'uploading' && (
                <div className={styles.uploadingOverlay}>
                  <div className={styles.spinner}></div>
                  <span>上传中...</span>
                </div>
              )}
              
              {image.status === 'error' && (
                <div className={styles.errorOverlay}>
                  <span>上传失败</span>
                </div>
              )}
            </div>
          </div>
        ))}
        
        {/* 添加按钮 */}
        {images.length < maxCount && (
          <div className={styles.addButton}>
            <input
              ref={fileInputRef}
              type="file"
              accept={accept}
              multiple
              onChange={(e) => handleFileSelect(e.target.files)}
              style={{ display: 'none' }}
            />
            <button 
              className={styles.addBtn}
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
            >
              {uploading ? (
                <>
                  <div className={styles.spinner}></div>
                  <span>处理中...</span>
                </>
              ) : (
                <>
                  <Plus className={styles.addIcon} />
                  <span>添加图片</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>
      
      {/* 上传提示 */}
      <div className={styles.uploadHint}>
        <div>• 支持JPG、PNG、GIF格式</div>
        <div>• 单张图片不超过{Math.round(maxSize / 1024 / 1024)}MB</div>
        <div>• 最多上传{maxCount}张图片</div>
        {compress && (
          <div>• 图片将自动压缩以优化加载速度</div>
        )}
      </div>
    </div>
  )
}

export default ImageUploader