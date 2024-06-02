const puppeteer = require('puppeteer');
const fs = require('fs');
const readline = require('readline');

function askQuestion(query) {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    return new Promise(resolve => rl.question(query, answer => {
        rl.close();
        resolve(answer);
    }));
}

const proxies = fs.readFileSync('proxies.txt', 'utf-8').split('\n').filter(Boolean);

function generateRandomString(length) {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
}

function delay(time) {
    return new Promise(resolve => setTimeout(resolve, time));
}

function saveCredentials(username, password) {
    const credentials = `${username}:${password}\n`;
    fs.appendFileSync('credentials.txt', credentials, 'utf8');
}

const performTask = async (proxy) => {
    try {
        const browser = await puppeteer.launch({
            headless: true,
            args: [`--proxy-server=${proxy}`]
        });

        const page = await browser.newPage();

        await page.goto('https://con.onelink.me/kZW6/buosjarv', {
            waitUntil: 'networkidle2'
        });

        await page.waitForSelector('#username');

        const randomUsername = "gen_" + generateRandomString(5);

        await page.type('#username', randomUsername);

        await page.waitForSelector('#password');

        const password = 'Kacper123';
        await page.type('#password', password);

        const email = generateRandomString(15);
        await page.type('#email', email + "@gmail.com");

        await page.waitForSelector('#func_ok_button');

        await delay(1500);

        await page.click('#func_ok_button');

        await delay(3300);
        await page.screenshot({ path: 'filled_form.png' });

        saveCredentials(randomUsername, password);

        await browser.close();
        console.log(`Success! ${randomUsername}:${password}:${proxy}`);
        return true;
    } catch (error) {
        console.error(`Error with proxy ${proxy}: ${error.message}`);
        return false;
    }
};

(async () => {
    const numAccounts = parseInt(await askQuestion('How many accounts would you like to create? '), 10);

    let createdAccounts = 0;

    while (createdAccounts < numAccounts) {
        // Try each proxy until the task is successful
        for (const proxy of proxies) {
            const success = await performTask(proxy);
            if (success) {
                createdAccounts++;
                if (createdAccounts >= numAccounts) {
                    break;
                }
            }
        }
    }

    console.log(`Created ${createdAccounts} accounts.`);
})();
