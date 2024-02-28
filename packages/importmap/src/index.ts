import * as fs from "fs";
import path from "path";
import { GenerateImportMap } from "./generate-importmap";
import { ExtractGlobalChecks } from "./extract-global-checks";
import { GenerateTSInterface } from "./generate-ts-interface";

const globalChecks = ExtractGlobalChecks();
const importMap = GenerateImportMap();

const importMapInterface = GenerateTSInterface(globalChecks, importMap);

fs.writeFileSync(
  path.resolve(__dirname, "../out/importMap.json"),
  JSON.stringify(importMap, undefined, 1)
);

fs.writeFileSync(
  path.resolve(__dirname, "../out/importMap.ts"),
  importMapInterface
);
