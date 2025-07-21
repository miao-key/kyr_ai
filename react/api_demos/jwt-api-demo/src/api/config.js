// 标准的http请求库，vue/react 都用它
import axios from 'axios';
// axios.defaults.baseURL = 'http://localhost:5173';
// mock 地址
// 线上地址有了
axios.defaults.baseURL = 'http://api.github.com/users/miao-key';
export default axios;