const internationalization = {
  "locales": [
    "en"
  ],
  "requiredLocales": [],
  "strictMode": "inclusive",
  "defaultLocale": "en"
};
const dictionary = {
  "fill": true,
  "contentAutoTransformation": false,
  "location": "local",
  "importMode": "static"
};
const routing = {
  "mode": "prefix-no-default",
  "storage": {
    "cookies": [
      {
        "name": "INTLAYER_LOCALE",
        "attributes": {
          "path": "/"
        }
      }
    ],
    "headers": [
      {
        "name": "x-intlayer-locale"
      }
    ]
  },
  "basePath": ""
};
const content = {
  "fileExtensions": [
    ".content.ts",
    ".content.js",
    ".content.cjs",
    ".content.mjs",
    ".content.json",
    ".content.json5",
    ".content.jsonc",
    ".content.tsx",
    ".content.jsx",
    ".content.md",
    ".content.mdx",
    ".content.yaml",
    ".content.yml"
  ],
  "contentDir": [
    "/Users/thommorais/shed/journ/rumpus/apps/web"
  ],
  "codeDir": [
    "/Users/thommorais/shed/journ/rumpus/apps/web"
  ],
  "excludedPath": [
    "**/node_modules/**",
    "**/dist/**",
    "**/build/**",
    "**/.intlayer/**",
    "**/.next/**",
    "**/.nuxt/**",
    "**/.expo/**",
    "**/.vercel/**",
    "**/.turbo/**",
    "**/.tanstack/**",
    "**/.output/**",
    "**/.svelte-kit/**"
  ],
  "watch": true
};
const system = {
  "baseDir": "/Users/thommorais/shed/journ/rumpus/apps/web",
  "moduleAugmentationDir": "/Users/thommorais/shed/journ/rumpus/apps/web/.intlayer/types",
  "unmergedDictionariesDir": "/Users/thommorais/shed/journ/rumpus/apps/web/.intlayer/unmerged_dictionary",
  "remoteDictionariesDir": "/Users/thommorais/shed/journ/rumpus/apps/web/.intlayer/remote_dictionary",
  "dictionariesDir": "/Users/thommorais/shed/journ/rumpus/apps/web/.intlayer/dictionary",
  "dynamicDictionariesDir": "/Users/thommorais/shed/journ/rumpus/apps/web/.intlayer/dynamic_dictionary",
  "fetchDictionariesDir": "/Users/thommorais/shed/journ/rumpus/apps/web/.intlayer/fetch_dictionary",
  "typesDir": "/Users/thommorais/shed/journ/rumpus/apps/web/.intlayer/types",
  "mainDir": "/Users/thommorais/shed/journ/rumpus/apps/web/.intlayer/main",
  "configDir": "/Users/thommorais/shed/journ/rumpus/apps/web/.intlayer/config",
  "cacheDir": "/Users/thommorais/shed/journ/rumpus/apps/web/.intlayer/cache",
  "tempDir": "/Users/thommorais/shed/journ/rumpus/apps/web/.intlayer/tmp"
};
const editor = {
  "editorURL": "http://localhost:8000",
  "cmsURL": "https://app.intlayer.org",
  "backendURL": "https://back.intlayer.org",
  "port": 8000,
  "enabled": false,
  "dictionaryPriorityStrategy": "local_first",
  "liveSync": false,
  "liveSyncPort": 4000,
  "liveSyncURL": "http://localhost:4000"
};
const analytics = {
  "enabled": false,
  "flushInterval": 20000,
  "sampleRate": 1
};
const log = {
  "mode": "default",
  "prefix": "Intlayer: "
};
const ai = {};
const build = {
  "mode": "auto",
  "minify": false,
  "purge": false,
  "chunkGrouping": true,
  "dictionariesPreload": true,
  "traversePattern": [
    "**/*.{tsx,ts,js,mjs,cjs,jsx,vue,svelte,astro}",
    "!**/node_modules/**",
    "!**/dist/**",
    "!**/build/**",
    "!**/.intlayer/**",
    "!**/.next/**",
    "!**/.nuxt/**",
    "!**/.expo/**",
    "!**/.vercel/**",
    "!**/.turbo/**",
    "!**/.tanstack/**",
    "!**/.output/**",
    "!**/.svelte-kit/**",
    "!**/*.config.*",
    "!**/*.test.*",
    "!**/*.spec.*",
    "!**/*.stories.*",
    "!**/*.d.ts",
    "!**/*.d.ts.map",
    "!**/*.map"
  ],
  "outputFormat": [
    "esm",
    "cjs"
  ],
  "cache": false,
  "checkTypes": false
};
const compiler = {
  "enabled": false,
  "dictionaryKeyPrefix": "",
  "noMetadata": false,
  "saveComponents": false
};
const schemas = undefined;
const plugins = undefined;

module.exports.internationalization = internationalization;
module.exports.dictionary = dictionary;
module.exports.routing = routing;
module.exports.content = content;
module.exports.system = system;
module.exports.editor = editor;
module.exports.analytics = analytics;
module.exports.log = log;
module.exports.ai = ai;
module.exports.build = build;
module.exports.compiler = compiler;
module.exports.schemas = schemas;
module.exports.plugins = plugins;
