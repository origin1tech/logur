export declare type ColorTuple = [number, number];
export interface IColorTuples {
    [key: string]: ColorTuple;
}
/**
 * Start
 * Applies the starting style.
 *
 * @param style the starting style.
 */
export declare function start(style: string): string;
/**
 * End
 * Applies the ending style.
 *
 * @param style the style to be applied.
 */
export declare function end(style: string): string;
/**
 * Style
 * Applies color and styles to string.
 *
 * @param str the string to be styled.
 * @param style the style or array of styles to apply.
 */
export declare function style(str: any, style: string | string[]): any;
/**
 * Strip
 * Strips ansi colors from string.
 *
 * @param obj the object to strip color from.
 */
export declare function strip(str: any): any;
