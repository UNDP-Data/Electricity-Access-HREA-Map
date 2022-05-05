import { useEffect, useRef, useState } from 'react';
import maplibregl from 'maplibre-gl';
import { scaleLinear } from 'd3-scale';
import 'maplibre-gl/dist/maplibre-gl.css';
import styled from 'styled-components';
import CountryTaxonomy from '../Data/country-taxonomy.json';
import { EAKey, PopDenKey, RWIKey } from '../Keys';

interface Props {
    mapShapeHighRes: any;
    countryShapeHighRes: any;
    setCountry: (_d?: string) => void;
}

const COLORS = ['#d73027', '#ffffbf', '#1a9850'];

const DOMAIN = [0, 0.5, 1];
const POPDEN_DOMAIN = [0, 500];
const POPDEN_COLOR = ['#ffffbf', '#d73027'];
const RWI_COLOR = ['#d73027', '#ffffbf', '#1a9850'];
const RWI_DOMAIN = [-0.75, 0, 0.75];

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
`;

const getPopDenEAColor = (popDen: number, ea: number) => {
  if (ea > 0.1) return 'rgba(0, 0, 0, 0)';
  const popDenIndxScale = scaleLinear<number, string>().domain(POPDEN_DOMAIN).range(POPDEN_COLOR as any);
  return popDenIndxScale(popDen);
};

const getRWIEAColor = (rwi: number, ea: number) => {
  if (ea > 0.1) return 'rgba(0, 0, 0, 0)';
  const rwiColorScale = scaleLinear<number, string>().domain(RWI_DOMAIN).range(RWI_COLOR as any);
  return rwiColorScale(rwi);
};

export function MapEl(props: Props) {
  const {
    mapShapeHighRes, countryShapeHighRes, setCountry,
  } = props;
  const colorScale = scaleLinear<number, string>().domain(DOMAIN).range(COLORS as any);
  const mapShapeHighResWithColor = mapShapeHighRes.map((d:any) => ({
    geometry: d.geometry,
    type: d.type,
    properties: {
      ...d.properties, rwi_ea_color: getRWIEAColor(d.properties.rwi, d.properties.ea), ea_color: colorScale(d.properties.ea), ea_popDen_color: getPopDenEAColor(d.properties.popden, d.properties.ea),
    },
  }));
  const mapShapeGeoJsonHighRes = { type: 'FeatureCollection', features: mapShapeHighResWithColor };
  const countryShapeGeoJsonHighRes = { type: 'FeatureCollection', features: countryShapeHighRes };
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<HTMLDivElement>(null);
  const zoom = 2;
  useEffect(() => {
    if (map.current) return;
    let hoveredStateId: string | null = null;
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

    (map as any).current.on('load', () => {
      (map as any).current.addSource('district-layer', {
        type: 'geojson',
        data: mapShapeGeoJsonHighRes,
      });
      (map as any).current.addLayer({
        id: 'district-layer-ea',
        type: 'fill',
        source: 'district-layer',
        layout: { visibility: 'visible' },
        paint: {
          'fill-color': ['get', 'ea_color'],
          'fill-opacity': 1,
        },
      });
      (map as any).current.addLayer({
        id: 'district-layer-popDen',
        type: 'fill',
        source: 'district-layer',
        layout: { visibility: 'none' },
        paint: {
          'fill-color': ['get', 'ea_popDen_color'],
          'fill-opacity': 1,
        },
      });
      (map as any).current.addLayer({
        id: 'district-layer-rwi',
        type: 'fill',
        source: 'district-layer',
        layout: { visibility: 'none' },
        paint: {
          'fill-color': ['get', 'rwi_ea_color'],
          'fill-opacity': 1,
        },
      });
      (map as any).current.addSource('country-layer', {
        type: 'geojson',
        data: countryShapeGeoJsonHighRes,
      });
      (map as any).current.addLayer({
        id: 'country-layer-fill',
        type: 'fill',
        source: 'country-layer',
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
      });
      (map as any).current.addLayer({
        id: 'country-layer-outline',
        type: 'line',
        source: 'country-layer',
        layout: {
          'line-join': 'round',
          'line-cap': 'round',
          visibility: 'visible',
        },
        paint: {
          'line-color': '#FFF',
          'line-width': 2,
        },
      });
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
      (map as any).current.on('mousemove', 'country-layer-fill', (e:any) => {
        (map as any).current.getCanvas().style.cursor = 'pointer';
        if (e.features.length > 0) {
          if (hoveredStateId) {
            (map as any).current.setFeatureState(
              { source: 'country-layer', id: hoveredStateId },
              { hover: false },
            );
          }
          hoveredStateId = e.features[0].id;
          (map as any).current.setFeatureState(
            { source: 'country-layer', id: hoveredStateId },
            { hover: true },
          );
        }
      });

      (map as any).current.on('mouseleave', 'country-layer-fill', () => {
        (map as any).current.getCanvas().style.cursor = 'default';
        if (hoveredStateId) {
          (map as any).current.setFeatureState(
            { source: 'country-layer', id: hoveredStateId },
            { hover: false },
          );
        }
        hoveredStateId = null;
      });
      (map as any).current.on('click', 'country-layer-fill', (e: any) => {
        const indx = CountryTaxonomy.findIndex((d) => d['Alpha-3 code-1'] === e.features[0].properties['iso-code']);
        (map as any).current.flyTo({
          center: [CountryTaxonomy[indx]['Longitude (average)'], CountryTaxonomy[indx]['Latitude (average)']],
          zoom: 4,
        });
        setCountry(CountryTaxonomy[indx]['Country or Area']);
      });
    });
    (map as any).current.on('idle', () => {
      if ((map as any).current.getLayer('district-layer-ea') && (map as any).current.getLayer('district-layer-popDen') && (map as any).current.getLayer('district-layer-rwi')) {
        if (document.getElementById('layer1') !== null) {
          (document.getElementById('layer1') as any).onclick = () => {
            (map as any).current.setLayoutProperty('district-layer-ea', 'visibility', 'visible');
            (map as any).current.setLayoutProperty('district-layer-popDen', 'visibility', 'none');
            (map as any).current.setLayoutProperty('district-layer-rwi', 'visibility', 'none');
          };
        }
        if (document.getElementById('layer2') !== null) {
          (document.getElementById('layer2') as any).onclick = () => {
            (map as any).current.setLayoutProperty('district-layer-ea', 'visibility', 'none');
            (map as any).current.setLayoutProperty('district-layer-popDen', 'visibility', 'visible');
            (map as any).current.setLayoutProperty('district-layer-rwi', 'visibility', 'none');
          };
        }
        if (document.getElementById('layer3') !== null) {
          (document.getElementById('layer3') as any).onclick = () => {
            (map as any).current.setLayoutProperty('district-layer-ea', 'visibility', 'none');
            (map as any).current.setLayoutProperty('district-layer-popDen', 'visibility', 'none');
            (map as any).current.setLayoutProperty('district-layer-rwi', 'visibility', 'visible');
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
          Population Density for places with no or low electricity access (Admin Level)
        </LayerSelection>
        <LayerSelection id='layer3' onClick={() => { setLayer(3); }}>
          <RadioIconDiv>
            {layer === 3 ? <RadioSelectedEl /> : <RadioNotSelectedEl /> }
          </RadioIconDiv>
          Relative Wealth Index for places with no or low electricity access (Admin Level)
        </LayerSelection>
      </LayerSelectorEl>
      <KeyEl>
        {
          layer === 1 ? <EAKey />
            : layer === 2 ? <PopDenKey />
              : <RWIKey />
        }
      </KeyEl>
    </>
  );
}
