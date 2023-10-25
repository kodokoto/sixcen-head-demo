import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

// globals
let mouse, target, model, renderer, scene, camera;

function init() {

    // set up mouse stuff
    target = new THREE.Vector3(0, 0, 3);
    mouse = new THREE.Vector2();

    // set up scene icluding camera and renderer
    scene = new THREE.Scene();
    scene.background = new THREE.Color('gray');

    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 0, 4);
    camera.lookAt(0, 0, 0);

    renderer = new THREE.WebGLRenderer({ alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);

    const container = document.getElementById('scene-container');
    container.appendChild(renderer.domElement);

    // make it a bit brighter
    const light = new THREE.DirectionalLight(0xffffff, 5);
    light.position.set(0, 0, 3);
    scene.add(light);

    // get the video
    const video = document.getElementById('video');
    const videoTexture = new THREE.VideoTexture(video);
    videoTexture.minFilter = THREE.LinearFilter;
    videoTexture.magFilter = THREE.LinearFilter;

    // make the material from the video
    const material = new THREE.MeshBasicMaterial({ map: videoTexture });
    material.side = THREE.BackSide;
    material.transparent = true;
    material.map.flipY = false;

    // load the model
    const loader = new GLTFLoader();
    loader.load('/sixcen_head_3.glb', (gltf) => {
        // onload
        model = gltf.scene;
        model.position.set(0, -2, 0);
        model.traverse(
            (o) => {
                if (o.name == "sixcen_png_face") {
                    o.material = material;
                }
            }
        )
        scene.add(model);

        const mixer = new THREE.AnimationMixer(model);
        gltf.animations.forEach((clip) => {
            mixer.clipAction(clip).play();
        });
    });
}

const render = () => {
    requestAnimationFrame(render);
    renderer.render(scene, camera);
};

const update = () => {
    requestAnimationFrame(update);
    // basic lerping
    target.x += (mouse.x - target.x) * 0.02;
    target.y += (mouse.y - target.y) * 0.02;
    if (model) {
        model.lookAt(target);
    }
}

window.addEventListener('mousemove', function(e) {
    mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(e.clientY / window.innerHeight) * 2 - 1;
});

init();
render();
update();