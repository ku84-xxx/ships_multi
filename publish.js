// publish.js — buduje plik publikacyjny (index.html) ze źródła (statki.html).
// Minifikuje CSS i obfuskuje JS (terser), dzięki czemu kod nie jest czytelny,
// a gra nadal działa identycznie. Uruchomienie: npm run publish

const fs = require("fs");
const path = require("path");
const { minify } = require("terser");

function minifyCSS(css) {
  let out = "";
  let i = 0;
  const n = css.length;
  while (i < n) {
    const ch = css[i];
    if (ch === "/" && css[i + 1] === "*") {
      const end = css.indexOf("*/", i + 2);
      i = end === -1 ? n : end + 2;
      continue;
    }
    if (ch === '"' || ch === "'") {
      let j = i + 1;
      while (j < n && css[j] !== ch) {
        if (css[j] === "\\") j++;
        j++;
      }
      out += css.slice(i, j + 1);
      i = j + 1;
      continue;
    }
    if (/\s/.test(ch)) {
      let j = i;
      while (j < n && /\s/.test(css[j])) j++;
      const next = css[j];
      const prev = out[out.length - 1];
      if (prev && next && !/[{}:;,()]/.test(prev) && !/[{}:;,()]/.test(next)) out += " ";
      i = j;
      continue;
    }
    out += ch;
    i++;
  }
  return out;
}

async function main() {
  const src = fs.readFileSync(path.join(__dirname, "statki.html"), "utf8");

  const styleMatch = src.match(/<style>([\s\S]*?)<\/style>/);
  if (!styleMatch) throw new Error("nie znaleziono <style>");
  const css = minifyCSS(styleMatch[1]);

  const scripts = [...src.matchAll(/<script([^>]*)>([\s\S]*?)<\/script>/g)];
  const appScript = scripts.find(s => !/\ssrc=/.test(s[1]));
  if (!appScript) throw new Error("nie znaleziono inline <script>");

  const result = await minify(appScript[2], {
    compress: true,
    mangle: true,
    format: { comments: false },
  });
  if (result.error) throw result.error;
  const js = result.code.replace(/<\/script/gi, "<\\/script");
  // Łamię linie przy średnikach, max ~8KB — inaczej Pages legacy pada
  let wrapped = "";
  let pos = 0;
  while (pos < js.length) {
    if (pos + 7500 >= js.length) { wrapped += js.slice(pos); break; }
    let end = Math.min(pos + 7500, js.length);
    // szukaj ostatniego średnika w oknie, nie rozcinaj stringów
    let semi = js.lastIndexOf(";", end);
    if (semi > pos + 2000) end = semi + 1;
    wrapped += js.slice(pos, end) + "\n";
    pos = end;
  }

  let out = src.replace(/<style>[\s\S]*?<\/style>/, "<style>" + css + "</style>");
  const scriptStart = out.indexOf(appScript[0]);
  if (scriptStart === -1) throw new Error("nie znaleziono skryptu do podmiany");
  out = out.slice(0, scriptStart) + "<script>" + wrapped + "</script>" + out.slice(scriptStart + appScript[0].length);
  out = out.replace(/<!--[\s\S]*?-->/g, "");

  fs.writeFileSync(path.join(__dirname, "index.html"), out);
  fs.mkdirSync(path.join(__dirname, "docs"), { recursive: true });
  fs.writeFileSync(path.join(__dirname, "docs", "index.html"), out);

  const jsCheck = js.match(/\(\(\)=>\{[\s\S]*\}\)\(\);/);
  console.log("OK -> index.html + docs/index.html (" + (out.length / 1024).toFixed(1) + " kB)");
}

main().catch(err => {
  console.error("Błąd:", err.message);
  process.exit(1);
});
