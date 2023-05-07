import React, { Component } from 'react';
import { Provider } from 'react-redux';
import store from './store/store';
import Router from './router/router';
import Layout from './Layout';
import 'antd/dist/reset.css';
import './styles.scss';

class App extends Component {
  render() {
    return (
      <div className="app">
        <Layout>
          <Provider store={store}>
            <React.StrictMode>
              <Router />
            </React.StrictMode>
          </Provider>
        </Layout>
      </div>
    );
  }
}

export default App;
