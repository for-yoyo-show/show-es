import React from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';

import Home from '../views/Home';

const About = () => {
  return <>About</>;
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
