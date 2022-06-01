import styled from 'styled-components';
import { format } from 'd3-format';

interface Props {
  pctValue?: number;
  popValue?: number;
  xPosition: number;
  yPosition: number;
  country: string;
  city?:string
}

interface TooltipElProps {
  x: number;
  y: number;
  verticalAlignment: string;
  horizontalAlignment: string;
}

const TooltipTitle = styled.div`
  font-size: 1.4rem;
  font-weight: 600;
  color: var(--navy);  
  background: var(--yellow);
  width: 100%;
  box-sizing: border-box;
  border-radius: 1rem 1rem 0 0;
  padding: 1.6rem 4rem 1.6rem 2rem;
  position: relative;
  font-weight: 700;
  font-size: 1.8rem;
  line-height: 1.8rem;
`;

const SubNote = styled.span`
  font-size: 1.2rem;
  color: var(--navy);
`;

const TooltipBody = styled.div`
  width: 100%;
  box-sizing: border-box;
  padding: 2rem;
`;

const RowEl = styled.div`
  font-size: 1.3rem;
  color: var(--dark-grey);
  margin-bottom: 1.5rem;
  display: flex;
  align-items: center;
`;

const RowTitleEl = styled.div`
  font-weight: 400;
  font-size: 1.6rem;
  line-height: 1.6rem;
  color: var(--navy);
  display: flex;
`;

const RowValue = styled.div`
  font-weight: 700;
  font-size: 1.4rem;
  line-height: 2rem;
  color: var(--navy);
  margin-left: 2rem;
`;

const TooltipHead = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const TooltipEl = styled.div<TooltipElProps>`
  display: block;
  position: fixed;
  z-index: 10;
  border-radius: 1rem;
  font-size: 1.4rem;
  background-color: var(--white);
  box-shadow: 0 0 1rem rgb(0 0 0 / 15%);
  word-wrap: break-word;
  top: ${(props) => props.y - 100}px;
  left: ${(props) => (props.horizontalAlignment === 'left' ? props.x - 20 : props.x + 20)}px;
  transform: ${(props) => `translate(${props.horizontalAlignment === 'left' ? '-100%' : '0%'},50%)`};
`;

const FlexRow = styled.div`
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  width: 100%;
`;

export function Tooltip(props: Props) {
  const {
    pctValue,
    popValue,
    city,
    country,
    xPosition,
    yPosition,
  } = props;
  return (
    <TooltipEl x={xPosition} y={yPosition} verticalAlignment={yPosition > window.innerHeight / 2 ? 'top' : 'bottom'} horizontalAlignment={xPosition > window.innerWidth / 2 ? 'left' : 'right'}>
      <TooltipHead>
        <TooltipTitle>
          { city || country}
          {' '}
          {
            city
              ? (
                <SubNote>
                  (
                  {country}
                  )
                </SubNote>
              )
              : null
          }
        </TooltipTitle>
      </TooltipHead>
      <TooltipBody>
        <RowEl>
          <FlexRow>
            <RowTitleEl>
              Percent Electricity Access
            </RowTitleEl>
            <RowValue>
              {
                pctValue !== undefined ? `${pctValue.toFixed(1)} %` : 'NA'
              }
            </RowValue>
          </FlexRow>
        </RowEl>
        <RowEl>
          <FlexRow>
            <RowTitleEl>
              No. Of People Withou Electricity
            </RowTitleEl>
            <RowValue>
              {
                popValue
                  ? format('.3s')(popValue).replace('G', 'B')
                  : 'NA'
              }
            </RowValue>
          </FlexRow>
        </RowEl>
      </TooltipBody>
    </TooltipEl>
  );
}
