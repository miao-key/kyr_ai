// 用户信息管理工具

// 默认用户信息
export const defaultUserInfo = {
  nickname: '旅行探索家小王',
  signature: '世界那么大，我想去看看 ✈️',
  avatar: 'https://fastly.jsdelivr.net/npm/@vant/assets/cat.jpeg',
  level: '黄金旅行家',
  levelProgress: 75,
  nextLevel: '钻石旅行家',
  travelDays: 365,
  joinDate: '2023.06',
  location: '上海',
  followers: 1024,
  following: 256
}

// 从localStorage获取用户信息
export const getUserInfo = () => {
  try {
    const savedUserInfo = localStorage.getItem('userInfo')
    return savedUserInfo ? JSON.parse(savedUserInfo) : defaultUserInfo
  } catch (error) {
    console.warn('解析localStorage中的用户信息失败:', error)
    return defaultUserInfo
  }
}

// 更新用户信息并同步到localStorage
export const updateUserInfo = (updatedInfo) => {
  try {
    localStorage.setItem('userInfo', JSON.stringify(updatedInfo))
    // 触发自定义事件通知其他组件
    window.dispatchEvent(new CustomEvent('userInfoUpdated', { detail: updatedInfo }))
    return true
  } catch (error) {
    console.error('保存用户信息失败:', error)
    return false
  }
}

// 初始化用户信息到localStorage
export const initUserInfo = () => {
  const existingUserInfo = getUserInfo()
  if (!localStorage.getItem('userInfo')) {
    updateUserInfo(existingUserInfo)
  }
  return existingUserInfo
}