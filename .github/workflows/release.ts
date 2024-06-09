/** install dependencies */

new Deno.Command("npm", {
  args: ["i", "-g", "typescript"],
  stdin: "inherit",
  stdout: "inherit",
  stderr: "inherit",
}).outputSync();

/** generate code */

try {
  Deno.removeSync("dist", { recursive: true });
} catch {}

Deno.mkdirSync("dist");

new Deno.Command("npx", {
  args: ["tsc", "-p", "tsconfig.json"],
  stdin: "inherit",
  stdout: "inherit",
  stderr: "inherit",
}).outputSync();

const indexdts = Deno.readTextFileSync("dist/index.d.ts");

Deno.writeTextFileSync(
  "dist/index.d.ts",
  indexdts.replace("types.ts", "types.d.ts"),
);

Deno.removeSync("dist/types.js");

/** copy metadata */

const { version } = JSON.parse(Deno.readTextFileSync("deno.json"));

const pkg = {
  "name": "@williamhorning/cloudlink",
  "version": version,
  "description": "A Cloudlink client written in Typescript",
  "type": "module",
  "main": "index.js",
  "types": "index.d.ts",
  "repository": {
    "type": "git",
    "url": "git+https://github.com/williamhorning/cloudlink.git"
  },
  "optionalDependencies": {
    "ws": "^8.13.0"
  },
  "scripts": {}
}

Deno.writeTextFileSync("dist/package.json", JSON.stringify(pkg, null, 2));

Deno.copyFileSync("README.md", "dist/README.md");
Deno.copyFileSync("LICENSE", "dist/LICENSE");
Deno.copyFileSync("logo.svg", "dist/logo.svg");

/** publish to npm */

new Deno.Command("npm", {
  args: ["publish", "--access", "public"],
  cwd: "dist",
  stdin: "inherit",
  stdout: "inherit",
  stderr: "inherit",
  env: {
    NPM_TOKEN: Deno.env.get("NPM_TOKEN") || "",
  }
}).outputSync();
