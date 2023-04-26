import React, { Component } from 'react';
import { Provider } from 'react-redux';
import store from './store/store';
import Router from './router/router';
import 'antd/dist/reset.css';
import './App.css';

class App extends Component {
  render() {
    return (
      <div className="app">
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
