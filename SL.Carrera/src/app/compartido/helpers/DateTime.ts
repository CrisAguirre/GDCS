import TimeSpan from './TimeSpan';

/**
 * DateTime differs from Date in following cases,
 * 1. DateTime is immutable, however underlying object is Date
 *    but all methods specific to DateTime are immutable
 * 2. DateTime has readonly properties for `day, month, year etc`
 * 3. DateTime is derived from Date so passing DateTime to existing
 *    code will not change anything, however intellisense does not display
 *    any methods of Date unless you explicity cast as Date, but instanceof
 *    works correctly
 * 4. DateTime does not modify underlying Date prototype or add any methods to it
 * ``` typescript
 * DateTime dt = DateTime.now();
 * (dt instanceof Date) // is true
 * (dt instanceof DateTime) // is also true
 * ```
 */
export default class DateTime {

    public static from(d: Date | DateTime): DateTime {
        if (!(d instanceof DateTime)) {
            d = new DateTime(d.getTime());
        }
        return d;
    }

    /**
     * Current date without time
     */
    public static get today(): DateTime {
        const a = new DateTime();
        return a.date;
    }

    /**
     * Current UTC Date
     */
    public static get utcNow(): DateTime {
        const now = new Date();
        return new DateTime(now.getTime() + now.getTimezoneOffset());
    }

    /**
     * DateTime at right now
     */
    public static get now(): DateTime {
        return new DateTime();
    }

    public static parse(s: string): DateTime {
        return new DateTime(s);
    }

    /** Day of month */
    public get day(): number {
        return (this as any as Date).getDate();
    }

    /** Day of week */
    public get dayOfWeek(): number {
        return (this as any as Date).getDay();
    }

    public get month(): number {
        return (this as any as Date).getMonth();
    }

    public get year(): number {
        return (this as any as Date).getFullYear();
    }

    public get hour(): number {
        return (this as any as Date).getHours();
    }

    public get minute(): number {
        return (this as any as Date).getMinutes();
    }

    public get second(): number {
        return (this as any as Date).getSeconds();
    }

    public get milliSecond(): number {
        return (this as any as Date).getMilliseconds();
    }

    /**
     * Timezone offset as TimeSpan
     */
    public get timeZoneOffset(): TimeSpan {
        return TimeSpan.fromMinutes((this as any as Date).getTimezoneOffset());
    }

    /**
     * Milliseconds since EPOCH, ie total number of milliseconds
     * of underlying Date object
     */
    public get msSinceEpoch(): number {
        return (this as any as Date).getTime();
    }

    /**
     * Strips time of the day and returns Date only
     */
    public get date(): DateTime {
        const d = new DateTime(
            (this as any as Date).getFullYear(),
            (this as any as Date).getMonth(),
            (this as any as Date).getDate(), 0, 0, 0, 0);
        return d;
    }

    /**
     * Just for convenience, avoid using this, instead use methods of DateTime
     * or suggest better method at our github repo
     */
    public get asJSDate(): Date {
        return (this as any as Date);
    }

    /**
     * Gets time of the day in TimeSpan format
     */
    public get time(): TimeSpan {
        return new TimeSpan(
            0,
            (this as any as Date).getHours(),
            (this as any as Date).getMinutes(),
            (this as any as Date).getSeconds(),
            (this as any as Date).getMilliseconds());
    }

    /**
     * Converts a date and time to a string by using the current or specified locale.
     * @param locales A locale string or array of locale strings that contain one or more language
     * or locale tags. If you include more than one locale string, list them in descending order of
     * priority so that the first entry is the preferred locale. If you omit this parameter,
     * the default locale of the JavaScript runtime is used.
     * @param options An object that contains one or more properties that specify comparison options.
     */
    public toLocaleString: (locales?: string | string[], options?: Intl.DateTimeFormatOptions) => string;

    /**
     * Converts a date to a string by using the current or specified locale.
     * @param locales A locale string or array of locale strings that contain one or more language
     * or locale tags. If you include more than one locale string, list them in descending order
     * of priority so that the first entry is the preferred locale. If you omit this parameter,
     * the default locale of the JavaScript runtime is used.
     * @param options An object that contains one or more properties that specify comparison options.
     */
    public toLocaleDateString: (locales?: string | string[], options?: Intl.DateTimeFormatOptions) => string;

     /**
      * Converts a time to a string by using the current or specified locale.
      * @param locales A locale string or array of locale strings that contain one or more language
      * or locale tags. If you include more than one locale string, list them in descending order of
      * priority so that the first entry is the preferred locale. If you omit this parameter,
      * the default locale of the JavaScript runtime is used.
      * @param options An object that contains one or more properties that specify comparison options.
      */
    public toLocaleTimeString: (locales?: string | string[], options?: Intl.DateTimeFormatOptions) => string;

    /** Returns a date converted to a string using Universal Coordinated Time (UTC). */
    public toUTCString: () => string;
    /** Returns a date as a string value in ISO format. */
    public toISOString: () => string;

    /** Used by the JSON.stringify method to enable the transformation of an object's data for JavaScript Object
     * Notation (JSON) serialization.
     */
    public toJSON: (key?: any) => string;

    public toTimeString: () => string;

    public toDateString: () => string;

    constructor();
    // tslint:disable-next-line: unified-signatures
    constructor(time?: number | string);
    constructor(
        year?: number, month?: number, date?: number, hours?: number,
        // tslint:disable-next-line: unified-signatures
        minutes?: number, seconds?: number, ms?: number);
    constructor(
        a?: any, b?: number, c?: number, d?: number,
        e?: number, f?: number, g?: number) {
        // super();
        // tslint:disable-next-line: no-string-literal
        this['__proto__'] = DateTime.prototype;
        let rd: any;
        switch (arguments.length) {
            case 0:
            rd = new Date() as any;
            break;
            case 1:
            rd = new Date(a) as any;
            break;
            case 2:
            rd = new Date(a, b) as any;
            break;
            case 3:
            rd = new Date(a, b, c) as any;
            break;
            case 4:
            rd = new Date(a, b, c, d) as any;
            break;
            case 5:
            rd = new Date(a, b, c, d, e) as any;
            break;
            case 6:
            rd = new Date(a, b, c, d, e, f) as any;
            break;
            default:
            rd = new Date(a, b, c, d, e, f, g) as any;
        }
        rd.__proto__ = DateTime.prototype;
        return rd as any;
    }

    /**
     * Adds date or TimeSpan to current date and returns a new DateTime
     * @returns DateTime
     * @param d DateTime or TimeSpan
     */
    public add(d: DateTime | TimeSpan): DateTime;

    /**
     * Adds (or removes -ve values specified) and returns newly created DateTime
     * @returns DateTime
     * @param days number of days
     * @param hours number of hours
     * @param minutes number of minutes
     * @param seconds number of seconds
     * @param milliseconds number of milliseconds
     */
    public add(days: number, hours?: number, minutes?: number, seconds?: number, milliseconds?: number): DateTime;
    public add(
        t: DateTime | TimeSpan | Date | number,
        hours?: number,
        minutes?: number,
        seconds?: number,
        milliseconds?: number): DateTime {
        if (t instanceof Date) {
            return new DateTime(
                (this as any as Date).getTime() + t.getTime());
        }
        let days: number = 0;
        if (t instanceof TimeSpan) {
            days = t.days;
            hours = t.hours;
            minutes = t.minutes;
            seconds = t.seconds;
            milliseconds = t.milliseconds;
        } else {
            days = t as number;
        }
        function hasValue(n: number | undefined | null, name: string ): boolean {
            if (n === undefined) {
                return false;
            }
            if (n === null) {
                throw new Error(`${name} cannot be null`);
            }
            return n !== 0;
        }
        const d = new Date((this as any as Date).getTime());
        if (hasValue(days, 'days')) { d.setDate(d.getDate() + days); }
        if (hasValue(hours, 'hours')) { d.setHours(d.getHours() + hours); }
        if (hasValue(minutes, 'minutes')) { d.setMinutes(d.getMinutes() + minutes); }
        if (hasValue(seconds, 'seconds')) { d.setSeconds(d.getSeconds() + seconds); }
        if (hasValue(milliseconds, 'milliseconds')) { d.setMilliseconds(d.getMilliseconds() + milliseconds); }
        (d as any).__proto__ = DateTime.prototype;
        return d as any as DateTime;
    }

    public addMonths(m: number): DateTime {
        const d = new Date(this.msSinceEpoch);
        d.setMonth(d.getMonth() + m);
        (d as any).__proto__ = DateTime.prototype;
        return d as any;
    }

    public addYears(y: number): DateTime {
        const d = new Date(this.msSinceEpoch);
        d.setFullYear(d.getFullYear() + y);
        (d as any).__proto__ = DateTime.prototype;
        return d as any;
    }

    /**
     * Returns TimeSpan from subtracting rhs from this,
     * `const ts = lhs.diff(rhs); // ts = lhs - rhs`
     * @param rhs Right hand side
     * @returns TimeSpan
     */
    public diff(rhs: Date | DateTime): TimeSpan {
        return new TimeSpan(
            (this as any as Date).getTime() - (rhs as Date).getTime());
    }

    public equals(d: DateTime | Date): boolean {
        if (!d) { return false; }
        return (this as any as Date).getTime() === (d as any as Date).getTime();
    }

    /**
     * Trims time part and compares the given dates
     * @param d date to test
     */
    public dateEquals(d: DateTime | Date): boolean {
        if (!d) { return false; }
        return this.date.equals(DateTime.from(d));
    }

    public toRelativeString(dt?: DateTime | Date): string {
        if (!dt) {
            dt = DateTime.now;
        } else {
            if (dt instanceof Date && !(dt instanceof DateTime)) {
                (dt as any).__proto__ = DateTime.prototype;
                dt = (dt as any) as DateTime;
            }
        }

        const diff = this.diff(dt);
        if (dt.year !== this.year) {
            return this.toLocaleDateString();
        }

        if (Math.abs(diff.totalDays) > 6) {
            return this.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
        }

        if (Math.abs(diff.totalHours) > 23) {
            return this.toLocaleDateString(undefined, { weekday: 'short' });
        }

        if (Math.abs(diff.totalMinutes) > 59) {
            return `${ Math.floor(diff.totalHours) } hours`;
        }

        return `${Math.floor(diff.totalMinutes)} mins`;
    }

}

// hack !! for ES5
(DateTime.prototype as any).__proto__ = Date.prototype;

if (typeof window !== 'undefined') {
    (window as any).DateTime = DateTime;
}
