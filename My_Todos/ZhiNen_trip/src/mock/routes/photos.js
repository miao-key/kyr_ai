import express from 'express'
import multer from 'multer'
import { authenticateToken, optionalAuth } from '../middleware/auth.js'
import { logger } from '../middleware/logger.js'
import Photo from '../models/Photo.js'
import pexelsService from '../services/pexelsService.js'
import config from '../config/index.js'

const router = express.Router()

// 调试：确认路由模块已加载
console.log('📸 Photos路由模块已加载')

// 配置multer用于文件上传
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: config.upload.maxSize
  },
  fileFilter: (req, file, cb) => {
    if (config.upload.allowedTypes.includes(file.mimetype)) {
      cb(null, true)
    } else {
      cb(new Error('不支持的文件类型'), false)
    }
  }
})

// 获取图片列表（支持分页和搜索）
router.get('/', optionalAuth, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      query = 'travel',
      category,
      orientation,
      size,
      color,
      source = 'pexels'
    } = req.query

    // 验证分页参数
    const pageNum = Math.max(1, parseInt(page))
    const limitNum = Math.min(config.business.pagination.maxLimit, Math.max(1, parseInt(limit)))

    let photos = []
    let total = 0

    if (source === 'pexels') {
      // 从Pexels获取图片
      const pexelsResult = await pexelsService.searchPhotos({
        query,
        page: pageNum,
        per_page: limitNum,
        orientation,
        size,
        color
      })
      
      if (!pexelsResult.success) {
        throw new Error(pexelsResult.error || 'Pexels API调用失败')
      }
      
      photos = pexelsResult.data.photos.map(photo => ({
        id: `pexels_${photo.id}`,
        title: photo.alt || `${query} photo`,
        description: photo.alt,
        url: photo.src.original,
        thumbnail: photo.src.medium,
        small: photo.src.small,
        large: photo.src.large2x,
        width: photo.width,
        height: photo.height,
        photographer: photo.photographer,
        photographerUrl: photo.photographer_url,
        source: 'pexels',
        sourceUrl: photo.url,
        avgColor: photo.avg_color,
        liked: false,
        downloads: Math.floor(Math.random() * 10000),
        views: Math.floor(Math.random() * 100000),
        createdAt: new Date().toISOString()
      }))
      
      total = pexelsResult.data.total_results
    } else {
      // 从本地数据库获取图片
      const result = Photo.findAll({
        page: pageNum,
        limit: limitNum,
        query,
        category,
        userId: req.user?.id
      })
      
      photos = result.photos
      total = result.total
    }

    // 如果用户已登录，检查点赞状态
    if (req.user) {
      photos = photos.map(photo => ({
        ...photo,
        liked: Photo.isLikedByUser(photo.id, req.user.id)
      }))
    }

    logger.info('获取图片列表', {
      query,
      page: pageNum,
      limit: limitNum,
      total,
      source,
      userId: req.user?.id
    })

    res.json({
      photos,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum),
        hasNext: pageNum * limitNum < total,
        hasPrev: pageNum > 1
      },
      query,
      source
    })
  } catch (error) {
    logger.error('获取图片列表失败', { error: error.message })
    res.status(500).json({
      error: '获取图片列表失败',
      code: 'GET_PHOTOS_FAILED'
    })
  }
})

// 获取轮播图片
router.get('/carousel', optionalAuth, async (req, res) => {
  try {
    const { count = 4 } = req.query
    const limitNum = Math.min(10, Math.max(1, parseInt(count)))

    const pexelsResult = await pexelsService.searchPhotos({
      query: 'travel destination',
      page: 1,
      per_page: limitNum
    })
    
    if (!pexelsResult.success) {
      throw new Error(pexelsResult.error || 'Pexels API调用失败')
    }
    
    const photos = pexelsResult.data.photos.map(photo => ({
      id: `pexels_${photo.id}`,
      title: photo.alt || 'Travel destination',
      description: photo.alt,
      url: photo.src.original,
      thumbnail: photo.src.medium,
      small: photo.src.small,
      large: photo.src.large2x,
      width: photo.width,
      height: photo.height,
      photographer: photo.photographer,
      photographerUrl: photo.photographer_url,
      source: 'pexels',
      sourceUrl: photo.url,
      avgColor: photo.avg_color,
      liked: false,
      downloads: Math.floor(Math.random() * 10000),
      views: Math.floor(Math.random() * 100000),
      createdAt: new Date().toISOString()
    }))

    logger.info('获取轮播图片', { count: limitNum, total: pexelsResult.data.total_results })

    res.json({
      photos,
      total_results: pexelsResult.data.total_results,
      count: limitNum
    })
  } catch (error) {
    logger.error('获取轮播图片失败', { error: error.message })
    res.status(500).json({
      error: '获取轮播图片失败',
      code: 'GET_CAROUSEL_PHOTOS_FAILED'
    })
  }
})

// 获取指南图片
router.get('/guide', optionalAuth, async (req, res) => {
  try {
    const { page = 1, count = 12 } = req.query
    const pageNum = Math.max(1, parseInt(page))
    const limitNum = Math.min(50, Math.max(1, parseInt(count)))

    const pexelsResult = await pexelsService.searchPhotos({
      query: 'travel guide',
      page: pageNum,
      per_page: limitNum
    })
    
    if (!pexelsResult.success) {
      throw new Error(pexelsResult.error || 'Pexels API调用失败')
    }
    
    const photos = pexelsResult.data.photos.map(photo => ({
      id: `pexels_${photo.id}`,
      title: photo.alt || 'Guide photo',
      description: photo.alt,
      url: photo.src.original,
      thumbnail: photo.src.medium,
      small: photo.src.small,
      large: photo.src.large2x,
      width: photo.width,
      height: photo.height,
      photographer: photo.photographer,
      photographerUrl: photo.photographer_url,
      source: 'pexels',
      sourceUrl: photo.url,
      avgColor: photo.avg_color,
      liked: false,
      downloads: Math.floor(Math.random() * 10000),
      views: Math.floor(Math.random() * 100000),
      createdAt: new Date().toISOString()
    }))

    logger.info('获取指南图片', { page: pageNum, count: limitNum, total: pexelsResult.data.total_results })

    res.json({
      photos,
      total_results: pexelsResult.data.total_results,
      page: pageNum,
      per_page: limitNum,
      next_page: pexelsResult.data.next_page
    })
  } catch (error) {
    logger.error('获取指南图片失败', { error: error.message })
    res.status(500).json({
      error: '获取指南图片失败',
      code: 'GET_GUIDE_PHOTOS_FAILED'
    })
  }
})

// 获取头像图片
router.get('/avatar', optionalAuth, async (req, res) => {
  try {
    const { count = 20 } = req.query
    const limitNum = Math.min(50, Math.max(1, parseInt(count)))

    const pexelsResult = await pexelsService.searchPhotos({
      query: 'portrait people',
      page: 1,
      per_page: limitNum,
      orientation: 'portrait'
    })
    
    if (!pexelsResult.success) {
      throw new Error(pexelsResult.error || 'Pexels API调用失败')
    }
    
    const photos = pexelsResult.data.photos.map(photo => ({
      id: `pexels_${photo.id}`,
      title: photo.alt || 'Portrait photo',
      description: photo.alt,
      url: photo.src.original,
      thumbnail: photo.src.medium,
      small: photo.src.small,
      large: photo.src.large2x,
      width: photo.width,
      height: photo.height,
      photographer: photo.photographer,
      photographerUrl: photo.photographer_url,
      source: 'pexels',
      sourceUrl: photo.url,
      avgColor: photo.avg_color,
      liked: false,
      downloads: Math.floor(Math.random() * 10000),
      views: Math.floor(Math.random() * 100000),
      createdAt: new Date().toISOString()
    }))

    logger.info('获取头像图片', { count: limitNum, total: pexelsResult.data.total_results })

    res.json({
      photos,
      total_results: pexelsResult.data.total_results,
      count: limitNum,
      next_page: pexelsResult.data.next_page
    })
  } catch (error) {
    logger.error('获取头像图片失败', { error: error.message })
    
    // 错误时返回DiceBear头像
    const fallbackAvatar = {
      id: 'dicebear_' + Date.now(),
      url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${Math.random()}`,
      photographer: 'DiceBear',
      photographerUrl: 'https://dicebear.com',
      source: 'dicebear'
    }
    
    res.json({ photos: [fallbackAvatar] })
  }
})

// 获取单个头像图片
router.get('/avatar/single', optionalAuth, async (req, res) => {
  try {
    const pexelsResult = await pexelsService.searchPhotos({
      query: 'portrait',
      page: 1,
      per_page: 20
    })
    
    if (pexelsResult.success && pexelsResult.data.photos && pexelsResult.data.photos.length > 0) {
      const randomPhoto = pexelsResult.data.photos[Math.floor(Math.random() * pexelsResult.data.photos.length)]
      
      const avatar = {
        id: `pexels_${randomPhoto.id}`,
        url: randomPhoto.src.medium,
        photographer: randomPhoto.photographer,
        photographerUrl: randomPhoto.photographer_url,
        source: 'pexels'
      }

      logger.info('获取头像图片', { avatarId: avatar.id })
      res.json({ avatar })
    } else {
      // 如果没有找到图片，返回DiceBear头像
      const fallbackAvatar = {
        id: 'dicebear_' + Date.now(),
        url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${Math.random()}`,
        photographer: 'DiceBear',
        photographerUrl: 'https://dicebear.com',
        source: 'dicebear'
      }
      
      logger.info('使用DiceBear头像', { avatarId: fallbackAvatar.id })
      res.json({ avatar: fallbackAvatar })
    }
  } catch (error) {
    logger.error('获取头像图片失败', { error: error.message })
    
    // 错误时返回DiceBear头像
    const fallbackAvatar = {
      id: 'dicebear_' + Date.now(),
      url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${Math.random()}`,
      photographer: 'DiceBear',
      photographerUrl: 'https://dicebear.com',
      source: 'dicebear'
    }
    
    res.json({ avatar: fallbackAvatar })
  }
})



// 获取人物图片
router.get('/people', optionalAuth, async (req, res) => {
  try {
    const { page = 1, per_page = 20 } = req.query
    const pageNum = Math.max(1, parseInt(page))
    const limitNum = Math.min(50, Math.max(1, parseInt(per_page)))

    const pexelsResult = await pexelsService.searchPhotos({
      query: 'people',
      page: pageNum,
      per_page: limitNum
    })
    
    if (!pexelsResult.success || !pexelsResult.data || !pexelsResult.data.photos) {
      throw new Error(pexelsResult.error || 'Pexels API调用失败')
    }
    
    const photos = pexelsResult.data.photos.map(photo => ({
      id: `pexels_${photo.id}`,
      title: photo.alt || 'People photo',
      description: photo.alt,
      url: photo.src.original,
      thumbnail: photo.src.medium,
      small: photo.src.small,
      large: photo.src.large2x,
      width: photo.width,
      height: photo.height,
      photographer: photo.photographer,
      photographerUrl: photo.photographer_url,
      source: 'pexels',
      sourceUrl: photo.url,
      avgColor: photo.avg_color,
      liked: false,
      downloads: Math.floor(Math.random() * 10000),
      views: Math.floor(Math.random() * 100000),
      createdAt: new Date().toISOString()
    }))

    logger.info('获取人物图片', { page: pageNum, per_page: limitNum, total: pexelsResult.data.total_results })

    res.json({
      photos,
      total_results: pexelsResult.data.total_results,
      page: pageNum,
      per_page: limitNum,
      next_page: pexelsResult.data.next_page
    })
  } catch (error) {
    logger.error('获取人物图片失败', { error: error.message })
    res.status(500).json({
      error: '获取人物图片失败',
      code: 'GET_PEOPLE_PHOTOS_FAILED'
    })
  }
})



// 获取旅行图片
router.get('/travel', optionalAuth, async (req, res) => {
  try {
    const { page = 1, per_page = 20 } = req.query
    const pageNum = Math.max(1, parseInt(page))
    const limitNum = Math.min(50, Math.max(1, parseInt(per_page)))

    const pexelsResult = await pexelsService.searchPhotos({
      query: 'travel',
      page: pageNum,
      per_page: limitNum
    })
    
    if (!pexelsResult.success || !pexelsResult.data || !pexelsResult.data.photos) {
      throw new Error(pexelsResult.error || 'Pexels API调用失败')
    }
    
    const photos = pexelsResult.data.photos.map(photo => ({
      id: `pexels_${photo.id}`,
      title: photo.alt || 'Travel photo',
      description: photo.alt,
      url: photo.src.original,
      thumbnail: photo.src.medium,
      small: photo.src.small,
      large: photo.src.large2x,
      width: photo.width,
      height: photo.height,
      photographer: photo.photographer,
      photographerUrl: photo.photographer_url,
      source: 'pexels',
      sourceUrl: photo.url,
      avgColor: photo.avg_color,
      liked: false,
      downloads: Math.floor(Math.random() * 10000),
      views: Math.floor(Math.random() * 100000),
      createdAt: new Date().toISOString()
    }))

    logger.info('获取旅行图片', { page: pageNum, per_page: limitNum, total: pexelsResult.data.total_results })

    res.json({
      photos,
      total_results: pexelsResult.data.total_results,
      page: pageNum,
      per_page: limitNum,
      next_page: pexelsResult.data.next_page
    })
  } catch (error) {
    logger.error('获取旅行图片失败', { error: error.message })
    res.status(500).json({
      error: '获取旅行图片失败',
      code: 'GET_TRAVEL_PHOTOS_FAILED'
    })
  }
})

// 获取美食图片
router.get('/food', optionalAuth, async (req, res) => {
  try {
    const { page = 1, per_page = 20 } = req.query
    const pageNum = Math.max(1, parseInt(page))
    const limitNum = Math.min(50, Math.max(1, parseInt(per_page)))

    const pexelsResult = await pexelsService.searchPhotos({
      query: 'food',
      page: pageNum,
      per_page: limitNum
    })
    
    if (!pexelsResult.success || !pexelsResult.data || !pexelsResult.data.photos) {
      throw new Error(pexelsResult.error || 'Pexels API调用失败')
    }
    
    const photos = pexelsResult.data.photos.map(photo => ({
      id: `pexels_${photo.id}`,
      title: photo.alt || 'Food photo',
      description: photo.alt,
      url: photo.src.original,
      thumbnail: photo.src.medium,
      small: photo.src.small,
      large: photo.src.large2x,
      width: photo.width,
      height: photo.height,
      photographer: photo.photographer,
      photographerUrl: photo.photographer_url,
      source: 'pexels',
      sourceUrl: photo.url,
      avgColor: photo.avg_color,
      liked: false,
      downloads: Math.floor(Math.random() * 10000),
      views: Math.floor(Math.random() * 100000),
      createdAt: new Date().toISOString()
    }))

    logger.info('获取美食图片', { page: pageNum, per_page: limitNum, total: pexelsResult.data.total_results })

    res.json({
      photos,
      total_results: pexelsResult.data.total_results,
      page: pageNum,
      per_page: limitNum,
      next_page: pexelsResult.data.next_page
    })
  } catch (error) {
    logger.error('获取美食图片失败', { error: error.message })
    res.status(500).json({
      error: '获取美食图片失败',
      code: 'GET_FOOD_PHOTOS_FAILED'
    })
  }
})

// 获取风景图片
router.get('/landscape', optionalAuth, async (req, res) => {
  try {
    const { page = 1, per_page = 20 } = req.query
    const pageNum = Math.max(1, parseInt(page))
    const limitNum = Math.min(50, Math.max(1, parseInt(per_page)))

    const pexelsResult = await pexelsService.searchPhotos({
      query: 'landscape',
      page: pageNum,
      per_page: limitNum
    })
    
    if (!pexelsResult.success || !pexelsResult.data || !pexelsResult.data.photos) {
      throw new Error(pexelsResult.error || 'Pexels API调用失败')
    }
    
    const photos = pexelsResult.data.photos.map(photo => ({
      id: `pexels_${photo.id}`,
      title: photo.alt || 'Landscape photo',
      description: photo.alt,
      url: photo.src.original,
      thumbnail: photo.src.medium,
      small: photo.src.small,
      large: photo.src.large2x,
      width: photo.width,
      height: photo.height,
      photographer: photo.photographer,
      photographerUrl: photo.photographer_url,
      source: 'pexels',
      sourceUrl: photo.url,
      avgColor: photo.avg_color,
      liked: false,
      downloads: Math.floor(Math.random() * 10000),
      views: Math.floor(Math.random() * 100000),
      createdAt: new Date().toISOString()
    }))

    logger.info('获取风景图片', { page: pageNum, per_page: limitNum, total: pexelsResult.data.total_results })

    res.json({
      photos,
      total_results: pexelsResult.data.total_results,
      page: pageNum,
      per_page: limitNum,
      next_page: pexelsResult.data.next_page
    })
  } catch (error) {
    logger.error('获取风景图片失败', { error: error.message })
    res.status(500).json({
      error: '获取风景图片失败',
      code: 'GET_LANDSCAPE_PHOTOS_FAILED'
    })
  }
})

// 获取单张图片详情
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const { id } = req.params
    
    let photo
    
    if (id.startsWith('pexels_')) {
      // 从Pexels获取图片详情
      const pexelsId = id.replace('pexels_', '')
      const pexelsPhoto = await pexelsService.getPhoto(pexelsId)
      
      photo = {
        id: `pexels_${pexelsPhoto.id}`,
        title: pexelsPhoto.alt || 'Pexels Photo',
        description: pexelsPhoto.alt,
        url: pexelsPhoto.src.original,
        thumbnail: pexelsPhoto.src.medium,
        small: pexelsPhoto.src.small,
        large: pexelsPhoto.src.large2x,
        width: pexelsPhoto.width,
        height: pexelsPhoto.height,
        photographer: pexelsPhoto.photographer,
        photographerUrl: pexelsPhoto.photographer_url,
        source: 'pexels',
        sourceUrl: pexelsPhoto.url,
        avgColor: pexelsPhoto.avg_color,
        liked: false,
        downloads: Math.floor(Math.random() * 10000),
        views: Math.floor(Math.random() * 100000),
        createdAt: new Date().toISOString()
      }
    } else {
      // 从本地数据库获取
      photo = Photo.findById(id)
    }
    
    if (!photo) {
      return res.status(404).json({
        error: '图片不存在',
        code: 'PHOTO_NOT_FOUND'
      })
    }

    // 如果用户已登录，检查点赞状态
    if (req.user) {
      photo.liked = Photo.isLikedByUser(photo.id, req.user.id)
    }

    // 增加浏览次数
    if (!id.startsWith('pexels_')) {
      Photo.incrementViews(id)
    }

    logger.info('获取图片详情', { photoId: id, userId: req.user?.id })

    res.json({ photo })
  } catch (error) {
    logger.error('获取图片详情失败', { error: error.message, photoId: req.params.id })
    res.status(500).json({
      error: '获取图片详情失败',
      code: 'GET_PHOTO_FAILED'
    })
  }
})

// 上传图片
router.post('/upload', authenticateToken, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        error: '请选择要上传的图片',
        code: 'NO_FILE_UPLOADED'
      })
    }

    const { title, description, category = 'other' } = req.body
    
    // 这里应该将文件保存到云存储或本地存储
    // 为了演示，我们生成一个模拟的URL
    const imageUrl = `https://example.com/uploads/${Date.now()}_${req.file.originalname}`
    
    const photo = Photo.create({
      title: title || req.file.originalname,
      description: description || '',
      url: imageUrl,
      thumbnail: imageUrl,
      small: imageUrl,
      large: imageUrl,
      width: 1920, // 实际应该从图片文件中获取
      height: 1080,
      photographer: req.user.username,
      photographerUrl: '',
      source: 'upload',
      sourceUrl: imageUrl,
      category,
      userId: req.user.id,
      fileSize: req.file.size,
      mimeType: req.file.mimetype
    })

    logger.info('图片上传成功', {
      photoId: photo.id,
      userId: req.user.id,
      filename: req.file.originalname,
      size: req.file.size
    })

    res.status(201).json({
      message: '图片上传成功',
      photo
    })
  } catch (error) {
    logger.error('图片上传失败', { error: error.message, userId: req.user?.id })
    res.status(500).json({
      error: '图片上传失败',
      code: 'UPLOAD_FAILED'
    })
  }
})

// 点赞/取消点赞图片
router.post('/:id/like', authenticateToken, (req, res) => {
  try {
    const { id } = req.params
    const userId = req.user.id
    
    const isLiked = Photo.isLikedByUser(id, userId)
    
    if (isLiked) {
      Photo.unlikePhoto(id, userId)
      logger.info('取消点赞图片', { photoId: id, userId })
      res.json({
        message: '取消点赞成功',
        liked: false
      })
    } else {
      Photo.likePhoto(id, userId)
      logger.info('点赞图片', { photoId: id, userId })
      res.json({
        message: '点赞成功',
        liked: true
      })
    }
  } catch (error) {
    logger.error('点赞操作失败', { error: error.message, photoId: req.params.id, userId: req.user.id })
    res.status(500).json({
      error: '点赞操作失败',
      code: 'LIKE_FAILED'
    })
  }
})

// 下载图片
router.get('/:id/download', optionalAuth, async (req, res) => {
  try {
    const { id } = req.params
    const { size = 'original' } = req.query
    
    let photo
    
    if (id.startsWith('pexels_')) {
      const pexelsId = id.replace('pexels_', '')
      const pexelsPhoto = await pexelsService.getPhoto(pexelsId)
      photo = {
        id: `pexels_${pexelsPhoto.id}`,
        url: pexelsPhoto.src.original,
        small: pexelsPhoto.src.small,
        large: pexelsPhoto.src.large2x
      }
    } else {
      photo = Photo.findById(id)
    }
    
    if (!photo) {
      return res.status(404).json({
        error: '图片不存在',
        code: 'PHOTO_NOT_FOUND'
      })
    }

    // 增加下载次数
    if (!id.startsWith('pexels_')) {
      Photo.incrementDownloads(id)
    }

    const downloadUrl = photo[size] || photo.url
    
    logger.info('图片下载', { photoId: id, size, userId: req.user?.id })

    res.json({
      downloadUrl,
      size
    })
  } catch (error) {
    logger.error('图片下载失败', { error: error.message, photoId: req.params.id })
    res.status(500).json({
      error: '图片下载失败',
      code: 'DOWNLOAD_FAILED'
    })
  }
})

// 获取用户收藏的图片
router.get('/user/favorites', authenticateToken, (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query
    const pageNum = Math.max(1, parseInt(page))
    const limitNum = Math.min(config.business.pagination.maxLimit, Math.max(1, parseInt(limit)))
    
    const result = Photo.getFavoritesByUser(req.user.id, {
      page: pageNum,
      limit: limitNum
    })

    logger.info('获取用户收藏图片', { userId: req.user.id, page: pageNum, limit: limitNum })

    res.json({
      photos: result.photos,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total: result.total,
        pages: Math.ceil(result.total / limitNum),
        hasNext: pageNum * limitNum < result.total,
        hasPrev: pageNum > 1
      }
    })
  } catch (error) {
    logger.error('获取用户收藏图片失败', { error: error.message, userId: req.user.id })
    res.status(500).json({
      error: '获取收藏图片失败',
      code: 'GET_FAVORITES_FAILED'
    })
  }
})

// 获取热门图片
router.get('/trending/popular', optionalAuth, (req, res) => {
  try {
    const { limit = 20 } = req.query
    const limitNum = Math.min(50, Math.max(1, parseInt(limit)))
    
    const photos = Photo.getTrending(limitNum)

    // 如果用户已登录，检查点赞状态
    if (req.user) {
      photos.forEach(photo => {
        photo.liked = Photo.isLikedByUser(photo.id, req.user.id)
      })
    }

    logger.info('获取热门图片', { limit: limitNum, userId: req.user?.id })

    res.json({ photos })
  } catch (error) {
    logger.error('获取热门图片失败', { error: error.message })
    res.status(500).json({
      error: '获取热门图片失败',
      code: 'GET_TRENDING_FAILED'
    })
  }
})

export default router