export class CDays360 {

    public static Days360(pDateFrom: Date, pDateTo: Date) {
        return CDays360.Days3602(pDateFrom, pDateTo, true);
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

        iret = (30 - mDayFrom) + daysFullMonth;

        iret = (30) + daysFullMonth;

        iret = ((pDateTo.getFullYear() - pDateFrom.getFullYear()) * 360) + ((pDateTo.getUTCMonth() - pDateFrom.getUTCMonth()) * 30) + (mDayTo - mDayFrom);

        if (mDayFrom == 1 && mDayTo >= 30) {
            iret++;
        }
        else if (mDayFrom == 1 && mDayTo == 1) {
            iret++;
        } else if (daysFullMonth < 360 && this.diffYears(pDateFrom, pDateTo) > 0) {
            iret = (30) + daysFullMonth;
        } else if (mDayFrom == mDayTo && this.diffYears(pDateFrom, pDateTo) == 0 && this.diffMonths(pDateFrom, pDateTo) == 1) {
            iret = 31;
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
}