import { Modal } from 'antd';
import { useState } from 'react';
import styled from 'styled-components';

const HeaderEl = styled.div`
  padding: 2rem;
  text-align: center;
  display: flex;
  justify-content: space-between;
  background-color: #f7f7f7;
  border-bottom: 1px solid var(--black-500);
  font-size: 1.6rem;
  line-height: 1.6;
  align-items: baseline;
  h1 {
    font-size: 2.4rem;
    line-height: 2.4rem;
    font-weight: bold;
    color: var(--primary-blue);
    margin: 0;
  }
  button {
    background: transparent;
    border: 0;
    font-size: 1.4rem;
    line-height: 1.6;
    text-transform: uppercase;
    cursor: pointer;
  }
`;

export function Header() {
  const [isModalVisible, setIsModalVisible] = useState(false);
  return (
    <>
      <HeaderEl>
        <h1>
          Electricity Access Map
        </h1>
        <button type='button' onClick={() => { setIsModalVisible(true); }}>
          Methodology
        </button>
      </HeaderEl>
      <Modal
        title='Methodology'
        visible={isModalVisible}
        onCancel={() => { setIsModalVisible(false); }}
        footer={[]}
      >
        <p>Lorem Ipsum Dolor Site Amet</p>
      </Modal>
    </>
  );
}
