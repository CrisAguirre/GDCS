import DateTime from './DateTime';
export class Fechas {

	public static Fechas(FechaFin: Date, FechaIni: Date) {
        return Fechas.diferenciaAMD(FechaFin, FechaIni);
        // return CDays360.Days360V2(pDateFrom, pDateTo);
    }


	public static diferenciaAMD(FechaFin: Date, FechaIni: Date) {
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
			fechaAux = new DateTime(Years, Months, FechaIni.getDate());
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
}