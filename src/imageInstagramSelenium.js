const { Builder, By, Key } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
const fs = require('fs');
const path = require('path');
const axios = require('axios');

async function mainInstagramUseCookie(cookieText, urlUser) {

    // Initialize Chrome browser
    const options = new chrome.Options();
    // options.addArguments('--headless'); // Uncomment this line if you want to run in headless mode
    const driver = await new Builder().forBrowser('chrome').setChromeOptions(options).build();

    try {
        // Open Instagram webpage
        await driver.get('https://www.instagram.com/');

        await driver.manage().deleteAllCookies();

        // Parse and import new cookies
        const cookies = JSON.parse(cookieText);
        for (const cookie of cookies) {
            await driver.manage().addCookie(cookie);
        }
        // Refresh the page to apply the new cookies
        await driver.navigate().refresh();

        await driver.get(urlUser);
        await driver.sleep(5000);

        let lastHeight = 0;
        let currentHeight = 0;

        do {
            lastHeight = await driver.executeScript('return document.body.scrollHeight;');
            await driver.executeScript('window.scrollTo(0, document.body.scrollHeight);');
            await driver.sleep(2000);
            currentHeight = await driver.executeScript('return document.body.scrollHeight;');
        } while (currentHeight > lastHeight);

        // Get URL of all images
        const imgElements = await driver.findElements(By.css('img[src^="https"]'));
        const urlImages = await Promise.all(imgElements.map(async imgElement => {
            return await imgElement.getAttribute('src');
        }));

        // Get URL of divs with class "x1lliihq x1n2onr6 xh8yej3 x4gyw5p x2pgyrj x56m6dy x1ntc13c xn45foy x9i3mqj"
        const divElements = await driver.findElements(By.css('div.x1lliihq.x1n2onr6.xh8yej3.x4gyw5p.x2pgyrj.x56m6dy.x1ntc13c.xn45foy.x9i3mqj'));

        // Iterate through each div element
        for (const divElement of divElements) {
            // Find if the div contains _aatp class
            const hasAatpClass = await divElement.findElements(By.css('div._aatp'));

            // If _aatp class is found in the div
            if (hasAatpClass.length > 0) {
                // Click on the div
                console.log("Click some images");
                await divElement.click();

                // Find the initial image element
                let nextImage;
                try {
                    nextImage = await driver.findElement(By.css('div._9zm2'));
                } catch (error) {
                    // If no next image is found, set nextImage to null
                    nextImage = null;
                }

                // Loop to click on the next image and log URL of images
                while (nextImage) {
                    // Click on the next image
                    await nextImage.click();
                    await driver.sleep(1000);

                    // Find URL of all images after clicking
                    const imgElements = await driver.findElements(By.css('img[src^="https"]'));
                    const urlImages = [];
                    for (const imgElement of imgElements) {
                        const url = await imgElement.getAttribute('src');
                        // Check if the URL contains "150x150"
                        if (!url.includes("150x150")) {
                            urlImages.push(url);
                        }
                    }

                    // Log all URLs of images after clicking
                    console.log("URLs of images after clicking:");
                    urlImages.forEach(url => console.log(url));

                    // Download images from url images
                    const directory = './result';
                    if (!fs.existsSync(directory)) {
                        fs.mkdirSync(directory);
                    }

                    for (const urlImage of urlImages) {
                        const fileName = path.basename(urlImage).split('?')[0]; // Extracting only the filename part
                        const filePath = path.join(directory, fileName);

                        const response = await axios({
                            url: urlImage,
                            method: 'GET',
                            responseType: 'stream'
                        });

                        const writer = fs.createWriteStream(filePath);
                        response.data.pipe(writer);

                        await new Promise((resolve, reject) => {
                            writer.on('finish', resolve);
                            writer.on('error', reject);
                        });
                    }

                    // Find the next image element
                    try {
                        nextImage = await driver.findElement(By.css('div._9zm2'));
                    } catch (error) {
                        // If no next image is found, set nextImage to null
                        nextImage = null;
                    }
                }

                // After clicking all images, wait for 6 seconds and press ESC key
                await driver.sleep(6000);
                await driver.actions().sendKeys(Key.ESCAPE).perform();
            }
        }

        await driver.sleep(10000);
    } catch (error) {
        console.error('An error occurred:', error);
    } finally {
        // Close the browser after completion
        await driver.quit();
    }
}

module.exports = { mainInstagramUseCookie };
