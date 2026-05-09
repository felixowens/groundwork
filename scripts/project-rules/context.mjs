import { readFileSync } from 'node:fs';
import { relative, resolve, sep } from 'node:path';
import ts from 'typescript';

function normalizePath(path) {
  return path.split(sep).join('/');
}

function readTsConfig(cwd, tsconfigPath) {
  const absoluteConfigPath = resolve(cwd, tsconfigPath);
  const configFile = ts.readConfigFile(absoluteConfigPath, (filePath) => readFileSync(filePath, 'utf8'));

  if (configFile.error !== undefined) {
    const message = ts.flattenDiagnosticMessageText(configFile.error.messageText, '\n');
    throw new Error(`Could not read ${tsconfigPath}: ${message}`);
  }

  const parsed = ts.parseJsonConfigFileContent(configFile.config, ts.sys, cwd);

  if (parsed.errors.length > 0) {
    const messages = parsed.errors.map((error) => ts.flattenDiagnosticMessageText(error.messageText, '\n'));
    throw new Error(`Could not parse ${tsconfigPath}: ${messages.join('\n')}`);
  }

  return parsed;
}

function declarationName(declaration, fallbackName) {
  if ('name' in declaration && declaration.name !== undefined) {
    return declaration.name.getText();
  }

  return fallbackName;
}

function exportedSymbol(checker, symbol) {
  if ((symbol.flags & ts.SymbolFlags.Alias) === 0) {
    return symbol;
  }

  return checker.getAliasedSymbol(symbol);
}

function publicApiItems(program, checker, cwd, entrypoint) {
  const absoluteEntrypoint = resolve(cwd, entrypoint);
  const entrySourceFile = program.getSourceFile(absoluteEntrypoint);

  if (entrySourceFile === undefined) {
    throw new Error(`Could not find public API entrypoint: ${entrypoint}`);
  }

  const moduleSymbol = checker.getSymbolAtLocation(entrySourceFile);

  if (moduleSymbol === undefined) {
    return [];
  }

  return checker.getExportsOfModule(moduleSymbol).flatMap((symbol) => {
    const resolvedSymbol = exportedSymbol(checker, symbol);
    const declarations = resolvedSymbol.declarations ?? [];

    return declarations.map((declaration) => {
      const sourceFile = declaration.getSourceFile();
      const filePath = normalizePath(relative(cwd, sourceFile.fileName));
      const name = declarationName(declaration, symbol.getName());

      return {
        declaration,
        filePath,
        name,
        sourceFile,
        symbolName: symbol.getName(),
      };
    });
  });
}

function isExportedStatement(statement) {
  return statement.modifiers?.some((modifier) => modifier.kind === ts.SyntaxKind.ExportKeyword) ?? false;
}

function definitionNames(statement) {
  if (
    ts.isFunctionDeclaration(statement) ||
    ts.isInterfaceDeclaration(statement) ||
    ts.isTypeAliasDeclaration(statement) ||
    ts.isClassDeclaration(statement) ||
    ts.isEnumDeclaration(statement)
  ) {
    return statement.name === undefined ? [] : [statement.name.getText()];
  }

  if (ts.isVariableStatement(statement)) {
    return statement.declarationList.declarations
      .filter((decl) => ts.isIdentifier(decl.name))
      .map((decl) => decl.name.getText());
  }

  return [];
}

function sourceDefinitionItems(program, cwd) {
  return program
    .getSourceFiles()
    .filter((sourceFile) => !sourceFile.isDeclarationFile)
    .flatMap((sourceFile) => {
      const filePath = normalizePath(relative(cwd, sourceFile.fileName));

      return sourceFile.statements.flatMap((statement) => {
        const exported = isExportedStatement(statement);
        return definitionNames(statement).map((name) => ({
          declaration: statement,
          exported,
          filePath,
          name,
          sourceFile,
        }));
      });
    });
}

function sourceFileMap(program, cwd) {
  return new Map(
    program
      .getSourceFiles()
      .filter((sourceFile) => !sourceFile.isDeclarationFile)
      .map((sourceFile) => [normalizePath(relative(cwd, sourceFile.fileName)), sourceFile]),
  );
}

export function createProjectContext({
  cwd = process.cwd(),
  entrypoint = 'src/index.ts',
  tsconfigPath = 'tsconfig.build.json',
} = {}) {
  const parsedConfig = readTsConfig(cwd, tsconfigPath);
  const program = ts.createProgram(parsedConfig.fileNames, parsedConfig.options);
  const checker = program.getTypeChecker();

  const publicApi = publicApiItems(program, checker, cwd, entrypoint);
  const publicApiNameSet = new Set(publicApi.map((item) => `${item.filePath}:${item.name}`));

  return {
    checker,
    cwd,
    entrypoint,
    program,
    publicApiItems: publicApi,
    publicApiNameSet,
    sourceDefinitions: sourceDefinitionItems(program, cwd),
    sourceFileByPath: sourceFileMap(program, cwd),
    ts,
  };
}
