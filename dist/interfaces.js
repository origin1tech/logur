////////////////////////
// TYPES
////////////////////////
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
////////////////////////
// CONSTANTS
////////////////////////
/**
 * Style
 * Styles & colors available via Chalk.
 * Applicable to strings.
 *
 * @see https://github.com/chalk/chalk
 */
exports.STYLES = 'red, green, yellow, blue, magenta, cyan, white, gray, black, bgRed,bgGreen, bgYellow, bgBlue, bgMagenta, bgCyan, bgWhite, bold, dim, italic, underline, inverse, strikethrough';
exports.COLOR_TYPE_MAP = {
    special: 'cyan',
    number: 'yellow',
    boolean: 'yellow',
    undefined: 'grey',
    null: 'bold',
    string: 'green',
    symbol: 'green',
    date: 'magenta',
    regexp: 'red',
    error: 'bold.underline.red',
    ministack: 'gray'
};
//# sourceMappingURL=interfaces.js.map