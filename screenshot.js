const puppeteer = require('puppeteer');
const path = require('path');
const url = 'file://' + path.resolve(__dirname, 'index.html').replace(/\\/g, '/');

(async () => {
  const browser = await puppeteer.launch();
  const viewports = [
    { name: 'desktop-light',    w: 1280, h: 800, theme: 'light' },
    { name: 'desktop-dark',     w: 1280, h: 800, theme: 'dark'  },
    { name: 'tablet-light',     w: 768,  h: 1024, theme: 'light' },
    { name: 'mobile-light',     w: 390,  h: 844, theme: 'light', mobile: true },
    { name: 'mobile-dark',      w: 390,  h: 844, theme: 'dark',  mobile: true },
    { name: 'mobile-small',     w: 320,  h: 568, theme: 'light', mobile: true },
  ];
  const results = [];
  for (const v of viewports) {
    const ctx = await browser.createBrowserContext();
    const page = await ctx.newPage();
    await page.setViewport({ width: v.w, height: v.h, deviceScaleFactor: 2, isMobile: !!v.mobile });
    await page.goto(url, { waitUntil: 'networkidle0' });
    await page.evaluate((theme) => {
      localStorage.setItem('theme', theme);
      if (theme === 'dark') document.documentElement.setAttribute('data-theme', 'dark');
      else document.documentElement.removeAttribute('data-theme');
    }, v.theme);
    await new Promise(r => setTimeout(r, 250));
    await page.screenshot({ path: path.join(__dirname, 'screenshots', `${v.name}.png`), fullPage: false });

    // Overflow diagnostics
    const diag = await page.evaluate(() => {
      const docWidth = document.documentElement.scrollWidth;
      const viewWidth = document.documentElement.clientWidth;
      const offenders = [];
      if (docWidth > viewWidth) {
        const all = document.querySelectorAll('body *');
        for (const el of all) {
          const r = el.getBoundingClientRect();
          if (r.right > viewWidth + 1 && r.width > 0 && el.offsetParent !== null) {
            // skip fixed positioned that are intentional
            const cs = getComputedStyle(el);
            if (cs.position === 'fixed') continue;
            offenders.push({
              tag: el.tagName.toLowerCase(),
              cls: (el.className || '').toString().slice(0, 60),
              right: Math.round(r.right),
              width: Math.round(r.width),
            });
            if (offenders.length >= 8) break;
          }
        }
      }
      return { docWidth, viewWidth, horizOverflow: docWidth > viewWidth, offenders };
    });
    results.push({ name: v.name, w: v.w, ...diag });

    await page.close();
    await ctx.close();
    console.log('Saved', v.name, diag.horizOverflow ? `⚠ overflow ${diag.docWidth}>${diag.viewWidth}` : 'ok');
  }
  await browser.close();
  console.log('\n=== Overflow report ===');
  for (const r of results) {
    if (r.horizOverflow) {
      console.log(`\n${r.name} (${r.w}px): doc=${r.docWidth} view=${r.viewWidth}`);
      for (const o of r.offenders) console.log('   ', o.tag + '.' + o.cls, 'right=' + o.right, 'w=' + o.width);
    }
  }
})();
