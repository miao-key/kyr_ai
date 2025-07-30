import Mock from 'mockjs';
// 每页10
const getImages = (page,pageSize=10) => {
  return Array.from({length: pageSize}, (_, i) => ({
    // 索引唯一
    id: `${page}-${i}`,
    height: Mock.Random.integer(300, 600),
    url: Mock.Random.image('300x400',Mock.Random.color(),'#fff','img'),
  }))
}

export default [
  {
    url: '/api/search',
    method: 'get',
    timeout: 1000,
    response: (req, res) => {
      // ?keyword=六百六十六
      const keyword = req.query.keyword;
      let num = Math.floor(Math.random() * 10);
      let list = [];
      for (let i = 0; i < num; i++) {
        // 随机内容
        const randomData = Mock.mock({
          title: '@ctitle'
        })
        console.log(randomData);
        list.push(`${randomData.title}${keyword}`);
      }
      return {
        code: 0, 
        data: list
      }
    }
  },
  {
    url: '/api/hotlist',
    method: 'get',
    timeout: 1000,
    response: (req, res) => {
      return {
        code: 0, 
        data: [{
          id: '101',
          city: "西安",
        }, {
          id: '102',
          city: "北京",
        }, {
          id: '103',
          city: "上海",
        }, {
          id: '104',
          city: "苏州",
        }]
      }
    }
  },
  {
    url: '/api/detail/:id',
    method: 'get',
    timeout: 1000,
    response: (req, res) => {
      // 使用真实图片URL替换Mock生成的图片
      const realImages = [
        {
          url: 'https://img.36krcdn.com/hsossms/20250729/v2_17dc4793268c46558e68355c5b25a55d@000000@ai_oswg369871oswg1536oswg722_img_000~tplv-1marlgjv7f-ai-v3:600:400:600:400:q70.jpg?x-oss-process=image/format,webp',
          alt: '风景图片1',
        },
        {
          url: 'https://img.36krcdn.com/hsossms/20210909/v2_46d0b0cc9e83449ca6b1a3044dbbc831@000000_img_000',
          alt: '风景图片2',
        },
        {
          url: 'https://img.36krcdn.com/hsossms/20220809/v2_a6216db4e5e44c3ca3979f82b8ec83a3@000000_img_000',
          alt: '风景图片3',
        },
        {
          url: 'https://img.36krcdn.com/hsossms/20230921/v2_8a1abc751d1b4c0c8c4326aa7428737b@000000_img_000',
          alt: '风景图片4',
        }
      ];
      
      const randomData = Mock.mock({
        title: '@ctitle(5,10)',
        price: '@integer(10000,1000000)',
        desc: '@cparagraph(15,40)',
      });
      
      // 将真实图片数据添加到随机生成的数据中
      randomData.images = realImages;
      
      return {
        code: 0,
        data: randomData
      }
    }
  },
  {
    url: '/api/images',
    method: 'get',
    response: ({query}) => {
      const page = Number(query.page) || 1;
      return {
          code: 0,
          data: getImages(page)
      }
    }
  }
]