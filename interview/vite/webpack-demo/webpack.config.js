const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

// webpack 配置文件
module.exports = {
    entry: './src/main.jsx', // 申明入口， webpack整理依赖关系，并打包
    output: {
        filename: 'bundle.js',
        path: path.resolve(__dirname, 'dist'),
        clean: true
    },
    mode: 'development', //开发模式
    target: 'web',
    module: {
        rules: [
            {
                test: /\.css$/i,
                use: ['style-loader', 'css-loader'],
            },
            {
              test: /\.(js|jsx)$/,
              exclude: /node_modules/,
              use: {
                loader: 'babel-loader',
                options: {
                  presets: ['@babel/preset-react']
                }
              }
            }
        ],
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: path.resolve(__dirname, 'src/index.html'),
            filename: 'index.html'
        })
    ],
    devServer: {
        port: 3001,
        open: true,
        hot: true,
        static: {
            directory: path.resolve(__dirname, 'dist')
        }
    }
}