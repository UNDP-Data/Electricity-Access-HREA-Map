import { Modal } from 'antd';
import { useState } from 'react';

export function Header() {
  const [isModalVisible, setIsModalVisible] = useState(false);
  return (
    <>
      <div className='flex-div flex-space-between flex-vert-align-center' style={{ padding: 'var(--spacing-05)', backgroundColor: 'var(--gray-200)' }}>
        <h4 className='undp-typography margin-bottom-00 bold'>
          Electricity Access from Space
        </h4>
        <button className='undp-button button-primary' type='button' onClick={() => { setIsModalVisible(true); }}>
          Methodology
        </button>
      </div>
      <Modal
        open={isModalVisible}
        className='undp-modal'
        title='Methodology'
        onOk={() => { setIsModalVisible(false); }}
        onCancel={() => { setIsModalVisible(false); }}
        width='75%'
      >
        <p className='undp-typography'>Lorem Ipsum Dolor Site Amet</p>
      </Modal>
    </>
  );
}
