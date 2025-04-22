// webpack.config.js for My Game-Plan
const path = require('path');

module.exports = {
  entry: {
    'my-game-plan-bundle': './my-game-plan-index.js',
  },
  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, './'),
  },
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
        use: ['style-loader', 'css-loader', 'postcss-loader']
      }
    ]
  },
  resolve: {
    extensions: ['.js', '.jsx']
  }
};
