class Controller {
  canvas: HTMLCanvasElement;
  ui: HTMLDivElement;
  private _currentScence: any;

  constructor(props: { canvas: HTMLCanvasElement; ui: HTMLDivElement }) {
    this.canvas = props.canvas;
    this.ui = props.ui;
  }

  async setScence(scenceName) {
    this.filishScence();
    this.resetUi();
    const { default: scence } = await import(`@/scences/${scenceName}/index.ts`);
    this._currentScence = await scence(this.canvas, this.ui);
  }

  destroy() {
    this.filishScence();
    this.resetUi();
  }

  private filishScence() {
    if (this._currentScence) {
      this._currentScence?.finish();
    }
  }

  private resetUi() {
    this.ui.childNodes.forEach(child => {
      child.remove();
    });
  }
}

export default Controller;
