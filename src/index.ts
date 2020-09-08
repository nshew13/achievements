import {
    Animation,
    ArcRotateCamera,
    Color3,
    Color4, CubicEase,
    Curve3,
    Engine,
    HemisphericLight,
    MeshBuilder,
    Scene,
    Vector3,
    EasingFunction,
} from '@babylonjs/core';

import { BabylonUtils } from './babylon-utils';
import './achievements.scss';
// import coinFacesImg from './coin.png';

const RGBA_YELLOW = new Color4(1, 1, 0, 1);
const RGB_BLUE    = new Color3(0, 0, 1);
const RGB_WHITE   = new Color3(1, 1, 1);
const FRAMES = 20;

const canvas = document.getElementById('renderCanvas') as HTMLCanvasElement;
const engine = new Engine(canvas);
const scene  = new Scene(engine);
scene.clearColor = new Color4(0, 0, 0, 0);

// const utils = new BabylonUtils(scene);
// utils.addWorldAxes(1.5);

const camera1 = new ArcRotateCamera('camera1', 1, 1, 3, Vector3.Zero(), scene);
camera1.setPosition(new Vector3(0, -4, 0)); // look down from directly above
// camera1.setPosition(new Vector3(-20, 0, 0)); // view appearCurve
// camera1.attachControl(canvas, true);

const light1 = new HemisphericLight('hemiLight1', new Vector3(-1, -5, 1), scene);
light1.diffuse = RGB_WHITE;
light1.specular = RGB_BLUE; // use complementary color for white highlight

// const coinFacesMat = new StandardMaterial('coinFaces', scene);
// const coinFacesTexture = new Texture(coinFacesImg, scene);
// coinFacesMat.diffuseTexture = coinFacesTexture;
// coinFacesMat.diffuseTexture.hasAlpha = true;
//
// const cylFaceUV = new Array(3);
// cylFaceUV[0] = new Vector4(0, 0, .5, 1);
// cylFaceUV[1] = Vector4.Zero();
// cylFaceUV[2] = new Vector4(.5, 0, 1, 1);
//
// const cylFaceCol = new Array(3);
// cylFaceCol[0] = RGBA_GREEN;
// cylFaceCol[1] = RGBA_YELLOW;

let coinCyl = MeshBuilder.CreateCylinder('coin', {
    height: .2,
    diameter: 2,
    tessellation: 48,
    // faceUV: cylFaceUV,
    // faceColors: cylFaceCol,
    faceColors: [
        RGBA_YELLOW, // bottom
        RGBA_YELLOW, // tube
        RGBA_YELLOW, // top
    ],
}, scene);
// coinCyl.material = coinFacesMat;

// create curve for movement of coin up into view
const appearCurveVectors = Curve3.CreateQuadraticBezier(new Vector3(0, 6, -10), new Vector3(0, 4, 0), Vector3.Zero(), FRAMES);
const appearCurvePoints  = appearCurveVectors.getPoints();
// show curve for debugging
// Mesh.CreateLines('appearCurve', appearCurvePoints, scene).color = new Color3(0, 1, 0.5);

// use curve vectors to generate animation keyframes
const appearCurveKeys = [];
for (let i = 0; i < appearCurvePoints.length; i++) { // length should equal FRAMES
    appearCurveKeys.push({ frame: i, value: appearCurvePoints[i] });
}
// create animation from curve keys
// 10 fps * 20 frames = 2s
const animationCoinAppear = new Animation('animPos', 'position', 10, Animation.ANIMATIONTYPE_VECTOR3, Animation.ANIMATIONLOOPMODE_CONSTANT);
animationCoinAppear.setKeys(appearCurveKeys);
// add easing
const easingOutCubic = new CubicEase();
easingOutCubic.setEasingMode(EasingFunction.EASINGMODE_EASEOUT);
animationCoinAppear.setEasingFunction(easingOutCubic);

// spin the coin
// 4 fps * 20 frames = 4s
const animationCoinSpin = new Animation('myAnimation', 'rotation.z', 4, Animation.ANIMATIONTYPE_FLOAT, Animation.ANIMATIONLOOPMODE_CONSTANT);
animationCoinSpin.setKeys([
    { frame: 0, value: 0 },
    { frame: 1, value: 180 },
    { frame: FRAMES, value: 0 },
]);
// add easing
animationCoinSpin.setEasingFunction(easingOutCubic);


coinCyl.animations = [ animationCoinAppear, animationCoinSpin ];

scene.beginAnimation(coinCyl, 0, FRAMES, true, 1);

// Render every frame
engine.runRenderLoop(() => {
    scene.render();
});

