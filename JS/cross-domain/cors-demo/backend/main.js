const http = require('http');

const server = http.createServer((req,res) => {
    // 设置 CORS 头 (Origin 只需要协议+域名+端口)
    res.setHeader('Access-Control-Allow-Origin', 'http://127.0.0.1:5500');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    // 处理预检请求 (OPTIONS)
    if (req.method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
    }

    // 处理 /api/test 的请求 (支持 GET 和 PATCH)
    if (req.url === '/api/test' && (req.method === 'PATCH' || req.method === 'GET')) {
        res.writeHead(200, {
            'Content-Type': 'application/json'
        });
        res.end(JSON.stringify({
            msg: '跨域成功！！！'
        }));
    } else {
        // 处理其他请求
        res.writeHead(404, {
            'Content-Type': 'text/plain'
        });
        res.end('404 Not Found');
    }
})

server.listen(8000,() => {
    console.log('CORS server running at http://localhost:8000')
})