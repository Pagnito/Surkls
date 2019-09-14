const path = require("path");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const ImageminPlugin = require('imagemin-webpack-plugin').default

let env = process.env.NODE_ENV ==='production' ? 'prod' : 'dev';
//const Visualizer = require("webpack-bundle-analyzer").BundleAnalyzerPlugin
module.exports = {
  mode: env==='prod' ? 'production' : 'development',
  entry: "./src/index.js",
  output: {
    path: __dirname + "/build",
    filename: "bundle.js",
    publicPath: '/'
  },
  devtool: env==='dev' ? 'source-map' : 'none',

  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader",
          options: {
            presets: ["@babel/preset-env", "@babel/preset-react"]
          }
        }
      },
      {
        test: /\.(jpg|png|svg)$/,
        use: {
          loader: "url-loader",
        }
      },
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        loader: "eslint-loader"


      },
      {
        "test": /\.scss$/,
        "use": [
                MiniCssExtractPlugin.loader,
                "css-loader",
                "sass-loader"
                ]
      }
    ]
  },
  resolve: {
    extensions: [ 'scss', 'css', '.js', '*' ],
    alias: {
      components: path.resolve(__dirname, 'src/components'),
      actions: path.resolve(__dirname, 'src/actions'),
      reducers: path.resolve(__dirname, 'src/reducers'),
      types: path.resolve(__dirname, 'src/actions'),
      tools: path.resolve(__dirname, 'tools')
    }
  },
  plugins: [new MiniCssExtractPlugin({ filename: "bundle.css" }),
            new ImageminPlugin({ test: /\.(jpe?g|png|gif|svg)$/i,
            disable: process.env.NODE_ENV !== 'production' }),
            new HtmlWebpackPlugin({template:'./index.html'}),
            new CopyWebpackPlugin([
              { from: './assets', to: './assets' }
            ]),
  ],
  devServer: {
    port: 3000,
    disableHostCheck: true,
    proxy: [
      // allows redirect of requests to webpack-dev-server to another destination
      {
        context: ["/api","/auth", "/account"], // can have multiple
        target: "http://localhost:4000", // server and port to redirect to
        secure: false
      }
    ],
    open: true,
    historyApiFallback: true,
    contentBase: "./",
    compress: true,
    watchOptions: {
      aggregateTimeout: 300,
      poll: 1000
    }
  }
};
