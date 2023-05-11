import { ImageBitmapLoader, CanvasTexture } from 'three';

export const loatTexture = async url => {
  const texture = await new Promise((resolve, reject) => {
    const loader = new ImageBitmapLoader();
    loader.load(
      url,
      imageBitmap => {
        resolve(new CanvasTexture(imageBitmap));
      },
      null,
      reject
    );
  });

  return texture;
};
