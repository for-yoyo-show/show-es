import React, { Component, createRef } from 'react';
import Controller from '@/utils/controller';
import './canvas.scss';

interface Props {
  scenceName: string;
}

interface State {
  scenceType?: string;
}

class CanvasRenderer extends Component<Props, State> {
  canvas = createRef<HTMLCanvasElement>();
  ui = createRef<HTMLDivElement>();
  canvasController;

  constructor(porps: Props) {
    super(porps);
  }

  componentDidMount() {
    if (!this.canvasController) {
      this.canvasController = new Controller({ canvas: this.canvas.current, ui: this.ui.current });
    }
  }

  componentDidUpdate(prevProps: Readonly<Props>, prevState: Readonly<State>, snapshot?: any): void {
    if (prevProps.scenceName != this.props.scenceName) {
      this.canvasController.setScence(this.props.scenceName);
    }
  }

  render() {
    return (
      <div className="canvas-container">
        <div id="ui" className="ui" ref={this.ui}></div>
        <canvas id="canvas" className="canvas" ref={this.canvas}></canvas>
      </div>
    );
  }
}

export default CanvasRenderer;
