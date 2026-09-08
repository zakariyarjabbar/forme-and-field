import lighthouse from 'lighthouse';
import { launch } from 'chrome-launcher';
import { writeFileSync } from 'node:fs';
const base = process.env.TEST_BASE_URL || 'http://localhost:3000';
const chrome = await launch({ chromeFlags: ['--headless=new'] });
const measured = [];
try {
  for (const [name, path] of [
    ['home', '/'],
    ['product', '/products/cove-lounge-chair'],
  ]) {
    const result = await lighthouse(base + path, {
      port: chrome.port,
      output: ['html', 'json'],
      logLevel: 'error',
      onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo'],
    });
    if (!result) throw new Error('Lighthouse returned no report.');
    writeFileSync(`docs/qa/lighthouse-${name}.html`, result.report[0]);
    writeFileSync(`docs/qa/lighthouse-${name}.json`, result.report[1]);
    const lhr = result.lhr;
    const item = {
      route: path,
      time: lhr.fetchTime,
      lighthouseVersion: lhr.lighthouseVersion,
      environment: lhr.environment,
      config: lhr.configSettings,
      scores: Object.fromEntries(
        Object.entries(lhr.categories).map(([k, v]) => [k, Math.round(v.score * 100)]),
      ),
      metrics: Object.fromEntries(
        [
          'first-contentful-paint',
          'largest-contentful-paint',
          'total-blocking-time',
          'cumulative-layout-shift',
          'speed-index',
        ].map((k) => [
          k,
          { value: lhr.audits[k].numericValue, display: lhr.audits[k].displayValue },
        ]),
      ),
      diagnostics: Object.entries(lhr.audits)
        .filter(([, a]) => a.score !== null && a.score < 0.9 && a.details?.type !== 'opportunity')
        .map(([id, a]) => ({ id, title: a.title, display: a.displayValue })),
    };
    measured.push(item);
    console.log(JSON.stringify(item));
  }
} finally {
  await chrome.kill();
}
writeFileSync('docs/qa/performance-summary.json', JSON.stringify(measured, null, 2));
