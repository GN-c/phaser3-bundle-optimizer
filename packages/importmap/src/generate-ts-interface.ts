import ts, { factory } from "typescript";

export function GenerateTSInterface(
  globalChecks: Set<string>,
  importMap: Record<string, string | object>
) {
  const _interface = factory.createInterfaceDeclaration(
    [factory.createToken(ts.SyntaxKind.ExportKeyword)],
    factory.createIdentifier("ImportMap"),
    undefined,
    undefined,
    importMapToTS(importMap)
  );

  /**
   * Save TS stuff as string
   */
  const resultFile = ts.createSourceFile(
    "_.ts",
    "",
    ts.ScriptTarget.Latest,
    false,
    ts.ScriptKind.TS
  );
  const printer = ts.createPrinter({ newLine: ts.NewLineKind.LineFeed });

  const result = printer.printNode(
    ts.EmitHint.Unspecified,
    _interface,
    resultFile
  );

  return result;
}

/**
 * Convert Import Map to TS property signatures
 */
function importMapToTS(
  importMap: Record<string, string | object>
): ts.PropertySignature[] {
  return Object.entries(importMap).map(([key, value]) =>
    factory.createPropertySignature(
      undefined,
      factory.createIdentifier(key),
      factory.createToken(ts.SyntaxKind.QuestionToken),
      typeof value == "string"
        ? factory.createKeywordTypeNode(ts.SyntaxKind.BooleanKeyword)
        : factory.createUnionTypeNode([
            factory.createKeywordTypeNode(ts.SyntaxKind.BooleanKeyword),
            factory.createTypeLiteralNode(
              importMapToTS(value as Record<string, string | object>)
            ),
          ])
    )
  );
}
