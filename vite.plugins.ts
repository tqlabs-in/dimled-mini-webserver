import type { Plugin } from "vite";

export function minfifyAnuTemplate(): Plugin {
  return {
    name: "vite:comment-html-template-minify",
    enforce: "pre",
    transform(code, id) {
      if (!id.endsWith(".ts") && !id.endsWith(".js")) return null;

      const lines = code.split(/\r?\n/);
      const output: string[] = [];

      let collecting = false;
      let buffer: string[] = [];

      for (const line of lines) {
        if (/\/\/\s*@minify-template-start/.test(line)) {
          collecting = true;
          buffer = [];
          output.push(line); // keep the comment
          continue;
        }

        if (/\/\/\s*@minify-template-end/.test(line)) {
          collecting = false;
          const tpl = buffer.join("\n");
          const minified = tpl
            .replace(/(\r\n|\n|\r)/g, "")
            .replace(/\s{2,}/g, " ");
          output.push(minified);
          output.push(line); // keep the end comment
          buffer = [];
          continue;
        }

        if (collecting) {
          buffer.push(line);
        } else {
          output.push(line);
        }
      }

      return { code: output.join("\n"), map: null };
    },
  };
}
