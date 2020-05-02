
/* we're not actually in a typescript environment, this is just a config file, */
/* so it's fine to disable the warnings about require statements */
/* eslint-disable @typescript-eslint/no-var-requires */
const path = require('path');
const ForkTsCheckerNotifierWebpackPlugin = require('fork-ts-checker-notifier-webpack-plugin');
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const webpack = require('webpack');

const main = [
    './src/ui512/root/rootStartCanvas.ts'
];

module.exports = {
    /* automatically find tsconfig.json */
    context: process.cwd(),
    entry: {
        main
    },
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: '[name].js',
        publicPath: "/"
    },
    plugins: [
        new ForkTsCheckerWebpackPlugin({
            eslint: true
        }),
        /* turn off pop-up notifications */
        /* new ForkTsCheckerNotifierWebpackPlugin(
            { title: 'TypeScript', excludeWarnings: false }), */
        new HtmlWebpackPlugin({
            inject: true,
            template: '0.3/index.dev.html'
        }),
        new webpack.DefinePlugin({
            /*  note that the plugin does a direct text replacement. */
            WEBPACK_PRODUCTION: false,
            DBGPLACEHOLDER: 'debugger'
        }),
    ],
    module: {
        rules: [
            {
                test: /.tsx?$/,
                use: [
                    { loader: 'ts-loader', options: { transpileOnly: true } }
                ]
            }
        ]
    },
    resolve: {
        extensions: [".tsx", ".ts", ".js"]
    },
    devtool: 'inline-source-map',
    devServer: {
        clientLogLevel: 'warning',
        open: true,
        historyApiFallback: true,
        stats: 'errors-only',
        /* turn off auto-refresh browser on changes */
        liveReload: false,
    }
};
