import axios from './config';

export const getRepo = async (name) =>
     await axios.get(`/users/${name}/repos`)

export const getRepoInfo = async (name, repo) =>
     await axios.get(`/repos/${name}/${repo}`) 
    
export const getRepoList = getRepo;  