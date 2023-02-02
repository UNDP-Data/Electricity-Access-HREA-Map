import * as topojson from 'topojson';
import styled from 'styled-components';
import { useEffect, useState } from 'react';
import { format } from 'd3-format';
import { scaleThreshold } from 'd3-scale';
import {
  Select, Radio, Space, Slider, Checkbox,
} from 'antd';
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
import { AccessDataType, CountryAccessDataType } from '../Types';

const SideBar = styled.div`
  position: absolute;
  padding: 2rem;
  z-index: 5;
  margin: 1rem 0 0 1rem;
  background-color: rgba(255,255,255,0.75);
  width: 25rem;
`;

const KeyEl = styled.div`
  padding: 1rem;
  position: absolute;
  z-index: 5;
  bottom: 0;
  right: 0;
  margin: 0 1rem 1rem 0;
  background-color: rgba(255,255,255,0.75);
  div {
    font-size: 1rem;
    margin-bottom: 0.25rem;
  }
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

const LayerSelectorEl = styled.div`
  padding: 1rem;
  position: absolute;
  right: 0;
  margin: 1rem 1rem 0 0;
  z-index: 5;
  background-color: rgba(255, 255,255, 0.75);
  float: right;
`;

export function MapContainer() {
  const [selectedCountry, setSelectedCountry] = useState<undefined | string>(undefined);
  const [selectedDistrict, setSelectedDistrict] = useState<undefined | string>(undefined);
  const [districtShapeData, setDistrictShapeData] = useState<any>(undefined);
  const [countryShapeData, setCountryShapeData] = useState<any>(undefined);
  const [projectDataShape, setProjectShapeData] = useState<any>(undefined);
  const [worldData, setWorldData] = useState<CountryAccessDataType | undefined>(undefined);
  const [layer, setLayer] = useState<1 | 2 | 3 >(1);
  const [showProjects, setShowProjects] = useState<boolean>(false);
  const [hideLabels, setHideLabels] = useState<boolean>(false);
  const [showPoorRegions, setShowPoorRegions] = useState<boolean>(false);
  const [highlightThreshold, setHighlightThreshold] = useState(100);
  const [countryAccessData, setCountryAccessData] = useState<CountryAccessDataType[] | undefined>(undefined);
  const pctColorScale = scaleThreshold<string | number, string>().domain(PCT_RANGE).range(COLOR_SCALE).unknown('#FAFAFA');
  const peopleNoAccessColorScale = scaleThreshold<string | number, string>().domain(POP_RANGE).range(LINEAR_SCALE).unknown('#FAFAFA');
  const keyBarWid = 40;
  useEffect(() => {
    // eslint-disable-next-line no-sequences
    const countryList = uniqBy(AccessDataForDistricts as AccessDataType[], (d) => d.adm2_id.substring(0, 3)).map((d) => d.adm2_id.substring(0, 3));
    const AllDatLowRWI = (AccessDataForDistricts as AccessDataType[]).filter((d) => d.RWI && d.RWI < 0);
    const WorldDataCalculated = {
      countryID: 'XXX',
      name: 'World',
      TotPopulation: sumBy((AccessDataForDistricts as AccessDataType[]), 'TotPopulation'),
      PopAccess2020: sumBy((AccessDataForDistricts as AccessDataType[]), 'PopAccess2020'),
      PopAccess2019: sumBy((AccessDataForDistricts as AccessDataType[]), 'PopAccess2019'),
      PopAccess2018: sumBy((AccessDataForDistricts as AccessDataType[]), 'PopAccess2018'),
      PopAccess2017: sumBy((AccessDataForDistricts as AccessDataType[]), 'PopAccess2017'),
      PopAccess2016: sumBy((AccessDataForDistricts as AccessDataType[]), 'PopAccess2016'),
      PopAccess2015: sumBy((AccessDataForDistricts as AccessDataType[]), 'PopAccess2015'),
      PopAccess2014: sumBy((AccessDataForDistricts as AccessDataType[]), 'PopAccess2014'),
      PopAccess2013: sumBy((AccessDataForDistricts as AccessDataType[]), 'PopAccess2013'),
      PopAccess2012: sumBy((AccessDataForDistricts as AccessDataType[]), 'PopAccess2012'),
      TotPopulationLowRWI: sumBy(AllDatLowRWI, 'TotPopulation'),
      PopAccess2020LowRWI: sumBy(AllDatLowRWI, 'PopAccess2020'),
      PopAccess2019LowRWI: sumBy(AllDatLowRWI, 'PopAccess2019'),
      PopAccess2018LowRWI: sumBy(AllDatLowRWI, 'PopAccess2018'),
      PopAccess2017LowRWI: sumBy(AllDatLowRWI, 'PopAccess2017'),
      PopAccess2016LowRWI: sumBy(AllDatLowRWI, 'PopAccess2016'),
      PopAccess2015LowRWI: sumBy(AllDatLowRWI, 'PopAccess2015'),
      PopAccess2014LowRWI: sumBy(AllDatLowRWI, 'PopAccess2014'),
      PopAccess2013LowRWI: sumBy(AllDatLowRWI, 'PopAccess2013'),
      PopAccess2012LowRWI: sumBy(AllDatLowRWI, 'PopAccess2012'),
    };
    const countryTimeSeriesData = countryList.map((country) => {
      const countryFilteredData = (AccessDataForDistricts as AccessDataType[]).filter((d) => d.adm2_id.substring(0, 3) === country);
      const countrFilteredDatLowRWI = (AccessDataForDistricts as AccessDataType[]).filter((d) => d.adm2_id.substring(0, 3) === country && d.RWI && d.RWI < 0);
      return {
        countryID: country,
        name: CountryTaxonomy[CountryTaxonomy.findIndex((c) => c['Alpha-3 code-1'] === country)]['Country or Area'],
        TotPopulation: sumBy(countryFilteredData, 'TotPopulation'),
        PopAccess2020: sumBy(countryFilteredData, 'PopAccess2020'),
        PopAccess2019: sumBy(countryFilteredData, 'PopAccess2019'),
        PopAccess2018: sumBy(countryFilteredData, 'PopAccess2018'),
        PopAccess2017: sumBy(countryFilteredData, 'PopAccess2017'),
        PopAccess2016: sumBy(countryFilteredData, 'PopAccess2016'),
        PopAccess2015: sumBy(countryFilteredData, 'PopAccess2015'),
        PopAccess2014: sumBy(countryFilteredData, 'PopAccess2014'),
        PopAccess2013: sumBy(countryFilteredData, 'PopAccess2013'),
        PopAccess2012: sumBy(countryFilteredData, 'PopAccess2012'),
        TotPopulationLowRWI: sumBy(countrFilteredDatLowRWI, 'TotPopulation'),
        PopAccess2020LowRWI: sumBy(countrFilteredDatLowRWI, 'PopAccess2020'),
        PopAccess2019LowRWI: sumBy(countrFilteredDatLowRWI, 'PopAccess2019'),
        PopAccess2018LowRWI: sumBy(countrFilteredDatLowRWI, 'PopAccess2018'),
        PopAccess2017LowRWI: sumBy(countrFilteredDatLowRWI, 'PopAccess2017'),
        PopAccess2016LowRWI: sumBy(countrFilteredDatLowRWI, 'PopAccess2016'),
        PopAccess2015LowRWI: sumBy(countrFilteredDatLowRWI, 'PopAccess2015'),
        PopAccess2014LowRWI: sumBy(countrFilteredDatLowRWI, 'PopAccess2014'),
        PopAccess2013LowRWI: sumBy(countrFilteredDatLowRWI, 'PopAccess2013'),
        PopAccess2012LowRWI: sumBy(countrFilteredDatLowRWI, 'PopAccess2012'),
      };
    });
    const districtShapes: any = ((topojson.feature(DistrictMap as any, (DistrictMap as any).objects.combined_polygon_vlight) as any).features as any).map((district: any, i: number) => {
      const indx = (AccessDataForDistricts as AccessDataType[]).findIndex((d) => d.adm2_id === district.properties.adm2_id);
      const disData = (AccessDataForDistricts as AccessDataType[])[indx];
      const eaAccessPct = indx === -1 ? undefined : (disData.PopAccess2020 * 100) / disData.TotPopulation;
      const eaAccessPctColor = eaAccessPct === undefined ? '#FaFaFa' : pctColorScale(eaAccessPct);
      const eaAccessPop = indx === -1 ? undefined : disData.PopAccess2020;
      const eaNoAccessPop = indx === -1 ? undefined : disData.TotPopulation - disData.PopAccess2020;
      const eaNoAccessColor = eaNoAccessPop === undefined ? '#FaFaFa' : peopleNoAccessColorScale(eaNoAccessPop);
      const totalPop = indx === -1 ? undefined : disData.TotPopulation;
      // eslint-disable-next-line camelcase
      const adm2_name = indx === -1 ? district.properties.adm2_name : disData.adm2_name;
      // eslint-disable-next-line camelcase
      const iso_3 = district.properties.adm2_id.substring(0, 3);
      // eslint-disable-next-line camelcase
      const countryName = CountryTaxonomy[CountryTaxonomy.findIndex((country) => country['Alpha-3 code-1'] === iso_3)]['Country or Area'];
      const RWI_AVG = indx === -1 || disData.RWI === undefined ? 1000 : disData.RWI;
      return (
        {
          geometry: district.geometry,
          type: district.type,
          properties: {
            // eslint-disable-next-line camelcase
            ...district.properties, eaAccessPct, eaAccessPctColor, eaAccessPop, eaNoAccessColor, totalPop, eaNoAccessPop, adm2_name, iso_3, countryName, RWI_AVG,
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
          Title: project.Title,
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
    setWorldData(WorldDataCalculated);
  }, []);

  return (
    <div style={{ height: window.location.href.includes('data.undp.org') ? '80rem' : 'calc(100vh - 80px)', position: 'relative' }}>
      {
        countryShapeData && projectDataShape && districtShapeData && countryAccessData && worldData
          ? (
            <SideBar>
              {
                selectedDistrict ? (
                  <button
                    type='button'
                    className='undp-button button-tertiary'
                    onClick={() => {
                      setSelectedDistrict(undefined);
                    }}
                  >
                    {`← Back to ${selectedCountry}`}
                  </button>
                )
                  : selectedCountry ? (
                    <button
                      type='button'
                      className='undp-button button-tertiary'
                      onClick={() => {
                        setSelectedCountry(undefined);
                      }}
                    >
                      ← Back to Global View
                    </button>
                  ) : null
              }
              <h3 className='undp-typography margin-bottom-04'>
                {
                  selectedDistrict
                    ? (
                      <>
                        {(AccessDataForDistricts as AccessDataType[])[(AccessDataForDistricts as AccessDataType[]).findIndex((d) => d.adm2_id === selectedDistrict)]?.adm2_name}
                        {' '}
                        <span className='small-font'>
                          (
                          {selectedCountry}
                          )
                        </span>
                      </>
                    )
                    : selectedCountry || 'World'
                }
              </h3>
              {
                !selectedCountry && !selectedDistrict ? (
                  <div>
                    <p className='label'>
                      Select Country
                    </p>
                    <Select
                      showSearch
                      placeholder='Select a country'
                      className='undp-select'
                      onChange={(d) => { setSelectedCountry(d); }}
                    >
                      {
                        countryAccessData.map((d, i) => <Select.Option key={i} className='undp-select-option' value={d.name}>{d.name}</Select.Option>)
                      }
                    </Select>
                    <hr className='undp-style margin-top-07 margin-bottom-07' />
                    <p className='undp-typography margin-bottom-07' style={{ fontSize: '0.875rem' }}>
                      Data is calculated for
                      {' '}
                      {countryAccessData.length}
                      {' '}
                      countries.
                      {' '}
                      <span className='italics'>
                        Click on a country to explore data for the country
                      </span>
                    </p>
                    <div className='margin-bottom-07'>
                      <h6 className='undp-typography margin-bottom-03'>
                        Percent access to reliable energy services (2020)
                      </h6>
                      <h4 className='undp-typography bold'>
                        {
                          `${((worldData.PopAccess2020 * 100) / worldData.TotPopulation).toFixed(2)}%`
                        }
                      </h4>
                    </div>
                    <div className='margin-bottom-07'>
                      <h6 className='undp-typography margin-bottom-03'>
                        No. Of People Without Access to Reliable Energy Services (2020)
                      </h6>
                      <h4 className='undp-typography bold margin-bottom-01'>
                        {
                          format(',')(Math.round((worldData.TotPopulation - worldData.PopAccess2020))).replaceAll(',', ' ')
                        }
                      </h4>
                      <p className='undp-typography'>
                        <span className='bold'>
                          {
                            format(',')(Math.round((worldData.TotPopulationLowRWI - worldData.PopAccess2020LowRWI))).replaceAll(',', ' ')
                          }
                          {' '}
                          (
                          {(((worldData.TotPopulationLowRWI - worldData.PopAccess2020LowRWI) * 100) / (worldData.TotPopulation - worldData.PopAccess2020)).toFixed(1)}
                          %
                          )
                        </span>
                        {' '}
                        belong to poor regions
                      </p>
                    </div>
                    <h6 className='undp-typography'>
                      TimeSeries Data
                    </h6>
                    <LineChartForCountry data={worldData} />
                  </div>
                ) : null
              }
              {
                selectedCountry && !selectedDistrict ? (
                  <div>
                    <p className='label'>
                      Select District
                    </p>
                    <Select
                      showSearch
                      placeholder='Select a District'
                      className='undp-select'
                      onChange={(d) => { setSelectedDistrict(d.split(' | ')[0]); }}
                    >
                      {
                        (AccessDataForDistricts as AccessDataType[])
                          .filter((d) => d.adm2_id.substring(0, 3) === CountryTaxonomy[CountryTaxonomy.findIndex((el) => el['Country or Area'] === selectedCountry)]['Alpha-3 code-1'])
                          .map((d, i) => <Select.Option key={i} className='undp-select-option' value={`${d.adm2_id} | ${d.adm2_name}`}>{d.adm2_name}</Select.Option>)
                      }
                    </Select>
                    <hr className='undp-style margin-top-07 margin-bottom-07' />
                    <div className='margin-bottom-07'>
                      <h6 className='undp-typography margin-bottom-03'>
                        Percent With Access to Reliable Electricity Services (2020)
                      </h6>
                      <h4 className='undp-typography bold'>
                        {
                          `${((countryAccessData[countryAccessData.findIndex((d) => d.name === selectedCountry)].PopAccess2020 * 100) / countryAccessData[countryAccessData.findIndex((d) => d.name === selectedCountry)].TotPopulation).toFixed(2)}%`
                        }
                      </h4>
                    </div>
                    <div className='margin-bottom-07'>
                      <h6 className='undp-typography margin-bottom-03'>
                        No. Of People Without Access to Reliable Electricity Services (2020)
                      </h6>
                      <h4 className='undp-typography bold margin-bottom-01'>
                        {
                          format(',')(Math.round(countryAccessData[countryAccessData.findIndex((d) => d.name === selectedCountry)].TotPopulation - countryAccessData[countryAccessData.findIndex((d) => d.name === selectedCountry)].PopAccess2020)).replaceAll(',', ' ')
                        }
                      </h4>
                      <p className='undp-typography'>
                        <span className='bold'>
                          {
                            format(',')(Math.round(countryAccessData[countryAccessData.findIndex((d) => d.name === selectedCountry)].TotPopulationLowRWI - countryAccessData[countryAccessData.findIndex((d) => d.name === selectedCountry)].PopAccess2020LowRWI)).replaceAll(',', ' ')
                          }
                          {' '}
                          (
                          {(((countryAccessData[countryAccessData.findIndex((d) => d.name === selectedCountry)].TotPopulationLowRWI - countryAccessData[countryAccessData.findIndex((d) => d.name === selectedCountry)].PopAccess2020LowRWI) * 100) / (countryAccessData[countryAccessData.findIndex((d) => d.name === selectedCountry)].TotPopulation - countryAccessData[countryAccessData.findIndex((d) => d.name === selectedCountry)].PopAccess2020)).toFixed(1)}
                          %
                          )
                        </span>
                        {' '}
                        belong to poor regions
                      </p>
                    </div>
                    <div className='margin-bottom-07'>
                      <h6 className='undp-typography'>
                        TimeSeries Data
                      </h6>
                      <h4 className='undp-typography bold'>
                        {
                          countryAccessData.findIndex((d) => d.name === selectedCountry) !== -1
                            ? <LineChartForCountry data={countryAccessData[countryAccessData.findIndex((d) => d.name === selectedCountry)]} />
                            : 'NA'
                        }
                      </h4>
                    </div>
                    <div>
                      <hr className='undp-style margin-bottom-07' />
                      <h6 className='undp-typography'>
                        UNDP Active Projects Summary in
                        {' '}
                        {selectedCountry}
                      </h6>
                      <div className='flex-div flex-space-between flex-vert-align-center'>
                        <p className='undp-typography'>No. of Projects</p>
                        <p className='undp-typography bold'>
                          {
                            CountryProjectSummaryData.findIndex((d) => d['Lead Country'] === selectedCountry) === -1
                              ? 'NA'
                              : CountryProjectSummaryData[CountryProjectSummaryData.findIndex((d) => d['Lead Country'] === selectedCountry)]['Number of projects']
                          }
                        </p>
                      </div>
                      <div className='flex-div flex-space-between flex-vert-align-center'>
                        <p className='undp-typography'>Grant Amount</p>
                        <p className='undp-typography bold'>
                          {
                            CountryProjectSummaryData.findIndex((d) => d['Lead Country'] === selectedCountry) === -1
                              ? 'NA'
                              : `US$ ${format('.3s')(CountryProjectSummaryData[CountryProjectSummaryData.findIndex((d) => d['Lead Country'] === selectedCountry)]['Grant Amount']).replace('G', 'B')}`
                          }
                        </p>
                      </div>
                      <div className='flex-div flex-space-between flex-vert-align-center'>
                        <p className='undp-typography'>No. of People Benefitting</p>
                        <p className='undp-typography bold'>
                          {
                            CountryProjectSummaryData.findIndex((d) => d['Lead Country'] === selectedCountry) === -1
                              ? 'NA'
                              : !CountryProjectSummaryData[CountryProjectSummaryData.findIndex((d) => d['Lead Country'] === selectedCountry)]['People directly benefiting']
                                ? 'NA'
                                : `${format(',')(CountryProjectSummaryData[CountryProjectSummaryData.findIndex((d) => d['Lead Country'] === selectedCountry)]['People directly benefiting'] as number).replaceAll(',', ' ')}`
                          }
                        </p>
                      </div>
                    </div>
                  </div>
                ) : null
              }
              {
                selectedDistrict ? (
                  <div>
                    <hr className='undp-style margin-top-07 margin-bottom-07' />
                    <div className='margin-bottom-07'>
                      <h6 className='undp-typography margin-bottom-03'>
                        Percent Access to Reliable Electricity Services (2020)
                      </h6>
                      <h4 className='undp-typography bold'>
                        {
                          (AccessDataForDistricts as AccessDataType[]).findIndex((d: any) => d.adm2_id === selectedDistrict) !== -1
                            ? `${
                              (AccessDataForDistricts as AccessDataType[])[(AccessDataForDistricts as AccessDataType[]).findIndex((d) => d.adm2_id === selectedDistrict)].PopAccess2020
                                ? (((AccessDataForDistricts as AccessDataType[])[(AccessDataForDistricts as AccessDataType[]).findIndex((d) => d.adm2_id === selectedDistrict)].PopAccess2020 * 100) / (AccessDataForDistricts as AccessDataType[])[(AccessDataForDistricts as AccessDataType[]).findIndex((d: any) => d.adm2_id === selectedDistrict)].TotPopulation).toFixed(1)
                                : 0
                            } %`
                            : 'NA'
                        }
                      </h4>
                    </div>
                    <div className='margin-bottom-07'>
                      <h6 className='undp-typography margin-bottom-03'>
                        No. Of People Without Access to Reliable Energy Services (2020)
                      </h6>
                      <h4 className='undp-typography bold'>
                        {
                          (AccessDataForDistricts as AccessDataType[]).findIndex((d: any) => d.adm2_id === selectedDistrict) !== -1
                            ? `${
                              (AccessDataForDistricts as AccessDataType[])[(AccessDataForDistricts as AccessDataType[]).findIndex((d) => d.adm2_id === selectedDistrict)].PopAccess2020
                                ? format(',')(Math.round((AccessDataForDistricts as AccessDataType[])[(AccessDataForDistricts as AccessDataType[]).findIndex((d) => d.adm2_id === selectedDistrict)].TotPopulation - (AccessDataForDistricts as AccessDataType[])[(AccessDataForDistricts as AccessDataType[]).findIndex((d) => d.adm2_id === selectedDistrict)].PopAccess2020)).replaceAll(',', ' ')
                                : format(',')(Math.round((AccessDataForDistricts as AccessDataType[])[(AccessDataForDistricts as AccessDataType[]).findIndex((d) => d.adm2_id === selectedDistrict)].TotPopulation as number)).replaceAll(',', ' ')
                            }`
                            : 'NA'
                        }
                      </h4>
                    </div>
                    <h6 className='undp-typography'>
                      TimeSeries Data
                    </h6>
                    <h4 className='undp-typography bold'>
                      {
                        (AccessDataForDistricts as AccessDataType[]).findIndex((d) => d.adm2_id === selectedDistrict) !== -1
                          ? <LineChartForDistrict data={(AccessDataForDistricts as AccessDataType[])[(AccessDataForDistricts as AccessDataType[]).findIndex((d) => d.adm2_id === selectedDistrict)]} />
                          : 'NA'
                      }
                    </h4>
                  </div>
                ) : null
              }
            </SideBar>
          ) : null
      }
      {
        countryShapeData && projectDataShape && districtShapeData && countryAccessData && worldData
          ? (
            <LayerSelectorEl>
              <p className='label'>Select A Layer</p>
              <Radio.Group onChange={(e) => { setLayer(e.target.value); }} value={layer}>
                <Space direction='vertical'>
                  <Radio className='undp-radio' value={1}>Access to Reliable Energy Services</Radio>
                  <Radio className='undp-radio' value={2}>No. of People Without Reliable Energy Services</Radio>
                </Space>
              </Radio.Group>
              <hr className='undp-style margin-top-05 margin-bottom-05' />
              <h6 className='undp-typography margin-bottom-05'>Settings</h6>
              <>
                <p className='label'>
                  {'Showing Region with Access <= '}
                  <span className='bold'>
                    {highlightThreshold}
                    %
                  </span>
                </p>
                <Slider className='undp-slider' defaultValue={100} min={1} max={100} onAfterChange={(d) => { setHighlightThreshold(d); }} />
              </>
              <Space direction='vertical'>
                <Checkbox className='undp-checkbox' onChange={(e) => { setShowPoorRegions(e.target.checked); }}>
                  Only Show Poor Regions
                  <sup>[1]</sup>
                </Checkbox>
                <Checkbox className='undp-checkbox' onChange={(e) => { setShowProjects(e.target.checked); }}>
                  Show Active UNDP Projects
                  <sup>[2]</sup>
                </Checkbox>
                <Checkbox className='undp-checkbox' onChange={(e) => { setHideLabels(e.target.checked); }}>Hide Labels</Checkbox>
              </Space>
            </LayerSelectorEl>
          ) : null
      }
      {
        countryShapeData && projectDataShape && districtShapeData && countryAccessData && worldData
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
              layer={layer}
              showProjects={showProjects}
              hideLabels={hideLabels}
              highlightThreshold={highlightThreshold}
              showPoorRegions={showPoorRegions}
            />
          )
          : (
            <div className='flex-div flex-hor-align-center flex-vert-align-center' style={{ height: window.location.href.includes('data.undp.org') ? '80rem' : 'calc(100vh - 80px)' }}>
              <div className='undp-loader' />
            </div>
          )
      }
      {
        countryShapeData && projectDataShape && districtShapeData && countryAccessData && worldData
          ? (
            <KeyEl>
              <div>{ layer === 1 ? '%age Access to Reliable Electricity Services' : 'Population Without Access to Reliable Electricity Services'}</div>
              {
              layer === 1
                ? (
                  <svg height={25} width={COLOR_SCALE.length * keyBarWid}>
                    {
                      COLOR_SCALE.map((d: string, i: number) => (
                        <rect
                          key={i}
                          x={i * keyBarWid}
                          height={10}
                          y={0}
                          width={keyBarWid}
                          fill={d}
                        />
                      ))
                    }
                    {
                      PCT_RANGE.map((d: number, i: number) => (
                        <text
                          key={i}
                          x={(i + 1) * keyBarWid}
                          y={23}
                          textAnchor='middle'
                          fontSize={10}
                        >
                          {d}
                          %
                        </text>
                      ))
                    }
                    <text
                      x={440}
                      y={23}
                      textAnchor='end'
                      fontSize={10}
                    >
                      100%
                    </text>
                    <text
                      x={0}
                      y={23}
                      textAnchor='start'
                      fontSize={10}
                    >
                      0%
                    </text>
                  </svg>
                )
                : (
                  <svg height={25} width={LINEAR_SCALE.length * keyBarWid}>
                    {
                      LINEAR_SCALE.map((d: string, i: number) => (
                        <rect
                          key={i}
                          x={i * keyBarWid}
                          height={10}
                          y={0}
                          width={keyBarWid}
                          fill={d}
                        />
                      ))
                    }
                    {
                      POP_RANGE.map((d: number, i: number) => (
                        <text
                          key={i}
                          x={(i + 1) * keyBarWid}
                          y={23}
                          textAnchor='middle'
                          fontSize={10}
                        >
                          {
                            d < 1000
                              ? format(',')(d).replace(',', ' ')
                              : format('.1s')(d).replace('G', 'B')
                          }
                        </text>
                      ))
                    }
                  </svg>
                )
            }
            </KeyEl>
          ) : null
      }
    </div>
  );
}
