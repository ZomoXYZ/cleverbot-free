const { createTorAgent } = require("tor-master");
const md5 = require("md5");

let cookies;
let cbsid;

/**
 * Sends a mesasage to Cleverbot
 * @param {string} stimulus The message to be sent
 * @param {string[]?} context An array of previous messages and responses
 * @param {string?} language The language of the message (null for auto detect)
 * @returns {Promise<string>} The response
 */
async function sendMessage(agent, stimulus, context = [], language) {
    const _context = context.slice(); // clone array to prevent subsequent calls from modifying it

    if (cookies == null) {
        // we must get the XVIS cookie before we can make requests to the API
        const req = await agent.get("https://www.cleverbot.com/").set("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.85 Safari/537.36");
        cookies = req.header["set-cookie"]; // eslint-disable-line require-atomic-updates
    }

    // why, cleverbot, why do you do need me to do this
    let payload = `stimulus=${escape(stimulus).includes("%u") ? escape(escape(stimulus).replace(/%u/g, "|")) : escape(stimulus)}&`;

    // we're going to assume that the first item in the array is the first message sent
    const reverseContext = _context.reverse();

    for (let i = 0; i < _context.length; i++) {
        // we're going to assume that the context hasn't been escaped
        payload += `vText${i + 2}=${escape(reverseContext[i]).includes("%u") ? escape(escape(reverseContext[i]).replace(/%u/g, "|")) : escape(reverseContext[i])}&`;
    }

    payload += `${language ? `cb_settings_language=${language}&` : ""}cb_settings_scripting=no&islearning=1&icognoid=wsf&icognocheck=`;

    payload += md5(payload.substring(7, 33));

    for (let i = 0; i < 15; i++) {
        try {
            const req = await agent.post(`https://www.cleverbot.com/webservicemin?uc=UseOfficialCleverbotAPI${cbsid ? `&out=&in=&bot=c&cbsid=${cbsid}&xai=${cbsid.substring(0, 3)}&ns=1&al=&dl=&flag=&user=&mode=1&alt=0&reac=&emo=&sou=website&xed=&` : ""}`)
                .timeout({
                    response: 10000,
                    deadline: 60000,
                })
                .set("Cookie", `${cookies[0].split(";")[0]}; _cbsid=-1`)
                .set("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.85 Safari/537.36")
                .type("text/plain")
                .send(payload);

            cbsid = req.text.split("\r")[1];
            return decodeURIComponent(req.text.split("\r")[0]);
        } catch (err) {
            if (err.status === 503) {
                // retry after a bit
                await new Promise(resolve => setTimeout(resolve, 1000));
            } else {
                throw err;
            }
        }
    }

    throw "Failed to get a response after 15 tries";
}

module.exports = () => {
    return new Promise((resolve, reject) => {
        console.log("running promise");
        createTorAgent(msg => console.log(msg)).then(agent => {
            console.log("on tor");

            resolve(function() {
                try {
                    return sendMessage(agent, ...arguments);
                } catch (err) {
                    reject(err);
                }
            });

            setInterval(() => agent.changeIP(), 3e5); //5 minutes

        }).catch(reject);
    });
};