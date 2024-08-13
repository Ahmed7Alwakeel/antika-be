const path = require('path');
const nodeExternals = require('webpack-node-externals');

module.exports = {
  entry: './src/server.ts',  // Entry point for your app
  target: 'node',
  externals: [nodeExternals()],
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.js',
    libraryTarget: 'commonjs2'
  },
  module: {
    rules: [
      {
        test: /\.pug$/,
        use: ['pug-loader'] // Handle Pug files
      },
      {
        test: /\.ts$/,
        exclude: /node_modules/,
        use: 'ts-loader' // Handle TypeScript files
      }
    ]
  },
  resolve: {
    extensions: ['.ts', '.js']
  }
};
