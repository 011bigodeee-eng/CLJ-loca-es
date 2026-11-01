/** A single photograph shader, created only on desktop hover. No render loop
 * survives its 900ms pulse; all GL objects are explicitly released on disposal. */
export type LiquidRenderer = {
  play: (done: () => void) => void;
  dispose: () => void;
};
export async function createLiquidRenderer(
  canvas: HTMLCanvasElement,
  source: string,
  signal?: AbortSignal,
): Promise<LiquidRenderer | null> {
  const gl = canvas.getContext("webgl", {
    alpha: false,
    antialias: false,
    depth: false,
    powerPreference: "low-power",
  });
  if (!gl) return null;
  const image = new window.Image();
  let frame = 0;
  let disposed = false;
  const shaders: WebGLShader[] = [];
  const program = gl.createProgram();
  const texture = gl.createTexture();
  const buffer = gl.createBuffer();
  function dispose() {
    if (disposed) return;
    disposed = true;
    cancelAnimationFrame(frame);
    signal?.removeEventListener("abort", dispose);
    if (!image.complete) image.src = "";
    if (texture) gl!.deleteTexture(texture);
    if (buffer) gl!.deleteBuffer(buffer);
    if (program) gl!.deleteProgram(program);
    shaders.forEach((shader) => gl!.deleteShader(shader));
    gl!.getExtension("WEBGL_lose_context")?.loseContext();
  }
  if (!program || !texture || !buffer) {
    dispose();
    return null;
  }
  if (signal?.aborted) {
    dispose();
    return null;
  }
  signal?.addEventListener("abort", dispose, { once: true });
  const vertex = `attribute vec2 aPosition; varying vec2 vUv; void main(){vUv=(aPosition+1.0)*0.5;gl_Position=vec4(aPosition,0.0,1.0);}`;
  const fragment = `precision mediump float;
    varying vec2 vUv; uniform sampler2D uImage; uniform float uTime; uniform float uEnvelope; uniform vec2 uCrop; uniform vec2 uOffset;
    void main(){
      vec2 point=vUv-vec2(.58,.48); float radius=length(point);
      float wave=sin(radius*28.0-uTime*7.0)*exp(-radius*3.2)*uEnvelope;
      vec2 direction=point/max(radius,.001);
      vec2 uv=clamp(vUv+direction*wave*.012,0.0,1.0);
      vec3 color=texture2D(uImage,uOffset+uv*uCrop).rgb;
      float light=max(wave,0.0)*.035;
      color+=vec3(1.0,.3,.02)*light;
      gl_FragColor=vec4(color,1.0);
    }`;
  for (const [type, sourceCode] of [
    [gl.VERTEX_SHADER, vertex],
    [gl.FRAGMENT_SHADER, fragment],
  ] as const) {
    const shader = gl.createShader(type);
    if (!shader) {
      dispose();
      return null;
    }
    shaders.push(shader);
    gl.shaderSource(shader, sourceCode);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      dispose();
      return null;
    }
    gl.attachShader(program, shader);
  }
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    dispose();
    return null;
  }
  image.decoding = "async";
  image.src = source;
  try {
    await image.decode();
  } catch {
    dispose();
    return null;
  }
  if (disposed) return null;
  const bounds = canvas.getBoundingClientRect();
  if (!bounds.width || !bounds.height) {
    dispose();
    return null;
  }
  const ratio = Math.min(devicePixelRatio, 1.5, 1024 / bounds.width);
  canvas.width = Math.round(bounds.width * ratio);
  canvas.height = Math.round(bounds.height * ratio);
  gl.viewport(0, 0, canvas.width, canvas.height);
  gl.useProgram(program);
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(
    gl.ARRAY_BUFFER,
    new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]),
    gl.STATIC_DRAW,
  );
  const position = gl.getAttribLocation(program, "aPosition");
  gl.enableVertexAttribArray(position);
  gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);
  gl.activeTexture(gl.TEXTURE0);
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
  const target = bounds.width / bounds.height;
  const original = image.naturalWidth / image.naturalHeight;
  const cropX = Math.min(1, target / original);
  const cropY = Math.min(1, original / target);
  gl.uniform2f(gl.getUniformLocation(program, "uCrop"), cropX, cropY);
  gl.uniform2f(
    gl.getUniformLocation(program, "uOffset"),
    (1 - cropX) * 0.78,
    (1 - cropY) * 0.5,
  );
  gl.uniform1i(gl.getUniformLocation(program, "uImage"), 0);
  const time = gl.getUniformLocation(program, "uTime");
  const envelope = gl.getUniformLocation(program, "uEnvelope");
  return {
    dispose,
    play(done) {
      const start = performance.now();
      function tick(now: number) {
        if (disposed || gl!.isContextLost()) {
          done();
          return;
        }
        const progress = Math.min((now - start) / 900, 1);
        gl!.uniform1f(time, progress * 2);
        gl!.uniform1f(envelope, Math.sin(progress * Math.PI));
        gl!.drawArrays(gl!.TRIANGLES, 0, 6);
        if (progress < 1) frame = requestAnimationFrame(tick);
        else done();
      }
      frame = requestAnimationFrame(tick);
    },
  };
}
