// Bundles the extension scripts with esbuild.
// The `forceEsmZod` plugin redirects all bare zod imports to the ESM build.
// Without it, `import "zod/v4"` (ESM) and the AI SDK's `require("zod/v4")`
// (CJS) resolve to two separate module instances, so `z.config()` only
// applies to one of them and the other still probes for eval support,
// violating the extension CSP (`script-src 'self'`).
import { build } from "esbuild";
import { cpSync } from "node:fs";
import { createRequire } from "node:module";

const zodDir = createRequire(import.meta.url)
    .resolve("zod/package.json")
    .replace(/[^/\\]+$/, "v4");

const forceEsmZod = {
    name: "force-esm-zod",
    setup(b) {
        b.onResolve({ filter: /^zod\/v4(\/core)?$/ }, (args) => ({
            path: `${zodDir}${args.path.endsWith("/core") ? "/core" : ""}/index.js`
        }));
    }
};

await build({
    entryPoints: ["background.js", "config.js", "manifest.json", "popup.js"],
    bundle: true,
    platform: "browser",
    outdir: "dist",
    plugins: [forceEsmZod]
});

// Localization catalogs are not JS entry points, so copy them as-is.
cpSync("_locales", "dist/_locales", { recursive: true });
