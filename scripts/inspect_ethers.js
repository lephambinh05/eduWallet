const e = require("ethers");
console.log(Object.keys(e).slice(0, 200));
console.log("--- providers keys ---");
if (e && e.providers) console.log(Object.keys(e.providers));
else console.log("no e.providers");
