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
  ui = createRef<HTMLDivElement>();
  container = createRef<HTMLDivElement>();
  canvasController;

  constructor(porps: Props) {
    super(porps);
  }

  componentDidMount() {
    if (!this.canvasController) {
      this.canvasController = new Controller({ container: this.container.current, ui: this.ui.current });
    }
  }

  componentDidUpdate(prevProps: Readonly<Props>, prevState: Readonly<State>, snapshot?: any): void {
    if (prevProps.scenceName != this.props.scenceName) {
      this.canvasController.setScence(this.props.scenceName);
    }
  }

  componentWillUnmount(): void {
    if (this.canvasController) {
      this.canvasController.destroy();
    }
  }

  render() {
    return (
      <div className="canvas-container">
        <div id="ui" className="ui" ref={this.ui}></div>
        <div id="canvas" ref={this.container}></div>
      </div>
    );
  }
}

export default CanvasRenderer;
