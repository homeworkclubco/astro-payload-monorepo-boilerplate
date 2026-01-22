const path = require("path");

module.exports = {
  plugins: [
    require("autoprefixer"),
    require("postcss-ruler")({
      minWidth: 375,
      maxWidth: 1760,
      generateAllCrossPairs: true,
    }),
    // 1. Feed the breakpoints to PostCSS globally
    require("@csstools/postcss-global-data")({
      files: [
        // Point to your package inside the node_modules (symlinked by pnpm)
        require.resolve("@viewingstudio/ui/css/breakpoints"),
      ],
    }),

    // 2. Enable custom media queries
    require("postcss-custom-media")({
      preserve: false, // false = turns "@media (--sm)" into "@media (min-width: 768px)"
    }),

    // 3. (Optional) Setup Nesting if you like nested CSS
    require("postcss-nesting"),
  ],
};
