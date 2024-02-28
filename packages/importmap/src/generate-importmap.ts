import acorn from "acorn";
import * as fs from "fs";
import path from "path";

const PHASER_ROOT = path.dirname(require.resolve("phaser"));

/**
 * Generate Phaser Import Map by Processing every module recursively starting from entry phaser module
 */
export function GenerateImportMap() {
  return processModule(require.resolve("phaser")) as Record<
    string,
    string | object
  >;
}

/**
 * Recursively process Module at given path
 */
function processModule(modulePath: string): string | object {
  /** */
  modulePath = require.resolve(modulePath);

  /**
   * Read & Parse
   */
  const ast = acorn.parse(
    fs.readFileSync(modulePath, {
      encoding: "utf-8",
    }),
    { ecmaVersion: "latest" }
  );

  /**
   * Find Exported Expression in file
   */
  let _export = findExportedExpression(ast);

  /**
   * Search For Declaration Expression if it's Identifier
   */
  if (_export?.type == "Identifier") _export = findDeclaration(ast, _export);

  /**
   * Process exported Object Expression
   */
  if (_export?.type == "ObjectExpression") {
    const objectExpression =
      /**
       * Process Object Expression or return module directly
       */
      processObjectExpression(_export, path.dirname(modulePath));

    if (objectExpression) return objectExpression;
  }

  /**
   * Return module relative path to phaser lib root
   */
  return path.relative(PHASER_ROOT, modulePath).replaceAll(path.sep, "/");
}

/**
 * Process & resolve Object expression
 */
function processObjectExpression(
  node: acorn.ObjectExpression,
  moduleDir: string
) {
  const result: Record<string, ReturnType<typeof processModule>> = {};
  /**
   * Loop Through Each property
   */
  for (const { key, value } of node.properties as acorn.Property[]) {
    const importName = (key as acorn.Identifier).name;
    if (
      /**
       * filter `.require` expressions
       */
      value.type == "CallExpression" &&
      value.callee.type == "Identifier" &&
      value.callee.name == "require"
    ) {
      result[importName] = processModule(
        path.join(
          moduleDir,
          (value.arguments[0] as acorn.Literal).value as string
        )
      );
      /**
       * Filter nested object
       */
    } else if (value.type == "ObjectExpression") {
      const _result = processObjectExpression(value, moduleDir);
      if (_result) result[importName] = _result;
    }
  }

  if (Object.keys(result).length) return result;
}

/**
 * Find exported identifier in file
 * Basically `module.exports = ?`
 */
function findExportedExpression(ast: acorn.Program) {
  for (const node of ast.body)
    if (
      node.type == "ExpressionStatement" &&
      node.expression.type == "AssignmentExpression" &&
      node.expression.left.type == "MemberExpression" &&
      node.expression.left.object.type == "Identifier" &&
      node.expression.left.object.name == "module"
    )
      return node.expression.right;
}

/**
 * Find variable declaration in AST
 */
function findDeclaration(ast: acorn.Program, identifier: acorn.Identifier) {
  for (const node of ast.body)
    if (node.type == "VariableDeclaration")
      for (const declaration of node.declarations)
        if (
          declaration.id.type == "Identifier" &&
          declaration.id.name == identifier.name
        )
          return declaration.init!;
}
