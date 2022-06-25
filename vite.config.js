// const { resolve, join } = require('path');
// const { sync } = require('glob');

export default {
    // root: join(__dirname, "src"),
    build: {
        // outDir: join(__dirname, "dist"),
        // emptyOutDir: true,
        // publicDir: join(__dirname, "src", "public"), // Default: "<root>/public"
        assetsInlineLimit: 0,
        // cssCodeSplit: false,
        sourcemap: false,
        rollupOptions: {
            // input: sync(resolve(__dirname, "*.html")),
            input: "./index.html",
            output: {
                entryFileNames: `assets/js/[name].js`,
                // entryFileNames: `assets/js/ignore.js`,
                chunkFileNames: `assets/js/[name].js`,
                assetFileNames: assetInfo => {
                    // if (assetInfo.ext === 'css') {
                    //     return `assets/css/[name].css`
                    // }
                    // if (assetInfo.ext === ('jpg' || 'jpeg' || 'png' || 'svg' || 'webp' || 'gif' || 'raw')) {
                    //     return `assets/img/[name].[ext]`
                    // }
                    // if (assetInfo.ext === ('mp4' || 'mp3')) {
                    //     return `assets/media/[name].[ext]`
                    // }

                    return `assets/[ext]/[name].[ext]`
                },
                // assetFileNames: `assets/css/[name].[ext]`,
                manualChunks: {},
            }
        },
    },
    base: "./",
    // server: {
    //     fs: {
    //         strict: false,
    //         // allow: ['..']
    //     }
    // }
}