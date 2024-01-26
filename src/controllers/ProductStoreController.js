import puppeteer from 'puppeteer';

import Product from "../models/Product.js";
import ProductStore from "../models/ProductStore.js";
import Store from "../models/Store.js";

const shouldUpdate = async (productId, storeId) => {
    const sixHours = 6 * 60 * 60 * 1000;
    const sixHoursAgo = new Date(Date.now() - sixHours);
    const productStore = await ProductStore.findOne({
        product: productId,
        store: storeId,
        updatedAt: { $gt: sixHoursAgo }
    });
    return !productStore;
};

const tryNavigate = async (page, url) => {
    try {
        await page.goto(url, { waitUntil: 'networkidle0' });
        return true;
    } catch (error) {
        if (error.message.includes('ERR_HTTP2_PROTOCOL_ERROR')) {
            return false;
        }
        throw error;
    }
}

const index = async (req, res) => {
    try {
        const {
            limit = 20,
            page = 1,
            order = "desc",
            sortBy = "createdAt",
            search = "",
        } = req.query;
        const productStores = await ProductStore.paginate({ name: { $regex: search, $options: "i"}
        }, { page, limit: parseInt(limit), populate: ['product', 'store'], sort: { [sortBy]: order } });
        return res.status(200).json(productStores);
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Erro ao buscar dados de produtos e lojas" });
    }
}

const scrapData = async (req, res) => {
    try {
        const products = await Product.find({});
        const browser = await puppeteer.launch({
            headless: "new",
            args: ['--no-sandbox', '--disable-setuid-sandbox'],
        });

        for (const product of products) {
            const stores = await Store.find({
                type: { $in: product.type },
                isActive: true,
            });

            for (const store of stores) {
                const updateNeeded = await shouldUpdate(product._id, store._id);
                if (!updateNeeded) {
                    console.log(`Dados para o produto ${product.name} da loja ${store.name} já estão atualizados.`);
                    continue;
                }

                const page = await browser.newPage();

                try {
                    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/ChromeVersion Safari/537.36');

                    page.on('console', (consoleObj) => {
                        const text = consoleObj.text();
                        if (text.includes('beauty-robot-log')) {
                            console.log(text);
                        }
                    });
                    let url = '';
                    if (store.baseUrl.includes("{param}")) {
                        url = store.baseUrl.replace(/{param}/g, encodeURIComponent(product.name));
                    } else {
                        url = `${store.baseUrl}${encodeURIComponent(product.name)}`
                    };

                    for (let attempt = 0; attempt < 3; attempt++) {
                        const success = await tryNavigate(page, url);
                        if (success) {
                            break;
                        }
                    };

                    await page.waitForSelector(store.selectors.productList);

                    const productsData = await page.evaluate((selectors, builder, baseUrl) => {
                        const domainBase = new URL(baseUrl).origin;
                        const items = Array.from(document.querySelectorAll(selectors.productList)[0].children).slice(0, 3);
                        return items.map(item => {
                            const name = item.querySelector(selectors.productName)?.innerText.trim();
                            const price = item.querySelector(selectors.productPrice)?.innerText.trim();
                            const originalPrice = item.querySelector(selectors.productOriginalPrice)?.innerText.trim();
                            const linkElement = item.querySelector('a');
                            let productUrl = '';
                            if (!linkElement.href && builder !== 'vtex') {
                                productUrl = item.querySelector(`a${selectors.productLink}`)?.href;
                            } else {
                                productUrl = linkElement ? linkElement.href : '';
                            }

                            if (productUrl && productUrl.startsWith('/')) {
                                productUrl = domainBase + productUrl;
                            }

                            return { name, price, originalPrice, productUrl };
                        });
                    }, store.selectors, store.builder, store.baseUrl);

                    if (store.builder === 'vtex') {
                        for (let index = 0; index < productsData.length; index++) {
                            const product = productsData[index];
                            if(product.productUrl !== '') {
                                continue;
                            }
                            const selector = `${store.selectors.productCarouselItem}:nth-child(${index + 1}) ${store.selectors.productCustomButton}`;
                            await page.waitForSelector(selector, { timeout: 15000 });
                            await Promise.all([
                                page.waitForNavigation({ waitUntil: 'networkidle0' }),
                                page.click(selector)
                            ]);

                            product.productUrl = page.url();

                            await page.goBack();
                        }
                    }

                    for (const productData of productsData) {
                        const samePrice = await ProductStore.findOne({
                            prodcut: product._id,
                            store: store._id,
                            price: parseFloat(productData.price.replace(/[^0-9,.-]/g, '').replace(',', '.'))
                        });

                        if (!samePrice) {
                            const productStore = new ProductStore({
                                product: product._id,
                                store: store._id,
                                name: productData.name,
                                price: parseFloat(productData.price.replace(/[^0-9,.-]/g, '').replace(',', '.')),
                                url: productData.productUrl
                            });
                            await productStore.save();
                        } else {
                            console.log(`Produto ${product.name} da loja ${store.name} ainda está com o mesmo preço.`);
                            continue;
                        }
                    }
                    await page.close();
                } catch (error) {
                    console.error(`Erro ao raspar dados da loja ${store.name}:`, error);
                }
            }
        }

        await browser.close();
        res.json({ message: "Scraping concluído." });
    } catch (error) {
        console.error("Erro no processo de scraping:", error);
        res.json({ message: "Erro ao executar scraping" });
    }
};

export default { index, scrapData };