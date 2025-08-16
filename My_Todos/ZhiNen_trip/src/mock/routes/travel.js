import express from 'express'
import { authenticateToken, optionalAuth } from '../middleware/auth.js'
import { logger } from '../middleware/logger.js'
import config from '../config/index.js'

const router = express.Router()

// 模拟旅游目的地数据
const destinations = [
  {
    id: '1',
    name: '巴黎',
    country: '法国',
    continent: '欧洲',
    description: '浪漫之都，拥有埃菲尔铁塔、卢浮宫等世界著名景点',
    image: 'https://images.unsplash.com/photo-1502602898536-47ad22581b52?w=800',
    rating: 4.8,
    reviewCount: 15420,
    averagePrice: 8000,
    currency: 'CNY',
    bestTime: '4-6月，9-11月',
    tags: ['浪漫', '艺术', '美食', '历史'],
    attractions: ['埃菲尔铁塔', '卢浮宫', '凯旋门', '塞纳河'],
    coordinates: { lat: 48.8566, lng: 2.3522 },
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01')
  },
  {
    id: '2',
    name: '东京',
    country: '日本',
    continent: '亚洲',
    description: '现代与传统完美融合的国际大都市',
    image: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800',
    rating: 4.7,
    reviewCount: 12350,
    averagePrice: 6500,
    currency: 'CNY',
    bestTime: '3-5月，9-11月',
    tags: ['现代', '传统', '美食', '购物'],
    attractions: ['东京塔', '浅草寺', '银座', '新宿'],
    coordinates: { lat: 35.6762, lng: 139.6503 },
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01')
  },
  {
    id: '3',
    name: '纽约',
    country: '美国',
    continent: '北美洲',
    description: '不夜城，世界金融和文化中心',
    image: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=800',
    rating: 4.6,
    reviewCount: 18750,
    averagePrice: 9500,
    currency: 'CNY',
    bestTime: '4-6月，9-11月',
    tags: ['都市', '文化', '购物', '夜生活'],
    attractions: ['自由女神像', '时代广场', '中央公园', '帝国大厦'],
    coordinates: { lat: 40.7128, lng: -74.0060 },
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01')
  },
  {
    id: '4',
    name: '巴厘岛',
    country: '印度尼西亚',
    continent: '亚洲',
    description: '热带天堂，拥有美丽的海滩和丰富的文化',
    image: 'https://images.unsplash.com/photo-1537953773345-d172ccf13cf1?w=800',
    rating: 4.9,
    reviewCount: 9870,
    averagePrice: 4500,
    currency: 'CNY',
    bestTime: '4-9月',
    tags: ['海滩', '度假', '文化', '自然'],
    attractions: ['乌布', '库塔海滩', '圣泉寺', '火山'],
    coordinates: { lat: -8.3405, lng: 115.0920 },
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01')
  },
  {
    id: '5',
    name: '罗马',
    country: '意大利',
    continent: '欧洲',
    description: '永恒之城，拥有丰富的历史和文化遗产',
    image: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=800',
    rating: 4.7,
    reviewCount: 14200,
    averagePrice: 7200,
    currency: 'CNY',
    bestTime: '4-6月，9-10月',
    tags: ['历史', '文化', '艺术', '美食'],
    attractions: ['斗兽场', '梵蒂冈', '许愿池', '万神殿'],
    coordinates: { lat: 41.9028, lng: 12.4964 },
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01')
  }
]

// 模拟旅游攻略数据
const guides = [
  {
    id: '1',
    title: '巴黎7日深度游攻略',
    destinationId: '1',
    destination: '巴黎',
    author: 'travel_expert',
    authorName: '旅行专家',
    content: '详细的巴黎7日游攻略，包含景点推荐、美食指南、交通攻略等...',
    summary: '完整的巴黎旅游攻略，让你深度体验浪漫之都的魅力',
    coverImage: 'https://images.unsplash.com/photo-1502602898536-47ad22581b52?w=800',
    duration: 7,
    budget: 8000,
    difficulty: 'easy',
    tags: ['深度游', '文化', '美食'],
    likes: 1250,
    views: 15600,
    bookmarks: 890,
    rating: 4.8,
    reviewCount: 156,
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-15')
  },
  {
    id: '2',
    title: '东京美食探索之旅',
    destinationId: '2',
    destination: '东京',
    author: 'foodie_traveler',
    authorName: '美食旅行家',
    content: '东京最佳美食体验指南，从街头小吃到米其林餐厅...',
    summary: '带你品尝东京最地道的美食，体验日本饮食文化',
    coverImage: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800',
    duration: 5,
    budget: 6500,
    difficulty: 'easy',
    tags: ['美食', '文化体验'],
    likes: 980,
    views: 12400,
    bookmarks: 650,
    rating: 4.7,
    reviewCount: 98,
    createdAt: new Date('2024-01-20'),
    updatedAt: new Date('2024-01-20')
  }
]

// 模拟用户收藏和点赞数据
const userInteractions = {
  favorites: new Map(), // userId -> Set of destinationIds
  likes: new Map(), // userId -> Set of guideIds
  bookmarks: new Map() // userId -> Set of guideIds
}

// 获取旅游目的地列表
router.get('/destinations', optionalAuth, (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      query,
      continent,
      country,
      minRating,
      maxPrice,
      tags,
      sortBy = 'rating',
      sortOrder = 'desc'
    } = req.query

    // 验证分页参数
    const pageNum = Math.max(1, parseInt(page))
    const limitNum = Math.min(config.business.pagination.maxLimit, Math.max(1, parseInt(limit)))

    // 过滤目的地
    let filteredDestinations = [...destinations]

    if (query) {
      const searchQuery = query.toLowerCase()
      filteredDestinations = filteredDestinations.filter(dest => 
        dest.name.toLowerCase().includes(searchQuery) ||
        dest.country.toLowerCase().includes(searchQuery) ||
        dest.description.toLowerCase().includes(searchQuery)
      )
    }

    if (continent) {
      filteredDestinations = filteredDestinations.filter(dest => 
        dest.continent.toLowerCase() === continent.toLowerCase()
      )
    }

    if (country) {
      filteredDestinations = filteredDestinations.filter(dest => 
        dest.country.toLowerCase() === country.toLowerCase()
      )
    }

    if (minRating) {
      filteredDestinations = filteredDestinations.filter(dest => 
        dest.rating >= parseFloat(minRating)
      )
    }

    if (maxPrice) {
      filteredDestinations = filteredDestinations.filter(dest => 
        dest.averagePrice <= parseInt(maxPrice)
      )
    }

    if (tags) {
      const tagList = Array.isArray(tags) ? tags : [tags]
      filteredDestinations = filteredDestinations.filter(dest => 
        tagList.some(tag => dest.tags.includes(tag))
      )
    }

    // 排序
    filteredDestinations.sort((a, b) => {
      let aValue = a[sortBy]
      let bValue = b[sortBy]
      
      if (sortBy === 'name' || sortBy === 'country') {
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
    const total = filteredDestinations.length
    const startIndex = (pageNum - 1) * limitNum
    const endIndex = startIndex + limitNum
    const paginatedDestinations = filteredDestinations.slice(startIndex, endIndex)

    // 如果用户已登录，添加收藏状态
    if (req.user) {
      const userFavorites = userInteractions.favorites.get(req.user.id) || new Set()
      paginatedDestinations.forEach(dest => {
        dest.isFavorited = userFavorites.has(dest.id)
      })
    }

    logger.info('获取旅游目的地列表', {
      query,
      continent,
      country,
      page: pageNum,
      limit: limitNum,
      total,
      userId: req.user?.id
    })

    res.json({
      destinations: paginatedDestinations,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum),
        hasNext: pageNum * limitNum < total,
        hasPrev: pageNum > 1
      },
      filters: {
        query,
        continent,
        country,
        minRating,
        maxPrice,
        tags,
        sortBy,
        sortOrder
      }
    })
  } catch (error) {
    logger.error('获取旅游目的地列表失败', { error: error.message })
    res.status(500).json({
      error: '获取旅游目的地列表失败',
      code: 'GET_DESTINATIONS_FAILED'
    })
  }
})

// 获取单个旅游目的地详情
router.get('/destinations/:id', optionalAuth, (req, res) => {
  try {
    const { id } = req.params
    
    const destination = destinations.find(dest => dest.id === id)
    
    if (!destination) {
      return res.status(404).json({
        error: '目的地不存在',
        code: 'DESTINATION_NOT_FOUND'
      })
    }

    // 如果用户已登录，添加收藏状态
    if (req.user) {
      const userFavorites = userInteractions.favorites.get(req.user.id) || new Set()
      destination.isFavorited = userFavorites.has(destination.id)
    }

    // 获取相关攻略
    const relatedGuides = guides.filter(guide => guide.destinationId === id).slice(0, 5)

    logger.info('获取旅游目的地详情', { destinationId: id, userId: req.user?.id })

    res.json({
      destination,
      relatedGuides
    })
  } catch (error) {
    logger.error('获取旅游目的地详情失败', { error: error.message, destinationId: req.params.id })
    res.status(500).json({
      error: '获取旅游目的地详情失败',
      code: 'GET_DESTINATION_FAILED'
    })
  }
})

// 收藏/取消收藏目的地
router.post('/destinations/:id/favorite', authenticateToken, (req, res) => {
  try {
    const { id } = req.params
    const userId = req.user.id
    
    const destination = destinations.find(dest => dest.id === id)
    if (!destination) {
      return res.status(404).json({
        error: '目的地不存在',
        code: 'DESTINATION_NOT_FOUND'
      })
    }
    
    if (!userInteractions.favorites.has(userId)) {
      userInteractions.favorites.set(userId, new Set())
    }
    
    const userFavorites = userInteractions.favorites.get(userId)
    const isFavorited = userFavorites.has(id)
    
    if (isFavorited) {
      userFavorites.delete(id)
      logger.info('取消收藏目的地', { destinationId: id, userId })
      res.json({
        message: '取消收藏成功',
        isFavorited: false
      })
    } else {
      userFavorites.add(id)
      logger.info('收藏目的地', { destinationId: id, userId })
      res.json({
        message: '收藏成功',
        isFavorited: true
      })
    }
  } catch (error) {
    logger.error('收藏操作失败', { error: error.message, destinationId: req.params.id, userId: req.user.id })
    res.status(500).json({
      error: '收藏操作失败',
      code: 'FAVORITE_FAILED'
    })
  }
})

// 获取旅游攻略列表
router.get('/guides', optionalAuth, (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      query,
      destinationId,
      destination,
      author,
      minRating,
      maxDuration,
      maxBudget,
      difficulty,
      tags,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query

    // 验证分页参数
    const pageNum = Math.max(1, parseInt(page))
    const limitNum = Math.min(config.business.pagination.maxLimit, Math.max(1, parseInt(limit)))

    // 过滤攻略
    let filteredGuides = [...guides]

    if (query) {
      const searchQuery = query.toLowerCase()
      filteredGuides = filteredGuides.filter(guide => 
        guide.title.toLowerCase().includes(searchQuery) ||
        guide.content.toLowerCase().includes(searchQuery) ||
        guide.destination.toLowerCase().includes(searchQuery)
      )
    }

    if (destinationId) {
      filteredGuides = filteredGuides.filter(guide => guide.destinationId === destinationId)
    }

    if (destination) {
      filteredGuides = filteredGuides.filter(guide => 
        guide.destination.toLowerCase().includes(destination.toLowerCase())
      )
    }

    if (author) {
      filteredGuides = filteredGuides.filter(guide => guide.author === author)
    }

    if (minRating) {
      filteredGuides = filteredGuides.filter(guide => guide.rating >= parseFloat(minRating))
    }

    if (maxDuration) {
      filteredGuides = filteredGuides.filter(guide => guide.duration <= parseInt(maxDuration))
    }

    if (maxBudget) {
      filteredGuides = filteredGuides.filter(guide => guide.budget <= parseInt(maxBudget))
    }

    if (difficulty) {
      filteredGuides = filteredGuides.filter(guide => guide.difficulty === difficulty)
    }

    if (tags) {
      const tagList = Array.isArray(tags) ? tags : [tags]
      filteredGuides = filteredGuides.filter(guide => 
        tagList.some(tag => guide.tags.includes(tag))
      )
    }

    // 排序
    filteredGuides.sort((a, b) => {
      let aValue = a[sortBy]
      let bValue = b[sortBy]
      
      if (sortBy === 'title' || sortBy === 'destination') {
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
    const total = filteredGuides.length
    const startIndex = (pageNum - 1) * limitNum
    const endIndex = startIndex + limitNum
    const paginatedGuides = filteredGuides.slice(startIndex, endIndex)

    // 如果用户已登录，添加点赞和收藏状态
    if (req.user) {
      const userLikes = userInteractions.likes.get(req.user.id) || new Set()
      const userBookmarks = userInteractions.bookmarks.get(req.user.id) || new Set()
      
      paginatedGuides.forEach(guide => {
        guide.isLiked = userLikes.has(guide.id)
        guide.isBookmarked = userBookmarks.has(guide.id)
      })
    }

    logger.info('获取旅游攻略列表', {
      query,
      destinationId,
      destination,
      page: pageNum,
      limit: limitNum,
      total,
      userId: req.user?.id
    })

    res.json({
      guides: paginatedGuides,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum),
        hasNext: pageNum * limitNum < total,
        hasPrev: pageNum > 1
      },
      filters: {
        query,
        destinationId,
        destination,
        author,
        minRating,
        maxDuration,
        maxBudget,
        difficulty,
        tags,
        sortBy,
        sortOrder
      }
    })
  } catch (error) {
    logger.error('获取旅游攻略列表失败', { error: error.message })
    res.status(500).json({
      error: '获取旅游攻略列表失败',
      code: 'GET_GUIDES_FAILED'
    })
  }
})

// 获取单个旅游攻略详情
router.get('/guides/:id', optionalAuth, (req, res) => {
  try {
    const { id } = req.params
    
    const guide = guides.find(g => g.id === id)
    
    if (!guide) {
      return res.status(404).json({
        error: '攻略不存在',
        code: 'GUIDE_NOT_FOUND'
      })
    }

    // 增加浏览次数
    guide.views += 1

    // 如果用户已登录，添加点赞和收藏状态
    if (req.user) {
      const userLikes = userInteractions.likes.get(req.user.id) || new Set()
      const userBookmarks = userInteractions.bookmarks.get(req.user.id) || new Set()
      
      guide.isLiked = userLikes.has(guide.id)
      guide.isBookmarked = userBookmarks.has(guide.id)
    }

    // 获取相关攻略
    const relatedGuides = guides
      .filter(g => g.id !== id && g.destinationId === guide.destinationId)
      .slice(0, 5)

    logger.info('获取旅游攻略详情', { guideId: id, userId: req.user?.id })

    res.json({
      guide,
      relatedGuides
    })
  } catch (error) {
    logger.error('获取旅游攻略详情失败', { error: error.message, guideId: req.params.id })
    res.status(500).json({
      error: '获取旅游攻略详情失败',
      code: 'GET_GUIDE_FAILED'
    })
  }
})

// 点赞/取消点赞攻略
router.post('/guides/:id/like', authenticateToken, (req, res) => {
  try {
    const { id } = req.params
    const userId = req.user.id
    
    const guide = guides.find(g => g.id === id)
    if (!guide) {
      return res.status(404).json({
        error: '攻略不存在',
        code: 'GUIDE_NOT_FOUND'
      })
    }
    
    if (!userInteractions.likes.has(userId)) {
      userInteractions.likes.set(userId, new Set())
    }
    
    const userLikes = userInteractions.likes.get(userId)
    const isLiked = userLikes.has(id)
    
    if (isLiked) {
      userLikes.delete(id)
      guide.likes -= 1
      logger.info('取消点赞攻略', { guideId: id, userId })
      res.json({
        message: '取消点赞成功',
        isLiked: false,
        likes: guide.likes
      })
    } else {
      userLikes.add(id)
      guide.likes += 1
      logger.info('点赞攻略', { guideId: id, userId })
      res.json({
        message: '点赞成功',
        isLiked: true,
        likes: guide.likes
      })
    }
  } catch (error) {
    logger.error('点赞操作失败', { error: error.message, guideId: req.params.id, userId: req.user.id })
    res.status(500).json({
      error: '点赞操作失败',
      code: 'LIKE_FAILED'
    })
  }
})

// 收藏/取消收藏攻略
router.post('/guides/:id/bookmark', authenticateToken, (req, res) => {
  try {
    const { id } = req.params
    const userId = req.user.id
    
    const guide = guides.find(g => g.id === id)
    if (!guide) {
      return res.status(404).json({
        error: '攻略不存在',
        code: 'GUIDE_NOT_FOUND'
      })
    }
    
    if (!userInteractions.bookmarks.has(userId)) {
      userInteractions.bookmarks.set(userId, new Set())
    }
    
    const userBookmarks = userInteractions.bookmarks.get(userId)
    const isBookmarked = userBookmarks.has(id)
    
    if (isBookmarked) {
      userBookmarks.delete(id)
      guide.bookmarks -= 1
      logger.info('取消收藏攻略', { guideId: id, userId })
      res.json({
        message: '取消收藏成功',
        isBookmarked: false,
        bookmarks: guide.bookmarks
      })
    } else {
      userBookmarks.add(id)
      guide.bookmarks += 1
      logger.info('收藏攻略', { guideId: id, userId })
      res.json({
        message: '收藏成功',
        isBookmarked: true,
        bookmarks: guide.bookmarks
      })
    }
  } catch (error) {
    logger.error('收藏操作失败', { error: error.message, guideId: req.params.id, userId: req.user.id })
    res.status(500).json({
      error: '收藏操作失败',
      code: 'BOOKMARK_FAILED'
    })
  }
})

// 获取热门目的地
router.get('/destinations/trending/popular', optionalAuth, (req, res) => {
  try {
    const { limit = 10 } = req.query
    const limitNum = Math.min(50, Math.max(1, parseInt(limit)))
    
    // 按评分和评论数排序
    const popularDestinations = [...destinations]
      .sort((a, b) => (b.rating * b.reviewCount) - (a.rating * a.reviewCount))
      .slice(0, limitNum)

    // 如果用户已登录，添加收藏状态
    if (req.user) {
      const userFavorites = userInteractions.favorites.get(req.user.id) || new Set()
      popularDestinations.forEach(dest => {
        dest.isFavorited = userFavorites.has(dest.id)
      })
    }

    logger.info('获取热门目的地', { limit: limitNum, userId: req.user?.id })

    res.json({ destinations: popularDestinations })
  } catch (error) {
    logger.error('获取热门目的地失败', { error: error.message })
    res.status(500).json({
      error: '获取热门目的地失败',
      code: 'GET_TRENDING_DESTINATIONS_FAILED'
    })
  }
})

// 获取热门攻略
router.get('/guides/trending/popular', optionalAuth, (req, res) => {
  try {
    const { limit = 10 } = req.query
    const limitNum = Math.min(50, Math.max(1, parseInt(limit)))
    
    // 按点赞数和浏览数排序
    const popularGuides = [...guides]
      .sort((a, b) => (b.likes + b.views * 0.1) - (a.likes + a.views * 0.1))
      .slice(0, limitNum)

    // 如果用户已登录，添加点赞和收藏状态
    if (req.user) {
      const userLikes = userInteractions.likes.get(req.user.id) || new Set()
      const userBookmarks = userInteractions.bookmarks.get(req.user.id) || new Set()
      
      popularGuides.forEach(guide => {
        guide.isLiked = userLikes.has(guide.id)
        guide.isBookmarked = userBookmarks.has(guide.id)
      })
    }

    logger.info('获取热门攻略', { limit: limitNum, userId: req.user?.id })

    res.json({ guides: popularGuides })
  } catch (error) {
    logger.error('获取热门攻略失败', { error: error.message })
    res.status(500).json({
      error: '获取热门攻略失败',
      code: 'GET_TRENDING_GUIDES_FAILED'
    })
  }
})

// 获取用户收藏的目的地
router.get('/user/favorites', authenticateToken, (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query
    const userId = req.user.id
    
    const pageNum = Math.max(1, parseInt(page))
    const limitNum = Math.min(config.business.pagination.maxLimit, Math.max(1, parseInt(limit)))
    
    const userFavorites = userInteractions.favorites.get(userId) || new Set()
    const favoriteDestinations = destinations.filter(dest => userFavorites.has(dest.id))
    
    // 分页
    const total = favoriteDestinations.length
    const startIndex = (pageNum - 1) * limitNum
    const endIndex = startIndex + limitNum
    const paginatedFavorites = favoriteDestinations.slice(startIndex, endIndex)
    
    // 添加收藏状态
    paginatedFavorites.forEach(dest => {
      dest.isFavorited = true
    })

    logger.info('获取用户收藏目的地', { userId, page: pageNum, limit: limitNum, total })

    res.json({
      destinations: paginatedFavorites,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum),
        hasNext: pageNum * limitNum < total,
        hasPrev: pageNum > 1
      }
    })
  } catch (error) {
    logger.error('获取用户收藏目的地失败', { error: error.message, userId: req.user.id })
    res.status(500).json({
      error: '获取用户收藏目的地失败',
      code: 'GET_USER_FAVORITES_FAILED'
    })
  }
})

export default router