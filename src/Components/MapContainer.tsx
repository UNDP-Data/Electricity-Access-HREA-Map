import * as topojson from 'topojson';
import styled from 'styled-components';
import { useEffect, useState } from 'react';
import { format } from 'd3-format';
import { scaleThreshold } from 'd3-scale';
import { Spin, Select } from 'antd';
import DistrictMap from '../Data/DistrictShape.json';
import CountryMap from '../Data/CountryShape.json';
import ProjectData from '../Data/projectData.json';
import TimeSeriesData from '../Data/timeSeriesData.json';
import AccessDataForDistricts from '../Data/accessDataDistrict.json';
import CountryTaxonomy from '../Data/country-taxonomy.json';
import { MapEl } from './Map';
import { LineChart } from './LineChart';
import { LineChartForDistrict } from './LineChartForDistrict';
import {
  COLOR_SCALE, LINEAR_SCALE, POP_RANGE, PCT_RANGE,
} from '../Constants';

const SideBar = styled.div`
  padding: 2rem 0 0 0;
  position: fixed;
  z-index: 1000;
  top: 12rem;
  left: 4rem;
  border-radius: 0.4rem;
  box-shadow: var(--shadow);
  font-size: 1.6rem;
  background-color: var(--white-opacity);
  width: 32rem;
  color: var(--black-700);
`;

const HeadingEl = styled.div`
  font-size: 2.4rem;
  line-height: 3.2rem;
  font-weight: bold;
  padding: 0 2rem 2rem 2rem;
  border-bottom: 1px solid var(--black-400);
  margin: 0;
`;

const SubNoteSpan = styled.span`
  font-size: 1.4rem;
  font-weight: normal;
`;

const BodyContainer = styled.div`
  padding: 0 2rem;
`;

const BodyEl = styled.div`
  font-size: 1.6rem;
  line-height: 2.4rem;
`;

const BodyHead = styled.div`
  font-size: 2rem;
  line-height: 2.4rem;
  font-weight: bold;
`;

const SubNoteEl = styled.span`
  font-size: 1.4rem;
  font-style: italic;
`;

const RowEl = styled.div`
  margin: 2rem 0;
`;

const BackEl = styled.div`
  font-size: 1.4rem;
  color: var(--primary-blue);
  cursor: pointer;
  marign-bottom: 1rem;
`;

const getBoundingBox = (data: any) => {
  const bounds = {
    xMin: 1000,
    yMin: 1000,
    xMax: -1000,
    yMax: -1000,
  };
  if (data.geometry.type === 'Polygon') {
    for (let i = 0; i < data.geometry.coordinates.length; i += 1) {
      const coords = data.geometry.coordinates[i];
      for (let j = 0; j < coords.length; j += 1) {
        bounds.xMin = bounds.xMin < coords[j][0] ? bounds.xMin : coords[j][0];
        bounds.xMax = bounds.xMax > coords[j][0] ? bounds.xMax : coords[j][0];
        bounds.yMin = bounds.yMin < coords[j][1] ? bounds.yMin : coords[j][1];
        bounds.yMax = bounds.yMax > coords[j][1] ? bounds.yMax : coords[j][1];
      }
    }
    return bounds;
  }
  for (let i = 0; i < data.geometry.coordinates.length; i += 1) {
    for (let k = 0; k < data.geometry.coordinates[i].length; k += 1) {
      const coords = data.geometry.coordinates[i][k];
      for (let j = 0; j < coords.length; j += 1) {
        bounds.xMin = bounds.xMin < coords[j][0] ? bounds.xMin : coords[j][0];
        bounds.xMax = bounds.xMax > coords[j][0] ? bounds.xMax : coords[j][0];
        bounds.yMin = bounds.yMin < coords[j][1] ? bounds.yMin : coords[j][1];
        bounds.yMax = bounds.yMax > coords[j][1] ? bounds.yMax : coords[j][1];
      }
    }
  }
  return bounds;
};

const LoadingEl = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: calc(100vh - 76px);
`;

const DropdownEl = styled.div`
  font-size: 1.4rem;
  font-weight: bold;
  .ant-select{
    width: 100%;
  }
`;

export function MapContainer() {
  const [selectedCountry, setSelectedCountry] = useState<undefined | string>(undefined);
  const [selectedDistrict, setSelectedDistrict] = useState<undefined | string>(undefined);
  const [districtShapeData, setDistrictShapeData] = useState<any>(undefined);
  const [countryShapeData, setCountryShapeData] = useState<any>(undefined);
  const [projectDataShape, setProjectShapeData] = useState<any>(undefined);
  const pctColorScale = scaleThreshold<string | number, string>().domain(PCT_RANGE).range(COLOR_SCALE).unknown('#FAFAFA');
  const peopleNoAccessColorScale = scaleThreshold<string | number, string>().domain(POP_RANGE).range(LINEAR_SCALE).unknown('#FAFAFA');
  useEffect(() => {
    const districtShapes: any = ((topojson.feature(DistrictMap as any, (DistrictMap as any).objects.combined_polygon_vlight) as any).features as any).map((district: any, i: number) => {
      const indx = (AccessDataForDistricts as any).findIndex((d: any) => d.adm2_id === district.properties.adm2_id);
      const disData = (AccessDataForDistricts as any)[indx];
      const eaAccessPct = indx === -1 ? undefined : (disData.PopAccess2020 * 100) / disData.TotPopulation;
      const eaAccessPctColor = eaAccessPct === undefined ? '#FaFaFa' : pctColorScale(eaAccessPct);
      const eaAccessPop = indx === -1 ? undefined : disData.PopAccess2020;
      const eaNoAccessPop = indx === -1 ? undefined : disData.PopNoAccess2020;
      const eaNoAccessColor = eaNoAccessPop === undefined ? '#FaFaFa' : peopleNoAccessColorScale(eaNoAccessPop);
      const ea50PctOverlay = eaAccessPct === undefined ? 0.9 : eaAccessPct < 50 ? 0 : 0.9;
      const totalPop = indx === -1 ? undefined : disData.TotPopulation;
      // eslint-disable-next-line camelcase
      const adm2_name = indx === -1 ? district.properties.adm2_name : disData.adm2_name;
      return (
        {
          geometry: district.geometry,
          type: district.type,
          properties: {
            // eslint-disable-next-line camelcase
            ...district.properties, eaAccessPct, eaAccessPctColor, eaAccessPop, eaNoAccessColor, totalPop, eaNoAccessPop, ea50PctOverlay, adm2_name,
          },
          id: i + 1000,
        });
    });
    const countryShapes: any = ((topojson.feature(CountryMap as any, (CountryMap as any).objects.combined_polygon_vlight) as any).features as any).map((country: any, i: number) => (
      {
        geometry: country.geometry,
        type: country.type,
        properties: {
          // eslint-disable-next-line camelcase
          ...country.properties, boundingBox: getBoundingBox(country),
        },
        id: i + 1,
      }
    ));
    const projectDataGeoJson = ProjectData.map((project: any, i: number) => (
      {
        type: 'Feature',
        properties: {
          'PIMS ID': 3523,
          'Lead Country': 'Egypt',
          Region: 'RBAS',
          'Participating Countries': 'Egypt',
          'Grant Amount': 6900000,
          'GL Expenses': 6866297.68,
          'Co-Financing': 100000,
          'tonnes of CO2-eq emissions avoided or reduced': 660583,
          'km of coast strengthened and/or better managed for climate change': '　',
          status: 'Completed',
        },
        geometry: {
          type: 'Point',
          coordinates: [project.Longitude, project.Latitude],
        },
        id: i,
      }
    ));
    setDistrictShapeData(districtShapes);
    setCountryShapeData(countryShapes);
    setProjectShapeData(projectDataGeoJson);
  }, []);

  return (
    <>
      {
        countryShapeData && projectDataShape && districtShapeData
          ? (
            <SideBar>
              <HeadingEl>
                {
                  selectedDistrict ? (
                    <BackEl onClick={() => {
                      setSelectedDistrict(undefined);
                    }}
                    >
                      {`← Back to ${selectedCountry}`}
                    </BackEl>
                  )
                    : selectedCountry ? (
                      <BackEl onClick={() => {
                        setSelectedCountry(undefined);
                      }}
                      >
                        ← Back to Global View
                      </BackEl>
                    ) : null
                }
                {
                  selectedDistrict
                    ? (
                      <>
                        {(AccessDataForDistricts as any)[(AccessDataForDistricts as any).findIndex((d: any) => d.adm2_id === selectedDistrict)]?.adm2_name}
                        {' '}
                        <SubNoteSpan>
                          (
                          {selectedCountry}
                          )
                        </SubNoteSpan>
                      </>
                    )
                    : selectedCountry || 'World'
                }
              </HeadingEl>
              {
                !selectedCountry && !selectedDistrict ? (
                  <BodyContainer>
                    <DropdownEl>
                      <div>
                        Select Country
                      </div>
                      <Select
                        showSearch
                        placeholder='Select a country'
                        onChange={(d) => { setSelectedCountry(d); }}
                      >
                        {
                          countryShapeData.map((d: any, i: number) => <Select.Option key={i} value={CountryTaxonomy[CountryTaxonomy.findIndex((el) => el['Alpha-3 code-1'] === d.properties.iso_3)]['Country or Area']}>{CountryTaxonomy[CountryTaxonomy.findIndex((el) => el['Alpha-3 code-1'] === d.properties.iso_3)]['Country or Area']}</Select.Option>)
                        }
                      </Select>
                    </DropdownEl>
                    <RowEl>
                      <BodyEl>
                        Data is calculated for
                        {' '}
                        {countryShapeData ? countryShapeData.length : ''}
                        {' '}
                        countries.
                        {' '}
                        <SubNoteEl>
                          Click on a country to explore data for the country
                        </SubNoteEl>
                      </BodyEl>
                    </RowEl>
                    <RowEl>
                      <BodyEl className='bold'>
                        Methodology
                      </BodyEl>
                      <BodyEl>
                        Lorem Ipsum Dolor Sit Amet
                      </BodyEl>
                    </RowEl>
                  </BodyContainer>
                ) : null
              }
              {
                selectedCountry && !selectedDistrict ? (
                  <BodyContainer>
                    <DropdownEl>
                      <div>
                        Select District
                      </div>
                      <Select
                        showSearch
                        placeholder='Select a District'
                        onChange={(d) => { setSelectedDistrict(d.split(' | ')[0]); }}
                      >
                        {
                          (AccessDataForDistricts as any)
                            .filter((d: any) => d.adm2_id.substring(0, 3) === CountryTaxonomy[CountryTaxonomy.findIndex((el) => el['Country or Area'] === selectedCountry)]['Alpha-3 code-1'])
                            .map((d: any, i: number) => <Select.Option key={i} value={`${d.adm2_id} | ${d.adm2_name}`}>{d.adm2_name}</Select.Option>)
                        }
                      </Select>
                    </DropdownEl>
                    <RowEl>
                      <BodyEl>
                        Percent Electrcity Access
                        {' '}
                        <SubNoteEl>(2020)</SubNoteEl>
                      </BodyEl>
                      <BodyHead>
                        {
                          TimeSeriesData.findIndex((d) => d.country === selectedCountry && d.year === 2020) !== -1
                            ? `${TimeSeriesData[TimeSeriesData.findIndex((d) => d.country === selectedCountry && d.year === 2020)].pct_pop_elec_HREA}%`
                            : 'NA'
                        }
                      </BodyHead>
                    </RowEl>
                    <RowEl>
                      <BodyEl>
                        No. Of People Without Electricity
                        {' '}
                        <SubNoteEl>(2020)</SubNoteEl>
                      </BodyEl>
                      <BodyHead>
                        {
                          TimeSeriesData.findIndex((d) => d.country === selectedCountry && d.year === 2020) !== -1
                            ? format(',')(Math.round((TimeSeriesData[TimeSeriesData.findIndex((d) => d.country === selectedCountry && d.year === 2020)].pop * (100 - TimeSeriesData[TimeSeriesData.findIndex((d) => d.country === selectedCountry && d.year === 2020)].pct_pop_elec_HREA)) / 100)).replaceAll(',', ' ')
                            : 'NA'
                        }
                      </BodyHead>
                    </RowEl>
                    <RowEl>
                      <BodyEl>
                        TimeSeries Data
                      </BodyEl>
                      <BodyHead>
                        {
                          TimeSeriesData.filter((d) => d.country === selectedCountry).length !== 0
                            ? <LineChart data={TimeSeriesData.filter((d) => d.country === selectedCountry)} />
                            : 'NA'
                        }
                      </BodyHead>
                    </RowEl>
                  </BodyContainer>
                ) : null
              }
              {
                selectedDistrict ? (
                  <BodyContainer>
                    <RowEl>
                      <BodyEl>
                        Percent Electrcity Access
                        {' '}
                        <SubNoteEl>(2020)</SubNoteEl>
                      </BodyEl>
                      <BodyHead>
                        {
                          (AccessDataForDistricts as any).findIndex((d: any) => d.adm2_id === selectedDistrict) !== -1
                            ? `${
                              (AccessDataForDistricts as any)[(AccessDataForDistricts as any).findIndex((d: any) => d.adm2_id === selectedDistrict)].PopAccess2020
                                ? (((AccessDataForDistricts as any)[(AccessDataForDistricts as any).findIndex((d: any) => d.adm2_id === selectedDistrict)].PopAccess2020 * 100) / (AccessDataForDistricts as any)[(AccessDataForDistricts as any).findIndex((d: any) => d.adm2_id === selectedDistrict)].TotPopulation).toFixed(1)
                                : 0
                            } %`
                            : 'NA'
                        }
                      </BodyHead>
                    </RowEl>
                    <RowEl>
                      <BodyEl>
                        No. Of People Without Electricity
                        {' '}
                        <SubNoteEl>(2020)</SubNoteEl>
                      </BodyEl>
                      <BodyHead>
                        {
                          (AccessDataForDistricts as any).findIndex((d: any) => d.adm2_id === selectedDistrict) !== -1
                            ? `${
                              (AccessDataForDistricts as any)[(AccessDataForDistricts as any).findIndex((d: any) => d.adm2_id === selectedDistrict)].PopAccess2020
                                ? format(',')(Math.round((AccessDataForDistricts as any)[(AccessDataForDistricts as any).findIndex((d: any) => d.adm2_id === selectedDistrict)].PopNoAccess2020 as number)).replaceAll(',', ' ')
                                : format(',')(Math.round((AccessDataForDistricts as any)[(AccessDataForDistricts as any).findIndex((d: any) => d.adm2_id === selectedDistrict)].TotPopulation as number)).replaceAll(',', ' ')
                            }`
                            : 'NA'
                        }
                      </BodyHead>
                    </RowEl>
                    <RowEl>
                      <BodyEl>
                        TimeSeries Data
                      </BodyEl>
                      <BodyHead>
                        {
                          (AccessDataForDistricts as any).findIndex((d: any) => d.adm2_id === selectedDistrict) !== -1
                            ? <LineChartForDistrict data={(AccessDataForDistricts as any)[(AccessDataForDistricts as any).findIndex((d: any) => d.adm2_id === selectedDistrict)]} />
                            : 'NA'
                        }
                      </BodyHead>
                    </RowEl>
                  </BodyContainer>
                ) : null
              }
            </SideBar>
          ) : null
      }
      {
        countryShapeData && projectDataShape && districtShapeData
          ? <MapEl districtShapes={districtShapeData} selectedDistrict={selectedDistrict} countryShapes={countryShapeData} projectData={projectDataShape} setSelectedCountry={setSelectedCountry} setSelectedDistrict={setSelectedDistrict} selectedCountry={selectedCountry} />
          : (
            <LoadingEl>
              <Spin size='large' />
            </LoadingEl>
          )
      }
    </>
  );
}
