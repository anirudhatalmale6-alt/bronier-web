/** Static export: the prototype is served by nginx on the VPS, same as the
 *  shop staging. No server means no API route, so the quote form hands the
 *  finished project to WhatsApp/Viber instead of posting it - which is also
 *  how his customers actually get in touch in North Macedonia. */
module.exports = { output: 'export', images: { unoptimized: true }, trailingSlash: true }
