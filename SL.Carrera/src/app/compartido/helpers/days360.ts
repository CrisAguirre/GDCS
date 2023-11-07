import DateTime from './DateTime';

export class CDays360 {

    public static Days360(pDateFrom: Date, pDateTo: Date) {
        // this.DiferenciaAMD(pDateFrom, pDateTo);
        return this.DiferenciaDias(pDateFrom, pDateTo);
        // return CDays360.Days360V2(pDateFrom, pDateTo);
    }

    public static Days3602(pDateFrom: Date, pDateTo: Date, pNASD: boolean) {
        let mDayFrom: number;
        let mDayTo: number;
        let iret: number;

        //si la fecha de fin es menor a la fecha de inicio
        if (pDateTo.getTime() < pDateFrom.getTime()) return 0;

        //sacamos el valor del dia de cada fecha
        mDayFrom = pDateFrom.getUTCDate();
        mDayTo = pDateTo.getUTCDate();

        // CheckDays(pDateFrom, pDateTo, ref mDayFrom, ref mDayTo, pNASD);

        //Creamos un objeto para poder referenciarlo en el metodo
        let dias = { from: mDayFrom, to: mDayTo };

        //validamos si el dia termina en 31 o si es mes de febrero
        CDays360.CheckDays(new Date(pDateFrom), new Date(pDateTo), mDayFrom, mDayTo, pNASD, dias);
        mDayFrom = dias.from;
        mDayTo = dias.to;


        if (CDays360.IsSameMonth(pDateFrom, pDateTo)) {
            // console.log(pDateFrom.getUTCMonth());
            if (mDayFrom == 1 && mDayTo == 30) {
                return 30;
            }

            iret = (mDayTo - mDayFrom);
            //iret = (mDayTo - mDayFrom) + 1;
            if (iret < 0) {
                iret = 0;
            }
            return iret;
        }

        const daysFullMonth = CDays360.DaysFullMonth(pDateFrom, pDateTo) + mDayTo;
        // console.log('daysFullMonth: ' + daysFullMonth);

        iret = (30 - mDayFrom) + daysFullMonth;
        // console.log('Forma 1: ' + iret);

        iret = (30) + daysFullMonth;
        // console.log('Forma 2: ' + iret);

        iret = ((pDateTo.getFullYear() - pDateFrom.getFullYear()) * 360) + ((pDateTo.getUTCMonth() - pDateFrom.getUTCMonth()) * 30) + (mDayTo - mDayFrom);
        // console.log('Forma 3: ' + iret);

        if (mDayFrom == 1 && mDayTo >= 30) {
            iret++;
            // console.log('Forma 4: ' + iret);
        }
        else if (mDayFrom == 1 && mDayTo == 1) {
            iret++;
            // console.log('Forma 5: ' + iret);
        } else if (daysFullMonth < 360 && this.diffYears(pDateFrom, pDateTo) > 0) {
            iret = (30) + daysFullMonth;
            // console.log('Forma 6: ' + iret);
        } else if (mDayFrom == mDayTo && this.diffYears(pDateFrom, pDateTo) == 0 && this.diffMonths(pDateFrom, pDateTo) == 1) {
            iret = 31;
            // console.log('Forma 7: ' + iret);
        }

        if (iret < 0) {
            iret = 0;
        }

        return iret;
    }

    private static isFebruary(date: Date): boolean {
        return (date.getUTCMonth() + 1) == 2;
    }

    private static DaysFullMonth(pDateFrom: Date, pDateTo: Date) {
        const operacion1 = (this.diffMonths(pDateFrom, pDateTo)) - 1;
        const operacion2 = (this.diffYears(pDateFrom, pDateTo)) * 360;
        const operacion3 = operacion1 * 30 + operacion2;
        let iret = (pDateTo.getUTCMonth() - pDateFrom.getUTCMonth() - 1) * 30 + (pDateTo.getFullYear() - pDateFrom.getFullYear()) * 360;
        if (iret < 0) iret = 0;

        return iret;
    }

    private static diffYears(pDateFrom: Date, pDateTo: Date){
        return pDateTo.getFullYear() - pDateFrom.getFullYear();
    }

    private static diffMonths(pDateFrom: Date, pDateTo: Date) {
        return pDateTo.getUTCMonth() - pDateFrom.getUTCMonth();
    }

    private static IsSameMonth(pDateFrom: Date, pDateTo: Date) {
        return (pDateFrom.getUTCMonth() == pDateTo.getUTCMonth() && pDateFrom.getFullYear() == pDateTo.getFullYear());
    }

    private static CheckDays(pDateFrom: Date, pDateTo: Date, pDayFrom: number, pDayTo: number, pNASD: boolean, dias?: { from: number, to: number }) {
        if (pNASD) {
            if (CDays360.LastDayOfMonth(new Date(pDateFrom)) && this.isFebruary(pDateFrom)) {
                pDayFrom = 30;
                dias.from = 30;
            }

            if (CDays360.LastDayOfMonth(new Date(pDateTo)) && this.isFebruary(pDateTo)) {
                pDayTo = 30;
                dias.to = 30;
            }

            if (pDayTo == 31 && pDayFrom >= 30) {
                pDayTo = 30;
                dias.to = 30;
            }

            if (pDayTo == 31) {
                pDayTo = 30;
                dias.to = 30;
            }

            if (pDayFrom == 31) {
                pDayFrom = 30;
                dias.from = 30;
            }
        }
        else {
            if (pDayFrom == 31) {
                pDayFrom = 30;
                dias.from = 30;
            }

            if (pDayTo == 31) {
                pDayTo = 30;
                dias.to = 30;
            }
        }
    }

    /**
     * Se encarga de validar si la fecha es el ultimo dia del mes
     * @param pDate 
     */
    private static LastDayOfMonth(pDate: Date) {
        const date = new Date(pDate);
        date.setDate(date.getDate() + 1);
        return (date.getUTCMonth() == pDate.getUTCMonth() + 1);
    }


    // ------------------------ METODO 2

    private static Days360V2(StartDate: Date, EndDate: Date) {
        let StartDay: number = StartDate.getUTCDate();
        const StartMonth: number = StartDate.getUTCMonth();
        const StartYear: number = StartDate.getFullYear();
        let EndDay: number = EndDate.getUTCDate();
        const EndMonth: number = EndDate.getUTCMonth();
        const EndYear: number = EndDate.getFullYear();

        if (StartDay == 31 || (CDays360.LastDayOfMonth(StartDate) && StartDate.getUTCMonth() == 2)) {
            // if (StartDay == 31 || CDays360.IsLastDayOfFebruary(StartDate)) {
            StartDay = 30;
        }

        if (StartDay == 30 && EndDay == 31) {
            EndDay = 30;
        }

        return ((EndYear - StartYear) * 360) + ((EndMonth - StartMonth) * 30) + (EndDay - StartDay);
    }

    // private static IsLastDayOfFebruary(date:Date) {
    //     return date.getUTCMonth() == 2 && date.getUTCDate() == DateTime.DaysInMonth(date.Year, date.Month);
    // }

    private static DiferenciaAMD(FechaIni: Date, FechaFin: Date) {
        let A: number; let M: number; let D: number;
        let sMonth: number; let eMonth: number; let sYear: number; let eYear: number;
        let Months: number; let Years: number;
        let FechaFinDiaMas: DateTime;

        // No soporta fechaini mayor
        if (FechaIni > FechaFin) {
            return 0;
        }

        // Get the difference in terms of Month and Year.
        // trabajar con fecha posterior a fechafin
        FechaFinDiaMas = new DateTime(FechaFin.getFullYear(), FechaFin.getMonth(), FechaFin.getDate() + 1);
        sMonth = FechaIni.getMonth();
        eMonth = FechaFinDiaMas.month;
        sYear = FechaIni.getFullYear();
        eYear = FechaFinDiaMas.year;

        // calculate Year
        if (eMonth >= sMonth) {
            Years = eYear - sYear;
        } else {
            Years = eYear - sYear - 1;
        }

        // calculate Months
        if (eMonth >= sMonth) {
            Months = eMonth - sMonth;
        } else {
            Months = (12 - sMonth) + eMonth;
        }

        if (FechaFinDiaMas.day < FechaIni.getDate() && Months > 0) {
            Months--;
        }

        // calculate Days
        let fechaAux = new DateTime(FechaIni.getFullYear() + Years, FechaIni.getMonth() + Months, FechaIni.getDate());

        // returns TimeSpan
        let t = FechaFinDiaMas.diff(fechaAux);
        D = t.days;
        if (D < 0) {
            Years--;
            Months += 11;
            fechaAux = new DateTime(Years,  Months, FechaIni.getDate());
            t = FechaFinDiaMas.diff(fechaAux);
            D = t.days;
        }

        A = Years;
        M = Months;

        if (D > 29) {
            D = D - 30;
            M = M + 1;
        }

        if (M > 11) {
            M = M - 12;
            A = A + 1;
        }
    }

    private static DiferenciaDias(FechaInicial: Date, FechaFinal: Date) {
        let iDiasFin: number;
        let iDiasIni: number;
        let iSigno = 1;
        let dtAux: DateTime;
        let FechaIni = new DateTime(FechaInicial.getFullYear(), FechaInicial.getMonth(), FechaInicial.getDate());
        let FechaFin = new DateTime(FechaFinal.getFullYear(), FechaFinal.getMonth(), FechaFinal.getDate());

        /// Si fechaini es mayor a fechafin invertir fecha y enviar valor negativo
        if (FechaIni > FechaFin) {
            dtAux = FechaIni;
            FechaIni = FechaFin;
            FechaFin = dtAux;
            iSigno = -1;
        }

        /// Caso en el que las fechas inicial y final son iguales y que ademas son el 31 del mes
        if ((FechaIni === FechaFin) && (FechaIni.day === 31)) {
            return 0;
        }

        /// Caso en el que el dia de fecha inicial es 31 del mes (se suma 1 dia a la fecha para que no se tome en cuenta el 31)
        if (FechaIni.day === 31) {
            FechaIni = FechaIni.add(1);
        }

        iDiasIni = FechaIni.day;
        iDiasFin = FechaFin.day;

        /// Si fecha fin es ultimo se convierte a 30 sin importar el mes que sea
        if (this.LastDayOfMonth(FechaFinal)) {
        //if (iDiasFin === this.UltimoDia(FechaFin.year, FechaFin.month)) {
            iDiasFin = 30;
        }

        return (iSigno * (Math.abs(this.DateDiff('M', FechaFin, FechaIni)) * 30 + iDiasFin - iDiasIni + 1));
    }

    private static UltimoDia(year: number, month: number) {
        return new Date(year, month, 0).getDate();
    }

    private static DateDiff(datePart: string, startDate: DateTime, endDate: DateTime) {
        // Get the difference in terms of TimeSpan
        let iRet: number;

        // T = endDate - startDate;
        const T = endDate.diff(startDate);

        // Get the difference in terms of Month and Year.
        let sMonth: number;
        let eMonth: number;
        let sYear: number;
        let eYear: number;

        sMonth = startDate.month;
        eMonth = endDate.month;
        sYear = startDate.year;
        eYear = endDate.year;
        let Months = 0;
        let Years = 0;
        Months = eMonth - sMonth;
        Years = eYear - sYear;
        Months = Months + (Years * 12);

        switch (datePart.toUpperCase()) {
            case 'M':
                iRet = Months;
                break;
            case 'YY':
            case 'YYYY':
                iRet = Years;
                break;
            case 'N':
                iRet = T.totalMinutes;
                break;
            case 'HH':
                iRet = T.totalHours;
                break;
            case 'SS':
                iRet = T.totalSeconds;
                break;
            case 'MS':
                iRet = T.totalMilliseconds;
                break;
            case 'D':
                iRet = T.days;
                break;
            default:
                iRet = 0;
        }

        return (iRet);
    }
}
