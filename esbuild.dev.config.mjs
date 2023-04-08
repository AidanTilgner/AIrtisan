import * as esbuild from "esbuild";
import { sassPlugin, postcssModules } from "esbuild-sass-plugin";

const buildOptions = {
  entryPoints: ["client/index.tsx"],
  bundle: true,
  outfile: "public/training/build/bundle.js",
  sourcemap: true,
  minify: false,
  plugins: [
    sassPlugin({
      filter: /\.module\.scss$/,
      transform: postcssModules({
        generateScopedName: "[name]__[local]___[hash:base64:5]",
        basedir: "client",
      }),
      type: "css",
    }),
    sassPlugin({
      filter: /\.scss$/,
    }),
  ],
  loader: {
    ".js": "jsx",
    ".jsx": "jsx",
    ".ts": "tsx",
    ".tsx": "tsx",
    ".scss": "css",
  },
  jsxFactory: "React.createElement",
  jsxFragment: "React.Fragment",
};

// await esbuild
//   .build(buildOptions)
//   .then((result) => {
//     esbuild.watch(buildOptions, (error, result) => {
//       if (error) console.error("watch build failed:", error);
//       else console.info("watch build succeeded:", result);
//     });
//   })
//   .catch((err) => {
//     console.error("build failed:", err);
//     process.exit(1);
//   });

async function watch() {
  let ctx = await esbuild.context(buildOptions);
  await ctx.watch();
  console.log("Watching...");
}
watch();
