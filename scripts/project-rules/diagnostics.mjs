export function createDiagnostic({ ruleName, filePath, position, message }) {
  return {
    filePath,
    message,
    position,
    ruleName,
  };
}

export function compareDiagnostics(left, right) {
  return (
    left.filePath.localeCompare(right.filePath) ||
    left.position - right.position ||
    left.ruleName.localeCompare(right.ruleName) ||
    left.message.localeCompare(right.message)
  );
}

export function formatDiagnostic(context, diagnostic) {
  const sourceFile = context.sourceFileByPath.get(diagnostic.filePath);

  if (sourceFile === undefined) {
    return `${diagnostic.filePath}:1:1 ${diagnostic.ruleName}: ${diagnostic.message}`;
  }

  const location = sourceFile.getLineAndCharacterOfPosition(diagnostic.position);
  return `${diagnostic.filePath}:${location.line + 1}:${location.character + 1} ${diagnostic.ruleName}: ${diagnostic.message}`;
}
