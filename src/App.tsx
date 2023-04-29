import React, { Component } from 'react';
import { Provider } from 'react-redux';
import store from './store/store';
import Router from './router/router';
import 'antd/dist/reset.css';
import './styles.scss';
import loadStyle from './theme/index';

let theme = 'light';
const changeTheme = () => {
  theme = theme === 'light' ? 'dark' : 'light';
  loadStyle(theme);
};

class App extends Component {
  render() {
    loadStyle(theme);
    return (
      <div className="app">
        <button onClick={() => changeTheme()}>改变主题</button>
        <Provider store={store}>
          <React.StrictMode>
            <Router />
          </React.StrictMode>
        </Provider>
      </div>
    );
  }
}

export default App;
