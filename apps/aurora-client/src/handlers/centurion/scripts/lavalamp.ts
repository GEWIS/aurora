{
  /* https://codepen.io/mpirdimpirdis/pen/dWwGKa */
}
export function lavalampJavascript(startColor: string, endColor: string, progression: number, scaleFactor: number = 1) {
  return `
        var canvas;
        var gl;
        var realToCSSPixels = window.devicePixelRatio;
        var displayWidth;
        var displayHeight;
        var rings;
        var createdMetaballs = [];
        var assetsIndexToLoad = 0;
        var assetsToLoad = [
            {path: 'https://s3-us-west-2.amazonaws.com/s.cdpn.io/t-183/', src: 'noise3.png', name: 'noise3', type: 'texture'}
        ];
        var assets = {};
        
        var animationFrameId;

        window.onload = preloadAssets();
        function preloadAssets() {
        function checkIfAllAssetsAreLoaded() {
          if (assetsIndexToLoad < assetsToLoad.length) {
            loadAssetIndex(assetsIndexToLoad);
          } else {
            initialize();
          }
        }

        function loadAssetIndex(index) {
          var objectToLoad = assetsToLoad[index];

          switch (objectToLoad.type) {
            case 'texture':
              var image = new Image();
              image.onload = function(event) {
                assets[objectToLoad.name] = this;
                assetsIndexToLoad++;
                checkIfAllAssetsAreLoaded();
              };
              image.crossOrigin = '';
              image.src = objectToLoad.path + objectToLoad.src;
              break;
            }
          }
          loadAssetIndex(assetsIndexToLoad);
        }

        function initialize(){
          if (animationFrameId) {
            cancelAnimationFrame(animationFrameId);
          }
        
          canvas = document.getElementById('lavalamp-canvas');
          canvas.width = window.innerWidth;
          canvas.height = window.innerHeight;
          var glConfig = {
            premultipliedAlpha: true,
            antialias: true,
            depth:true,
            alpha: true
          }
    
          gl = canvas.getContext('webgl', glConfig) || canvas.getContext('experimental-webgl', glConfig);
  
          if(!gl){
            console.error('cannot find gl', gl);
            return;
          }
          displayWidth  = Math.floor(gl.canvas.clientWidth  / realToCSSPixels);
          displayHeight = Math.floor(gl.canvas.clientHeight / realToCSSPixels);
  
          var minSpeed = 0.2 * (1 + ${progression} / 10);
          var maxSpeed = 2.5 * (1 + ${progression} / 10);
          var minMultiplierArcX = -.25 * (1 + ${progression} / 10);
          var maxMultiplierArcX = .75 * (1 + ${progression} / 10);
          var minMultiplierArcY = -.25 * (1 + ${progression} / 10);
          var maxMultiplierArcY = .25 * (1 + ${progression} / 10);
          var scale = ${scaleFactor};
  
          var metaballsGroup1 = {
            metaballs:[
              { centerOffsetX:26 * scale, centerOffsetY:155 * scale, radius: 70 * scale, speed: getRandomFloat(minSpeed, maxSpeed), t:Math.random() * 200, arcMultiplierX:getRandomFloat(minMultiplierArcX, maxMultiplierArcX), arcMultiplierY:getRandomFloat(minMultiplierArcY, maxMultiplierArcY) },
              { centerOffsetX:-110 * scale, centerOffsetY:10 * scale, radius: 60 * scale, speed: getRandomFloat(minSpeed, maxSpeed), t:Math.random() * 200, arcMultiplierX:getRandomFloat(minMultiplierArcX, maxMultiplierArcX), arcMultiplierY:getRandomFloat(minMultiplierArcY, maxMultiplierArcY) },
              { centerOffsetX:12 * scale, centerOffsetY:-114 * scale, radius: 48 * scale, speed: getRandomFloat(minSpeed, maxSpeed), t:Math.random() * 200, arcMultiplierX:getRandomFloat(minMultiplierArcX, maxMultiplierArcX), arcMultiplierY:getRandomFloat(minMultiplierArcY, maxMultiplierArcY) },
              { centerOffsetX:-300 * scale, centerOffsetY:20 * scale, radius: 160 * scale, speed: getRandomFloat(minSpeed, maxSpeed), t:Math.random() * 200, arcMultiplierX:getRandomFloat(minMultiplierArcX, maxMultiplierArcX), arcMultiplierY:getRandomFloat(minMultiplierArcY, maxMultiplierArcY) },
              { centerOffsetX:-570 * scale, centerOffsetY:-20 * scale, radius: 50 * scale, speed: getRandomFloat(minSpeed, maxSpeed), t:Math.random() * 200, arcMultiplierX:getRandomFloat(minMultiplierArcX, maxMultiplierArcX), arcMultiplierY:getRandomFloat(minMultiplierArcY, maxMultiplierArcY) },
              ],
              texture:generateGradientTexture([{color:'${startColor}', stop:0.2}, {color:'${endColor}', stop:1.0}], false, false)
          };
          
          var metaballsGroup2 = {
            metaballs:[
              { centerOffsetX:-290 * scale, centerOffsetY:60 * scale, radius: 60 * scale, speed: getRandomFloat(minSpeed, maxSpeed), t:Math.random() * 200, arcMultiplierX:getRandomFloat(minMultiplierArcX, maxMultiplierArcX), arcMultiplierY:getRandomFloat(minMultiplierArcY, maxMultiplierArcY) },
              { centerOffsetX:-100 * scale, centerOffsetY:45 * scale, radius: 70 * scale, speed: getRandomFloat(minSpeed, maxSpeed), t:Math.random() * 200, arcMultiplierX:getRandomFloat(minMultiplierArcX, maxMultiplierArcX), arcMultiplierY:getRandomFloat(minMultiplierArcY, maxMultiplierArcY) },
              { centerOffsetX:-60 * scale, centerOffsetY:60 * scale, radius: 60 * scale, speed: getRandomFloat(minSpeed, maxSpeed), t:Math.random() * 200, arcMultiplierX:getRandomFloat(minMultiplierArcX, maxMultiplierArcX), arcMultiplierY:getRandomFloat(minMultiplierArcY, maxMultiplierArcY) },
              { centerOffsetX:160 * scale, centerOffsetY:170 * scale, radius: 90 * scale, speed: getRandomFloat(minSpeed, maxSpeed), t:Math.random() * 200, arcMultiplierX:getRandomFloat(minMultiplierArcX, maxMultiplierArcX), arcMultiplierY:getRandomFloat(minMultiplierArcY, maxMultiplierArcY) },
              { centerOffsetX:310 * scale, centerOffsetY:40 * scale, radius: 40 * scale, speed: getRandomFloat(minSpeed, maxSpeed), t:Math.random() * 200, arcMultiplierX:getRandomFloat(minMultiplierArcX, maxMultiplierArcX), arcMultiplierY:getRandomFloat(minMultiplierArcY, maxMultiplierArcY) },
              { centerOffsetX:450 * scale, centerOffsetY:-120 * scale, radius: 50 * scale, speed: getRandomFloat(minSpeed, maxSpeed), t:Math.random() * 200, arcMultiplierX:getRandomFloat(minMultiplierArcX, maxMultiplierArcX), arcMultiplierY:getRandomFloat(minMultiplierArcY, maxMultiplierArcY) },
              { centerOffsetX:230 * scale, centerOffsetY:-240 * scale, radius: 70 * scale, speed: getRandomFloat(minSpeed, maxSpeed), t:Math.random() * 200, arcMultiplierX:getRandomFloat(minMultiplierArcX, maxMultiplierArcX), arcMultiplierY:getRandomFloat(minMultiplierArcY, maxMultiplierArcY) },
              { centerOffsetX:320 * scale, centerOffsetY:-130 * scale, radius: 60 * scale, speed: getRandomFloat(minSpeed, maxSpeed), t:Math.random() * 200, arcMultiplierX:getRandomFloat(minMultiplierArcX, maxMultiplierArcX), arcMultiplierY:getRandomFloat(minMultiplierArcY, maxMultiplierArcY) },
              { centerOffsetX:110 * scale, centerOffsetY:-70 * scale, radius: 80 * scale, speed: getRandomFloat(minSpeed, maxSpeed), t:Math.random() * 200, arcMultiplierX:getRandomFloat(minMultiplierArcX, maxMultiplierArcX), arcMultiplierY:getRandomFloat(minMultiplierArcY, maxMultiplierArcY) },
              { centerOffsetX:-1070 * scale, centerOffsetY:-500 * scale, radius: 20 * scale, speed: getRandomFloat(0.07, 0.014), t:0.0, arcMultiplierX:getRandomFloat(30.0, 30.0), arcMultiplierY:getRandomFloat(10.0, 10.0) },
            ],
            texture:generateGradientTexture([{color:'${startColor}', stop:0.0}, {color:'${endColor}', stop:.7}], true, false)
          };
          
          var metaballsGroup3 = {
            metaballs:[
              { centerOffsetX:410 * scale, centerOffsetY:-120 * scale, radius: 18 * scale, speed: getRandomFloat(minSpeed, maxSpeed), t:Math.random() * 200, arcMultiplierX:getRandomFloat(minMultiplierArcX, maxMultiplierArcX), arcMultiplierY:getRandomFloat(minMultiplierArcY, maxMultiplierArcY) },
              { centerOffsetX:340 * scale, centerOffsetY:-200 * scale, radius: 60 * scale, speed: getRandomFloat(minSpeed, maxSpeed), t:Math.random() * 200, arcMultiplierX:getRandomFloat(minMultiplierArcX, maxMultiplierArcX), arcMultiplierY:getRandomFloat(minMultiplierArcY, maxMultiplierArcY) },
              { centerOffsetX:200 * scale, centerOffsetY:-190 * scale, radius: 40 * scale, speed: getRandomFloat(minSpeed, maxSpeed), t:Math.random() * 200, arcMultiplierX:getRandomFloat(minMultiplierArcX, maxMultiplierArcX), arcMultiplierY:getRandomFloat(minMultiplierArcY, maxMultiplierArcY) },
              { centerOffsetX:250 * scale, centerOffsetY:-280 * scale, radius: 16 * scale, speed: getRandomFloat(minSpeed, maxSpeed), t:Math.random() * 200, arcMultiplierX:getRandomFloat(minMultiplierArcX, maxMultiplierArcX), arcMultiplierY:getRandomFloat(minMultiplierArcY, maxMultiplierArcY) },
            ],
            texture:generateGradientTexture([{color:'${startColor}', stop:0.56}, {color:'${endColor}', stop:.7}], false, false)
          };
          
          var metaballsGroup4 = {
            metaballs:[
              { centerOffsetX:-410 * scale, centerOffsetY:-270 * scale, radius: 28 * scale, speed: getRandomFloat(minSpeed, maxSpeed), t:Math.random() * 200, arcMultiplierX:getRandomFloat(minMultiplierArcX, maxMultiplierArcX), arcMultiplierY:getRandomFloat(minMultiplierArcY, maxMultiplierArcY) },
              { centerOffsetX:-490 * scale, centerOffsetY:-230 * scale, radius: 34 * scale, speed: getRandomFloat(minSpeed, maxSpeed), t:Math.random() * 200, arcMultiplierX:getRandomFloat(minMultiplierArcX, maxMultiplierArcX), arcMultiplierY:getRandomFloat(minMultiplierArcY, maxMultiplierArcY) },
              { centerOffsetX:-470 * scale, centerOffsetY:-320 * scale, radius: 40 * scale, speed: getRandomFloat(minSpeed, maxSpeed), t:Math.random() * 200, arcMultiplierX:getRandomFloat(minMultiplierArcX, maxMultiplierArcX), arcMultiplierY:getRandomFloat(minMultiplierArcY, maxMultiplierArcY) },
              { centerOffsetX:-470 * scale, centerOffsetY:320 * scale, radius: 40 * scale, speed: getRandomFloat(minSpeed, maxSpeed), t:Math.random() * 200, arcMultiplierX:getRandomFloat(minMultiplierArcX, maxMultiplierArcX), arcMultiplierY:getRandomFloat(minMultiplierArcY, maxMultiplierArcY) },
              { centerOffsetX:-430 * scale, centerOffsetY:360 * scale, radius: 30 * scale, speed: getRandomFloat(minSpeed, maxSpeed), t:Math.random() * 200, arcMultiplierX:getRandomFloat(minMultiplierArcX, maxMultiplierArcX), arcMultiplierY:getRandomFloat(minMultiplierArcY, maxMultiplierArcY) },
            ],
            texture:generateGradientTexture([{color:'${startColor}', stop:.20}, {color:'${endColor}', stop:.4}], false, false)
          };
          
          var metaballsGroup5 = {
            metaballs:[
              { centerOffsetX:-500 * scale, centerOffsetY:-100 * scale, radius: 24 * scale, speed: getRandomFloat(minSpeed, maxSpeed), t:Math.random() * 200, arcMultiplierX:getRandomFloat(minMultiplierArcX, maxMultiplierArcX), arcMultiplierY:getRandomFloat(minMultiplierArcY, maxMultiplierArcY) },
              { centerOffsetX:30 * scale, centerOffsetY:-120 * scale, radius: 60 * scale, speed: getRandomFloat(minSpeed, maxSpeed), t:Math.random() * 200, arcMultiplierX:getRandomFloat(minMultiplierArcX, maxMultiplierArcX), arcMultiplierY:getRandomFloat(minMultiplierArcY, maxMultiplierArcY) },
              { centerOffsetX:480 * scale, centerOffsetY:170 * scale, radius: 21 * scale, speed: getRandomFloat(minSpeed, maxSpeed), t:Math.random() * 200, arcMultiplierX:getRandomFloat(minMultiplierArcX, maxMultiplierArcX), arcMultiplierY:getRandomFloat(minMultiplierArcY, maxMultiplierArcY) },
            ],
            texture:generateGradientTexture([{color:'${startColor}', stop:0.25}, {color:'${endColor}', stop:0.78}], true, false)
          };
           
          var metaballsGroup6 = {
            metaballs:[
              { centerOffsetX:820 * scale, centerOffsetY:20 * scale, radius: 200 * scale, speed: getRandomFloat(minSpeed, maxSpeed), t:Math.random() * 200, arcMultiplierX:getRandomFloat(minMultiplierArcX, maxMultiplierArcX), arcMultiplierY:getRandomFloat(minMultiplierArcY, maxMultiplierArcY) },
              { centerOffsetX:480 * scale, centerOffsetY:30 * scale, radius: 70 * scale, speed: getRandomFloat(minSpeed, maxSpeed), t:Math.random() * 200, arcMultiplierX:getRandomFloat(minMultiplierArcX, maxMultiplierArcX), arcMultiplierY:getRandomFloat(minMultiplierArcY, maxMultiplierArcY) },
              { centerOffsetX:500 * scale, centerOffsetY:-10 * scale, radius: 65 * scale, speed: getRandomFloat(minSpeed, maxSpeed), t:Math.random() * 200, arcMultiplierX:getRandomFloat(minMultiplierArcX, maxMultiplierArcX), arcMultiplierY:getRandomFloat(minMultiplierArcY, maxMultiplierArcY) },
              { centerOffsetX:1080 * scale, centerOffsetY:30 * scale, radius: 35 * scale, speed: getRandomFloat(minSpeed, maxSpeed), t:Math.random() * 200, arcMultiplierX:getRandomFloat(minMultiplierArcX, maxMultiplierArcX), arcMultiplierY:getRandomFloat(minMultiplierArcY, maxMultiplierArcY) },
              { centerOffsetX:400 * scale, centerOffsetY:160 * scale, radius: 55 * scale, speed: getRandomFloat(minSpeed, maxSpeed), t:Math.random() * 200, arcMultiplierX:getRandomFloat(minMultiplierArcX, maxMultiplierArcX), arcMultiplierY:getRandomFloat(minMultiplierArcY, maxMultiplierArcY) },
              { centerOffsetX:350 * scale, centerOffsetY:-120 * scale, radius: 75 * scale, speed: getRandomFloat(minSpeed, maxSpeed), t:Math.random() * 200, arcMultiplierX:getRandomFloat(minMultiplierArcX, maxMultiplierArcX), arcMultiplierY:getRandomFloat(minMultiplierArcY, maxMultiplierArcY) },
              { centerOffsetX:1670 * scale, centerOffsetY:500 * scale, radius: 15 * scale, speed: getRandomFloat(0.21, 0.22), t:13.0, arcMultiplierX:30.0, arcMultiplierY:6.0 },
            ],
            texture:generateGradientTexture([{color:'${startColor}', stop:0.0}, {color:'${endColor}', stop:1.0}], false, false)
          };
        
          var metaballsGroup7 = {
            metaballs:[
              { centerOffsetX:-930 * scale, centerOffsetY:40 * scale, radius: 30 * scale, speed: getRandomFloat(minSpeed, maxSpeed), t:Math.random() * 200, arcMultiplierX:getRandomFloat(minMultiplierArcX, maxMultiplierArcX), arcMultiplierY:getRandomFloat(minMultiplierArcY, maxMultiplierArcY) },
              { centerOffsetX:-800 * scale, centerOffsetY:90 * scale, radius: 60 * scale, speed: getRandomFloat(minSpeed, maxSpeed), t:Math.random() * 200, arcMultiplierX:getRandomFloat(minMultiplierArcX, maxMultiplierArcX), arcMultiplierY:getRandomFloat(minMultiplierArcY, maxMultiplierArcY) },
              { centerOffsetX:-640 * scale, centerOffsetY:270 * scale, radius: 50 * scale, speed: getRandomFloat(minSpeed, maxSpeed), t:Math.random() * 200, arcMultiplierX:getRandomFloat(minMultiplierArcX, maxMultiplierArcX), arcMultiplierY:getRandomFloat(minMultiplierArcY, maxMultiplierArcY) },
              { centerOffsetX:-590 * scale, centerOffsetY:150 * scale, radius: 90 * scale, speed: getRandomFloat(minSpeed, maxSpeed), t:Math.random() * 200, arcMultiplierX:getRandomFloat(minMultiplierArcX, maxMultiplierArcX), arcMultiplierY:getRandomFloat(minMultiplierArcY, maxMultiplierArcY) },
              { centerOffsetX:-400 * scale, centerOffsetY:240 * scale, radius: 40 * scale, speed: getRandomFloat(minSpeed, maxSpeed), t:Math.random() * 200, arcMultiplierX:getRandomFloat(minMultiplierArcX, maxMultiplierArcX), arcMultiplierY:getRandomFloat(minMultiplierArcY, maxMultiplierArcY) },
              { centerOffsetX:-300 * scale, centerOffsetY:120 * scale, radius: 35 * scale, speed: getRandomFloat(minSpeed, maxSpeed), t:Math.random() * 200, arcMultiplierX:getRandomFloat(minMultiplierArcX, maxMultiplierArcX), arcMultiplierY:getRandomFloat(minMultiplierArcY, maxMultiplierArcY) },
              { centerOffsetX:-450 * scale, centerOffsetY:50 * scale, radius: 70 * scale, speed: getRandomFloat(minSpeed, maxSpeed), t:Math.random() * 200, arcMultiplierX:getRandomFloat(minMultiplierArcX, maxMultiplierArcX), arcMultiplierY:getRandomFloat(minMultiplierArcY, maxMultiplierArcY) },
              { centerOffsetX:-590 * scale, centerOffsetY:-40 * scale, radius: 60 * scale, speed: getRandomFloat(minSpeed, maxSpeed), t:Math.random() * 200, arcMultiplierX:getRandomFloat(minMultiplierArcX, maxMultiplierArcX), arcMultiplierY:getRandomFloat(minMultiplierArcY, maxMultiplierArcY) },
              { centerOffsetX:-370 * scale, centerOffsetY:-70 * scale, radius: 50 * scale, speed: getRandomFloat(minSpeed, maxSpeed), t:Math.random() * 200, arcMultiplierX:getRandomFloat(minMultiplierArcX, maxMultiplierArcX), arcMultiplierY:getRandomFloat(minMultiplierArcY, maxMultiplierArcY) },
            ],
            texture:generateGradientTexture([{color:'${startColor}', stop:0.2}, {color:'${endColor}', stop:.7}], true, false)
          };

          createdMetaballs.push(new Metaballs(gl, metaballsGroup6));
          createdMetaballs.push(new Metaballs(gl, metaballsGroup7));
          createdMetaballs.push(new Metaballs(gl, metaballsGroup2));
          createdMetaballs.push(new Metaballs(gl, metaballsGroup1));
          createdMetaballs.push(new Metaballs(gl, metaballsGroup3));
          createdMetaballs.push(new Metaballs(gl, metaballsGroup4));
          createdMetaballs.push(new Metaballs(gl, metaballsGroup5));
  
          for (var i = 0; i < createdMetaballs.length; i++) {
            setTimeout(createdMetaballs[i].fadeIn, i * 200);
          };
          window.addEventListener('resize', onWindowResize);
          window.addEventListener('mousemove', onWindowMouseMove);
    
          resizeGL(gl);
          step();
        }
        
        function generateGradientTexture(colors, vertical, debug) {
          colors = colors || [{color:'#000000', stop:0.0}, {color:'#FFF000', stop:.5}, {color:'#642054', stop:1.0}];
          vertical = vertical !== undefined ? vertical : false;

          var size = 512;

          // create canvas
          var textureCanvas = document.createElement( 'canvas' );
          textureCanvas.width = size;
          textureCanvas.height = size;

          if(debug == true){
            textureCanvas.style.position = 'absolute';
            textureCanvas.style.top = '0px';
            textureCanvas.style.left = '0px';
            document.body.appendChild(textureCanvas);
          }

          // get context
          var context = textureCanvas.getContext( '2d' );

          // draw gradient
          context.rect( 0, 0, size, size );

          var grd = vertical ? context.createLinearGradient(0, size, 0, 0) : context.createLinearGradient(0, 0, size, 0);
          for(var i = 0; i < colors.length; i++){
            grd.addColorStop(colors[i].stop, colors[i].color);
          }
          context.fillStyle = grd;
          context.fillRect(0, 0, size, size);
      
          return textureCanvas;
        }

        function getRandomFloat(min, max) {
          return Math.random() * (max - min) + min;
        }

        function onWindowResize(event){
          canvas.width   = canvas.clientWidth;
          canvas.height  = canvas.clientHeight;
          
          resizeGL(gl);
          gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
        }

        function onWindowMouseMove(event){
          createdMetaballs.forEach(function(metaball){
            metaball.handleMouseMove(event.clientX, event.clientY);
          });
        }

        function resizeGL(gl) {
          realToCSSPixels = window.devicePixelRatio;
      
          // Lookup the size the browser is displaying the canvas in CSS pixels
          // and compute a size needed to make our drawingbuffer match it in
          // device pixels.
          displayWidth  = Math.floor(gl.canvas.clientWidth  /** realToCSSPixels*/);
          displayHeight = Math.floor(gl.canvas.clientHeight /** realToCSSPixels*/);
        
          // Check if the canvas is not the same size.
          if (gl.canvas.width  !== displayWidth ||
            gl.canvas.height !== displayHeight) {
    
            // Make the canvas the same size
            gl.canvas.width  = displayWidth;
            gl.canvas.height = displayHeight;
          }
        
          gl.viewport(0, 0, displayWidth, displayHeight);
        
          createdMetaballs.forEach(function(metaball){
            metaball.handleResize(displayWidth, displayHeight);
          });
        }

        var step = function() {
          createdMetaballs.forEach(function(metaball){
            metaball.updateSimulation();
          });
          animationFrameId = requestAnimationFrame(step);
        };
        
        var destroy = function () {
          if (animationFrameId) {
            cancelAnimationFrame(animationFrameId);
          }
        }
        `;
}

{
  /* https://codepen.io/mpirdimpirdis/pen/dWwGKa */
}
export function lavalampVertex() {
  return 'attribute vec2 position;void main() {gl_Position = vec4(position, 0.0, 1.0);}';
}

{
  /* https://codepen.io/mpirdimpirdis/pen/dWwGKa */
}
export function lavalampFragment() {
  return 'precision highp float;const int NUM_METABALLS = 15;uniform vec3 metaballs[15];uniform vec2 uResolution;uniform sampler2D uColorSampler;uniform sampler2D uNoiseSampler;uniform float uTime;void main(){  float x = gl_FragCoord.x;  float y = gl_FragCoord.y;  float v = 0.0;  float radius = 2.0;  float speed = 1.5;  for (int i = 0; i < NUM_METABALLS; i++) {  vec3 mb = metaballs[i];  float dx = mb.x - x;  float dy = mb.y - y;float r = mb.z;  v += r*r/(dx*dx + dy*dy);}vec4 color;if (v > 1.0) {  vec4 textureColor = texture2D(uColorSampler, vec2(gl_FragCoord.x / uResolution.x, gl_FragCoord.y / uResolution.y) );  vec4 noiseColor = (texture2D(uNoiseSampler, gl_FragCoord.xy / 100.0 )) / 1.;  float l = length(noiseColor);  if(l > 1.05){  vec4 mixedColor = textureColor + (noiseColor * 0.001);  color = mixedColor;}  else {color = textureColor * 0.85;  }}  else {discard;  }  gl_FragColor = vec4(color.rgb, 0.8);}';
}
