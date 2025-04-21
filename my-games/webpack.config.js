// webpack.config.js for My Games feature
const path = require('path');

module.exports = {
  entry: './src/my-games-index.js',
  output: {
    filename: 'my-games-bundle.js',
    path: path.resolve(__dirname, 'dist'),
    publicPath: '/my-games/dist/'
  },
  mode: 'production',
  devtool: 'source-map',
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env', '@babel/preset-react']
          }
        }
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader', 'postcss-loader'],
      }
    ]
  },
  resolve: {
    extensions: ['.js', '.jsx'],
    fallback: {
      // Node.js polyfills
      "stream": false,
      "path": false,
      "util": false,
      "process": false,
      "buffer": false,
      "crypto": false,
      "zlib": false,
      "fs": false,
      "http": false,
      "https": false,
      "net": false,
      "tls": false
    }
  },
  // Externalize Firebase - it will be loaded from CDN
  externals: {
    'firebase/app': 'firebase',
    'firebase/auth': 'firebase',
    'firebase/firestore': 'firebase',
    'firebase/functions': 'firebase',
    'firebase': 'firebase'
  }
};
