
export  class Axios {
    //eslint-disable-next-line
    defaults = {};
    //eslint-disable-next-line
    interceptors = {
       request:{
           use:  (fulfilled,rejected)=>{
               this.interceptors.request.handlers.push({
                   fulfilled,
                   rejected
               })
           },
           handlers:[]
       },
       response:{
           use: (fulfilled,rejected)=>{
               this.interceptors.response.handlers.push({
                   fulfilled,
                   rejected
               })
           },
           handlers:[]
       }
   };

    constructor(config) {

        if (config)

            this.defaults = {...this.defaults,...config};
              console.dir(new.target);

    }

    cancelToken(executor){
         return  new  Promise(function (resolve) {

            executor(function (){

                resolve();
            });
        });

    }

    request(config){

          this.defaults = {...this.defaults,...config};
          let promise  = Promise.resolve(this.defaults);
          let chains = [this.#dispatchRequest.bind(this),undefined];
          this.interceptors.request.handlers.forEach(item=>{
             chains.unshift(item.fulfilled,item.rejected);
         });
         this.interceptors.response.handlers.forEach(item=>{
            chains.push(item.fulfilled,item.rejected);
         });

         while (chains.length){
            promise = promise.then(chains.shift(), chains.shift());
         }

         return promise;
    }

    get(config){
       config.method = "GET" ;
       return  this.request(config)

    }

    post(config){
        config.method = "POST" ;
        return  this.request(config)
    }

    #dispatchRequest(){

        //调用适配器发送ajax请求
      return this.#xhrAdapter().then(response => {
          //对响应的结果可以进行转换处理
          return response;
      }, error => {
          throw  error;
      })

  }

   #xhrAdapter(){

         return new  Promise((resolve,reject)=>{
             let xhr = null;
             if (window.XMLHttpRequest){
                 xhr = new  XMLHttpRequest();
             }
             else if (window.ActiveXObject){
                 xhr = new ActiveXObject();
             }
             else throw  new Error("不支持ajax")
             xhr.open(this.defaults.method,this.defaults.url);
             let cancel = this.defaults.cancelToken
             xhr.send();
             xhr.onreadystatechange = function () {

                  if (xhr.readyState === 4 ){
                      if (xhr.status >= 200 && xhr.status < 300){
                          resolve(xhr.response);

                      } else
                          if ( cancel === null){
                          reject(new Error("请求失败:" + xhr.status));
                      }
                  }
             };

             if (this.defaults.cancelToken){

                 this.defaults.cancelToken.then(( )=>{

                     xhr.abort();
                     reject( new Error("取消了请求！"));
                 })
             }
         });

    }
}
export function cube(x) {
    return x * x * x;
}
/*
 export {
    Axios
}*/
