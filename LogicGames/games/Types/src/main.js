let type = "WebGL"
if(!PIXI.utils.isWebGLSupported()){
    type = "canvas"
}

//Aliases
let Application = PIXI.Application,
    Container = PIXI.Container,
    loader = PIXI.loader,
    resources = PIXI.loader.resources,
    TextureCache = PIXI.utils.TextureCache,
    Sprite = PIXI.Sprite,
    Rectangle = PIXI.Rectangle,
    Graphics = PIXI.Graphics,
    Text = PIXI.Text,
    Point = PIXI.Point;

let currentLevel = 0,
    menuHeight = 80,
    buttonHeight = 50,
    buttonWidth = 100,
    funcsPerLine = 6,
    height = 120,
    width = 160,
    lineThickness = 5,
    paramPad = 15,
    blockPad = 25,
    blocks = [],
    undoActions = [],
    clickDist = 60,
    buttonColour = 0x696969,
    buttonLineColour = 0xb5b5b5,
    evalPanelColour = 0x575555,
    buttonPanelColour = 0x282828,
    backgroundColour = 0x050505,
    lineColour = 0xFFFFFF,
    textStyle = {fontFamily: 'Arial', fontSize : 18, fill: lineColour},
    funcTextStyle = {fontFamily: 'Arial', fontSize :32, fill: lineColour},
    evalTextStyle = {fontFamily: 'Arial', fontSize :28, fill: lineColour},
    entryScreenHeaderStyle = {fontFamily: 'Arial', fontSize :50, fill: lineColour};

// Useful functions
const head = ([x]) => x
const tail = ([_, ...xs]) => xs
const fst = ([x, _]) => x
const snd = ([_, y]) => y

//Create a Pixi Application
let app = new PIXI.Application({ 
    autoResize: true,
    resolution: 2, //devicePixelRatio,
    antialias: true,    // default: flse
    transparent: false, // default: false
    backgroundColor: backgroundColour
    }
);

loader
    .load(displayEntryScreen);

// Listen for window resize events
window.addEventListener('resize', resize);

// Resize function window
function resize() {
	// Resize the renderer
	app.renderer.resize(window.innerWidth, window.innerHeight);
}

resize();

//Add the canvas that Pixi automatically created for you to the HTML document
document.body.appendChild(app.view);

requestAnimationFrame( animate );

function animate() {

    requestAnimationFrame(animate);

    // render the stage
    app.render(app);
}