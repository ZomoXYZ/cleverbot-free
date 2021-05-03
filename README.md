# cleverbot-free-anon
Simple unofficial package to interact with the same API that the Cleverbot website uses for free, now running with Tor!

## **Please use the official Cleverbot API as the Cleverbot developers can easily break this package at any time.**

## Requirements

This package runs the `tor` cli, which has to be installed (and in your path).

# Usage
```js
const cleverbot_tor = require("cleverbot-free-anon"),
    cleverbot = await cleverbot_tor();

// Without context
cleverbot("Hello.").then(response => /*...*/);

// With context
// Please note that context should include messages sent to Cleverbot as well as the responses
cleverbot("Bad.", ["Hi.", "How are you?"]).then(response => /*...*/);
```

**Typings included**