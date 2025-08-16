// 头像显示问题调试脚本
// 在浏览器控制台中运行此脚本来检查用户状态

console.log('🔍 开始调试头像显示问题...');

// 1. 检查localStorage中的用户数据
console.log('\n📦 localStorage 数据:');
const storedUser = localStorage.getItem('zhilvUser');
const storedToken = localStorage.getItem('zhilvToken');
const authStorage = localStorage.getItem('auth-storage');

console.log('  - zhilvUser:', storedUser);
console.log('  - zhilvToken:', storedToken);
console.log('  - auth-storage:', authStorage);

if (storedUser) {
  try {
    const userData = JSON.parse(storedUser);
    console.log('  - 解析后的用户数据:', userData);
    console.log('  - 用户头像URL:', userData.avatar);
  } catch (e) {
    console.error('  - 解析用户数据失败:', e);
  }
}

if (authStorage) {
  try {
    const authData = JSON.parse(authStorage);
    console.log('  - 解析后的认证数据:', authData);
  } catch (e) {
    console.error('  - 解析认证数据失败:', e);
  }
}

// 2. 检查JWT token
console.log('\n🎫 JWT Token 检查:');
const jwtToken = localStorage.getItem('jwt_token');
console.log('  - JWT Token:', jwtToken ? `存在 (长度: ${jwtToken.length})` : '不存在');

// 3. 检查当前页面的用户状态
console.log('\n🌐 当前页面状态:');
console.log('  - 当前URL:', window.location.href);
console.log('  - 页面标题:', document.title);

// 4. 检查React组件状态（如果可访问）
console.log('\n⚛️ React 状态检查:');
try {
  // 尝试访问React DevTools或全局状态
  if (window.__REACT_DEVTOOLS_GLOBAL_HOOK__) {
    console.log('  - React DevTools 已安装');
  }
  
  // 检查是否有全局的zustand store
  if (window.zustandStore) {
    console.log('  - Zustand Store:', window.zustandStore);
  }
} catch (e) {
  console.log('  - 无法访问React状态');
}

// 5. 测试头像URL的可访问性
console.log('\n🖼️ 头像URL测试:');
if (storedUser) {
  try {
    const userData = JSON.parse(storedUser);
    if (userData.avatar) {
      console.log('  - 正在测试头像URL:', userData.avatar);
      
      const img = new Image();
      img.onload = () => {
        console.log('  ✅ 头像URL可访问');
      };
      img.onerror = () => {
        console.log('  ❌ 头像URL无法访问');
      };
      img.src = userData.avatar;
    } else {
      console.log('  - 用户没有设置头像');
    }
  } catch (e) {
    console.error('  - 测试头像URL失败:', e);
  }
}

// 6. 检查网络连接
console.log('\n🌐 网络状态:');
console.log('  - 在线状态:', navigator.onLine ? '在线' : '离线');
console.log('  - 用户代理:', navigator.userAgent);

// 7. 生成测试头像URL
console.log('\n🎭 生成测试头像:');
const testAvatarUrl = 'https://api.dicebear.com/7.x/avataaars/svg?seed=test';
console.log('  - 测试头像URL:', testAvatarUrl);

const testImg = new Image();
testImg.onload = () => {
  console.log('  ✅ DiceBear API 可访问');
};
testImg.onerror = () => {
  console.log('  ❌ DiceBear API 无法访问');
};
testImg.src = testAvatarUrl;

console.log('\n🔍 调试完成！请查看上述信息来诊断问题。');

// 8. 提供修复建议
console.log('\n💡 可能的解决方案:');
console.log('  1. 检查用户是否已正确登录');
console.log('  2. 验证头像URL是否有效');
console.log('  3. 检查网络连接');
console.log('  4. 清除浏览器缓存并重新登录');
console.log('  5. 检查控制台是否有其他错误信息');