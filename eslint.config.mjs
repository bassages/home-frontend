import path from "path";
import { fileURLToPath } from "url";
import { defineConfig, globalIgnores } from "@eslint/config-helpers";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});
export default defineConfig([
  globalIgnores([
    "dist/**",
    "dist-server/**",
    "tmp/**",
    "out-tsc/**",
    "node_modules/**",
    ".idea/**",
    ".project",
    ".classpath",
    ".c9/",
    "*.launch",
    ".settings/",
    "*.sublime-workspace",
    "*.iml",
    ".vscode/*",
    "!.vscode/settings.json",
    "!.vscode/tasks.json",
    "!.vscode/launch.json",
    "!.vscode/extensions.json",
    ".angular/cache/**",
    ".sass-cache/**",
    "connect.lock",
    "coverage/**",
    "libpeerconnection.log",
    "npm-debug.log",
    "yarn-error.log",
    "testem.log",
    "typings/**",
    "e2e/**/*.js",
    "e2e/**/*.map",
    ".DS_Store",
    "Thumbs.db",
    ".gradle",
    "cypress/videos",
    "cypress/screenshots",
    "projects/**/*",
  ]),
  {
    files: ["src/**/*.ts"],
    extends: compat.extends(
      "plugin:@angular-eslint/recommended",
      "plugin:@angular-eslint/template/process-inline-templates"
    ),
    languageOptions: {
      parserOptions: {
        project: [
          "tsconfig.json"
        ]
      }
    },
    rules: {
      "@angular-eslint/component-selector": [
        "error",
        {
          "prefix": "home",
          "style": "kebab-case",
          "type": "element"
        }
      ],
      "@angular-eslint/directive-selector": [
        "error",
        {
          "prefix": "home",
          "style": "camelCase",
          "type": "attribute"
        }
      ],
      "@angular-eslint/prefer-standalone": "off",
      "@angular-eslint/prefer-inject": "off"
    },
  },
  {
    files: ["src/**/*.html"],
    extends: compat.extends(
      "plugin:@angular-eslint/template/recommended"
    ),
  }
]);
