import Axios from 'axios';
import configUrl from './configUrl';

const api = Axios.create({
    baseURL: `http://${configUrl.ip}:${configUrl.port}/`,
    timeout: 25000,
});

api.interceptors.request.use((config)=>{
    const token = sessionStorage.getItem("token");
    if(token){
        config.headers['Authorization'] = `${token}`;
        config.headers['Content-Type'] = 'application/x-www-form-urlencoded';
        config.headers['Cache-Control'] = 'no-cache';
    }
    return config;
})

export default api;