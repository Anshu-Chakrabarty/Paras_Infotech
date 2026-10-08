const fs = require("fs");
const path = require("path");

const src = path.join(__dirname, "..", "bricks&bytes");
const dest = path.join(__dirname, "..", "dist", "bricks&bytes");

fs.mkdirSync(path.dirname(dest), { recursive: true });
fs.cpSync(src, dest, { recursive: true });
