const path = require("path");

module.exports = {
  entry: "./client/index.js",
  output: {
    path: path.resolve(__dirname, "public/training/build"),
    filename: "bundle.js",
    publicPath: "./build/",
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader",
          options: {
            presets: ["@babel/preset-env", "@babel/preset-react"],
          },
        },
      },
      {
        test: /\.module\.s(a|c)ss$/,
        use: [
          "style-loader",
          {
            loader: "css-loader",
            options: {
              modules: {
                localIdentName: "[name]__[local]___[hash:base64:5]",
              },
              importLoaders: 2,
            },
          },
          "sass-loader",
        ],
      },
    ],
  },
};
