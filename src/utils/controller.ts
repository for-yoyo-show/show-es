interface Props {
  container: HTMLDivElement;
  ui: HTMLDivElement;
}

export type Scence = (props: {
  canvas: HTMLCanvasElement;
  ui: HTMLDivElement;
  loadCallback: (value?: unknown) => unknown;
}) => Promise<unknown> | unknown;

class Controller {
  private _currentScence: any;

  container: HTMLDivElement;
  ui: HTMLDivElement;

  constructor({ container, ui }: Props) {
    this.container = container;
    this.ui = ui;
  }

  setScence(scenceName) {
    this.filishScence();
    this.resetUi();
    this.container.childNodes.forEach(child => this.container.removeChild(child));
    const canvas = document.createElement('canvas');
    this.container.appendChild(canvas);
    this.ui.childNodes.forEach(child => this.ui.removeChild(child));

    return new Promise((resolve, reject) => {
      import(`@/scences/${scenceName}/index.ts`)
        .then(async ({ default: scence }: { default: Scence }) => {
          this._currentScence = await scence({ canvas, ui: this.ui, loadCallback: resolve });
        })
        .catch(reject);
    });
  }

  destroy() {
    this.filishScence();
    this.resetUi();
  }

  private filishScence() {
    if (this._currentScence) {
      this._currentScence?.finish?.();
    }
  }

  private resetUi() {
    this.ui.childNodes.forEach(child => {
      child.remove();
    });
  }
}

export default Controller;
