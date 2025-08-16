import { logger } from '../middleware/logger.js'
import config from '../config/index.js'

// 模拟图片数据存储
const photos = new Map()
let photoIdCounter = 1

// 初始化一些测试图片数据
const initPhotos = [
  {
    id: '1',
    title: '巴黎埃菲尔铁塔夜景',
    description: '夜晚的埃菲尔铁塔在灯光的照耀下显得格外迷人，这是从塞纳河对岸拍摄的经典角度。',
    url: 'https://images.unsplash.com/photo-1511739001486-6bfe10ce785f?w=800',
    thumbnailUrl: 'https://images.unsplash.com/photo-1511739001486-6bfe10ce785f?w=300',
    originalUrl: 'https://images.unsplash.com/photo-1511739001486-6bfe10ce785f?w=1920',
    photographer: 'travel_expert',
    photographerId: '2',
    location: '巴黎, 法国',
    tags: ['巴黎', '埃菲尔铁塔', '夜景', '法国', '建筑'],
    category: 'architecture',
    width: 1920,
    height: 1280,
    fileSize: 2048000,
    format: 'jpg',
    exif: {
      camera: 'Canon EOS R5',
      lens: '24-70mm f/2.8',
      focalLength: '35mm',
      aperture: 'f/8',
      shutterSpeed: '1/60s',
      iso: 800,
      takenAt: '2024-01-15T20:30:00Z'
    },
    uploadedAt: new Date('2024-01-16T10:00:00Z'),
    updatedAt: new Date('2024-01-16T10:00:00Z'),
    isPublic: true,
    isApproved: true,
    isFeatured: true,
    downloadCount: 156,
    viewCount: 2340,
    likeCount: 89,
    commentCount: 12,
    shareCount: 23,
    source: 'upload',
    sourceId: null,
    license: 'free',
    colors: ['#1a1a2e', '#16213e', '#0f3460', '#533483', '#7209b7']
  },
  {
    id: '2',
    title: '日本京都竹林小径',
    description: '京都岚山的竹林小径，阳光透过竹叶洒下斑驳的光影，营造出宁静致远的氛围。',
    url: 'https://images.unsplash.com/photo-1545569341-9eb8b30979d9?w=800',
    thumbnailUrl: 'https://images.unsplash.com/photo-1545569341-9eb8b30979d9?w=300',
    originalUrl: 'https://images.unsplash.com/photo-1545569341-9eb8b30979d9?w=1920',
    photographer: 'travel_expert',
    photographerId: '2',
    location: '京都, 日本',
    tags: ['京都', '竹林', '日本', '自然', '禅意'],
    category: 'nature',
    width: 1920,
    height: 1280,
    fileSize: 1856000,
    format: 'jpg',
    exif: {
      camera: 'Sony A7R IV',
      lens: '16-35mm f/2.8',
      focalLength: '24mm',
      aperture: 'f/5.6',
      shutterSpeed: '1/125s',
      iso: 400,
      takenAt: '2024-01-20T14:15:00Z'
    },
    uploadedAt: new Date('2024-01-21T09:30:00Z'),
    updatedAt: new Date('2024-01-21T09:30:00Z'),
    isPublic: true,
    isApproved: true,
    isFeatured: true,
    downloadCount: 203,
    viewCount: 3120,
    likeCount: 127,
    commentCount: 18,
    shareCount: 34,
    source: 'upload',
    sourceId: null,
    license: 'free',
    colors: ['#2d5016', '#4a7c59', '#6b8e23', '#8fbc8f', '#98fb98']
  },
  {
    id: '3',
    title: '意大利托斯卡纳田园风光',
    description: '托斯卡纳地区的经典田园景色，起伏的丘陵、葡萄园和古老的农舍构成了完美的画面。',
    url: 'https://images.unsplash.com/photo-1523906834658-6e24ef2386f9?w=800',
    thumbnailUrl: 'https://images.unsplash.com/photo-1523906834658-6e24ef2386f9?w=300',
    originalUrl: 'https://images.unsplash.com/photo-1523906834658-6e24ef2386f9?w=1920',
    photographer: 'foodie_traveler',
    photographerId: '3',
    location: '托斯卡纳, 意大利',
    tags: ['托斯卡纳', '意大利', '田园', '葡萄园', '乡村'],
    category: 'landscape',
    width: 1920,
    height: 1280,
    fileSize: 2304000,
    format: 'jpg',
    exif: {
      camera: 'Nikon D850',
      lens: '70-200mm f/2.8',
      focalLength: '135mm',
      aperture: 'f/11',
      shutterSpeed: '1/250s',
      iso: 200,
      takenAt: '2024-02-05T16:45:00Z'
    },
    uploadedAt: new Date('2024-02-06T11:20:00Z'),
    updatedAt: new Date('2024-02-06T11:20:00Z'),
    isPublic: true,
    isApproved: true,
    isFeatured: false,
    downloadCount: 78,
    viewCount: 1560,
    likeCount: 45,
    commentCount: 8,
    shareCount: 12,
    source: 'upload',
    sourceId: null,
    license: 'free',
    colors: ['#8b4513', '#daa520', '#228b22', '#32cd32', '#87ceeb']
  }
]

// 初始化图片数据
initPhotos.forEach(photo => {
  photos.set(photo.id, photo)
  photoIdCounter = Math.max(photoIdCounter, parseInt(photo.id) + 1)
})

class Photo {
  // 创建新图片
  static create(photoData) {
    try {
      const {
        title,
        description = '',
        url,
        thumbnailUrl,
        originalUrl,
        photographer,
        photographerId,
        location = '',
        tags = [],
        category = 'other',
        width,
        height,
        fileSize,
        format,
        exif = {},
        isPublic = true,
        source = 'upload',
        sourceId = null,
        license = 'free',
        colors = []
      } = photoData

      // 验证必填字段
      if (!title || !url || !photographer || !photographerId) {
        throw new Error('标题、图片URL、摄影师和摄影师ID为必填项')
      }

      const photoId = photoIdCounter.toString()
      photoIdCounter++

      const newPhoto = {
        id: photoId,
        title,
        description,
        url,
        thumbnailUrl: thumbnailUrl || url,
        originalUrl: originalUrl || url,
        photographer,
        photographerId,
        location,
        tags: Array.isArray(tags) ? tags : [],
        category,
        width: width || 1920,
        height: height || 1280,
        fileSize: fileSize || 0,
        format: format || 'jpg',
        exif,
        uploadedAt: new Date(),
        updatedAt: new Date(),
        isPublic,
        isApproved: false, // 新上传的图片需要审核
        isFeatured: false,
        downloadCount: 0,
        viewCount: 0,
        likeCount: 0,
        commentCount: 0,
        shareCount: 0,
        source,
        sourceId,
        license,
        colors: Array.isArray(colors) ? colors : []
      }

      photos.set(photoId, newPhoto)
      return newPhoto
    } catch (error) {
      logger.error('创建图片失败', { error: error.message, photoData })
      throw error
    }
  }

  // 根据ID查找图片
  static findById(id) {
    return photos.get(id) || null
  }

  // 获取图片列表
  static findAll(options = {}) {
    const {
      page = 1,
      limit = 20,
      search,
      category,
      photographer,
      tags,
      isPublic,
      isApproved,
      isFeatured,
      sortBy = 'uploadedAt',
      sortOrder = 'desc',
      minWidth,
      maxWidth,
      minHeight,
      maxHeight
    } = options

    let photoList = Array.from(photos.values())

    // 过滤
    if (search) {
      const searchLower = search.toLowerCase()
      photoList = photoList.filter(photo => 
        photo.title.toLowerCase().includes(searchLower) ||
        photo.description.toLowerCase().includes(searchLower) ||
        photo.location.toLowerCase().includes(searchLower) ||
        photo.tags.some(tag => tag.toLowerCase().includes(searchLower))
      )
    }

    if (category && category !== 'all') {
      photoList = photoList.filter(photo => photo.category === category)
    }

    if (photographer) {
      photoList = photoList.filter(photo => photo.photographer === photographer)
    }

    if (tags && tags.length > 0) {
      const tagArray = Array.isArray(tags) ? tags : [tags]
      photoList = photoList.filter(photo => 
        tagArray.some(tag => photo.tags.includes(tag))
      )
    }

    if (isPublic !== undefined) {
      photoList = photoList.filter(photo => photo.isPublic === isPublic)
    }

    if (isApproved !== undefined) {
      photoList = photoList.filter(photo => photo.isApproved === isApproved)
    }

    if (isFeatured !== undefined) {
      photoList = photoList.filter(photo => photo.isFeatured === isFeatured)
    }

    // 尺寸过滤
    if (minWidth) {
      photoList = photoList.filter(photo => photo.width >= minWidth)
    }
    if (maxWidth) {
      photoList = photoList.filter(photo => photo.width <= maxWidth)
    }
    if (minHeight) {
      photoList = photoList.filter(photo => photo.height >= minHeight)
    }
    if (maxHeight) {
      photoList = photoList.filter(photo => photo.height <= maxHeight)
    }

    // 排序
    photoList.sort((a, b) => {
      let aValue = a[sortBy]
      let bValue = b[sortBy]
      
      if (sortBy === 'title' || sortBy === 'photographer') {
        aValue = aValue.toLowerCase()
        bValue = bValue.toLowerCase()
      }
      
      if (sortOrder === 'desc') {
        return bValue > aValue ? 1 : -1
      } else {
        return aValue > bValue ? 1 : -1
      }
    })

    // 分页
    const total = photoList.length
    const startIndex = (page - 1) * limit
    const endIndex = startIndex + limit
    const paginatedPhotos = photoList.slice(startIndex, endIndex)

    return {
      photos: paginatedPhotos,
      total,
      page,
      limit,
      pages: Math.ceil(total / limit)
    }
  }

  // 获取热门图片
  static findTrending(options = {}) {
    const { limit = 10, period = 'week' } = options
    
    let photoList = Array.from(photos.values())
    
    // 只显示已审核的公开图片
    photoList = photoList.filter(photo => photo.isPublic && photo.isApproved)
    
    // 根据时间段过滤
    const now = new Date()
    let startDate
    
    switch (period) {
      case 'day':
        startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000)
        break
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        break
      case 'month':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
        break
      default:
        startDate = new Date(0) // 所有时间
    }
    
    photoList = photoList.filter(photo => photo.uploadedAt >= startDate)
    
    // 按热度排序（综合考虑点赞、下载、浏览量）
    photoList.sort((a, b) => {
      const scoreA = a.likeCount * 3 + a.downloadCount * 2 + a.viewCount * 0.1
      const scoreB = b.likeCount * 3 + b.downloadCount * 2 + b.viewCount * 0.1
      return scoreB - scoreA
    })
    
    return photoList.slice(0, limit)
  }

  // 获取精选图片
  static findFeatured(limit = 10) {
    let photoList = Array.from(photos.values())
    
    // 只显示已审核的公开精选图片
    photoList = photoList.filter(photo => 
      photo.isPublic && photo.isApproved && photo.isFeatured
    )
    
    // 按上传时间倒序
    photoList.sort((a, b) => b.uploadedAt - a.uploadedAt)
    
    return photoList.slice(0, limit)
  }

  // 根据摄影师获取图片
  static findByPhotographer(photographerId, options = {}) {
    const { page = 1, limit = 20, isPublic } = options
    
    let photoList = Array.from(photos.values())
    photoList = photoList.filter(photo => photo.photographerId === photographerId)
    
    if (isPublic !== undefined) {
      photoList = photoList.filter(photo => photo.isPublic === isPublic)
    }
    
    // 按上传时间倒序
    photoList.sort((a, b) => b.uploadedAt - a.uploadedAt)
    
    // 分页
    const total = photoList.length
    const startIndex = (page - 1) * limit
    const endIndex = startIndex + limit
    const paginatedPhotos = photoList.slice(startIndex, endIndex)
    
    return {
      photos: paginatedPhotos,
      total,
      page,
      limit,
      pages: Math.ceil(total / limit)
    }
  }

  // 更新图片信息
  static update(id, updateData) {
    try {
      const photo = photos.get(id)
      if (!photo) {
        throw new Error('图片不存在')
      }

      const {
        title,
        description,
        location,
        tags,
        category,
        isPublic,
        isFeatured
      } = updateData

      // 更新字段
      if (title !== undefined) photo.title = title
      if (description !== undefined) photo.description = description
      if (location !== undefined) photo.location = location
      if (tags !== undefined) photo.tags = Array.isArray(tags) ? tags : []
      if (category !== undefined) photo.category = category
      if (isPublic !== undefined) photo.isPublic = isPublic
      if (isFeatured !== undefined) photo.isFeatured = isFeatured

      photo.updatedAt = new Date()
      photos.set(id, photo)

      return photo
    } catch (error) {
      logger.error('更新图片失败', { error: error.message, photoId: id })
      throw error
    }
  }

  // 审核图片
  static approve(id, isApproved = true) {
    const photo = photos.get(id)
    if (photo) {
      photo.isApproved = isApproved
      photo.updatedAt = new Date()
      photos.set(id, photo)
      return photo
    }
    return null
  }

  // 增加浏览量
  static incrementViewCount(id) {
    const photo = photos.get(id)
    if (photo) {
      photo.viewCount++
      photos.set(id, photo)
    }
  }

  // 增加下载量
  static incrementDownloadCount(id) {
    const photo = photos.get(id)
    if (photo) {
      photo.downloadCount++
      photos.set(id, photo)
    }
  }

  // 更新点赞数
  static updateLikeCount(id, increment = true) {
    const photo = photos.get(id)
    if (photo) {
      if (increment) {
        photo.likeCount++
      } else {
        photo.likeCount = Math.max(0, photo.likeCount - 1)
      }
      photos.set(id, photo)
      return photo.likeCount
    }
    return 0
  }

  // 更新评论数
  static updateCommentCount(id, increment = true) {
    const photo = photos.get(id)
    if (photo) {
      if (increment) {
        photo.commentCount++
      } else {
        photo.commentCount = Math.max(0, photo.commentCount - 1)
      }
      photos.set(id, photo)
    }
  }

  // 增加分享数
  static incrementShareCount(id) {
    const photo = photos.get(id)
    if (photo) {
      photo.shareCount++
      photos.set(id, photo)
    }
  }

  // 删除图片
  static delete(id) {
    return photos.delete(id)
  }

  // 获取所有分类
  static getCategories() {
    const categories = new Set()
    for (const photo of photos.values()) {
      categories.add(photo.category)
    }
    return Array.from(categories)
  }

  // 获取热门标签
  static getPopularTags(limit = 20) {
    const tagCount = new Map()
    
    for (const photo of photos.values()) {
      if (photo.isPublic && photo.isApproved) {
        photo.tags.forEach(tag => {
          tagCount.set(tag, (tagCount.get(tag) || 0) + 1)
        })
      }
    }
    
    return Array.from(tagCount.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
      .map(([tag, count]) => ({ tag, count }))
  }

  // 获取图片统计信息
  static getStats() {
    const photoList = Array.from(photos.values())
    
    return {
      total: photoList.length,
      public: photoList.filter(photo => photo.isPublic).length,
      approved: photoList.filter(photo => photo.isApproved).length,
      featured: photoList.filter(photo => photo.isFeatured).length,
      totalViews: photoList.reduce((sum, photo) => sum + photo.viewCount, 0),
      totalDownloads: photoList.reduce((sum, photo) => sum + photo.downloadCount, 0),
      totalLikes: photoList.reduce((sum, photo) => sum + photo.likeCount, 0)
    }
  }
}

export default Photo