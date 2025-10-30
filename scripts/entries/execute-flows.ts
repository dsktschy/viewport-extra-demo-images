import path from "node:path";
import { parseArgs } from "node:util";
import { globby } from "globby";
import { chromium, devices } from "playwright";
import constants from "../../constants.json" with { type: "json" };
import type { Flow } from "../internal/Flow.ts";

const { positionals: flowGlobPathList } = parseArgs({
  allowPositionals: true,
});
const browser = await chromium.launch();
const flowModulePathList = await globby(flowGlobPathList, {
  expandDirectories: true,
});
const cwd = process.cwd();
const { FLOWS_DIRECTORY } = constants;
await Promise.all(
  flowModulePathList.map((flowModulePath) => {
    const { dir, name } = path.parse(
      path.relative(cwd, flowModulePath).replace(FLOWS_DIRECTORY, ""),
    );
    return (
      import(
        `./${path.relative(import.meta.dirname, flowModulePath)}`
      ) as Promise<Flow>
    ).then(({ execute }) =>
      execute({
        browser,
        devices,
        flowName: path.join(dir, name),
        constants,
      }),
    );
  }),
);
await browser.close();
