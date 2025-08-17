/**
 * Pexels API 服务模块
 * 提供图片搜索和获取功能
 */

// Pexels API 基础配置
const PEXELS_API_BASE = 'https://api.pexels.com/v1'
const API_KEY = import.meta.env.VITE_PEXELS_API

// 请求头配置
const headers = {
  'Authorization': API_KEY,
  'Content-Type': 'application/json'
}

/**
 * 通用的 Pexels API 请求函数
 * @param {string} endpoint - API端点
 * @param {Object} params - 查询参数
 * @returns {Promise<Object>} API响应数据
 */
async function pexelsRequest(endpoint, params = {}) {
  if (!API_KEY) {
    console.warn('Pexels API密钥未配置，使用默认图片')
    return null
  }

  try {
    const url = new URL(`${PEXELS_API_BASE}${endpoint}`)
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        url.searchParams.append(key, value)
      }
    })

    const response = await fetch(url, { headers })
    
    if (!response.ok) {
      throw new Error(`Pexels API错误: ${response.status} ${response.statusText}`)
    }

    return await response.json()
  } catch (error) {
    console.error('Pexels API请求失败:', error)
    return null
  }
}

/**
 * 搜索图片
 * @param {string} query - 搜索关键词
 * @param {Object} options - 搜索选项
 * @param {number} options.page - 页码，默认1
 * @param {number} options.per_page - 每页数量，默认15
 * @param {string} options.orientation - 图片方向: 'landscape', 'portrait', 'square'
 * @param {string} options.size - 图片尺寸: 'large', 'medium', 'small'
 * @param {string} options.color - 颜色筛选
 * @param {string} options.locale - 语言设置，默认'zh-CN'
 * @returns {Promise<Object>} 搜索结果
 */
export async function searchPhotos(query, options = {}) {
  const {
    page = 1,
    per_page = 15,
    orientation,
    size,
    color,
    locale = 'zh-CN'
  } = options

  const params = {
    query,
    page,
    per_page,
    orientation,
    size,
    color,
    locale
  }

  return await pexelsRequest('/search', params)
}

/**
 * 获取精选图片
 * @param {Object} options - 获取选项
 * @param {number} options.page - 页码，默认1
 * @param {number} options.per_page - 每页数量，默认15
 * @returns {Promise<Object>} 精选图片数据
 */
export async function getCuratedPhotos(options = {}) {
  const {
    page = 1,
    per_page = 15
  } = options

  const params = {
    page,
    per_page
  }

  return await pexelsRequest('/curated', params)
}

/**
 * 根据ID获取单张图片
 * @param {number} id - 图片ID
 * @returns {Promise<Object>} 图片数据
 */
export async function getPhotoById(id) {
  return await pexelsRequest(`/photos/${id}`)
}

/**
 * 获取旅游相关的图片集合
 * @param {string} category - 分类：'landscape', 'mountain', 'beach', 'city', 'nature'
 * @param {Object} options - 选项
 * @returns {Promise<Array>} 图片数组
 */
export async function getTravelPhotos(category = 'travel', options = {}) {
  const categoryQueries = {
    landscape: '风景 山水 自然风光',
    mountain: '山峰 高山 雪山',
    beach: '海滩 海岸 沙滩',
    city: '城市 建筑 都市',
    nature: '自然 森林 湖泊',
    travel: '旅游 风景 目的地',
    culture: '文化 古建筑 传统',
    adventure: '探险 户外 极限运动'
  }

  const query = categoryQueries[category] || categoryQueries.travel
  const result = await searchPhotos(query, {
    orientation: 'landscape',
    per_page: 20,
    ...options
  })

  return result ? result.photos : []
}

/**
 * 获取轮播图片
 * @param {number} count - 图片数量，默认4
 * @returns {Promise<Array>} 轮播图片数组
 */
export async function getCarouselPhotos(count = 4) {
  // 定义特定景点的搜索关键词，确保图片匹配内容
  const specificQueries = [
    'Jiuzhaigou colorful lakes mountain scenery', // 九寨沟 - 彩色湖泊山景
    'Guilin Li River karst mountains water',      // 桂林 - 漓江山水
    'West Lake Hangzhou China water scenic',      // 西湖 - 水景
    'Zhangjiajie mountains peaks Avatar landscape' // 张家界 - 山峰景观
  ]
  
  const allPhotos = []
  
  // 为每个景点获取对应的图片
  for (let i = 0; i < Math.min(count, specificQueries.length); i++) {
    const result = await searchPhotos(specificQueries[i], {
      orientation: 'landscape',
      per_page: 1
    })
    
    if (result && result.photos && result.photos.length > 0) {
      allPhotos.push(result.photos[0])
    }
  }
  
  // 如果获取的图片不足，用通用风景图片补充
  if (allPhotos.length < count) {
    const generalPhotos = await getTravelPhotos('landscape', { 
      per_page: count - allPhotos.length 
    })
    if (generalPhotos && generalPhotos.length > 0) {
      allPhotos.push(...generalPhotos.slice(0, count - allPhotos.length))
    }
  }
  
  if (allPhotos.length === 0) {
    // 返回备用图片
    return getDefaultCarouselPhotos()
  }

  return allPhotos.slice(0, count).map((photo, index) => ({
    id: photo.id,
    url: photo.src.large2x,
    title: getPhotoTitle(photo, index),
    description: getPhotoDescription(photo, index),
    photographer: photo.photographer,
    photographerUrl: photo.photographer_url,
    pexelsUrl: photo.url
  }))
}

/**
 * 获取瀑布流攻略图片 - 优化版本：并行请求+缓存
 * @param {number} count - 图片数量，默认20
 * @param {number} page - 页码，默认1
 * @returns {Promise<Array>} 攻略图片数组
 */
// 优化后的 getGuidePhotos 函数
export async function getGuidePhotos(count = 20, page = 1) {
  // 缓存键
  const cacheKey = `guide_photos_${count}_${page}`
  const cached = getCachedData(cacheKey)
  if (cached) {
    console.log(`📦 使用缓存数据: ${cacheKey}`)
    return cached
  }

  // 优化：减少并行请求，使用单个请求获取更多数据
  const categories = ['travel', 'landscape'] // 减少分类数量
  const photosPerCategory = Math.ceil(count / categories.length)
  
  try {
    // 串行请求而非并行，减少API压力
    const allPhotos = []
    
    for (const category of categories) {
      try {
        const photos = await getTravelPhotos(category, { 
          per_page: photosPerCategory,
          page: page
        })
        if (photos && photos.length > 0) {
          allPhotos.push(...photos)
        }
        // 添加请求间隔，避免API限流
        await new Promise(resolve => setTimeout(resolve, 100))
      } catch (error) {
        console.warn(`分类 ${category} 请求失败:`, error)
        continue
      }
    }

    if (allPhotos.length === 0) {
      return getDefaultGuidePhotos(count, page)
    }

    // 为每页生成不同的随机种子，确保分页数据不重复
    const seed = page * 1000
    const shuffled = allPhotos.sort(() => Math.sin(seed + Math.random()) * 2 - 1)
    
    const result = shuffled.slice(0, count).map((photo, index) => ({
      id: `pexels_${photo.id}_p${page}_${index}_${Date.now()}`,
      pexelsId: photo.id,
      image: photo.src.medium,
      title: getGuideTitle(photo, index + (page - 1) * count),
      description: getGuideDescription(photo, index + (page - 1) * count),
      tag: getGuideTag(index + (page - 1) * count),
      price: getRandomPrice(),
      location: getGuideLocation(index + (page - 1) * count),
      pexelsUrl: photo.url
    }))

    // 缓存结果，延长缓存时间
    setCachedData(cacheKey, result, 10 * 60 * 1000) // 10分钟缓存
    
    return result
  } catch (error) {
    console.error('获取攻略图片失败:', error)
    return getDefaultGuidePhotos(count, page)
  }
}

// 工具函数：生成图片标题
function getPhotoTitle(photo, index) {
  const titles = [
    '九寨沟风光', '桂林山水', '西湖美景', '张家界天门山',
    '黄山云海', '泰山日出', '华山险峰', '峨眉山金顶',
    '长城雄伟', '天山雪莲', '青海湖畔', '敦煌莫高窟',
    '三亚椰林', '呼伦贝尔草原', '稻城亚丁', '西藏布达拉宫',
    '丽江古城', '大理洱海', '苏州园林', '凤凰古城',
    '千岛湖秀色', '庐山瀑布', '五台山佛光', '普陀山海韵'
  ]
  return titles[index % titles.length] || '美丽风景'
}

// 工具函数：生成图片描述
function getPhotoDescription(photo, index) {
  const descriptions = [
    '人间仙境，水色斑斓',
    '山水甲天下，如诗如画',
    '淡妆浓抹总相宜',
    '天门洞开，云雾缭绕'
  ]
  return descriptions[index % descriptions.length] || '风景如画'
}

// 工具函数：生成攻略标题
function getGuideTitle(photo, index) {
  const titles = [
    '趁自由·向草原', '喀纳斯伊犁环线游', '江南水乡古镇游',
    '张家界天门山', '黄山云海日出', '西藏拉萨朝圣之旅',
    '丽江古城漫步', '桂林阳朔山水', '九寨沟童话世界',
    '海南三亚椰风海韵', '新疆天山天池秘境', '青海湖环湖骑行',
    '敦煌丝路文化之旅', '呼伦贝尔大草原穿越', '稻城亚丁蓝色星球',
    '大理洱海环湖游', '苏州园林文化探秘', '凤凰古城夜色迷人',
    '千岛湖山水画卷', '庐山避暑度假', '五台山佛教圣地',
    '普陀山海天佛国', '泰山日出东方红', '华山论剑险峰行',
    '峨眉山金顶云海', '长城万里雄关路'
  ]
  return titles[index % titles.length] || '精彩旅程'
}

// 工具函数：生成攻略描述
function getGuideDescription(photo, index) {
  const descriptions = [
    '无人机航拍Vlog+和谐号穿越草原+网红清单',
    '喀纳斯+伊犁环线高直是北疆旅行的主流组合',
    '探访江南古镇，体验水乡风情，品味传统文化',
    '天门洞开云雾绕，玻璃栈道惊险刺激',
    '奇松怪石云海日出，登顶黄山看尽天下美景',
    '布达拉宫、大昭寺、纳木错，感受藏族文化',
    '椰风海韵天涯海角，热带风情尽收眼底',
    '天山雪莲盛开，高山湖泊如镜如梦',
    '青海湖骑行环湖，高原明珠美不胜收',
    '敦煌莫高窟壁画，丝路文化千年传承',
    '呼伦贝尔大草原，天苍苍野茫茫的壮美',
    '稻城亚丁三神山，蓝色星球最后净土',
    '洱海苍山相依，风花雪月浪漫之都',
    '苏州园林小桥流水，江南韵味诗情画意',
    '凤凰古城沱江夜景，湘西风情醉人心扉',
    '千岛湖碧波荡漾，山水画卷如诗如画',
    '庐山云雾缭绕，避暑圣地清凉一夏',
    '五台山佛光普照，佛教圣地心灵净化',
    '普陀山观音道场，海天佛国禅意悠然',
    '泰山五岳独尊，东岳日出气势磅礴',
    '华山天下第一险，论剑峰顶豪情万丈',
    '峨眉山金顶云海，佛光闪现仙境如梦',
    '万里长城雄伟壮观，中华民族的骄傲'
  ]
  return descriptions[index % descriptions.length] || '精彩的旅行体验'
}

// 工具函数：生成标签
function getGuideTag(index) {
  const tags = [
    '解锁秘籍', '环线游', '文化游', '探险游', '登山游', '朝圣游',
    '海岛游', '草原游', '古镇游', '摄影游', '自驾游', '深度游',
    '亲子游', '情侣游', '毕业游', '蜜月游', '避暑游', '赏花游',
    '美食游', '民俗游', '徒步游', '骑行游', '滑雪游', '温泉游'
  ]
  return tags[index % tags.length]
}

// 工具函数：生成位置
function getGuideLocation(index) {
  const locations = [
    '呼伦贝尔', '新疆', '江浙沪', '湖南', '安徽', '西藏', '云南', '广西',
    '海南', '青海', '甘肃', '内蒙古', '四川', '山东', '陕西', '河南',
    '福建', '浙江', '江苏', '湖北', '贵州', '北京', '上海', '重庆',
    '天津', '河北', '山西', '辽宁', '吉林', '黑龙江', '广东', '宁夏'
  ]
  return locations[index % locations.length]
}

// 工具函数：生成随机价格
function getRandomPrice() {
  const prices = [
    '¥1399起', '¥1599起', '¥1699起', '¥1899起', '¥1999起', '¥2199起',
    '¥2299起', '¥2499起', '¥2699起', '¥2899起', '¥2999起', '¥3199起',
    '¥3399起', '¥3599起', '¥3799起', '¥3999起', '¥4199起', '¥4399起',
    '¥4599起', '¥4799起', '¥4999起'
  ]
  return prices[Math.floor(Math.random() * prices.length)]
}

// 备用图片数据
function getDefaultCarouselPhotos() {
  return [
    {
      id: 1,
      url: 'https://images.unsplash.com/photo-1528127269322-539801943592?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80', // 九寨沟彩色湖泊
      title: '九寨沟风光',
      description: '人间仙境，水色斑斓'
    },
    {
      id: 2,
      url: 'https://images.unsplash.com/photo-1569949381669-ecf31ae8e613?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80', // 桂林漓江山水
      title: '桂林山水',
      description: '山水甲天下，如诗如画'
    },
    {
      id: 3,
      url: 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80', // 西湖水景
      title: '西湖美景',
      description: '淡妆浓抹总相宜'
    },
    {
      id: 4,
      url: 'https://images.unsplash.com/photo-1580674684081-7617fbf3d745?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80', // 张家界山峰
      title: '张家界天门山',
      description: '天门洞开，云雾缭绕'
    }
  ]
}

function getDefaultGuidePhotos(count = 20, page = 1) {
  const defaultData = [
    {
      image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
      title: '趁自由·向草原',
      description: '无人机航拍Vlog+和谐号穿越草原+网红清单+勤动车游草原+中俄边防公路+灯光秀+骑马+巴尔虎民俗乐园',
      tag: '解锁秘籍',
      price: '¥2999起',
      location: '呼伦贝尔'
    },
    {
      image: 'https://images.unsplash.com/photo-1547036967-23d11aacaee0?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
      title: '喀纳斯伊犁环线游',
      description: '喀纳斯+伊犁环线高直是北疆旅行的主流组合！一次就能把雪山、湖泊、草原、花海的美景全收入囊中~~',
      tag: '环线游',
      price: '¥3599起',
      location: '新疆'
    },
    {
      image: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
      title: '江南水乡古镇游',
      description: '探访江南古镇，体验水乡风情，品味传统文化，感受诗画江南的独特魅力',
      tag: '文化游',
      price: '¥1899起',
      location: '江浙沪'
    },
    {
      image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
      title: '张家界天门山',
      description: '天门洞开云雾绕，玻璃栈道惊险刺激，感受大自然的鬼斧神工',
      tag: '探险游',
      price: '¥2299起',
      location: '湖南'
    },
    {
      image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
      title: '黄山云海日出',
      description: '奇松怪石云海日出，登顶黄山看尽天下美景，感受大自然的壮丽',
      tag: '登山游',
      price: '¥1699起',
      location: '安徽'
    },
    {
      image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
      title: '西藏拉萨朝圣之旅',
      description: '布达拉宫、大昭寺、纳木错，感受藏族文化的神秘与庄严',
      tag: '朝圣游',
      price: '¥4999起',
      location: '西藏'
    },
    // 添加更多默认数据以支持分页
    {
      image: 'https://images.unsplash.com/photo-1486022653451-9b53b33fe82a?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
      title: '丽江古城漫步',
      description: '走进丽江古城，感受纳西文化的独特魅力，体验慢节奏的惬意生活',
      tag: '古城游',
      price: '¥2199起',
      location: '云南'
    },
    {
      image: 'https://images.unsplash.com/photo-1523731407741-2a2e0293f7b8?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
      title: '桂林阳朔山水',
      description: '漓江竹筏漂流，十里画廊骑行，感受桂林山水甲天下的美景',
      tag: '山水游',
      price: '¥1799起',
      location: '广西'
    },
    {
      image: 'https://images.unsplash.com/photo-1593149439591-bdc8afdf2403?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
      title: '九寨沟童话世界',
      description: '五彩斑斓的海子，梦幻如画的风景，走进九寨沟的童话世界',
      tag: '自然游',
      price: '¥3299起',
      location: '四川'
    }
  ]

  // 为分页生成不同的数据
  const startIndex = (page - 1) * count
  const paginatedData = []
  
  for (let i = 0; i < count; i++) {
    const dataIndex = (startIndex + i) % defaultData.length
    const item = defaultData[dataIndex]
    paginatedData.push({
      ...item,
      id: `default_p${page}_${i}_${Date.now()}`,
      title: `${item.title} ${page > 1 ? `(第${page}页)` : ''}`,
      heightType: (startIndex + i) % 3 === 0 ? 'tall' : (startIndex + i) % 2 === 0 ? 'medium' : 'short'
    })
  }

  return paginatedData
}

// 简单的内存缓存系统
// 优化缓存管理
const cache = new Map()
const CACHE_DURATION = 10 * 60 * 1000 // 10分钟
const MAX_CACHE_SIZE = 50 // 最大缓存条目数

function getCachedData(key) {
  const cached = cache.get(key)
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data
  }
  cache.delete(key)
  return null
}

function setCachedData(key, data, duration = CACHE_DURATION) {
  // 清理过期缓存
  if (cache.size >= MAX_CACHE_SIZE) {
    const oldestKey = cache.keys().next().value
    cache.delete(oldestKey)
  }
  
  cache.set(key, {
    data,
    timestamp: Date.now()
  })
}