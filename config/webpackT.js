const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ExtractTextWebpackPlugin = require('extract-text-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const webpack = require('webpack');
const resetCss = new ExtractTextWebpackPlugin('css/reset.css');
const naotuLess = new ExtractTextWebpackPlugin('css/naotu.css');
const VueLoaderPlugin = require('vue-loader/lib/plugin');
module.exports = {
    entry: {
        indexT: './index-teacher.js'
    },
    output: {
        filename: '[name].js',
        path: path.resolve('lexue3T')
    },
    module: {
        rules: [
            {
                test: /\.css$/,
                use: resetCss.extract({
                    use: ['css-loader', 'postcss-loader'],
                    publicPath: '../'
                })
            },
            {
                test: /\.less$/,
                use: naotuLess.extract({
                    use: ['css-loader', 'less-loader']
                })
            },
            {
                test: /\.(jpe?g|png|gif)$/,
                use: [
                    {
                        loader: 'url-loader',
                        options: {
                            limit: 8192,
                            outputPath: 'images/'
                        }
                    }
                ]
            },
            {
                test: /\.(html|htm)$/,
                use: 'html-withimg-loader'
            },
            {
                test: /\.(eot|ttf|woff|svg)$/,
                use: 'file-loader'
            },
            {
                test: /\.js$/,
                use: 'babel-loader',
                include: /src/,
                exclude: /node_modules/
            },
            {
                test: /\.vue$/,
                loader: 'vue-loader',
                options: {
                    loaders: {
                        'less': [
                            'vue-style-loader',
                            'css-loader',
                            'less-loader'
                        ]
                    }
                }
            }
        ]
    },
    resolve: {
        alias: {
            'vue$': 'vue/dist/vue.esm.js',
            '@': path.resolve(__dirname, '../src')
        },
        extensions: ['*', '.js', '.json', '.css', '.vue']
    },
    optimization: { //webpack4.x的最新优化配置项，用于提取公共代码
        splitChunks: {
            cacheGroups: {
                commons: {
                    chunks: "initial",
                    name: "common",
                    minChunks: 2,
                    maxInitialRequests: 5, // The default limit is too small to showcase the effect
                    minSize: 0, // This is example is too small to create commons chunks
                    reuseExistingChunk: true // 可设置是否重用该chunk（查看源码没有发现默认值）
                }
            }
        }
    },
    plugins: [
        new CleanWebpackPlugin('lexue3T'),
        new HtmlWebpackPlugin({
            template: 'index.html',
            filename: 'index.html',
            hash: true,
            chunks: ['indexT']
        }),
        new webpack.HotModuleReplacementPlugin(),
        new VueLoaderPlugin(),
        resetCss,
        naotuLess
    ],
    devServer: {
        // contentBase: './naotu',
        // host: 'localhost',
        // port: 3001,
        // open: true,
        // hot: true
    },
    devtool: 'source-map',
    mode: 'development'
};
