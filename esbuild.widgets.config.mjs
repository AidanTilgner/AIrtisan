import * as esbuild from "esbuild";
import { sassPlugin, postcssModules } from "esbuild-sass-plugin";

const widgets = [
  {
    name: "rewire-site",
    entry: "widgets/chatboxes/Rewire/index.tsx",
    output: "public/widgets/chatboxes/rewire-site.js",
  },
  {
    name: "rewire-site-updated",
    entry: "widgets/chatboxes/Rewire Updated/index.tsx",
    output: "public/widgets/chatboxes/rewire-site-updated.js",
  },
  {
    name: "floating-chat",
    entry: "widgets/chatboxes/Floating/index.tsx",
    output: "public/widgets/chatboxes/floating-chat.js",
  },
];

const buildWidget = async (widget) => {
  console.info(`Building widget ${widget.name}...`);
  await esbuild
    .build({
      entryPoints: [widget.entry],
      bundle: true,
      outfile: widget.output,
      sourcemap: false,
      minify: true,
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
    })
    .catch(() => process.exit(1));
  console.info(`Widget ${widget.name} built!`);
};

const buildWidgets = async () => {
  await Promise.all(widgets.map(buildWidget));
};

buildWidgets();
