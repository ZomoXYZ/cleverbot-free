(async () => {
    const cleverbot_tor = require("./index.js"),
        cleverbot = await cleverbot_tor();

    cleverbot("Hi").then(response => {
        console.log(`Response: ${response}`);
        process.exit((response) ? 0 : 1);
    }).catch(error => {
        console.error(error);
        process.exit(1);
    });
})();