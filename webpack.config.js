/**
 @author: Jersey
 @create: 2021-11-22 18:40
 @version: V1.0
 @slogan: 业精于勤,荒于嬉;行成于思,毁于随。
 @description: 开发环境下webpack 配置文件 ：指示webpack 加载哪些配置
 所有的构建工具都是基于nodejs 平台的 模块化默认采用commonjs
 resolve 用来拼接绝对路径
 loader:1.下载2.使用(配置 loader)
 plugins:1.下载2.引入3.使用
 webpack 支持es6 语法，但最新的es7 及以上等语法可能不支持所以需要安装babel 进行辅助编译
 path.resolve是nodeJs里面方法，可以连接两个相对路径并生成绝对路径；
 */

/*
    A  HMR  : hot module replacement  热部署 ，只打包变化的模块而不是打包所有，其他模块使用原来的缓存
     devServer : 配置 hot :true
     样式文件：可以使用HMR ：style-loader 已经实现此功能，无需人为处理了
    js 文件 ：默认没有HMR :需要自己修改js 代码。添加支持HMR代码
    注意：HMR 功能对js 处理。只能处理非入口的文件
    // 是否开启HRM
    if (module.hot) {
      module.hot.accept('./js/axios.js', () => {
         console.log("监听axios.js 变化，一但变化其他默认不会打包;")
      });
    }
     html 文件 ：默认没有HMR,同时html 文件不能热更新了:一般不用做HMR
     若使用则：修改entry 引入html文件
    B source-map : 一种提供源代码到构建代码映射技术： 构建后代码出错定位到源代码的技术，利于调试
       1 开发环境一般在webpack  中添加参数 devtool:"eval-source-map" /eval-cheap-module-source-map
      2 生产环境一般在webpack  中添加参数 devtool:"source-map" /cheap-module-source-map
  C:懒加载
     需要时在加载，适合延迟事件
     import(/*webpackChunkName:'axios'  './js/axios').then(({Axios})=>{})
 */

const {resolve, join} = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const {CleanWebpackPlugin} = require("clean-webpack-plugin");//删除dist 文件下的旧的文件
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
//设置node 环境变量是browserslist使用哪个环境配置，默认生产环境的
process.env.NODE_ENV = "development";

const commonCssLoader = [

    //style-loader 开发模式下创建style 标签 将js 中的样式资源插入进行，添加到head 中生效,但在ie下无效需要将css提取出来
    MiniCssExtractPlugin.loader,
    // 将css 文件变成common js 模块，里面内容是样式字符串
    "css-loader",
    /*
    生产模式下css兼容性处理: posters-> postcss-loader postcss-preset-env
    posters找到 package.json中 browserslist里面的配置,通过配置加载指定的css兼容性样式
    需要配置在webpack.config下
   "browserslist": {
      设置环境变量使用node开发环境配置:process.env.NODE_ENV=development

      "development": [
        "last 1 chrome version",
        "last 1 firefox version",
        "last 1 safari version",
        "last 1 edge version"
      ],
      默认使用生产环境
      "production": [
        ">0.2%",
        "not dead",
        "not op_mini all"
      ]
    }
      已废弃写法
      loader: "postcss-loader",
      options: {
        ident: "postcss",
        plugins: () => [
          require("postcss-preset-env")()
        ]
      }
    }
    */
    {
        loader: "postcss-loader",
        options: {
            postcssOptions: {
                plugins: [
                    [
                        'postcss-preset-env',
                        {
                            ident: "postcss"
                        }
                    ]
                ]
            }
        }
    }
]
module.exports = {
    //多入口适合多页面
    // entry: {
    //     //多入口：适合多页面配置
    //     main:"./src/index.js",
    //     test:"./src/test.js"
    // },
    //单入口
    entry: ["./src/index.js", "./src/index.html"],//加入html 针对html无法使用热部署处理
    //输出
    output: {
        filename: "js/index.js",
        //__dirname nodejs的变量，代表当前文件的目录的绝对路径
         path: resolve(__dirname, 'dist'),
         chunkFilename: "js/[name].[chunkhash].js",
         publicPath: "./"
    },
    module: {
        //详细的loader 编译配置，用来处理img,less 等webpack 无法处理的js 文件
        //不同的文件必须配置不同的loader 处理
        rules: [
            /* {
                 //语法检查 eslint-loader 依赖eslint 设置检查规则 package.json 中eslintConfig 设置airbnb规则
                 //airbnb==>eslint-config-airbnb eslint eslint-plugin-import
                 //跳过该行检查eslint-disable-next-line
                 test: /\.js$/,
                 //优先执行，正常的，一个文件只能被一个loader处理，当一个文件要被多个loader处理，
                 //一定要指定loader执行的先后顺序，先执行eslint再执行babel
                 enforce: "pre",
                 loader: "eslint-loader",
                 exclude: /node_modules/,
                 options: {
                     fix: true
                 }
             },*/
            {
                //匹配哪些文件
                test: /\.css$/,
                //使用哪些loader，use 执行顺序，从右到左，从下到上依次执行
                use: [...commonCssLoader]
            },

            {   //以下loader只会匹配一个，匹配到后面就不会比配了;不能有两个loader处理同一类型的文件
                oneOf: [
                    {
                        //默认无法处理html img标签的图片
                        test: /\.(jpg|png|gif|svg)$/,
                        //多个需要使用use [],单个则直接使用loader
                        //下载url-loader和 file-loader
                        loader: "url-loader",
                        options: {
                            //图片大小小于8kb 会被base64编码处理
                            //减少请求数量减轻服务器压力，缺点图片体积更大，导致文件请求速度更慢
                            //一般对小图片进行处理
                            // url-loader 默认使用es6 模块进行解析，html-loader使用commonjs 进行解析，所以需要加入esModule:false 属性
                            //关闭url-loader 的es6 的模块化，使用默认commonjs 解析
                            limit: 8 * 1024,
                            //name:"[contenthash:10].[ext]", ext 取原来的扩展名，hash 取图片hash值的前10位
                            //outputPath:"./images", 和下面不加images的写法等价
                            name: "images/[name].[ext]",//保持图片名不变，而且也能够添加到指定目录下
                            esModule: false,//url-loader 默认使用es6解析，html-loader 引入的图片是commonjs 解析会出现【object Module】问题，所以需要关闭url-loader的es6 米快化使用commonjs 解析

                        },
                        type: "javascript/auto"//在最新的webpack5 中为了兼容旧的url-loader 模式，可使用asset/inline代替
                    }, {
                        test: /\.html$/,
                        //处理html 文件中的img图片，负责引入img 从而被url-loader进行处理
                        loader: "html-loader"
                    },
                    {
                        //打包其他资源比如字体文件(除了html/js/css 资源以外的资源)
                        //排除css js  html less sass 等资源
                        exclude: /\.(css|js|html|less|sass|jpg|png|gif|svg)$/,
                        type: 'asset/resource',//webpack 5 最新loader 代替file-loader,file-loader 写法参考images 处理方法
                        //不能使用option,使用生成器代替option
                        generator: {
                            filename: "font/[name].[contenthash:10].[ext]"
                        }
                    } , {
                        test: /\.less$/,
                        use: [
                            ...commonCssLoader,
                            //需要下载less-loader和less
                            "less-loader",
                        ]
                    },
                     {
                        test: /\.js$/,
                        use: [
                            {
                                loader: 'babel-loader',
                                options: {
                                    presets: [
                                        [
                                            '@babel/preset-env',
                                            {
                                                //"@babel/polyfill"; 全部兼容性一次解决
                                                //按需加载需要做兼容性处理的就做:按需加载->core-js
                                                useBuiltIns: "usage",
                                                //指定哪些兼容性处理
                                                corejs: {
                                                    version: 3
                                                },
                                                targets: {
                                                    chrome: '60',
                                                    firefox: '60',
                                                    ie: '9',
                                                    safari: '10',
                                                    edge: '17'
                                                }
                                            }
                                        ]
                                    ],
                                    //babel依赖的插件:使用按需加载时这些插件可以不用
                                    //
                                    // plugins: [
                                    //          ['@babel/plugin-proposal-object-rest-spread'],
                                    //          //当使用 legacy: true 启用兼容模式时，必须在 loose 模式下使用 @babel/plugin-proposal-class-properties 来支持 @babel/plugin-proposal-decorators。
                                    //          ['@babel/plugin-proposal-class-properties',{loose: true}],
                                    //          ['@babel/plugin-proposal-decorators',{legacy: true}]
                                    // ]
                                    cacheDirectory: true //开启babel 缓存，第二次构建会读取之前的缓存
                                }
                            }
                        ],
                        exclude: /node_modules/,
                        include: /src/
                    }

                ]
            }
        ]
    },
    plugins: [
        //详细的插件配置用来打包优化压缩代码
        //html-webpack-plugin
        //默认会创建一个空的html文件自动打包的所有资源。css/js
        //需要有结构的html文件则使用webpack 指令自动在build下生成index.html
        new HtmlWebpackPlugin({
            //复制html文件
            template: "./src/index.html",
            filename: "index.html",  // 打包出来的html文件名称,
            //hash:  true
        }),
        new MiniCssExtractPlugin({
            filename: "main.css"
        }),
        new  CleanWebpackPlugin()
    ],
    //模式 development 开发环境，production 生产环境 自动压缩js 代码
    mode: "development",
    //开发服务器：自动化（自动编译，自动打开浏览器并刷新）
    //只会在内存中打包编译，不会有任何输出
    //启动 npx webpack-dev-server
    devServer: {
        host: '127.0.0.1',
        port: 3000,//端口号,
        hot: true, //开启HMR热部署,需要重启webpack服务
       //启动时通过 ZeroConf 网络广播你的开发服务器。
        bonjour: {
            type: 'http',
            protocol: 'udp',
        },
        //http2: true,//HTTP/2 带有自签名证书：
        //server: 'https',
        //白名单
        allowedHosts: [
            'host.com',
            'subdomain.host.com',
            'subdomain2.host.com',
            'host2.com',
        ],
        //contentBase:resolve(__dirname,"dist"),//此写法最新的webpack5 以已经废弃,使用下面方法代替，用npx webpack-dev-server --static 指令执行
        static: {
            directory: join(__dirname, "dist"),
            watch: {
                ignored:/node_modules/,
                usePolling: false,
            },
            serveIndex: true//告诉开发服务器启用后使用 serveIndex 中间件。serveIndex 中间件会在查看没有 index.html 文件的目录时生成目录列表。
        },
        compress: true,//启动gzip压缩
        //显示进度 npx webpack serve --client-progress
        client: {
            progress: true,//在浏览器中以百分比显示编译进度
            //不要启动日志
            logging: 'none',
            //出现错误不要全屏显示
            overlay: {
                errors: true,//只想显示错误信息
                warnings: false,
            },
            reconnect: 3//失败时尝试连接客户端次数
        },

        //开发环境下跨域:使用代理服务器devServer:服务器与服务器之间没有跨域 浏览器发送请求发送到代理服务器，然后由代理服务器转发，
        //代理服务将转发接受的响应发送给浏览器。实现跨域
        proxy:{
            //当devServer 服务器接受到/api/xxx 的请求，就会把请求转发到target 服务器
            '/api':{
                target:'http://localhost:3000',
                //发送请求时请求路径重写， 将/api/xxx  - > /xxx(去掉/api)
                pathReWrite:{
                    '^/api':""
                }
            }
        }
    },
    devtool: "source-map", //更据打包代码出错可定位源代码的位置
    resolve: {

        //配置省略文件名路径的后缀 默认情况下，TS文件之间互相引入是不支持的，因此需要进行模块化设置：
        extensions: [".js",".json",".jsx",".ts"],
        //告诉webpack 解析模块默认从哪个目录找,若找不到从上层目录继续找
        modules: [resolve("../node_modules"),"node_modules"]
    }
}