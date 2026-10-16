import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
const errors = [];
async function visit(dir) {
  for (const item of await readdir(dir, { withFileTypes: true })) {
    const p = path.join(dir, item.name);
    if (item.isDirectory()) await visit(p);
    else if (/\.(tsx?|css)$/.test(item.name)) {
      const text = await readFile(p, "utf8");
      if (/\beval\s*\(|\bnew Function\s*\(/.test(text))
        errors.push(p + ": dynamic code evaluation");
      if (/console\.(log|debug|info)\(/.test(text))
        errors.push(p + ": unexpected runtime logging");
      if (
        p.includes("components") &&
        /process\.env\.HALO_(SUPABASE|RATE_LIMIT)/.test(text)
      )
        errors.push(p + ": server binding in client component");
      if (/href=["']#["']/.test(text))
        errors.push(p + ": empty navigation target");
      if (/\bLorem ipsum\b/.test(text))
        errors.push(p + ": placeholder body copy");
    }
  }
}
await visit("src");
if (errors.length) {
  console.error(errors.join("\n"));
  process.exit(1);
}
console.log(
  "Lint passed: source/security conventions, no client secrets, empty links, runtime logs, or filler.",
);
