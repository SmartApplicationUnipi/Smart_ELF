const path = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin')

module.exports = {
  entry: './src/main.ts',
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/
      }
    ]
  },
  resolve: {
    extensions: [ '.tsx', '.ts', '.js' ]
  },
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist')
  },
  mode: 'development',
  plugins: [
    new CopyWebpackPlugin([
      { from: 'res', to: 'res' }, // Copy res folder
    ])
  ]
};