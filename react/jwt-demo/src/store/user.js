import {
    create
} from 'zustand'
import {
    doLogin
} from '../api/user'

export const useUserStore = create((set) => ({
    user: null, // 用户信息
    isLogin: false, // 是否登录
    Login: async ({username="",password=""}) => {
        const res= await doLogin({username,password});
        console.log(res);
        const {token,data:user} = res.data;
        console.log(token,user,'\\\\\\');
        localStorage.setItem('token',token);
        set({
            user,
            isLogin: true
        })
    },
    Logout: () => {
        localStorage.removeItem('token');
        set({
            user: null,
            isLogin: false
        })
    }
}))