import {
    Animation,
    AnimationEvent,
    AnimationGroup,
    ArcRotateCamera,
    Axis,
    Color3,
    Color4,
    Curve3,
    DirectionalLight,
    Engine,
    HemisphericLight,
    Light,
    Material,
    Mesh,
    MeshBuilder,
    ParticleSystem,
    PointLight,
    Scene,
    Space,
    StandardMaterial,
    Texture,
    Vector3,
    Vector4,
} from '@babylonjs/core';
import {
    CustomMaterial,
} from '@babylonjs/materials';

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

    private readonly _COIN_DEPTH  = 0.05; // this gets doubled
    private readonly _COIN_RADIUS = 1.5;  // includes _EDGE_WIDTH
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
            this._animationGroupApproach.play();

            engine.runRenderLoop(() => {
                this._scene.render();
            });
        }
    }

    public addCameras (): Coin {
        const camera1 = new ArcRotateCamera('camera1', 1, 1, 3, Vector3.Zero(), this._scene);
        camera1.setPosition(new Vector3(0, -5, 0)); // look down from directly above
        camera1.attachControl(this._canvas, true);

        if (this._debug) {
            // camera1.setPosition(new Vector3(-20, 0, 0)); // view appearCurve
        }

        return this;
    }

    public addLights (): Coin {
        const frontLight = new PointLight('light1', new Vector3(-2, -5, -2), this._scene);
        frontLight.diffuse = RGB_YELLOW;
        // frontLight.specular = BabylonUtils.getRGBComplement(RGBA_YELLOW); // use complementary color for white highlight
        frontLight.intensity = 0.25;

        const backLight = frontLight.clone('light2') as PointLight;
        backLight.position = new Vector3(-2, 5, -2);

        // directional light shines from the point indicated through the origin, in parallel lines from everywhere
        // const sunLight = new DirectionalLight('sunLight', new Vector3(15, 50, 15), this._scene);
        // sunLight.diffuse = RGB_YELLOW;
        // sunLight.intensity = 0.5;
        
        // directional light shines from the point indicated through the origin, in parallel lines from everywhere
        const sunLight = new HemisphericLight('sunLight', new Vector3(0, 0, 10), this._scene);
        sunLight.diffuse = RGB_WHITE;
        sunLight.groundColor = new Color3(0, 0, 0);
        // sunLight.intensity = 0.5;

        if (this._debug) {
            this._utils.addLightSourceShape(frontLight);
            this._utils.addLightSourceShape(backLight);
            this._utils.addLightSourceShape(sunLight);
        }

        return this;
    }

    private _generateCoinFaceMaterial (): Material {
        // const coinFacesMat = new CustomMaterial('coinFaces', this._scene);
        // coinFacesMat.diffuseTexture = new Texture(coinFacesImg, this._scene);
        // coinFacesMat.diffuseTexture.hasAlpha = true;
        // coinFacesMat.useAlphaFromDiffuseTexture = true;
        // coinFacesMat.Fragment_Before_FragColor(`
        //     color = vec4(mix(vec3(1., 1., 0.), color.rgb, color.a), 1.);
        // `);


        const coinImgTex = new Texture(coinFacesImg, this._scene);

        const imageMat = new StandardMaterial('textureMat', this._scene);
        imageMat.diffuseTexture = coinImgTex;
        imageMat.diffuseTexture.hasAlpha = true;

        return imageMat;
    }

    public addCoin (): Coin {
        const cylFaceUV = new Array(3);
        cylFaceUV[0] = new Vector4(.5, 0, 1, 1);
        cylFaceUV[1] = Vector4.Zero();
        cylFaceUV[2] = new Vector4(0, 0, .5, 1);
    
        this._coin = MeshBuilder.CreateCylinder('coin', {
            height: .2,
            diameter: 2,
            tessellation: 48,
            faceUV: cylFaceUV,
        }, this._scene);
        // have coin off-screen at start of render
        this._coin.position = Coin._XYZ_START;
        this._coin.material = this._generateCoinFaceMaterial();
    
        return this;
    }

    public latheCoin (): Coin {
        const lathedCoin = MeshBuilder.CreateLathe('coin', {
            shape: [
                new Vector3(0,                                    0 - this._COIN_DEPTH,                    0),
                new Vector3(this._COIN_RADIUS - this._EDGE_WIDTH, 0 - this._COIN_DEPTH,                    0),
                new Vector3(this._COIN_RADIUS - this._EDGE_WIDTH, 0 - this._COIN_DEPTH - this._EDGE_DEPTH, 0),
                new Vector3(this._COIN_RADIUS,                    0 - this._COIN_DEPTH - this._EDGE_DEPTH, 0),
                new Vector3(this._COIN_RADIUS,                    this._COIN_DEPTH + this._EDGE_DEPTH,     0),
                new Vector3(this._COIN_RADIUS - this._EDGE_WIDTH, this._COIN_DEPTH + this._EDGE_DEPTH,     0),
                new Vector3(this._COIN_RADIUS - this._EDGE_WIDTH, this._COIN_DEPTH,                        0),
                new Vector3(0,                                    this._COIN_DEPTH,                        0),
            ],
        }, this._scene);

        const goldMat = new StandardMaterial('gold', this._scene);
        goldMat.diffuseColor = RGB_YELLOW;
        lathedCoin.material = goldMat;

        const discMat = this._generateCoinFaceMaterial();

        /**
         * Any image added to the lathe will be twisted about it's lathing
         * axis. Instead, slip discs into position to hold the image.
         */
        const discFront = MeshBuilder.CreateDisc(
            'discFront',
            {
                radius: this._COIN_RADIUS - this._EDGE_WIDTH,
                sideOrientation: Mesh.DOUBLESIDE,
                frontUVs: new Vector4(0.5, 0, 1, 1),
                backUVs:  Vector4.Zero(),
            }
        );
        discFront.rotate(Axis.X, -Math.PI/2, Space.LOCAL); // to orient with lathe
        discFront.material = discMat;
        discFront.position = new Vector3(0, 0-this._COIN_DEPTH, 0);

        const discBack = MeshBuilder.CreateDisc(
            'discBack',
            {
                radius: this._COIN_RADIUS - this._EDGE_WIDTH,
                sideOrientation: Mesh.DOUBLESIDE,
                // reverse faces
                backUVs: new Vector4(0, 0, 0.5, 1),
                frontUVs:  Vector4.Zero(),
            }
        );
        discBack.rotate(Axis.X, -Math.PI/2, Space.LOCAL); // to orient with lathe
        discBack.material = discMat;
        discBack.position = new Vector3(0, this._COIN_DEPTH, 0);

        // merge meshes
        this._coin = Mesh.MergeMeshes(
            [
                lathedCoin,
                discFront,
                discBack,
            ],
            true,
            true,
            undefined,
            false,
            true // need multimaterial so lathe doesn't get discMat
        );


        // have coin off-screen at start of render
        this._coin.position = Coin._XYZ_START;

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

        this._animationGroupApproach = new AnimationGroup('coinApproach', this._scene);
        this._animationGroupApproach.addTargetedAnimation(animateCoin, this._coin);
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
        this._particleSystem.emitter = this._particleBox;
        this._particleSystem.isLocal = true;

        const SIZE_EMIT_BOX = 1.75;
        this._particleSystem.minEmitBox = new Vector3(SIZE_EMIT_BOX, 0, -SIZE_EMIT_BOX); // lower left front
        this._particleSystem.maxEmitBox = new Vector3(-SIZE_EMIT_BOX, 0, SIZE_EMIT_BOX); // upper right back

        this._particleSystem.minSize = 0.1;
        this._particleSystem.maxSize = 0.5;

        this._particleSystem.emitRate = 100;
        this._particleSystem.gravity = new Vector3(0, 0, -5); // larger values increase the pull
        this._particleSystem.addVelocityGradient(0, 5);
        this._particleSystem.addVelocityGradient(1.0, .3);

        this._particleSystem.start();

        return this;
    }
}
