const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ExtractTextWebpackPlugin = require('extract-text-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const webpack = require('webpack');
const resetCss = new ExtractTextWebpackPlugin('css/reset.css');
const studentLess = new ExtractTextWebpackPlugin('css/student.css');
const VueLoaderPlugin = require('vue-loader/lib/plugin');

module.exports = {
    entry: {
        indexS: './index-student.js'
    },
    output: {
        filename: '[name].js',
        path: path.resolve('lexue3S/public/js/naotu')
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
                use: studentLess.extract({
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
        new CleanWebpackPlugin('lexue3S'),
        new HtmlWebpackPlugin({
            template: './dist/index.html',
            filename: '../../../index-student.html',
            chunks: ['indexS']
        }),
        new webpack.HotModuleReplacementPlugin(),
        new VueLoaderPlugin(),
        resetCss,
        studentLess,
        new CopyWebpackPlugin([
            {
                from: 'dist/images',
                to: 'images',
                force: true,
                toType: 'dir'
            },
            {
                from: 'bower_components',
                to: 'bower_components',
                force: true,
                toType: 'dir'
            }, {
                from: 'angular',
                to: 'angular',
                force: true,
                toType: 'dir'
            },
            {
                from: 'dist/kityminder.editor.css',
                to: '[name].[ext]',
                force: true,
            },
            {
                from: 'dist/kityminder.editor.js',
                to: '[name].[ext]',
                force: true
            },
            {
                from: 'dist/kityminder.editor.min.css',
                to: '[name].[ext]',
                force: true
            },
            {
                from: 'dist/kityminder.editor.min.js',
                to: '[name].[ext]',
                force: true
            },
            {
                from: 'dist/favicon.ico',
                to: '[name].[ext]',
                force: true
            }
        ])
    ],
    externals: {  //外部引入的js不被打包到js里面
        vue: "Vue",   //vue不被打包到main.js里面
        'element-ui': "ELEMENT" //element-ui不被打包到main.js里面
    },
    devtool: 'source-map',
    mode: 'production'
};