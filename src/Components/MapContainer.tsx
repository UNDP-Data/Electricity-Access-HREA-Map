import * as topojson from 'topojson';
import uniqBy from 'lodash.uniqby';
import styled from 'styled-components';
import { useState } from 'react';
import { format } from 'd3-format';
import Admin2 from '../Data/admin2.json';
import TimeSeriesData from '../Data/timeSeriesData.json';
import { MapEl } from './Map';
import { LineChart } from './LineChart';

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
  const mapDataAdmin2: any = (topojson.feature(Admin2 as any, (Admin2 as any).objects.combined_v3) as any).features as any;
  const countryList = uniqBy(mapDataAdmin2, (d: any) => d.properties.iso_code).map((d: any) => d.properties.iso_code);
  const countryMapHighRes = countryList.map((country: string, i: number) => (
    {
      type: 'Feature',
      properties: { 'iso-code': country },
      id: i,
      geometry: topojson.merge(Admin2 as any, (Admin2 as any).objects.combined_v3.geometries.filter((d: any) => d.properties.iso_code === country)),
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
                  {countryMapHighRes.length}
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
      <MapEl mapShapeHighRes={mapDataAdmin2} countryShapeHighRes={countryMapHighRes} setCountry={setSelectedCountry} />
    </>
  );
}
