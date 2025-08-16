import { useState, useCallback, useEffect } from 'react'
import { 
  Button, 
  Field, 
  Toast, 
  ActionSheet, 
  Cell,
  NavBar,
  Tag
} from 'react-vant'
import { 
  ArrowLeft, 
  PhotoO, 
  Location, 
  Label, 
  Star,
  Eye,
  Plus,
  DeleteO
} from '@react-vant/icons'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/stores'
import useTitle from '@/hooks/useTitle'
import ImageUploader from '@/components/Business/ImageUploader'
import styles from './writeArticle.module.css'

const WriteArticle = () => {
  useTitle('写旅记')
  const navigate = useNavigate()
  const { user } = useAuthStore() // eslint-disable-line no-unused-vars
  
  // 文章内容状态
  const [article, setArticle] = useState({
    title: '',
    content: '',
    images: [],
    location: '',
    tags: [],
    category: '行', // 默认分类
    isPublic: true
  })
  
  // UI状态
  const [showCategorySheet, setShowCategorySheet] = useState(false)
  const [newTag, setNewTag] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [isPublishing, setIsPublishing] = useState(false)
  
  // 分类选项
  const categories = [
    { key: '衣', label: '衣', icon: '👗', desc: '服装穿搭' },
    { key: '食', label: '食', icon: '🍽️', desc: '美食体验' },
    { key: '住', label: '住', icon: '🏨', desc: '住宿分享' },
    { key: '行', label: '行', icon: '✈️', desc: '出行游记' }
  ]
  
  // 热门标签推荐
  const suggestedTags = [
    '旅行', '美食', '风景', '摄影', '自驾游', '穷游', '亲子游', 
    '蜜月', '毕业旅行', '周末游', '城市漫步', '户外', '海边',
    '山景', '古镇', '文化', '艺术', '购物', '温泉', '滑雪'
  ]
  
  // 安全的Toast调用
  const showToast = (type, message) => {
    try {
      Toast[type](message)
    } catch (error) {
      console.log(`Toast ${type}: ${message}`)
    }
  }
  
  // 处理标题变化
  const handleTitleChange = useCallback((value) => {
    setArticle(prev => ({ ...prev, title: value }))
  }, [])
  
  // 处理内容变化
  const handleContentChange = useCallback((e) => {
    setArticle(prev => ({ ...prev, content: e.target.value }))
  }, [])
  
  // 处理图片变化
  const handleImagesChange = useCallback((newImages) => {
    setArticle(prev => ({
      ...prev,
      images: newImages
    }))
  }, [])
  
  // 添加标签
  const handleAddTag = useCallback((tag) => {
    if (tag.trim() && !article.tags.includes(tag.trim()) && article.tags.length < 10) {
      setArticle(prev => ({
        ...prev,
        tags: [...prev.tags, tag.trim()]
      }))
    }
    setNewTag('')
  }, [article.tags])
  
  // 删除标签
  const handleRemoveTag = useCallback((tagToRemove) => {
    setArticle(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }))
  }, [])
  
  // 选择分类
  const handleCategorySelect = useCallback((category) => {
    setArticle(prev => ({ ...prev, category }))
    setShowCategorySheet(false)
  }, [])
  

  
  // 保存草稿
  const handleSaveDraft = useCallback(async () => {
    if (!article.title.trim() && !article.content.trim()) {
      showToast('info', '请先输入标题或内容')
      return
    }
    
    setIsSaving(true)
    try {
      // 准备保存的数据
      const draftData = {
        ...article,
        savedAt: Date.now(),
        id: `draft_${Date.now()}` // 添加唯一ID
      }
      
      // 保存到本地存储
      localStorage.setItem('travelDraft', JSON.stringify(draftData))
      
      // 模拟API调用（将来可以替换为真实API）
      await new Promise(resolve => setTimeout(resolve, 800))
      
      showToast('success', '草稿已保存到本地')
      
      // 记录保存日志
      console.log('草稿保存成功:', {
        title: article.title,
        contentLength: article.content.length,
        imagesCount: article.images.length,
        tagsCount: article.tags.length,
        savedAt: new Date().toLocaleString()
      })
      
    } catch (error) {
      console.error('保存草稿失败:', error)
      showToast('fail', '保存失败，请重试')
    } finally {
      setIsSaving(false)
    }
  }, [article])
  
  // 发布文章
  const handlePublish = useCallback(async () => {
    if (!article.title.trim()) {
      showToast('info', '请输入标题')
      return
    }
    
    if (!article.content.trim()) {
      showToast('info', '请输入内容')
      return
    }
    
    setIsPublishing(true)
    try {
      // 这里应该调用发布API
      await new Promise(resolve => setTimeout(resolve, 2000)) // 模拟API调用
      
      // 清除草稿
      localStorage.removeItem('travelDraft')
      
      showToast('success', '发布成功！')
      
      // 延迟跳转，让用户看到成功提示
      setTimeout(() => {
        navigate('/article', { replace: true })
      }, 1500)
      
    } catch (error) {
      console.error('发布失败:', error)
      showToast('fail', '发布失败，请重试')
    } finally {
      setIsPublishing(false)
    }
  }, [article, navigate])
  
  // 组件加载时检查是否有草稿
  useEffect(() => {
    const checkDraft = () => {
      try {
        const savedDraft = localStorage.getItem('travelDraft')
        if (savedDraft) {
          const draftData = JSON.parse(savedDraft)
          const daysSinceLastSave = (Date.now() - draftData.savedAt) / (1000 * 60 * 60 * 24)
          
          // 如果草稿在7天内且有内容，提示用户
          if (daysSinceLastSave < 7 && (draftData.title || draftData.content)) {
            setTimeout(() => {
              if (window.confirm('检测到本地草稿，是否恢复？\n\n标题：' + (draftData.title || '未填写') + '\n内容长度：' + (draftData.content?.length || 0) + '字')) {
                setArticle({
                  title: draftData.title || '',
                  content: draftData.content || '',
                  images: draftData.images || [],
                  location: draftData.location || '',
                  tags: draftData.tags || [],
                  category: draftData.category || '行',
                  isPublic: draftData.isPublic !== undefined ? draftData.isPublic : true
                })
                showToast('success', '草稿已恢复')
              }
            }, 500)
          }
        }
      } catch (error) {
        console.error('检查草稿失败:', error)
        localStorage.removeItem('travelDraft')
      }
    }
    
    checkDraft()
  }, [])
  
  return (
    <div className={styles.writeContainer}>
      {/* 顶部导航栏 */}
      <NavBar
        title="写旅记"
        leftText={<ArrowLeft />}
        rightText={
          <div className={styles.navActions}>
            <Button 
              size="small" 
              type="default"
              loading={isSaving}
              onClick={handleSaveDraft}
              className={styles.saveBtn}
            >
              保存
            </Button>
            <Button 
              size="small" 
              type="primary"
              loading={isPublishing}
              onClick={handlePublish}
              className={styles.publishBtn}
            >
              发布
            </Button>
          </div>
        }
        onClickLeft={() => navigate(-1)}
        className={styles.navbar}
      />
      
      {/* 主要内容区域 */}
      <div className={styles.content}>
        {/* 标题输入 */}
        <div className={styles.titleSection}>
          <Field
            value={article.title}
            onChange={handleTitleChange}
            placeholder="请输入文章标题..."
            maxLength={50}
            showWordLimit
            className={styles.titleInput}
          />
        </div>
        
        {/* 分类选择 */}
        <Cell
          title="分类"
          value={
            <div className={styles.categoryDisplay}>
              <span className={styles.categoryIcon}>
                {categories.find(c => c.key === article.category)?.icon}
              </span>
              <span>{categories.find(c => c.key === article.category)?.label}</span>
            </div>
          }
          isLink
          onClick={() => setShowCategorySheet(true)}
          className={styles.categoryCell}
        />
        
        {/* 内容编辑器 */}
        <div className={styles.editorSection}>
          <textarea
            value={article.content}
            onChange={handleContentChange}
            placeholder="请在此处输入文章内容...

你可以分享：
• 旅行中的有趣见闻
• 实用的旅行攻略
• 美好的回忆时光
• 值得推荐的地点
• 当地的美食体验
• 住宿的心得感受"
            className={styles.contentEditor}
            maxLength={5000}
          />
          <div className={styles.wordCount}>
            {article.content.length}/5000
          </div>
        </div>
        
        {/* 图片上传区域 */}
        <div className={styles.imageSection}>
          <ImageUploader
            images={article.images}
            onChange={handleImagesChange}
            maxCount={9}
            maxSize={10 * 1024 * 1024}
            compress={true}
            quality={0.8}
          />
        </div>
        
        {/* 位置信息 */}
        <Cell
          title="位置"
          value={article.location || '添加位置'}
          isLink
          icon={<Location />}
          onClick={() => showToast('info', '位置功能开发中...')}
          className={styles.locationCell}
        />
        
        {/* 标签管理 */}
        <div className={styles.tagSection}>
          <div className={styles.sectionTitle}>
            <Label className={styles.sectionIcon} />
            <span>标签</span>
            <span className={styles.tagCount}>({article.tags.length}/10)</span>
          </div>
          
          {/* 已添加的标签 */}
          {article.tags.length > 0 && (
            <div className={styles.addedTags}>
              {article.tags.map((tag, index) => (
                <Tag
                  key={index}
                  type="primary"
                  closeable
                  onClose={() => handleRemoveTag(tag)}
                  className={styles.addedTag}
                >
                  {tag}
                </Tag>
              ))}
            </div>
          )}
          
          {/* 推荐标签 */}
          <div className={styles.suggestedTags}>
            <div className={styles.suggestedTitle}>推荐标签：</div>
            <div className={styles.tagList}>
              {suggestedTags.filter(tag => !article.tags.includes(tag)).slice(0, 12).map((tag, index) => (
                <Tag
                  key={index}
                  type="default"
                  className={styles.suggestedTag}
                  onClick={() => handleAddTag(tag)}
                >
                  + {tag}
                </Tag>
              ))}
            </div>
          </div>
          
          {/* 自定义标签输入 */}
          {article.tags.length < 10 && (
            <div className={styles.customTagInput}>
              <Field
                value={newTag}
                onChange={setNewTag}
                placeholder="自定义标签（按回车添加）"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    handleAddTag(newTag)
                  }
                }}
                rightIcon={
                  <Button 
                    size="mini" 
                    type="primary"
                    onClick={() => handleAddTag(newTag)}
                    disabled={!newTag.trim()}
                  >
                    添加
                  </Button>
                }
              />
            </div>
          )}
        </div>
        
        {/* 发布设置 */}
        <div className={styles.publishSettings}>
          <Cell
            title="公开发布"
            value={
              <div className={styles.publicSetting}>
                <Eye className={styles.publicIcon} />
                <span>{article.isPublic ? '所有人可见' : '仅自己可见'}</span>
              </div>
            }
            isLink
            onClick={() => setArticle(prev => ({ ...prev, isPublic: !prev.isPublic }))}
          />
        </div>
      </div>
      
      {/* 分类选择弹窗 */}
      <ActionSheet
        visible={showCategorySheet}
        onCancel={() => setShowCategorySheet(false)}
        title="选择分类"
        actions={categories.map(category => ({
          name: (
            <div className={styles.categoryOption}>
              <span className={styles.categoryEmoji}>{category.icon}</span>
              <div className={styles.categoryInfo}>
                <div className={styles.categoryName}>{category.label}</div>
                <div className={styles.categoryDesc}>{category.desc}</div>
              </div>
            </div>
          ),
          callback: () => handleCategorySelect(category.key)
        }))}
      />
      

    </div>
  )
}

export default WriteArticle