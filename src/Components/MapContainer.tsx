import * as topojson from 'topojson';
import styled from 'styled-components';
import { useEffect, useState } from 'react';
import { format } from 'd3-format';
import { scaleThreshold } from 'd3-scale';
import { Spin, Select } from 'antd';
import uniqBy from 'lodash.uniqby';
import sumBy from 'lodash.sumby';
import DistrictMap from '../Data/DistrictShape.json';
import CountryMap from '../Data/CountryShape.json';
import ProjectData from '../Data/projectData.json';
import CountryProjectSummaryData from '../Data/countryProjectSummary.json';
import AccessDataForDistricts from '../Data/accessDataDistrict.json';
import CountryTaxonomy from '../Data/country-taxonomy.json';
import { MapEl } from './Map';
import { LineChartForCountry } from './LineChartForCountry';
import { LineChartForDistrict } from './LineChartForDistrict';
import {
  COLOR_SCALE, LINEAR_SCALE, POP_RANGE, PCT_RANGE,
} from '../Constants';
import { AccessDataType, CountryAccessDataType, ProjectDataType } from '../Types';

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
  padding: 0 2rem 1rem 2rem;
  border-bottom: 1px solid var(--black-500);
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
  font-size: 1.4rem;
  line-height: 2rem;
`;

const BodyHead = styled.div`
  font-size: 1.8rem;
  line-height: 2.4rem;
  font-weight: bold;
`;

const SubNoteEl = styled.span`
  font-size: 1.2rem;
  font-style: italic;
`;

const RowEl = styled.div`
  margin: 1.5rem 0;
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
  height: calc(100vh - 70px);
`;

const DropdownEl = styled.div`
  font-size: 1.2rem;
  text-transform: uppercase;
  margin-top: 1.5rem;
  font-weight: bold;
  .ant-select{
    width: 100%;
  }
`;

const ProjectDataEl = styled.div`
  padding: 1.5rem 0;
  border-top: 1px solid var(--black-500);
  h3 {
    font-size: 1.4rem;
    margin: 0;
    text-transform: uppercase;
    font-weight: bold;
  }
`;

const TableRowEl = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 0.5rem 0;
  font-size: 1.4rem;
`;

const RowValue = styled.div`
  font-size: 1.8rem;
`;

export function MapContainer() {
  const [selectedCountry, setSelectedCountry] = useState<undefined | string>(undefined);
  const [selectedDistrict, setSelectedDistrict] = useState<undefined | string>(undefined);
  const [districtShapeData, setDistrictShapeData] = useState<any>(undefined);
  const [countryShapeData, setCountryShapeData] = useState<any>(undefined);
  const [projectDataShape, setProjectShapeData] = useState<any>(undefined);
  const [countryAccessData, setCountryAccessData] = useState<CountryAccessDataType[] | undefined>(undefined);
  const pctColorScale = scaleThreshold<string | number, string>().domain(PCT_RANGE).range(COLOR_SCALE).unknown('#FAFAFA');
  const peopleNoAccessColorScale = scaleThreshold<string | number, string>().domain(POP_RANGE).range(LINEAR_SCALE).unknown('#FAFAFA');
  useEffect(() => {
    // eslint-disable-next-line no-sequences
    const countryList = uniqBy(AccessDataForDistricts as AccessDataType[], (d) => d.adm2_id.substring(0, 3)).map((d) => d.adm2_id.substring(0, 3));
    const countryTimeSeriesData = countryList.map((country) => {
      const countryFilteredData = (AccessDataForDistricts as AccessDataType[]).filter((d) => d.adm2_id.substring(0, 3) === country);
      return {
        countryID: country,
        name: CountryTaxonomy[CountryTaxonomy.findIndex((c) => c['Alpha-3 code-1'] === country)]['Country or Area'],
        TotPopulation: sumBy(countryFilteredData, 'TotPopulation'),
        PopAccess2020: sumBy(countryFilteredData, 'PopAccess2020'),
        PopNoAccess2020: sumBy(countryFilteredData, 'PopNoAccess2020'),
        PopAccess2019: sumBy(countryFilteredData, 'PopAccess2019'),
        PopNoAccess2019: sumBy(countryFilteredData, 'PopNoAccess2019'),
        PopAccess2018: sumBy(countryFilteredData, 'PopAccess2018'),
        PopNoAccess2018: sumBy(countryFilteredData, 'PopNoAccess2018'),
        PopAccess2017: sumBy(countryFilteredData, 'PopAccess2017'),
        PopNoAccess2017: sumBy(countryFilteredData, 'PopNoAccess2017'),
        PopAccess2016: sumBy(countryFilteredData, 'PopAccess2016'),
        PopNoAccess2016: sumBy(countryFilteredData, 'PopNoAccess2016'),
        PopAccess2015: sumBy(countryFilteredData, 'PopAccess2015'),
        PopNoAccess2015: sumBy(countryFilteredData, 'PopNoAccess2015'),
        PopAccess2014: sumBy(countryFilteredData, 'PopAccess2014'),
        PopNoAccess2014: sumBy(countryFilteredData, 'PopNoAccess2014'),
        PopAccess2013: sumBy(countryFilteredData, 'PopAccess2013'),
        PopNoAccess2013: sumBy(countryFilteredData, 'PopNoAccess2013'),
        PopAccess2012: sumBy(countryFilteredData, 'PopAccess2012'),
        PopNoAccess2012: sumBy(countryFilteredData, 'PopNoAccess2012'),
      };
    });
    const districtShapes: any = ((topojson.feature(DistrictMap as any, (DistrictMap as any).objects.combined_polygon_vlight) as any).features as any).map((district: any, i: number) => {
      const indx = (AccessDataForDistricts as AccessDataType[]).findIndex((d) => d.adm2_id === district.properties.adm2_id);
      const disData = (AccessDataForDistricts as AccessDataType[])[indx];
      const eaAccessPct = indx === -1 ? undefined : (disData.PopAccess2020 * 100) / disData.TotPopulation;
      const eaAccessPctColor = eaAccessPct === undefined ? '#FaFaFa' : pctColorScale(eaAccessPct);
      const eaAccessPop = indx === -1 ? undefined : disData.PopAccess2020;
      const eaNoAccessPop = indx === -1 ? undefined : disData.PopNoAccess2020;
      const eaNoAccessColor = eaNoAccessPop === undefined ? '#FaFaFa' : peopleNoAccessColorScale(eaNoAccessPop);
      const ea50PctOverlay = eaAccessPct === undefined ? 0.9 : eaAccessPct < 50 ? 0 : 0.9;
      const totalPop = indx === -1 ? undefined : disData.TotPopulation;
      // eslint-disable-next-line camelcase
      const adm2_name = indx === -1 ? district.properties.adm2_name : disData.adm2_name;
      const countryISO = district.properties.adm2_id.substring(0, 3);
      return (
        {
          geometry: district.geometry,
          type: district.type,
          properties: {
            // eslint-disable-next-line camelcase
            ...district.properties, eaAccessPct, eaAccessPctColor, eaAccessPop, eaNoAccessColor, totalPop, eaNoAccessPop, ea50PctOverlay, adm2_name, countryISO,
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
    const projectDataGeoJson = ProjectData.map((project: ProjectDataType, i: number) => (
      {
        type: 'Feature',
        properties: {
          'PIMS ID': project['PIMS ID'],
          'Lead Country': project['Lead Country'],
          Region: project.Region,
          status: project.status,
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
    setCountryAccessData(countryTimeSeriesData);
  }, []);

  return (
    <>
      {
        countryShapeData && projectDataShape && districtShapeData && countryAccessData
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
                        {(AccessDataForDistricts as AccessDataType[])[(AccessDataForDistricts as AccessDataType[]).findIndex((d) => d.adm2_id === selectedDistrict)]?.adm2_name}
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
                          countryAccessData.map((d, i) => <Select.Option key={i} value={d.name}>{d.name}</Select.Option>)
                        }
                      </Select>
                    </DropdownEl>
                    <RowEl>
                      <BodyEl>
                        Data is calculated for
                        {' '}
                        {countryAccessData.length}
                        {' '}
                        countries.
                        {' '}
                        <SubNoteEl>
                          Click on a country to explore data for the country
                        </SubNoteEl>
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
                          (AccessDataForDistricts as AccessDataType[])
                            .filter((d) => d.adm2_id.substring(0, 3) === CountryTaxonomy[CountryTaxonomy.findIndex((el) => el['Country or Area'] === selectedCountry)]['Alpha-3 code-1'])
                            .map((d, i) => <Select.Option key={i} value={`${d.adm2_id} | ${d.adm2_name}`}>{d.adm2_name}</Select.Option>)
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
                          `${((countryAccessData[countryAccessData.findIndex((d) => d.name === selectedCountry)].PopAccess2020 * 100) / countryAccessData[countryAccessData.findIndex((d) => d.name === selectedCountry)].TotPopulation).toFixed(2)}%`
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
                          format(',')(Math.round((countryAccessData[countryAccessData.findIndex((d) => d.name === selectedCountry)].PopNoAccess2020))).replaceAll(',', ' ')
                        }
                      </BodyHead>
                    </RowEl>
                    <RowEl>
                      <BodyEl>
                        TimeSeries Data
                      </BodyEl>
                      <BodyHead>
                        {
                          countryAccessData.findIndex((d) => d.name === selectedCountry) !== -1
                            ? <LineChartForCountry data={countryAccessData[countryAccessData.findIndex((d) => d.name === selectedCountry)]} />
                            : 'NA'
                        }
                      </BodyHead>
                    </RowEl>
                    <ProjectDataEl>
                      <h3>
                        UNDP Projects Summary in
                        {' '}
                        {selectedCountry}
                      </h3>
                      <TableRowEl>
                        <div>No. of Projects</div>
                        <RowValue className='bold'>
                          {
                            CountryProjectSummaryData.findIndex((d) => d['Lead Country'] === selectedCountry) === -1
                              ? 'NA'
                              : CountryProjectSummaryData[CountryProjectSummaryData.findIndex((d) => d['Lead Country'] === selectedCountry)]['Number of projects']
                          }
                        </RowValue>
                      </TableRowEl>
                      <TableRowEl>
                        <div>Grant Amount</div>
                        <RowValue className='bold'>
                          {
                            CountryProjectSummaryData.findIndex((d) => d['Lead Country'] === selectedCountry) === -1
                              ? 'NA'
                              : `US$ ${format('.3s')(CountryProjectSummaryData[CountryProjectSummaryData.findIndex((d) => d['Lead Country'] === selectedCountry)]['Grant Amount']).replace('G', 'B')}`
                          }
                        </RowValue>
                      </TableRowEl>
                      <TableRowEl>
                        <div>Expenses</div>
                        <RowValue className='bold'>
                          {
                            CountryProjectSummaryData.findIndex((d) => d['Lead Country'] === selectedCountry) === -1
                              ? 'NA'
                              : `US$ ${format('.3s')(CountryProjectSummaryData[CountryProjectSummaryData.findIndex((d) => d['Lead Country'] === selectedCountry)].Expenses).replace('G', 'B')}`
                          }
                        </RowValue>
                      </TableRowEl>
                    </ProjectDataEl>
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
                          (AccessDataForDistricts as AccessDataType[]).findIndex((d: any) => d.adm2_id === selectedDistrict) !== -1
                            ? `${
                              (AccessDataForDistricts as AccessDataType[])[(AccessDataForDistricts as AccessDataType[]).findIndex((d) => d.adm2_id === selectedDistrict)].PopAccess2020
                                ? (((AccessDataForDistricts as AccessDataType[])[(AccessDataForDistricts as AccessDataType[]).findIndex((d) => d.adm2_id === selectedDistrict)].PopAccess2020 * 100) / (AccessDataForDistricts as AccessDataType[])[(AccessDataForDistricts as AccessDataType[]).findIndex((d: any) => d.adm2_id === selectedDistrict)].TotPopulation).toFixed(1)
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
                          (AccessDataForDistricts as AccessDataType[]).findIndex((d: any) => d.adm2_id === selectedDistrict) !== -1
                            ? `${
                              (AccessDataForDistricts as AccessDataType[])[(AccessDataForDistricts as AccessDataType[]).findIndex((d) => d.adm2_id === selectedDistrict)].PopAccess2020
                                ? format(',')(Math.round((AccessDataForDistricts as AccessDataType[])[(AccessDataForDistricts as AccessDataType[]).findIndex((d) => d.adm2_id === selectedDistrict)].PopNoAccess2020 as number)).replaceAll(',', ' ')
                                : format(',')(Math.round((AccessDataForDistricts as AccessDataType[])[(AccessDataForDistricts as AccessDataType[]).findIndex((d) => d.adm2_id === selectedDistrict)].TotPopulation as number)).replaceAll(',', ' ')
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
                          (AccessDataForDistricts as AccessDataType[]).findIndex((d) => d.adm2_id === selectedDistrict) !== -1
                            ? <LineChartForDistrict data={(AccessDataForDistricts as AccessDataType[])[(AccessDataForDistricts as AccessDataType[]).findIndex((d) => d.adm2_id === selectedDistrict)]} />
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
        countryShapeData && projectDataShape && districtShapeData && countryAccessData
          ? (
            <MapEl
              districtShapes={districtShapeData}
              countryAccessData={countryAccessData}
              selectedDistrict={selectedDistrict}
              countryShapes={countryShapeData}
              projectData={projectDataShape}
              setSelectedCountry={setSelectedCountry}
              setSelectedDistrict={setSelectedDistrict}
              selectedCountry={selectedCountry}
            />
          )
          : (
            <LoadingEl>
              <Spin size='large' />
            </LoadingEl>
          )
      }
    </>
  );
}
