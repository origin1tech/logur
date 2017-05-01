/**
 * Constructor
 * For activating dynamic types used in .activate method.
 */
export declare type Constructor<T> = new (...args: any[]) => T;
/**
 * Transport Constructor
 * Generic constructor for Transports.
 */
export declare type TransportConstructor<T> = {
    new (options: ILogurTransportOptions, logur: ILogur): T;
};
/**
 * Instance Constructor
 * Generic constructor for Instances.
 */
export declare type InstanceConstructor<T> = {
    new (name: string, options: ILogurInstanceOptions, logur: ILogur): T;
};
/**
 * Timestamp Callback
 * Type constraint for Timestamp callback.
 */
export declare type TimestampCallback = {
    (timestamps?: ITimestamps): string;
};
/**
 * StackTrace Callback
 * Callback used after generating stacktrace frames.
 */
export declare type StackTraceCallback = {
    (stacktrace: IStacktrace[]);
};
/**
 * Transport Action Callback
 * Callback for Transport actions.
 */
export declare type TransportActionCallback = {
    (ordered: any[], output?: ILogurOutput): void;
};
export declare type LevelMethod = {
    (...args: any[]);
};
/**
 * UUID Callback
 * Callback for user defined uuid.
 */
export declare type UUIDCallback = {
    (): string;
};
/**
 * Colors
 * Type constraint for colors.
 */
export declare type Colors = 'red' | 'green' | 'yellow' | 'blue' | 'magenta' | 'cyan' | 'white' | 'gray' | 'black';
/**
 * Background Colors
 * Type constraint for background colors.
 */
export declare type BgColors = 'bgRed' | 'bgGreen' | 'bgYellow' | 'bgBlue' | 'bgMagenta' | 'bgCyan' | 'bgWhite';
/**
 * Timestamp Strategy
 * Type constraint for the timestamp strategy to be used.
 */
export declare type TimestampStrategy = 'epoch' | 'iso' | 'local' | 'utc';
/**
 * File Output Strategy
 * Type constraint for how logs are formatted and output to file.
 */
export declare type FileFormatStrategy = 'tab' | 'csv' | 'json';
/**
 * Error Strategy
 * Type constraint for the error strategy to be used.
 * log:  simply logs the unhandled error.
 * exit: logs the error then exits.
 * none: ignores errors does not log or exit.
 */
export declare type ErrorStrategy = 'log' | 'exit' | 'none';
/**
 * Format Keys
 * Type constraint for availabe property keys for formatting log messages.
 */
export declare type OutputKeys = 'timestamp' | 'uuid' | 'level' | 'instance' | 'transport' | 'message' | 'untyped' | 'metadata';
/**
 * Pad Strategy
 * The strategy for padding log levels in console.
 */
export declare type PadStrategy = 'left' | 'right' | 'none';
/**
 * Profile Remove Strategy
 * The strategy to use when removing a profile.
 * Remove strategy is inspected on profile stop.
 */
export declare type ProfileRemoveStrategy = 'stop' | 'never';
export interface IError extends ErrorConstructor {
    prepareStackTrace?(_: any, stack: any): any;
}
export interface ILevel {
    level: number;
    color?: Colors;
    timestamp?: Colors;
    uuid?: Colors;
    instance?: Colors;
    transport?: Colors;
    message?: Colors;
}
export interface ILevels {
    error: ILevel;
    warn: ILevel;
    info: ILevel;
    verbose: ILevel;
    debug: ILevel;
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
    events: {
        [key: string]: any;
    };
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
    file: string;
    line: number;
    method: string;
    function: string;
    native: boolean;
}
export interface IMetadata {
    [key: string]: any;
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
    networkInterfaces: {
        [index: string]: NetworkInterfaceInfo[];
    };
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
export interface ILogurBaseOptions {
    active?: boolean;
    level?: number;
    levels?: ILevels;
    map?: OutputKeys[];
    uuid?: UUIDCallback;
    timestamp?: TimestampCallback | TimestampStrategy;
}
export interface ILogurOutput {
    activeid?: number;
    levelid: number;
    timestamp?: any;
    uuid?: string;
    level?: string;
    instance?: string;
    transport?: string;
    message?: string;
    metadata?: IMetadata;
    callback?: {
        (output?: ILogurOutput);
    };
    untyped: any[];
    args: any[];
    map: any[];
    levels: ILevels;
    stacktrace?: IStacktrace[];
    env?: IEnvNode | IEnvBrowser;
}
export interface IConsoleTransportOptions extends ILogurTransportOptions {
    padding?: PadStrategy;
    pretty?: boolean;
    colorized?: boolean;
    ministack?: boolean;
    fullstack?: boolean;
}
export interface IConsoleTransport extends ILogurTransport {
}
export interface IFileTransportOptions extends ILogurTransportOptions {
    filename: string;
    filesize: number;
}
export interface IFileTransport extends ILogurTransport {
}
export interface IHttpTransportOptions extends ILogurTransportOptions {
}
export interface IHttpTransport extends ILogurTransport {
}
export interface IMemoryTransportOptions extends ILogurTransportOptions {
    padding?: PadStrategy;
    pretty?: boolean;
    colorized?: boolean;
    max?: number;
}
export interface IMemoryTransport extends ILogurTransport {
    logs: ILogurOutput[];
}
export interface ILogurTransportOptions extends ILogurBaseOptions {
    exceptions?: ErrorStrategy;
    profiler?: boolean;
}
export interface ILogurTransports {
    [key: string]: {
        Transport: any;
        instance: any;
    };
}
export interface ILogurTransport {
    options: ILogurTransportOptions;
    setOption<T extends ILogurTransportOptions>(key: string | T, value?: any): void;
    active(state?: boolean): boolean;
    toOrdered(obj: ILogurOutput): any[];
    colorize(str: string, color?: string | string[], bgColor?: string | string[], modifiers?: string | string[]): string;
    stripColor(str: string | string[]): string | string[];
    padLeft(str: string, len: number, char?: string | number, offset?: number): string;
    padRight(str: string, len: number, char?: string | number, offset?: number): string;
    padValues(values: string[], dir?: string, char?: string | number, offset?: number): string[];
    action(output: ILogurOutput, done: TransportActionCallback): void;
    query(): void;
}
export interface ITransportMethods {
    has(name: string): boolean;
    get<T>(name: string): T;
    getAll(): ILogurTransports;
    getList(): string[];
    create<T extends ILogurTransport>(name: string, Type: Constructor<T>): ITransportMethods;
    create<T extends ILogurTransport>(name: string, options?: IMetadata | Constructor<T>, Transport?: Constructor<T>): ITransportMethods;
    extend(name: string): ITransportMethods;
    remove(name: string): ITransportMethods;
    setState(name: string, state?: boolean): ITransportMethods;
    setOption<T extends ILogurTransportOptions>(name: string, key: string | T, value?: any): ITransportMethods;
}
export interface IProfileOptions {
    transports?: string[];
    max?: number;
    until?: {
        (): boolean;
    };
    remove?: ProfileRemoveStrategy;
}
export interface IProfileResult {
    name: string;
    instance: string;
    transports: string[];
    started: number;
    stopped?: number;
    elapsed: number;
    count: number;
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
    active(name: string, state?: boolean): boolean;
    status(name: string): boolean;
    create(name: string, options: IProfileOptions): IProfile;
    create(name: string, transports: string[] | IProfileOptions, options?: IProfileOptions): IProfile;
    start(): void;
    stop(): IProfileResult;
}
export interface ILogurInstanceOptions extends ILogurBaseOptions {
    cascade?: boolean;
    sync?: boolean;
}
export interface ILogurInstance extends INotify {
    env: IEnv;
    options: ILogurInstanceOptions;
    transports: ITransportMethods;
    setOption<T extends ILogurInstanceOptions>(key: string | T, value?: any): void;
    active(state?: boolean): boolean;
    error(...args: any[]): void;
    warn(...args: any[]): void;
    info(...args: any[]): void;
    verbose(...args: any[]): void;
    debug(...args: any[]): void;
    write(...args: any[]): void;
    exit(code?: number): void;
}
export interface ILogurInstances {
    [key: string]: any;
}
export interface ILogurOptions {
    transports?: {
        name: string;
        options?: ILogurTransportOptions;
        transport: ILogurTransport;
    }[];
}
export interface ILogur {
    instances: ILogurInstances;
    transports: ILogurTransports;
    log: ILogurInstance;
    options: ILogurOptions;
    setOption(key: string | ILogurOptions, value?: any): void;
    get<T>(name?: string): T;
    create<T extends ILogurInstance>(name: string, options: ILogurInstanceOptions | Constructor<T>, Type?: Constructor<T>): T;
    remove(name: string): void;
}
