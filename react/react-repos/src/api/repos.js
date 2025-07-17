import axios from 'axios'; // http请求库
const BASE_URL = 'https://api.github.com/'; // 基础路径
// 标准http请求库
// axios method url
// promise 现代
// api 模块 应用之外  搞外交
export const getRepos =  (username) => {
    return axios.get(`${BASE_URL}users/${username}/repos`);
}

export const getRepoDetail = async (username, repoName) => {
    return await axios.get(`${BASE_URL}repos/${username}/${repoName}`);
}
     