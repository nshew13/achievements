import {
    Color3,
    Color4,
    DynamicTexture,
    Mesh,
    StandardMaterial,
    float,
    Scene,
    Vector3, CubicEase, EasingFunction, CircleEase, ExponentialEase, Light,
} from '@babylonjs/core';

export class BabylonUtils {
    private _scene: Scene;

    // private static _EASE_OUT_CUBIC: EasingFunction;
    // public static get EASE_OUT_CUBIC () {
    //     return BabylonUtils._EASE_OUT_CUBIC;
    // }

    private static _EASE_OUT_CIRC: EasingFunction;
    public static get EASE_OUT_CIRC () {
        return BabylonUtils._EASE_OUT_CIRC;
    }

    // private static _EASE_OUT_EXPO: EasingFunction;
    // public static get EASE_OUT_EXPO () {
    //     return BabylonUtils._EASE_OUT_EXPO;
    // }

    public constructor (scene: Scene) {
        this._scene = scene;

        // define easings
        // BabylonUtils._EASE_OUT_CUBIC = new CubicEase();
        // BabylonUtils._EASE_OUT_CUBIC.setEasingMode(EasingFunction.EASINGMODE_EASEOUT);
        BabylonUtils._EASE_OUT_CIRC = new CircleEase();
        BabylonUtils._EASE_OUT_CIRC.setEasingMode(EasingFunction.EASINGMODE_EASEOUT);
        // BabylonUtils._EASE_OUT_EXPO = new ExponentialEase();
        // BabylonUtils._EASE_OUT_EXPO.setEasingMode(EasingFunction.EASINGMODE_EASEOUT);
    }

    public static deg2rad (degrees: number): number {
        return degrees * Math.PI/180;
    }

    public static getRGBComplement (color: Color3|Color4): Color3 {
        return new Color3(
            1 - color.r,
            1 - color.g,
            1 - color.b
        );
    }

    public addLightSourceShape (light: Light) {
        switch (light.constructor.name) {
            case 'HemisphericLight':
                console.log('adding shape for', light.name, 'hemispheric light source');
                const lightHemisphere = Mesh.CreateHemisphere('hemisphere', 10, 0.5, this._scene);
                lightHemisphere.position = light.getAbsolutePosition();
                lightHemisphere.material = new StandardMaterial('light', this._scene);
                lightHemisphere.material.emissiveColor = light.diffuse;
                break;
            case 'DirectionalLight':
                // console.log('adding shape for', light.name, 'directional light source');
                // var lightSphere = Mesh.CreateSphere('sphere', 10, 1, this._scene);
                // lightSphere.position = light.position;
                // lightSphere.material = new StandardMaterial('light', this._scene);
                // lightSphere.material.emissiveColor = light.diffuse;
                // break;
            case 'PointLight':
                console.log('adding shape for', light.name, 'point light source');
                const lightSphere = Mesh.CreateSphere('sphere', 10, .5, this._scene);
                lightSphere.position = light.position;
                lightSphere.material = new StandardMaterial('light', this._scene);
                lightSphere.material.emissiveColor = light.diffuse;
                break;
        }
    }

    /**
     * adds rays of length size on each axis
     *
     * Adapted from https://doc.babylonjs.com/snippets/world_axes.
     *
     * X = red, Y = green, Z = blue
     *
     * @param size
     */
    public addWorldAxes (size: number): void {
        const XYZ_X_RAY_END = new Vector3(size, 0, 0);
        const XYZ_Y_RAY_END = new Vector3(0, size, 0);
        const XYZ_Z_RAY_END = new Vector3(0, 0, size);

        Mesh.CreateLines(
            'axisX',
            [
                Vector3.Zero(),
                XYZ_X_RAY_END,
                new Vector3(size * 0.95, 0.05 * size, 0),
                XYZ_X_RAY_END,
                new Vector3(size * 0.95, -0.05 * size, 0),
                XYZ_X_RAY_END,
                new Vector3(size * 0.95, 0, 0.05 * size),
                XYZ_X_RAY_END,
                new Vector3(size * 0.95, 0, -0.05 * size),
            ],
            this._scene
        ).color = new Color3(1, 0, 0);

        this.makeTextPlane('X', 'red', size / 10)
            .position = new Vector3(0.9 * size, -0.05 * size, 0);

        Mesh.CreateLines(
            'axisY',
            [
                Vector3.Zero(),
                XYZ_Y_RAY_END,
                new Vector3( -0.05 * size, size * 0.95, 0),
                XYZ_Y_RAY_END,
                new Vector3( 0.05 * size, size * 0.95, 0),
                XYZ_Y_RAY_END,
                new Vector3( 0, size * 0.95, 0.05 * size),
                XYZ_Y_RAY_END,
                new Vector3( 0, size * 0.95, -0.05 * size),
            ],
            this._scene
        ).color = new Color3(0, 1, 0);

        this.makeTextPlane('Y', 'green', size / 10)
            .position = new Vector3(0, 0.9 * size, -0.05 * size);

        Mesh.CreateLines(
            'axisZ',
            [
                Vector3.Zero(),
                XYZ_Z_RAY_END,
                new Vector3( 0 , -0.05 * size, size * 0.95),
                XYZ_Z_RAY_END,
                new Vector3( 0, 0.05 * size, size * 0.95),
                XYZ_Z_RAY_END,
                new Vector3( 0.05 * size, 0, size * 0.95),
                XYZ_Z_RAY_END,
                new Vector3( -0.05 * size, 0, size * 0.95),
            ],
            this._scene
        ).color = new Color3(0, 0, 1);

        this.makeTextPlane('Z', 'blue', size / 10)
            .position = new Vector3(0, 0.05 * size, 0.9 * size);
    }


    // https://www.babylonjs-playground.com/#Z3W74Y#1
    // function localAxes(size) {
    //     var pilot_local_axisX = BABYLON.Mesh.CreateLines("pilot_local_axisX", [
    //         new BABYLON.Vector3.Zero(), new BABYLON.Vector3(size, 0, 0), new BABYLON.Vector3(size * 0.95, 0.05 * size, 0),
    //         new BABYLON.Vector3(size, 0, 0), new BABYLON.Vector3(size * 0.95, -0.05 * size, 0)
    //     ], scene);
    //     pilot_local_axisX.color = new BABYLON.Color3(1, 0, 0);

    //     pilot_local_axisY = BABYLON.Mesh.CreateLines("pilot_local_axisY", [
    //         new BABYLON.Vector3.Zero(), new BABYLON.Vector3(0, size, 0), new BABYLON.Vector3(-0.05 * size, size * 0.95, 0),
    //         new BABYLON.Vector3(0, size, 0), new BABYLON.Vector3(0.05 * size, size * 0.95, 0)
    //     ], scene);
    //     pilot_local_axisY.color = new BABYLON.Color3(0, 1, 0);

    //     var pilot_local_axisZ = BABYLON.Mesh.CreateLines("pilot_local_axisZ", [
    //         new BABYLON.Vector3.Zero(), new BABYLON.Vector3(0, 0, size), new BABYLON.Vector3(0, -0.05 * size, size * 0.95),
    //         new BABYLON.Vector3(0, 0, size), new BABYLON.Vector3(0, 0.05 * size, size * 0.95)
    //     ], scene);
    //     pilot_local_axisZ.color = new BABYLON.Color3(0, 0, 1);

    //     var local_origin = BABYLON.MeshBuilder.CreateBox("local_origin", { size: 1 }, scene);
    //     local_origin.isVisible = false;

    //     pilot_local_axisX.parent = local_origin;
    //     pilot_local_axisY.parent = local_origin;
    //     pilot_local_axisZ.parent = local_origin;

    //     return local_origin;

    // }

    public makeTextPlane (text: string, color: string, size: float): Mesh {
        const dynamicTexture = new DynamicTexture('DynamicTexture', 50, this._scene, true);
        dynamicTexture.hasAlpha = true;
        dynamicTexture.drawText(text, 5, 40, 'bold 36px Arial', color , 'transparent', true);

        const plane = Mesh.CreatePlane('TextPlane', size, this._scene, true);
        plane.material = new StandardMaterial('TextPlaneMaterial', this._scene);
        plane.material.backFaceCulling = false;
        plane.material.specularColor = new Color3(0, 0, 0);
        plane.material.diffuseTexture = dynamicTexture;

        return plane;
    }
}
