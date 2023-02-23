const path = require('path');
const webpack = require('webpack');

const banner = `
/*********************
 * THIS IS OUR STUFF!
 ********************/
`;

module.exports = {
  entry: './src/minima/index.js',
  output: {
    path: path.resolve(__dirname,'public'),
    filename:'service.js'
  },
  optimization:{
    minimize:false,
  },
  module: {
    rules: [
      {
        test: /\.js$/,
      exclude: /node_modules/,
        use: [
          'babel-loader'
        ]
      },
    ]
  },
  plugins: [
    new webpack.BannerPlugin({
      banner,
      entryOnly: true
    })
  ],
  resolve: {
    modules: [
      'node_modules', // The default
      'src/minima'
    ]
  }
};