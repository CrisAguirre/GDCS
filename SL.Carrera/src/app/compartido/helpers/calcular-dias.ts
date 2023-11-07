export class CalcularDias {

	public anio: number;
	public mes: number;
	public dia: number;
	
    //public static dias(pDateFrom: Date, pDateTo: Date) {

    }

   /* public static calcularDias(dFechaIni: Date, dFechaFin: Date) {
        let A: number;
        let M: number;
        let D: number;
        let iFactorMultiplicador: number;

        //si la fecha de fin es menor a la fecha de inicio
		if (dFechaFin.getTime() < dFechaIni.getTime()){
			 return 0;
		}else {
			A = A * iFactorMultiplicador;
			M = M * iFactorMultiplicador;
			D = D * iFactorMultiplicador;
		}

	}*/
	

	/*public DiferenciaAMD(FechaIni :Date, FechaFin: Date)
	{	
		let sMonth: number;
		let eMonth: number;
		let sYear: number;
		let eYear: number;

		let Months: number;
		let Years: number;
		let FechaFinDiaMas: Date;
		
	
		//No soporta fechaini mayor
		if (FechaIni > FechaFin)
			return 0;
		//Get the difference in terms of Month and Year.
		//trabajar con fecha posterior a fechafin
		FechaFinDiaMas.setDate(FechaFin.getDate()+1);
		sMonth = FechaIni.getMonth();
		eMonth = FechaFinDiaMas.getMonth();
		sYear = FechaIni.getFullYear();
		eYear = FechaFinDiaMas.getFullYear();
	
		// calculate Year
		if (eMonth >= sMonth)
			Years = eYear - sYear;
		else
			Years = eYear - sYear - 1;
	
		//calculate Months
		if (eMonth >= sMonth)
			Months = eMonth - sMonth;
		else
			Months = (12 - sMonth) + eMonth;
		if (FechaFinDiaMas.getDay() < FechaIni.getDay() && Months > 0)
			Months--;
	
		//calculate Days
		/let t: any;
		let fechaAux: Date = FechaIni;
		fechaAux.setFullYear(fechaAux.getFullYear()+Years);
		fechaAux.setMonth(fechaAux.getMonth()+Months)


		t = (FechaFinDiaMas.getDay() - fechaAux.getDay());
		this.dia == t.Days;
		if (this.dia< 0)
		{
			Years--;
			Months += 11;
			t = (FechaFinDiaMas.getDay() - fechaAux.getDay());
			this.dia = t.Days; 
		}
		//D++;
		this.anio = Years;
		this.mes = Months;
	}

}*/