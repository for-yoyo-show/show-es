class Controller {
  canvas: HTMLCanvasElement;
  ui: HTMLDivElement;

  constructor(props: { canvas: HTMLCanvasElement; ui: HTMLDivElement }) {
    this.canvas = props.canvas;
    this.ui = props.ui;
  }

  async setScence(scenceName) {
    this.ui.childNodes.forEach(child => {
      child.remove();
    });
    const { default: scence } = await import('@/scences/' + scenceName);
    scence(this.canvas, this.ui);
  }
}

export default Controller;
