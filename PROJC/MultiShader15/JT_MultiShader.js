//3456789_123456789_123456789_123456789_123456789_123456789_123456789_123456789_
// (JT: why the numbers? counts columns, helps me keep 80-char-wide listings)
//
// TABS set to 2.
//
// ORIGINAL SOURCE:
// RotatingTranslatedTriangle.js (c) 2012 matsuda
// HIGHLY MODIFIED to make:
//
// JT_MultiShader.js  for EECS 351-1, 
//									Northwestern Univ. Jack Tumblin

/* Show how to use 3 separate VBOs with different verts, attributes & uniforms. 
-------------------------------------------------------------------------------
	Create a 'VBObox' object/class/prototype & library to collect, hold & use all 
	data and functions we need to render a set of vertices kept in one Vertex 
	Buffer Object (VBO) on-screen, including:
	--All source code for all Vertex Shader(s) and Fragment shader(s) we may use 
		to render the vertices stored in this VBO;
	--all variables needed to select and access this object's VBO, shaders, 
		uniforms, attributes, samplers, texture buffers, and any misc. items. 
	--all variables that hold values (uniforms, vertex arrays, element arrays) we 
	  will transfer to the GPU to enable it to render the vertices in our VBO.
	--all user functions: init(), draw(), adjust(), reload(), empty(), restore().
	Put all of it into 'JT_VBObox-Lib.js', a separate library file.

USAGE:
------
1) If your program needs another shader program, make another VBObox object:
 (e.g. an easy vertex & fragment shader program for drawing a ground-plane grid; 
 a fancier shader program for drawing Gouraud-shaded, Phong-lit surfaces, 
 another shader program for drawing Phong-shaded, Phong-lit surfaces, and
 a shader program for multi-textured bump-mapped Phong-shaded & lit surfaces...)
 
 HOW:
 a) COPY CODE: create a new VBObox object by renaming a copy of an existing 
 VBObox object already given to you in the VBObox-Lib.js file. 
 (e.g. copy VBObox1 code to make a VBObox3 object).

 b) CREATE YOUR NEW, GLOBAL VBObox object.  
 For simplicity, make it a global variable. As you only have ONE of these 
 objects, its global scope is unlikely to cause confusions/errors, and you can
 avoid its too-frequent use as a function argument.
 (e.g. above main(), write:    var phongBox = new VBObox3();  )

 c) INITIALIZE: in your JS progam's main() function, initialize your new VBObox;
 (e.g. inside main(), write:  phongBox.init(); )

 d) DRAW: in the JS function that performs all your webGL-drawing tasks, draw
 your new VBObox's contents on-screen. 
 (NOTE: as it's a COPY of an earlier VBObox, your new VBObox's on-screen results
  should duplicate the initial drawing made by the VBObox you copied.  
  If that earlier drawing begins with the exact same initial position and makes 
  the exact same animated moves, then it will hide your new VBObox's drawings!
  --THUS-- be sure to comment out the earlier VBObox's draw() function call  
  to see the draw() result of your new VBObox on-screen).
  (e.g. inside drawAll(), add this:  
      phongBox.switchToMe();
      phongBox.draw();            )

 e) ADJUST: Inside the JS function that animates your webGL drawing by adjusting
 uniforms (updates to ModelMatrix, etc) call the 'adjust' function for each of your
VBOboxes.  Move all the uniform-adjusting operations from that JS function into the
'adjust()' functions for each VBObox. 

2) Customize the VBObox contents; add vertices, add attributes, add uniforms.
 ==============================================================================*/


// Global Variables  
//   (These are almost always a BAD IDEA, but here they eliminate lots of
//    tedious function arguments. 
//    Later, collect them into just a few global, well-organized objects!)
// ============================================================================
// for WebGL usage:--------------------
var gl;													// WebGL rendering context -- the 'webGL' object
																// in JavaScript with all its member fcns & data
var g_canvasID;									// HTML-5 'g_canvasID' element ID#
cameraX = 5
cameraY = 5
cameraZ = 3
lookX = -7
lookY = -9
lookZ = -5

// For multiple VBOs & Shaders:-----------------
worldBox = new VBObox0();		  // Holds VBO & shaders for 3D 'world' ground-plane grid, etc;
part1Box = new VBObox1();		  // "  "  for first set of custom-shaded 3D parts
part2Box = new VBObox2();     // "  "  for second set of custom-shaded 3D parts
accordianSphereBox = new VBObox3();
boxBox = new VBObox4();
satBox = new VBObox5();


// For animation:---------------------
var g_lastMS = Date.now();			// Timestamp (in milliseconds) for our 
                                // most-recently-drawn WebGL screen contents.  
                                // Set & used by moveAll() fcn to update all
                                // time-varying params for our webGL drawings.
  // All time-dependent params (you can add more!)
var g_angleNow0  =  0.0; 			  // Current rotation angle, in degrees.
var g_angleRate0 = 45.0;				// Rotation angle rate, in degrees/second.
                                //---------------
var angle1 = 0;
var angle1rate = 45.0;

var g_angleNow1  = 100.0;       // current angle, in degrees
var g_angleRate1 =  95.0;        // rotation angle rate, degrees/sec
var g_angleMax1  = 150.0;       // max, min allowed angle, in degrees
var g_angleMin1  =  60.0;
                                //---------------
var g_angleNow2  =  0.0; 			  // Current rotation angle, in degrees.
var g_angleRate2 = -62.0;				// Rotation angle rate, in degrees/second.

                                //---------------
var g_posNow0 =  0.0;           // current position
var g_posRate0 = 0.6;           // position change rate, in distance/second.
var g_posMax0 =  0.5;           // max, min allowed for g_posNow;
var g_posMin0 = -0.5;           
                                // ------------------
var g_posNow1 =  0.0;           // current position
var g_posRate1 = 0.5;           // position change rate, in distance/second.
var g_posMax1 =  1.0;           // max, min allowed positions
var g_posMin1 = -1.0;
                                //---------------

var g_angle02 = 0;
var g_angle02Rate = 10.0;

var g_angle03 = 0;
var g_angle03Rate = -30.0;

var g_angle01 = 0;                  
var g_angle01Rate = 45.0; 

// For mouse/keyboard:------------------------
var g_show0 = 1;								// 0==Show, 1==Hide VBO0 contents on-screen.
var g_show1 = 1;								// 	"					"			VBO1		"				"				" 
var g_show2 = 1;                //  "         "     VBO2    "       "       "
var g_show3 = 1;
var g_show4 = 1;
var g_show5 = 1;


function main() {
//=============================================================================
  // Retrieve the HTML-5 <g_canvasID> element where webGL will draw our pictures:
  g_canvasID = document.getElementById('webgl');	
  // Create the the WebGL rendering context: one giant JavaScript object that
  // contains the WebGL state machine adjusted by large sets of WebGL functions,
  // built-in variables & parameters, and member data. Every WebGL function call
  // will follow this format:  gl.WebGLfunctionName(args);

  // Create the the WebGL rendering context: one giant JavaScript object that
  // contains the WebGL state machine, adjusted by big sets of WebGL functions,
  // built-in variables & parameters, and member data. Every WebGL func. call
  // will follow this format:  gl.WebGLfunctionName(args);
  //SIMPLE VERSION:  gl = getWebGLContext(g_g_canvasIDID); 
  // Here's a BETTER version:
  gl = g_canvasID.getContext("webgl", { preserveDrawingBuffer: true});
	// This fancier-looking version disables HTML-5's default screen-clearing, so 
	// that our drawMain() 
	// function will over-write previous on-screen results until we call the 
	// gl.clear(COLOR_BUFFER_BIT); function. )
  if (!gl) {
    console.log('Failed to get the rendering context for WebGL');
    return;
  }
  gl.clearColor(0.2, 0.2, 0.2, 1);	  // RGBA color for clearing <g_canvasID>

  gl.enable(gl.DEPTH_TEST);

  //----------------SOLVE THE 'REVERSED DEPTH' PROBLEM:------------------------
  // IF the GPU doesn't transform our vertices by a 3D Camera Projection Matrix
  // (and it doesn't -- not until Project B) then the GPU will compute reversed 
  // depth values:  depth==0 for vertex z == -1;   (but depth = 0 means 'near') 
  //		    depth==1 for vertex z == +1.   (and depth = 1 means 'far').
  //
  // To correct the 'REVERSED DEPTH' problem, we could:
  //  a) reverse the sign of z before we render it (e.g. scale(1,1,-1); ugh.)
  //  b) reverse the usage of the depth-buffer's stored values, like this:
 // gl.enable(gl.DEPTH_TEST); // enabled by default, but let's be SURE.

  //gl.clearDepth(0.0);       // each time we 'clear' our depth buffer, set all
                            // pixel depths to 0.0  (1.0 is DEFAULT)
  //gl.depthFunc(gl.GREATER); // draw a pixel only if its depth value is GREATER
                            // than the depth buffer's stored value.
                            // (gl.LESS is DEFAULT; reverse it!)
  //------------------end 'REVERSED DEPTH' fix---------------------------------

  window.addEventListener("keydown", myKeyDown, false);
  window.addEventListener("keyup", myKeyUp, false);


  // Initialize each of our 'vboBox' objects: 
  worldBox.init(gl);		// VBO + shaders + uniforms + attribs for our 3D world,
                        // including ground-plane,                       
  part1Box.init(gl);		//  "		"		"  for 1st kind of shading & lighting
	part2Box.init(gl);    //  "   "   "  for 2nd kind of shading & lighting
  accordianSphereBox.init(gl);    //  "   "   "  for 2nd kind of shading & lighting
  boxBox.init(gl);    //  "   "   "  for 2nd kind of shading & lighting
  satBox.init(gl);    //  "   "   "  for 2nd kind of shading & lighting

  
  gl.clearColor(0.2, 0.2, 0.2, 1);	  // RGBA color for clearing <g_canvasID>
  
  // ==============ANIMATION=============
  // Quick tutorials on synchronous, real-time animation in JavaScript/HTML-5: 
  //    https://webglfundamentals.org/webgl/lessons/webgl-animation.html
  //  or
  //  	http://creativejs.com/resources/requestanimationframe/
  //		--------------------------------------------------------
  // Why use 'requestAnimationFrame()' instead of the simpler-to-use
  //	fixed-time setInterval() or setTimeout() functions?  Because:
  //		1) it draws the next animation frame 'at the next opportunity' instead 
  //			of a fixed time interval. It allows your browser and operating system
  //			to manage its own processes, power, & computing loads, and to respond 
  //			to on-screen window placement (to skip battery-draining animation in 
  //			any window that was hidden behind others, or was scrolled off-screen)
  //		2) it helps your program avoid 'stuttering' or 'jittery' animation
  //			due to delayed or 'missed' frames.  Your program can read and respond 
  //			to the ACTUAL time interval between displayed frames instead of fixed
  //		 	fixed-time 'setInterval()' calls that may take longer than expected.
  //------------------------------------
 

 var tick = function() {		    // locally (within main() only), define our 
                                // self-calling animation function. 
    requestAnimationFrame(tick, g_canvasID); // browser callback request; wait
                                // til browser is ready to re-draw g_canvasID, then

    curLightDisplay();
    curShadeDisplay();
    timerAll();  // Update all time-varying params, and
    drawAll();                // Draw all the VBObox contents
    };
  //------------------------------------
  tick();                       // do it again!
  drawResize();   

}

function timerAll() {
//=============================================================================
// Find new values for all time-varying parameters used for on-screen drawing
  // use local variables to find the elapsed time.
  var nowMS = Date.now();             // current time (in milliseconds)
  var elapsedMS = nowMS - g_lastMS;   // 
  g_lastMS = nowMS;                   // update for next webGL drawing.
  if(elapsedMS > 1000.0) {            
    // Browsers won't re-draw 'g_canvasID' element that isn't visible on-screen 
    // (user chose a different browser tab, etc.); when users make the browser
    // window visible again our resulting 'elapsedMS' value has gotten HUGE.
    // Instead of allowing a HUGE change in all our time-dependent parameters,
    // let's pretend that only a nominal 1/30th second passed:
    elapsedMS = 1000.0/30.0;
    }
  // Find new time-dependent parameters using the current or elapsed time:
  // Continuous rotation:
  g_angleNow0 = g_angleNow0 + (g_angleRate0 * elapsedMS) / 1000.0;
  g_angleNow1 = g_angleNow1 + (g_angleRate1 * elapsedMS) / 1000.0;
  g_angleNow2 = g_angleNow2 + (g_angleRate2 * elapsedMS) / 1000.0;
  g_angleNow0 %= 360.0;   // keep angle >=0.0 and <360.0 degrees  
  g_angleNow1 %= 360.0;   
  g_angleNow2 %= 360.0;
  if(g_angleNow1 > g_angleMax1) { // above the max?
    g_angleNow1 = g_angleMax1;    // move back down to the max, and
    g_angleRate1 = -g_angleRate1; // reverse direction of change.
    }
  else if(g_angleNow1 < g_angleMin1) {  // below the min?
    g_angleNow1 = g_angleMin1;    // move back up to the min, and
    g_angleRate1 = -g_angleRate1;
    }
  // Continuous movement:
  g_posNow0 += g_posRate0 * elapsedMS / 1000.0;
  g_posNow1 += g_posRate1 * elapsedMS / 1000.0;
  // apply position limits
  if(g_posNow0 > g_posMax0) {   // above the max?
    g_posNow0 = g_posMax0;      // move back down to the max, and
    g_posRate0 = -g_posRate0;   // reverse direction of change
    }
  else if(g_posNow0 < g_posMin0) {  // or below the min? 
    g_posNow0 = g_posMin0;      // move back up to the min, and
    g_posRate0 = -g_posRate0;   // reverse direction of change.
    }
  if(g_posNow1 > g_posMax1) {   // above the max?
    g_posNow1 = g_posMax1;      // move back down to the max, and
    g_posRate1 = -g_posRate1;   // reverse direction of change
    }
  else if(g_posNow1 < g_posMin1) {  // or below the min? 
    g_posNow1 = g_posMin1;      // move back up to the min, and
    g_posRate1 = -g_posRate1;   // reverse direction of change.
    }
    
  if(angle1 > 40 && angle1rate > 0) angle1rate = -angle1rate;
  if(angle1 < 0 && angle1rate < 0) angle1rate = -angle1rate;
  angle1 = angle1 + (angle1rate * elapsedMS) / 4000.0; 

  if(g_angle02 < -42 && g_angle02Rate < 0)
		g_angle02Rate = -g_angle02Rate;
	else if(g_angle02 > 0 && g_angle02Rate > 0)
		g_angle02Rate = -g_angle02Rate;
	
	if(g_angle03 < -90 && g_angle03Rate < 0)
		g_angle03Rate = -g_angle03Rate;
	else if(g_angle03 > 0 && g_angle03Rate > 0)
		g_angle03Rate = -g_angle03Rate;

	g_angle03 = g_angle03 + 2*(g_angle03Rate * elapsedMS) / 1000.0; // rate in degrees/sec
	g_angle02 = g_angle02 + 2*(g_angle02Rate * elapsedMS) / 1000.0; // rate in degrees/sec

  if(g_angle01 >  50.0 && g_angle01Rate > 0) g_angle01Rate = -g_angle01Rate;
    if(g_angle01 < -40.0 && g_angle01Rate < 0) g_angle01Rate = -g_angle01Rate;
    g_angle01 = g_angle01 + (g_angle01Rate * 0.3*elapsedMS) / 1000.0; // rate in degrees/sec
}

function drawAll() {
//=============================================================================
  // Clear on-screen HTML-5 <g_canvasID> object:
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

var b4Draw = Date.now();
var b4Wait = b4Draw - g_lastMS;

  gl.viewport(0, 
    0,													// (x,y) location(in pixels)
    g_canvasID.width, 				// viewport width, height.
    g_canvasID.height);

    var vpAspect = g_canvasID.width /	(g_canvasID.height);

	  if(g_show2 == 1) { // IF user didn't press HTML button to 'hide' VBO2:
      part2Box.switchToMe();  // Set WebGL to render from this VBObox.
        part2Box.adjust(vpAspect);		  // Send new values for uniforms to the GPU, and
        part2Box.draw();			  // draw our VBO's contents using our shaders.
      }
    if(g_show0 == 1) {	// IF user didn't press HTML button to 'hide' VBO0:
      worldBox.switchToMe();  // Set WebGL to render from this VBObox.
      worldBox.adjust(vpAspect);		  // Send new values for uniforms to the GPU, and
      worldBox.draw();			  // draw our VBO's contents using our shaders.
      }
		if(g_show1 == 1) { // IF user didn't press HTML button to 'hide' VBO1:
      part1Box.switchToMe();  // Set WebGL to render from this VBObox.
  	  part1Box.adjust(vpAspect);		  // Send new values for uniforms to the GPU, and
  	  part1Box.draw();			  // draw our VBO's contents using our shaders.
    }
    if(g_show3 == 1) { // IF user didn't press HTML button to 'hide' VBO1:
    accordianSphereBox.switchToMe();  // Set WebGL to render from this VBObox.
    accordianSphereBox.adjust(vpAspect);		  // Send new values for uniforms to the GPU, and
  }
    if(g_show4 == 1) {	// IF user didn't press HTML button to 'hide' VBO0:
    boxBox.switchToMe();  // Set WebGL to render from this VBObox.
    boxBox.adjust(vpAspect);		  // Send new values for uniforms to the GPU, and
    }
    if(g_show5 == 1) {	// IF user didn't press HTML button to 'hide' VBO0:
    satBox.switchToMe();  // Set WebGL to render from this VBObox.
    satBox.adjust(vpAspect);		  // Send new values for uniforms to the GPU, and
    }


/* // ?How slow is our own code?  	
var aftrDraw = Date.now();
var drawWait = aftrDraw - b4Draw;
console.log("wait b4 draw: ", b4Wait, "drawWait: ", drawWait, "mSec");
*/
}

function VBO0toggle() {
//=============================================================================
// Called when user presses HTML-5 button 'Show/Hide VBO0'.
  if(g_show0 != 1) g_show0 = 1;				// show,
  else g_show0 = 0;										// hide.
  console.log('g_show0: '+g_show0);
}

function VBO1toggle() {
//=============================================================================
// Called when user presses HTML-5 button 'Show/Hide VBO1'.
  if(g_show1 != 1) g_show1 = 1;			// show,
  else g_show1 = 0;									// hide.
  console.log('g_show1: '+g_show1);
}

function VBO2toggle() {
//=============================================================================
// Called when user presses HTML-5 button 'Show/Hide VBO2'.
  if(g_show2 != 1) g_show2 = 1;			// show,
  else g_show2 = 0;									// hide.
  console.log('g_show2: '+g_show2);
}

function VBO3toggle() {
  //=============================================================================
  // Called when user presses HTML-5 button 'Show/Hide VBO2'.
    if(g_show3 != 1) g_show3 = 1;			// show,
    else g_show3 = 0;									// hide.
    console.log('g_show3: '+g_show3);
  }

function VBO4toggle() {
    //=============================================================================
    // Called when user presses HTML-5 button 'Show/Hide VBO2'.
      if(g_show4 != 1) g_show4 = 1;			// show,
      else g_show4 = 0;									// hide.
      console.log('g_show4: '+g_show4);
}

function VBO5toggle() {
  //=============================================================================
  // Called when user presses HTML-5 button 'Show/Hide VBO2'.
    if(g_show5 != 1) g_show5 = 1;			// show,
    else g_show5 = 0;									// hide.
    console.log('g_show5: '+g_show5);
}


function lightSwitch() {
  if (lightswitch == 0) {
    lightswitch = 1; 
    worldBox.init(gl);
    accordianSphereBox.init(gl);
    boxBox.init(gl);
    satBox.init(gl);
  }
  else if (lightswitch == 1) {
    lightswitch = 0;
    worldBox.init(gl);
    accordianSphereBox.init(gl);
    boxBox.init(gl);
    satBox.init(gl);
  }
  
}

function curLightDisplay() {
  if (lightswitch == 0) {
    document.getElementById('curLight').innerHTML= 
			'Phong Lighting';
  }
  if (lightswitch == 1) {
    document.getElementById('curLight').innerHTML= 
			'Blinn Phong Lighting';
  }
}

function shadeSwitch() {
  if (shadeswitch == 0) {
    shadeswitch = 1; 
    worldBox.init(gl);
    accordianSphereBox.init(gl);
    boxBox.init(gl);
    satBox.init(gl);
    }
  else if (shadeswitch == 1) {
    shadeswitch = 0;
    worldBox.init(gl);
    accordianSphereBox.init(gl);
    boxBox.init(gl);
    satBox.init(gl);
  }
}

function curShadeDisplay() {
  if (shadeswitch == 0) {
    document.getElementById('curShade').innerHTML= 
			'Gouraud Shading';
  }
  if (shadeswitch == 1) {
    document.getElementById('curShade').innerHTML= 
			'Phong Shading';
  }
}

var newX = 0
var newY = 0
var newZ = 0

function perp() {
	x = lookX - cameraX
	y = lookY - cameraY
	var angle90 = Math.atan2(-x,y)
	newX = -Math.cos(angle90)
	newY = -Math.sin(angle90)
}

function par() {
	x = lookX - cameraX
	y = lookY - cameraY
	z = lookZ - cameraZ
	var angle90 = Math.atan2(y,x)
	var angle902 = Math.atan2(z,x)
	newX = -Math.cos(angle90)
	newY = -Math.sin(angle90)
	newZ = Math.sin(angle902)
}


function keys(kev) {
	if (kev.code == "KeyA") {
		perp()
		cameraX = cameraX + newX*0.3
		cameraY = cameraY + newY*0.3
		lookX = lookX + newX*0.3
		lookY = lookY + newY*0.3
	}
	if (kev.code == "KeyD") {
		perp()
		cameraX = cameraX - newX*0.3
		cameraY = cameraY - newY*0.3
		lookX = lookX - newX*0.3
		lookY = lookY - newY*0.3
	}
	if (kev.code == "KeyW") {
		par()
		cameraX = cameraX - newX*0.3
		cameraY = cameraY - newY*0.3
		cameraZ = cameraZ + newZ*0.3
		lookX = lookX - newX*0.3
		lookY = lookY - newY*0.3
	}
	if (kev.code == "KeyS") {
		par()
		cameraX = cameraX + newX*0.3
		cameraY = cameraY + newY*0.3
		cameraZ = cameraZ - newZ*0.3
		lookX = lookX + newX*0.3
		lookY = lookY + newY*0.3
	}
	if (kev.code == "ArrowUp") {
		lookZ = lookZ + 0.3
	}
	if (kev.code == "ArrowLeft") {
		perp()
		lookX = lookX + newX*0.3
		lookY = lookY + newY*0.3

	}
	if (kev.code == "ArrowDown") {
		lookZ = lookZ - 0.3

	}
	if (kev.code == "ArrowRight") {
		perp()
		lookX = lookX - newX*0.3
		lookY = lookY - newY*0.3
	}
	
}

function myKeyDown(kev) {

	keys(kev)
  //===============================================================================
  // Called when user presses down ANY key on the keyboard;
  //
  // For a light, easy explanation of keyboard events in JavaScript,
  // see:    http://www.kirupa.com/html5/keyboard_events_in_javascript.htm
  // For a thorough explanation of a mess of JavaScript keyboard event handling,
  // see:    http://javascript.info/tutorial/keyboard-events
  //
  // NOTE: Mozilla deprecated the 'keypress' event entirely, and in the
  //        'keydown' event deprecated several read-only properties I used
  //        previously, including kev.charCode, kev.keyCode. 
  //        Revised 2/2019:  use kev.key and kev.code instead.
  //
  // Report EVERYTHING in console:
	console.log(  "--kev.code:",    kev.code,   "\t\t--kev.key:",     kev.key, 
				"\n--kev.ctrlKey:", kev.ctrlKey,  "\t--kev.shiftKey:",kev.shiftKey,
				"\n--kev.altKey:",  kev.altKey,   "\t--kev.metaKey:", kev.metaKey);
  
  // and report EVERYTHING on webpage:
	  
   
	  switch(kev.code) {
		  case "KeyP":
			  console.log("Pause/unPause!\n");                // print on console,
		  
			  if(g_isRun==true) {
				g_isRun = false;    // STOP animation
				}
			  else {
				g_isRun = true;     // RESTART animation
				tick();
				}
			  break;
		  //------------------WASD navigation-----------------
		  case "KeyA":
			  console.log("a/A key: Strafe LEFT!\n");
			  
			  break;
	  	  case "KeyD":
			  console.log("d/D key: Strafe RIGHT!\n");
			  
			  break;
		  case "KeyS":
			  console.log("s/S key: Move BACK!\n");
			  
			  break;
		  case "KeyW":
			  console.log("w/W key: Move FWD!\n");
			  
			  break;
		  //----------------Arrow keys------------------------
		  case "ArrowLeft": 	
			  console.log(' left-arrow.');
			  // and print on webpage in the <div> element with id='Result':
			
			  break;
		  case "ArrowRight":
			  console.log('right-arrow.');
			
			break;
		  case "ArrowUp":		
			  console.log('   up-arrow.');
			
			  break;
		  case "ArrowDown":
			  console.log(' down-arrow.');
			
			break;	
	  default:
		console.log("UNUSED!");
			
		break;
	  }
  }
  
    function myKeyUp(kev) {
  //===============================================================================
  // Called when user releases ANY key on the keyboard; captures scancodes well
  
	  console.log('myKeyUp()--keyCode='+kev.keyCode+' released.');
  }

  function drawResize() {
    //==============================================================================
    // Called when user re-sizes their browser window , because our HTML file
    // contains:  <body onload="main()" onresize="winResize()">

      //Make canvas fill the top 3/4 of our browser window:
      var xtraMargin = 16;    // keep a margin (otherwise, browser adds scroll-bars)
      g_canvasID.width = innerWidth - xtraMargin;
      g_canvasID.height = (innerHeight*0.7) - xtraMargin;
      // IMPORTANT!  Need a fresh drawing in the re-sized viewports.
      drawAll();   // Draw shapes
    }