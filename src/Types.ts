export interface AccessDataType {
  adm2_id: string;
  TotPopulation: number;
  PopAccess2020: number;
  PopAccess2019: number;
  PopAccess2018: number;
  PopAccess2017: number;
  PopAccess2016: number;
  PopAccess2015: number;
  PopAccess2014: number;
  PopAccess2013: number;
  PopAccess2012: number;
  adm2_name: string;
  RWI?: number;
}

export interface CountryAccessDataType {
  TotPopulation: number;
  PopAccess2020: number;
  PopAccess2019: number;
  PopAccess2018: number;
  PopAccess2017: number;
  PopAccess2016: number;
  PopAccess2015: number;
  PopAccess2014: number;
  PopAccess2013: number;
  PopAccess2012: number;
  TotPopulationLowRWI: number;
  PopAccess2020LowRWI: number;
  PopAccess2019LowRWI: number;
  PopAccess2018LowRWI: number;
  PopAccess2017LowRWI: number;
  PopAccess2016LowRWI: number;
  PopAccess2015LowRWI: number;
  PopAccess2014LowRWI: number;
  PopAccess2013LowRWI: number;
  PopAccess2012LowRWI: number;
  countryID: string;
  name: string;
  }

export interface ProjectDataType {
  'Lead Country': string,
  'Latitude': number,
  'Longitude': number,
}

export interface CountryProjectSummaryDataType {
  'Lead Country': string;
  'Grant Amount': number;
  'Expenses': number;
  'Number of projects': number;
}
