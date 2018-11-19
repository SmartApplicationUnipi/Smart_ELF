const path = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin')

module.exports = {
    entry: './src/main.ts',
    module: {
        rules: [{
            test: /\.tsx?$/,
            use: 'ts-loader',
            exclude: /node_modules/
        }, {
            test: /\.css$/,
            use: ['style-loader', 'css-loader']
        }]
    },
    resolve: {
        extensions: ['.tsx', '.ts', '.js']
    },
    output: {
        filename: 'bundle.js',
        path: path.resolve(__dirname, 'dist')
    },
    devServer: {

        // `contentBase` specifies what folder to server relative to the 
        // current directory. This technically isn't false since it's an absolute
        // path, but the use of `__dirname` isn't necessary. 
        contentBase: 'dist'
    },
    mode: 'development',
    plugins: [
        new CopyWebpackPlugin([
            { from: 'res', to: 'res' }, // Copy res folder
        ])
    ]
};