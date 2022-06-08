export interface AccessDataType {
  adm2_id: string;
  TotPopulation: number;
  PopAccess2020: number;
  PopNoAccess2020: number;
  PopAccess2019: number;
  PopNoAccess2019: number;
  PopAccess2018: number;
  PopNoAccess2018: number;
  PopAccess2017: number;
  PopNoAccess2017: number;
  PopAccess2016: number;
  PopNoAccess2016: number;
  PopAccess2015: number;
  PopNoAccess2015: number;
  PopAccess2014: number;
  PopNoAccess2014: number;
  PopAccess2013: number;
  PopNoAccess2013: number;
  PopAccess2012: number;
  PopNoAccess2012: number;
  adm2_name: string;
  Areakm2: number;
}
export interface AccessDataWithRWIDataType extends AccessDataType {
  RWI?: number;
}

export interface CountryAccessDataType {
  TotPopulation: number;
  PopAccess2020: number;
  PopNoAccess2020: number;
  PopAccess2019: number;
  PopNoAccess2019: number;
  PopAccess2018: number;
  PopNoAccess2018: number;
  PopAccess2017: number;
  PopNoAccess2017: number;
  PopAccess2016: number;
  PopNoAccess2016: number;
  PopAccess2015: number;
  PopNoAccess2015: number;
  PopAccess2014: number;
  PopNoAccess2014: number;
  PopAccess2013: number;
  PopNoAccess2013: number;
  PopAccess2012: number;
  PopNoAccess2012: number;
  PopNoAccess2020LowRWI: number;
  PopNoAccess2019LowRWI: number;
  PopNoAccess2018LowRWI: number;
  PopNoAccess2017LowRWI: number;
  PopNoAccess2016LowRWI: number;
  PopNoAccess2015LowRWI: number;
  PopNoAccess2014LowRWI: number;
  PopNoAccess2013LowRWI: number;
  PopNoAccess2012LowRWI: number;
  countryID: string;
  name: string;
  }

export interface ProjectDataType {
  'PIMS ID': number,
  'Lead Country': string,
  'Region': string,
  'Participating Countries': string,
  'Latitude': number,
  'Longitude': number,
  'Scope'?: string,
  'Grant Amount'?: number,
  'GL Expenses'?: number,
  'Co-Financing'?: number,
  'tonnes of CO2-eq emissions avoided or reduced'?: number,
  'km of coast strengthened and/or better managed for climate change'?: string | number,
  'status': string;
}

export interface CountryProjectSummaryDataType {
  'Lead Country': string;
  'People directly benefiting': number;
  'Tonnes of CO2 emissions reduced': number;
  'MW of renewable energy capacity installed': number;
  'Grant Amount': number;
  'Expenses': number;
  'Co-Financing': number;
  'Number of projects': number;
}
