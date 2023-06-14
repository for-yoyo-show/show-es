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

export async function loadFile(url) {
  const req = await fetch(url);
  return req.text();
}

export function parseData(text) {
  const data = [];
  const settings = { data, NODATA_value: null };
  let max;
  let min;
  // split into lines
  text.split('\n').forEach(line => {
    // split the line by whitespace
    const parts = line.trim().split(/\s+/);
    if (parts.length === 2) {
      // only 2 parts, must be a key/value pair
      settings[parts[0]] = parseFloat(parts[1]);
    } else if (parts.length > 2) {
      // more than 2 parts, must be data
      const values = parts.map(v => {
        const value = parseFloat(v);
        if (value === settings.NODATA_value) {
          return undefined;
        }
        max = Math.max(max === undefined ? value : max, value);
        min = Math.min(min === undefined ? value : min, value);
        return value;
      });
      data.push(values);
    }
  });
  return Object.assign(settings, { min, max });
}

// o object_name | g group_name
const _object_pattern = /^[og]\s*(.+)?/;
// mtllib file_reference
const _material_library_pattern = /^mtllib /;
// usemtl material_name
const _material_use_pattern = /^usemtl /;
// usemap map_name
const _map_use_pattern = /^usemap /;
const _face_vertex_data_separator_pattern = /\s+/;

export async function parseObj2(fileUrl: string) {
  let text = await loadFile(fileUrl);
  const dirUrl = fileUrl.replace(/\/[^/]+$/, '');

  if (text.indexOf('\r\n') !== -1) {
    // This is faster than String.split with regex that splits on both
    text = text.replace(/\r\n/g, '\n');
  }

  if (text.indexOf('\\\n') !== -1) {
    // 行继续符/+换行符应该看成一行
    text = text.replace(/\\\n/g, '');
  }

  const lines = text.split('\n');
  let result = [];
  let currentMaterial;
  let currentObject;

  const state = {
    vertices: [],
    colors: [],
    normals: [],
    uvs: [],
    faces: [],
    lines: [],
    points: [],
    objects: [],
    smooth: false
  };

  for (let i = 0, l = lines.length; i < l; i++) {
    const line = lines[i].trimStart();

    if (line.length === 0) continue;

    const lineFirstChar = line.charAt(0);

    // @todo invoke passed in handler if any
    if (lineFirstChar === '#') continue; // skip comments

    if (lineFirstChar === 'v') {
      const data = line.split(_face_vertex_data_separator_pattern);

      switch (data[0]) {
        case 'v':
          state.vertices.push(parseFloat(data[1]), parseFloat(data[2]), parseFloat(data[3]));
          if (data.length >= 7) {
            state.colors.push(parseFloat(data[4]), parseFloat(data[5]), parseFloat(data[6]));
          } else {
            // if no colors are defined, add placeholders so color and vertex indices match

            state.colors.push(undefined, undefined, undefined);
          }

          break;
        case 'vn':
          state.normals.push(parseFloat(data[1]), parseFloat(data[2]), parseFloat(data[3]));
          break;
        case 'vt':
          state.uvs.push(parseFloat(data[1]), parseFloat(data[2]));
          break;
      }
    } else if (lineFirstChar === 'f') {
      const lineData = line.slice(1).trim();
      const vertexData = lineData.split(_face_vertex_data_separator_pattern);
      const faceVertices = [];

      // Parse the face vertex data into an easy to work with format

      for (let j = 0, jl = vertexData.length; j < jl; j++) {
        const vertex = vertexData[j];

        if (vertex.length > 0) {
          const vertexParts = vertex.split('/');
          faceVertices.push(vertexParts);
        }
      }

      // Draw an edge between the first vertex and all subsequent vertices to form an n-gon

      const v1 = faceVertices[0];

      for (let j = 1, jl = faceVertices.length - 1; j < jl; j++) {
        const v2 = faceVertices[j];
        const v3 = faceVertices[j + 1];

        state.faces.push(v1[0], v2[0], v3[0], v1[1], v2[1], v3[1], v1[2], v2[2], v3[2]);
      }
    } else if (lineFirstChar === 'l') {
      const lineParts = line.substring(1).trim().split(' ');
      let lineVertices = [];
      const lineUVs = [];

      if (line.indexOf('/') === -1) {
        lineVertices = lineParts;
      } else {
        for (let li = 0, llen = lineParts.length; li < llen; li++) {
          const parts = lineParts[li].split('/');

          if (parts[0] !== '') lineVertices.push(parts[0]);
          if (parts[1] !== '') lineUVs.push(parts[1]);
        }
      }

      state.lines.push([lineVertices, lineUVs]);
    } else if (lineFirstChar === 'p') {
      const lineData = line.slice(1).trim();
      const pointData = lineData.split(' ');

      state.points.push(pointData);
    } else if ((result = _object_pattern.exec(line)) !== null) {
      // o object_name
      // or
      // g group_name

      // WORKAROUND: https://bugs.chromium.org/p/v8/issues/detail?id=2869
      // let name = result[ 0 ].slice( 1 ).trim();
      const name = (' ' + result[0].slice(1).trim()).slice(1);

      state.objects.push(name);
    } else if (_material_use_pattern.test(line)) {
      // TODO使用材质名
      // state.object.startMaterial(line.substring(7).trim(), state.materialLibraries);
    } else if (_material_library_pattern.test(line)) {
      // TODO读取材质文件
      // state.materialLibraries.push(line.substring(7).trim());
    } else if (_map_use_pattern.test(line)) {
      // the line is parsed but ignored since the loader assumes textures are defined MTL files
      // (according to https://www.okino.com/conv/imp_wave.htm, 'usemap' is the old-style Wavefront texture reference method)

      console.warn(
        'THREE.OBJLoader: Rendering identifier "usemap" not supported. Textures must be defined in MTL files.'
      );
    } else if (lineFirstChar === 's') {
      result = line.split(' ');

      // smooth shading

      // @todo Handle files that have varying smooth values for a set of faces inside one geometry,
      // but does not define a usemtl for each face set.
      // This should be detected and a dummy material created (later MultiMaterial and geometry groups).
      // This requires some care to not create extra material on each smooth value for "normal" obj files.
      // where explicit usemtl defines geometry groups.
      // Example asset: examples/models/obj/cerberus/Cerberus.obj

      /*
       * http://paulbourke.net/dataformats/obj/
       *
       * From chapter "Grouping" Syntax explanation "s group_number":
       * "group_number is the smoothing group number. To turn off smoothing groups, use a value of 0 or off.
       * Polygonal elements use group numbers to put elements in different smoothing groups. For free-form
       * surfaces, smoothing groups are either turned on or off; there is no difference between values greater
       * than 0."
       */
      if (result.length > 1) {
        const value = result[1].trim().toLowerCase();
        state.smooth = value !== '0' && value !== 'off';
      } else {
        // ZBrush can produce "s" lines #11707
        state.smooth = true;
      }
    } else {
      // Handle null terminated files without exception
      if (line === '\0') continue;

      console.warn('THREE.OBJLoader: Unexpected line: "' + line + '"');
    }
  }

  return state;
}

function parseObj(text) {
  if (text.indexOf('\r\n') !== -1) {
    // This is faster than String.split with regex that splits on both
    text = text.replace(/\r\n/g, '\n');
  }

  if (text.indexOf('\\\n') !== -1) {
    // 行继续符/+换行符应该看成一行
    text = text.replace(/\\\n/g, '');
  }

  const vertices: number[] = [];
  const uvs: number[] = [];
  const normals: number[] = [];

  const faceIndices: number[] = [];
  const uvIndices: number[] = [];
  const normalIndices: number[] = [];
  const drawVerticeIndices: number[] = [];

  const useMtls: {
    name: string;
    start: number;
    end: number;
  }[] = [];
  const mtlLib: string[] = [];

  const lines = text.split('\n');

  let _current;

  for (let i = 0, l = lines.length; i < l; i++) {
    const line = lines[i].trimStart();
    if (line.length === 0) continue;
    const lineFirstChar = line.charAt(0);
    if (lineFirstChar === '#') continue; // skip comments

    if (lineFirstChar === 'v') {
      const data = line.split(/\s+/);

      switch (data[0]) {
        case 'v':
          vertices.push(parseFloat(data[1]), parseFloat(data[2]), parseFloat(data[3]));
          break;
        case 'vn':
          normals.push(parseFloat(data[1]), parseFloat(data[2]), parseFloat(data[3]));
          break;
        case 'vt':
          uvs.push(parseFloat(data[1]), parseFloat(data[2]));
          break;
      }
    } else if (lineFirstChar === 'f') {
      const lineData = line.slice(1).trim();
      const vertexData = lineData.split(/\s+/);

      // Parse the face vertex data into an easy to work with format
      const currentIndex = faceIndices.length;

      for (let j = 0; j < vertexData.length; j++) {
        const vertex = vertexData[j];

        if (vertex.length > 0) {
          const vertexParts = vertex.split('/');
          faceIndices.push(Number(vertexParts[0])); //
          uvIndices.push(Number(vertexParts?.[1])); //
          normalIndices.push(Number(vertexParts?.[2])); //

          if (j + 2 <= vertexData.length - 1) {
            drawVerticeIndices.push(currentIndex, currentIndex + j + 1, currentIndex + j + 2);
          }
        }
      }
    } else if (/^usemtl/.test(line)) {
      if (_current && _current.end === -1) {
        _current.end = uvIndices.length;
      }
      const mtl = {
        name: line.substring(7).trim(),
        start: uvIndices.length,
        end: -1
      };
      _current = mtl;
      useMtls.push(mtl);
    } else if (/^mtllib/.test(line)) {
      mtlLib.push(line.substring(7).trim());
    }
  }
  if (_current && _current.end === -1) {
    _current.end = uvIndices.length;
  }

  return {
    vertices,
    normals,
    uvs,
    faceIndices,
    uvIndices,
    normalIndices,
    drawVerticeIndices,
    useMtls,
    mtlLib
  };
}

async function parseMtls(objData, dirUrl) {
  const matls: {
    name: string;
    map_Kd: string;
  }[] = [];

  const pList = objData.mtlLib.map(async mtlUrl => {
    let text = await loadFile(dirUrl + mtlUrl);
    if (text.indexOf('\r\n') !== -1) {
      text = text.replace(/\r\n/g, '\n');
    }
    if (text.indexOf('\\\n') !== -1) {
      text = text.replace(/\\\n/g, '');
    }
    const lines = text.split('\n');

    let _currentMtl;
    for (let i = 0, l = lines.length; i < l; i++) {
      const line = lines[i].trimStart();
      if (line.length === 0) continue;
      const lineFirstChar = line.charAt(0);
      if (lineFirstChar === '#') continue; // skip comments

      if (/^newmtl/.test(line)) {
        _currentMtl = {
          name: line.substring(7).trim()
        };
        matls.push(_currentMtl);
      } else if (/^map_Kd/.test(line)) {
        if (_currentMtl) {
          _currentMtl['map_Kd'] = line.substring(7).trim();
        }
      } else {
        const [key, ...value] = line.split(' ');
        if (_currentMtl) {
          _currentMtl[key] = value;
        }
      }
    }
  });
  await Promise.all(pList);

  const mtlNum = matls.length;
  if (!mtlNum) return;
  // 只进行x轴合并
  const getXOffset = (name: string, xPoint: number) => {
    return xPoint + (matls.findIndex(mtl => mtl.name === name) || 0);
  };
  const mergeMtlX = (callback?: (image: HTMLImageElement) => any) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const unit = 256;
    canvas.width = mtlNum * unit; // 设置画布宽度
    canvas.height = unit; // 设置画布高度

    const list = matls.map(
      (mtl, index) =>
        new Promise((resolve, reject) => {
          const image = new Image();
          image.onload = () => {
            ctx.drawImage(image, index * unit, 0, 256, 256);
            resolve(image);
          };
          image.onerror = reject;

          image.src = dirUrl + mtl.map_Kd;
        })
    );

    const textureAtlasImage = new Image();
    textureAtlasImage.onload = () => {
      callback(textureAtlasImage);
    };
    Promise.all(list).then(() => {
      textureAtlasImage.src = canvas.toDataURL(); // 将画布转换为图像数据
    });

    return textureAtlasImage;
  };

  return {
    getXOffset,
    matls,
    mergeMtlX
  };
}

export async function loadeObj(fileUrl: string) {
  const text = await loadFile(fileUrl);
  const dirUrl = fileUrl.replace(/\/[^/]+$/, '/');
  const objData = parseObj(text);
  const mtl = await parseMtls(objData, dirUrl);

  // 通过pointindex找到对应材质，根据材质获取偏移的贴图坐标（因为合并了贴图）
  const getUv = (index, pointIndex) => {
    index = (index - 1) * 2;
    const name = objData.useMtls.find(mtl => pointIndex <= mtl.end).name;
    return [mtl.getXOffset(name, objData.uvs[index]), objData.uvs[index + 1]];
  };

  const drawUvs = objData.uvIndices.reduce((list, index, pointIndex) => {
    list.push(...getUv(index, pointIndex + 1));
    return list;
  }, []);

  const drawVertices = objData.faceIndices.reduce((list, index) => {
    index = (index - 1) * 3;
    list.push(...objData.vertices.slice(index, index + 3));
    return list;
  }, []);

  const drawNormals = objData.normalIndices.reduce((list, index) => {
    index = (index - 1) * 3;
    list.push(...objData.normals.slice(index, index + 3));
    return list;
  }, []);

  const { drawVerticeIndices } = objData;

  return {
    mtl,
    drawVertices,
    drawUvs,
    drawNormals,
    drawVerticeIndices
  };
}

export function resizeRendererToDisplaySize(canvas: HTMLCanvasElement, gl: WebGLRenderingContext) {
  const pixelRatio = window.devicePixelRatio || 1;
  const width = canvas.clientWidth * pixelRatio;
  const height = canvas.clientHeight * pixelRatio;
  const needResize = canvas.width !== width || canvas.height !== height;
  if (needResize) {
    gl.viewport(0, 0, width, height);
    canvas.width = width;
    canvas.height = height;
  }

  return needResize;
}
