import { describe, expect, test } from 'vitest';
import { compareDiagnostics, createDiagnostic, formatDiagnostic } from '../diagnostics.mjs';

describe('project-rules diagnostics', () => {
  test('creates a diagnostic object', () => {
    expect(
      createDiagnostic({
        filePath: 'src/example.ts',
        message: 'Example failure.',
        position: 12,
        ruleName: 'example/rule',
      }),
    ).toEqual({
      filePath: 'src/example.ts',
      message: 'Example failure.',
      position: 12,
      ruleName: 'example/rule',
    });
  });

  test('sorts diagnostics by file, position, rule name, then message', () => {
    const diagnostics = [
      createDiagnostic({ filePath: 'src/b.ts', message: 'b', position: 1, ruleName: 'rule/a' }),
      createDiagnostic({ filePath: 'src/a.ts', message: 'c', position: 2, ruleName: 'rule/a' }),
      createDiagnostic({ filePath: 'src/a.ts', message: 'a', position: 1, ruleName: 'rule/b' }),
      createDiagnostic({ filePath: 'src/a.ts', message: 'b', position: 1, ruleName: 'rule/a' }),
      createDiagnostic({ filePath: 'src/a.ts', message: 'a', position: 1, ruleName: 'rule/a' }),
    ];

    expect(diagnostics.sort(compareDiagnostics)).toEqual([
      createDiagnostic({ filePath: 'src/a.ts', message: 'a', position: 1, ruleName: 'rule/a' }),
      createDiagnostic({ filePath: 'src/a.ts', message: 'b', position: 1, ruleName: 'rule/a' }),
      createDiagnostic({ filePath: 'src/a.ts', message: 'a', position: 1, ruleName: 'rule/b' }),
      createDiagnostic({ filePath: 'src/a.ts', message: 'c', position: 2, ruleName: 'rule/a' }),
      createDiagnostic({ filePath: 'src/b.ts', message: 'b', position: 1, ruleName: 'rule/a' }),
    ]);
  });

  test('formats diagnostics with source locations', () => {
    const context = {
      sourceFileByPath: new Map([
        [
          'src/example.ts',
          {
            getLineAndCharacterOfPosition(position) {
              expect(position).toBe(12);
              return { character: 4, line: 2 };
            },
          },
        ],
      ]),
    };

    expect(
      formatDiagnostic(
        context,
        createDiagnostic({
          filePath: 'src/example.ts',
          message: 'Example failure.',
          position: 12,
          ruleName: 'example/rule',
        }),
      ),
    ).toBe('src/example.ts:3:5 example/rule: Example failure.');
  });

  test('formats diagnostics with fallback location when source file is missing', () => {
    const context = { sourceFileByPath: new Map() };

    expect(
      formatDiagnostic(
        context,
        createDiagnostic({
          filePath: 'src/missing.ts',
          message: 'Missing source file.',
          position: 99,
          ruleName: 'example/rule',
        }),
      ),
    ).toBe('src/missing.ts:1:1 example/rule: Missing source file.');
  });
});
