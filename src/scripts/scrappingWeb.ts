import puppeteer from 'puppeteer';

export async function scrapingWeb(url: string) {
    console.log('Iniciando proceso de Scrapping');
    
    const maxRetries = 2;
    let attempt = 0;

    while (attempt <= maxRetries) {
        try {
            const browser = await puppeteer.launch({ headless: true });
            const page = await browser.newPage();

            await page.goto(url, { waitUntil: "domcontentloaded" });
            await page.waitForSelector('body');

            await page.evaluate(() => {
                const elementsToRemove = [
                    'img, svg', 'script, style', 'iframe, object, noscript, embed',
                    'nav, header, footer, aside, button, form, input',
                    'meta, link[rel="stylesheet"], base', '[data-tracking], ins, template, menu, track',
                    'a[href*="facebook.com"], a[href*="instagram.com"], a[href*="twitter.com"], a[href*="whatsapp.com"], a[href*="linkedin.com"], a[href*="youtube.com"], a[href*="pinterest.com"]',
                    'div[class*="facebook"], div[class*="instagram"], div[class*="twitter"], div[class*="whatsapp"], div[class*="linkedin"], div[class*="youtube"], div[class*="pinterest"]'
                ];
                elementsToRemove.forEach(selector => {
                    document.querySelectorAll(selector).forEach(el => el.remove());
                });
            });

            const htmlContent = await page.content();
            await browser.close();
            console.log('Terminé de hacer el Scrapping');
            
            return htmlContent;

        } catch (error) {
            attempt++;
            if (error instanceof Error) {
                console.error(`Error al procesar la URL ${url} en el intento ${attempt}:`, error.stack || error.message);
            } else {
                console.error(`Error al procesar la URL ${url} en el intento ${attempt}:`, error);
            }

            if (attempt > maxRetries) {
                console.log(`Error persistente después de ${maxRetries + 1} intentos para la URL: ${url}. Continuando con la siguiente fuente.`);
                break;
            }
            }
        }
    
    return null;
}
