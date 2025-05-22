import { Product } from '@/types/product';

export const products: Product[] = [
  {
    id: "prod_001",
    name: "简约风白色T恤",
    price: 199,
    originalPrice: 299,
    description: "100%有机棉制作，舒适透气，适合日常穿着。经典款式搭配任何场合，四季百搭。",
    images: ["/images/tshirt-1.jpg", "/images/tshirt-2.jpg"],
    thumbnailUrl: "/images/tshirt-thumb.jpg",
    category: "clothing",
    tags: ["summer", "casual", "cotton"],
    inventory: {
      inStock: true,
      quantity: 120
    },
    rating: {
      average: 4.7,
      count: 243
    },
    specifications: {
      "材质": "100%有机棉",
      "颜色": "纯白色",
      "尺码": "S, M, L, XL",
      "产地": "中国"
    },
    createdAt: "2023-04-15T09:00:00Z",
    updatedAt: "2023-05-20T14:23:00Z"
  },
  {
    id: "prod_002",
    name: "复古牛仔外套",
    price: 499,
    originalPrice: 699,
    description: "经典复古风格，采用优质牛仔面料，耐磨耐用，做旧设计彰显个性。",
    images: ["/images/jacket-1.jpg", "/images/jacket-2.jpg"],
    thumbnailUrl: "/images/jacket-thumb.jpg",
    category: "clothing",
    tags: ["denim", "vintage", "outerwear"],
    inventory: {
      inStock: true,
      quantity: 45
    },
    rating: {
      average: 4.5,
      count: 89
    },
    specifications: {
      "材质": "95%棉, 5%氨纶",
      "颜色": "深蓝色做旧",
      "尺码": "M, L, XL",
      "洗涤说明": "30°C机洗"
    },
    createdAt: "2023-06-22T08:30:00Z",
    updatedAt: "2023-07-12T11:15:00Z"
  },
  {
    id: "prod_003",
    name: "智能手表Pro",
    price: 1299,
    originalPrice: 1499,
    description: "全面屏设计，健康监测，睡眠分析，运动模式，支持无线充电，续航长达7天。",
    images: ["/images/watch-1.jpg", "/images/watch-2.jpg"],
    thumbnailUrl: "/images/watch-thumb.jpg",
    category: "electronics",
    tags: ["smartwatch", "fitness", "gadget"],
    inventory: {
      inStock: true,
      quantity: 38
    },
    rating: {
      average: 4.8,
      count: 156
    },
    specifications: {
      "屏幕": "1.4英寸 AMOLED",
      "防水等级": "IP68",
      "电池容量": "410mAh",
      "适配系统": "iOS 11.0+, Android 6.0+"
    },
    createdAt: "2023-03-10T15:45:00Z",
    updatedAt: "2023-05-01T09:30:00Z"
  },
  {
    id: "prod_004",
    name: "无线降噪耳机",
    price: 899,
    originalPrice: 1099,
    description: "主动降噪技术，环境声模式，触控操作，IPX4防水，30小时续航。",
    images: ["/images/headphones-1.jpg", "/images/headphones-2.jpg"],
    thumbnailUrl: "/images/headphones-thumb.jpg",
    category: "electronics",
    tags: ["audio", "wireless", "noise-cancelling"],
    inventory: {
      inStock: true,
      quantity: 72
    },
    rating: {
      average: 4.6,
      count: 203
    },
    specifications: {
      "蓝牙版本": "5.2",
      "续航时间": "30小时",
      "重量": "250g",
      "颜色": "黑色/白色"
    },
    createdAt: "2023-02-18T12:30:00Z",
    updatedAt: "2023-04-25T16:20:00Z"
  },
  {
    id: "prod_005",
    name: "北欧风格实木餐桌",
    price: 2499,
    originalPrice: 2999,
    description: "优质白橡木材质，简约北欧设计，环保漆面，耐用易清洁。",
    images: ["/images/table-1.jpg", "/images/table-2.jpg"],
    thumbnailUrl: "/images/table-thumb.jpg",
    category: "furniture",
    tags: ["dining", "wooden", "scandinavian"],
    inventory: {
      inStock: true,
      quantity: 15
    },
    rating: {
      average: 4.9,
      count: 47
    },
    specifications: {
      "材质": "白橡木",
      "尺寸": "140x80x75cm",
      "承重": "150kg",
      "包装": "需自行组装，含说明书及工具"
    },
    createdAt: "2023-01-05T10:00:00Z",
    updatedAt: "2023-03-12T14:45:00Z"
  },
  {
    id: "prod_006",
    name: "手工编织地毯",
    price: 899,
    originalPrice: 1299,
    description: "纯羊毛手工编织，柔软舒适，经典几何图案，适合客厅卧室。",
    images: ["/images/carpet-1.jpg", "/images/carpet-2.jpg"],
    thumbnailUrl: "/images/carpet-thumb.jpg",
    category: "furniture",
    tags: ["home-decor", "handmade", "wool"],
    inventory: {
      inStock: true,
      quantity: 23
    },
    rating: {
      average: 4.7,
      count: 68
    },
    specifications: {
      "材质": "100%纯羊毛",
      "尺寸": "200x150cm",
      "厚度": "2cm",
      "产地": "印度"
    },
    createdAt: "2023-05-20T09:15:00Z",
    updatedAt: "2023-06-30T11:50:00Z"
  },
  {
    id: "prod_007",
    name: "人体工学办公椅",
    price: 1599,
    originalPrice: 1899,
    description: "符合人体工学设计，透气网布，多角度调节，腰部支撑，缓解久坐疲劳。",
    images: ["/images/chair-1.jpg", "/images/chair-2.jpg"],
    thumbnailUrl: "/images/chair-thumb.jpg",
    category: "furniture",
    tags: ["office", "ergonomic", "comfort"],
    inventory: {
      inStock: true,
      quantity: 19
    },
    rating: {
      average: 4.8,
      count: 115
    },
    specifications: {
      "承重": "150kg",
      "材质": "金属框架，网布坐垫",
      "调节": "高度，扶手，靠背角度",
      "轮子": "静音万向轮"
    },
    createdAt: "2023-04-10T13:20:00Z",
    updatedAt: "2023-05-18T09:10:00Z"
  },
  {
    id: "prod_008",
    name: "便携式蓝牙音箱",
    price: 399,
    originalPrice: 499,
    description: "360°环绕立体声，IPX7防水，16小时续航，支持TWS串联，USB-C快充。",
    images: ["/images/speaker-1.jpg", "/images/speaker-2.jpg"],
    thumbnailUrl: "/images/speaker-thumb.jpg",
    category: "electronics",
    tags: ["audio", "portable", "bluetooth"],
    inventory: {
      inStock: true,
      quantity: 86
    },
    rating: {
      average: 4.4,
      count: 192
    },
    specifications: {
      "蓝牙版本": "5.0",
      "防水等级": "IPX7",
      "电池容量": "3600mAh",
      "尺寸": "直径8cm x 高10cm"
    },
    createdAt: "2023-03-25T15:30:00Z",
    updatedAt: "2023-04-28T10:45:00Z"
  },
  {
    id: "prod_009",
    name: "高清摄影背包",
    price: 699,
    originalPrice: 899,
    description: "多功能摄影包，防水耐磨，减震保护，可容纳单反相机及多个镜头，笔记本电脑隔层。",
    images: ["/images/backpack-1.jpg", "/images/backpack-2.jpg"],
    thumbnailUrl: "/images/backpack-thumb.jpg",
    category: "accessories",
    tags: ["camera", "travel", "storage"],
    inventory: {
      inStock: true,
      quantity: 41
    },
    rating: {
      average: 4.7,
      count: 73
    },
    specifications: {
      "材质": "防水尼龙",
      "容量": "25L",
      "尺寸": "45x30x18cm",
      "重量": "1.2kg"
    },
    createdAt: "2023-05-08T11:40:00Z",
    updatedAt: "2023-06-15T13:25:00Z"
  },
  {
    id: "prod_010",
    name: "纯棉格纹衬衫",
    price: 299,
    originalPrice: 399,
    description: "经典格纹设计，优质纯棉面料，修身剪裁，舒适透气，适合日常通勤。",
    images: ["/images/shirt-1.jpg", "/images/shirt-2.jpg"],
    thumbnailUrl: "/images/shirt-thumb.jpg",
    category: "clothing",
    tags: ["casual", "cotton", "checkered"],
    inventory: {
      inStock: true,
      quantity: 64
    },
    rating: {
      average: 4.5,
      count: 107
    },
    specifications: {
      "材质": "100%纯棉",
      "颜色": "蓝白格纹",
      "尺码": "S, M, L, XL, XXL",
      "洗涤": "冷水手洗或机洗"
    },
    createdAt: "2023-04-30T14:15:00Z",
    updatedAt: "2023-06-05T12:20:00Z"
  }
]; 