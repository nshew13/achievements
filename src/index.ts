import {
    Engine,
    FreeCamera,
    HemisphericLight,
    Mesh,
    Scene,
    Vector3,
    MeshBuilder,
} from "@babylonjs/core";

import {
    GridMaterial
} from "@babylonjs/materials/grid";

// Required side effects to populate the Create methods on the mesh class. Without this, the bundle would be smaller but the createXXX methods from mesh would not be accessible.
import "@babylonjs/core/Meshes/meshBuilder";

// Get the canvas element from the DOM.
const canvas = document.getElementById("renderCanvas") as HTMLCanvasElement;


// Associate a Babylon Engine to it.
const engine = new Engine(canvas);

// Create our first scene.
const scene = new Scene(engine);

// This creates and positions a free camera (non-mesh)
const camera = new FreeCamera("camera1", new Vector3(0, 5, -10), scene);
// This targets the camera to scene origin
camera.setTarget(Vector3.Zero());
// This attaches the camera to the canvas
camera.attachControl(canvas, true);

// // This creates a light, aiming 0,1,0 - to the sky (non-mesh)
// const light = new HemisphericLight("light1", new Vector3(0, 1, 0), scene);
// // Default intensity is 1. Let's dim the light a small amount
// light.intensity = 0.7;

// Create a grid material
const material = new GridMaterial("grid", scene);

// // Our built-in 'sphere' shape. Params: name, subdivs, size, scene
// let sphere = Mesh.CreateSphere("sphere1", 16, 2, scene);
// // Move the sphere upward 1/2 its height
// sphere.position.y = 2;
// // Affect a material
// sphere.material = material;

// // Our built-in 'ground' shape. Params: name, width, depth, subdivs, scene
// let ground = Mesh.CreateGround("ground1", 6, 6, 2, scene);
// // Affect a material
// ground.material = material;

let coinCyl = MeshBuilder.CreateCylinder('coin', {}, scene);

// let coin = MeshBuilder.ExtrudeShape(
//     'achievement-medallion',
//     {
//         shape: [
//             new Vector3(0, 0, 0),
//             new Vector3(1, 0, 0),
//             new Vector3(1, 1, 0),
//             new Vector3(0, 1, 0),
//         ],
//         depth: 2,
//     },
//     scene
//  );

// Render every frame
engine.runRenderLoop(() => {
    scene.render();
});
