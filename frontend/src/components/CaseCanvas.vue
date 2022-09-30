<script setup lang="ts">
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { onMounted, onBeforeMount } from "vue";

let width: number;
let height: number;

window.onresize = () => {
	updateCanvasSize();
};

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
const light = new THREE.DirectionalLight(new THREE.Color(0xffffff));
let weaponCase: THREE.Group;

const loader = new GLTFLoader();
let renderer: THREE.WebGLRenderer;

const loadModelPromise = new Promise<THREE.Group>((resolve, reject) => {
	loader.load(
		"./weapon_case.glb",
		(gltf) => {
			resolve(gltf.scene);
		},
		undefined,
		(err) => {
			reject(err);
		}
	);
});

const speed = 0.01;

onBeforeMount(async () => {
	weaponCase = await loadModelPromise;
	scene.add(weaponCase);
	scene.add(light);
	camera.position.z = 7;
	camera.position.y = 5;
	camera.lookAt(weaponCase.position);
	light.position.set(camera.position.x, camera.position.y, camera.position.z);
	light.lookAt(weaponCase.position);
	scene.background = new THREE.Color("#2d3033");
});

onMounted(async () => {
	await loadModelPromise;
	renderer = new THREE.WebGLRenderer({
		antialias: true,
		canvas: document.getElementById("canvas") as HTMLCanvasElement,
	});
	updateCanvasSize();
	animate();
});

function animate() {
	requestAnimationFrame(animate);
	// updateCanvasSize();
	renderer.render(scene, camera);
	weaponCase.rotation.y += speed;
}

function updateCanvasSize() {
	const canvas = renderer.domElement;
	// console.log(canvas);

	width = canvas.clientWidth;
	height = canvas.clientHeight;

	if (canvas.width !== width || canvas.height !== height) {
		updateRenderer();
		updateCamera();
	}
}

function updateRenderer() {
	renderer.setSize(width, height, false);
	renderer.setPixelRatio(window.devicePixelRatio);
}

function updateCamera() {
	camera.aspect = width / height;
	camera.updateProjectionMatrix();
}
</script>

<template>
	<Canvas id="canvas"></Canvas>
</template>

<style scoped>
#canvas {
	height: 100%;
	width: 100%;
}
</style>
