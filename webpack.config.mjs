import process from 'node:process';
import path from 'node:path';
import webpack from 'webpack';
import { InjectManifest } from 'workbox-webpack-plugin';

export default {
  entry: {
    app: './app/app.entry.js',
  },
  output: {
    filename: '[name].js',
    path: path.join(process.cwd(), './dist'),
  },
  optimization: {
    splitChunks: {
      cacheGroups: {
        vendor: {
          test: /node_modules/,
          chunks: 'initial',
          name: 'vendor',
          enforce: true,
        },
      },
    },
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: process.env.NODE_ENV,
      },
    }),
    new InjectManifest({
      swSrc: './app/sw-prod.js',
    }),
  ],
  module: {
    rules: [
      {
        enforce: 'pre',
        test: /\.jsx?/,
        use: 'import-glob',
      },
      {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        use: [
          {
            loader: 'babel-loader',
            options: {
              presets: [
                [
                  '@babel/preset-env',
                  {
                    useBuiltIns: 'usage',
                    corejs: 3,
                  },
                ],
                '@babel/preset-react',
              ],
            },
          },
        ],
      },
    ],
  },
  resolve: {
    extensions: ['.js', '.jsx', '.yaml'],
  },
};
