const path = require("path");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
module.exports = {
  entry: "./src/index.js",
  output: {
    path: __dirname + "/build",
    filename: "bundle.js",
    publicPath: '/build'
  },
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
      styles: path.resolve(__dirname, 'src/styles'),
      components: path.resolve(__dirname, 'src/components'),
      actions: path.resolve(__dirname, 'src/actions'),
      reducers: path.resolve(__dirname, 'src/reducers'),
      types: path.resolve(__dirname, 'src/actions')
    }
  },
  plugins: [new MiniCssExtractPlugin({ filename: "bundle.css" })],
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
