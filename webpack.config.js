const path = require('path');
const fs = require('fs');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const {CleanWebpackPlugin} = require('clean-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const TerserWebpackPlugin = require('terser-webpack-plugin');

const isDev = process.env.NODE_ENV === 'development';
const isProd = !isDev;

const PATHS = {
    src: path.resolve(__dirname, 'src'),
    dist: path.resolve(__dirname, 'app'),
    assets: 'assets/'
};

const PAGES_DIR = `${PATHS.src}/pug/pages/`;
const PAGES = fs.readdirSync(PAGES_DIR).filter(fileName => fileName.endsWith('.pug'));

const filename = (ext) => isDev ? `[name].${ext}` : `[name].[contenthash].${ext}`;

const optimization = () => {
    const configObj = {
        splitChunks: {
            chunks: 'all'
        }
    };

    if(isProd) {
        configObj.minimizer = [
            new TerserWebpackPlugin()
        ]
    }

    return configObj;
};

module.exports = {
    context: path.resolve(__dirname, 'src'),
    mode: 'development',
    entry: './index.js',
    output: {
        filename: `./${filename('js')}`,
        path: path.resolve(__dirname, 'app')
    },
    devServer: {
        historyApiFallback: true,
        open: true,
        compress: true,
        hot: true,
        port: 3000,
    },
    optimization: optimization(),
    plugins: [
        ...PAGES.map(page => new HtmlWebpackPlugin ({
            template: `${PAGES_DIR}/${page}`,
            filename: `./${page.replace(/\.pug/,'.html')}`
        })),
        new CleanWebpackPlugin(),
        new MiniCssExtractPlugin({
            filename: `./${filename('css')}`,
        }),
        new CopyWebpackPlugin({
            patterns: [{
                from: path.resolve(__dirname, 'src/assets'),
                to: path.resolve(__dirname, 'app')
            }]
        })
    ],
    devtool: isProd ? false : 'source-map',
    module: {
        rules: [
            {
                test: /\.pug$/,
                loader: 'pug-loader',
                options: {
                    pretty: true,
                    self: true
                }
            },
            {
                test: /\.css$/i,
                use: [{
                    loader: MiniCssExtractPlugin.loader,
                    options: {
                        hmr: isDev
                    },
                }, 'css-loader']
            },
            {
                test: /\.s[ac]ss$/,
                use: [{
                    loader: MiniCssExtractPlugin.loader
                },
                    'css-loader',
                    'sass-loader'
                ],
            },
            {
                test: /\.(?:|gif|png|jpg|jpeg|svg)$/,
                use: [{
                    loader: 'file-loader',
                    options: {
                        name: `./images/${filename('[ext]')}`
                    }
                }]
            },
            {
                test: /\.js$/,
                exclude: /node_modules/,
                use: ['babel-loader'],
            }
        ]
    }
};