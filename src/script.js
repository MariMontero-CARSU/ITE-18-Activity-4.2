import * as dat from 'lil-gui'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'

/**
 * Base
 */
// Debug
const gui = new dat.GUI()
const debugObject = {}
const rendererFolder = gui.addFolder('Renderer Controls')
const dLightFolder = gui.addFolder('Directional Light')
const modelFolder = gui.addFolder('Model Controls')

// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()


/**
 * Loaders
 */
const gltfLoader = new GLTFLoader()
const cubeTextureLoader = new THREE.CubeTextureLoader()


/**
 * Lights
 */
const dLight = new THREE.DirectionalLight('#ffffff', 3)
dLight.castShadow = true
dLight.position.set(0.25, 3, -2.25)
scene.add(dLight)

dLightFolder.add(dLight, 'intensity')
    .min(0)
    .max(10)
    .step(0.001)
    .name('Intensity')
dLightFolder.add(dLight.position, 'x')
    .min(-5)
    .max(5)
    .step(0.001)
    .name('Position, X')
dLightFolder.add(dLight.position, 'y')
    .min(-5)
    .max(5)
    .step(0.001)
    .name('Position, Y')
dLightFolder.add(dLight.position, 'z')
    .min(-5)
    .max(5)
    .step(0.001)
    .name('Position, Z')

//const dLightCamHelper = new THREE.CameraHelper(dLight.shadow.camera)
//scene.add(dLightCamHelper)
dLight.shadow.camera.far = 15
dLight.shadow.mapSize.set(1024, 1024)
dLight.shadow.normalBias = 0.05


/**
 * Environment Maps
 */
const envMap = cubeTextureLoader.load([
    'textures/environmentMaps/0/px.jpg',
    'textures/environmentMaps/0/nx.jpg',
    'textures/environmentMaps/0/py.jpg',
    'textures/environmentMaps/0/ny.jpg',
    'textures/environmentMaps/0/pz.jpg',
    'textures/environmentMaps/0/nz.jpg'
])
envMap.encoding = THREE.sRGBEncoding
scene.background = envMap


/**
 * Objects
 */
function updateAllMaterials() {
    scene.traverse((child) => {
        // Checks for Meshes and Std Material from our Model
        if (child instanceof THREE.Mesh && 
            child.material instanceof THREE.MeshStandardMaterial) {
                child.material.envMap = envMap
                child.material.envMapIntensity = 2.5
                child.castShadow = true
                child.receiveShadow = true
                //console.log(child)
            }
    })
}


// Test Sphere
const testSphere = new THREE.Mesh(
    new THREE.SphereGeometry(1, 32, 32),
    new THREE.MeshStandardMaterial()
)
//scene.add(testSphere)

// Flight Helmet
gltfLoader.load(
    'models/FlightHelmet/glTF/FlightHelmet.gltf',
    (gltf) => {
        gltf.scene.scale.set(10, 10, 10)
        gltf.scene.position.set(0, -4, 0)
        gltf.scene.rotation.y = Math.PI * 0.5
        scene.add(gltf.scene)
        console.log('Flight Helmet Loaded')
        //console.log(gltf)

        modelFolder.add(gltf.scene.rotation, 'y')
            .min(-Math.PI)
            .max(Math.PI)
            .step(0.001)
            .name('Rotation')

        updateAllMaterials()
    }
)

// Burger Model
// gltfLoader.load(
//     'models/hamburger.glb',
//     (gltf) => {
//         gltf.scene.scale.set(0.3, 0.3, 0.3)
//         gltf.scene.position.set(0, -1, 0)
//         scene.add(gltf.scene)
//         console.log('Burger Loaded')
//         //console.log(gltf)

//         modelFolder.add(gltf.scene.rotation, 'y')
//             .min(-Math.PI)
//             .max(Math.PI)
//             .step(0.001)
//             .name('Rotation')

//         updateAllMaterials()
//     }
// )

debugObject.envMapIntensity = 1
modelFolder.add(debugObject, 'envMapIntensity')
    .min(0)
    .max(10)
    .step(0.001)
    .name("Env Map Intensity")


/**
 * Sizes
 */
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

window.addEventListener('resize', () =>
{
    // Update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    // Update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})


/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100)
camera.position.set(4, 1, - 4)
scene.add(camera)

// Controls
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true


/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: true
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
renderer.physicallyCorrectLights = true
renderer.outputEncoding = THREE.sRGBEncoding
renderer.toneMapping = THREE.ReinhardToneMapping
renderer.toneMappingExposure = 3
renderer.shadowMap.enabled = true
renderer.shadowMap.type = THREE.PCFShadowMap

rendererFolder.add(renderer, 'toneMapping', {
    No: THREE.NoToneMapping,
    Linear: THREE.LinearToneMapping,
    Reinhard: THREE.ReinhardToneMapping,
    Cineon: THREE.CineonToneMapping,
    ACESFilmic: THREE.ACESFilmicToneMapping
}).name("Tone Mapping")
rendererFolder.add(renderer, 'toneMappingExposure')
    .min(0)
    .max(10)
    .step(0.001)
    .name("Tone Map Exposure")


/**
 * Animate
 */
const tick = () =>
{
    // Update controls
    controls.update()

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()