import {
    Color3,
    DynamicTexture,
    Mesh,
    StandardMaterial,
    float,
    Scene,
    Vector3,
} from '@babylonjs/core';

export class BabylonUtils {
    private _scene: Scene;

    public constructor (scene: Scene) {
        this._scene = scene;
    }

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

    // https://doc.babylonjs.com/snippets/world_axes
    public addWorldAxes (size: number): void {
        Mesh.CreateLines(
            'axisX',
            [ 
                Vector3.Zero(),
                new Vector3(size, 0, 0),
                new Vector3(size * 0.95, 0.05 * size, 0), 
                new Vector3(size, 0, 0),
                new Vector3(size * 0.95, -0.05 * size, 0)
            ],
            this._scene
        ).color = new Color3(1, 0, 0);
        
        this.makeTextPlane('X', 'red', size / 10)
            .position = new Vector3(0.9 * size, -0.05 * size, 0);

        Mesh.CreateLines(
            'axisY',
            [
                Vector3.Zero(),
                new Vector3(0, size, 0),
                new Vector3( -0.05 * size, size * 0.95, 0), 
                new Vector3(0, size, 0),
                new Vector3( 0.05 * size, size * 0.95, 0)
            ],
            this._scene
        ).color = new Color3(0, 1, 0);

        this.makeTextPlane('Y', 'green', size / 10)
            .position = new Vector3(0, 0.9 * size, -0.05 * size);

        Mesh.CreateLines(
            'axisZ',
            [
                Vector3.Zero(),
                new Vector3(0, 0, size),
                new Vector3( 0 , -0.05 * size, size * 0.95),
                new Vector3(0, 0, size),
                new Vector3( 0, 0.05 * size, size * 0.95)
            ],
        this._scene
        ).color = new Color3(0, 0, 1);

        this.makeTextPlane('Z', 'blue', size / 10)
            .position = new Vector3(0, 0.05 * size, 0.9 * size);
    }
}
