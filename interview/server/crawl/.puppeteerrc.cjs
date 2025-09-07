const {join} = require('path');

/**
 * @type {import("puppeteer").Configuration}
 */
module.exports = {
  // 使用系统安装的 Chrome
  executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  
  // 或者设置下载路径
  cacheDirectory: join(__dirname, '.cache', 'puppeteer'),
};
