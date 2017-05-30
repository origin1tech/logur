
import { Agent, IncomingMessage, RequestOptions } from 'http';
import { Request, Response, NextFunction } from 'express';

////////////////////////
// TYPES
////////////////////////

/**
 * Constructor
 * For activating dynamic types used in .activate method.
 */
export type Constructor<T> = new (...args: any[]) => T;

/**
 * Transport Constructor
 * Generic constructor for Transports.
 */
export type TransportConstructor<T> = new (base: ILogurInstanceOptions, options: ILogurTransportOptions, logur: ILogur) => T;

export type ExecCallback = (output: ILogurOutput) => void;

/**
 * Timestamp Callback
 * Type constraint for Timestamp callback.
 */
export type TimestampCallback = (timestamps?: ITimestamps) => string;

/**
 * StackTrace Callback
 * Callback used after generating stacktrace frames.
 */
export type StackTraceCallback = (stacktrace: IStacktrace[]) => void;

/**
 * Http Transport Callback
 * Callback called upon Http transport request.
 */
export type HttpTransportCallback = (err: Error, res: IncomingMessage, body: any) => void;

/**
 * Transport Action Callback
 * Callback for Transport actions.
 */
export type TransportActionCallback = () => void;

/**
 * Middleware Token Callback
 * Handles token generation callback.
 */
export type MiddlewareTokenCallback = (req: Request, res: Response) => any;

/**
 * Middlware Filter
 * Enables filtering requests to be logged in middleware.
 */
export type MiddlewareFilter = (parsed: IMetadata, req: Request, res: Response) => boolean;

/**
 * Middleware Logger Handler
 * Callback handler for Express/Connect middleware requests.
 */
export type MiddlewareRequestHandler = (req: Request, res: Response, next: NextFunction) => void;

/**
 * Middleware Error Handler
 * Callback handler for Express/Connect middleware errors.
 */
export type MiddlewareErrorHandler = (err: Error, req: Request, res: Response, next: NextFunction) => void;

/**
 * Level Method
 * Constraint for levels interface.
 */
export type LevelMethod = (...args: any[]) => void;

/**
 * UUID Callback
 * Callback for user defined uuid.
 */
export type UUIDCallback = () => string;

/**
 * Serializer
 * Callback method called when mapped to
 * object name in LogurOutput.
 */
export type Serializer = <T>(value: T, output?: ILogurOutput, options?: any) => T;

/**
 * Filter
 * Filters out a log event by returning true.
 */
export type Filter = (output: ILogurOutput) => boolean;

/**
 * Query Result
 * Callback type returning the queried result.
 */
export type QueryResult = <T>(result: T[]) => void;

/**
 * Query Range
 * Callback type returning array of found IQueryRange.
 */
export type QueryRange = (range: IQueryRange[]) => void;

/**
 * Timestamp Strategy
 * Type constraint for the timestamp strategy to be used.
 */
export type TimestampStrategy = 'epoch' | 'iso' | 'local' | 'utc' | 'utctime' | 'localtime';

/**
 * File Output Strategy
 * Type constraint for how logs are formatted and output to file.
 */
export type FileFormatStrategy = 'tab' | 'csv' | 'json';

/**
 * Error Strategy
 * Type constraint for the error strategy to be used.
 * log:  simply logs the unhandled error.
 * exit: logs the error then exits.
 * none: ignores errors does not log or exit.
 */
export type ExceptionStrategy = 'log' | 'exit' | 'none';

/**
 * Pad Strategy
 * The strategy for padding log levels in console.
 */
export type PadStrategy = 'left' | 'right' | 'none';

/**
 * Profile Remove Strategy
 * The strategy to use when removing a profile.
 * Remove strategy is inspected on profile stop.
 */
export type ProfileRemoveStrategy = 'stop' | 'never';

/**
 * Colorization Strategy
 * Indicates if should colorize or should strip color.
 */
export type ColorizationStrategy = 'yes' | 'no' | 'strip';

/**
 * Output Strategy
 * Indicates how normalized log event should be output
 * when handed off to Transport actions.
 */
export type OutputStrategy = 'array' | 'object' | 'json' | 'raw';

// export type CacheMap = Map<string, any>;

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
export const STYLES = 'red, green, yellow, blue, magenta, cyan, white, gray, black, bgRed,bgGreen, bgYellow, bgBlue, bgMagenta, bgCyan, bgWhite, bold, dim, italic, underline, inverse, strikethrough';

////////////////////////
// MISC INTERFACES
////////////////////////

export interface IColorTypeMap {

  special: string;
  number: string;
  boolean: string;
  undefined: string;
  null: string;
  string: string;
  symbol: string;
  date: string;
  regexp: string;

  // Allow for custom colors.
  [key: string]: string;

}

export interface IError extends Error {
  prepareStackTrace?(_: any, stack: any);
  __generated__: boolean; // used for browser generated error objects.
}

export interface ITimestamps {
  epoch: number;
  date: Date;
  iso: string;
  localdate: string;
  localtime: string;
  local: string;
  utcdate: string;
  utctime: string;
  utc: string;
}

export interface INotify {

  events: { [key: string]: any };

  emit?(event: string, ...args: any[]): INotify;

  once?(event: string, fn: any): INotify;
  once?(event: string, fn: any, ref: string): INotify;
  once?(event: string, fn: any, ref: string, cancel: any): INotify;
  once?(event: string, fn: any, ref: string, context: any): INotify;
  once?(event: string, fn: any, ref?: string, cancel?: any, context?: any): INotify;

  on?(event: string, fn: any): INotify;
  on?(event: string, fn: any, ref: string): INotify;
  on?(event: string, fn: any, ref: string, cancel: any): INotify;
  on?(event: string, fn: any, ref: string, context: any): INotify;
  on?(event: string, fn: any, ref?: string, cancel?: any, context?: any): INotify;

  off?(event: string, fn: Function): INotify;
  off?(event: string, fn?: Function, context?: any): INotify;

  listeners?(event: string): any[];
  hasListeners?(event: string): boolean;
  removeListeners?(event: string): INotify;

}

export interface IStacktrace {
  column: number;
  path: string;
  file?: string;
  url?: string;
  line: number;
  method: string;
  function: string;
  native: boolean;
}

export interface IMetadata {
  [key: string]: any;
}

export interface IStreamrollerOptions {
  filename: string;         // filename.
  max?: number;              // max size in bytes.
  backups?: number;          // number of backups to keep.
  pattern?: string;          // date pattern for DateRollingStream.
  options?: {
    encoding?: string;       // defaults to 'utf8'.
    mode?: number;           // defaults to 0644.
    flags?: string;          // defaults to 'a'.
    compress?: boolean;      // when True log files will be compressed w/ .gz exten.
    alwaysIncludePattern: boolean;  // extend file with pattern defaults to false.
  };
}

////////////////////////
// NODEJS
////////////////////////

// Duplication here really removing
// unneeded props etc.

export interface ITimer {
  ref(): void;
  unref(): void;
}

export interface IParsedPath {

  root?: string;    // NODE Only root of the path such as '/' or 'c:\'
  dir?: string;     // NODE Only full directory such as '/home/user/dir' or 'c:\path\dir'
  base: string;     // The file name including extension (if any) such as 'index.html'
  ext: string;      // The file extension (if any) such as '.html'
  name: string;     // The file name without extension (if any) such as 'index'

}

export interface MemoryUsage {
  rss: number;
  heapTotal: number;
  heapUsed: number;
}

export interface CpuInfo {
  model: string;
  speed: number;
  times: {
    user: number;
    nice: number;
    sys: number;
    idle: number;
    irq: number;
  };
}

export interface NetworkInterfaceInfo {
  address: string;
  netmask: string;
  family: string;
  mac: string;
  internal: boolean;
}

// Yeah I called it I-Load.
export interface ILoad {
  freemem: number;
  totalmem: number;
  loadavg: number[];
  uptime: number;
}

export interface IProcess {
  pid: number;
  uid: number;
  gid: number;
  cwd: string;
  execPath: string;
  version: string;
  argv: string[];
  memoryUsage: MemoryUsage;
}

export interface IOS {
  hostname: string;
  homedir: string;
  arch: string;
  platform: string;
  release: string;
  cpus: CpuInfo[];
  type: string;
  EOL: string;
  networkInterfaces: { [index: string]: NetworkInterfaceInfo[] };
  freemem: number;
  totalmem: number;
  loadavg: number[];
  uptime: number;
  endianness: 'BE' | 'LE';

}

export interface IEnvNode {

  process: IProcess;
  os: IOS;

}

////////////////////////
// UA PARSER
////////////////////////

export interface IUABrowser {
  /**
   * Possible values :
   * Amaya, Android Browser, Arora, Avant, Baidu, Blazer, Bolt, Camino, Chimera, Chrome,
   * Chromium, Comodo Dragon, Conkeror, Dillo, Dolphin, Doris, Edge, Epiphany, Fennec,
   * Firebird, Firefox, Flock, GoBrowser, iCab, ICE Browser, IceApe, IceCat, IceDragon,
   * Iceweasel, IE [Mobile], Iron, Jasmine, K-Meleon, Konqueror, Kindle, Links,
   * Lunascape, Lynx, Maemo, Maxthon, Midori, Minimo, MIUI Browser, [Mobile] Safari,
   * Mosaic, Mozilla, Netfront, Netscape, NetSurf, Nokia, OmniWeb, Opera [Mini/Mobi/Tablet],
   * Phoenix, Polaris, QQBrowser, RockMelt, Silk, Skyfire, SeaMonkey, SlimBrowser, Swiftfox,
   * Tizen, UCBrowser, Vivaldi, w3m, Yandex
   *
   */
  name: string;

  /**
   * Determined dynamically
   */
  version: string;

  /**
   * Determined dynamically
   * @deprecated
   */
  major: string;
}

export interface IUADevice {
  /**
   * Determined dynamically
   */
  model: string;

  /**
   * Possible type:
   * console, mobile, tablet, smarttv, wearable, embedded
   */
  type: string;

  /**
   * Possible vendor:
   * Acer, Alcatel, Amazon, Apple, Archos, Asus, BenQ, BlackBerry, Dell, GeeksPhone,
   * Google, HP, HTC, Huawei, Jolla, Lenovo, LG, Meizu, Microsoft, Motorola, Nexian,
   * Nintendo, Nokia, Nvidia, Ouya, Palm, Panasonic, Polytron, RIM, Samsung, Sharp,
   * Siemens, Sony-Ericsson, Sprint, Xbox, ZTE
   */
  vendor: string;
}

export interface IUAEngine {
  /**
   * Possible name:
   * Amaya, EdgeHTML, Gecko, iCab, KHTML, Links, Lynx, NetFront, NetSurf, Presto,
   * Tasman, Trident, w3m, WebKit
   */
  name: string;
  /**
   * Determined dynamically
   */
  version: string;
}

export interface IUAOS {
  /**
   * Possible 'os.name'
   * AIX, Amiga OS, Android, Arch, Bada, BeOS, BlackBerry, CentOS, Chromium OS, Contiki,
   * Fedora, Firefox OS, FreeBSD, Debian, DragonFly, Gentoo, GNU, Haiku, Hurd, iOS,
   * Joli, Linpus, Linux, Mac OS, Mageia, Mandriva, MeeGo, Minix, Mint, Morph OS, NetBSD,
   * Nintendo, OpenBSD, OpenVMS, OS/2, Palm, PCLinuxOS, Plan9, Playstation, QNX, RedHat,
   * RIM Tablet OS, RISC OS, Sailfish, Series40, Slackware, Solaris, SUSE, Symbian, Tizen,
   * Ubuntu, UNIX, VectorLinux, WebOS, Windows [Phone/Mobile], Zenwalk
   */
  name: string;
  /**
   * Determined dynamically
   */
  version: string;
}

export interface IUACPU {
  /**
   * Possible architecture:
   *  68k, amd64, arm, arm64, avr, ia32, ia64, irix, irix64, mips, mips64, pa-risc,
   *  ppc, sparc, sparc64
   */
  architecture: string;
}

export interface IEnvBrowser {
  ua: string;
  browser: IUABrowser;
  device: IUADevice;
  engine: IUAEngine;
  os: IUAOS;
  cpu: IUACPU;
}

export interface IEnv {
  node: IEnvNode;
  browser: IEnvBrowser;
}

////////////////////////
// LOGUR COMMON
////////////////////////

export interface IMiddlewareTokens {
  [key: string]: string | MiddlewareTokenCallback;
}

export interface IMiddlewareOptions {
  map?: string[];                         // array of props for mapping from parsed obj.
  transports?: string | string[];
  levelmap?: {                            // maps status code to Logur levels.
    [code: number]: string;
    default: string;                      // the default level to use if no match.
  };
  tokens?: IMiddlewareTokens;             // path or token callbacks.
  filters?: MiddlewareFilter[];
  metadata?: boolean;                     // when true all tokens are logged as metadata.
}

export interface IMiddleware {
  handler: MiddlewareRequestHandler;
  findLevelBySeverity: (levels: ILevels, severity: number) => string;
  parseTokens: (tokens: IMiddlewareTokens, req: Request, res: Response) => IMetadata;
}

export interface IQuery {
  from: Date | string;
  to: Date | string;
  skip: number;
  take: number;
  order: 'asc' | 'desc';
  fields: string[];
}

export interface IQueryRange {
  index?: number;
  filename?: string;
  line?: string;
  start?: number;
  end?: number;
}

export interface IQueryRanges {
  [key: number]: IQueryRange;
}

export interface ILevel {
  level: number;                // the level number.
  color?: string;               // the level color.
}

export interface IAuth {
  username: string;
  password: string;
}

export interface ILevels {
  error: ILevel | number;
  warn: ILevel | number;
  info: ILevel | number;
  verbose: ILevel | number;
  debug: ILevel | number;
}

export interface IInstanceMethodsExit {
  exit(code?: number | boolean, panic?: boolean): void;
}

export interface IInstanceMethodsExtended extends IInstanceMethodsExit {
  write(...args: any[]): IInstanceMethodsExit;
}

export interface IInstanceMethodsWrap<T> {
  write(...args: any[]): IInstanceMethodsExit;
}

export interface IInstanceMethodsWrite<T> extends IInstanceMethodsExit {
  using(transports: string | string[], exclude?: boolean): T;
  wrap(value: any, ...args: any[]): T;
  write(...args: any[]): IInstanceMethodsExit;
}

export interface ILevelMethodsBase {
  [key: string]: (...args: any[]) => IInstanceMethodsExtended;
}

export interface ILevelMethods extends ILevelMethodsBase {
  error(...args: any[]): IInstanceMethodsExtended;
  warn(...args: any[]): IInstanceMethodsExtended;
  info(...args: any[]): IInstanceMethodsExtended;
  verbose(...args: any[]): IInstanceMethodsExtended;
  debug(...args: any[]): IInstanceMethodsExtended;
}

export interface ILogurOutput {

  // Ids.

  activeid?: number;                            // the numeric active log level.
  levelid: number;                              // the numeric log level numeric id.

  // Main log output.

  timestamp?: any;                              // the logged message timestamp.
  uuid?: string;                                // a unique id for the logged message.
  level?: string;                               // the logged level.
  instance?: string;                            // the transport instance name.
  transports?: string[];                        // array of transports called.
  message?: string;                             // the logged message.
  metadata?: IMetadata;                         // passed metadata.

  // Argument arrays and Ordering Map.

  untyped: any[];                               // args that are not known types.
  args: any[];                                  // the originally logged args.

  map?: string[];                               // array of ordered props for output.
  levels: ILevels;                              // the levels configuration.
  stacktrace?: IStacktrace[];                   // parsed stacktrace frame.
  env?: IEnvNode | IEnvBrowser;                 // browser, os, process environment info.
  pkg?: IMetadata;                              // defined package.json fields.
  serializers?: ISerializers;                   // reference to property serializers.

  // Formats output to mapped values.
  // includes array output, object
  // and json string.
  toMapped?<T>(options?: any): ILogurOutputMapped<T>;

}

export interface ILogurOutputMapped<T> {
  array: any[];
  object: T;
  json: string;
  raw: ILogurOutput;
}

/////////////////////////////////
// TRANSPORT & INSTANCE OPTIONS
/////////////////////////////////

export interface ILogurBaseOptions {

  level?: number;               // the active log level.
  levels?: ILevels;             // Log levels configuration.
  map?: string[];               // array of properties to map log output.
  uuid?: UUIDCallback;          // when has value callsback to get generated uuid.
  timestamp?: TimestampCallback | TimestampStrategy; // timestamp strategy.
  colormap?: IMetadata;         // mimics util.inspect.styles for mapping type to color.
  catcherr?: boolean;           // whether to handle uncaught exceptions/errors.
  exiterr?: boolean;            // whether to exit on uncaught errors.
  emiterr?: boolean;            // whether to emit errors or not.

}

export interface ILogurInstanceOptions extends ILogurBaseOptions {

  cascade?: boolean;      // when NOT false cascade settings down to transports.

  // An array of transports to
  // be bound to Instance.
  transports?: ILogurOptionsTransport[];

}

export interface ILogurTransportOptions extends ILogurBaseOptions {

  active?: boolean;             // when NOT false is active.
  pretty?: boolean;             // when true objects are pretty printed.
  ministack?: boolean;          // When NOT false log append msgs w/ (file:line:col)
  prettystack?: boolean;        // when true error stack trace is pretty printed.
  exceptions?: boolean;         // whether the transport is fired on exceptions.
  queryable?: boolean;          // whether or not the transport supports queries.
  stripcolors?: boolean;         // when true strips any colors before output.
  strategy?: OutputStrategy;    // storage strategy array, json, object or raw.
}

export interface IConsoleTransportOptions extends ILogurTransportOptions {
  padding?: PadStrategy;        // the strategy for pading levels.
  colorize?: boolean;           // when NOT false colorization is applied.
}

export interface IFileTransportOptions extends ILogurTransportOptions {
  filename: string;             // filename.
  options?: {
    encoding?: string;          // defaults to 'utf8'.
    mode?: number;              // defaults to 0644.
    flags?: string;             // defaults to 'a'.
  };
  size?: number;                // max size of a log file.
  max: number;                  // maximum number of backup files.
  interval: number;             // 0 to disable or milliseconds to check log roll at.
  delimiter: '\t' | ';';        // delimiter to be used when json is set to false.
}

export interface IMemoryTransportOptions extends ILogurTransportOptions {
  max?: number;                 // maximum number of logs.
}

export interface IHttpTransportOptions extends ILogurTransportOptions {
  path?: string;
  host?: string;
  port?: number;
  ssl?: boolean;
  encoding: string;
  headers?: IMetadata;
  method?: 'POST' | 'PUT';
  auth?: IAuth;
  params?: IMetadata;
  agent?: boolean | Agent;
}

export interface IStreamTransportOptions extends ILogurTransportOptions {
  stream: NodeJS.WritableStream;  // A writeable stream
  options?: {
    encoding?: string;          // defaults to 'utf8'.
    mode?: number;              // defaults to undefined.
    flags?: string;             // defaults to undefined.
  };
  padding?: PadStrategy;          // the strategy for pading levels.
  colorize?: boolean;             // when NOT false colorization is applied.
}

////////////////////////
// BASE TRANSPORTS
////////////////////////

/* Console
*******************/

export interface IConsoleTransport extends ILogurTransport {
  options: IConsoleTransportOptions;
}

/* File
*******************/

export interface IFileTransport extends ILogurTransport {
  options: IFileTransportOptions;
  startTimer(): void;
  stopTimer(): void;
  open(fn?: { (stream?: NodeJS.WritableStream) }): void;
  close(): void;
}

/* Http
*******************/

export interface IHttpTransport extends ILogurTransport {
  options: IHttpTransportOptions;
  request(options: RequestOptions, data: string | IMetadata | HttpTransportCallback, fn: HttpTransportCallback): void;
}

/* Memory
*******************/

export interface IMemoryTransport extends ILogurTransport {
  logs: any[];
  options: IMemoryTransportOptions;
}

/* Stream
*******************/

export interface IStreamTransport extends ILogurTransport {
  options: IStreamTransportOptions;
}

////////////////////////
// TRANSPORT
////////////////////////

export interface ILogurTransports {
  [key: string]: {
    Transport: any,
    instance: any
  };
}

export interface ILogurTransport {

  name: string;
  options: ILogurTransportOptions;
  setOption<T extends ILogurTransportOptions>(key: string | T, value?: any): void;
  active(state?: boolean): boolean;

  colorize(str: any, style: string | string[]): any;
  stripColors(str: any): any;
  padLevel(level: string, strategy: PadStrategy, levels?: string[]): string;
  toMapped<T>(output: ILogurOutput): ILogurOutputMapped<T>;
  toMapped<T>(options: ILogurTransportOptions | ILogurOutput, output?: ILogurOutput): ILogurOutputMapped<T>;

  // Optional methods.

  query?(q: IQuery, fn: QueryResult): void;
  dispose?(fn: Function): void;

  // Must Override Methods

  action(output: ILogurOutput, fn: TransportActionCallback): void;

}

////////////////////////
// INSTANCE
////////////////////////

export interface IFilter {
  transports: string | string[];
  filter: Filter;
}

export interface IFilters {
  [key: string]: IFilter;
}

export interface IFilterMethods {
  get(name: string): IFilter;
  getByTransport(transport: string, nocache?: boolean): Filter[];
  getAll(): IFilters;
  add(name: string, transports: string | string[] | Filter, filter?: Filter): IFilterMethods;
  remove(name: string): IFilterMethods;
}

export interface ISerializers {
  [key: string]: Serializer;
}

export interface ISerializerMethods {
  get(name: string): Serializer;
  getAll(): ISerializers;
  add(name: string, serializer: Serializer): ISerializerMethods;
  remove(name: string): ISerializerMethods;
}

export interface ITransportMethods {
  has(name: string): boolean;
  get<T>(name?: string): T;
  getAll(): ILogurTransports;
  getList(): string[];
  add<T extends ILogurTransport>(name: string, Transport?: TransportConstructor<T>): ITransportMethods;
  add<T extends ILogurTransport>(name: string, options?: IMetadata | TransportConstructor<T>, Transport?: TransportConstructor<T>): T;
  extend(name: string): ITransportMethods;
  remove(name: string): ITransportMethods;
  active(name: string, state?: boolean): ITransportMethods;
  setOption<T extends ILogurTransportOptions>(name: string, options: T): ITransportMethods;
  setOption<T extends ILogurTransportOptions>(name: string, key: string | T, value?: any): ITransportMethods;
}

export interface ILogurInstances {
  [key: string]: any;
}

export interface ILogurInstance<T> extends INotify {

  env: IEnv;
  options: ILogurInstanceOptions;
  transports: ITransportMethods;
  serializers: ISerializerMethods;
  filters: IFilterMethods;

  exec(level: string, ...args: any[]): void;
  exec(transports: string | string[], level: string, ...args: any[]): void;
  exec(done: ExecCallback | string | string[], transports: string | string[], level: any, ...args: any[]): void;

  setOption<T extends ILogurInstanceOptions>(options: T): void;
  setOption<T extends ILogurInstanceOptions>(key: string | T, value?: any): void;
  active(state?: boolean): boolean;
  using(transports: string | string[], exclude?: boolean): T;
  wrap(value: any, ...args: any[]): IInstanceMethodsWrap<T> & T;
  write(...args: any[]): IInstanceMethodsWrite<T> & T;
  exit(code?: number | boolean, panic?: boolean): void;
  query(transport: string, q: IQuery, fn: QueryResult): void;
  middleware(options?: IMiddlewareOptions): IMiddleware;
  dispose(fn: Function, isErr?: boolean): void;

}

////////////////////////
// LOGUR
////////////////////////

export interface ILogurOptionsTransport {
  name: string;
  options?: ILogurTransportOptions;
  transport: any;
}

export interface ILogurOptions {

  // Array of properties to grab from package.json
  // when in NodeJS mode. Dot notation is supported.
  package?: string[];

  // Will new up default Logur Instance with
  // the following transports when provided.
  transports?: ILogurOptionsTransport[];

}

export interface ILogur {
  pkg: IMetadata;
  instances: ILogurInstances;
  transports: ILogurTransports;
  log: ILogurInstance<ILevelMethods> & ILevelMethods;
  options: ILogurOptions;
  setOption(options: ILogurOptions): void;
  setOption(key: string | ILogurOptions, value?: any): void;
  get<T extends ILevelMethodsBase>(name?: string): ILogurInstance<T> & T;
  create<T extends ILevelMethodsBase>(name: string, options?: ILogurInstanceOptions): ILogurInstance<T> & T;
  remove(name: string): void;
  dispose(exit: boolean | Function, fn?: Function): void;
}
