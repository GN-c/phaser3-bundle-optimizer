import fg from "fast-glob";
import acorn from "acorn";
import * as fs from "fs";
import path from "path";

/**
 * Go Through all phaser files and read statements `if(typeof ?)`
 */
export function ExtractGlobalChecks() {
  const defines = new Set<string>();
  /**
   * Go Through All JS Files in phaser repo
   */
  for (const file of fg.globSync("**/*.js", {
    ignore: ["phaser-*.js"],
    absolute: true,
    cwd: path.dirname(require.resolve("phaser")),
  })) {
    /**
     * Read & Parse
     */
    for (const node of acorn.parse(
      fs.readFileSync(file, {
        encoding: "utf-8",
      }),
      { ecmaVersion: "latest" }
    ).body)
      if (
        node.type == "IfStatement" &&
        node.test.type == "UnaryExpression" &&
        node.test.operator == "typeof"
      )
        defines.add((node.test.argument as acorn.Identifier).name);
  }

  return defines;
}
