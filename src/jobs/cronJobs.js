import cron from "node-cron";
import ProductStoreController from "../controllers/ProductStoreController.js";

export const startScrapingJob = () => {
    cron.schedule("*/30 * * * *", async () => {
        console.log("Iniciando o processo de scraping a cada 30 minutos.");
        await ProductStoreController.scrapData()
            .then((res) => {
                console.log(
                    new Date() + " - CRON => startScrapingJob => successful"
                )
                return res;
            })
            .catch((err) => {
                console.log(
                    new Date() + " - CRON => startScrapingJob => failed" + err
                );
                return err;
            });
    });
};
