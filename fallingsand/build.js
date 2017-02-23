#! /usr/bin/node

// requires the closure compiler to be installed

const exec = require("child_process").exec;
console.log("ready to compile");
exec("closure-compiler -O ADVANCED --js powdergame_cells.js", (error, stdout, stderr) => {
    console.log("closure compiled");
    var code = stdout
    var arg = code.match(/function\((\w+)\)/)[1];
    var result = code.replace(/\n/g,"").replace(/function\(\w*\)/g,arg+"=>").replace(/\{return ([^\}]*)\}/g,"$1").replace(/\b(\d{4,})/g, (_, intStr) => '0x'+Number.parseInt(intStr).toString(16));
    console.log("strings replaced");
    require('fs').writeFileSync("powdergame.compiled.js", result)
    console.log("file written");
});
