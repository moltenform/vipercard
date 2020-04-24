
// we're not actually in a typescript environment, this is just a config file,
// so safe to disable the warnings about require statements
/* eslint-disable @typescript-eslint/no-var-requires */
const path = require('path');
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const webpack = require('webpack');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin')

const main = [
    './src/ui512/root/rootStartCanvas.ts'
];

module.exports = {
    context: process.cwd(), // to automatically find tsconfig.json
    entry: {
        main: main
    },
    output: {
        path: path.join(process.cwd(), 'dist'),
        filename: '[name].js',
    },
    plugins: [
        new ForkTsCheckerWebpackPlugin({
            async: false,
            useTypescriptIncrementalApi: true,
            memoryLimit: 4096
        }),
        new HtmlWebpackPlugin({
            hash: true,
            inject: true,
            template: '0.3/index.dev.html',
            minify: {
                removeComments: true,
                collapseWhitespace: true,
                removeRedundantAttributes: true,
                useShortDoctype: true,
                removeEmptyAttributes: true,
                removeStyleLinkTypeAttributes: true,
                keepClosingSlash: true,
                minifyJS: true,
                minifyCSS: true,
                minifyURLs: true,
            },
        }),
        new webpack.DefinePlugin({
            //  note that the plugin does a direct text replacement.
            WEBPACK_PRODUCTION: true,
        })
    ],
    module: {
        rules: [
            {
                test: /.tsx?$/,
                use: [
                    {
                        loader: 'ts-loader', options: {
                            transpileOnly: true,
                        }
                    }
                ],
            }
        ]
    },
    resolve: {
        extensions: [".tsx", ".ts", ".js"]
    },
    optimization: {
        minimize: true,
        minimizer: [
            new UglifyJsPlugin({
                uglifyOptions: {
                    output: {
                        comments: false,
                        beautify: false,
                    },
                    mangle: {
                        properties: false
                    },
                    compress: true,
                    chunkFilter: (chunk) => {
                      if (chunk.name.endswith('Warn')||chunk.name.endswith('Message')||chunk.name.endswith('Err')) {
                        return false;
                      }

                      return true;
                    },
                },
            }),
        ],
    },
};

