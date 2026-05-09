import { DocNodeKind, TSDocParser } from '@microsoft/tsdoc';
import { createDiagnostic } from '../diagnostics.mjs';

const CODE_FENCE_PATTERN = /^```/;
const IGNORED_TSDOC_MESSAGE_IDS = new Set(['tsdoc-missing-deprecation-message']);
const JSDOC_START = '/**';
const LEADING_STAR_PATTERN = /^\s*\*\s?/;
const MODIFIER_TAG_NAMES = new Set([
  '@alpha',
  '@beta',
  '@eventProperty',
  '@experimental',
  '@internal',
  '@override',
  '@public',
  '@readonly',
  '@sealed',
  '@virtual',
]);
const THROWS_BARE_LINK_PATTERN = /^@throws\s*\{@link/;
const TRAILING_COMMENT_PATTERN = /\*\/\s*$/;
const RUN_OF_WHITESPACE_PATTERN = /\s+/g;
const SUMMARY_END_PATTERN = /[.!?)]$/;
const TSDOC_PARSER = new TSDocParser();

function docCommentForItem(context, item) {
  const fullText = item.sourceFile.getFullText();
  const ranges = context.ts.getLeadingCommentRanges(fullText, item.declaration.getFullStart()) ?? [];
  const jsdocRanges = ranges.filter(
    (commentRange) => fullText.slice(commentRange.pos, commentRange.pos + JSDOC_START.length) === JSDOC_START,
  );
  const docRange = jsdocRanges.at(-1);

  if (docRange === undefined) {
    return null;
  }

  return {
    position: docRange.pos,
    text: fullText.slice(docRange.pos, docRange.end),
  };
}

function parsedDocComment(context, item) {
  const comment = docCommentForItem(context, item);

  if (comment === null) {
    return null;
  }

  return {
    comment,
    parserContext: TSDOC_PARSER.parseString(comment.text),
  };
}

function declarationPosition(item) {
  return item.declaration.getStart(item.sourceFile);
}

function renderedNodeText(node) {
  switch (node.kind) {
    case DocNodeKind.CodeSpan:
    case DocNodeKind.FencedCode:
    case DocNodeKind.PlainText:
    case DocNodeKind.ErrorText:
      return node.text ?? node.code;
    case DocNodeKind.EscapedText:
      return node.decodedText;
    case DocNodeKind.LinkTag:
      return node.linkText ?? node.urlDestination ?? node.codeDestination?.emitAsTsdoc() ?? '';
    case DocNodeKind.SoftBreak:
      return ' ';
    case DocNodeKind.Excerpt:
      return '';
    default:
      return node
        .getChildNodes()
        .map((childNode) => renderedNodeText(childNode))
        .join('');
  }
}

function sectionText(section) {
  return renderedNodeText(section).replaceAll(RUN_OF_WHITESPACE_PATTERN, ' ').trim();
}

function hasExampleBlock(docComment) {
  return docComment.customBlocks.some((block) => block.blockTag.tagName === '@example');
}

function syntaxDiagnostics(context) {
  return context.publicApiItems.flatMap((item) => {
    const parsed = parsedDocComment(context, item);

    if (parsed === null) {
      return [];
    }

    return parsed.parserContext.log.messages
      .filter((message) => !IGNORED_TSDOC_MESSAGE_IDS.has(message.messageId))
      .map((message) =>
        createDiagnostic({
          filePath: item.filePath,
          message: `TSDoc syntax error for public API "${item.symbolName}": ${message.unformattedText}`,
          position: parsed.comment.position + message.textRange.pos,
          ruleName: 'tsdoc/syntax',
        }),
      );
  });
}

function requiredPublicSummaryDiagnostics(context) {
  return context.publicApiItems.flatMap((item) => {
    const parsed = parsedDocComment(context, item);

    if (parsed === null) {
      return [
        createDiagnostic({
          filePath: item.filePath,
          message: `Public API "${item.symbolName}" needs a TSDoc summary.`,
          position: declarationPosition(item),
          ruleName: 'tsdoc/required-public-summary',
        }),
      ];
    }

    const summary = sectionText(parsed.parserContext.docComment.summarySection);

    if (summary.length === 0) {
      return [
        createDiagnostic({
          filePath: item.filePath,
          message: `Public API "${item.symbolName}" needs non-empty TSDoc summary text.`,
          position: parsed.comment.position,
          ruleName: 'tsdoc/required-public-summary',
        }),
      ];
    }

    return [];
  });
}

function summaryStyleDiagnostics(context) {
  return context.publicApiItems.flatMap((item) => {
    const parsed = parsedDocComment(context, item);

    if (parsed === null) {
      return [];
    }

    const summary = sectionText(parsed.parserContext.docComment.summarySection);

    if (summary.length === 0 || SUMMARY_END_PATTERN.test(summary)) {
      return [];
    }

    return [
      createDiagnostic({
        filePath: item.filePath,
        message: `TSDoc summary for public API "${item.symbolName}" must end with punctuation.`,
        position: parsed.comment.position,
        ruleName: 'tsdoc/summary-style',
      }),
    ];
  });
}

function deprecatedReasonDiagnostics(context) {
  return context.publicApiItems.flatMap((item) => {
    const parsed = parsedDocComment(context, item);

    if (parsed === null) {
      return [];
    }

    const deprecatedBlock = parsed.parserContext.docComment.deprecatedBlock;

    if (deprecatedBlock === undefined || sectionText(deprecatedBlock.content).length > 0) {
      return [];
    }

    return [
      createDiagnostic({
        filePath: item.filePath,
        message: `@deprecated on public API "${item.symbolName}" must explain the reason or replacement.`,
        position: parsed.comment.position,
        ruleName: 'tsdoc/deprecated-reason',
      }),
    ];
  });
}

function commentContentLines(commentText) {
  const inner = commentText.slice(JSDOC_START.length).replace(TRAILING_COMMENT_PATTERN, '');
  return inner.split('\n').map((line) => line.replace(LEADING_STAR_PATTERN, '').trimEnd());
}

function releaseTagDiagnostics(context) {
  return context.sourceDefinitions.flatMap((item) => {
    if (!item.exported) {
      return [];
    }

    const parsed = parsedDocComment(context, item);

    if (parsed === null) {
      return [
        createDiagnostic({
          filePath: item.filePath,
          message: `"${item.name}" needs a TSDoc block with a release tag (@public, @alpha, or @internal).`,
          position: declarationPosition(item),
          ruleName: 'tsdoc/release-tag',
        }),
      ];
    }

    const modifiers = parsed.parserContext.docComment.modifierTagSet;
    const tagCount = [modifiers.isPublic(), modifiers.isAlpha(), modifiers.isInternal()].filter(Boolean).length;

    if (tagCount === 0) {
      return [
        createDiagnostic({
          filePath: item.filePath,
          message: `"${item.name}" needs a release tag (@public, @alpha, or @internal).`,
          position: parsed.comment.position,
          ruleName: 'tsdoc/release-tag',
        }),
      ];
    }

    if (tagCount > 1) {
      return [
        createDiagnostic({
          filePath: item.filePath,
          message: `"${item.name}" has multiple release tags. Use exactly one of @public, @alpha, or @internal.`,
          position: parsed.comment.position,
          ruleName: 'tsdoc/release-tag',
        }),
      ];
    }

    return [];
  });
}

function publicApiExportDiagnostics(context) {
  return context.sourceDefinitions.flatMap((item) => {
    const parsed = parsedDocComment(context, item);

    if (parsed === null) {
      return [];
    }

    const modifiers = parsed.parserContext.docComment.modifierTagSet;

    if (!modifiers.isPublic() && !modifiers.isAlpha()) {
      return [];
    }

    const key = `${item.filePath}:${item.name}`;

    if (context.publicApiNameSet.has(key)) {
      return [];
    }

    const tag = modifiers.isPublic() ? '@public' : '@alpha';

    return [
      createDiagnostic({
        filePath: item.filePath,
        message: `"${item.name}" is tagged ${tag} but is not exported from ${context.entrypoint}.`,
        position: parsed.comment.position,
        ruleName: 'tsdoc/public-api-export',
      }),
    ];
  });
}

function containsDirectThrow(tsModule, node) {
  if (tsModule.isThrowStatement(node)) {
    return true;
  }

  if (
    tsModule.isFunctionDeclaration(node) ||
    tsModule.isFunctionExpression(node) ||
    tsModule.isArrowFunction(node) ||
    tsModule.isMethodDeclaration(node)
  ) {
    return false;
  }

  return tsModule.forEachChild(node, (child) => containsDirectThrow(tsModule, child)) ?? false;
}

function containsLinkTag(node) {
  if (node.kind === DocNodeKind.LinkTag) {
    return true;
  }

  for (const child of node.getChildNodes()) {
    if (containsLinkTag(child)) {
      return true;
    }
  }

  return false;
}

function throwsHasBareLinkStart(commentText) {
  return commentContentLines(commentText).some((line) => THROWS_BARE_LINK_PATTERN.test(line.trim()));
}

function throwsDiagnostics(context) {
  return context.sourceDefinitions.flatMap((item) => {
    if (!context.ts.isFunctionDeclaration(item.declaration) || item.declaration.body === undefined) {
      return [];
    }

    const hasThrow =
      context.ts.forEachChild(item.declaration.body, (child) => containsDirectThrow(context.ts, child)) ?? false;

    if (!hasThrow) {
      return [];
    }

    const parsed = parsedDocComment(context, item);

    if (parsed === null) {
      return [
        createDiagnostic({
          filePath: item.filePath,
          message: `"${item.name}" contains a throw statement but has no @throws documentation with {@link}.`,
          position: declarationPosition(item),
          ruleName: 'tsdoc/throws',
        }),
      ];
    }

    const throwsBlocks = parsed.parserContext.docComment.customBlocks.filter(
      (block) => block.blockTag.tagName === '@throws',
    );
    const hasLinkedThrows = throwsBlocks.some((block) => containsLinkTag(block.content));

    if (!hasLinkedThrows) {
      return [
        createDiagnostic({
          filePath: item.filePath,
          message: `"${item.name}" contains a throw statement but has no @throws documentation with {@link}.`,
          position: parsed.comment.position,
          ruleName: 'tsdoc/throws',
        }),
      ];
    }

    if (throwsHasBareLinkStart(parsed.comment.text)) {
      return [
        createDiagnostic({
          filePath: item.filePath,
          message: `@throws in "${item.name}" needs descriptive text before {@link}, e.g. "@throws Throws {@link Error} when ...".`,
          position: parsed.comment.position,
          ruleName: 'tsdoc/throws',
        }),
      ];
    }

    return [];
  });
}

function modifierTagLastLineDiagnostics(context) {
  return context.sourceDefinitions.flatMap((item) => {
    const parsed = parsedDocComment(context, item);

    if (parsed === null) {
      return [];
    }

    const modifierNodes = parsed.parserContext.docComment.modifierTagSet.nodes;

    if (modifierNodes.length === 0) {
      return [];
    }

    const lines = commentContentLines(parsed.comment.text);
    let inCodeFence = false;
    let foundModifier = false;
    let hasContentAfterModifier = false;

    for (const line of lines) {
      const trimmed = line.trim();

      if (CODE_FENCE_PATTERN.test(trimmed)) {
        inCodeFence = !inCodeFence;
        if (foundModifier) {
          hasContentAfterModifier = true;
        }
        continue;
      }

      if (inCodeFence) {
        if (foundModifier) {
          hasContentAfterModifier = true;
        }
        continue;
      }

      if (trimmed.length === 0) {
        continue;
      }

      if (MODIFIER_TAG_NAMES.has(trimmed)) {
        foundModifier = true;
      } else if (foundModifier) {
        hasContentAfterModifier = true;
      }
    }

    if (!hasContentAfterModifier) {
      return [];
    }

    return [
      createDiagnostic({
        filePath: item.filePath,
        message: `Modifier tags in "${item.name}" must appear on the last line of the TSDoc block.`,
        position: parsed.comment.position,
        ruleName: 'tsdoc/modifier-tag-last-line',
      }),
    ];
  });
}

function isPublicFunction(context, item) {
  return context.ts.isFunctionDeclaration(item.declaration);
}

function publicFunctionExampleDiagnostics(context) {
  return context.publicApiItems.flatMap((item) => {
    if (!isPublicFunction(context, item)) {
      return [];
    }

    const parsed = parsedDocComment(context, item);

    if (parsed === null || hasExampleBlock(parsed.parserContext.docComment)) {
      return [];
    }

    return [
      createDiagnostic({
        filePath: item.filePath,
        message: `Public function "${item.symbolName}" needs an @example block.`,
        position: parsed.comment.position,
        ruleName: 'tsdoc/public-function-example',
      }),
    ];
  });
}

export const tsdocRules = [
  {
    check: syntaxDiagnostics,
    name: 'tsdoc/syntax',
  },
  {
    check: requiredPublicSummaryDiagnostics,
    name: 'tsdoc/required-public-summary',
  },
  {
    check: summaryStyleDiagnostics,
    name: 'tsdoc/summary-style',
  },
  {
    check: deprecatedReasonDiagnostics,
    name: 'tsdoc/deprecated-reason',
  },
  {
    check: publicFunctionExampleDiagnostics,
    name: 'tsdoc/public-function-example',
  },
  {
    check: releaseTagDiagnostics,
    name: 'tsdoc/release-tag',
  },
  {
    check: publicApiExportDiagnostics,
    name: 'tsdoc/public-api-export',
  },
  {
    check: throwsDiagnostics,
    name: 'tsdoc/throws',
  },
  {
    check: modifierTagLastLineDiagnostics,
    name: 'tsdoc/modifier-tag-last-line',
  },
];
