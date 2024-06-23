import { parse } from "@std/jsonc";
import { filterValues } from "@std/collections";

async function readJson(path: string) {
  try {
    return await Deno.readTextFile(path);
  } catch (error) {
    if (!(error instanceof Deno.errors.NotFound)) {
      throw error;
    }
    return "";
  }
}

const json = await readJson("./deno.jsonc") || await readJson("./deno.json") ||
  "";

if (!json) {
  console.warn("[re-add] deno config file is not found.");
  Deno.exit(0);
}

const imports = parse(json).imports || {};

const targets = Object.keys(
  filterValues(imports, (item) => item.startsWith("jsr:")),
);

// console.log({ imports, targets });

if (!targets || targets.length === 0) {
  console.warn("[re-add] no jsr imports are found.");
  Deno.exit(0);
}

const args = ["add", ...targets];
console.log("[re-add] deno", args.join(" "));

const command = new Deno.Command(Deno.execPath(), { args });

const { code, stdout, stderr } = await command.output();
console.assert(code === 0);
console.log(new TextDecoder().decode(stdout));
console.log(new TextDecoder().decode(stderr));
console.log("done");
