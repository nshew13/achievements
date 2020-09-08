import {
    Animation,
    ArcRotateCamera,
    Color3,
    Color4,
    Engine,
    HemisphericLight,
    MeshBuilder,
    PointLight,
    Scene,
    SpotLight,
    UniversalCamera,
    Vector3,
    StandardMaterial,
    Texture,
    Vector4,
} from '@babylonjs/core';

import { BabylonUtils } from './babylon-utils';
import './achievements.scss';
import coinFacesImg from './coin.png';

const RGBA_YELLOW = new Color4(1, 1, 0, 1);
const RGBA_GREEN  = new Color4(0, 1, 0, 1);
const RGB_BLUE    = new Color3(0, 0, 1);
const RGB_WHITE   = new Color3(1, 1, 1);
const RGB_RED     = new Color3(1, 0, 0);

const canvas = document.getElementById('renderCanvas') as HTMLCanvasElement;
const engine = new Engine(canvas);
const scene  = new Scene(engine);
scene.clearColor = new Color4(0, 0, 0, 0);

// const utils = new BabylonUtils(scene);
// utils.addWorldAxes(3);

const viewPt = new Vector3(0, -4, 0);

// This creates and positions a free camera (non-mesh)
// const camera1 = new UniversalCamera('camera1', new Vector3(0, 5, -5), scene);
// camera1.setTarget(Vector3.Zero());
const camera2 = new ArcRotateCamera('camera2', 1, 1, 3, Vector3.Zero(), scene);
camera2.setPosition(viewPt);
camera2.attachControl(canvas, true);

const light = new HemisphericLight('HemiLight', viewPt, scene);
light.diffuse = RGB_WHITE;
light.specular = RGB_BLUE; // use complementary color for white highlight

// var alphamodes = [
//     Engine.ALPHA_COMBINE,
//     Engine.ALPHA_ADD,
//     Engine.ALPHA_SUBTRACT,
//     Engine.ALPHA_MULTIPLY,
//     Engine.ALPHA_MAXIMIZED
// ];

// const coinFacesMat = new StandardMaterial('coinFaces', scene);
// const coinFacesTexture = new Texture(coinFacesImg, scene);
// coinFacesMat.diffuseTexture = coinFacesTexture;
// coinFacesMat.diffuseTexture.hasAlpha = true;
// coinFacesMat.wireframe = true;
// coinFacesMat.alphaMode = alphamodes[1];
// coinFacesMat.specularTexture = coinFacesTexture;
// coinFacesMat.specularTexture.hasAlpha = true;
// coinFacesMat.emissiveTexture = coinFacesTexture;
// coinFacesMat.emissiveTexture.hasAlpha = true;
// coinFacesMat.ambientTexture = coinFacesTexture;

const cylFaceUV = new Array(3);
cylFaceUV[0] = new Vector4(0, 0, .5, 1);
cylFaceUV[1] = Vector4.Zero();
cylFaceUV[2] = new Vector4(.5, 0, 1, 1);

const cylFaceCol = new Array(3);
cylFaceCol[0] = RGBA_GREEN;
cylFaceCol[1] = RGBA_YELLOW;

let coinCyl = MeshBuilder.CreateCylinder('coin', {
    height: .2,
    diameter: 2,
    tessellation: 48,
    faceUV: cylFaceUV,
    // faceColors: cylFaceCol,
    faceColors: [
        RGBA_YELLOW, // bottom
        RGBA_YELLOW, // tube
        RGBA_YELLOW, // top
    ],
}, scene);
// coinCyl.material = coinFacesMat;


// spin the coin
const coinSpin = new Animation('myAnimation', 'rotation.z', 1, Animation.ANIMATIONTYPE_FLOAT, Animation.ANIMATIONLOOPMODE_CYCLE);
coinSpin.setKeys([
    { frame: 0, value: 0 },
    { frame: 50, value: 180 },
    { frame: 100, value: 360 },
]);
coinCyl.animations = [ coinSpin ];

// Render every frame
engine.runRenderLoop(() => {
    scene.render();
});

scene.beginAnimation(coinCyl, 0, 100, true, .5);
