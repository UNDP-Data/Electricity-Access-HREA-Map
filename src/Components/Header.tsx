import styled from 'styled-components';

const HeaderEl = styled.div`
  padding: 20px 0;
  text-align: center;
  h1 {
    font-size: 30px;
    margin: 0 0 10px 0;
  }
  h2 {
    font-size: 18px;
    margin: 0;
  }
`;

export function Header() {
  return (
    <HeaderEl>
      <h1>
        Electricity Access Map
      </h1>
    </HeaderEl>
  );
}
