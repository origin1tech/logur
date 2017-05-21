import * as u from './utils';

export type ColorTuple = [number, number];

export interface IColorTuples {
  [key: string]: ColorTuple;
}

const styles: IColorTuples = {

  // modifiers
  bold: [1, 22],
  italic: [3, 23],
  underline: [4, 24],
  inverse: [7, 27],
  dim: [2, 22],
  hidden: [8, 28],
  strikethrough: [9, 29],

  // grayscale
  white: [37, 39],
  grey: [90, 39],
  gray: [90, 39],
  black: [90, 39],

  // colors
  blue: [34, 39],
  cyan: [36, 39],
  green: [32, 39],
  magenta: [35, 39],
  red: [31, 39],
  yellow: [33, 39],

  // bright
  redBright: [91, 39],
  greenBright: [92, 39],
  yellowBright: [93, 39],
  blueBright: [94, 39],
  magentaBright: [95, 39],
  cyanBright: [96, 39],
  whiteBright: [97, 39],

  // backgrounds
  bgBlack: [40, 49],
  bgRed: [41, 49],
  bgGreen: [42, 49],
  bgYellow: [43, 49],
  bgBlue: [44, 49],
  bgMagenta: [45, 49],
  bgCyan: [46, 49],
  bgWhite: [47, 49],

  // backgrounds bright
  bgBlackBright: [100, 49],
  bgRedBright: [101, 49],
  bgGreenBright: [102, 49],
  bgYellowBright: [103, 49],
  bgBlueBright: [104, 49],
  bgMagentaBright: [105, 49],
  bgCyanBright: [106, 49],
  bgWhiteBright: [107, 49]

};

const dotExp = /\./g;

/**
 * Start
 * Applies the starting style.
 *
 * @param style the starting style.
 */
export function start(style: string): string {
  return style ? `\x1B[${styles[style][0]}m` : '';
}

/**
 * End
 * Applies the ending style.
 *
 * @param style the style to be applied.
 */
export function end(style: string): string {
  return style ? `\x1B[${styles[style][1]}m` : '';
}

/**
 * Style
 * Applies color and styles to string.
 *
 * @param str the string to be styled.
 * @param style the style or array of styles to apply.
 */
export function style(str: any, style: string | string[]) {

  // Ensure style is an array.
  if (!u.isArray(style)) {

    if (dotExp.test(style as string))
      style = (style as string).split('.');
    else
      style = <string[]>[style];

  }

  // Iterate and apply styles.
  (style as string[]).forEach((s) => {
    str = `${start(s)}${str}${end(s)}`;
  });

  return str;

}

/**
 * Strip
 * Strips ansi colors from string.
 *
 * @param obj the object to strip color from.
 */
export function strip(str: any) {

  // Expression for stripping colors.
  const exp = /[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g;

  return str.replace(exp, '');

}