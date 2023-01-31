import styled from 'styled-components';

interface Props {
  xPosition: number;
  yPosition: number;
  text: string;
}

interface TooltipElProps {
  x: number;
  y: number;
  verticalAlignment: string;
  horizontalAlignment: string;
}

const TooltipEl = styled.div<TooltipElProps>`
  display: block;
  position: fixed;
  z-index: 8;
  background-color: var(--gray-200);
  border: 1px solid var(--gray-300);
  word-wrap: break-word;
  top: ${(props) => (props.verticalAlignment === 'bottom' ? props.y - 40 : props.y + 40)}px;
  left: ${(props) => (props.horizontalAlignment === 'left' ? props.x - 20 : props.x + 20)}px;
  max-width: 24rem;
  transform: ${(props) => `translate(${props.horizontalAlignment === 'left' ? '-100%' : '0%'},${props.verticalAlignment === 'top' ? '-100%' : '0%'})`};
`;

export function ProjectTooltip(props: Props) {
  const {
    text,
    xPosition,
    yPosition,
  } = props;
  return (
    <TooltipEl x={xPosition} y={yPosition} verticalAlignment={yPosition > window.innerHeight / 2 ? 'top' : 'bottom'} horizontalAlignment={xPosition > window.innerWidth / 2 ? 'left' : 'right'}>
      <div style={{ padding: 'var(--spacing-04)', width: '100%', boxSizing: 'border-box' }}>
        {text}
      </div>
    </TooltipEl>
  );
}
