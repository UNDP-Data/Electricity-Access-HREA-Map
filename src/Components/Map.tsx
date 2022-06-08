import { useEffect, useRef, useState } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import CountryTaxonomy from '../Data/country-taxonomy.json';
import { Tooltip } from './Tooltip';
import { CountryAccessDataType } from '../Types';

interface Props {
  districtShapes: any;
  countryShapes: any;
  projectData: any;
  selectedCountry?: string;
  selectedDistrict?: string;
  countryAccessData: CountryAccessDataType[];
  setSelectedCountry: (_d?: string) => void;
  setSelectedDistrict: (_d?: string) => void;
  layer: 1 | 2 | 3;
  showProjects: boolean;
  hideLabels: boolean;
  highlightThreshold: number;
}
interface HoverDataProps {
  city?: string;
  country: string;
  pctValue?: number;
  popValue?: number;
  xPosition: number;
  yPosition: number;
}

export function MapEl(props: Props) {
  const {
    districtShapes,
    countryShapes,
    setSelectedCountry,
    setSelectedDistrict,
    projectData,
    selectedCountry,
    selectedDistrict,
    countryAccessData,
    layer,
    showProjects,
    hideLabels,
    highlightThreshold,
  } = props;

  const [hoverData, setHoverData] = useState<null | HoverDataProps>(null);
  const districtShapesGeoJson = { type: 'FeatureCollection', features: districtShapes };
  const countryShapesGeoJson = { type: 'FeatureCollection', features: countryShapes };
  const projectDataGeoJson = { type: 'FeatureCollection', features: projectData };
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<HTMLDivElement>(null);
  const zoom = 1.25;
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
      center: [25, 5],
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
        id: 'district-layer-highlight',
        type: 'fill',
        source: 'district-layer-data',
        layout: { visibility: 'visible' },
        paint: {
          'fill-color': '#fff',
          'fill-opacity': 1,
        },
        filter: ['>=', 'eaAccessPct', highlightThreshold + 0.001],
      });
      (map as any).current.addLayer({
        id: 'district-layer-highlight-selected',
        type: 'fill',
        source: 'district-layer-data',
        layout: { visibility: 'visible' },
        paint: {
          'fill-color': '#fff',
          'fill-opacity': 0.75,
        },
        filter: ['==', 'adm2_id', ''],
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
        minzoom: 3,
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
        maxzoom: 3,
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

      // add layer for projects
      (map as any).current.addSource('projectData', {
        type: 'geojson',
        data: projectDataGeoJson,
      });

      (map as any).current.addLayer({
        id: 'projectData-circles',
        type: 'circle',
        source: 'projectData',
        layout: {
          visibility: 'none',
        },
        paint: {
          'circle-color': '#fff',
          'circle-opacity': 1,
          'circle-radius': 5,
          'circle-stroke-color': '#006EB5',
          'circle-stroke-width': 1,
        },
      });

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
            popValue: Math.round(e.features[0].properties.eaNoAccessPop),
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
          const countryDataIndx = countryAccessData.findIndex((d) => d.countryID === e.features[0].properties.iso_3);
          setHoverData({
            city: undefined,
            country: CountryTaxonomy[indx]['Country or Area'],
            pctValue: countryDataIndx !== -1 ? (countryAccessData[countryDataIndx].PopAccess2020 * 100) / countryAccessData[countryDataIndx].TotPopulation : undefined,
            popValue: countryDataIndx !== -1 ? countryAccessData[countryDataIndx].PopNoAccess2020 : undefined,
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
        setSelectedDistrict(undefined);
        setSelectedCountry(CountryTaxonomy[indx]['Country or Area']);
      });
      (map as any).current.on('click', 'district-layer-overlay', (e: any) => {
        setSelectedCountry(CountryTaxonomy[CountryTaxonomy.findIndex((d) => d['Alpha-3 code-1'] === e.features[0].properties.iso_3)]['Country or Area']);
        setSelectedDistrict(e.features[0].properties.adm2_id);
      });
    });
  });
  useEffect(() => {
    if (map.current) {
      if ((map as any).current.getLayer('district-layer') && (map as any).current.getLayer('district-layer-pop') && (map as any).current.getLayer('district-layer-highlight') && (map as any).current.getLayer('district-layer-highlight-selected') && (map as any).current.getLayer('projectData-circles')) {
        if (!selectedDistrict) {
          if (selectedCountry) {
            const indx = CountryTaxonomy.findIndex((d) => d['Country or Area'] === selectedCountry);
            const featureIndx = countryShapesGeoJson.features.findIndex((d: any) => CountryTaxonomy[indx]['Alpha-3 code-1'] === d.properties.iso_3);
            (map as any).current.flyTo({
              center: [CountryTaxonomy[indx]['Longitude (average)'], CountryTaxonomy[indx]['Latitude (average)']],
            });
            (map as any).current.fitBounds([
              [countryShapesGeoJson.features[featureIndx].properties.boundingBox.xMin, countryShapesGeoJson.features[featureIndx].properties.boundingBox.yMax], // southwestern corner of the bounds
              [countryShapesGeoJson.features[featureIndx].properties.boundingBox.xMax, countryShapesGeoJson.features[featureIndx].properties.boundingBox.yMin], // northeastern corner of the bounds
            ]);
            (map as any).current.setFilter('district-layer-highlight-selected', ['!=', 'countryISO', CountryTaxonomy[indx]['Alpha-3 code-1']]);
          } else {
            (map as any).current.flyTo({
              center: [25, 5],
              zoom,
            });
            (map as any).current.setFilter('district-layer-highlight-selected', ['==', 'adm2_id', '']);
          }
        } else {
          const indx = districtShapes.findIndex((d: any) => d.properties.adm2_id === selectedDistrict);
          (map as any).current.flyTo({
            center: [districtShapes[indx].properties.Long_Center, districtShapes[indx].properties.Lat_Center],
            zoom: 6,
          });
          (map as any).current.setFilter('district-layer-highlight-selected', ['!=', 'adm2_id', selectedDistrict]);
        }
      }
    }
  }, [selectedCountry, selectedDistrict]);
  useEffect(() => {
    if (map.current) {
      if ((map as any).current.getLayer('district-layer') && (map as any).current.getLayer('district-layer-pop') && (map as any).current.getLayer('district-layer-highlight') && (map as any).current.getLayer('district-layer-highlight-selected') && (map as any).current.getLayer('projectData-circles')) {
        if (layer === 1) {
          (map as any).current.setLayoutProperty('district-layer', 'visibility', 'visible');
          (map as any).current.setLayoutProperty('district-layer-pop', 'visibility', 'none');
        } else {
          (map as any).current.setLayoutProperty('district-layer', 'visibility', 'none');
          (map as any).current.setLayoutProperty('district-layer-pop', 'visibility', 'visible');
        }
      }
    }
  }, [layer]);
  useEffect(() => {
    if (map.current) {
      if ((map as any).current.getLayer('district-layer') && (map as any).current.getLayer('district-layer-pop') && (map as any).current.getLayer('district-layer-highlight') && (map as any).current.getLayer('district-layer-highlight-selected') && (map as any).current.getLayer('projectData-circles')) {
        if (showProjects) {
          (map as any).current.setLayoutProperty('projectData-circles', 'visibility', 'visible');
        } else {
          (map as any).current.setLayoutProperty('projectData-circles', 'visibility', 'none');
        }
      }
    }
  }, [showProjects]);
  useEffect(() => {
    if (map.current) {
      if ((map as any).current.getLayer('district-layer') && (map as any).current.getLayer('district-layer-pop') && (map as any).current.getLayer('district-layer-highlight') && (map as any).current.getLayer('district-layer-highlight-selected') && (map as any).current.getLayer('projectData-circles')) {
        if (hideLabels) {
          (map as any).current.setLayoutProperty('raster-labels', 'visibility', 'none');
        } else {
          (map as any).current.setLayoutProperty('raster-labels', 'visibility', 'visible');
        }
      }
    }
  }, [hideLabels]);

  useEffect(() => {
    if (map.current) {
      if ((map as any).current.getLayer('district-layer') && (map as any).current.getLayer('district-layer-pop') && (map as any).current.getLayer('district-layer-highlight') && (map as any).current.getLayer('district-layer-highlight-selected') && (map as any).current.getLayer('projectData-circles')) {
        (map as any).current.setFilter('district-layer-highlight', ['>=', 'eaAccessPct', highlightThreshold + 0.001]);
      }
    }
  }, [highlightThreshold]);

  return (
    <>
      <div style={{ position: 'absolute', width: '100%', height: '100%' }} ref={mapContainer} />
      {
        hoverData ? <Tooltip city={hoverData.city} country={hoverData.country} popValue={hoverData.popValue} pctValue={hoverData.pctValue} xPosition={hoverData.xPosition} yPosition={hoverData.yPosition} /> : null
      }
    </>
  );
}
