import {
    Animation,
    AnimationEvent,
    ArcRotateCamera,
    Color3,
    Color4,
    Curve3,
    Engine,
    DirectionalLight,
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
    Vector4, AnimationGroup,
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
    private static readonly DURATION = 2; // seconds
    private static readonly FRAMES = 20;
    private static readonly XYZ_START = new Vector3(0, 6, -10);

    private readonly _COIN_RADIUS = 1.5;
    private readonly _COIN_DEPTH  = 0.05;
    private readonly _EDGE_WIDTH  = 0.25;
    private readonly _EDGE_DEPTH  = 0.15;

    private _animations: Animation[] = [];
    private _animationGroupApproach: AnimationGroup;
    private _approachPathAnimationKeys: Array<{ frame: number, value: Vector3 }> = [];
    private _canvas: HTMLCanvasElement;
    private _coin: Mesh;
    private _debug: boolean;
    private _particleBox: Mesh; // size of a particle: Particle Box
    private _particleSystem: ParticleSystem;
    private _scene: Scene;

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
            const utils = new BabylonUtils(this._scene);
            utils.addWorldAxes(2);

            this._canvas.focus();
        }

        this.execute = () => {
            this._scene.beginAnimation(this._coin, 0, Coin.FRAMES, true, .75);
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

        // const light2 = new PointLight('pointLight1', new Vector3(.5,-1,.5), this._scene);
        // light2.diffuse = RGB_RED;
        // light2.specular = BabylonUtils.getRGBComplement(RGBA_YELLOW); // use complementary color for white highlight
        // light2.lightmapMode = Light.LIGHTMAP_SHADOWSONLY;

        // sphere to indicate light source
        if (this._debug) {
            BabylonUtils.addLightSourceShape(light1);
        }

        return this;
    }

    public addCoin (): Coin {
        const coinFacesMat = new StandardMaterial('coinFaces', this._scene);
        const tex = new Texture(coinFacesImg, this._scene);
        tex.hasAlpha = true;
        coinFacesMat.ambientTexture = tex;

        const cylFaceUV = new Array(3);
        cylFaceUV[0] = new Vector4(0, 0, .5, 1);
        cylFaceUV[1] = Vector4.Zero();
        cylFaceUV[2] = new Vector4(.5, 0, 1, 1);

        this._coin = MeshBuilder.CreateCylinder('coin', {
            height: .2,
            diameter: 2,
            tessellation: 48,
            faceUV: cylFaceUV,
            faceColors: [
                RGBA_YELLOW, // bottom
                RGBA_YELLOW, // tube
                RGBA_YELLOW, // top
            ],
            // sideOrientation: Mesh.DOUBLESIDE,
            // frontUVs: new Vector4(0, 0, .5, 1),
            // backUVs: new Vector4(0, 0, .5, 1),
        }, this._scene);
        // have coin off-screen at start of render
        this._coin.position = Coin.XYZ_START;
        this._coin.material = coinFacesMat;

        // create coin edge
        // const coinEdge = MeshBuilder.CreateTube('coinEdge', {path: this._coin.}, this._scene);



        return this;
    }

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
        this._coin.position = Coin.XYZ_START;

        const coinFacesMat = new StandardMaterial('coinFaces', this._scene);
        coinFacesMat.ambientColor = new Color3(1, 1, 0);
        this._coin.material = coinFacesMat;

        return this;
    }

    private _generateApproachPath (): Coin {
        // create curve for movement of coin up into view
        const appearCurveVectors = Curve3.CreateQuadraticBezier(Coin.XYZ_START, new Vector3(0, 4, 2), Vector3.Zero(), Coin.FRAMES);
        const appearCurvePoints  = appearCurveVectors.getPoints();

        // show curve for debugging
        if (this._debug) {
            Mesh.CreateLines('appearCurve', appearCurvePoints, this._scene).color = new Color3(0, 1, 0.5);
        }

        // use curve vectors to generate animation keyframes
        this._approachPathAnimationKeys = [];
        for (let i = 0; i < appearCurvePoints.length; i++) { // length should equal FRAMES
            this._approachPathAnimationKeys.push({ frame: i, value: appearCurvePoints[i] });
        }

        return this;
    }

    public addCoinMovement (): Coin {
        if (!this._approachPathAnimationKeys.length) {
            this._generateApproachPath();
        }

        // create animation for coin approach
        const animateCoin = new Animation('animateCoinMovement', 'position', Coin.FRAMES/Coin.DURATION, Animation.ANIMATIONTYPE_VECTOR3, Animation.ANIMATIONLOOPMODE_CONSTANT);
        animateCoin.setKeys(this._approachPathAnimationKeys);
        animateCoin.setEasingFunction(BabylonUtils.EASE_OUT_CIRC);

        // if (Array.isArray(this._coin.animations)) {
        //     this._coin.animations.push(animateCoin);
        // }

        // if (Array.isArray(this._particleBox.animations)) {
        //     this._particleBox.animations.push(animateCoin);
        // }

        this._animationGroupApproach = new AnimationGroup('coinApproach');
        this._animationGroupApproach.addTargetedAnimation(animateCoin, this._coin);
        this._animationGroupApproach.addTargetedAnimation(animateCoin, this._particleBox);
        this._animationGroupApproach.normalize(0, Coin.FRAMES);

        return this;
    }

    public addCoinSpin (): Coin {
        const keys = [];
        /*
         * An even number of FRAMES*180 leaves the element's back to the camera.
         * Add one more so the "front" is in front.
         */
        for (let i = 0; i <= Coin.FRAMES; i++) {
            keys.push({ frame: i, value: BabylonUtils.deg2rad(180*i) });
        }
        // leave it slightly rotated
        // keys[Coin.FRAMES].value -= BabylonUtils.deg2rad(45);

        const animation = new Animation('animateCoinSpin', 'rotation.z', Coin.FRAMES/Coin.DURATION, Animation.ANIMATIONTYPE_FLOAT, Animation.ANIMATIONLOOPMODE_CONSTANT);
        animation.setKeys(keys);
        animation.setEasingFunction(BabylonUtils.EASE_OUT_CIRC);

        if (Array.isArray(this._coin.animations)) {
            this._coin.animations.push(animation);
        }

        return this;
    }

    public addParticles (): Coin {
        // create explosion particles
        this._particleSystem = new ParticleSystem('sparkticles', 2000, this._scene);
        this._particleSystem.particleTexture = new Texture(confettiImg, this._scene);
        // this._particleSystem.textureMask = new Color4(0.1, 0.8, 0.8, 1.0);

        // create box to emit particles
        // this._particleBox = Mesh.CreateDisc('particleSource', this._COIN_RADIUS, 10, this._scene);
        this._particleBox = Mesh.CreateBox('particleSource', 0.01, this._scene);
        this._particleBox.position = Coin.XYZ_START;
        this._particleSystem.emitter = this._particleBox;

        const SIZE_EMIT_BOX = 2;
        // this._particleSystem.emitter = new Vector3(0, SIZE_EMIT_BOX, 0); // behind coin at end of travel
        this._particleSystem.isLocal = true;

        this._particleSystem.minEmitBox = new Vector3(SIZE_EMIT_BOX, 1, 0 - SIZE_EMIT_BOX); // lower left front
        this._particleSystem.maxEmitBox = new Vector3(0 - SIZE_EMIT_BOX, 1, SIZE_EMIT_BOX); // upper right back

        // this._particleSystem.targetStopDuration = 5000;
        // this._particleSystem.disposeOnStop = true;
        // this._particleSystem.addLifeTimeGradient(0, 0.5, 0.8);
        // this._particleSystem.addLifeTimeGradient(1, 0, 0.1);

        this._particleSystem.minSize = 0.1;
        this._particleSystem.maxSize = 0.5;
        // this._particleSystem.minScaleY = 0.2;
        // this._particleSystem.maxScaleY = 0.4;

        this._particleSystem.addColorGradient(0, new Color4(0.2, 0.2, 0, 0), new Color4(0.8, 0.8, 0, 0));
        this._particleSystem.addColorGradient(1.0, new Color4(0.8, 0.8, 0, 1), new Color4(1, 1, 0, 1));
        // this._particleSystem.blendMode = ParticleSystem.BLENDMODE_ADD;

        this._particleSystem.emitRate = 100;
        this._particleSystem.direction1 = new Vector3(0, -1, 0);
        // this._particleSystem.direction1 = new Vector3(-1, 0, -1);
        // this._particleSystem.direction2 = new Vector3(1, 0, 1);
        this._particleSystem.gravity = new Vector3(0, 0, -9.8); // larger values increase the pull
        this._particleSystem.addVelocityGradient(0, 5);
        this._particleSystem.addVelocityGradient(1.0, .3);
        // this._particleSystem.addDragGradient(0, 0.5);
        // this._particleSystem.addDragGradient(1.0, 3);


        // Angular speed, in radians
        // this._particleSystem.minAngularSpeed = 0;
        // this._particleSystem.maxAngularSpeed = Math.PI;

        // Speed
        // this._particleSystem.minEmitPower = 5;
        // this._particleSystem.maxEmitPower = 10;
        // this._particleSystem.updateSpeed = 0.005;

        this._particleSystem.start();

        // particles explode when coin stops moving
        const coinInPositionEvent = new AnimationEvent(
            Coin.FRAMES-1,
            () => {
                console.log('AnimationEvent got here');
                this._particleSystem.start();
            },
            true
        );
        // scene.getAnimationGroupByName("Pistol")
        // this._coin.animations[0].addEvent(coinInPositionEvent);

        return this;
    }
}
