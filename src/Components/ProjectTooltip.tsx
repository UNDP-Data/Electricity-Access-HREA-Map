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

const TooltipBody = styled.div`
  width: 100%;
  box-sizing: border-box;
  padding: 2rem;
`;

const TooltipEl = styled.div<TooltipElProps>`
  display: block;
  position: fixed;
  z-index: 10;
  border-radius: 1rem;
  font-weight: 400;
  font-size: 1.6rem;
  line-height: 1.6rem;
  color: var(--navy);
  background-color: var(--white);
  box-shadow: 0 0 1rem rgb(0 0 0 / 15%);
  word-wrap: break-word;
  top: ${(props) => props.y}px;
  left: ${(props) => (props.horizontalAlignment === 'left' ? props.x - 20 : props.x + 20)}px;
  transform: ${(props) => `translate(${props.horizontalAlignment === 'left' ? '-100%' : '0%'},-50%)`};
`;

export function ProjectTooltip(props: Props) {
  const {
    text,
    xPosition,
    yPosition,
  } = props;
  return (
    <TooltipEl x={xPosition} y={yPosition} verticalAlignment={yPosition > window.innerHeight / 2 ? 'top' : 'bottom'} horizontalAlignment={xPosition > window.innerWidth / 2 ? 'left' : 'right'}>
      <TooltipBody>
        {text}
      </TooltipBody>
    </TooltipEl>
  );
}
