import loadTheme from './theme/index';
import React, { useRef } from 'react';

interface Props {
  children: JSX.Element;
}

const Layout = ({ children }: Props) => {
  const theme = useRef('light');
  loadTheme(theme.current);
  const changeTheme = () => {
    theme.current = theme.current === 'light' ? 'dark' : 'light';
    loadTheme(theme.current);
  };
  return (
    <div>
      {/* <button onClick={() => changeTheme()}>改变主题</button> */}
      {children}
    </div>
  );
};

export default Layout;
