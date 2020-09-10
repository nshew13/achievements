import {
    Animation,
    AnimationEvent,
    ArcRotateCamera,
    Color3,
    Color4,
    Curve3,
    Engine,
    HemisphericLight,
    Mesh,
    MeshBuilder,
    ParticleSystem,
    Scene,
    Texture,
    Vector3,
} from '@babylonjs/core';

import { BabylonUtils } from './babylon-utils';
import sparkImg from './spark-clip-art.png';

const RGBA_YELLOW = new Color4(1, 1, 0, 1);
const RGB_WHITE   = new Color3(1, 1, 1);

export class Coin {
    private static readonly DURATION = 2; // seconds
    private static readonly FRAMES = 20;

    private _animations: Animation[] = [];
    private _coinCyl: Mesh;
    private _debug: boolean;
    private _particleSystem: ParticleSystem;
    private _scene: Scene;

    public execute: Function;

    public constructor (canvasId: string, debug = false) {
        this._initScene(canvasId);
        this._debug = debug;
    }

    private _initScene (canvasId: string) {
        const canvas = document.getElementById('renderCanvas') as HTMLCanvasElement;
        const engine = new Engine(canvas);
        this._scene  = new Scene(engine);
        this._scene.clearColor = new Color4(0.5, 0.5, 0.5, 1); // TODO: particles don't show on white/transparent bg

        if (this._debug) {
            const utils = new BabylonUtils(this._scene);
            utils.addWorldAxes(1.5);
        }

        this.execute = () => {
            console.log('beginning animations', this._animations);
            this._coinCyl.animations = this._animations;
            this._scene.beginAnimation(this._coinCyl, 0, Coin.FRAMES, true, .75);

            this._particleSystem.start();

            console.log('runRenderLoop', engine);
            engine.runRenderLoop(() => {
                this._scene.render();
            });
        }
    }

    public addCameras (): Coin {
        const camera1 = new ArcRotateCamera('camera1', 1, 1, 3, Vector3.Zero(), this._scene);
        camera1.setPosition(new Vector3(0, -4, 0)); // look down from directly above
        // camera1.setPosition(new Vector3(-20, 0, 0)); // view appearCurve
        // camera1.attachControl(canvas, true);

        return this;
    }

    public addLights (): Coin {
        const light1 = new HemisphericLight('hemiLight1', new Vector3(-1, -5, 1), this._scene);
        light1.diffuse = RGB_WHITE;
        // light1.specular = RGB_BLUE; // use complementary color for white highlight
        light1.specular = BabylonUtils.getRGBComplement(RGBA_YELLOW); // use complementary color for white highlight

        // new PointLight("Omni", new Vector3(0, 2, 8), this._scene);

        return this;
    }

// const coinFacesMat = new StandardMaterial('coinFaces', this._scene);
// const coinFacesTexture = new Texture(coinFacesImg, this._scene);
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

    public addCoin (): Coin {
        this._coinCyl = MeshBuilder.CreateCylinder('coin', {
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
        }, this._scene);
        // coinCyl.material = coinFacesMat;

        return this;
    }

    public addCoinMovement (): Coin {
        // create curve for movement of coin up into view
        const appearCurveVectors = Curve3.CreateQuadraticBezier(new Vector3(0, 6, -10), new Vector3(0, 4, 2), Vector3.Zero(), Coin.FRAMES);
        const appearCurvePoints  = appearCurveVectors.getPoints();

        // show curve for debugging
        if (this._debug) {
            Mesh.CreateLines('appearCurve', appearCurvePoints, this._scene).color = new Color3(0, 1, 0.5);
        }

        // use curve vectors to generate animation keyframes
        const keys = [];
        for (let i = 0; i < appearCurvePoints.length; i++) { // length should equal FRAMES
            keys.push({ frame: i, value: appearCurvePoints[i] });
        }

        // create animation from curve keys
        const animation = new Animation('animateCoinMovement', 'position', Coin.FRAMES/Coin.DURATION, Animation.ANIMATIONTYPE_VECTOR3, Animation.ANIMATIONLOOPMODE_CONSTANT);
        animation.setKeys(keys);
        animation.setEasingFunction(BabylonUtils.EASE_OUT_CIRC);

        this._animations.push(animation);

        return this;
    }

    public addCoinSpin (): Coin {
        const keys = [];
        for (let i = 0; i < Coin.FRAMES; i++) {
            keys.push({ frame: i, value: BabylonUtils.deg2rad(180*i) });
        }
        // leave it slightly rotated
        // keys[Coin.FRAMES-1].value -= BabylonUtils.deg2rad(30);

        const animation = new Animation('animateCoinSpin', 'rotation.z', Coin.FRAMES/Coin.DURATION, Animation.ANIMATIONTYPE_FLOAT, Animation.ANIMATIONLOOPMODE_CONSTANT);
        animation.setKeys(keys);
        animation.setEasingFunction(BabylonUtils.EASE_OUT_CIRC);

        this._animations.push(animation);

        return this;
    }

    public addConfetti (): Coin {
        // create explosion particles
        this._particleSystem = new ParticleSystem('confettiParticles', 2000, this._scene);
        this._particleSystem.particleTexture = new Texture(sparkImg, this._scene);
        // this._particleSystem.textureMask = new Color4(0.1, 0.8, 0.8, 1.0);
        const SIZE_EMIT_BOX = 2;
        this._particleSystem.emitter = new Vector3(0, SIZE_EMIT_BOX, 0); // behind coin at end of travel
        // this._particleSystem.emitter = Vector3.Zero();
        this._particleSystem.minEmitBox = new Vector3(SIZE_EMIT_BOX, 0 - SIZE_EMIT_BOX, 0 - SIZE_EMIT_BOX); // lower left front
        this._particleSystem.maxEmitBox = new Vector3(0 - SIZE_EMIT_BOX, SIZE_EMIT_BOX, SIZE_EMIT_BOX); // upper right back

        // this._particleSystem.targetStopDuration = 5000;
        // this._particleSystem.disposeOnStop = true;
        // this._particleSystem.addLifeTimeGradient(0, 0.5, 0.8);
        // this._particleSystem.addLifeTimeGradient(1, 0, 0.1);

        this._particleSystem.minSize = 0.1;
        this._particleSystem.maxSize = 0.75;
        // this._particleSystem.minScaleY = 0.2;
        // this._particleSystem.maxScaleY = 0.4;

        this._particleSystem.addColorGradient(0, new Color4(1, 1, 1, 0), new Color4(1, 0, 1, 0));
        this._particleSystem.addColorGradient(1.0, new Color4(1, 1, 1, 1), new Color4(1, 0, 1, 1));

        this._particleSystem.emitRate = 50;
        // this._particleSystem.direction1 = new Vector3(0, -3, 3);
        // this._particleSystem.direction2 = new Vector3(7, 8, -3);
        this._particleSystem.gravity = new Vector3(0, 0, -9.8); // larger values increase the pull
        this._particleSystem.blendMode = ParticleSystem.BLENDMODE_ADD;

        // particles explode when coin stops moving
        const coinInPositionEvent = new AnimationEvent(
            Coin.FRAMES-1,
            () => {
                console.log('AnimationEvent got here');
                this._particleSystem.start();
            },
            true
        );
        this._animations[0].addEvent(coinInPositionEvent);

        return this;
    }
}