
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
export type TransportConstructor<T> = { new (base: ILogurInstanceOptions, options: ILogurTransportOptions, logur: ILogur): T };

/**
 * Timestamp Callback
 * Type constraint for Timestamp callback.
 */
export type TimestampCallback = { (timestamps?: ITimestamps): string; };

/**
 * StackTrace Callback
 * Callback used after generating stacktrace frames.
 */
export type StackTraceCallback = { (stacktrace: IStacktrace[]) };

/**
 * Transport Action Callback
 * Callback for Transport actions.
 */
export type TransportActionCallback = { (ordered: any, output?: ILogurOutput): void };

/**
 * Level Method
 * Constraint for levels interface.
 */
export type LevelMethod = { (...args: any[]) };

/**
 * UUID Callback
 * Callback for user defined uuid.
 */
export type UUIDCallback = { (): string };

/**
 * Serializer
 * Callback method called when mapped to
 * object name in LogurOutput.
 */
export type Serializer = { <T>(value: T, output?: ILogurOutput, options?: any): T };

/**
 * Timestamp Strategy
 * Type constraint for the timestamp strategy to be used.
 */
export type TimestampStrategy = 'epoch' | 'iso' | 'local' | 'utc';

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
export type OutputStrategy = 'array' | 'object' | 'json';

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

export const COLOR_TYPE_MAP: IColorTypeMap = {
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
  ministack: 'gray',
  function: 'cyan'
};

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
  error: string;
  ministack: string;
  function: string;
}

export interface IError extends Error {
  prepareStackTrace?(_: any, stack: any);
  __generated__: boolean; // used for browser generated error objects.
}

export interface ITimestamps {
  epoch: number;
  date: Date;
  iso: string;
  localDate: string;
  localTime: string;
  local: string;
  utcDate: string;
  utcTime: string;
  utc: string;
}

export interface INotify {

  events: { [key: string]: any };

  emit(event: string, ...args: any[]): INotify;

  once(event: string, fn: any): INotify;
  once(event: string, fn: any, ref: string): INotify;
  once(event: string, fn: any, ref: string, cancel: any): INotify;
  once(event: string, fn: any, ref: string, context: any): INotify;
  once(event: string, fn: any, ref?: string, cancel?: any, context?: any): INotify;

  on(event: string, fn: any): INotify;
  on(event: string, fn: any, ref: string): INotify;
  on(event: string, fn: any, ref: string, cancel: any): INotify;
  on(event: string, fn: any, ref: string, context: any): INotify;
  on(event: string, fn: any, ref?: string, cancel?: any, context?: any): INotify;

  off(event: string, fn: Function): INotify;
  off(event: string, fn?: Function, context?: any): INotify;

  listeners(event: string): any[];
  hasListeners(event: string): boolean;
  removeListeners(event: string): INotify;

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

// Duplication here really so we don't need
// to deal with importing NodeJS typings.
// also stripped some props.

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

export interface ILevel {
  level: number;                // the level number.
  color?: string;               // the level color.
}

export interface ILevels {
  error: ILevel | number;
  warn: ILevel | number;
  info: ILevel | number;
  verbose: ILevel | number;
  debug: ILevel | number;
}

export interface ILevelMethodsBase {
  [key: string]: (...args: any[]) => ILogurInstance;
}

export interface ILevelMethods extends ILevelMethodsBase {
  error(...args: any[]): ILogurInstance;
  warn(...args: any[]): ILogurInstance;
  info(...args: any[]): ILogurInstance;
  verbose(...args: any[]): ILogurInstance;
  debug(...args: any[]): ILogurInstance;
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
  transport?: string;                           // the logged transport name or label.
  message?: string;                             // the logged message.
  metadata?: IMetadata;                         // passed metadata.
  callback?: { (output?: ILogurOutput) };       // passed callback function.

  // Argument arrays and Ordering Map.

  untyped: any[];                               // args that are not known types.
  args: any[];                                  // the originally logged args.

  map: string[];                                // array of ordered props for output.
  levels: ILevels;                              // the levels configuration.
  stacktrace?: IStacktrace[];                   // parsed stacktrace frame.
  env?: IEnvNode | IEnvBrowser;                 // browser, os, process environment info.
  error?: Error;                                // populated with parsed error if exists.
  pkg?: IMetadata;                              // defined package.json fields.

}

/////////////////////////////////
// TRANSPORT & INSTANCE OPTIONS
/////////////////////////////////

export interface ILogurBaseOptions {

  active?: boolean;             // when NOT false is active.
  level?: number;               // the active log level.
  levels?: ILevels;             // Log levels configuration.
  uuid?: UUIDCallback;          // when has value callsback to get generated uuid.
  timestamp?: TimestampCallback | TimestampStrategy; // timestamp strategy.
  colormap?: IMetadata;         // mimics util.inspect.styles for mapping type to color.
  exceptions?: ExceptionStrategy; // how to handle unhandled exceptions.


}

export interface ILogurInstanceOptions extends ILogurBaseOptions {

  cascade?: boolean;      // when NOT false cascade settings down to transports.
  sync?: boolean;         // when True transports are called synchronously.

  // An array of transports to
  // be bound to Instance.
  transports?: ILogurOptionsTransport[];

}

export interface ILogurTransportOptions extends ILogurBaseOptions {

  map?: string[];               // array containing properties in order of output.
  pretty?: boolean;             // when true objects are pretty printed.
  ministack?: boolean;          // When NOT false log append msgs w/ (file:line:col)
  prettystack?: boolean;        // when true error stact trace is pretty printed.
  profiler?: boolean;           // when true transport can be used for profiling.

}

export interface IConsoleTransportOptions extends ILogurTransportOptions {
  padding?: PadStrategy;        // the strategy for pading levels.
  colorize?: boolean;           // when NOT false colorization is applied.
}

export interface IFileTransportOptions extends ILogurTransportOptions {
  filename: string;             // filename.
  max?: number;                 // max size in bytes.
  backups?: number;             // number of backups to keep.
  pattern?: string;             // date pattern for DateRollingStream.
  options?: {
    encoding?: string;          // defaults to 'utf8'.
    mode?: number;              // defaults to 0644.
    flags?: string;             // defaults to 'a'.
    compress?: boolean;         // when True log files will be compressed w/ .gz exten.
    alwaysIncludePattern: boolean;  // extend file with pattern defaults to false.
  };
  json?: boolean;               // when true logged output is JSON.
}

export interface IMemoryTransportOptions extends ILogurTransportOptions {
  padding?: PadStrategy;        // the strategy for pading levels.
  colorize?: boolean;           // when NOT false colorization is applied.
  max?: number;                 // maximum number of logs.
}

export interface IHttpTransportOptions extends ILogurTransportOptions {
  url?: string;
  host?: string;
  port?: number;
  ssl?: boolean;
  params?: IMetadata;
}

////////////////////////
// BASE TRANSPORTS
////////////////////////

/* Console
*******************/

export interface IConsoleTransport extends ILogurTransport {
  //
}

/* File
*******************/


export interface IFileTransport extends ILogurTransport {
  streamroller: any;
  options: IFileTransportOptions;
}

/* Http
*******************/


export interface IHttpTransport extends ILogurTransport {
  //
}

/* Memory
*******************/



export interface IMemoryTransport extends ILogurTransport {
  logs: any[];
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

  options: ILogurTransportOptions;
  setOption<T extends ILogurTransportOptions>(key: string | T, value?: any): void;
  active(state?: boolean): boolean;

  colorize(obj: any, color?: string | string[], modifiers?: string | string[]): any;
  stripColors(str: any): any;
  padLevel(level: string, levels: string[], strategy?: PadStrategy): string;
  ministack(options: any, output: ILogurOutput): string;
  format(obj: any, options: any, output: ILogurOutput): any;
  toMapped(as: 'array' | 'object', options: any, output: ILogurOutput): any;
  toMappedArray(options: any, output: ILogurOutput): any[];
  toMappedObject<T>(options: any, output: ILogurOutput): T;

  // Must Override Methods

  action(output: ILogurOutput, done: TransportActionCallback): void;
  query(): void;
  close?(): void;

}

////////////////////////
// INSTANCE
////////////////////////

export interface ISerializers {
  [key: string]: Serializer;
}

export interface ISerializerMethods {
  get(name: string): Serializer;
  getAll(): ISerializers;
  create(name: string, serializer: Serializer): ISerializerMethods;
  remove(name: string): ISerializerMethods;
}

export interface ITransportMethods {
  has(name: string): boolean;
  get<T>(name?: string): T;
  getAll(): ILogurTransports;
  getList(): string[];
  create<T extends ILogurTransport>(name: string, Transport?: TransportConstructor<T>): ITransportMethods;
  create<T extends ILogurTransport>(name: string, options?: IMetadata | TransportConstructor<T>, Transport?: TransportConstructor<T>): ITransportMethods;
  extend(name: string): ITransportMethods;
  remove(name: string): ITransportMethods;
  active(name: string, state?: boolean): ITransportMethods;
  setOption<T extends ILogurTransportOptions>(name: string, options: T): ITransportMethods;
  setOption<T extends ILogurTransportOptions>(name: string, key: string | T, value?: any): ITransportMethods;
}

export interface IProfileOptions {
  transports?: string[];            // list of transports to be used in profile.
  max?: number;                     // max logs before auto stop. set to 0 to disable.
  until?: { (): boolean };          // if defined profile until false.
  remove?: ProfileRemoveStrategy;   // the strategy observed for removing the profile.
}

export interface IProfileResult {

  name: string;
  instance: string;       // name of instance that ran the profile.
  transports: string[];   // array of transport names used in profile.
  started: number;        // start timestamp.
  stopped?: number;       // stop timestamp.
  elapsed: number;        // elapsed time in ms.
  count: number;          // number of log message.

}

export interface IProfile extends IProfileResult {
  active: boolean;
  options: IProfileOptions;
  start(): void;
  stop(): IProfileResult;
}

export interface IProfiles {
  [key: string]: IProfile;
}

export interface IProfileMethods {
  get(name: string): IProfile;
  getAll(): IProfiles;
  active(name: string, state?: boolean): boolean;
  status(name: string): boolean;
  until(name: string): boolean;
  create(name: string, options: IProfileOptions): IProfile;
  create(name: string, transports: string[] | IProfileOptions, options?: IProfileOptions): IProfile;
  start(name: string): void;
  stop(name: string): IProfileResult;
  remove(name: string, force?: boolean): void;
}

export interface ILogurInstances {
  [key: string]: any;
}

export interface ILogurInstance extends INotify {

  env: IEnv;
  options: ILogurInstanceOptions;
  transports: ITransportMethods;
  profiles: IProfileMethods;
  serializers: ISerializerMethods;
  setOption<T extends ILogurInstanceOptions>(options: T): void;
  setOption<T extends ILogurInstanceOptions>(key: string | T, value?: any): void;
  active(state?: boolean): boolean;

  write(...args: any[]): ILogurInstance;
  exit(code?: number): void;

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
  serializers: ISerializers;
  log: ILogurInstance & ILevelMethods;
  options: ILogurOptions;
  setOption(options: ILogurOptions): void;
  setOption(key: string | ILogurOptions, value?: any): void;
  get<T extends ILevelMethodsBase>(name?: string): ILogurInstance & T;
  create<T extends ILevelMethodsBase>(name: string, options: ILogurInstanceOptions): ILogurInstance & T;
  remove(name: string): void;
}
