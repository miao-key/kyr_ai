// es6 模块化
// mjs 后缀使用es6模块化
// 模块化是语言的能力
// node 默认不支持es6 模块化
// node 最新版本支持了 22
// node 准备跟require commonjs say goodbye
import http from 'http';

const server = http.createServer((req, res) => {
  res.end('hello http server');
});
server.listen(1314);
// http://localhost:1314