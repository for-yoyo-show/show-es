import React, { useState } from 'react';
import Canvas from '@/components/Canvas';
import { Select } from 'antd';

const context = require.context('../scences/', true, /^\.\/[^/]+$/);
const fileNames = context.keys().map(fileName => {
  return {
    value: fileName.replace('./', ''),
    label: fileName.replace('./', '')
  };
});

const Home = () => {
  const [scenceName, setScenceName] = useState('');
  const handleChange = (value: string) => {
    console.log(`selected ${value}`);
    setScenceName(value);
  };
  return (
    <div>
      <Select onChange={handleChange} options={[{ label: 'select', value: '' }, ...fileNames]} defaultValue=""></Select>
      <Canvas scenceName={scenceName}></Canvas>
    </div>
  );
};

export default Home;
