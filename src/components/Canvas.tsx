import React, { Component, createRef } from 'react';
import { Spin } from 'antd';
import WEBGL from 'three/examples/jsm/capabilities/WebGL.js';
import Controller from '@/utils/controller';
import './canvas.scss';

interface Props {
  scenceName: string;
}

interface State {
  loading: boolean;
}

class CanvasRenderer extends Component<Props, State> {
  ui = createRef<HTMLDivElement>();
  container = createRef<HTMLDivElement>();
  canvasController;
  state = {
    loading: false
  };

  constructor(porps: Props) {
    super(porps);
  }

  componentDidMount() {
    if (!this.canvasController && this.container.current && this.ui.current) {
      this.canvasController = new Controller({
        container: this.container.current,
        ui: this.ui.current
      });
    }
  }

  componentDidUpdate(prevProps: Readonly<Props>, prevState: Readonly<State>, snapshot?: any): void {
    if (prevProps.scenceName != this.props.scenceName) {
      this.setState({
        loading: true
      });
      this.canvasController.setScence(this.props.scenceName).then(() => {
        this.setState({
          loading: false
        });
      });
    }
  }

  componentWillUnmount(): void {
    if (this.canvasController) {
      this.canvasController.destroy();
    }
  }

  render() {
    let canvas;
    if (WEBGL.isWebGLAvailable()) {
      canvas = (
        <div>
          <div id="ui" className="ui" ref={this.ui}></div>
          <Spin spinning={this.state.loading}>
            <div id="canvas" ref={this.container}></div>
          </Spin>
        </div>
      );
    } else {
      canvas = <div dangerouslySetInnerHTML={{ __html: WEBGL.getWebGLErrorMessage().outerHTML }}></div>;
    }
    return canvas;
  }
}

export default CanvasRenderer;
