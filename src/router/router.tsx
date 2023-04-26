import React from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { DatePicker } from 'antd';

const About = () => {
  return <>About</>;
};

const Home = () => {
  return (
    <div>
      <h1> Hello, World! 111</h1>
      <DatePicker />
    </div>
  );
};

const router = createBrowserRouter([
  {
    path: '/',
    element: <Home />
  },
  {
    path: '/about',
    element: <About />
  }
]);

const Router = () => <RouterProvider router={router} />;

export default Router;
