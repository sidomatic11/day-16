import * as THREE from "three";
// import typefaceFont from "three/examples/fonts/helvetiker_regular.typeface.json";
import { FontLoader } from "three/examples/jsm/loaders/FontLoader.js";
import { TextGeometry } from "three/examples/jsm/geometries/TextGeometry.js";

const baseUrl = new URL(import.meta.env.BASE_URL, import.meta.url);

/* SECTION - Scene Setup */

/* Canvas */
const canvas = document.querySelector("canvas.webgl");

/* Scene */
const scene = new THREE.Scene();

/* Sizes */
const sizes = {
	width: window.innerWidth,
	height: window.innerHeight,
};

window.addEventListener("resize", () => {
	/* Update sizes */
	sizes.width = window.innerWidth;
	sizes.height = window.innerHeight;

	/* Update camera */
	camera.aspect = sizes.width / sizes.height; // for Perspective camera
	camera.updateProjectionMatrix();

	/* Update renderer */
	renderer.setSize(sizes.width, sizes.height);
	renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

/* window.addEventListener("dblclick", () => {
	if (!document.fullscreenElement) {
		console.log("go full");
		renderer.domElement.requestFullscreen();
	} else {
		console.log("leave full");
		document.exitFullscreen();
	}
}); */

/* ANCHOR Lights */
const ambientLight = new THREE.AmbientLight(0xffffff, 1);
scene.add(ambientLight);
const directionalLight = new THREE.DirectionalLight(0xffffff, 2);
directionalLight.position.set(0, 0, 5);
// scene.add(directionalLight);
const light = new THREE.PointLight(0xffffff, 35, 20);
light.position.set(0, 0, 0);

/* ANCHOR Camera */
const camera = new THREE.PerspectiveCamera(
	75,
	sizes.width / sizes.height,
	0.1,
	100
);
camera.position.x = 0;
camera.position.y = 0;
camera.position.z = 2;
camera.lookAt(0, 0, 0);
scene.add(camera);

camera.add(light);

/* ANCHOR Fog */
const fogColor = new THREE.Color(0x000000); // Black color
const fogNear = 1;
const fogFar = 12;
scene.fog = new THREE.Fog(fogColor, fogNear, fogFar);

/* ANCHOR Renderer */
const renderer = new THREE.WebGLRenderer({
	canvas: canvas,
	// alpha: true,
});
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

/*!SECTION */

/* SECTION - Objects */

// const loadingManager = new THREE.LoadingManager();
// const textureLoader = new THREE.TextureLoader(loadingManager);

// const textureSea = textureLoader.load("images/sea.png");
// textureSea.colorSpace = THREE.SRGBColorSpace;
// textureSea.center.set(0.5, 0.5);

// Create a canvas element
const c = document.createElement("canvas");
const context = c.getContext("2d");

// Set canvas dimensions
c.width = 512;
c.height = 512;

// Draw text on the canvas
context.fillStyle = "lightblue"; // Background color
context.fillRect(0, 0, c.width, c.height);

context.fillStyle = "black"; // Text color
context.font = "50px Arial";
context.fillText("Hello, Three.js!", 50, 200);

// Create texture from the canvas
const texture = new THREE.CanvasTexture(c);

//ANCHOR - Direction Vector
let directionVector = new THREE.Vector3(0, 0, 1);

let allRings = [];
let allPlanes = [];
const ringCount = 10;

const planeDimension = 1.61;
const planeGeometry = new THREE.PlaneGeometry(planeDimension, planeDimension);
const planeMaterial = new THREE.MeshStandardMaterial({
	color: 0xffffff,
	side: THREE.DoubleSide,
});

const planeTextMaterial = new THREE.MeshBasicMaterial({
	map: texture,
	side: THREE.DoubleSide,
});

let radius = 2;
let angle = 0;
let distanceBetweenRings = 1.69;

let lastRingPosition = directionVector.clone();

for (let i = 0; i < ringCount; i++) {
	let planeRing = new THREE.Group();

	for (let j = 0; j < 8; j++) {
		let x = radius * Math.cos(angle);
		let y = radius * Math.sin(angle);
		let z = 0;

		let material = null;

		if (j == 4) {
			material = planeTextMaterial;
		} else {
			material = planeMaterial;
		}

		const plane = new THREE.Mesh(planeGeometry, material);

		plane.position.x = x;
		plane.position.y = y;
		plane.position.z = z;

		plane.lookAt(0, 0, 0);

		planeRing.add(plane);
		allPlanes.push(plane);

		angle += Math.PI / 4;
	}
	planeRing.position.copy(lastRingPosition);
	lastRingPosition.addScaledVector(directionVector, distanceBetweenRings);
	scene.add(planeRing);
	allRings.push(planeRing);
}

/**
 * Fonts
 */
// const fontLoader = new FontLoader();
// const typefaceURL = `${baseUrl.href}fonts/helvetiker_regular.typeface.json`;
// let textMesh = null;
// let loadedFont = null;

// fontLoader.load(typefaceURL, (font) => {
// 	loadedFont = font;
// 	const textGeometry = new TextGeometry("Hello Three.js", {
// 		font: font,
// 		size: 0.1,
// 		depth: 0.02,
// 		curveSegments: 12,
// 	});
// 	const textMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
// 	const text = new THREE.Mesh(textGeometry, textMaterial);
// 	scene.add(text);
// 	textMesh = text;
// });

/*!SECTION */

/* SECTION - Render */
const clock = new THREE.Clock();
let cameraMovementSpeed = 1;

const tick = (t) => {
	const elapsedTime = clock.getElapsedTime();

	/* Render */
	renderer.render(scene, camera);

	/* Call tick again on the next frame */
	window.requestAnimationFrame(tick);
};

function moveScene() {
	camera.position.addScaledVector(directionVector, cameraMovementSpeed);

	if (directionVector.z < 0) {
		if (allRings[0].position.z > camera.position.z) {
			let removedRing = allRings.shift();
			let lastRing = allRings[allRings.length - 1];
			allRings.push(removedRing);
			removedRing.position.copy(lastRing.position);
			removedRing.position.addScaledVector(
				directionVector,
				distanceBetweenRings
			);

			if (removedRing.userData.hasCube) {
				changeCubePosition(removedRing);
			}
		}
	} else {
		if (allRings[allRings.length - 1].position.z < camera.position.z) {
			//when camera goes behind the last ring
			let removedRing = allRings.shift(); //remove the first ring
			let lastRing = allRings[allRings.length - 1]; //get the last ring
			allRings.push(removedRing); //add the removed ring to the end of the array
			removedRing.position.copy(lastRing.position);
			removedRing.position.addScaledVector(
				directionVector,
				distanceBetweenRings
			); //adjust position of the removed ring
		}
	}
}

tick();

/* !SECTION */

/* SECTION WebSocket */
// // Add WebSocket client code
// const socket = new WebSocket("ws://localhost:8080");
// let currentRingIndex = 0;

// /* send reset message to server */
// socket.addEventListener("open", function (event) {
// 	socket.send("reset");
// 	console.log("reset message sent");
// });

// socket.onmessage = (event) => {
// 	const data = JSON.parse(event.data);
// 	console.log("Received data:", data);

// 	/* moveScene();
// 	// Use the received data to update your Three.js scene
// 	if (loadedFont) {
// 		const textGeometry = new TextGeometry(event.data, {
// 			font: loadedFont,
// 			size: 0.1,
// 			depth: 0.02,
// 			curveSegments: 12,
// 		});
// 		const textMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
// 		const text = new THREE.Mesh(textGeometry, textMaterial);
// 		text.rotation.z = -Math.PI / 2; // Rotate 90 degrees around the X-axis
// 		text.position.y = 0.05; // Slightly raise the text above the ring surface
// 		allRings[currentRingIndex].children[2].add(text);
// 		currentRingIndex++;
// 		if (currentRingIndex >= allRings.length) {
// 			currentRingIndex = 0;
// 		}
// 	}

// 	// Create square canvas texture with text from event.data
// 	const textureCanvas = document.createElement("canvas");
// 	const context = textureCanvas.getContext("2d");
// 	const canvasSize = 512; // Square canvas
// 	textureCanvas.width = canvasSize;
// 	textureCanvas.height = canvasSize;

// 	// Set canvas background to transparent
// 	context.fillStyle = "rgba(0, 0, 0, 0)";
// 	context.fillRect(0, 0, canvasSize, canvasSize);

// 	// Set text properties
// 	context.font = "32px Arial";
// 	context.fillStyle = "white";
// 	context.textAlign = "center";
// 	context.textBaseline = "middle";

// 	// Draw text on canvas
// 	context.fillText(event.data, canvasSize / 2, canvasSize / 2);

// 	// Create texture from canvas
// 	const texture = new THREE.CanvasTexture(textureCanvas);

// 	// Add the plane to the current ring
// 	const newMaterial = new THREE.MeshBasicMaterial({
// 		map: texture,
// 		side: THREE.DoubleSide,
// 	});
// 	allRings[currentRingIndex].children[0].material = newMaterial; */

// };
/* !SECTION */
