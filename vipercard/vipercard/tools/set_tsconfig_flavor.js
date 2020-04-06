
/* eslint-disable @typescript-eslint/no-var-requires */
const fs = require('fs');
const os = require('os');
const path = require('path');

function copyTsConfig(isProd) {
    const header = `/* NOTE:: this is a generated file, changes here will be overwritten */`
    let spec = isProd ? 'production' : 'development'
    
    let src = path.join(__dirname, `../tsconfig.${spec}.json`)
    let dest = path.join(__dirname, `../tsconfig.json`)
    let text = fs.readFileSync(src, {encoding: "utf8"})
    text = header + os.EOL + os.EOL + text;
    fs.writeFileSync(dest, text, {encoding: "utf8"})
}

function main(argv) {
    let isProd;
    if (argv.some(s => s === '--production')) {
        isProd = true;
    } else if (argv.some(s => s === '--development')) {
        isProd = false;
    } else {
        console.err('please specify either --production or --development')
        return process.exit(1)
    }
    
    copyTsConfig(isProd)
}

main(process.argv);
