import fs from 'fs';
const buf = fs.readFileSync('src/assets/logo.png');
const b64 = buf.toString('base64');
const content = `export const LOGO_BASE64 = "data:image/png;base64,${b64}";\nexport default LOGO_BASE64;\n`;
fs.writeFileSync('src/utils/logoData.js', content);
console.log('New PNG Logo Base64 generated successfully!');
