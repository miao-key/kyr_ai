import { logger } from '../middleware/logger.js'
import config from '../config/index.js'

// 模拟文章数据存储
const articles = new Map()
let articleIdCounter = 1

// 初始化一些测试文章数据
const initArticles = [
  {
    id: '1',
    title: '巴黎深度游：探索光之城的隐秘角落',
    slug: 'paris-hidden-gems-travel-guide',
    excerpt: '除了埃菲尔铁塔和卢浮宫，巴黎还有许多鲜为人知的美丽角落等待着你去发现。这篇文章将带你走进真正的巴黎生活。',
    content: `# 巴黎深度游：探索光之城的隐秘角落

巴黎，这座被誉为"光之城"的浪漫都市，每年吸引着数百万游客。然而，大多数人只是匆匆走过那些著名的景点，却错过了这座城市真正的魅力所在。

## 蒙马特的清晨

当第一缕阳光洒向蒙马特高地时，整个巴黎都还在沉睡中。这是体验真正巴黎生活的最佳时刻。在圣心大教堂前的台阶上坐下，看着这座城市慢慢苏醒。

### 推荐路线

1. **清晨6点** - 圣心大教堂观日出
2. **7点** - 在小丘广场感受艺术家的创作氛围
3. **8点** - 到当地咖啡馆享用正宗法式早餐

## 塞纳河左岸的文艺气息

左岸不仅仅是索邦大学和先贤祠，更是巴黎文艺复兴的发源地。漫步在狭窄的石板路上，每一个转角都可能遇到惊喜。

### 必访书店

- **莎士比亚书店** - 海明威曾经的聚集地
- **红轮书店** - 法国文学的宝库
- **旧书摊** - 塞纳河边的文化符号

## 美食探索

真正的巴黎美食不在米其林餐厅，而在那些藏在小巷深处的bistro和brasserie中。

### 推荐餐厅

1. **L'Ami Jean** - 传统法式料理
2. **Du Pain et des Idées** - 最好的面包店
3. **Marché des Enfants Rouges** - 最古老的有盖市场

## 实用贴士

- 避开周一，很多博物馆和商店都关门
- 学会说几句基本的法语，当地人会更友善
- 购买博物馆通票，既省钱又省时间
- 尝试使用Vélib'自行车系统，这是最巴黎的出行方式

巴黎的魅力在于细节，在于那些不经意间的发现。放慢脚步，用心感受，你会发现一个完全不同的巴黎。`,
    coverImage: 'https://images.unsplash.com/photo-1511739001486-6bfe10ce785f?w=800',
    author: 'travel_expert',
    authorId: '2',
    category: 'destination',
    tags: ['巴黎', '法国', '欧洲', '深度游', '文化', '美食'],
    status: 'published',
    publishedAt: new Date('2024-01-16T10:00:00Z'),
    createdAt: new Date('2024-01-15T15:30:00Z'),
    updatedAt: new Date('2024-01-16T10:00:00Z'),
    viewCount: 2340,
    likeCount: 89,
    commentCount: 12,
    shareCount: 23,
    bookmarkCount: 45,
    readingTime: 8,
    difficulty: 'beginner',
    season: ['spring', 'summer', 'autumn'],
    budget: 'medium',
    duration: '3-5天',
    isPublic: true,
    isFeatured: true,
    isPinned: false,
    seoTitle: '巴黎深度游攻略 - 探索光之城的隐秘角落 | 旅行指南',
    seoDescription: '发现巴黎鲜为人知的美丽角落，从蒙马特的清晨到塞纳河左岸的文艺气息，这份深度游攻略带你体验真正的巴黎生活。',
    seoKeywords: ['巴黎旅游', '巴黎攻略', '法国旅行', '欧洲自由行', '巴黎美食']
  },
  {
    id: '2',
    title: '京都四季物语：一年四季的古都之美',
    slug: 'kyoto-four-seasons-travel-guide',
    excerpt: '京都的美在于四季分明，每个季节都有独特的魅力。春樱、夏绿、秋枫、冬雪，让我们一起感受这座千年古都的四季变迁。',
    content: `# 京都四季物语：一年四季的古都之美

京都，这座拥有1200多年历史的古都，以其深厚的文化底蕴和四季分明的自然美景而闻名于世。每个季节的京都都有着独特的魅力，值得我们细细品味。

## 春：樱花满城的浪漫

### 最佳赏樱地点

**哲学之道**
- 时间：4月上旬
- 特色：樱花飘落如雪，诗意盎然
- 推荐时间：清晨或傍晚

**圆山公园**
- 时间：4月中旬
- 特色：夜樱点灯，如梦如幻
- 活动：花见野餐

**清水寺**
- 时间：4月上中旬
- 特色：古寺配樱花，古典与自然的完美结合
- 门票：成人400日元

### 春季美食

- **樱花茶** - 淡雅清香
- **樱花和果子** - 季节限定甜品
- **竹笋料理** - 春天的鲜美

## 夏：绿意盎然的清凉

### 避暑胜地

**贵船川床料理**
- 特色：在溪流上用餐的独特体验
- 价格：午餐5000-8000日元
- 预约：建议提前1周

**竹林小径**
- 位置：岚山
- 特色：竹叶沙沙声，天然空调
- 最佳时间：上午10点前

### 夏日祭典

- **祇园祭** (7月) - 京都最大的祭典
- **五山送火** (8月16日) - 盂兰盆节的传统仪式

## 秋：红叶如火的绚烂

### 赏枫名所

**东福寺**
- 时间：11月中下旬
- 特色：通天桥上看红叶海
- 门票：成人600日元

**岚山**
- 时间：11月下旬-12月上旬
- 特色：渡月桥与红叶的经典组合
- 交通：阪急岚山线

**永观堂**
- 时间：11月中旬
- 特色："红叶的永观堂"美誉
- 夜间点灯：17:30-20:30

### 秋季体验

- **茶道体验** - 在红叶庭院中品茶
- **和服租赁** - 与秋色完美融合
- **温泉** - 洗去一天的疲惫

## 冬：雪化妆的静谧

### 雪景名所

**金阁寺**
- 特色：雪中金阁，如诗如画
- 最佳时间：雪后清晨
- 门票：成人500日元

**银阁寺**
- 特色：枯山水庭园的雪景
- 开放时间：8:30-17:00

### 冬季美食

- **湯豆腐** - 清淡温暖的豆腐料理
- **おでん** - 关东煮暖身
- **甘酒** - 传统甜米酒

## 实用信息

### 交通

- **京都市巴士一日券** - 600日元，无限乘坐
- **京都地铁** - 覆盖主要景点
- **自行车租赁** - 1000日元/天

### 住宿推荐

- **传统旅馆** - 体验日式服务
- **胶囊旅馆** - 经济实惠
- **民宿** - 感受当地生活

### 购物

- **锦市场** - "京都的厨房"
- **清水坂** - 传统工艺品
- **祇园** - 高级和服和茶具

京都的美需要用心去感受，每个季节都有不同的惊喜等待着你。无论何时来到这座古都，都能找到属于那个季节独有的美好回忆。`,
    coverImage: 'https://images.unsplash.com/photo-1545569341-9eb8b30979d9?w=800',
    author: 'travel_expert',
    authorId: '2',
    category: 'destination',
    tags: ['京都', '日本', '四季', '樱花', '红叶', '文化'],
    status: 'published',
    publishedAt: new Date('2024-01-21T09:30:00Z'),
    createdAt: new Date('2024-01-20T14:00:00Z'),
    updatedAt: new Date('2024-01-21T09:30:00Z'),
    viewCount: 3120,
    likeCount: 127,
    commentCount: 18,
    shareCount: 34,
    bookmarkCount: 78,
    readingTime: 12,
    difficulty: 'intermediate',
    season: ['spring', 'summer', 'autumn', 'winter'],
    budget: 'medium',
    duration: '5-7天',
    isPublic: true,
    isFeatured: true,
    isPinned: false,
    seoTitle: '京都四季旅游攻略 - 春樱夏绿秋枫冬雪完全指南',
    seoDescription: '详细的京都四季旅游攻略，包括最佳赏樱地点、避暑胜地、赏枫名所和雪景观赏，让你感受千年古都的四季之美。',
    seoKeywords: ['京都旅游', '京都四季', '日本旅行', '樱花', '红叶', '京都攻略']
  },
  {
    id: '3',
    title: '托斯卡纳美食之旅：品味意大利乡村的醇香',
    slug: 'tuscany-food-wine-travel-guide',
    excerpt: '托斯卡纳不仅有美丽的田园风光，更有令人垂涎的美食和醇香的葡萄酒。让我们一起踏上这场味蕾的盛宴之旅。',
    content: `# 托斯卡纳美食之旅：品味意大利乡村的醇香

托斯卡纳，这片被誉为意大利最美丽的地区之一，不仅以其起伏的丘陵、古老的城堡和葡萄园而闻名，更以其丰富的美食文化和世界级的葡萄酒而让人流连忘返。

## 经典托斯卡纳菜肴

### 主菜类

**Bistecca alla Fiorentina (佛罗伦萨牛排)**
- 特色：厚切T骨牛排，炭火烧烤
- 重量：通常1-2公斤
- 价格：50-80欧元
- 推荐餐厅：Trattoria Sostanza (佛罗伦萨)

**Pici Cacio e Pepe**
- 特色：手工粗面条配羊奶酪和黑胡椒
- 起源：锡耶纳地区
- 价格：12-15欧元

**Cinghiale in Umido (炖野猪肉)**
- 特色：用红酒和香草慢炖的野猪肉
- 季节：秋冬季节
- 搭配：Chianti Classico红酒

### 开胃菜

**Crostini Toscani**
- 配料：鸡肝酱、橄榄油、面包片
- 特点：托斯卡纳最经典的开胃菜

**Panzanella**
- 配料：面包、番茄、洋葱、罗勒
- 季节：夏季限定
- 特点：利用隔夜面包的创意沙拉

## 葡萄酒产区探索

### Chianti Classico 产区

**特色酒庄推荐：**

1. **Castello di Verrazzano**
   - 历史：12世纪古堡酒庄
   - 品酒费用：25-40欧元
   - 预约：必须提前预约
   - 特色：城堡参观 + 品酒 + 午餐套餐

2. **Antinori nel Chianti Classico**
   - 特色：现代化酒庄建筑
   - 品酒体验：30-50欧元
   - 亮点：地下酒窖参观

3. **Castello di Brolio**
   - 历史：Ricasoli家族900年历史
   - 门票：15欧元（含品酒）
   - 特色：Chianti Classico的发源地

### Brunello di Montalcino 产区

**推荐酒庄：**

- **Biondi Santi** - Brunello的创始酒庄
- **Casanova di Neri** - 现代派代表
- **Il Poggione** - 性价比之选

### 品酒贴士

- **预约时间**：建议提前1-2周预约
- **最佳季节**：9-11月收获季节
- **着装**：商务休闲，避免强烈香水
- **代驾服务**：多数酒庄提供接送服务

## 美食市场与购物

### 佛罗伦萨中央市场

**一楼：新鲜食材**
- 营业时间：7:00-14:00
- 特色：新鲜蔬果、肉类、奶酪
- 推荐：Parmigiano Reggiano试吃

**二楼：美食广场**
- 营业时间：10:00-24:00
- 特色：各种托斯卡纳小食
- 推荐摊位：
  - Nerbone - 牛肚包
  - Da Rocco - 意式三明治
  - Gusta Pizza - 现烤披萨

### 锡耶纳周六市场

- 时间：每周六上午
- 地点：Il Campo广场周边
- 特色：当地农产品、手工制品
- 必买：松露、野猪肉制品、手工面条

## 烹饪课程体验

### 推荐学校

**1. Tuscookany (锡耶纳)**
- 课程：半日/全日烹饪课
- 价格：120-180欧元
- 包含：市场采购 + 烹饪 + 用餐
- 特色：有机农场环境

**2. In Tavola (佛罗伦萨)**
- 课程：传统托斯卡纳料理
- 价格：85-150欧元
- 亮点：小班教学，中文服务

**3. Mama Florence**
- 特色：家庭式烹饪体验
- 价格：79欧元
- 包含：3道菜 + 甜点制作

## 美食节庆活动

### 年度美食节

**Sagra del Tartufo (松露节)**
- 时间：10-11月
- 地点：San Miniato
- 活动：松露市场、品尝会、烹饪比赛

**Chianti Classico Wine Festival**
- 时间：9月第二个周末
- 地点：Greve in Chianti
- 特色：酒庄开放日，免费品酒

**Sagra della Bistecca**
- 时间：8月中旬
- 地点：Cortona
- 特色：佛罗伦萨牛排节

## 实用信息

### 用餐礼仪

- **午餐时间**：12:30-14:30
- **晚餐时间**：19:30-22:00
- **小费**：账单的10%
- **着装**：整洁即可，高档餐厅需正装

### 交通建议

- **租车**：最佳选择，自由度高
- **火车**：连接主要城市
- **当地巴士**：到达小镇和酒庄
- **自行车**：平缓地区的浪漫选择

### 住宿推荐

- **Agriturismo**：农庄民宿，体验乡村生活
- **Borgo**：古堡酒店，奢华体验
- **B&B**：家庭旅馆，性价比高

托斯卡纳的美食之旅不仅是味蕾的享受，更是对意大利乡村文化的深度体验。在这里，每一餐都是艺术，每一杯酒都有故事。`,
    coverImage: 'https://images.unsplash.com/photo-1523906834658-6e24ef2386f9?w=800',
    author: 'foodie_traveler',
    authorId: '3',
    category: 'food',
    tags: ['托斯卡纳', '意大利', '美食', '葡萄酒', '烹饪', '乡村'],
    status: 'published',
    publishedAt: new Date('2024-02-06T11:20:00Z'),
    createdAt: new Date('2024-02-05T16:00:00Z'),
    updatedAt: new Date('2024-02-06T11:20:00Z'),
    viewCount: 1560,
    likeCount: 45,
    commentCount: 8,
    shareCount: 12,
    bookmarkCount: 32,
    readingTime: 15,
    difficulty: 'intermediate',
    season: ['spring', 'summer', 'autumn'],
    budget: 'high',
    duration: '7-10天',
    isPublic: true,
    isFeatured: false,
    isPinned: false,
    seoTitle: '托斯卡纳美食葡萄酒之旅 - 意大利乡村美食完全攻略',
    seoDescription: '深度探索托斯卡纳美食文化，从经典菜肴到世界级葡萄酒，包含酒庄推荐、烹饪课程和美食节庆信息的完整指南。',
    seoKeywords: ['托斯卡纳美食', '意大利葡萄酒', '意大利旅游', '美食之旅', 'Chianti', '烹饪课程']
  }
]

// 初始化文章数据
initArticles.forEach(article => {
  articles.set(article.id, article)
  articleIdCounter = Math.max(articleIdCounter, parseInt(article.id) + 1)
})

class Article {
  // 创建新文章
  static create(articleData) {
    try {
      const {
        title,
        slug,
        excerpt = '',
        content,
        coverImage = '',
        author,
        authorId,
        category = 'general',
        tags = [],
        status = 'draft',
        readingTime,
        difficulty = 'beginner',
        season = [],
        budget = 'medium',
        duration = '',
        isPublic = true,
        seoTitle,
        seoDescription,
        seoKeywords = []
      } = articleData

      // 验证必填字段
      if (!title || !content || !author || !authorId) {
        throw new Error('标题、内容、作者和作者ID为必填项')
      }

      const articleId = articleIdCounter.toString()
      articleIdCounter++

      // 生成slug（如果没有提供）
      const generatedSlug = slug || title
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .substring(0, 50)

      // 计算阅读时间（如果没有提供）
      const calculatedReadingTime = readingTime || Math.ceil(content.length / 1000)

      const newArticle = {
        id: articleId,
        title,
        slug: generatedSlug,
        excerpt,
        content,
        coverImage,
        author,
        authorId,
        category,
        tags: Array.isArray(tags) ? tags : [],
        status,
        publishedAt: status === 'published' ? new Date() : null,
        createdAt: new Date(),
        updatedAt: new Date(),
        viewCount: 0,
        likeCount: 0,
        commentCount: 0,
        shareCount: 0,
        bookmarkCount: 0,
        readingTime: calculatedReadingTime,
        difficulty,
        season: Array.isArray(season) ? season : [],
        budget,
        duration,
        isPublic,
        isFeatured: false,
        isPinned: false,
        seoTitle: seoTitle || title,
        seoDescription: seoDescription || excerpt,
        seoKeywords: Array.isArray(seoKeywords) ? seoKeywords : []
      }

      articles.set(articleId, newArticle)
      return newArticle
    } catch (error) {
      logger.error('创建文章失败', { error: error.message, articleData })
      throw error
    }
  }

  // 根据ID查找文章
  static findById(id) {
    return articles.get(id) || null
  }

  // 根据slug查找文章
  static findBySlug(slug) {
    for (const article of articles.values()) {
      if (article.slug === slug) {
        return article
      }
    }
    return null
  }

  // 获取文章列表
  static findAll(options = {}) {
    const {
      page = 1,
      limit = 20,
      search,
      category,
      author,
      tags,
      status,
      isPublic,
      isFeatured,
      difficulty,
      budget,
      season,
      sortBy = 'publishedAt',
      sortOrder = 'desc'
    } = options

    let articleList = Array.from(articles.values())

    // 过滤
    if (search) {
      const searchLower = search.toLowerCase()
      articleList = articleList.filter(article => 
        article.title.toLowerCase().includes(searchLower) ||
        article.excerpt.toLowerCase().includes(searchLower) ||
        article.content.toLowerCase().includes(searchLower) ||
        article.tags.some(tag => tag.toLowerCase().includes(searchLower))
      )
    }

    if (category && category !== 'all') {
      articleList = articleList.filter(article => article.category === category)
    }

    if (author) {
      articleList = articleList.filter(article => article.author === author)
    }

    if (tags && tags.length > 0) {
      const tagArray = Array.isArray(tags) ? tags : [tags]
      articleList = articleList.filter(article => 
        tagArray.some(tag => article.tags.includes(tag))
      )
    }

    if (status) {
      articleList = articleList.filter(article => article.status === status)
    }

    if (isPublic !== undefined) {
      articleList = articleList.filter(article => article.isPublic === isPublic)
    }

    if (isFeatured !== undefined) {
      articleList = articleList.filter(article => article.isFeatured === isFeatured)
    }

    if (difficulty) {
      articleList = articleList.filter(article => article.difficulty === difficulty)
    }

    if (budget) {
      articleList = articleList.filter(article => article.budget === budget)
    }

    if (season) {
      articleList = articleList.filter(article => 
        article.season.includes(season)
      )
    }

    // 排序
    articleList.sort((a, b) => {
      let aValue = a[sortBy]
      let bValue = b[sortBy]
      
      if (sortBy === 'title' || sortBy === 'author') {
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
    const total = articleList.length
    const startIndex = (page - 1) * limit
    const endIndex = startIndex + limit
    const paginatedArticles = articleList.slice(startIndex, endIndex)

    return {
      articles: paginatedArticles,
      total,
      page,
      limit,
      pages: Math.ceil(total / limit)
    }
  }

  // 获取热门文章
  static findTrending(options = {}) {
    const { limit = 10, period = 'week' } = options
    
    let articleList = Array.from(articles.values())
    
    // 只显示已发布的公开文章
    articleList = articleList.filter(article => 
      article.status === 'published' && article.isPublic
    )
    
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
    
    if (period !== 'all') {
      articleList = articleList.filter(article => 
        article.publishedAt && article.publishedAt >= startDate
      )
    }
    
    // 按热度排序（综合考虑浏览量、点赞、评论、分享）
    articleList.sort((a, b) => {
      const scoreA = a.viewCount * 1 + a.likeCount * 3 + a.commentCount * 5 + a.shareCount * 2
      const scoreB = b.viewCount * 1 + b.likeCount * 3 + b.commentCount * 5 + b.shareCount * 2
      return scoreB - scoreA
    })
    
    return articleList.slice(0, limit)
  }

  // 获取精选文章
  static findFeatured(limit = 10) {
    let articleList = Array.from(articles.values())
    
    // 只显示已发布的公开精选文章
    articleList = articleList.filter(article => 
      article.status === 'published' && article.isPublic && article.isFeatured
    )
    
    // 按发布时间倒序
    articleList.sort((a, b) => b.publishedAt - a.publishedAt)
    
    return articleList.slice(0, limit)
  }

  // 根据作者获取文章
  static findByAuthor(authorId, options = {}) {
    const { page = 1, limit = 20, status, isPublic } = options
    
    let articleList = Array.from(articles.values())
    articleList = articleList.filter(article => article.authorId === authorId)
    
    if (status) {
      articleList = articleList.filter(article => article.status === status)
    }
    
    if (isPublic !== undefined) {
      articleList = articleList.filter(article => article.isPublic === isPublic)
    }
    
    // 按发布时间倒序
    articleList.sort((a, b) => {
      const aDate = a.publishedAt || a.createdAt
      const bDate = b.publishedAt || b.createdAt
      return bDate - aDate
    })
    
    // 分页
    const total = articleList.length
    const startIndex = (page - 1) * limit
    const endIndex = startIndex + limit
    const paginatedArticles = articleList.slice(startIndex, endIndex)
    
    return {
      articles: paginatedArticles,
      total,
      page,
      limit,
      pages: Math.ceil(total / limit)
    }
  }

  // 更新文章
  static update(id, updateData) {
    try {
      const article = articles.get(id)
      if (!article) {
        throw new Error('文章不存在')
      }

      const {
        title,
        slug,
        excerpt,
        content,
        coverImage,
        category,
        tags,
        status,
        difficulty,
        season,
        budget,
        duration,
        isPublic,
        isFeatured,
        isPinned,
        seoTitle,
        seoDescription,
        seoKeywords
      } = updateData

      // 更新字段
      if (title !== undefined) article.title = title
      if (slug !== undefined) article.slug = slug
      if (excerpt !== undefined) article.excerpt = excerpt
      if (content !== undefined) {
        article.content = content
        // 重新计算阅读时间
        article.readingTime = Math.ceil(content.length / 1000)
      }
      if (coverImage !== undefined) article.coverImage = coverImage
      if (category !== undefined) article.category = category
      if (tags !== undefined) article.tags = Array.isArray(tags) ? tags : []
      if (difficulty !== undefined) article.difficulty = difficulty
      if (season !== undefined) article.season = Array.isArray(season) ? season : []
      if (budget !== undefined) article.budget = budget
      if (duration !== undefined) article.duration = duration
      if (isPublic !== undefined) article.isPublic = isPublic
      if (isFeatured !== undefined) article.isFeatured = isFeatured
      if (isPinned !== undefined) article.isPinned = isPinned
      if (seoTitle !== undefined) article.seoTitle = seoTitle
      if (seoDescription !== undefined) article.seoDescription = seoDescription
      if (seoKeywords !== undefined) article.seoKeywords = Array.isArray(seoKeywords) ? seoKeywords : []

      // 处理状态变更
      if (status !== undefined) {
        const oldStatus = article.status
        article.status = status
        
        // 如果从非发布状态变为发布状态，设置发布时间
        if (oldStatus !== 'published' && status === 'published') {
          article.publishedAt = new Date()
        }
      }

      article.updatedAt = new Date()
      articles.set(id, article)

      return article
    } catch (error) {
      logger.error('更新文章失败', { error: error.message, articleId: id })
      throw error
    }
  }

  // 发布文章
  static publish(id) {
    const article = articles.get(id)
    if (article) {
      article.status = 'published'
      article.publishedAt = new Date()
      article.updatedAt = new Date()
      articles.set(id, article)
      return article
    }
    return null
  }

  // 取消发布
  static unpublish(id) {
    const article = articles.get(id)
    if (article) {
      article.status = 'draft'
      article.publishedAt = null
      article.updatedAt = new Date()
      articles.set(id, article)
      return article
    }
    return null
  }

  // 增加浏览量
  static incrementViewCount(id) {
    const article = articles.get(id)
    if (article) {
      article.viewCount++
      articles.set(id, article)
    }
  }

  // 更新点赞数
  static updateLikeCount(id, increment = true) {
    const article = articles.get(id)
    if (article) {
      if (increment) {
        article.likeCount++
      } else {
        article.likeCount = Math.max(0, article.likeCount - 1)
      }
      articles.set(id, article)
      return article.likeCount
    }
    return 0
  }

  // 更新评论数
  static updateCommentCount(id, increment = true) {
    const article = articles.get(id)
    if (article) {
      if (increment) {
        article.commentCount++
      } else {
        article.commentCount = Math.max(0, article.commentCount - 1)
      }
      articles.set(id, article)
    }
  }

  // 增加分享数
  static incrementShareCount(id) {
    const article = articles.get(id)
    if (article) {
      article.shareCount++
      articles.set(id, article)
    }
  }

  // 更新收藏数
  static updateBookmarkCount(id, increment = true) {
    const article = articles.get(id)
    if (article) {
      if (increment) {
        article.bookmarkCount++
      } else {
        article.bookmarkCount = Math.max(0, article.bookmarkCount - 1)
      }
      articles.set(id, article)
    }
  }

  // 删除文章
  static delete(id) {
    return articles.delete(id)
  }

  // 获取所有分类
  static getCategories() {
    const categories = new Set()
    for (const article of articles.values()) {
      categories.add(article.category)
    }
    return Array.from(categories)
  }

  // 获取热门标签
  static getPopularTags(limit = 20) {
    const tagCount = new Map()
    
    for (const article of articles.values()) {
      if (article.status === 'published' && article.isPublic) {
        article.tags.forEach(tag => {
          tagCount.set(tag, (tagCount.get(tag) || 0) + 1)
        })
      }
    }
    
    return Array.from(tagCount.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
      .map(([tag, count]) => ({ tag, count }))
  }

  // 获取相关文章
  static getRelatedArticles(id, limit = 5) {
    const article = articles.get(id)
    if (!article) return []
    
    let relatedArticles = Array.from(articles.values())
    
    // 排除当前文章，只显示已发布的公开文章
    relatedArticles = relatedArticles.filter(a => 
      a.id !== id && a.status === 'published' && a.isPublic
    )
    
    // 计算相关度分数
    relatedArticles = relatedArticles.map(a => {
      let score = 0
      
      // 相同分类加分
      if (a.category === article.category) score += 3
      
      // 相同标签加分
      const commonTags = a.tags.filter(tag => article.tags.includes(tag))
      score += commonTags.length * 2
      
      // 相同作者加分
      if (a.authorId === article.authorId) score += 1
      
      // 相同难度加分
      if (a.difficulty === article.difficulty) score += 1
      
      return { ...a, score }
    })
    
    // 按相关度排序
    relatedArticles.sort((a, b) => b.score - a.score)
    
    return relatedArticles.slice(0, limit)
  }

  // 获取文章统计信息
  static getStats() {
    const articleList = Array.from(articles.values())
    
    return {
      total: articleList.length,
      published: articleList.filter(article => article.status === 'published').length,
      draft: articleList.filter(article => article.status === 'draft').length,
      featured: articleList.filter(article => article.isFeatured).length,
      totalViews: articleList.reduce((sum, article) => sum + article.viewCount, 0),
      totalLikes: articleList.reduce((sum, article) => sum + article.likeCount, 0),
      totalComments: articleList.reduce((sum, article) => sum + article.commentCount, 0),
      totalShares: articleList.reduce((sum, article) => sum + article.shareCount, 0),
      totalBookmarks: articleList.reduce((sum, article) => sum + article.bookmarkCount, 0)
    }
  }
}

export default Article