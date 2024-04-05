const readline = require('readline');
const fs = require('fs');

const imageIns = require('./src/imageInstagramSelenium.js');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

async function main() {
    // Need: [URL username] and [Cookie Instagram]
    rl.question(`1. Get Image Instagram (Need Cookie + run by Selenium)\n
2. Get Image from another site\n\n
Please enter number: `,async (key) => {
        switch (key) {
            case '1':
                rl.question(`Enter link user profile: `,async (urlUser) => {
                    const cookieData = fs.readFileSync('./cookieInstagram.txt', 'utf8');
                    await imageIns.mainInstagramUseCookie(cookieData, urlUser);
                })
                break;
            default:
                rl.close(); // Move rl.close() here as well
                break;
        }
    })
}

main();
