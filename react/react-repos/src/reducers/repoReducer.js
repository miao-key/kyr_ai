// {
//     repos:[],
//     loading:false,
//     error:null
// }
// 保证状态的正确性
export const repoReducer = (state,action) => {
    switch(action.type){
        case 'FETCH_START':
            return {
                ...state,
                loading: true,
                error: null
            }
        case 'FETCH_SUCCESS':
            return {
                ...state,
                repos: action.payload,
                loading: false,
                error: null
            }
        case 'FETCH_ERROR':
            return {
                ...state,
                repos: [],
                loading: false,
                error: action.payload
            }
        default:
            return state;
    }
}
export default repoReducer;