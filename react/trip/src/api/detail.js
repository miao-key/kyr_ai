import axios from './config'

const getDetail = async (id) => {
    return axios.get(`/detail/${id}`);
}

export { getDetail }