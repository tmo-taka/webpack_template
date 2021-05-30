// プラグインを利用するためにwebpackを読み込んでおく
const webpack = require('webpack');
// output.pathに絶対パスを指定する必要があるため、pathモジュールを読み込んでおく
const path = require('path');
//エントリーポイントを配列で指定できるようになる
const globby = require('globby');

const miniCssExtractPlugin = require('mini-css-extract-plugin');
const fixStyleOnlyEntriesPlugin = require("webpack-fix-style-only-entries");
const optimizeCssAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const stylelintPlugin = require('stylelint-webpack-plugin');

// entrypointの記述
/*
今回下記でやっていることは
エントリーポイントとアウトプットファイルの登録をしています。
楽せずに書こうとすれば
{
    './css/common.css': './src/scss/common.scss',
    './css/reset.css': './src/scss/reset.scss'
    ・・・
},
 */
const scssEntries = globby.sync(['./src/scss/**/*.scss']).reduce((acc, cur) => {
    const src = cur;
    const filename = src.split("/").reverse()[0].split('.')[0];
    if(!filename.startsWith("_")){
        //fileがmixin形式でない場合
        const distPath = cur.replace('./src/scss/','./css/').replace('.scss','.css');
        acc[distPath] = src;
        return acc;
    }else {
        return acc;
    }
},{});

console.log(scssEntries);

module.exports = {
    // モードの設定、v4系以降はmodeを指定しないと、webpack実行時に警告が出る
    //ここがdevelopmentになっているとしっかりと圧縮されないように設定されています。
    mode: 'production',
    // エントリーポイントの設定
    entry: scssEntries,
    // 出力の設定
    output: {
        // 出力するファイル名(本来は書くべき部分であるが、mini-css-extract-pluginと重複してしまうので今回は、記載しない)
        // 出力先のパス（絶対パスを指定する必要がある）
        path: path.resolve(__dirname, 'public'),
    },
    //CSSを圧縮するための記載（optimize-css-assets-webpack-pluginのインストール）
    optimization: {
        minimizer: [
            new optimizeCssAssetsPlugin({})
        ]
    },
    plugins: [
        //不要なJSファイルが作成されるのを防ぐため
        new fixStyleOnlyEntriesPlugin({
            extensions: ['scss','css']
        }),
        //本来JSファイルの形でCSSを吐き出すのをCSSファイルの形でで出力するために入れるプラグイン
        new miniCssExtractPlugin({
            filename: '[name]',
        }),
        //警告をだすstylelint
        new stylelintPlugin({
            configFile: './stylelint.json',
        }),
        //書き方がおかしい部分をstylelint側で勝手に修正
        new stylelintPlugin({
            configFile: './stylelint_fix.json',
            //fixプロパティがポイント
            fix: true,
        })
    ],
    // ローダーの設定
    module: {
        rules: [
            {
                test: /\.scss$/,
                use:[
                    miniCssExtractPlugin.loader,
                    {
                        loader: 'css-loader',
                    },
                    {
                        loader: 'sass-loader',
                    }
                ]
            }
        ]
    },
}