class Controller {
  container: HTMLDivElement;
  ui: HTMLDivElement;
  private _currentScence: any;

  constructor(props: { container: HTMLDivElement; ui: HTMLDivElement }) {
    this.container = props.container;
    this.ui = props.ui;
  }

  async setScence(scenceName) {
    this.filishScence();
    this.resetUi();
    this.container.childNodes.forEach(child => this.container.removeChild(child));
    const canvas = document.createElement('canvas');
    this.container.appendChild(canvas);
    this.ui.childNodes.forEach(child => this.ui.removeChild(child));

    const { default: scence } = await import(`@/scences/${scenceName}/index.ts`);
    this._currentScence = await scence(canvas, this.ui);
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
