const path = require("path");

module.exports = {
  entry: "./client/index.tsx",
  output: {
    path: path.resolve(__dirname, "public/training/build"),
    filename: "bundle.js",
    publicPath: "./build/",
  },
  resolve: {
    extensions: [".js", ".jsx", ".ts", ".tsx"],
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
          { loader: "@teamsupercell/typings-for-css-modules-loader" },
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
      {
        test: /\.tsx?$/,
        use: "ts-loader",
        exclude: /node_modules/,
      },
    ],
  },
};
