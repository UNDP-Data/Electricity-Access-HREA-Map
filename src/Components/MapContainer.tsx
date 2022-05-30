import * as topojson from 'topojson';
// import uniqBy from 'lodash.uniqby';
import styled from 'styled-components';
import { useState } from 'react';
import { format } from 'd3-format';
import { scaleThreshold } from 'd3-scale';
import AccessData from '../Data/accessData.json';
import DistrictMap from '../Data/DistrictShape.json';
import CountryMap from '../Data/CountryShape.json';
import TimeSeriesData from '../Data/timeSeriesData.json';
import { MapEl } from './Map';
import { LineChart } from './LineChart';
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

const BackEl = styled.span`
  font-size: 1.4rem;
  color: var(--primary-blue);
  cursor: pointer;
`;

export function MapContainer() {
  const [selectedCountry, setSelectedCountry] = useState<undefined | string>(undefined);
  const pctColorScale = scaleThreshold<string | number, string>().domain(PCT_RANGE).range(COLOR_SCALE).unknown('#FAFAFA');
  const peopleNoAccessColorScale = scaleThreshold<string | number, string>().domain(POP_RANGE).range(LINEAR_SCALE).unknown('#FAFAFA');
  const districtShapes: any = ((topojson.feature(DistrictMap as any, (DistrictMap as any).objects.combined_polygon_vlight) as any).features as any).map((district: any, i: number) => {
    const indx = AccessData.findIndex((d) => d['ea.adm2_id'] === district.properties.adm2_id);
    const eaAccessPct = indx === -1 ? undefined : AccessData[indx]['ea.pctea'];
    const eaAccessPctColor = indx === -1 ? '#FaFaFa' : pctColorScale(AccessData[indx]['ea.pctea']);
    const eaAccessPop = indx === -1 ? undefined : AccessData[indx]['ea.SUM'];
    const eaNoAccessPop = indx === -1 ? undefined : AccessData[indx]['pop.SUM'] - AccessData[indx]['ea.SUM'];
    const eaNoAccessColor = indx === -1 ? '#FaFaFa' : peopleNoAccessColorScale(AccessData[indx]['pop.SUM'] - AccessData[indx]['ea.SUM']);
    const totalPop = indx === -1 ? undefined : AccessData[indx]['pop.SUM'];
    return (
      {
        geometry: district.geometry,
        type: district.type,
        properties: {
          ...district.properties, eaAccessPct, eaAccessPctColor, eaAccessPop, eaNoAccessColor, totalPop, eaNoAccessPop,
        },
        id: i + 1000,
      });
  });
  const countryShapes: any = ((topojson.feature(CountryMap as any, (CountryMap as any).objects.combined_polygon_vlight) as any).features as any).map((country: any, i: number) => (
    {
      ...country,
      id: i + 1,
    }));
  return (
    <>
      <SideBar>
        <HeadingEl>
          {
            selectedCountry || 'World'
          }
          {
            selectedCountry ? (
              <BackEl onClick={() => { setSelectedCountry(undefined); }}>
                {' '}
                Back to Global View
              </BackEl>
            ) : null
          }
        </HeadingEl>
        {
          selectedCountry === undefined ? (
            <BodyContainer>
              <RowEl>
                <BodyEl>
                  Data is calculated for
                  {' '}
                  {countryShapes.length}
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
          selectedCountry ? (
            <BodyContainer>
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
                      ? format('~s')(Math.round((TimeSeriesData[TimeSeriesData.findIndex((d) => d.country === selectedCountry && d.year === 2020)].pop * (100 - TimeSeriesData[TimeSeriesData.findIndex((d) => d.country === selectedCountry && d.year === 2020)].pct_pop_elec_HREA)) / 100)).replace('G', 'B')
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
      </SideBar>
      <MapEl districtShapes={districtShapes} countryShapes={countryShapes} setCountry={setSelectedCountry} />
    </>
  );
}
