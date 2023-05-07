import React, { useState } from 'react';
import Canvas from '../components/Canvas';
import { Select } from 'antd';

const context = require.context('../worker/scence', false, /\.mjs$/);
const fileNames = context.keys().map(fileName => {
  return {
    value: fileName.replace('./', ''),
    label: fileName.replace('./', '')
  };
});

const Home = () => {
  const [scenceName, setScenceName] = useState(fileNames[0].value);
  const handleChange = (value: string) => {
    console.log(`selected ${value}`);
    setScenceName(value);
  };
  return (
    <div>
      <Select onChange={handleChange} options={fileNames} defaultValue={fileNames[0].value}></Select>
      <Canvas scenceName={scenceName}></Canvas>
    </div>
  );
};

export default Home;
