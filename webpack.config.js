const path = require('path');

module.exports = {
  entry: './src/my-games-index.js',  // Changed from './src/index.tsx'
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'my-games-bundle.js',  // Changed to match HTML reference
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx|ts|tsx)$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader', 'postcss-loader'],
      },
    ],
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js', '.jsx'],
  },
  devServer: {
    static: {
      directory: path.join(__dirname, 'public'),
    },
    compress: true,
    port: 3000,
  },
};
