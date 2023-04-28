import React, { Component, createRef } from 'react';
import start from '../worker/controller';

const LOADING = <div>Loading...</div>;

class Canvas extends Component {
  canvasRef = createRef<HTMLCanvasElement>();
  canvas = (<canvas ref={this.canvasRef} id="canvas"></canvas>);
  worker: unknown; // TODO
  state = {
    ui: LOADING
  };

  componentDidMount() {
    if (!this.worker) {
      this.worker = start(this.canvasRef.current as HTMLCanvasElement);
    }
  }

  render() {
    return <div id="canvas-container">{this.canvas}</div>;
  }
}

export default Canvas;
