import styled from 'styled-components';

const HeaderEl = styled.div`
  padding: 20px 0;
  text-align: center;
  box-shadow: 0 10px 13px -3px rgb(9 105 250 / 5%);
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
