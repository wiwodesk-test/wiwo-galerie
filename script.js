// 3D Art Gallery - Fixed Navigation and Cover Placement

const CONFIG = {
    moveSpeed: 0.07, // Reduced from 0.10
    rotSpeed: 0.02,
    wallHeight: 5,
    wallThickness: 0.5,
    roomSize: 20,
    collisionRadius: 1.3, // Standard "Personal Space" radius
    stairRadius: 0.3, // Very tight radius for smooth stair navigation
    eyeHeight: 1.7,
    totalCovers: 100,
    interactionDist: 3.0,
    lightsOn: true
};


const state = {
    viewedCovers: new Set(),
    keys: { ArrowUp: false, ArrowDown: false, ArrowLeft: false, ArrowRight: false, KeyW: false, KeyS: false, KeyA: false, KeyD: false },
    walls: [],
    obstacles: [],
    covers: [],
    interactables: [],
    isOverlayOpen: false,
    textureLoader: new THREE.TextureLoader(),
    loadingManager: new THREE.LoadingManager(),
    texturesLoaded: 0,
    totalTextures: 0,
    galleryReady: false,
    isVideoPlaying: false,
    isVideoPaused: false,
    css3DObject: null,
    joystick: { x: 0, y: 0 }
};

// Setup loading manager callbacks
state.loadingManager.onStart = function (url, itemsLoaded, itemsTotal) {
    state.totalTextures = itemsTotal;
};

state.loadingManager.onLoad = function () {
    state.galleryReady = true;
    hideLoadingScreen();
};

state.loadingManager.onProgress = function (url, itemsLoaded, itemsTotal) {
    state.texturesLoaded = itemsLoaded;
    console.log('Loading: ' + itemsLoaded + '/' + itemsTotal);
};

// Use loading manager for texture loader
state.textureLoader = new THREE.TextureLoader(state.loadingManager);

function hideLoadingScreen() {
    const loadingScreen = document.getElementById('loading-screen');
    if (loadingScreen) {
        loadingScreen.classList.add('hidden');
    }
}


let scene, camera, renderer, cssScene, cssRenderer;
// Spawn player at (5, 6) facing South (towards central pillar) to see gallery and avoid bench
let player = { x: 5, y: 0, z: 6, rot: Math.PI };

function getGroundHeight(x, z) {
    // Stairs in Room 2 (NE)
    // Location: x: 24-27, z: 5-15.
    // Orientation: Up is North (towards z=5).
    // Bottom: z=15 (y=0). Top: z=5 (y=5).
    if (x >= 24 && x <= 27 && z >= 5 && z <= 15) {
        const h = (15 - z) * 0.5;
        return Math.max(0, Math.min(5.02, h));
    }

    // Second Floor Area (Room 1 & 2)
    // Bounds: x: -10 to 30, z: 0 to 20.
    // If player is already high enough, snap to 2nd floor.
    // We use a hysteresis or check previous Y to decide.
    // Here we assume if you are above 4.0, you are on the 2nd floor.
    if (player.y >= 4.0 && x >= -10 && x <= 30 && z >= 0 && z <= 20) {
        return 5.02; // Slightly above 5.0 to avoid collision with ground floor wall tops
    }
    return 0;
}

function init() {
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x87ceeb); // Sky blue background
    scene.fog = new THREE.Fog(0xb0d4f1, 10, 100); // Light blue fog for spring day

    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

    renderer = new THREE.WebGLRenderer({
        antialias: true,
        powerPreference: "high-performance",
        stencil: false
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); // Cap at 2x for performance
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;  // Soft, realistic shadows
    renderer.outputEncoding = THREE.sRGBEncoding;
    renderer.toneMapping = THREE.ACESFilmicToneMapping; // Hollywood-grade color
    renderer.toneMappingExposure = 1.2;                 // Bright museum lighting
    renderer.physicallyCorrectLights = true;            // Realistic light falloff
    document.getElementById('canvas-container').appendChild(renderer.domElement);

    // CSS3D Renderer for YouTube video
    cssScene = new THREE.Scene();
    cssRenderer = new THREE.CSS3DRenderer();
    cssRenderer.setSize(window.innerWidth, window.innerHeight);
    cssRenderer.domElement.style.position = 'absolute';
    cssRenderer.domElement.style.top = '0';
    cssRenderer.domElement.style.pointerEvents = 'none';
    document.getElementById('canvas-container').appendChild(cssRenderer.domElement);

    setupLighting();
    createSkybox();
    buildGallery();
    createLightSwitch();

    window.addEventListener('resize', onWindowResize, false);

    document.body.addEventListener('click', () => {
        if (!state.isOverlayOpen) document.body.requestPointerLock();
    });

    document.addEventListener('keydown', (e) => {
        // Prevent default scrolling for arrow keys
        if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.code)) {
            e.preventDefault();
        }
        onKeyDown(e);
    });
    document.addEventListener('keyup', (e) => {
        if (state.keys.hasOwnProperty(e.code)) state.keys[e.code] = false;
    });
    document.getElementById('close-btn').addEventListener('click', (e) => {
        e.stopPropagation(); // Prevent click from propagating to body
        closeOverlay();
    });

    // Mobile Controls - Single Joystick for 4-directional movement
    const joystickStick = document.getElementById('joystick-stick');
    const joystickZone = document.getElementById('joystick-zone');

    const maxDist = 40;
    const deadZoneY = 0.3; // Deadzone for forward/backward
    const deadZoneX = 0.6; // Higher deadzone for left/right (less sensitive)

    function handleJoystick(zone, stick, callback) {
        let startX = 0, startY = 0;

        zone.addEventListener('touchstart', (e) => {
            e.preventDefault();
            const touch = e.changedTouches[0];
            const rect = zone.getBoundingClientRect();
            startX = rect.left + rect.width / 2;
            startY = rect.top + rect.height / 2;

            // Close overlay if open when joystick is touched
            if (state.isOverlayOpen) {
                closeOverlay();
            }
        });

        zone.addEventListener('touchmove', (e) => {
            e.preventDefault();
            const touch = e.changedTouches[0];
            let dx = touch.pageX - startX;
            let dy = touch.pageY - startY;

            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist > maxDist) {
                const ratio = maxDist / dist;
                dx *= ratio;
                dy *= ratio;
            }

            stick.style.transform = `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px))`;

            // Normalize output -1 to 1
            callback(dx / maxDist, dy / maxDist);
        });

        const reset = (e) => {
            e.preventDefault();
            stick.style.transform = `translate(-50%, -50%)`;
            callback(0, 0);
        };

        zone.addEventListener('touchend', reset);
        zone.addEventListener('touchcancel', reset);
    }

    // Single Joystick: 4-directional movement
    handleJoystick(joystickZone, joystickStick, (x, y) => {
        state.joystick.x = x;
        state.joystick.y = y;
    });

    // Make interaction prompt clickable
    document.getElementById('interaction-prompt').addEventListener('click', () => {
        checkInteraction();
    });
    document.getElementById('interaction-prompt').addEventListener('touchstart', (e) => {
        e.preventDefault();
        checkInteraction();
    });
    // Force hide loading screen after 5 seconds just in case
    setTimeout(() => {
        if (!state.galleryReady) {
            console.warn('Loading timed out, forcing start.');
            hideLoadingScreen();
            state.galleryReady = true;
        }
    }, 5000);

    // 🎬 CINEMATIC POST-PROCESSING SETUP
    try {
        const renderScene = new THREE.RenderPass(scene, camera);

        // SSAO - Screen Space Ambient Occlusion for depth
        const ssaoPass = new THREE.SSAOPass(scene, camera, window.innerWidth, window.innerHeight);
        ssaoPass.kernelRadius = 16;
        ssaoPass.minDistance = 0.001;
        ssaoPass.maxDistance = 0.1;
        ssaoPass.output = THREE.SSAOPass.OUTPUT.Default;

        // Unreal Bloom - Subtle glow on bright surfaces
        const bloomPass = new THREE.UnrealBloomPass(
            new THREE.Vector2(window.innerWidth, window.innerHeight),
            0.4,  // strength
            0.5,  // radius
            0.85  // threshold
        );

        // Film Grain - Cinematic texture
        const filmGrainPass = new THREE.ShaderPass({
            uniforms: {
                tDiffuse: { value: null },
                time: { value: 0 },
                nIntensity: { value: 0.15 },
                sIntensity: { value: 0.05 },
                sCount: { value: 4096 }
            },
            vertexShader: `
                varying vec2 vUv;
                void main() {
                    vUv = uv;
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                }
            `,
            fragmentShader: `
                uniform sampler2D tDiffuse;
                uniform float time;
                uniform float nIntensity;
                uniform float sIntensity;
                uniform float sCount;
                varying vec2 vUv;

                float rand(vec2 co) {
                    return fract(sin(dot(co.xy, vec2(12.9898, 78.233))) * 43758.5453);
                }

                void main() {
                    vec4 color = texture2D(tDiffuse, vUv);
                    
                    // Noise grain
                    float x = (vUv.x + 4.0) * (vUv.y + 4.0) * (time * 10.0);
                    vec4 grain = vec4(mod((mod(x, 13.0) + 1.0) * (mod(x, 123.0) + 1.0), 0.01) - 0.005) * nIntensity;
                    
                    // Scanlines
                    float scanline = clamp(0.95 + 0.05 * cos(3.14 * (vUv.y + 0.008 * time) * 240.0 * 1.0), 0.0, 1.0);
                    float s = pow(scanline, sIntensity);
                    
                    color += grain;
                    color *= s;
                    
                    gl_FragColor = color;
                }
            `
        });

        // Vignette - Classic cinema framing
        const vignettePass = new THREE.ShaderPass({
            uniforms: {
                tDiffuse: { value: null },
                offset: { value: 1.0 },
                darkness: { value: 1.0 }
            },
            vertexShader: `
                varying vec2 vUv;
                void main() {
                    vUv = uv;
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                }
            `,
            fragmentShader: `
                uniform sampler2D tDiffuse;
                uniform float offset;
                uniform float darkness;
                varying vec2 vUv;

                void main() {
                    vec4 texel = texture2D(tDiffuse, vUv);
                    vec2 uv = (vUv - vec2(0.5)) * vec2(offset);
                    gl_FragColor = vec4(mix(texel.rgb, vec3(1.0 - darkness), dot(uv, uv)), texel.a);
                }
            `
        });

        composer = new THREE.EffectComposer(renderer);
        composer.addPass(renderScene);
        composer.addPass(ssaoPass);
        composer.addPass(bloomPass);
        composer.addPass(filmGrainPass);
        composer.addPass(vignettePass);

        // Animate film grain
        setInterval(() => {
            if (filmGrainPass.uniforms.time) {
                filmGrainPass.uniforms.time.value += 0.016;
            }
        }, 16);

        console.log('✅ Cinematic post-processing enabled');
    } catch (error) {
        console.warn('Post-processing not available:', error);
    }

    animate();
}

function onKeyDown(e) {
    // Video controls take priority
    if (state.isVideoPlaying) {
        // Exit video with Escape, Enter, or any movement key
        if (['Escape', 'Enter', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'KeyW', 'KeyS', 'KeyA', 'KeyD'].includes(e.code)) {
            e.preventDefault();
            closeVideo();
            return;
        }
        // Space toggles pause/play (and restarts if paused)
        if (e.code === 'Space') {
            e.preventDefault();
            const videoIframe = document.getElementById('video-screen');
            if (videoIframe && videoIframe.contentWindow) {
                if (state.isVideoPaused) {
                    // Play video
                    videoIframe.contentWindow.postMessage('{"event":"command","func":"playVideo","args":""}', '*');
                    state.isVideoPaused = false;
                } else {
                    // Pause video
                    videoIframe.contentWindow.postMessage('{"event":"command","func":"pauseVideo","args":""}', '*');
                    state.isVideoPaused = true;
                }
            }
            return;
        }
        return; // Block all other keys when video is playing
    }

    if (state.keys.hasOwnProperty(e.code)) state.keys[e.code] = true;

    if (e.code === 'Enter') {
        checkInteraction();
    }
}

function setupLighting() {
    const hemiLight = new THREE.HemisphereLight(0xffffff, 0x888888, 0.5); // Moderate ambient for daylight
    hemiLight.position.set(0, 20, 0);
    hemiLight.name = 'mainHemi';
    scene.add(hemiLight);

    const dirLight = new THREE.DirectionalLight(0xfff4e6, 0.8); // Warm sunlight, moderate brightness
    dirLight.position.set(10, 30, 10);
    dirLight.castShadow = true;

    // STABLE SHADOWS - No Flickering
    dirLight.shadow.mapSize.width = 2048;
    dirLight.shadow.mapSize.height = 2048;
    dirLight.shadow.camera.left = -50;
    dirLight.shadow.camera.right = 50;
    dirLight.shadow.camera.top = 50;
    dirLight.shadow.camera.bottom = -50;
    dirLight.shadow.camera.near = 0.5;
    dirLight.shadow.camera.far = 100;
    dirLight.shadow.bias = -0.001;         // Stable shadows
    dirLight.shadow.normalBias = 0.05;     // Prevent flickering
    dirLight.name = 'mainDir';
    scene.add(dirLight);

    const lightColor = 0xfff4e6; // Warm white for daylight
    const positions = [[0, 10], [20, 10], [0, 30]];
    positions.forEach((pos, i) => {
        const pl = new THREE.PointLight(lightColor, 0.4, 18); // Moderate brightness
        pl.position.set(pos[0], 4, pos[1]);
        pl.name = `roomLight_${i}`;
        scene.add(pl);
    });

    // Upper Floor Lights (y=9)
    const upperPositions = [[0, 10], [20, 10]];
    upperPositions.forEach((pos, i) => {
        const pl = new THREE.PointLight(lightColor, 0.4, 18);
        pl.position.set(pos[0], 9, pos[1]);
        pl.name = `upperLight_${i}`;
        scene.add(pl);
    });
}

function toggleLights() {
    CONFIG.lightsOn = !CONFIG.lightsOn;
    const intensityMult = CONFIG.lightsOn ? 1 : 0.2;

    const hemi = scene.getObjectByName('mainHemi');
    if (hemi) hemi.intensity = 0.6 * intensityMult;

    const dir = scene.getObjectByName('mainDir');
    if (dir) dir.intensity = 0.8 * intensityMult;

    for (let i = 0; i < 4; i++) {
        const pl = scene.getObjectByName(`roomLight_${i}`);
        if (pl) pl.intensity = 0.5 * intensityMult;
    }

    for (let i = 0; i < 2; i++) {
        const pl = scene.getObjectByName(`upperLight_${i}`);
        if (pl) pl.intensity = 0.5 * intensityMult;
    }
}

function createLightSwitch() {
    const geo = new THREE.BoxGeometry(0.2, 0.4, 0.1);
    const mat = new THREE.MeshStandardMaterial({ color: 0xeeeeee });
    const housing = new THREE.Mesh(geo, mat);

    const btnGeo = new THREE.BoxGeometry(0.1, 0.2, 0.05);
    const btnMat = new THREE.MeshStandardMaterial({ color: 0xff0000 });
    const btn = new THREE.Mesh(btnGeo, btnMat);
    btn.position.z = 0.05;
    housing.add(btn);

    // Place on the central pillar/obstacle (4x4 block at x=10, z=20)
    // This is the empty wall space at the center between all four rooms
    // Placing on the West side facing Room 1, at x=8 (edge of the 4x4 block)
    housing.position.set(7.9, 1.5, 20);
    housing.rotation.y = -Math.PI / 2;

    housing.userData = { type: 'switch' };
    scene.add(housing);
    state.interactables.push(housing);
}

function createSkyTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 1024;
    const ctx = canvas.getContext('2d');

    // Beautiful spring/summer day sky - BRIGHT colors
    const skyGrad = ctx.createLinearGradient(0, 0, 0, 1024);
    skyGrad.addColorStop(0, '#87ceeb');    // Sky blue at top
    skyGrad.addColorStop(0.5, '#b0d8f0');  // Lighter sky blue
    skyGrad.addColorStop(1, '#e0f0ff');    // Very light blue at horizon

    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, 1024, 1024);

    // Add bright fluffy white clouds
    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)'; // More opaque clouds
    for (let i = 0; i < 20; i++) {
        const x = Math.random() * 1024;
        const y = Math.random() * 600; // Upper portion only
        const size = 40 + Math.random() * 80;

        // Draw cloud as multiple overlapping circles
        for (let j = 0; j < 5; j++) {
            const offsetX = (Math.random() - 0.5) * size;
            const offsetY = (Math.random() - 0.5) * size * 0.5;
            const radius = size * (0.3 + Math.random() * 0.4);
            ctx.beginPath();
            ctx.arc(x + offsetX, y + offsetY, radius, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    // Add subtle sun glow in upper corner
    const sunGrad = ctx.createRadialGradient(850, 150, 0, 850, 150, 200);
    sunGrad.addColorStop(0, 'rgba(255, 255, 200, 0.3)');
    sunGrad.addColorStop(1, 'rgba(255, 255, 200, 0)');
    ctx.fillStyle = sunGrad;
    ctx.fillRect(0, 0, 1024, 1024);

    const tex = new THREE.CanvasTexture(canvas);
    return tex;
}

function createSkybox() {
    const geo = new THREE.CylinderGeometry(80, 80, 60, 32);
    const mat = new THREE.MeshBasicMaterial({
        map: createSkyTexture(),
        side: THREE.BackSide,
        color: 0xffffff,  // Ensure full brightness
        fog: false        // Don't apply fog to skybox
    });
    const sky = new THREE.Mesh(geo, mat);
    sky.position.y = 10;
    scene.add(sky);
}

function buildGallery() {
    // PHOTOREALISTIC TEXTURES - Maximum Quality
    const floorTex = state.textureLoader.load('assets/textures/floor_wood_neutral.png');
    floorTex.wrapS = THREE.RepeatWrapping;
    floorTex.wrapT = THREE.RepeatWrapping;
    floorTex.repeat.set(10, 10); // Balanced detail
    floorTex.encoding = THREE.sRGBEncoding;
    floorTex.anisotropy = renderer.capabilities.getMaxAnisotropy(); // 16x filtering
    floorTex.minFilter = THREE.LinearMipmapLinearFilter;
    floorTex.magFilter = THREE.LinearFilter;

    const wallTex = state.textureLoader.load('assets/textures/wall_concrete.png');
    wallTex.wrapS = THREE.RepeatWrapping;
    wallTex.wrapT = THREE.RepeatWrapping;
    wallTex.repeat.set(1.5, 1); // Very subtle repetition
    wallTex.encoding = THREE.sRGBEncoding;
    wallTex.anisotropy = renderer.capabilities.getMaxAnisotropy();
    wallTex.minFilter = THREE.LinearMipmapLinearFilter;
    wallTex.magFilter = THREE.LinearFilter;

    const ceilingTex = state.textureLoader.load('assets/textures/ceiling_wood.png');
    ceilingTex.wrapS = THREE.RepeatWrapping;
    ceilingTex.wrapT = THREE.RepeatWrapping;
    ceilingTex.repeat.set(5, 5); // Subtle ceiling detail
    ceilingTex.encoding = THREE.sRGBEncoding;
    ceilingTex.anisotropy = renderer.capabilities.getMaxAnisotropy();
    ceilingTex.minFilter = THREE.LinearMipmapLinearFilter;
    ceilingTex.magFilter = THREE.LinearFilter;

    // PREMIUM MATERIALS - Museum Quality
    const floorMat = new THREE.MeshStandardMaterial({
        map: floorTex,
        roughness: 0.25,      // Polished museum floor
        metalness: 0.05,
        color: 0xaaaaaa,      // Neutral tone
        envMapIntensity: 0.6,
        normalScale: new THREE.Vector2(0.5, 0.5)
    });

    const ceilingMat = new THREE.MeshStandardMaterial({
        map: ceilingTex,
        roughness: 0.85,
        metalness: 0.0,
        color: 0x555555       // Sophisticated dark ceiling
    });

    const wallMat = new THREE.MeshStandardMaterial({
        map: wallTex,
        roughness: 0.85,
        metalness: 0.0,
        color: 0x888888  // Lighter concrete gray
    });

    const lightMat = new THREE.MeshBasicMaterial({ color: 0xffffee });

    const wallGeo = new THREE.BoxGeometry(1, CONFIG.wallHeight, 1);

    function addWall(x, z, width, depth) {
        const wall = new THREE.Mesh(wallGeo, wallMat);
        wall.position.set(x, CONFIG.wallHeight / 2, z);
        wall.scale.set(width, 1, depth);
        wall.castShadow = true;
        wall.receiveShadow = true;
        scene.add(wall);
        state.walls.push(new THREE.Box3().setFromObject(wall));
    }

    function addCeilingLight(x, z) {
        const fixture = new THREE.Mesh(new THREE.BoxGeometry(2, 0.1, 0.5), lightMat);
        fixture.position.set(x, CONFIG.wallHeight - 0.05, z);
        fixture.castShadow = false;      // No shadow casting
        fixture.receiveShadow = false;   // No shadow receiving
        scene.add(fixture);
    }

    const floorGeo = new THREE.PlaneGeometry(40, 40);
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.position.set(10, 0, 20);
    floor.receiveShadow = true;
    scene.add(floor);

    // Ceilings per room
    const ceilingGeo = new THREE.PlaneGeometry(20, 20);

    // Room 1 (NW) - Standard
    const c1 = new THREE.Mesh(ceilingGeo, ceilingMat);
    c1.rotation.x = Math.PI / 2;
    c1.position.set(0, CONFIG.wallHeight, 10);
    scene.add(c1);
    addCeilingLight(0, 10);

    // Room 2 (NE) - Standard with Hole for Stairs
    // Create ceiling with hole
    const c2Shape = new THREE.Shape();
    c2Shape.moveTo(-10, -10);
    c2Shape.lineTo(10, -10);
    c2Shape.lineTo(10, 10);
    c2Shape.lineTo(-10, 10);
    c2Shape.lineTo(-10, -10);

    // Hole for stairs: x: 24-27 (local 4-7), z: 5-15 (local -5 to 5)
    // Room 2 center is (20, 10).
    // Stairs global x: 24-27 -> local x: 4 to 7
    // Stairs global z: 5-15 -> local z: -5 to 5
    // Note: PlaneGeometry is centered.
    // Let's use 4 planes to make a hole instead of shape for simplicity with UVs, or just ShapeGeometry.
    // Using ShapeGeometry for ceiling is fine.
    const holePath = new THREE.Path();
    holePath.moveTo(4, -5);
    holePath.lineTo(7, -5);
    holePath.lineTo(7, 5);
    holePath.lineTo(4, 5);
    holePath.lineTo(4, -5);
    c2Shape.holes.push(holePath);

    const c2Geo = new THREE.ShapeGeometry(c2Shape);

    // Fix UVs to match PlaneGeometry (map -10..10 to 0..1)
    const uvAttribute = c2Geo.attributes.uv;
    const posAttribute = c2Geo.attributes.position;
    for (let i = 0; i < posAttribute.count; i++) {
        const x = posAttribute.getX(i);
        const y = posAttribute.getY(i);
        const u = (x + 10) / 20;
        const v = (y + 10) / 20;
        uvAttribute.setXY(i, u, v);
    }

    const c2 = new THREE.Mesh(c2Geo, ceilingMat);
    c2.rotation.x = Math.PI / 2;
    c2.position.set(20, CONFIG.wallHeight, 10);
    scene.add(c2);
    addCeilingLight(20, 10);

    // Room 3 (SW) - Standard
    const c3 = new THREE.Mesh(ceilingGeo, ceilingMat);
    c3.rotation.x = Math.PI / 2;
    c3.position.set(0, CONFIG.wallHeight, 30);
    scene.add(c3);
    addCeilingLight(0, 30);

    // Concrete floor above Room 3
    const floorAboveGeo = new THREE.PlaneGeometry(20, 20);
    const floorAbove = new THREE.Mesh(floorAboveGeo, wallMat);
    floorAbove.rotation.x = -Math.PI / 2;
    floorAbove.position.set(0, CONFIG.wallHeight + 0.01, 30);
    scene.add(floorAbove);

    // Room 4 (SE) - HIGH CEILING (5x height)
    const highHeight = CONFIG.wallHeight * 5;
    const c4 = new THREE.Mesh(ceilingGeo, ceilingMat);
    c4.rotation.x = Math.PI / 2;
    c4.position.set(20, highHeight, 30);
    scene.add(c4);
    // Light for Room 4 (higher up)
    const fixture4 = new THREE.Mesh(new THREE.BoxGeometry(2, 0.1, 0.5), lightMat);
    fixture4.position.set(20, highHeight - 0.05, 30);
    scene.add(fixture4);

    // Add High Walls with Windows for Room 4
    const windowFrameMat = new THREE.MeshStandardMaterial({ color: 0x333333 });

    function addWindowWall(x, z, w, d, rot) {
        const pillarGeo = new THREE.BoxGeometry(0.5, highHeight - CONFIG.wallHeight, 0.5);
        const numWindows = 4;
        const step = (w > d ? w : d) / numWindows;

        for (let i = 0; i <= numWindows; i++) {
            const pillar = new THREE.Mesh(pillarGeo, windowFrameMat);
            const offset = -((w > d ? w : d) / 2) + i * step;
            if (w > d) pillar.position.set(x + offset, (highHeight + CONFIG.wallHeight) / 2, z);
            else pillar.position.set(x, (highHeight + CONFIG.wallHeight) / 2, z + offset);
            scene.add(pillar);
        }

        const beamGeo = new THREE.BoxGeometry(w > d ? w : 0.5, 0.5, w > d ? 0.5 : d);
        const bottomBeam = new THREE.Mesh(beamGeo, windowFrameMat);
        bottomBeam.position.set(x, CONFIG.wallHeight, z);
        scene.add(bottomBeam);

        const topBeam = new THREE.Mesh(beamGeo, windowFrameMat);
        topBeam.position.set(x, highHeight, z);
        scene.add(topBeam);
    }

    addWindowWall(29.75, 30, 0, 20, 0);
    addWindowWall(20, 39.75, 20, 0, 0);
    addWindowWall(10.25, 30, 0, 20, 0);
    addWindowWall(20, 20.25, 20, 0, 0);

    const wt = CONFIG.wallThickness;

    // Revert to Original Wall Layout
    // Outer Walls
    addWall(10, -wt / 2, 40 + wt * 2, wt);
    addWall(10, 40 + wt / 2, 40 + wt * 2, wt);
    addWall(-10 - wt / 2, 20, wt, 40 + wt * 2);
    addWall(30 + wt / 2, 20, wt, 40 + wt * 2);

    // Vertical Divider (x=10)
    addWall(10, 5, wt, 10);
    addWall(10, 35, wt, 10);

    // Horizontal Divider (z=20) - Widened gap (width 8 instead of 10)
    addWall(0, 20, 8, wt);
    addWall(20, 20, 8, wt);

    // Central Pillar (4x4 block at x=10, z=20)
    addWall(10, 20, 4, 4);

    // --- Second Floor & Stairs ---

    // Stairs in Room 2 (NE)
    // x: 24-27, z: 5-15. Rise from y=0 to y=5.01.
    const steps = 20;
    const stepHeight = 5.01 / steps;
    const stepDepth = 10 / steps;
    const stepWidth = 3;
    const stepGeo = new THREE.BoxGeometry(stepWidth, stepHeight, stepDepth);
    const stepMat = new THREE.MeshStandardMaterial({ map: floorTex });

    for (let i = 0; i < steps; i++) {
        const s = new THREE.Mesh(stepGeo, stepMat);
        // z starts at 15 and goes to 5. y starts at 0.
        // Adjust y to start exactly from floor
        s.position.set(25.5, i * stepHeight + stepHeight / 2, 15 - i * stepDepth - stepDepth / 2);
        s.receiveShadow = true;
        s.castShadow = true;
        scene.add(s);
    }

    const railHeight = 1.0;
    const railMat = new THREE.MeshStandardMaterial({ color: 0x333333 });

    function addRailing(x, z, w, d) {
        const r = new THREE.Mesh(new THREE.BoxGeometry(w, railHeight, d), railMat);
        r.position.set(x, 5 + railHeight / 2, z);
        scene.add(r);
        state.obstacles.push(new THREE.Box3().setFromObject(r));
    }

    // West Railing (2nd Floor)
    addRailing(23.95, 10, 0.1, 10);
    // East Railing (2nd Floor)
    addRailing(27.05, 10, 0.1, 10);
    // South Railing (2nd Floor) - Back of hole
    addRailing(25.5, 15.05, 3.2, 0.1);
    // North Railing REMOVED to allow exit

    // Ground Floor Barriers for Stairs
    // Prevent entry from side (West) and under/top (North)
    // West Barrier (Wall)
    const barrierGeo = new THREE.BoxGeometry(0.1, 5, 10);
    const barrierWest = new THREE.Mesh(barrierGeo, wallMat);
    barrierWest.position.set(23.95, 2.5, 10);
    scene.add(barrierWest);
    state.walls.push(new THREE.Box3().setFromObject(barrierWest));

    // East Barrier (Railing extended to ceiling)
    const groundRailEast = new THREE.Mesh(new THREE.BoxGeometry(0.1, 5, 10), railMat);
    groundRailEast.position.set(27.05, 2.5, 10);
    scene.add(groundRailEast);
    state.obstacles.push(new THREE.Box3().setFromObject(groundRailEast));

    // North Barrier (Under top of stairs) - Lowered to allow exit on 2nd floor
    const barrierNorth = new THREE.Mesh(new THREE.BoxGeometry(3.2, 4, 0.1), wallMat);
    barrierNorth.position.set(25.5, 2, 4.95);
    scene.add(barrierNorth);
    state.walls.push(new THREE.Box3().setFromObject(barrierNorth));

    // Second Floor Floor (y=5.01)
    // Split into 4 rectangles to avoid ShapeGeometry triangulation artifacts
    // Area: x: -10 to 30, z: 0 to 20.
    // Hole: x: 24-27, z: 5-15.

    // 1. Main West Section (x: -10 to 24, z: 0 to 20)
    const f2Geo1 = new THREE.PlaneGeometry(34, 20);
    const f2_1 = new THREE.Mesh(f2Geo1, floorMat);
    f2_1.rotation.x = -Math.PI / 2;
    f2_1.position.set(7, 5.01, 10);
    f2_1.receiveShadow = true;
    scene.add(f2_1);

    // 2. East Strip (x: 27 to 30, z: 0 to 20)
    const f2Geo2 = new THREE.PlaneGeometry(3, 20);
    const f2_2 = new THREE.Mesh(f2Geo2, floorMat);
    f2_2.rotation.x = -Math.PI / 2;
    f2_2.position.set(28.5, 5.01, 10);
    f2_2.receiveShadow = true;
    scene.add(f2_2);

    // 3. North Bridge (x: 24 to 27, z: 0 to 5)
    const f2Geo3 = new THREE.PlaneGeometry(3, 5);
    const f2_3 = new THREE.Mesh(f2Geo3, floorMat);
    f2_3.rotation.x = -Math.PI / 2;
    f2_3.position.set(25.5, 5.01, 2.5);
    f2_3.receiveShadow = true;
    scene.add(f2_3);

    // 4. South Bridge (x: 24 to 27, z: 15 to 20)
    const f2Geo4 = new THREE.PlaneGeometry(3, 5);
    const f2_4 = new THREE.Mesh(f2Geo4, floorMat);
    f2_4.rotation.x = -Math.PI / 2;
    f2_4.position.set(25.5, 5.01, 17.5);
    f2_4.receiveShadow = true;
    scene.add(f2_4);

    // Second Floor Ceiling (y=10)
    const ceiling2Geo = new THREE.PlaneGeometry(40, 20);
    const ceiling2 = new THREE.Mesh(ceiling2Geo, ceilingMat);
    ceiling2.rotation.x = Math.PI / 2;
    ceiling2.position.set(10, 10, 10);
    scene.add(ceiling2);

    // Second Floor Walls
    // Helper for 2nd floor walls
    function addWall2(x, z, w, d) {
        const wall = new THREE.Mesh(wallGeo, wallMat);
        wall.position.set(x, 5 + CONFIG.wallHeight / 2, z);
        wall.scale.set(w, 1, d);
        wall.castShadow = true;
        wall.receiveShadow = true;
        scene.add(wall);
        state.walls.push(new THREE.Box3().setFromObject(wall));
    }

    // Outer Walls - Split for window openings in Room 1 (x: -10 to 10)
    // North Wall (z=0): gap at x=0 (width 6m, from x=-3 to x=3)
    addWall2(-6.5, 0, 7, wt);  // West segment: x=-10 to -3
    addWall2(6.5, 0, 7, wt);   // Middle segment: x=3 to 10
    addWall2(20, 0, 20, wt);   // East segment: x=10 to 30
    // South Wall (z=20): gap at x=0 (width 6m, from x=-3 to x=3)
    addWall2(-6.5, 20, 7, wt); // West segment: x=-10 to -3
    addWall2(6.5, 20, 7, wt);  // Middle segment: x=3 to 10
    addWall2(20, 20, 20, wt);  // East segment: x=10 to 30
    // West Wall (x=-10): gap at z=10 (width 6m, from z=7 to z=13)
    addWall2(-10, 3.5, wt, 7); // North segment: z=0 to 7
    addWall2(-10, 16.5, wt, 7); // South segment: z=13 to 20
    // East Wall (x=30): no window
    addWall2(30, 10, wt, 20);

    // Divider Wall (x=10) with Passage
    // Passage at z=10 (width 4) -> Widen to width 6
    // z range is 0 to 20. Center is 10.
    // Gap: 7 to 13.
    // Wall 1: z=0 to 7. Center 3.5. Width 7.
    // Wall 2: z=13 to 20. Center 16.5. Width 7.
    // Offset x slightly to avoid z-fighting with floor/ceiling edges if any
    addWall2(10, 3.5, wt, 7);
    addWall2(10, 16.5, wt, 7);

    // --- Objects ---

    // Table in Room 1 Upper (West)
    const tableGeo = new THREE.BoxGeometry(3, 1, 2);
    const tableMat = new THREE.MeshStandardMaterial({ color: 0x8B4513 });
    const table = new THREE.Mesh(tableGeo, tableMat);
    table.position.set(0, 5.5, 10);
    scene.add(table);
    state.obstacles.push(new THREE.Box3().setFromObject(table));

    // Realistic Headphones with Podcast Functionality
    const standGeo = new THREE.CylinderGeometry(0.05, 0.1, 0.3, 16);
    const standMat = new THREE.MeshStandardMaterial({ color: 0x222222, metalness: 0.5, roughness: 0.3 });

    const headbandGeo = new THREE.TorusGeometry(0.12, 0.015, 16, 32, Math.PI);
    const headbandMat = new THREE.MeshStandardMaterial({ color: 0x1a1a1a, metalness: 0.3, roughness: 0.4 });

    const earCupGeo = new THREE.CylinderGeometry(0.06, 0.06, 0.04, 32);
    const earCupMat = new THREE.MeshStandardMaterial({ color: 0x111111, metalness: 0.2, roughness: 0.5 });

    const cushionGeo = new THREE.CylinderGeometry(0.055, 0.055, 0.02, 32);
    const cushionMat = new THREE.MeshStandardMaterial({ color: 0x2a2a2a, roughness: 0.9 });

    function createHeadphones(x, y, z, podcastId, podcastTitle) {
        const group = new THREE.Group();

        // Stand
        const stand = new THREE.Mesh(standGeo, standMat);
        stand.position.y = -0.15;
        group.add(stand);

        // Headband
        const headband = new THREE.Mesh(headbandGeo, headbandMat);
        headband.rotation.z = Math.PI / 2;
        headband.position.y = 0.12;
        group.add(headband);

        // Left ear cup
        const leftCup = new THREE.Mesh(earCupGeo, earCupMat);
        leftCup.position.set(-0.12, 0, 0);
        leftCup.rotation.z = Math.PI / 2;
        group.add(leftCup);

        const leftCushion = new THREE.Mesh(cushionGeo, cushionMat);
        leftCushion.position.set(-0.12, 0, 0.03);
        leftCushion.rotation.z = Math.PI / 2;
        group.add(leftCushion);

        // Right ear cup
        const rightCup = new THREE.Mesh(earCupGeo, earCupMat);
        rightCup.position.set(0.12, 0, 0);
        rightCup.rotation.z = Math.PI / 2;
        group.add(rightCup);

        const rightCushion = new THREE.Mesh(cushionGeo, cushionMat);
        rightCushion.position.set(0.12, 0, 0.03);
        rightCushion.rotation.z = Math.PI / 2;
        group.add(rightCushion);

        group.position.set(x, y, z);
        group.userData = {
            type: 'podcast',
            videoId: podcastId,
            title: podcastTitle
        };

        scene.add(group);
        state.interactables.push(group);
    }

    // Create two podcast headphones
    createHeadphones(-0.8, 6.15, 10, 'c7_WMRuzAvc', 'WirtschaftsWoche Podcast');
    createHeadphones(0.8, 6.15, 10, 'c7_WMRuzAvc', 'WirtschaftsWoche Podcast');

    // Table in Room 2 Upper (East) for Remote
    const table2 = new THREE.Mesh(tableGeo, tableMat);
    table2.position.set(20, 5.5, 10);
    scene.add(table2);
    state.obstacles.push(new THREE.Box3().setFromObject(table2));

    // Windows for Room 1 Upper Floor - Floor to Ceiling
    const windowGeo = new THREE.BoxGeometry(6, 5, 0.2);
    const windowMat = new THREE.MeshStandardMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.3,
        metalness: 0.9,
        roughness: 0.1
    });

    const westWindow = new THREE.Mesh(windowGeo, windowMat);
    westWindow.position.set(-10, 7.5, 10);
    westWindow.rotation.y = Math.PI / 2;
    scene.add(westWindow);

    const northWindow = new THREE.Mesh(windowGeo, windowMat);
    northWindow.position.set(0, 7.5, 0);
    scene.add(northWindow);

    const southWindow = new THREE.Mesh(windowGeo, windowMat);
    southWindow.position.set(0, 7.5, 20);
    scene.add(southWindow);

    // Video Thumbnail on South Wall of Room 2 Upper
    const videoId = 'VYbzclXAAd8';
    const thumbnailUrl = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;

    const thumbnailTexture = state.textureLoader.load(thumbnailUrl);
    thumbnailTexture.encoding = THREE.sRGBEncoding;

    const thumbnailGeo = new THREE.PlaneGeometry(8, 4.5);
    const thumbnailMat = new THREE.MeshStandardMaterial({
        map: thumbnailTexture,
        roughness: 0.3,
        metalness: 0.1
    });
    const thumbnailScreen = new THREE.Mesh(thumbnailGeo, thumbnailMat);
    thumbnailScreen.position.set(20, 8, 19.6); // South wall of Room 2
    thumbnailScreen.rotation.y = Math.PI;
    thumbnailScreen.castShadow = true;
    thumbnailScreen.receiveShadow = true;
    scene.add(thumbnailScreen);

    // Add a frame around the thumbnail
    const thumbnailFrame = createFrame(8, 4.5);
    thumbnailFrame.position.set(20, 8, 19.61);
    thumbnailFrame.rotation.y = Math.PI;
    scene.add(thumbnailFrame);

    // Remote Control
    const remoteGeo = new THREE.BoxGeometry(0.2, 0.05, 0.4);
    const remoteMat = new THREE.MeshStandardMaterial({ color: 0x333333 });
    const remote = new THREE.Mesh(remoteGeo, remoteMat);
    remote.position.set(20, 6.05, 10);
    remote.userData = {
        type: 'remote',
        videoId: 'VYbzclXAAd8' // YouTube video ID
    };
    scene.add(remote);
    state.interactables.push(remote);

    // Light Switch in Room 2 Upper
    const swGeo = new THREE.BoxGeometry(0.2, 0.4, 0.1);
    const swMat = new THREE.MeshStandardMaterial({ color: 0xeeeeee });
    const swHousing = new THREE.Mesh(swGeo, swMat);
    const swBtn = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.2, 0.05), new THREE.MeshStandardMaterial({ color: 0xff0000 }));
    swBtn.position.z = 0.05;
    swHousing.add(swBtn);
    swHousing.position.set(29.9, 6.5, 15);
    swHousing.rotation.y = -Math.PI / 2;
    swHousing.userData = { type: 'switch' };
    scene.add(swHousing);
    state.interactables.push(swHousing);

    addObstacles();
    placeCovers();
}

function addObstacles() {
    // PHOTOREALISTIC OBSTACLE TEXTURES
    const benchTex = state.textureLoader.load('assets/textures/bench_wood.png');
    benchTex.encoding = THREE.sRGBEncoding;
    benchTex.anisotropy = renderer.capabilities.getMaxAnisotropy();
    benchTex.minFilter = THREE.LinearMipmapLinearFilter;
    benchTex.magFilter = THREE.LinearFilter;

    const plantTex = state.textureLoader.load('assets/textures/plant_leaf.png');
    plantTex.encoding = THREE.sRGBEncoding;
    plantTex.wrapS = THREE.RepeatWrapping;
    plantTex.wrapT = THREE.RepeatWrapping;
    plantTex.anisotropy = renderer.capabilities.getMaxAnisotropy();
    plantTex.minFilter = THREE.LinearMipmapLinearFilter;
    plantTex.magFilter = THREE.LinearFilter;

    const potTex = state.textureLoader.load('assets/textures/pot_clay.png');
    potTex.encoding = THREE.sRGBEncoding;
    potTex.anisotropy = renderer.capabilities.getMaxAnisotropy();
    potTex.minFilter = THREE.LinearMipmapLinearFilter;
    potTex.magFilter = THREE.LinearFilter;

    const benchGeo = new THREE.BoxGeometry(4, 0.5, 1.5);
    const benchMat = new THREE.MeshStandardMaterial({
        map: benchTex,
        roughness: 0.35,  // Slightly worn wood
        metalness: 0.0,
        color: 0xcccccc
    });

    const leafGeo = new THREE.IcosahedronGeometry(0.4, 1);
    const plantMat = new THREE.MeshStandardMaterial({
        map: plantTex,
        roughness: 0.8,   // Natural plant texture
        metalness: 0.0,
        color: 0x88aa88
    });

    const potGeo = new THREE.CylinderGeometry(0.4, 0.3, 0.5, 16);
    const potMat = new THREE.MeshStandardMaterial({
        map: potTex,
        roughness: 0.7,   // Clay texture
        metalness: 0.0,
        color: 0xaa8866
    });

    function addBench(x, z, rot) {
        const bench = new THREE.Mesh(benchGeo, benchMat);
        bench.position.set(x, 0.25, z);
        bench.rotation.y = rot;
        bench.castShadow = true;
        bench.receiveShadow = true;
        scene.add(bench);

        // Tighter collision box for easier navigation
        const box = new THREE.Box3();
        box.min.set(x - 1.25, 0, z - 0.4);  // Reduced from 1.5 to 1.25 width
        box.max.set(x + 1.25, 0.5, z + 0.4); // Reduced from 0.5 to 0.4 depth
        state.obstacles.push(box);
    }

    function addPlant(x, z) {
        const group = new THREE.Group();
        const pot = new THREE.Mesh(potGeo, potMat);
        pot.position.y = 0.25;
        pot.castShadow = true;
        pot.receiveShadow = true;
        group.add(pot);

        const foliage = new THREE.Group();
        foliage.position.y = 0.8;

        const positions = [
            [0, 0, 0], [0.3, 0.2, 0], [-0.3, 0.2, 0],
            [0, 0.2, 0.3], [0, 0.2, -0.3], [0, 0.5, 0]
        ];

        positions.forEach(pos => {
            const leaf = new THREE.Mesh(leafGeo, plantMat);
            leaf.position.set(...pos);
            leaf.castShadow = true;
            leaf.receiveShadow = true;
            foliage.add(leaf);
        });

        group.add(foliage);
        group.position.set(x, 0, z);
        scene.add(group);

        const box = new THREE.Box3();
        box.min.set(x - 0.3, 0, z - 0.3);  // Reduced from 0.5 to 0.3
        box.max.set(x + 0.3, 2, z + 0.3);
        state.obstacles.push(box);
    }

    addBench(0, 10, 0);
    addPlant(-3, 5);
    addBench(20, 10, Math.PI / 2);
    addPlant(23, 5);
    addBench(20, 30, 0);
    addPlant(23, 35);
    addBench(0, 30, Math.PI / 2);
    addPlant(-3, 35);
}

function createFrame(width, height) {
    const frameShape = new THREE.Shape();
    const w = width + 0.2;
    const h = height + 0.2;
    frameShape.moveTo(-w / 2, -h / 2);
    frameShape.lineTo(w / 2, -h / 2);
    frameShape.lineTo(w / 2, h / 2);
    frameShape.lineTo(-w / 2, h / 2);
    frameShape.lineTo(-w / 2, -h / 2);

    const hole = new THREE.Path();
    hole.moveTo(-width / 2, -height / 2);
    hole.lineTo(width / 2, -height / 2);
    hole.lineTo(width / 2, height / 2);
    hole.lineTo(-width / 2, height / 2);
    hole.lineTo(-width / 2, -height / 2);
    frameShape.holes.push(hole);

    const geo = new THREE.ExtrudeGeometry(frameShape, { depth: 0.1, bevelEnabled: true, bevelSize: 0.02, bevelThickness: 0.02 });
    const mat = new THREE.MeshStandardMaterial({ color: 0x5C4033, roughness: 0.8 });
    return new THREE.Mesh(geo, mat);
}

function createCoverTexture(index, highRes = false, material = null) {
    // Check if custom cover data exists
    const coverData = typeof COVERS_DATA !== 'undefined' && COVERS_DATA[index];

    if (coverData) {
        // Load custom image
        const imagePath = highRes ? coverData.highRes : coverData.lowRes;
        const tex = state.textureLoader.load(imagePath, (t) => {
            t.encoding = THREE.sRGBEncoding;
            t.flipY = true;
            if (material) {
                material.map = t;
                material.needsUpdate = true;
            }
        });
        tex.encoding = THREE.sRGBEncoding;
        tex.flipY = true;
        return tex;
    }

    // Fallback: Generate procedural texture
    const width = highRes ? 1024 : 512;
    const height = highRes ? 1360 : 680;
    const scale = highRes ? 2 : 1;

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');

    const hue = (index * 137.5) % 360;
    // Elegant Dark Background
    ctx.fillStyle = '#111111';
    ctx.fillRect(0, 0, width, height);

    // Gold Accent
    ctx.strokeStyle = '#C5A059'; // Gold
    ctx.lineWidth = 10 * scale;
    ctx.strokeRect(30 * scale, 30 * scale, width - 60 * scale, height - 60 * scale);

    ctx.fillStyle = '#ffffff';
    ctx.font = `bold ${80 * scale}px serif`; // Serif for elegance
    ctx.textAlign = 'center';
    ctx.fillText('WiWo', width / 2, 150 * scale);

    ctx.fillStyle = '#C5A059'; // Gold
    ctx.font = `bold ${200 * scale}px serif`;
    ctx.fillText(index + 1, width / 2, 400 * scale);

    ctx.fillStyle = '#aaaaaa';
    ctx.font = `${30 * scale}px sans-serif`;
    ctx.fillText('JUBILÄUMSAUSGABE', width / 2, 550 * scale);

    return new THREE.CanvasTexture(canvas);
}

function placeCovers() {
    const coverW = 1.5;
    const coverH = 2;
    const coverGeo = new THREE.PlaneGeometry(coverW, coverH);
    let coverIndex = 0;

    function placeRow(startX, startZ, endX, endZ, facing, count, margin = 2.0) {
        const dx = (endX - startX);
        const dz = (endZ - startZ);
        const len = Math.sqrt(dx * dx + dz * dz);

        const usableLen = len - 2 * margin;
        if (count <= 0) return;

        for (let i = 0; i < count; i++) {
            if (coverIndex >= CONFIG.totalCovers) return;

            const t = count > 1 ? i / (count - 1) : 0.5;
            const dist = margin + t * usableLen;

            const x = startX + (dx / len) * dist;
            const z = startZ + (dz / len) * dist;

            const group = new THREE.Group();
            group.position.set(x, CONFIG.eyeHeight, z);
            group.rotation.y = facing;

            const frame = createFrame(coverW, coverH);
            frame.position.z = 0;
            group.add(frame);

            const mat = new THREE.MeshStandardMaterial({
                roughness: 0.4,
                color: 0xffffff,
                emissive: 0x111111 // Start darker
            });
            mat.map = createCoverTexture(coverIndex, false, mat);
            const mesh = new THREE.Mesh(coverGeo, mat);
            mesh.userData = { id: coverIndex, viewed: false };
            mesh.position.z = 0.11;
            group.add(mesh);

            scene.add(group);
            state.covers.push(mesh);
            coverIndex++;
        }
    }

    // Distribute 100 covers across 4 rooms (25 per room)
    // Avoid gaps/passages.
    // Outer walls are continuous. Inner walls have gaps.

    // Room 1 (NW)
    // West Wall (Outer): x=-9.65, z: 0->20. (9 covers)
    placeRow(-9.65, 0, -9.65, 20, Math.PI / 2, 9);
    // North Wall (Outer): z=0.35, x: -10->10. (9 covers)
    placeRow(-10, 0.35, 10, 0.35, 0, 9);
    // East Wall (Inner Solid): x=9.65, z: 0->10. (3 covers)
    placeRow(9.65, 0, 9.65, 10, -Math.PI / 2, 3);
    // South Wall (Inner Solid): z=19.65, x: -5->5. (4 covers)
    placeRow(-5, 19.65, 5, 19.65, Math.PI, 4);

    // Room 2 (NE)
    // North Wall (Outer): z=0.35, x: 10->30. (9 covers)
    placeRow(10, 0.35, 30, 0.35, 0, 9);
    // East Wall Part 1 (Outer): x=29.65, z=0->6. (2 covers: 34-35)
    placeRow(29.65, 0, 29.65, 6, -Math.PI / 2, 2);
    // Staircase Wall (West facing): x=23.9, z=5->15. (5 covers: 36-40) - Reduced margin for spacing
    placeRow(23.9, 5, 23.9, 15, -Math.PI / 2, 5, 1.0);
    // East Wall Part 2 (Outer): x=29.65, z=14->20. (2 covers: 41-42)
    placeRow(29.65, 14, 29.65, 20, -Math.PI / 2, 2);
    // South Wall (Inner Solid): z=19.65, x: 15->25. (3 covers)
    placeRow(25, 19.65, 15, 19.65, Math.PI, 3);
    // West Wall (Inner Solid): x=10.35, z: 0->10. (4 covers)
    placeRow(10.35, 10, 10.35, 0, Math.PI / 2, 4);

    // Room 3 (SE)
    // East Wall (Outer): x=29.65, z: 20->40. (9 covers)
    placeRow(29.65, 20, 29.65, 40, -Math.PI / 2, 9);
    // South Wall (Outer): z=39.65, x: 10->30. (9 covers)
    placeRow(30, 39.65, 10, 39.65, Math.PI, 9);
    // West Wall (Inner Solid): x=10.35, z: 30->40. (3 covers)
    placeRow(10.35, 40, 10.35, 30, Math.PI / 2, 3);
    // North Wall (Inner Solid): z=20.35, x: 15->25. (4 covers)
    placeRow(15, 20.35, 25, 20.35, 0, 4);

    // Room 4 (SW)
    // South Wall (Outer): z=39.65, x: -10->10. (9 covers)
    placeRow(10, 39.65, -10, 39.65, Math.PI, 9);
    // West Wall (Outer): x=-9.65, z: 20->40. (9 covers)
    placeRow(-9.65, 40, -9.65, 20, Math.PI / 2, 9);
    // North Wall (Inner Solid): z=20.35, x: -5->5. (3 covers)
    placeRow(5, 20.35, -5, 20.35, 0, 3);
    // East Wall (Inner Solid): x=9.65, z: 30->40. (4 covers)
    placeRow(9.65, 30, 9.65, 40, -Math.PI / 2, 4);
}

function checkCollision(newX, newZ, newY = 0) {
    const playerBox = new THREE.Box3();

    // Dynamic Radius: Use smaller radius on and around stairs
    // Stairs area: x: 24-27, z: 5-15
    // Extended zone to z=18 to prevent getting stuck at bottom
    // Smooth transition zone from z=16-18
    let r = CONFIG.collisionRadius;

    if (newX > 23 && newX < 28) {
        if (newZ > 2 && newZ < 16) {
            // On stairs or top landing - use tight radius
            r = CONFIG.stairRadius;
        } else if (newZ >= 16 && newZ < 18) {
            // Transition zone at bottom of stairs - gradually increase radius
            const t = (newZ - 16) / 2; // 0 at z=16, 1 at z=18
            r = CONFIG.stairRadius + (CONFIG.collisionRadius - CONFIG.stairRadius) * t;
        }
    }

    playerBox.min.set(newX - r, newY, newZ - r);
    playerBox.max.set(newX + r, newY + CONFIG.eyeHeight, newZ + r);

    for (const box of state.walls) if (playerBox.intersectsBox(box)) return true;
    for (const box of state.obstacles) if (playerBox.intersectsBox(box)) return true;
    return false;
}

function openOverlay(cover) {
    state.isOverlayOpen = true;
    document.exitPointerLock();

    const coverIndex = cover.userData.id;
    const coverData = typeof COVERS_DATA !== 'undefined' && COVERS_DATA[coverIndex];

    // Use custom data if available, otherwise use defaults
    const title = coverData ? coverData.title : `Magazine Issue #${coverIndex + 1}`;
    const description = coverData ? coverData.description : `This is the special 100th Anniversary Edition cover number ${coverIndex + 1}.`;

    document.getElementById('overlay-title').innerText = title;
    document.getElementById('overlay-desc').innerText = description;

    const container = document.getElementById('overlay-image-container');
    container.innerHTML = '';

    // Generate high-res image for overlay
    const img = document.createElement('img');

    if (coverData) {
        img.src = coverData.highRes;
    } else {
        // Fallback to procedural texture
        const highResTex = createCoverTexture(coverIndex, true);
        img.src = highResTex.image.src || highResTex.image.toDataURL();
    }

    img.style.width = '100%';
    img.style.height = 'auto';
    container.appendChild(img);

    document.getElementById('cover-overlay').classList.remove('hidden');
}

function closeOverlay() {
    state.isOverlayOpen = false;
    document.getElementById('cover-overlay').classList.add('hidden');
    document.body.requestPointerLock();
}

function closeVideo() {
    if (state.isVideoPlaying) {
        const videoIframe = document.getElementById('video-screen');

        // Remove from wall if there
        if (state.css3DObject) cssScene.remove(state.css3DObject);

        // Reset styles (important for next time it starts on wall)
        videoIframe.style.position = '';
        videoIframe.style.top = '';
        videoIframe.style.left = '';
        videoIframe.style.transform = '';
        videoIframe.style.width = '';
        videoIframe.style.height = '';
        videoIframe.style.maxWidth = '';
        videoIframe.style.maxHeight = '';
        videoIframe.style.zIndex = '';
        videoIframe.style.border = '';
        videoIframe.style.boxShadow = '';
        videoIframe.style.pointerEvents = '';

        // Hide and clear
        videoIframe.style.display = 'none';
        videoIframe.src = '';

        // Reset state
        state.isVideoPlaying = false;
        state.isVideoPaused = false;
    }
}

function updateMovement() {
    if (state.isOverlayOpen) {
        // Check for any movement input to close overlay
        if (state.keys.ArrowUp || state.keys.ArrowDown || state.keys.ArrowLeft || state.keys.ArrowRight ||
            state.keys.KeyW || state.keys.KeyS || state.keys.KeyA || state.keys.KeyD ||
            Math.abs(state.joystick.x) > 0.1 || Math.abs(state.joystick.y) > 0.1) {
            closeOverlay();
        }
        return;
    }

    let moveStep = 0;
    // Keyboard Movement
    if (state.keys.ArrowUp || state.keys.KeyW) moveStep = CONFIG.moveSpeed;
    if (state.keys.ArrowDown || state.keys.KeyS) moveStep = -CONFIG.moveSpeed;

    // Joystick Movement
    if (state.joystick.y < -0.3) moveStep = CONFIG.moveSpeed;
    if (state.joystick.y > 0.3) moveStep = -CONFIG.moveSpeed;

    let rotChange = 0;
    // Keyboard Rotation
    if (state.keys.ArrowLeft || state.keys.KeyA) rotChange = CONFIG.rotSpeed;
    if (state.keys.ArrowRight || state.keys.KeyD) rotChange = -CONFIG.rotSpeed;

    // Joystick Rotation (Reduced Sensitivity)
    // Using a lower multiplier for smoother mobile turning
    if (state.joystick.x < -0.6) rotChange = CONFIG.rotSpeed * 0.4;
    if (state.joystick.x > 0.6) rotChange = -CONFIG.rotSpeed * 0.4;

    // If video is playing and user tries to move, close the video
    if (state.isVideoPlaying && (moveStep !== 0 || rotChange !== 0)) {
        closeVideo();
        return; // Don't move this frame, just close video
    }

    // If video is playing, lock movement
    if (state.isVideoPlaying) return;

    player.rot += rotChange;

    if (moveStep !== 0) {
        const nextX = player.x - Math.sin(player.rot) * moveStep;
        const nextZ = player.z - Math.cos(player.rot) * moveStep;

        const targetY = getGroundHeight(nextX, nextZ);

        if (!checkCollision(nextX, nextZ, targetY)) {
            player.x = nextX;
            player.z = nextZ;
            player.y = targetY;
        }
    }

    camera.position.x = player.x;
    camera.position.z = player.z;
    camera.position.y = player.y + CONFIG.eyeHeight;
    camera.rotation.y = player.rot;

    const frustum = new THREE.Frustum();
    frustum.setFromProjectionMatrix(new THREE.Matrix4().multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse));

    state.covers.forEach(cover => {
        if (cover.userData.viewed) return;
        const worldPos = new THREE.Vector3();
        cover.getWorldPosition(worldPos);
        if (worldPos.distanceTo(camera.position) < 8 && frustum.containsPoint(worldPos)) {
            // Raycast check to ensure line of sight
            const raycaster = new THREE.Raycaster();
            const dir = worldPos.clone().sub(camera.position).normalize();
            raycaster.set(camera.position, dir);

            // Intersect with walls and obstacles
            const intersects = raycaster.intersectObjects(scene.children, true);

            // Check if the first intersection is the cover itself (or very close to it)
            if (intersects.length > 0) {
                const firstHit = intersects[0];
                // Allow some tolerance or check if hit object is the cover
                if (firstHit.object === cover || firstHit.distance >= worldPos.distanceTo(camera.position) - 0.5) {
                    cover.userData.viewed = true;
                    state.viewedCovers.add(cover.userData.id);
                    cover.material.emissive.setHex(0x000000);
                    const pct = Math.floor((state.viewedCovers.size / CONFIG.totalCovers) * 100);
                    document.getElementById('completion-rate').innerText = `${pct}%`;
                    document.getElementById('progress-fill').style.width = `${pct}%`;
                }
            }
        }
    });
}

function checkInteraction() {
    if (state.isOverlayOpen) return;

    let closest = null;
    let minDist = CONFIG.interactionDist;

    state.covers.forEach(cover => {
        const worldPos = new THREE.Vector3();
        cover.getWorldPosition(worldPos);
        const dist = worldPos.distanceTo(camera.position);
        if (dist < minDist) {
            const dir = new THREE.Vector3();
            camera.getWorldDirection(dir);
            const toCover = worldPos.clone().sub(camera.position).normalize();
            const dot = dir.dot(toCover);
            if (dot > 0.8) {
                closest = cover;
                minDist = dist;
            }
        }
    });

    // Check interactables (Switch)
    state.interactables.forEach(obj => {
        const dist = obj.position.distanceTo(camera.position);
        if (dist < minDist) {
            const dir = new THREE.Vector3();
            camera.getWorldDirection(dir);
            const toObj = obj.position.clone().sub(camera.position).normalize();
            const dot = dir.dot(toObj);
            if (dot > 0.8) {
                closest = obj;
                minDist = dist;
            }
        }
    });

    if (closest) {
        if (closest.userData.type === 'switch') {
            toggleLights();
        } else if (closest.userData.type === 'remote' || closest.userData.type === 'podcast') {
            const videoId = closest.userData.videoId;

            if (state.isVideoPlaying) {
                // Stop video/podcast
                closeVideo();
            } else {
                // Start video/podcast directly in fullscreen
                const videoIframe = document.getElementById('video-screen');
                videoIframe.src = `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&enablejsapi=1`;
                videoIframe.style.display = 'block';

                // Apply fullscreen styles immediately
                videoIframe.style.position = 'fixed';
                videoIframe.style.top = '50%';
                videoIframe.style.left = '50%';
                videoIframe.style.transform = 'translate(-50%, -50%)';
                videoIframe.style.width = '90vw';
                videoIframe.style.height = '90vh';
                videoIframe.style.maxWidth = '1600px';
                videoIframe.style.maxHeight = '900px';
                videoIframe.style.zIndex = '10000';
                videoIframe.style.border = '4px solid #e30613';
                videoIframe.style.boxShadow = '0 0 50px rgba(227, 6, 19, 0.8)';
                videoIframe.style.pointerEvents = 'auto';

                state.isVideoPlaying = true;
                state.isVideoPaused = false;

                // Release pointer lock when video starts
                document.exitPointerLock();
            }
        } else {
            openOverlay(closest);
        }
    }
}

function updateInteractionPrompt() {
    if (state.isOverlayOpen) {
        document.getElementById('interaction-prompt').classList.add('hidden');
        return;
    }

    let closest = null;
    let minDist = CONFIG.interactionDist;

    state.covers.forEach(cover => {
        const worldPos = new THREE.Vector3();
        cover.getWorldPosition(worldPos);
        const dist = worldPos.distanceTo(camera.position);
        if (dist < minDist) {
            const dir = new THREE.Vector3();
            camera.getWorldDirection(dir);
            const toCover = worldPos.clone().sub(camera.position).normalize();
            const dot = dir.dot(toCover);
            if (dot > 0.8) {
                closest = cover;
                minDist = dist;
            }
        }
    });

    state.interactables.forEach(obj => {
        const dist = obj.position.distanceTo(camera.position);
        if (dist < minDist) {
            const dir = new THREE.Vector3();
            camera.getWorldDirection(dir);
            const toObj = obj.position.clone().sub(camera.position).normalize();
            const dot = dir.dot(toObj);
            if (dot > 0.8) {
                closest = obj;
                minDist = dist;
            }
        }
    });

    if (state.keys.ArrowDown || state.keys.KeyS) moveStep = -CONFIG.moveSpeed;

    // Joystick Movement
    if (state.joystick.y < -0.3) moveStep = CONFIG.moveSpeed;
    if (state.joystick.y > 0.3) moveStep = -CONFIG.moveSpeed;

    let rotChange = 0;
    // Keyboard Rotation
    if (state.keys.ArrowLeft || state.keys.KeyA) rotChange = CONFIG.rotSpeed;
    if (state.keys.ArrowRight || state.keys.KeyD) rotChange = -CONFIG.rotSpeed;

    // Joystick Rotation (Reduced Sensitivity)
    // Using a lower multiplier for smoother mobile turning
    if (state.joystick.x < -0.6) rotChange = CONFIG.rotSpeed * 0.4;
    if (state.joystick.x > 0.6) rotChange = -CONFIG.rotSpeed * 0.4;

    // If video is playing and user tries to move, close the video
    if (state.isVideoPlaying && (moveStep !== 0 || rotChange !== 0)) {
        closeVideo();
        return; // Don't move this frame, just close video
    }

    // If video is playing, lock movement
    if (state.isVideoPlaying) return;

    player.rot += rotChange;

    if (moveStep !== 0) {
        const nextX = player.x - Math.sin(player.rot) * moveStep;
        const nextZ = player.z - Math.cos(player.rot) * moveStep;

        const targetY = getGroundHeight(nextX, nextZ);

        if (!checkCollision(nextX, nextZ, targetY)) {
            player.x = nextX;
            player.z = nextZ;
            player.y = targetY;
        }
    }

    camera.position.x = player.x;
    camera.position.z = player.z;
    camera.position.y = player.y + CONFIG.eyeHeight;
    camera.rotation.y = player.rot;

    const frustum = new THREE.Frustum();
    frustum.setFromProjectionMatrix(new THREE.Matrix4().multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse));

    state.covers.forEach(cover => {
        if (cover.userData.viewed) return;
        const worldPos = new THREE.Vector3();
        cover.getWorldPosition(worldPos);
        if (worldPos.distanceTo(camera.position) < 8 && frustum.containsPoint(worldPos)) {
            // Raycast check to ensure line of sight
            const raycaster = new THREE.Raycaster();
            const dir = worldPos.clone().sub(camera.position).normalize();
            raycaster.set(camera.position, dir);

            // Intersect with walls and obstacles
            const intersects = raycaster.intersectObjects(scene.children, true);

            // Check if the first intersection is the cover itself (or very close to it)
            if (intersects.length > 0) {
                const firstHit = intersects[0];
                // Allow some tolerance or check if hit object is the cover
                if (firstHit.object === cover || firstHit.distance >= worldPos.distanceTo(camera.position) - 0.5) {
                    cover.userData.viewed = true;
                    state.viewedCovers.add(cover.userData.id);
                    cover.material.emissive.setHex(0x000000);
                    const pct = Math.floor((state.viewedCovers.size / CONFIG.totalCovers) * 100);
                    document.getElementById('completion-rate').innerText = `${pct}%`;
                    document.getElementById('progress-fill').style.width = `${pct}%`;
                }
            }
        }
    });
}

function checkInteraction() {
    if (state.isOverlayOpen) return;

    let closest = null;
    let minDist = CONFIG.interactionDist;

    state.covers.forEach(cover => {
        const worldPos = new THREE.Vector3();
        cover.getWorldPosition(worldPos);
        const dist = worldPos.distanceTo(camera.position);
        if (dist < minDist) {
            const dir = new THREE.Vector3();
            camera.getWorldDirection(dir);
            const toCover = worldPos.clone().sub(camera.position).normalize();
            const dot = dir.dot(toCover);
            if (dot > 0.8) {
                closest = cover;
                minDist = dist;
            }
        }
    });

    // Check interactables (Switch)
    state.interactables.forEach(obj => {
        const dist = obj.position.distanceTo(camera.position);
        if (dist < minDist) {
            const dir = new THREE.Vector3();
            camera.getWorldDirection(dir);
            const toObj = obj.position.clone().sub(camera.position).normalize();
            const dot = dir.dot(toObj);
            if (dot > 0.8) {
                closest = obj;
                minDist = dist;
            }
        }
    });

    if (closest) {
        if (closest.userData.type === 'switch') {
            toggleLights();
        } else if (closest.userData.type === 'remote' || closest.userData.type === 'podcast') {
            const videoId = closest.userData.videoId;

            if (state.isVideoPlaying) {
                // Stop video/podcast
                closeVideo();
            } else {
                // Start video/podcast directly in fullscreen
                const videoIframe = document.getElementById('video-screen');
                videoIframe.src = `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&enablejsapi=1`;
                videoIframe.style.display = 'block';

                // Apply fullscreen styles immediately
                videoIframe.style.position = 'fixed';
                videoIframe.style.top = '50%';
                videoIframe.style.left = '50%';
                videoIframe.style.transform = 'translate(-50%, -50%)';
                videoIframe.style.width = '90vw';
                videoIframe.style.height = '90vh';
                videoIframe.style.maxWidth = '1600px';
                videoIframe.style.maxHeight = '900px';
                videoIframe.style.zIndex = '10000';
                videoIframe.style.border = '4px solid #e30613';
                videoIframe.style.boxShadow = '0 0 50px rgba(227, 6, 19, 0.8)';
                videoIframe.style.pointerEvents = 'auto';

                state.isVideoPlaying = true;
                state.isVideoPaused = false;

                // Release pointer lock when video starts
                document.exitPointerLock();
            }
        } else {
            openOverlay(closest);
        }
    }
}

function updateInteractionPrompt() {
    if (state.isOverlayOpen) {
        document.getElementById('interaction-prompt').classList.add('hidden');
        return;
    }

    let closest = null;
    let minDist = CONFIG.interactionDist;

    state.covers.forEach(cover => {
        const worldPos = new THREE.Vector3();
        cover.getWorldPosition(worldPos);
        const dist = worldPos.distanceTo(camera.position);
        if (dist < minDist) {
            const dir = new THREE.Vector3();
            camera.getWorldDirection(dir);
            const toCover = worldPos.clone().sub(camera.position).normalize();
            const dot = dir.dot(toCover);
            if (dot > 0.8) {
                closest = cover;
                minDist = dist;
            }
        }
    });

    state.interactables.forEach(obj => {
        const dist = obj.position.distanceTo(camera.position);
        if (dist < minDist) {
            const dir = new THREE.Vector3();
            camera.getWorldDirection(dir);
            const toObj = obj.position.clone().sub(camera.position).normalize();
            const dot = dir.dot(toObj);
            if (dot > 0.8) {
                closest = obj;
                minDist = dist;
            }
        }
    });

    const prompt = document.getElementById('interaction-prompt');
    if (closest) {
        if (closest.userData.type === 'switch') {
            if (CONFIG.lightsOn) {
                prompt.innerText = 'Dimme das Licht';
            } else {
                prompt.innerText = 'Mehr Licht';
            }
        } else if (closest.userData.type === 'remote') {
            prompt.innerText = state.isVideoPlaying ? 'Video stoppen' : 'Video abspielen';
        } else if (closest.userData.type === 'podcast') {
            prompt.innerText = state.isVideoPlaying ? 'Podcast stoppen' : 'Podcast anhören';
        } else {
            prompt.innerText = 'Ansehen';
        }
        prompt.classList.remove('hidden');
    } else {
        prompt.classList.add('hidden');
    }
}

function animate() {
    requestAnimationFrame(animate);
    updateMovement();
    updateInteractionPrompt();
    if (composer) {
        composer.render();
    } else {
        renderer.render(scene, camera);
    }
    cssRenderer.render(cssScene, camera);
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    if (composer) composer.setSize(window.innerWidth, window.innerHeight);
    cssRenderer.setSize(window.innerWidth, window.innerHeight);
}


// Post-Processing Global
let composer;

init();
