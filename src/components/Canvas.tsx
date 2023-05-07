import React, { Component, createRef } from 'react';
import CanvasController from '@/worker/controller';
import './canvas.scss';

interface Props {
  scenceName: string;
}

interface State {
  scenceType: string;
}

class CanvasRenderer extends Component<Props, State> {
  canvas2dRef = createRef<HTMLCanvasElement>();
  canvas3dRef = createRef<HTMLCanvasElement>();
  canvasController;
  state = {
    scenceType: null
  };

  constructor(porps: Props) {
    super(porps);
  }

  componentDidMount() {
    if (!this.canvasController && this.canvas2dRef.current && this.canvas3dRef.current) {
      this.canvasController = new CanvasController(this.canvas2dRef.current, this.canvas3dRef.current);
    }
  }

  componentDidUpdate(prevProps: Props) {
    if (prevProps.scenceName !== this.props.scenceName) {
      this.canvasController.setShowCreator(this.props.scenceName).then(mode => {
        this.setState({
          scenceType: mode
        });
      });
    }
  }

  componentWillUnmount() {
    this.canvasController.stopRender();
  }

  render() {
    return (
      <div className="canvas-container">
        <canvas
          ref={this.canvas2dRef}
          id="canvas2d"
          className={['canvas', this.state.scenceType === '2d' ? 'show' : null].join(' ')}
        ></canvas>
        <canvas
          ref={this.canvas3dRef}
          id="canvas3d"
          className={['canvas', this.state.scenceType === '3d' ? 'show' : null].join(' ')}
        ></canvas>
      </div>
    );
  }
}

export default CanvasRenderer;
