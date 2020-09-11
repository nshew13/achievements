import {
    Animation,
    AnimationEvent,
    AnimationGroup,
    ArcRotateCamera,
    Color3,
    Color4,
    Curve3,
    DirectionalLight,
    Engine,
    HemisphericLight,
    Light,
    Mesh,
    MeshBuilder,
    ParticleSystem,
    PointLight,
    Scene,
    StandardMaterial,
    Texture,
    Vector3,
    Vector4,
} from '@babylonjs/core';

import { BabylonUtils } from './babylon-utils';
import confettiImg from './flare.png';
import coinFacesImg from './coin.png';

const RGBA_YELLOW = new Color4(1, 1, 0, 1);
const RGBA_GREEN  = new Color4(0, 1, 0, 1);
const RGB_WHITE   = new Color3(1, 1, 1);
const RGB_RED     = new Color3(1, 0, 0);
const RGB_YELLOW  = new Color3(1, 1, 0);
const RGB_BLUE    = new Color3(0, 0, 1);

export class Coin {
    private static readonly _ANIMATE_DURATION = 1.5; // seconds
    private static readonly _ANIMATE_FRAMES = 40;
    private static readonly _ANIMATE_SPEED = .8;

    private static readonly _XYZ_START = new Vector3(0, 6, -10);

    private readonly _COIN_DEPTH  = 0.05;
    private readonly _COIN_RADIUS = 1.5;
    private readonly _EDGE_DEPTH  = 0.15;
    private readonly _EDGE_WIDTH  = 0.25;

    private _animationGroupApproach: AnimationGroup;
    private _canvas: HTMLCanvasElement;
    private _coin: Mesh;
    private _debug: boolean;
    private _particleBox: Mesh; // size of a particle: Particle Box
    private _particleSystem: ParticleSystem;
    private _scene: Scene;
    private _utils: BabylonUtils;

    public execute: Function;

    public constructor (canvasId: string, debug = false) {
        this._debug = debug;
        this._initScene(canvasId);
    }

    private _initScene (canvasId: string) {
        this._canvas = document.getElementById('renderCanvas') as HTMLCanvasElement;
        const engine = new Engine(this._canvas);
        this._scene  = new Scene(engine);
        // particles don't show on white/transparent bg, but do show on black/transparent (weird)
        this._scene.clearColor = new Color4(0, 0, 0, 0);

        if (this._debug) {
            this._utils = new BabylonUtils(this._scene);
            this._utils.addWorldAxes(2);

            this._canvas.focus();
        }

        this.execute = () => {
            this._scene.beginAnimation(this._coin, 0, Coin._ANIMATE_FRAMES, true, Coin._ANIMATE_SPEED);
            // this._scene.beginAnimation(this._particleBox, 0, Coin._ANIMATE_FRAMES, true, Coin._ANIMATE_SPEED);
            this._animationGroupApproach.play();

            engine.runRenderLoop(() => {
                this._scene.render();
            });
        }
    }

    public addCameras (): Coin {
        const camera1 = new ArcRotateCamera('camera1', 1, 1, 3, Vector3.Zero(), this._scene);
        camera1.setPosition(new Vector3(0, -5, 0)); // look down from directly above

        if (this._debug) {
            // camera1.setPosition(new Vector3(-20, 0, 0)); // view appearCurve
            camera1.attachControl(this._canvas, true);
        }

        return this;
    }

    public addLights (): Coin {
        const light1 = new HemisphericLight('hemiLight1', new Vector3(-5, -5, 5), this._scene);
        light1.diffuse = RGB_YELLOW;
        light1.specular = BabylonUtils.getRGBComplement(RGBA_YELLOW); // use complementary color for white highlight

        if (this._debug) {
            this._utils.addLightSourceShape(light1);
        }

        return this;
    }

    // public addCoin (): Coin {
    //     const coinFacesMat = new StandardMaterial('coinFaces', this._scene);
    //     const tex = new Texture(coinFacesImg, this._scene);
    //     tex.hasAlpha = true;
    //     coinFacesMat.ambientTexture = tex;
    //
    //     const cylFaceUV = new Array(3);
    //     cylFaceUV[0] = new Vector4(0, 0, .5, 1);
    //     cylFaceUV[1] = Vector4.Zero();
    //     cylFaceUV[2] = new Vector4(.5, 0, 1, 1);
    //
    //     this._coin = MeshBuilder.CreateCylinder('coin', {
    //         height: .2,
    //         diameter: 2,
    //         tessellation: 48,
    //         faceUV: cylFaceUV,
    //         faceColors: [
    //             RGBA_YELLOW, // bottom
    //             RGBA_YELLOW, // tube
    //             RGBA_YELLOW, // top
    //         ],
    //         // sideOrientation: Mesh.DOUBLESIDE,
    //         // frontUVs: new Vector4(0, 0, .5, 1),
    //         // backUVs: new Vector4(0, 0, .5, 1),
    //     }, this._scene);
    //     // have coin off-screen at start of render
    //     this._coin.position = Coin._XYZ_START;
    //     this._coin.material = coinFacesMat;
    //
    //     // create coin edge
    //     // const coinEdge = MeshBuilder.CreateTube('coinEdge', {path: this._coin.}, this._scene);
    //
    //
    //
    //     return this;
    // }

    public latheCoin (): Coin {
        this._coin = MeshBuilder.CreateLathe('coin', {
            shape: [
                new Vector3(0, -0.5 * this._COIN_DEPTH, 0),
                new Vector3(this._COIN_RADIUS - this._EDGE_WIDTH, -0.5 * this._COIN_DEPTH, 0),
                new Vector3(this._COIN_RADIUS - this._EDGE_WIDTH, 0 - this._COIN_DEPTH - this._EDGE_DEPTH, 0),
                new Vector3(this._COIN_RADIUS, 0 - this._COIN_DEPTH - this._EDGE_DEPTH, 0),
                new Vector3(this._COIN_RADIUS, this._COIN_DEPTH + this._EDGE_DEPTH, 0),
                new Vector3(this._COIN_RADIUS - this._EDGE_WIDTH, this._COIN_DEPTH + this._EDGE_DEPTH, 0),
                new Vector3(0, this._COIN_DEPTH + this._EDGE_DEPTH, 0),
            ],
        }, this._scene);
        // have coin off-screen at start of render
        this._coin.position = Coin._XYZ_START;

        const coinFacesMat = new StandardMaterial('coinFaces', this._scene);
        coinFacesMat.ambientColor = new Color3(1, 1, 0);
        this._coin.material = coinFacesMat;

        return this;
    }

    public animateMovement (): Coin {
        // create curve for movement of coin up into view
        const appearCurveVectors = Curve3.CreateQuadraticBezier(Coin._XYZ_START, new Vector3(0, 4, 2), Vector3.Zero(), Coin._ANIMATE_FRAMES);
        const appearCurvePoints  = appearCurveVectors.getPoints();

        // show curve for debugging
        if (this._debug) {
            Mesh.CreateLines('appearCurve', appearCurvePoints, this._scene).color = new Color3(0, 1, 0.5);
        }

        // use curve vectors to generate animation keyframes
        const keys = [];
        for (let i = 0; i < appearCurvePoints.length; i++) { // length should equal _ANIMATE_FRAMES
            keys.push({ frame: i, value: appearCurvePoints[i] });
        }

        // create animation for coin approach
        const animateCoin = new Animation('animateCoinApproach', 'position', Coin._ANIMATE_FRAMES/Coin._ANIMATE_DURATION, Animation.ANIMATIONTYPE_VECTOR3, Animation.ANIMATIONLOOPMODE_CONSTANT);
        animateCoin.setKeys(keys);
        animateCoin.setEasingFunction(BabylonUtils.EASE_OUT_CIRC);

        // add event for end of movement
        const coinInPositionEvent = new AnimationEvent(
            Coin._ANIMATE_FRAMES-1,
            () => {
                console.log('AnimationEvent got here');
                this._particleSystem.start();
            },
            true
        );
        const animationWithEvent = animateCoin.clone();
        animationWithEvent.addEvent(coinInPositionEvent);

        // if (Array.isArray(this._particleBox.animations)) {
        //     this._particleBox.animations.push(animateCoin);
        // }
        //
        // if (Array.isArray(this._coin.animations)) {
        //     this._coin.animations.push(animationWithEvent);
        // }

        this._animationGroupApproach = new AnimationGroup('coinApproach', this._scene);
        this._animationGroupApproach.addTargetedAnimation(animationWithEvent, this._coin);
        this._animationGroupApproach.addTargetedAnimation(animateCoin, this._particleBox);
        this._animationGroupApproach.normalize(0, Coin._ANIMATE_FRAMES);
        this._animationGroupApproach.speedRatio = Coin._ANIMATE_SPEED;

        return this;
    }

    public animateSpin (): Coin {
        const keys = [];
        /*
         * An even number of _ANIMATE_FRAMES*180 leaves the element's back to the camera.
         * Add one more so the "front" is in front.
         */
        for (let i = 0; i <= Coin._ANIMATE_FRAMES; i++) {
            keys.push({ frame: i, value: BabylonUtils.deg2rad(180*i) });
        }
        // leave it slightly rotated
        // keys[Coin._ANIMATE_FRAMES].value -= BabylonUtils.deg2rad(45);

        const animation = new Animation('animateCoinSpin', 'rotation.z', Coin._ANIMATE_FRAMES/Coin._ANIMATE_DURATION, Animation.ANIMATIONTYPE_FLOAT, Animation.ANIMATIONLOOPMODE_CONSTANT);
        animation.setKeys(keys);
        animation.setEasingFunction(BabylonUtils.EASE_OUT_CIRC);

        if (Array.isArray(this._coin.animations)) {
            this._coin.animations.push(animation);
        }

        return this;
    }

    public addParticles (): Coin {
        // create spark particles
        this._particleSystem = new ParticleSystem('sparkticles', 2000, this._scene);
        this._particleSystem.particleTexture = new Texture(confettiImg, this._scene);

        // create box to emit particles
        this._particleBox = Mesh.CreateBox('particleSource', 0.01, this._scene);
        this._particleBox.position = Coin._XYZ_START;
        this._particleSystem.emitter = this._particleBox;
        this._particleSystem.isLocal = true;

        const SIZE_EMIT_BOX = 1.75;
        this._particleSystem.minEmitBox = new Vector3(SIZE_EMIT_BOX, 1, 0 - SIZE_EMIT_BOX); // lower left front
        this._particleSystem.maxEmitBox = new Vector3(0 - SIZE_EMIT_BOX, 1, SIZE_EMIT_BOX); // upper right back

        this._particleSystem.minSize = 0.1;
        this._particleSystem.maxSize = 0.5;

        this._particleSystem.emitRate = 100;
        this._particleSystem.direction1 = new Vector3(0, -1, 1);
        this._particleSystem.gravity = new Vector3(0, 0, -5); // larger values increase the pull
        this._particleSystem.addVelocityGradient(0, 5);
        this._particleSystem.addVelocityGradient(1.0, .3);

        // this._particleSystem.start();

        return this;
    }
}
