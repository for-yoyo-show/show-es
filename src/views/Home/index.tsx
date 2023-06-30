import React, { useState, useEffect } from 'react';
import Canvas from '@/components/Canvas';
import type { MenuProps } from 'antd';
import { FloatButton, Drawer, Menu, message } from 'antd';
import './index.scss';

const context = require.context('../../scences/', true, /^\.\/[^/]+$/);
const fileNames = context.keys().map(fileName => {
  return {
    key: fileName.replace('./', ''),
    label: fileName.replace('./', '')
  };
});

const items: MenuProps['items'] = [...fileNames];

const Home = () => {
  const [scenceName, setScenceName] = useState('');
  const [showMenu, setShowMenu] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();

  const onClick: MenuProps['onClick'] = ({ key }) => {
    setScenceName(key);
  };
  useEffect(() => {
    if (scenceName) {
      messageApi.destroy();
    } else {
      messageApi.destroy();
      messageApi.open({
        content: '请在右下角打开菜单，选择需要展示的场景',
        duration: 0
      });
    }
  }, [scenceName]);

  return (
    <div>
      <div className="home-menu">
        {contextHolder}
        <Drawer title="选择场景" placement="left" open={showMenu} onClose={() => setShowMenu(false)}>
          <Menu items={items} onClick={onClick}></Menu>
        </Drawer>
        <FloatButton onClick={() => setShowMenu(true)}></FloatButton>
      </div>
      <Canvas scenceName={scenceName}></Canvas>
    </div>
  );
};

export default Home;
