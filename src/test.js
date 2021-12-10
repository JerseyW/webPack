/**
 @author: Jersey
 @create: 2021-11-24 19:02
 @version: V1.0
 @slogan: 业精于勤,荒于嬉;行成于思,毁于随。
 @description:
 */
//"use strict"
    // eslint-disable-next-line
const btns = document.querySelectorAll('button');

let cancel = null;
btns[0].onclick = function () {
    //鼠标点击事件适合懒加载，不需要一初始化就加载
    //webpackPrefetch:true 开启预加载 使用前加载该文件，等浏览器空闲了加载，兼容性较差
    //import(/*webpackChunkName:'axios',webpackPrefetch:true */'./js/axios').then(({Axios})=>{
    import(/*webpackChunkName:'axios' */'./js/axios').then(({Axios})=>{
        console.log("懒加载");


        const axios = new Axios({ method: 'GET' });

        axios.interceptors.request.use((config) => {
            console.log('请求拦截器one成功');
            return config;
        }, (error) => {
            console.log('请求拦截器one 失败');
            return Promise.reject(error);
        });
        axios.interceptors.request.use((config) => {
            console.log('请求拦截器two成功');
            return config;
        }, (error) => {
            console.log('请求拦截器two失败');
            return Promise.reject(error);
        });
        axios.interceptors.response.use((config) => {
            console.log('响应拦截器one 成功');
            return config;
        }, (error) => {
            console.log('响应拦截器one 失败');
            return Promise.reject(error);
        });
        axios.interceptors.response.use((config) => {
            console.log('响应拦截器two 成功');
            return config;
        }, (error) => {
            console.log('响应拦截器two 失败');
            return Promise.reject(error);
        });

        if (cancel) cancel();
        axios.request({
            method: 'GET',
            url: 'http://localhost:3000/posts',
            cancelToken: axios.cancelToken((c) => {
                cancel = c;
            }),
        }).then((response) => {
            console.log(response);
            cancel = null;
        }, (e) => {
            console.log(e);
            cancel = null;
        });
        console.log(axios);
    })

};
btns[1].onclick = function () {
    if (cancel != null) {
        cancel();
    }
};

