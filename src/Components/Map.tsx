import { useEffect, useRef, useState } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import styled from 'styled-components';
import { format } from 'd3-format';
import CountryTaxonomy from '../Data/country-taxonomy.json';
import CountryData from '../Data/timeSeriesData.json';
import { Tooltip } from './Tooltip';
import {
  COLOR_SCALE, LINEAR_SCALE, PCT_RANGE, POP_RANGE,
} from '../Constants';

interface Props {
    districtShapes: any;
    countryShapes: any;
    setCountry: (_d?: string) => void;
}
interface HoverDataProps {
  city?: string;
  country: string;
  pctValue?: number;
  popValue?: number;
  xPosition: number;
  yPosition: number;
}

const LayerSelectorEl = styled.div`
  padding: 0;
  position: fixed;
  z-index: 1000;
  top: 12rem;
  right: 4rem;
  border-radius: 0.4rem;
  box-shadow: var(--shadow);
  font-size: 1.6rem;
  background-color: var(--white-opacity);
  width: 32rem;
  color: var(--black-700);
`;

const LayerSelection = styled.div`
  display: flex;
  align-items: flex-start;
  font-size: 1.2rem;
  line-height: 2rem;
  margin: 2rem 0;
  padding: 0 2rem;
`;

const RadioIconDiv = styled.div`
  width: 1.2rem;
  height: 1.2rem;
  margin-right: 0.5rem;
  margin-top: 0.3rem;
  border-radius: 1.2rem;
  border: 1px solid var(--black-600);
`;

const RadioSelectedEl = styled.div`
  width: 0.8rem;
  height: 0.8rem;
  margin: 0.2rem;
  border-radius: 0.8rem;
  background-color: var(--black-600);
`;

const RadioNotSelectedEl = styled.div`
  width: 0.8rem;
  height: 0.8rem;
  margin: 0.2rem;
  border-radius: 0.8rem;
  background-color: var(--white);
`;

const KeyEl = styled.div`
  padding: 1rem;
  position: fixed;
  z-index: 1000;
  bottom: 2rem;
  left: 4rem;
  border-radius: 0.4rem;
  box-shadow: var(--shadow);
  background-color: var(--white-opacity);
  div {
    font-size: 1.6rem;
    font-weight: bold;
    margin-bottom: 0.5rem;
  }
`;

export function MapEl(props: Props) {
  const {
    districtShapes, countryShapes, setCountry,
  } = props;

  const keyBarWid = 40;
  const [hoverData, setHoverData] = useState<null | HoverDataProps>(null);
  const districtShapesGeoJson = { type: 'FeatureCollection', features: districtShapes };
  const countryShapesGeoJson = { type: 'FeatureCollection', features: countryShapes };
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<HTMLDivElement>(null);
  const zoom = 2;
  useEffect(() => {
    if (map.current) return;
    let hoveredStateId: string | null = null;
    let districtHoveredStateId: string | null = null;

    // initiate map and add base layer
    (map as any).current = new maplibregl.Map({
      container: mapContainer.current as any,
      style: {
        version: 8,
        sources: {
          'raster-tiles': {
            type: 'raster',
            tiles: ['https://basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png'],
            tileSize: 256,
            attribution: 'Map tiles by <a target="_top" rel="noopener" href="https://carto.com/">CartoDB</a>',
          },
        },
        layers: [
          {
            id: 'labels',
            type: 'raster',
            source: 'raster-tiles',
            minzoom: 0,
            maxzoom: 22,
          },
        ],
      },
      center: [0, 0],
      zoom,
    });

    // add district layer with colors
    (map as any).current.on('load', () => {
      (map as any).current.addSource('district-layer-data', {
        type: 'geojson',
        data: districtShapesGeoJson,
      });
      (map as any).current.addLayer({
        id: 'district-layer',
        type: 'fill',
        source: 'district-layer-data',
        layout: { visibility: 'visible' },
        paint: {
          'fill-color': ['get', 'eaAccessPctColor'],
          'fill-opacity': 1,
        },
      });
      (map as any).current.addLayer({
        id: 'district-layer-pop',
        type: 'fill',
        source: 'district-layer-data',
        layout: { visibility: 'none' },
        paint: {
          'fill-color': ['get', 'eaNoAccessColor'],
          'fill-opacity': 1,
        },
      });

      (map as any).current.addLayer({
        id: 'district-layer-outline',
        type: 'line',
        source: 'district-layer-data',
        layout: { visibility: 'visible' },
        paint: {
          'line-color': '#FFF',
          'line-width': 1,
          'line-opacity': 0.2,
        },
      });

      // add district layer for mouseover
      (map as any).current.addLayer({
        id: 'district-layer-overlay',
        type: 'fill',
        source: 'district-layer-data',
        layout: { visibility: 'visible' },
        paint: {
          'fill-color': '#000',
          'fill-opacity': [
            'case',
            ['boolean', ['feature-state', 'hover'], false],
            0.25,
            0,
          ],
        },
        minzoom: 4,
      });

      // country layer data
      (map as any).current.addSource('country-layer-data', {
        type: 'geojson',
        data: countryShapesGeoJson,
      });

      // add country layer for mouse over
      (map as any).current.addLayer({
        id: 'country-layer-overlay',
        type: 'fill',
        source: 'country-layer-data',
        layout: { visibility: 'visible' },
        paint: {
          'fill-color': '#000',
          'fill-opacity': [
            'case',
            ['boolean', ['feature-state', 'hover'], false],
            0.25,
            0,
          ],
        },
        maxzoom: 4,
      });

      // add country border
      (map as any).current.addLayer({
        id: 'country-layer-outline',
        type: 'line',
        source: 'country-layer-data',
        layout: {
          'line-join': 'round',
          'line-cap': 'round',
          visibility: 'visible',
        },
        paint: {
          'line-color': '#FFF',
          'line-width': 1,
        },
      });

      // add label from raster
      (map as any).current.addSource('raster-labels', {
        type: 'raster',
        tiles: ['https://basemaps.cartocdn.com/light_only_labels/{z}/{x}/{y}{r}.png'],
        tileSize: 256,
      });
      (map as any).current.addLayer(
        {
          id: 'raster-labels',
          type: 'raster',
          source: 'raster-labels',
        },
      );

      // Create a popup, but don't add it to the map yet.
    });
    (map as any).current.on('load', () => {
      // mouse over effect on district layer
      (map as any).current.on('mousemove', 'district-layer-overlay', (e:any) => {
        (map as any).current.getCanvas().style.cursor = 'pointer';
        if (e.features.length > 0) {
          const indx = CountryTaxonomy.findIndex((d) => d['Alpha-3 code-1'] === e.features[0].properties.iso_3);
          setHoverData({
            city: e.features[0].properties.adm2_name !== ' ' && e.features[0].properties.adm2_name !== '' && e.features[0].properties.adm2_name ? e.features[0].properties.adm2_name : e.features[0].properties.adm1_name,
            country: CountryTaxonomy[indx]['Country or Area'],
            pctValue: e.features[0].properties.eaAccessPct,
            popValue: e.features[0].properties.eaNoAccessPop,
            xPosition: e.point.x,
            yPosition: e.point.y,
          });
          if (districtHoveredStateId) {
            (map as any).current.setFeatureState(
              { source: 'district-layer-data', id: districtHoveredStateId },
              { hover: false },
            );
          }
          districtHoveredStateId = e.features[0].id;
          (map as any).current.setFeatureState(
            { source: 'district-layer-data', id: districtHoveredStateId },
            { hover: true },
          );
        }
      });

      (map as any).current.on('mouseleave', 'district-layer-overlay', () => {
        (map as any).current.getCanvas().style.cursor = 'default';
        if (districtHoveredStateId) {
          (map as any).current.setFeatureState(
            { source: 'district-layer-data', id: districtHoveredStateId },
            { hover: false },
          );
        }
        districtHoveredStateId = null;
        setHoverData(null);
      });

      // mouse over effect on country layer
      (map as any).current.on('mousemove', 'country-layer-overlay', (e:any) => {
        (map as any).current.getCanvas().style.cursor = 'pointer';
        if (e.features.length > 0) {
          const indx = CountryTaxonomy.findIndex((d) => d['Alpha-3 code-1'] === e.features[0].properties.iso_3);
          const countrDataIndx = CountryData.findIndex((d) => d.country === CountryTaxonomy[indx]['Country or Area'] && d.year === 2020);
          setHoverData({
            city: undefined,
            country: CountryTaxonomy[indx]['Country or Area'],
            pctValue: countrDataIndx !== -1 ? CountryData[countrDataIndx].pct_pop_elec_HREA : undefined,
            popValue: countrDataIndx !== -1 ? ((100 - CountryData[countrDataIndx].pct_pop_elec_HREA) * CountryData[countrDataIndx].pop) / 100 : undefined,
            xPosition: e.point.x,
            yPosition: e.point.y,
          });
          if (hoveredStateId) {
            (map as any).current.setFeatureState(
              { source: 'country-layer-data', id: hoveredStateId },
              { hover: false },
            );
          }
          hoveredStateId = e.features[0].id;
          (map as any).current.setFeatureState(
            { source: 'country-layer-data', id: hoveredStateId },
            { hover: true },
          );
        }
      });

      (map as any).current.on('mouseleave', 'country-layer-overlay', () => {
        (map as any).current.getCanvas().style.cursor = 'default';
        if (hoveredStateId) {
          (map as any).current.setFeatureState(
            { source: 'country-layer-data', id: hoveredStateId },
            { hover: false },
          );
        }
        hoveredStateId = null;
        setHoverData(null);
      });

      // click effect on map
      (map as any).current.on('click', 'country-layer-overlay', (e: any) => {
        const indx = CountryTaxonomy.findIndex((d) => d['Alpha-3 code-1'] === e.features[0].properties.iso_3);
        (map as any).current.flyTo({
          center: [CountryTaxonomy[indx]['Longitude (average)'], CountryTaxonomy[indx]['Latitude (average)']],
          zoom: 6,
        });
        setCountry(CountryTaxonomy[indx]['Country or Area']);
      });
    });
    (map as any).current.on('idle', () => {
      if ((map as any).current.getLayer('district-layer') && (map as any).current.getLayer('district-layer-pop')) {
        if (document.getElementById('layer1') !== null) {
          (document.getElementById('layer1') as any).onclick = () => {
            (map as any).current.setLayoutProperty('district-layer', 'visibility', 'visible');
            (map as any).current.setLayoutProperty('district-layer-pop', 'visibility', 'none');
          };
        }
        if (document.getElementById('layer2') !== null) {
          (document.getElementById('layer2') as any).onclick = () => {
            (map as any).current.setLayoutProperty('district-layer', 'visibility', 'none');
            (map as any).current.setLayoutProperty('district-layer-pop', 'visibility', 'visible');
          };
        }
      }
    });
  });

  const [layer, setLayer] = useState(1);

  return (
    <>
      <div style={{ position: 'relative', width: '100%', height: 'calc(100vh - 76px)' }}>
        <div style={{ position: 'absolute', width: '100%', height: '100%' }} ref={mapContainer} />
      </div>
      <LayerSelectorEl>
        <LayerSelection onClick={() => { setLayer(1); }} id='layer1'>
          <RadioIconDiv>
            {layer === 1 ? <RadioSelectedEl /> : <RadioNotSelectedEl /> }
          </RadioIconDiv>
          Electricity Access (Admin Level)
        </LayerSelection>
        <LayerSelection id='layer2' onClick={() => { setLayer(2); }}>
          <RadioIconDiv>
            {layer === 2 ? <RadioSelectedEl /> : <RadioNotSelectedEl /> }
          </RadioIconDiv>
          Population Without Elec. (Admin Level)
        </LayerSelection>
      </LayerSelectorEl>
      <KeyEl>
        <div>{ layer === 1 ? '%age Electricity Access' : 'Population Without Elec.'}</div>
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
      {
        hoverData ? <Tooltip city={hoverData.city} country={hoverData.country} popValue={hoverData.popValue} pctValue={hoverData.pctValue} xPosition={hoverData.xPosition} yPosition={hoverData.yPosition} /> : null
      }
    </>
  );
}
