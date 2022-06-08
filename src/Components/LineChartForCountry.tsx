import styled from 'styled-components';
import { line, curveMonotoneX } from 'd3-shape';
import { scaleLinear } from 'd3-scale';
import { CountryAccessDataType } from '../Types';

interface Props {
  data: CountryAccessDataType;
}

const El = styled.div`
  height: 100%;
  overflow-y: hidden;
`;

export function LineChartForCountry(props: Props) {
  const {
    data,
  } = props;
  const svgWidth = 280;
  const svgHeight = 200;
  const margin = {
    top: 20,
    bottom: 20,
    left: 15,
    right: 15,
  };
  const graphWidth = svgWidth - margin.left - margin.right;
  const graphHeight = svgHeight - margin.top - margin.bottom;
  const x = scaleLinear().domain([2013, 2020]).range([0, graphWidth]);
  const y1 = scaleLinear().domain([0, 100]).range([graphHeight, 0]).nice();

  const dataFormatted = [2013, 2014, 2015, 2016, 2017, 2018, 2019, 2020].map((d) => ({
    year: d,
    country: data.name,
    pop: data.TotPopulation,
    pct_pop_elec_HREA: data[`PopAccess${d as 2013 | 2014 | 2015 | 2016 | 2017 | 2018 | 2019 | 2020}`] !== null ? ((data[`PopAccess${d as 2013 | 2014 | 2015 | 2016 | 2017 | 2018 | 2019 | 2020}`] as number) * 100) / data.TotPopulation : 0,
  }));
  const lineShape = line()
    .defined((d: any) => d.pct_pop_elec_HREA !== undefined)
    .x((d: any) => x(d.year))
    .y((d: any) => y1(d.pct_pop_elec_HREA))
    .curve(curveMonotoneX);
  const y1Ticks = y1.ticks(5);
  const xTicks = x.ticks(dataFormatted[dataFormatted.length - 1].year - dataFormatted[0].year);
  return (
    <El>
      <svg width='100%' height='100%' viewBox={`0 0 ${svgWidth} ${svgHeight}`}>
        <g transform={`translate(${margin.left},${margin.top})`}>
          <line
            y1={graphHeight}
            y2={graphHeight}
            x1={-15}
            x2={graphWidth + 15}
            stroke='#AAA'
            strokeWidth={1}
          />
          <g>
            {
              y1Ticks.map((d, i) => (
                <g key={i}>
                  <line
                    y1={y1(d)}
                    y2={y1(d)}
                    x1={-15}
                    x2={graphWidth + 15}
                    stroke='#AAA'
                    strokeWidth={1}
                    strokeDasharray='4 4'
                  />
                  <text
                    x={-15}
                    y={y1(d)}
                    fill='#AAA'
                    textAnchor='start'
                    fontSize={12}
                    fontWeight={500}
                    dy={-5}
                  >
                    {d}
                  </text>
                </g>
              ))
            }
          </g>
          <g>
            {
              xTicks.map((d, i) => (
                <g key={i}>
                  <text
                    y={graphHeight}
                    x={x(d)}
                    fill='#AAA'
                    textAnchor='middle'
                    fontSize={12}
                    dy={15}
                  >
                    {d}
                  </text>
                </g>
              ))
            }
          </g>
          <g>
            <path d={lineShape(dataFormatted as any) as string} fill='none' stroke='#E26B8D' strokeWidth={2} />
          </g>
          {
            dataFormatted.map((d, i) => (
              <g transform={`translate(${x(d.year)},${y1(d.pct_pop_elec_HREA)})`} key={i}>
                <circle
                  cx={0}
                  cy={0}
                  r={3}
                  fill='#E26B8D'
                />
                <text
                  x={0}
                  y={0}
                  fill='#E26B8D'
                  fontSize={12}
                  textAnchor='middle'
                  dy={-5}
                >
                  {(d.pct_pop_elec_HREA).toFixed(1)}
                </text>
              </g>
            ))
          }
        </g>
      </svg>
    </El>
  );
}
