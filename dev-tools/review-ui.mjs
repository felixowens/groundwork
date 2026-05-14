import { spawn } from 'node:child_process';
import { mkdir, rm, writeFile } from 'node:fs/promises';
import { chromium } from '@playwright/test';

const outputDirectory = '.logs/ui-review/latest';
const baseUrl = 'http://127.0.0.1:4321';

function delay(milliseconds) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

async function waitForServer(url, deadline = Date.now() + 30_000) {
  if (Date.now() >= deadline) {
    throw new Error(`Timed out waiting for ${url}`);
  }

  try {
    const response = await fetch(url);
    if (response.ok) {
      return;
    }
  } catch {
    // Server is still starting.
  }

  await delay(250);
  return waitForServer(url, deadline);
}

function startDocsServer() {
  const child = spawn('npm', ['run', 'docs:dev', '--', '--host', '127.0.0.1'], {
    stdio: ['ignore', 'pipe', 'pipe'],
  });

  child.stdout.on('data', () => {});
  child.stderr.on('data', (chunk) => process.stderr.write(chunk));

  return child;
}

async function capturePage(page, path, filename) {
  await page.goto(`${baseUrl}${path}`);
  await page.screenshot({ path: `${outputDirectory}/${filename}`, fullPage: true });

  return page.evaluate(() => ({
    path: window.location.pathname,
    width: document.documentElement.clientWidth,
    scrollWidth: document.documentElement.scrollWidth,
    hasHorizontalOverflow: document.documentElement.scrollWidth > document.documentElement.clientWidth,
  }));
}

function listMetrics(page) {
  return page.locator('ol, ul').evaluateAll((lists) =>
    lists.map((list) => {
      const rect = list.getBoundingClientRect();
      const styles = getComputedStyle(list);

      return {
        tagName: list.tagName.toLowerCase(),
        className: list.className,
        left: Math.round(rect.left),
        paddingLeft: styles.paddingLeft,
        listStylePosition: styles.listStylePosition,
      };
    }),
  );
}

function interactiveCardMetrics(page) {
  return page.locator('.gw-card--interactive').evaluateAll((cards) =>
    cards.map((card) => {
      const styles = getComputedStyle(card);
      const tagName = card.tagName.toLowerCase();
      const role = card.getAttribute('role');
      const isActionableElement = tagName === 'a' || tagName === 'button';
      const hasActionableRole = role === 'link' || role === 'button';

      return {
        tagName,
        className: card.className,
        role,
        cursor: styles.cursor,
        text: card.textContent?.trim().slice(0, 80),
        isPointerOnActionableElement: styles.cursor !== 'pointer' || isActionableElement || hasActionableRole,
      };
    }),
  );
}

function stackMetrics(page) {
  return page.locator('.gw-stack, .gw-stack--sm, .gw-stack--lg, .gw-stack--xl').evaluateAll((stacks) => {
    const expectedGapByClass = [
      ['gw-stack--sm', 8],
      ['gw-stack--lg', 32],
      ['gw-stack--xl', 48],
      ['gw-stack', 16],
    ];

    function expectedGap(element) {
      const match = expectedGapByClass.find(([className]) => element.classList.contains(String(className)));
      return match === undefined ? 16 : Number(match[1]);
    }

    function visibleBox(element) {
      const styles = getComputedStyle(element);

      if (styles.display === 'none' || styles.visibility === 'hidden') {
        return;
      }

      const rect = element.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0) {
        return {
          top: rect.top,
          bottom: rect.bottom,
        };
      }

      const descendantBoxes = Array.from(element.querySelectorAll('*'))
        .map((descendant) => visibleBox(descendant))
        .filter((box) => box !== undefined);

      if (descendantBoxes.length === 0) {
        return;
      }

      return {
        top: Math.min(...descendantBoxes.map((box) => box.top)),
        bottom: Math.max(...descendantBoxes.map((box) => box.bottom)),
      };
    }

    const violations = [];

    for (const stack of stacks) {
      const children = Array.from(stack.children)
        .map((element) => ({ element, box: visibleBox(element) }))
        .filter((entry) => entry.box !== undefined);
      const minimumGap = expectedGap(stack);

      for (let index = 1; index < children.length; index += 1) {
        const previous = children[index - 1];
        const current = children[index];
        const gap = current.box.top - previous.box.bottom;

        if (gap < minimumGap - 1) {
          violations.push({
            stackClassName: stack.className,
            previousTagName: previous.element.tagName.toLowerCase(),
            currentTagName: current.element.tagName.toLowerCase(),
            previousDisplay: getComputedStyle(previous.element).display,
            currentDisplay: getComputedStyle(current.element).display,
            previousText: previous.element.textContent?.trim().slice(0, 80),
            currentText: current.element.textContent?.trim().slice(0, 80),
            expectedGap: minimumGap,
            actualGap: Math.round(gap),
          });
        }
      }
    }

    return violations;
  });
}

const server = startDocsServer();

try {
  await rm(outputDirectory, { recursive: true, force: true });
  await mkdir(outputDirectory, { recursive: true });
  await waitForServer(baseUrl);

  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });

  const report = [];
  report.push(await capturePage(page, '/', 'overview.png'));
  report.push(await capturePage(page, '/tokens/', 'tokens.png'));
  report.push(await capturePage(page, '/flows/', 'flows.png'));
  report.push(await capturePage(page, '/flows/contact-details/', 'contact-details-initial.png'));

  await page.waitForFunction(() => !document.querySelector('astro-island[ssr]'));
  const lists = await listMetrics(page);
  const initialStackViolations = await stackMetrics(page);

  await page.getByRole('button', { name: 'Continue' }).click();
  await page.screenshot({ path: `${outputDirectory}/contact-details-errors.png`, fullPage: true });
  const errorStackViolations = await stackMetrics(page);
  const errorSummaryState = await page.getByRole('alert').evaluate((element) => {
    const styles = getComputedStyle(element);

    return {
      isFocused: element === document.activeElement,
      outlineWidth: styles.outlineWidth,
      outlineStyle: styles.outlineStyle,
    };
  });

  await page.getByRole('textbox', { name: 'Full name' }).fill('Harry Thompson');
  await page.getByRole('textbox', { name: 'Email address' }).fill('harry@example.com');
  await page.getByRole('radio', { name: /Technical support/ }).check();
  await page.getByRole('checkbox', { name: /Security alerts/ }).check();
  await page.getByRole('textbox', { name: 'Notes' }).fill('I need help configuring a deployment.');
  await page.getByRole('button', { name: 'Continue' }).click();
  await page.screenshot({ path: `${outputDirectory}/contact-details-review.png`, fullPage: true });

  await page.getByRole('button', { name: 'Confirm and continue' }).click();
  await page.screenshot({ path: `${outputDirectory}/contact-details-confirmation.png`, fullPage: true });
  const confirmationStackViolations = await stackMetrics(page);

  const darkPage = await browser.newPage({ colorScheme: 'dark', viewport: { width: 1280, height: 900 } });
  await darkPage.goto(`${baseUrl}/flows/contact-details/`);
  await darkPage.waitForFunction(() => !document.querySelector('astro-island[ssr]'));
  await darkPage.getByRole('button', { name: 'Continue' }).click();
  await darkPage.screenshot({ path: `${outputDirectory}/dark-contact-details-errors.png`, fullPage: true });
  const darkStackViolations = await stackMetrics(darkPage);

  const mobilePage = await browser.newPage({ viewport: { width: 390, height: 900 }, isMobile: true });
  const mobileReport = [];
  mobileReport.push(await capturePage(mobilePage, '/flows/', 'mobile-flows.png'));
  const interactiveCards = await interactiveCardMetrics(mobilePage);
  mobileReport.push(await capturePage(mobilePage, '/flows/contact-details/', 'mobile-contact-details-initial.png'));
  await mobilePage.waitForFunction(() => !document.querySelector('astro-island[ssr]'));
  await mobilePage.getByRole('button', { name: 'Continue' }).click();
  await mobilePage.screenshot({ path: `${outputDirectory}/mobile-contact-details-errors.png`, fullPage: true });
  const mobileStackViolations = await stackMetrics(mobilePage);
  const mobileErrors = await mobilePage.evaluate(() => ({
    path: window.location.pathname,
    width: document.documentElement.clientWidth,
    scrollWidth: document.documentElement.scrollWidth,
    hasHorizontalOverflow: document.documentElement.scrollWidth > document.documentElement.clientWidth,
  }));
  mobileReport.push(mobileErrors);

  await browser.close();

  const allPageReports = [...report, ...mobileReport];
  const summary = {
    outputDirectory,
    pages: allPageReports,
    lists,
    interactiveCards,
    stackViolations: [
      ...initialStackViolations,
      ...errorStackViolations,
      ...confirmationStackViolations,
      ...darkStackViolations,
      ...mobileStackViolations,
    ],
    checks: {
      noHorizontalOverflow: allPageReports.every((entry) => !entry.hasHorizontalOverflow),
      errorSummaryFocused: errorSummaryState.isFocused,
      errorSummaryHasVisibleOutline:
        Number.parseFloat(errorSummaryState.outlineWidth) > 0 && errorSummaryState.outlineStyle !== 'none',
      listsHavePadding: lists
        .filter((list) => list.className !== 'gw-breadcrumb' && list.className !== 'docs-primary-nav')
        .every((list) => Number.parseFloat(list.paddingLeft) > 0),
      stackSpacingPreserved:
        [
          ...initialStackViolations,
          ...errorStackViolations,
          ...confirmationStackViolations,
          ...darkStackViolations,
          ...mobileStackViolations,
        ].length === 0,
      interactivePointersAreActionable: interactiveCards.every((card) => card.isPointerOnActionableElement),
    },
  };

  const summaryJson = `${JSON.stringify(summary, null, 2)}\n`;
  await writeFile(`${outputDirectory}/report.json`, summaryJson, 'utf8');
  process.stdout.write(summaryJson);

  if (
    !summary.checks.noHorizontalOverflow ||
    !summary.checks.errorSummaryFocused ||
    !summary.checks.errorSummaryHasVisibleOutline ||
    !summary.checks.listsHavePadding ||
    !summary.checks.stackSpacingPreserved ||
    !summary.checks.interactivePointersAreActionable
  ) {
    process.exitCode = 1;
  }
} finally {
  server.kill('SIGTERM');
}
