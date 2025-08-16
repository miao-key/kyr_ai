import express from 'express'
import { authenticateToken, optionalAuth } from '../middleware/auth.js'
import { logger } from '../middleware/logger.js'
import Article from '../models/Article.js'
import config from '../config/index.js'

const router = express.Router()

// 获取文章列表（支持分页、搜索、分类筛选）
router.get('/', optionalAuth, (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      query,
      category,
      tag,
      author,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      status = 'published'
    } = req.query

    // 验证分页参数
    const pageNum = Math.max(1, parseInt(page))
    const limitNum = Math.min(config.business.pagination.maxLimit, Math.max(1, parseInt(limit)))

    // 构建查询条件
    const filters = {
      query,
      category,
      tag,
      author,
      status,
      userId: req.user?.id
    }

    // 获取文章列表
    const result = Article.findAll({
      page: pageNum,
      limit: limitNum,
      filters,
      sortBy,
      sortOrder
    })

    // 如果用户已登录，检查点赞和收藏状态
    if (req.user) {
      result.articles = result.articles.map(article => ({
        ...article,
        liked: Article.isLikedByUser(article.id, req.user.id),
        bookmarked: Article.isBookmarkedByUser(article.id, req.user.id)
      }))
    }

    logger.info('获取文章列表', {
      query,
      category,
      page: pageNum,
      limit: limitNum,
      total: result.total,
      userId: req.user?.id
    })

    res.json({
      articles: result.articles,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total: result.total,
        pages: Math.ceil(result.total / limitNum),
        hasNext: pageNum * limitNum < result.total,
        hasPrev: pageNum > 1
      },
      filters: {
        query,
        category,
        tag,
        author,
        sortBy,
        sortOrder
      }
    })
  } catch (error) {
    logger.error('获取文章列表失败', { error: error.message })
    res.status(500).json({
      error: '获取文章列表失败',
      code: 'GET_ARTICLES_FAILED'
    })
  }
})

// 获取单篇文章详情
router.get('/:id', optionalAuth, (req, res) => {
  try {
    const { id } = req.params
    
    const article = Article.findById(id)
    
    if (!article) {
      return res.status(404).json({
        error: '文章不存在',
        code: 'ARTICLE_NOT_FOUND'
      })
    }

    // 检查文章状态和权限
    if (article.status !== 'published' && (!req.user || req.user.id !== article.authorId)) {
      return res.status(403).json({
        error: '无权访问此文章',
        code: 'ACCESS_DENIED'
      })
    }

    // 增加阅读次数
    Article.incrementViews(id)

    // 如果用户已登录，检查点赞和收藏状态
    if (req.user) {
      article.liked = Article.isLikedByUser(id, req.user.id)
      article.bookmarked = Article.isBookmarkedByUser(id, req.user.id)
    }

    // 获取相关文章
    const relatedArticles = Article.getRelated(id, {
      category: article.category,
      tags: article.tags,
      limit: 5
    })

    logger.info('获取文章详情', { articleId: id, userId: req.user?.id })

    res.json({
      article,
      relatedArticles
    })
  } catch (error) {
    logger.error('获取文章详情失败', { error: error.message, articleId: req.params.id })
    res.status(500).json({
      error: '获取文章详情失败',
      code: 'GET_ARTICLE_FAILED'
    })
  }
})

// 创建文章
router.post('/', authenticateToken, (req, res) => {
  try {
    const {
      title,
      content,
      summary,
      category,
      tags = [],
      coverImage,
      status = 'draft',
      publishAt
    } = req.body

    // 验证必填字段
    if (!title || !content) {
      return res.status(400).json({
        error: '标题和内容为必填项',
        code: 'MISSING_REQUIRED_FIELDS'
      })
    }

    // 验证标题长度
    if (title.length > 200) {
      return res.status(400).json({
        error: '标题长度不能超过200字符',
        code: 'TITLE_TOO_LONG'
      })
    }

    // 验证内容长度
    if (content.length > 50000) {
      return res.status(400).json({
        error: '内容长度不能超过50000字符',
        code: 'CONTENT_TOO_LONG'
      })
    }

    // 生成文章摘要（如果未提供）
    const articleSummary = summary || content.substring(0, 200) + (content.length > 200 ? '...' : '')

    // 生成slug
    const slug = title.toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '')

    const article = Article.create({
      title,
      content,
      summary: articleSummary,
      slug,
      category: category || 'uncategorized',
      tags: Array.isArray(tags) ? tags : [],
      coverImage: coverImage || '',
      status,
      publishAt: publishAt ? new Date(publishAt) : (status === 'published' ? new Date() : null),
      authorId: req.user.id,
      authorName: req.user.username
    })

    logger.info('文章创建成功', {
      articleId: article.id,
      title,
      status,
      authorId: req.user.id
    })

    res.status(201).json({
      message: '文章创建成功',
      article
    })
  } catch (error) {
    logger.error('文章创建失败', { error: error.message, userId: req.user.id })
    res.status(500).json({
      error: '文章创建失败',
      code: 'CREATE_ARTICLE_FAILED'
    })
  }
})

// 更新文章
router.put('/:id', authenticateToken, (req, res) => {
  try {
    const { id } = req.params
    const {
      title,
      content,
      summary,
      category,
      tags,
      coverImage,
      status,
      publishAt
    } = req.body

    const article = Article.findById(id)
    
    if (!article) {
      return res.status(404).json({
        error: '文章不存在',
        code: 'ARTICLE_NOT_FOUND'
      })
    }

    // 检查权限（只有作者可以编辑）
    if (article.authorId !== req.user.id) {
      return res.status(403).json({
        error: '无权编辑此文章',
        code: 'ACCESS_DENIED'
      })
    }

    // 准备更新数据
    const updateData = {}
    
    if (title !== undefined) {
      if (title.length > 200) {
        return res.status(400).json({
          error: '标题长度不能超过200字符',
          code: 'TITLE_TOO_LONG'
        })
      }
      updateData.title = title
      updateData.slug = title.toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s_-]+/g, '-')
        .replace(/^-+|-+$/g, '')
    }
    
    if (content !== undefined) {
      if (content.length > 50000) {
        return res.status(400).json({
          error: '内容长度不能超过50000字符',
          code: 'CONTENT_TOO_LONG'
        })
      }
      updateData.content = content
      
      // 如果没有提供摘要，自动生成
      if (summary === undefined) {
        updateData.summary = content.substring(0, 200) + (content.length > 200 ? '...' : '')
      }
    }
    
    if (summary !== undefined) updateData.summary = summary
    if (category !== undefined) updateData.category = category
    if (tags !== undefined) updateData.tags = Array.isArray(tags) ? tags : []
    if (coverImage !== undefined) updateData.coverImage = coverImage
    if (status !== undefined) {
      updateData.status = status
      // 如果状态改为已发布且没有发布时间，设置当前时间
      if (status === 'published' && !article.publishAt) {
        updateData.publishAt = new Date()
      }
    }
    if (publishAt !== undefined) updateData.publishAt = publishAt ? new Date(publishAt) : null

    updateData.updatedAt = new Date()

    const updatedArticle = Article.update(id, updateData)

    logger.info('文章更新成功', {
      articleId: id,
      updates: Object.keys(updateData),
      authorId: req.user.id
    })

    res.json({
      message: '文章更新成功',
      article: updatedArticle
    })
  } catch (error) {
    logger.error('文章更新失败', { error: error.message, articleId: req.params.id, userId: req.user.id })
    res.status(500).json({
      error: '文章更新失败',
      code: 'UPDATE_ARTICLE_FAILED'
    })
  }
})

// 删除文章
router.delete('/:id', authenticateToken, (req, res) => {
  try {
    const { id } = req.params
    
    const article = Article.findById(id)
    
    if (!article) {
      return res.status(404).json({
        error: '文章不存在',
        code: 'ARTICLE_NOT_FOUND'
      })
    }

    // 检查权限（只有作者可以删除）
    if (article.authorId !== req.user.id) {
      return res.status(403).json({
        error: '无权删除此文章',
        code: 'ACCESS_DENIED'
      })
    }

    Article.delete(id)

    logger.info('文章删除成功', {
      articleId: id,
      title: article.title,
      authorId: req.user.id
    })

    res.json({
      message: '文章删除成功'
    })
  } catch (error) {
    logger.error('文章删除失败', { error: error.message, articleId: req.params.id, userId: req.user.id })
    res.status(500).json({
      error: '文章删除失败',
      code: 'DELETE_ARTICLE_FAILED'
    })
  }
})

// 点赞/取消点赞文章
router.post('/:id/like', authenticateToken, (req, res) => {
  try {
    const { id } = req.params
    const userId = req.user.id
    
    const article = Article.findById(id)
    if (!article) {
      return res.status(404).json({
        error: '文章不存在',
        code: 'ARTICLE_NOT_FOUND'
      })
    }
    
    const isLiked = Article.isLikedByUser(id, userId)
    
    if (isLiked) {
      Article.unlikeArticle(id, userId)
      logger.info('取消点赞文章', { articleId: id, userId })
      res.json({
        message: '取消点赞成功',
        liked: false,
        likesCount: article.likesCount - 1
      })
    } else {
      Article.likeArticle(id, userId)
      logger.info('点赞文章', { articleId: id, userId })
      res.json({
        message: '点赞成功',
        liked: true,
        likesCount: article.likesCount + 1
      })
    }
  } catch (error) {
    logger.error('点赞操作失败', { error: error.message, articleId: req.params.id, userId: req.user.id })
    res.status(500).json({
      error: '点赞操作失败',
      code: 'LIKE_FAILED'
    })
  }
})

// 收藏/取消收藏文章
router.post('/:id/bookmark', authenticateToken, (req, res) => {
  try {
    const { id } = req.params
    const userId = req.user.id
    
    const article = Article.findById(id)
    if (!article) {
      return res.status(404).json({
        error: '文章不存在',
        code: 'ARTICLE_NOT_FOUND'
      })
    }
    
    const isBookmarked = Article.isBookmarkedByUser(id, userId)
    
    if (isBookmarked) {
      Article.unbookmarkArticle(id, userId)
      logger.info('取消收藏文章', { articleId: id, userId })
      res.json({
        message: '取消收藏成功',
        bookmarked: false
      })
    } else {
      Article.bookmarkArticle(id, userId)
      logger.info('收藏文章', { articleId: id, userId })
      res.json({
        message: '收藏成功',
        bookmarked: true
      })
    }
  } catch (error) {
    logger.error('收藏操作失败', { error: error.message, articleId: req.params.id, userId: req.user.id })
    res.status(500).json({
      error: '收藏操作失败',
      code: 'BOOKMARK_FAILED'
    })
  }
})

// 获取用户的文章
router.get('/user/:userId', optionalAuth, (req, res) => {
  try {
    const { userId } = req.params
    const { page = 1, limit = 20, status } = req.query
    
    const pageNum = Math.max(1, parseInt(page))
    const limitNum = Math.min(config.business.pagination.maxLimit, Math.max(1, parseInt(limit)))
    
    // 如果不是作者本人，只能看到已发布的文章
    const articleStatus = (req.user && req.user.id === userId) ? status : 'published'
    
    const result = Article.findByAuthor(userId, {
      page: pageNum,
      limit: limitNum,
      status: articleStatus
    })

    logger.info('获取用户文章', { targetUserId: userId, requestUserId: req.user?.id, page: pageNum, limit: limitNum })

    res.json({
      articles: result.articles,
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
    logger.error('获取用户文章失败', { error: error.message, userId: req.params.userId })
    res.status(500).json({
      error: '获取用户文章失败',
      code: 'GET_USER_ARTICLES_FAILED'
    })
  }
})

// 获取热门文章
router.get('/trending/popular', optionalAuth, (req, res) => {
  try {
    const { limit = 10, timeRange = 'week' } = req.query
    const limitNum = Math.min(50, Math.max(1, parseInt(limit)))
    
    const articles = Article.getTrending({
      limit: limitNum,
      timeRange
    })

    // 如果用户已登录，检查点赞和收藏状态
    if (req.user) {
      articles.forEach(article => {
        article.liked = Article.isLikedByUser(article.id, req.user.id)
        article.bookmarked = Article.isBookmarkedByUser(article.id, req.user.id)
      })
    }

    logger.info('获取热门文章', { limit: limitNum, timeRange, userId: req.user?.id })

    res.json({ articles })
  } catch (error) {
    logger.error('获取热门文章失败', { error: error.message })
    res.status(500).json({
      error: '获取热门文章失败',
      code: 'GET_TRENDING_FAILED'
    })
  }
})

// 获取文章分类
router.get('/meta/categories', (req, res) => {
  try {
    const categories = Article.getCategories()
    
    logger.info('获取文章分类')
    
    res.json({ categories })
  } catch (error) {
    logger.error('获取文章分类失败', { error: error.message })
    res.status(500).json({
      error: '获取文章分类失败',
      code: 'GET_CATEGORIES_FAILED'
    })
  }
})

// 获取热门标签
router.get('/meta/tags', (req, res) => {
  try {
    const { limit = 20 } = req.query
    const limitNum = Math.min(100, Math.max(1, parseInt(limit)))
    
    const tags = Article.getPopularTags(limitNum)
    
    logger.info('获取热门标签', { limit: limitNum })
    
    res.json({ tags })
  } catch (error) {
    logger.error('获取热门标签失败', { error: error.message })
    res.status(500).json({
      error: '获取热门标签失败',
      code: 'GET_TAGS_FAILED'
    })
  }
})

export default router