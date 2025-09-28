import path from "node:path";
import { parseArgs } from "node:util";
import { globby } from "globby";
import constants from "../../constants.json" with { type: "json" };

const { positionals: flowGlobPathList } = parseArgs({
  allowPositionals: true,
});
const flowModulePathList = await globby(flowGlobPathList, {
  expandDirectories: true,
});
const cwd = process.cwd();
const { FLOWS_DIRECTORY } = constants;
const flowNameList = flowModulePathList.map((flowModulePath) => {
  const { dir, name } = path.parse(
    path.relative(cwd, flowModulePath).replace(FLOWS_DIRECTORY, ""),
  );
  return path.join(dir, name);
});
process.stdout.write(`${flowNameList.join(" ")}\n`);
