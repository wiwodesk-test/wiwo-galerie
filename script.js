// 3D Art Gallery - Fixed Navigation and Cover Placement

// Detect iOS
const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);

const CONFIG = {
    moveSpeed: 0.07, // Reduced from 0.10
    rotSpeed: 0.02,
    wallHeight: 5,
    wallThickness: 0.5,
    roomSize: 20,
    collisionRadius: 0.5, // Reduced for easier navigation around plants and benches
    stairRadius: 0.3, // Very tight radius for smooth stair navigation
    eyeHeight: 1.7,
    totalCovers: 100,
    interactionDist: 3.0,
    lightsOn: true // Default to Bright (Standard) mode
};

// Function to load cover data from CSV
function loadCoversFromCSV() {
    fetch('covers.csv')
        .then(response => response.text())
        .then(text => {
            const lines = text.split('\n');
            // Skip header (row 0)
            for (let i = 1; i < lines.length; i++) {
                const line = lines[i].trim();
                if (!line) continue;

                // Simple parsing: split by first two commas to get ID and Title, rest is Description
                const firstComma = line.indexOf(',');
                const secondComma = line.indexOf(',', firstComma + 1);

                if (firstComma !== -1 && secondComma !== -1) {
                    const numStr = line.substring(0, firstComma);
                    const title = line.substring(firstComma + 1, secondComma);
                    const description = line.substring(secondComma + 1);

                    const id = parseInt(numStr) - 1; // 1-based CSV to 0-based Array

                    if (id >= 0 && id < CONFIG.totalCovers && typeof COVERS_DATA !== 'undefined' && COVERS_DATA[id]) {
                        COVERS_DATA[id].title = title;
                        COVERS_DATA[id].description = description;
                    }
                }
            }
            console.log('✅ Loaded cover data from CSV');
        })
        .catch(err => console.warn('⚠️ Could not load covers.csv, using defaults:', err));
}

// Start loading CSV immediately
// loadCoversFromCSV(); // Data is now pre-loaded in covers-data.js
console.log('✅ Covers successfully loaded from static data file');

const state = {
    viewedCovers: new Set(),
    openedCovers: new Set(), // Track covers that have had overlay opened
    keys: { ArrowUp: false, ArrowDown: false, ArrowLeft: false, ArrowRight: false, KeyW: false, KeyS: false, KeyA: false, KeyD: false },
    walls: [],
    wallMeshes: [],
    obstacles: [],
    covers: [],
    interactables: [],
    isOverlayOpen: false,
    currentCoverId: null,
    lastClosedCoverId: null,
    textureLoader: new THREE.TextureLoader(),
    loadingManager: new THREE.LoadingManager(),
    texturesLoaded: 0,
    totalTextures: 0,
    galleryReady: false,
    isVideoPlaying: false,
    isVideoPaused: false,
    css3DObject: null,
    joystick: { x: 0, y: 0 },
    lazyTextureLoader: new THREE.TextureLoader(), // Unmanaged loader
    // Progressive loading
    assetLoadingProgress: 0,
    totalAssets: 0,
    loadedAssets: 0,
    highResCache: new Map(), // Cache for high-res overlay images
    lowResCache: new Map(), // Cache for low-res cover textures
    materials: {}, // Cache for materials to update with textures later
    experienceStarted: false, // Flag to track if user has started the experience
    achievements: {
        lightFound: false,
        firstFound: false,
        floorFound: false,
        fiveCoversOpened: false,
        treasureFound: false,
        allCoversOpened: false
    },
    // First success screen tracking
    navigationStartTime: null,
    hasNavigated: false,
    firstSuccessShown: false,
    lastAchievementClosed: 0, // Timestamp to prevent immediate interaction after closing achievement
    treasureOpened: false // Flag to prevent treasure chest from auto-reopening
};

function unlockAchievement(id) {
    if (state.achievements[id]) return; // Already unlocked
    state.achievements[id] = true;

    const achievementData = {
        lightFound: {
            elementId: 'achievement-light',
            icon: '💡',
            title: 'Lichtschalter gefunden!',
            text: ''
        },
        firstFound: {
            elementId: 'achievement-first',
            icon: '📰',
            title: 'Erstausgabe gefunden!',
            text: 'Gehe näher, um sie zu betrachten'
        },
        fiveCoversOpened: {
            elementId: 'achievement-five',
            icon: '🎯',
            title: '5 Titelseiten betrachtet!',
            text: 'Du hast bereits 5 Cover genauer angesehen'
        },
        floorFound: {
            elementId: 'achievement-floor',
            icon: '🏛️',
            title: '1. Etage erreicht!',
            text: 'Jetzt schaue dir das Video an'
        },
        treasureFound: {
            elementId: 'achievement-treasure',
            icon: '🎁',
            title: 'Schatztruhe gefunden!',
            text: ''
        },
        allCoversOpened: {
            elementId: 'achievement-all',
            icon: '🏆',
            title: 'Alle Titelseiten betrachtet!',
            text: 'Du hast alle 100 Cover angesehen'
        }
    }[id];

    if (!achievementData) return;

    // Update achievement in UI
    const el = document.getElementById(achievementData.elementId);
    if (el) {
        el.classList.add('unlocked');
        const check = el.querySelector('.achievement-check');
        if (check) check.innerText = '☑';
    }

    // Special handling for achievements with custom screens
    if (id === 'lightFound') {
        const lightScreen = document.getElementById('light-success-screen');
        if (lightScreen) {
            lightScreen.classList.remove('hidden');
        }
        return;
    }

    if (id === 'fiveCoversOpened') {
        const fiveCoversScreen = document.getElementById('five-covers-screen');
        if (fiveCoversScreen) {
            fiveCoversScreen.classList.remove('hidden');
        }
        return;
    }

    if (id === 'floorFound') {
        const floorScreen = document.getElementById('floor-success-screen');
        if (floorScreen) {
            floorScreen.classList.remove('hidden');
        }
        return;
    }

    if (id === 'treasureFound') {
        // Handled by checkInteraction showing #treasure-screen
        return;
    }

    if (id === 'allCoversOpened') {
        // Show final screen
        const finalScreen = document.getElementById('final-screen');
        if (finalScreen) {
            finalScreen.classList.remove('hidden');
        }
        return;
    }

    if (id === 'firstFound') {
        // Show achievement screen for first cover
        const achievementScreen = document.getElementById('achievement-screen');
        if (achievementScreen) {
            achievementScreen.classList.remove('hidden');
        }
        return;
    }

    // Show notification toast for others (if any)
    showAchievementNotification(achievementData.icon, achievementData.title, achievementData.text);
}

// Setup loading manager callbacks (Optional now, but kept for debug)
state.loadingManager.onStart = function (url, itemsLoaded, itemsTotal) {
    state.totalTextures = itemsTotal;
};

state.loadingManager.onLoad = function () {
    // console.log('✅ All initial assets loaded');
    const loadingText = document.querySelector('.loading-text');
    if (loadingText) {
        loadingText.innerText = 'Lade Galerie ... 100%';
    }
    // Wait a moment to let the user see "100%"
    setTimeout(() => {
        state.galleryReady = true;
        hideLoadingScreen();
    }, 500);
};

state.loadingManager.onProgress = function (url, itemsLoaded, itemsTotal) {
    state.texturesLoaded = itemsLoaded;
    // console.log(`Loading: ${itemsLoaded}/${itemsTotal} (${url})`);
    const loadingText = document.querySelector('.loading-text');
    if (loadingText) {
        // Ensure we don't show > 100%
        const pct = Math.min(100, Math.round((itemsLoaded / itemsTotal) * 100));
        loadingText.innerText = `Lade Galerie ... ${pct}%`;
    }
};

state.loadingManager.onError = function (url) {
    // console.error('❌ Error loading texture:', url);
};

// Use loading manager for texture loader (Legacy/Blocking if needed)
state.textureLoader = new THREE.TextureLoader(state.loadingManager);

// Create and manage asset loading progress bar
function createAssetProgressBar() {
    const progressBar = document.createElement('div');
    progressBar.id = 'asset-progress-bar';
    progressBar.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 2px;
        background: rgba(255, 255, 255, 0.05);
        z-index: 9998;
        transition: opacity 0.3s ease;
        opacity: 0;
        pointer-events: none;
    `;

    const progressFill = document.createElement('div');
    progressFill.id = 'asset-progress-fill';
    progressFill.style.cssText = `
        height: 100%;
        background: linear-gradient(90deg, #C5A059 0%, #E5C079 100%);
        width: 0%;
        transition: width 0.3s ease;
        box-shadow: 0 0 10px #C5A059;
    `;

    progressBar.appendChild(progressFill);
    document.body.appendChild(progressBar);

    return progressBar;
}

function showAssetProgressBar() {
    let progressBar = document.getElementById('asset-progress-bar');
    if (!progressBar) {
        progressBar = createAssetProgressBar();
    }
    progressBar.style.opacity = '1';
}

function hideAssetProgressBar() {
    const progressBar = document.getElementById('asset-progress-bar');
    if (progressBar) {
        setTimeout(() => {
            progressBar.style.opacity = '0';
        }, 500);
    }
}

function updateAssetProgress(loaded, total) {
    state.loadedAssets = loaded;
    state.totalAssets = total;
    const progress = total > 0 ? (loaded / total) * 100 : 0;

    const progressFill = document.getElementById('asset-progress-fill');
    if (progressFill) {
        progressFill.style.width = `${progress}%`;
    }

    if (loaded >= total && total > 0) {
        hideAssetProgressBar();
    }
}

function hideLoadingScreen() {
    // If experience has already started, do NOT show welcome screen again
    if (state.experienceStarted) return;

    const loadingScreen = document.getElementById('loading-screen');
    const welcomeScreen = document.getElementById('welcome-screen');
    const uiLayer = document.getElementById('ui-layer');

    if (loadingScreen) {
        loadingScreen.classList.add('hidden');
    }

    if (welcomeScreen) {
        welcomeScreen.classList.remove('hidden');
    }

    // Hide UI layer while welcome screen is visible
    if (uiLayer) {
        uiLayer.classList.add('hidden');
    }
}

function startExperience() {
    state.experienceStarted = true;
    const welcomeScreen = document.getElementById('welcome-screen');
    const uiLayer = document.getElementById('ui-layer');

    if (welcomeScreen) {
        welcomeScreen.classList.add('hidden');
    }

    // Show UI layer
    if (uiLayer) {
        uiLayer.classList.remove('hidden');
    }

    // Ensure gallery is marked ready
    state.galleryReady = true;

    // Show subtle progress bar for remaining assets
    showAssetProgressBar();

    // Request pointer lock (not supported on iOS)
    if (!isIOS && document.body.requestPointerLock) {
        document.body.requestPointerLock();
    }
}


let scene, camera, renderer, cssScene, cssRenderer;
// Spawn player at (5, 6) facing Southwest
let player = { x: 5, y: 0, z: 6, rot: Math.PI * 0.25 };

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
    // Ensure loading screen is visible immediately
    const loadingScreen = document.getElementById('loading-screen');
    if (loadingScreen) loadingScreen.classList.remove('hidden');

    // console.log('🚀 Init started');
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x87ceeb); // Sky blue background
    scene.fog = new THREE.Fog(0xb0d4f1, 10, 100); // Light blue fog for spring day

    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

    // Detect low-performance devices (e.g., tablets with limited GPU)
    const isLowPerf = (() => {
        const ua = navigator.userAgent || '';
        const isAndroid = /Android/i.test(ua);
        const isTablet = /Tablet/i.test(ua) || (isAndroid && !/Mobile/i.test(ua));
        const isSamsung = /Samsung/i.test(ua) || /SM-/i.test(ua);

        // Aggressively flag Samsung Tablets as low perf due to reported issues
        if (isSamsung && isTablet) return true;

        // Check for low memory (increased threshold to 4GB as 2-3GB devices often struggle)
        const lowMemory = navigator.deviceMemory && navigator.deviceMemory < 4;

        // Check for small screens (old phones)
        const smallScreen = Math.min(window.innerWidth, window.innerHeight) < 800;

        return (isAndroid && isTablet) || lowMemory || smallScreen;
    })();

    // Artificial start to prevent premature onLoad if queue is empty initially
    state.loadingManager.itemStart('initial-setup');

    renderer = new THREE.WebGLRenderer({
        antialias: true,
        powerPreference: isLowPerf ? "default" : "high-performance",
        stencil: false
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    // Reduce pixel ratio on low-performance devices to improve frame rate
    renderer.setPixelRatio(isLowPerf ? 1 : Math.min(window.devicePixelRatio, 2));
    // Disable shadows on low-performance devices to improve frame rate
    renderer.shadowMap.enabled = !isLowPerf;
    // Use lower shadow map resolution on low-performance devices
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.outputEncoding = THREE.sRGBEncoding;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    renderer.physicallyCorrectLights = true;
    document.getElementById('canvas-container').appendChild(renderer.domElement);
    // Store flag for later use
    state.isLowPerf = isLowPerf;

    // CSS3D Renderer for YouTube video
    cssScene = new THREE.Scene();
    cssRenderer = new THREE.CSS3DRenderer();
    cssRenderer.setSize(window.innerWidth, window.innerHeight);
    cssRenderer.domElement.style.position = 'absolute';
    cssRenderer.domElement.style.top = '0';
    cssRenderer.domElement.style.pointerEvents = 'none';
    document.getElementById('canvas-container').appendChild(cssRenderer.domElement);

    // console.log('🏗️ Building gallery...');
    try {
        buildGallery();
        // console.log('✅ Gallery built. Scene children:', scene.children.length);
    } catch (e) {
        // console.error('❌ Error building gallery:', e);
    }

    // console.log('💡 Setting up lighting...');
    setupLighting();
    createSkybox();
    createLightSwitch();

    // console.log('🎨 Loading high-quality assets...');
    loadHighQualityAssets();

    // Release the artificial lock
    state.loadingManager.itemEnd('initial-setup');

    window.addEventListener('resize', onWindowResize, false);

    document.body.addEventListener('click', () => {
        const welcomeScreen = document.getElementById('welcome-screen');
        const isWelcomeVisible = welcomeScreen && !welcomeScreen.classList.contains('hidden');
        if (!state.isOverlayOpen && !isWelcomeVisible) document.body.requestPointerLock();
    });

    document.addEventListener('keydown', (e) => {
        // Start experience on any key press (except arrows) if welcome screen is visible
        const welcomeScreen = document.getElementById('welcome-screen');
        if (welcomeScreen && !welcomeScreen.classList.contains('hidden')) {
            if (!['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.code)) {
                startExperience();
            }
            return;
        }

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
    document.getElementById('video-close-btn').addEventListener('click', (e) => {
        e.stopPropagation();
        closeVideo();
    });
    document.getElementById('video-close-btn').addEventListener('touchstart', (e) => {
        e.preventDefault(); // Prevent ghost clicks
        e.stopPropagation();
        closeVideo();
    });

    const startBtn = document.getElementById('start-btn');
    if (startBtn) {
        startBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            startExperience();
        });
    }

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

    // Video close button
    document.getElementById('video-close-btn').addEventListener('click', () => {
        closeVideo();
    });
    document.getElementById('video-close-btn').addEventListener('touchstart', (e) => {
        e.preventDefault();
        closeVideo();
    });

    // Overlay close button
    document.getElementById('close-btn').addEventListener('click', () => {
        closeOverlay();
    });
    document.getElementById('close-btn').addEventListener('touchstart', (e) => {
        e.preventDefault();
        closeOverlay();
    });
    // Force hide loading screen after 5 seconds just in case
    setTimeout(() => {
        if (!state.galleryReady) {
            // Loading timed out
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

        // Only enable heavy post‑processing on capable devices
        if (!state.isLowPerf) {
            composer = new THREE.EffectComposer(renderer);
            composer.addPass(renderScene);
            composer.addPass(ssaoPass);
            composer.addPass(bloomPass);
            composer.addPass(filmGrainPass);
            composer.addPass(vignettePass);
        } else {
            composer = null; // Fallback to plain renderer
        }

        // Animate film grain only when post‑processing is active
        if (!state.isLowPerf) {
            setInterval(() => {
                if (filmGrainPass.uniforms.time) {
                    filmGrainPass.uniforms.time.value += 0.016;
                }
            }, 16);
        }

    } catch (e) {
        // Post-processing failed
        composer = null;
    }

    // Preload high-res images in background with progress tracking
    function preloadHighResImages() {
        // Skip high-res preloading on low-performance devices
        if (state.isLowPerf) return;
        if (typeof COVERS_DATA === 'undefined') return;

        let loaded = 0;
        const total = CONFIG.totalCovers;

        for (let i = 0; i < CONFIG.totalCovers; i++) {
            if (COVERS_DATA[i] && COVERS_DATA[i].highRes) {
                const img = new Image();
                img.onload = () => {
                    state.highResCache.set(i, COVERS_DATA[i].highRes);
                    loaded++;
                    updateAssetProgress(loaded, total);
                };
                img.onerror = () => {
                    // Count errors as loaded to keep progress moving
                    loaded++;
                    updateAssetProgress(loaded, total);
                };
                img.src = COVERS_DATA[i].highRes;
            } else {
                // No high-res for this cover, count as loaded
                loaded++;
                updateAssetProgress(loaded, total);
            }
        }
    }

    function onKeyDown(e) {
        // Block all input when achievement or success screens are visible
        const firstSuccessScreen = document.getElementById('first-success-screen');
        const achievementScreen = document.getElementById('achievement-screen');
        if ((firstSuccessScreen && !firstSuccessScreen.classList.contains('hidden')) ||
            (achievementScreen && !achievementScreen.classList.contains('hidden'))) {
            return; // Let the DOMContentLoaded listener handle these screens
        }

        // Video controls take priority
        if (state.isVideoPlaying) {
            if (['Escape', 'Enter', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'KeyW', 'KeyS', 'KeyA', 'KeyD'].includes(e.code)) {
                e.preventDefault();
                closeVideo();
                return;
            }
            // Space toggles pause/play (only for YouTube for now, others use native controls)
            if (e.code === 'Space' && state.playingVideoType === 'youtube') {
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

        // Close overlay with Escape or any navigation key except forward (W/ArrowUp)
        if (state.isOverlayOpen) {
            if (e.code === 'Escape' || ['ArrowDown', 'ArrowLeft', 'ArrowRight', 'KeyS', 'KeyA', 'KeyD'].includes(e.code)) {
                e.preventDefault();
                closeOverlay();
                return;
            }
        }

        if (e.code === 'Enter') {
            // console.log('⌨️  Enter key pressed!');
            checkInteraction();
        }
    }

    function setupLighting() {
        // Initialize with BRIGHT MODE (Standard) values
        const hemiLight = new THREE.HemisphereLight(0xffffff, 0x888888, 1.2);
        hemiLight.position.set(0, 20, 0);
        hemiLight.name = 'mainHemi';
        scene.add(hemiLight);

        const dirLight = new THREE.DirectionalLight(0xffffff, 1.5);
        dirLight.position.set(10, 30, 10);
        dirLight.castShadow = true;

        // Configure shadow properties
        dirLight.shadow.mapSize.width = 2048;
        dirLight.shadow.mapSize.height = 2048;
        dirLight.shadow.camera.near = 0.5;
        dirLight.shadow.camera.far = 500;
        dirLight.shadow.camera.left = -50;
        dirLight.shadow.camera.right = 50;
        dirLight.shadow.camera.top = 50;
        dirLight.shadow.camera.bottom = -50;

        scene.add(dirLight);
    }

    function createLightSwitch() {
        // Light switch housing
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

    function toggleLights() {
        CONFIG.lightsOn = !CONFIG.lightsOn;

        // Toggle between Bright (Standard) and Darker (Switched) modes
        scene.traverse((obj) => {
            if (obj.isLight) {
                if (obj.name === 'mainHemi') {
                    // Hemisphere light
                    if (CONFIG.lightsOn) {
                        // Bright Mode (Standard) - Very bright
                        obj.color.setHex(0xffffff);
                        obj.groundColor.setHex(0x888888);
                        obj.intensity = 1.2;
                    } else {
                        // Darker Mode (Switched) - Warm and cozy
                        obj.color.setHex(0xfff0e0);
                        obj.groundColor.setHex(0x444444);
                        obj.intensity = 0.5;
                    }
                } else if (obj.isDirectionalLight) {
                    // Directional light
                    if (CONFIG.lightsOn) {
                        // Bright Mode (Standard) - Very bright
                        obj.color.setHex(0xffffff);
                        obj.intensity = 1.5;
                    } else {
                        // Darker Mode (Switched) - Warm
                        obj.color.setHex(0xffdcb4);
                        obj.intensity = 0.8;
                    }
                } else if (obj.isPointLight || obj.isSpotLight) {
                    // Point/spot lights
                    obj.intensity = CONFIG.lightsOn ? 1.5 : 1.0;
                }
            }
        });

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
        // STRUCTURE FIRST - Placeholders
        const floorMat = new THREE.MeshStandardMaterial({
            color: 0xaaaaaa,
            roughness: 0.25,
            metalness: 0.05
        });
        state.materials.floor = floorMat;

        const ceilingMat = new THREE.MeshStandardMaterial({
            color: 0x555555,
            roughness: 0.85,
            metalness: 0.0
        });
        state.materials.ceiling = ceilingMat;

        const wallMat = new THREE.MeshStandardMaterial({
            color: 0xe0e0e0,
            roughness: 0.85,
            metalness: 0.0
        });
        state.materials.wall = wallMat;

        const lightMat = new THREE.MeshBasicMaterial({ color: 0xffffee });
        const wallGeo = new THREE.BoxGeometry(1, CONFIG.wallHeight, 1);

        function addWall(x, z, width, depth) {
            const wall = new THREE.Mesh(wallGeo, wallMat);
            wall.position.set(x, CONFIG.wallHeight / 2, z);
            wall.scale.set(width, 1, depth);
            wall.castShadow = true;
            wall.receiveShadow = true;
            wall.receiveShadow = true;
            scene.add(wall);
            state.walls.push(new THREE.Box3().setFromObject(wall));
            if (state.wallMeshes) state.wallMeshes.push(wall);
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
        const stepMat = new THREE.MeshStandardMaterial({
            color: 0xaaaaaa,
            roughness: 0.25
        });
        state.materials.steps = stepMat;

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
        table.position.set(0, 5 + 0.5, 10); // y=5 is floor, +0.5 for half table height
        scene.add(table);
        state.obstacles.push(new THREE.Box3().setFromObject(table));

        // Professional Headphones with Podcast Functionality

        function createHeadphones(x, y, z, podcastId, podcastTitle) {
            const group = new THREE.Group();

            // Professional materials
            const metalMat = new THREE.MeshStandardMaterial({
                color: 0x2a2a2a,
                metalness: 0.8,
                roughness: 0.2
            });

            const plasticMat = new THREE.MeshStandardMaterial({
                color: 0x1a1a1a,
                metalness: 0.1,
                roughness: 0.4
            });

            const cushionMat = new THREE.MeshStandardMaterial({
                color: 0x0a0a0a,
                roughness: 0.9,
                metalness: 0
            });

            const accentMat = new THREE.MeshStandardMaterial({
                color: 0xC5A059, // Gold accent
                metalness: 0.9,
                roughness: 0.1
            });

            // === STAND ===
            // Weighted base
            const baseGeo = new THREE.CylinderGeometry(0.12, 0.14, 0.03, 32);
            const base = new THREE.Mesh(baseGeo, metalMat);
            base.position.y = 0.015;
            group.add(base);

            // Main stand pole
            const poleGeo = new THREE.CylinderGeometry(0.018, 0.022, 0.35, 16);
            const pole = new THREE.Mesh(poleGeo, metalMat);
            pole.position.y = 0.205;
            group.add(pole);

            // Stand top (headband rest)
            const standTopGeo = new THREE.CylinderGeometry(0.025, 0.018, 0.04, 16);
            const standTop = new THREE.Mesh(standTopGeo, metalMat);
            standTop.position.y = 0.4;
            group.add(standTop);

            // Decorative ring on pole
            const ringGeo = new THREE.TorusGeometry(0.03, 0.008, 8, 16);
            const ring = new THREE.Mesh(ringGeo, accentMat);
            ring.rotation.x = Math.PI / 2;
            ring.position.y = 0.1;
            group.add(ring);

            // === HEADBAND ===
            // Main curved headband (arc)
            const headbandCurve = new THREE.EllipseCurve(
                0, 0,
                0.14, 0.14,
                Math.PI, 0,
                false,
                0
            );
            const points = headbandCurve.getPoints(50);
            const headbandPath = new THREE.CatmullRomCurve3(
                points.map(p => new THREE.Vector3(p.x, p.y, 0))
            );

            const headbandGeo = new THREE.TubeGeometry(headbandPath, 50, 0.012, 8, false);
            const headband = new THREE.Mesh(headbandGeo, plasticMat);
            headband.rotation.z = Math.PI / 2;
            headband.position.y = 0.42;
            group.add(headband);

            // Inner padding on headband
            const paddingGeo = new THREE.TubeGeometry(headbandPath, 50, 0.015, 8, false);
            const padding = new THREE.Mesh(paddingGeo, cushionMat);
            padding.rotation.z = Math.PI / 2;
            padding.position.set(0, 0.42, -0.005);
            padding.scale.set(0.9, 0.9, 0.5);
            group.add(padding);

            // === EAR CUPS (Left and Right) ===
            const createEarCup = (side) => {
                const cupGroup = new THREE.Group();
                const xPos = side === 'left' ? -0.14 : 0.14;

                // Yoke (connecting arm from headband)
                const yokeGeo = new THREE.BoxGeometry(0.015, 0.08, 0.025);
                const yoke = new THREE.Mesh(yokeGeo, metalMat);
                yoke.position.set(xPos, 0.38, 0);
                cupGroup.add(yoke);

                // Swivel joint
                const swivelGeo = new THREE.SphereGeometry(0.02, 16, 16);
                const swivel = new THREE.Mesh(swivelGeo, metalMat);
                swivel.position.set(xPos, 0.34, 0);
                cupGroup.add(swivel);

                // Outer cup housing (main body)
                const cupBodyGeo = new THREE.CylinderGeometry(0.065, 0.07, 0.06, 32);
                const cupBody = new THREE.Mesh(cupBodyGeo, plasticMat);
                cupBody.rotation.z = Math.PI / 2;
                cupBody.position.set(xPos, 0.34, 0);
                cupGroup.add(cupBody);

                // Mesh grille (speaker cover)
                const grilleGeo = new THREE.CylinderGeometry(0.05, 0.05, 0.005, 32);
                const grilleMat = new THREE.MeshStandardMaterial({
                    color: 0x0a0a0a,
                    metalness: 0.6,
                    roughness: 0.4
                });
                const grille = new THREE.Mesh(grilleGeo, grilleMat);
                grille.rotation.z = Math.PI / 2;
                grille.position.set(xPos, 0.34, side === 'left' ? 0.031 : -0.031);
                cupGroup.add(grille);

                // Ear cushion (memory foam)
                const cushionGeo = new THREE.TorusGeometry(0.055, 0.015, 16, 32);
                const cushion = new THREE.Mesh(cushionGeo, cushionMat);
                cushion.rotation.y = Math.PI / 2;
                cushion.position.set(xPos, 0.34, side === 'left' ? 0.035 : -0.035);
                cupGroup.add(cushion);

                // Brand logo (gold accent)
                const logoGeo = new THREE.CircleGeometry(0.015, 16);
                const logo = new THREE.Mesh(logoGeo, accentMat);
                logo.rotation.y = side === 'left' ? -Math.PI / 2 : Math.PI / 2;
                logo.position.set(xPos, 0.36, side === 'left' ? -0.031 : 0.031);
                cupGroup.add(logo);

                // Detail ring around cup
                const detailRingGeo = new THREE.TorusGeometry(0.068, 0.003, 8, 32);
                const detailRing = new THREE.Mesh(detailRingGeo, accentMat);
                detailRing.rotation.y = Math.PI / 2;
                detailRing.position.set(xPos, 0.34, 0);
                cupGroup.add(detailRing);

                return cupGroup;
            };

            const leftCup = createEarCup('left');
            group.add(leftCup);

            const rightCup = createEarCup('right');
            group.add(rightCup);

            // Position the entire headphone set
            group.position.set(x, y, z);
            group.userData = {
                type: 'podcast',
                videoSrc: podcastId, // Use videoSrc for Brightcove URL
                title: podcastTitle
            };

            scene.add(group);
            state.interactables.push(group);
        }

        // Create two podcast headphones on the table
        // Create two podcast headphones on the table
        const podcastBrightcoveUrl = 'https://players.brightcove.net/1050888054001/default_default/index.html?videoId=6388672410112&autoplay=true&playsinline=true';
        createHeadphones(-0.8, 6.0, 10, podcastBrightcoveUrl, 'WirtschaftsWoche Podcast');
        createHeadphones(0.8, 6.0, 10, podcastBrightcoveUrl, 'WirtschaftsWoche Podcast');

        // Table in Room 2 Upper (East) for Remote
        const table2 = new THREE.Mesh(tableGeo, tableMat);
        table2.position.set(20, 5 + 0.5, 10); // y=5 is floor, +0.5 for half table height
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
        const thumbnailUrl = 'assets/textures/video_teaser.png';
        const brightcoveUrl = 'https://players.brightcove.net/1050888054001/default_default/index.html?videoId=6387752852112&autoplay=true&playsinline=true';

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
        thumbnailScreen.userData = {
            videoId: videoId, // Keep for legacy/thumbnail
            videoSrc: brightcoveUrl // Brightcove URL
        };
        scene.add(thumbnailScreen);
        state.covers.push(thumbnailScreen); // Add to covers so it can be interacted with
        state.interactables.push(thumbnailScreen); // Add to interactables for wider range check

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
            videoSrc: brightcoveUrl // Brightcove URL
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

        // Treasure Chest (Loot Box) in corner of Room 1 Upper Floor
        function createTreasureChest(x, y, z) {
            const group = new THREE.Group();

            // Materials - Enhanced
            const woodMat = new THREE.MeshStandardMaterial({
                color: 0x6B3410,
                roughness: 0.6,
                metalness: 0.2
            });

            const goldMat = new THREE.MeshStandardMaterial({
                color: 0xC5A059,
                roughness: 0.2,
                metalness: 0.95,
                emissive: 0x4A2F1A,
                emissiveIntensity: 0.1
            });

            const lockMat = new THREE.MeshStandardMaterial({
                color: 0xFFD700,
                roughness: 0.1,
                metalness: 1.0,
                emissive: 0xFFD700,
                emissiveIntensity: 0.2
            });

            const gemMat = new THREE.MeshStandardMaterial({
                color: 0xFF0000,
                roughness: 0.1,
                metalness: 0.5,
                emissive: 0x880000,
                emissiveIntensity: 0.3
            });

            // Main chest body (bottom)
            const bodyGeo = new THREE.BoxGeometry(0.6, 0.4, 0.4);
            const body = new THREE.Mesh(bodyGeo, woodMat);
            body.position.y = 0.2;
            body.castShadow = true;
            body.receiveShadow = true;
            group.add(body);

            // Chest lid (top) - slightly curved
            const lidGeo = new THREE.BoxGeometry(0.62, 0.25, 0.42);
            const lid = new THREE.Mesh(lidGeo, woodMat);
            lid.position.y = 0.525;
            lid.castShadow = true;
            lid.receiveShadow = true;
            group.add(lid);

            // Gold bands (decorative)
            const bandGeo = new THREE.BoxGeometry(0.65, 0.04, 0.44);
            const band1 = new THREE.Mesh(bandGeo, goldMat);
            band1.position.y = 0.15;
            group.add(band1);

            const band2 = new THREE.Mesh(bandGeo, goldMat);
            band2.position.y = 0.4;
            group.add(band2);

            const band3 = new THREE.Mesh(bandGeo, goldMat);
            band3.position.y = 0.65;
            group.add(band3);

            // Corner reinforcements (fancy detail)
            const cornerGeo = new THREE.BoxGeometry(0.06, 0.7, 0.06);
            const corners = [
                [-0.3, 0.35, -0.2],
                [0.3, 0.35, -0.2],
                [-0.3, 0.35, 0.2],
                [0.3, 0.35, 0.2]
            ];
            corners.forEach(pos => {
                const corner = new THREE.Mesh(cornerGeo, goldMat);
                corner.position.set(...pos);
                group.add(corner);
            });

            // Lock (front center) - larger and fancier
            const lockGeo = new THREE.BoxGeometry(0.12, 0.18, 0.06);
            const lock = new THREE.Mesh(lockGeo, lockMat);
            lock.position.set(0, 0.3, 0.225);
            group.add(lock);

            // Keyhole (decorative circle)
            const keyholeGeo = new THREE.CircleGeometry(0.025, 16);
            const keyhole = new THREE.Mesh(keyholeGeo, new THREE.MeshStandardMaterial({ color: 0x000000 }));
            keyhole.position.set(0, 0.3, 0.26);
            group.add(keyhole);

            // Decorative gems on lid
            const gemGeo = new THREE.SphereGeometry(0.03, 16, 16);
            const gemPositions = [
                [-0.15, 0.65, 0],
                [0.15, 0.65, 0],
                [0, 0.65, -0.12],
                [0, 0.65, 0.12]
            ];
            gemPositions.forEach(pos => {
                const gem = new THREE.Mesh(gemGeo, gemMat);
                gem.position.set(...pos);
                group.add(gem);
            });

            // Position the chest on the floor
            group.position.set(x, y, z);
            group.scale.set(2, 2, 2); // Make it bigger
            group.userData = { type: 'treasure' };

            scene.add(group);
            state.interactables.push(group);
        }

        // Place treasure chest in northwest corner of Room 1 upper floor - ON THE FLOOR
        createTreasureChest(-9, 5.0, 1);

        addObstacles();
        placeCovers();
    }

    function addObstacles() {
        // PLACEHOLDER MATERIALS
        const benchMat = new THREE.MeshStandardMaterial({
            color: 0xcccccc,
            roughness: 0.35,
            metalness: 0.0
        });
        state.materials.bench = benchMat;

        const plantMat = new THREE.MeshStandardMaterial({
            color: 0x88aa88,
            roughness: 0.8,
            metalness: 0.0
        });
        state.materials.plant = plantMat;

        const potMat = new THREE.MeshStandardMaterial({
            color: 0x885522, // Clay color
            roughness: 0.8
        });
        state.materials.pot = potMat;

        const benchGeo = new THREE.BoxGeometry(4, 0.5, 1.5);
        const leafGeo = new THREE.IcosahedronGeometry(0.4, 1);
        const potGeo = new THREE.CylinderGeometry(0.4, 0.3, 0.5, 16);


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

    function loadHighQualityAssets() {
        // Use MANAGED loader for environment so loading screen waits for them
        const loader = state.textureLoader;

        const loadAndApply = (url, materialKey, repeatX = 1, repeatY = 1) => {
            loader.load(url, (tex) => {
                tex.encoding = THREE.sRGBEncoding;
                tex.anisotropy = renderer.capabilities.getMaxAnisotropy();
                tex.minFilter = THREE.LinearMipmapLinearFilter;
                tex.magFilter = THREE.LinearFilter;
                tex.wrapS = THREE.RepeatWrapping;
                tex.wrapT = THREE.RepeatWrapping;
                if (repeatX !== 1 || repeatY !== 1) {
                    tex.repeat.set(repeatX, repeatY);
                }

                if (state.materials[materialKey]) {
                    state.materials[materialKey].map = tex;
                    state.materials[materialKey].needsUpdate = true;
                }
            });
        };

        // Environment Textures
        loadAndApply('assets/textures/floor_wood_neutral.png', 'floor', 10, 10);
        loadAndApply('assets/textures/floor_wood_neutral.png', 'steps', 2, 10); // Apply to steps too
        loadAndApply('assets/textures/wall_concrete.png', 'wall', 1.5, 1);
        loadAndApply('assets/textures/ceiling_wood.png', 'ceiling', 5, 5);

        // Obstacle Textures
        loadAndApply('assets/textures/bench_wood.png', 'bench');
        loadAndApply('assets/textures/plant_leaf.png', 'plant');
        loadAndApply('assets/textures/pot_clay.png', 'pot');
    }

    function createFrame(width, height, coverNumber = null) {
        const group = new THREE.Group();

        // Frame dimensions
        const frameWidth = 0.15; // Thicker frame
        const frameDepth = 0.12;
        const w = width + frameWidth * 2;
        const h = height + frameWidth * 2;

        // Rich wooden material
        const woodMat = new THREE.MeshStandardMaterial({
            color: 0x4A2511, // Dark walnut
            roughness: 0.6,
            metalness: 0.1
        });

        // Gold accent material
        const goldMat = new THREE.MeshStandardMaterial({
            color: 0xC5A059,
            roughness: 0.3,
            metalness: 0.8
        });

        // Create main frame pieces
        const topGeo = new THREE.BoxGeometry(w, frameWidth, frameDepth);
        const sideGeo = new THREE.BoxGeometry(frameWidth, height, frameDepth);

        const topFrame = new THREE.Mesh(topGeo, woodMat);
        topFrame.position.y = (height + frameWidth) / 2;
        group.add(topFrame);

        const bottomFrame = new THREE.Mesh(topGeo, woodMat);
        bottomFrame.position.y = -(height + frameWidth) / 2;
        group.add(bottomFrame);

        const leftFrame = new THREE.Mesh(sideGeo, woodMat);
        leftFrame.position.x = -(width + frameWidth) / 2;
        group.add(leftFrame);

        const rightFrame = new THREE.Mesh(sideGeo, woodMat);
        rightFrame.position.x = (width + frameWidth) / 2;
        group.add(rightFrame);

        // Decorative corner ornaments
        const cornerSize = 0.08;
        const cornerGeo = new THREE.SphereGeometry(cornerSize, 8, 8);

        const corners = [
            [(width + frameWidth) / 2, (height + frameWidth) / 2],
            [-(width + frameWidth) / 2, (height + frameWidth) / 2],
            [(width + frameWidth) / 2, -(height + frameWidth) / 2],
            [-(width + frameWidth) / 2, -(height + frameWidth) / 2]
        ];

        corners.forEach(([x, y]) => {
            const corner = new THREE.Mesh(cornerGeo, goldMat);
            corner.position.set(x, y, frameDepth / 2);
            group.add(corner);

            // Decorative pyramids
            const pyramidGeo = new THREE.ConeGeometry(0.03, 0.06, 4);
            const pyramid = new THREE.Mesh(pyramidGeo, goldMat);
            pyramid.position.set(x * 0.9, y * 0.9, frameDepth / 2 + 0.02);
            pyramid.rotation.x = Math.PI;
            group.add(pyramid);
        });

        // Inner bevel
        const bevelGeo = new THREE.TorusGeometry(
            Math.min(width, height) / 2.5,
            0.015,
            8,
            32
        );
        const bevel = new THREE.Mesh(bevelGeo, goldMat);
        bevel.position.z = frameDepth / 2 - 0.01;
        bevel.scale.set(width / height, 1, 1);
        group.add(bevel);

        // Numbered brass plate
        if (coverNumber !== null) {
            const plateWidth = 0.4;
            const plateHeight = 0.12;
            const plateGeo = new THREE.BoxGeometry(plateWidth, plateHeight, 0.02);
            const brassMat = new THREE.MeshStandardMaterial({
                color: 0xB5A642,
                roughness: 0.4,
                metalness: 0.7
            });

            const plate = new THREE.Mesh(plateGeo, brassMat);
            plate.position.set(0, -(height + frameWidth) / 2 - 0.15, frameDepth / 2 + 0.01);
            group.add(plate);

            // Number text
            const canvas = document.createElement('canvas');
            canvas.width = 256;
            canvas.height = 128;
            const ctx = canvas.getContext('2d');

            ctx.fillStyle = '#B5A642';
            ctx.fillRect(0, 0, 256, 128);

            ctx.strokeStyle = '#8B7355';
            ctx.lineWidth = 4;
            ctx.strokeRect(2, 2, 252, 124);

            ctx.fillStyle = '#2C1810';
            ctx.font = 'bold 72px serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(`№ ${coverNumber + 1}`, 128, 64);

            const texture = new THREE.CanvasTexture(canvas);
            const textMat = new THREE.MeshStandardMaterial({
                map: texture,
                roughness: 0.3,
                metalness: 0.6
            });

            const textGeo = new THREE.PlaneGeometry(plateWidth - 0.02, plateHeight - 0.02);
            const textMesh = new THREE.Mesh(textGeo, textMat);
            textMesh.position.set(0, -(height + frameWidth) / 2 - 0.15, frameDepth / 2 + 0.02);
            group.add(textMesh);
        }

        return group;
    }

    function createCoverTexture(index, highRes = false, material = null) {
        // Fallback/Initial: Generate procedural texture
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
        ctx.fillText('Einen Moment Geduld ...', width / 2, 550 * scale);

        const canvasTex = new THREE.CanvasTexture(canvas);
        canvasTex.encoding = THREE.sRGBEncoding;

        // Check if custom cover data exists and lazy load it
        const coverData = typeof COVERS_DATA !== 'undefined' && COVERS_DATA[index];

        if (coverData) {
            // Load custom image asynchronously
            const imagePath = highRes ? coverData.highRes : coverData.lowRes;

            // Use lazy loader for ALL covers to allow gallery to open immediately with placeholders
            // This prevents the loading screen from waiting for all 100 covers
            const loader = state.lazyTextureLoader;

            const loadTexture = () => {
                loader.load(imagePath, (t) => {
                    t.encoding = THREE.sRGBEncoding;
                    t.flipY = true;

                    // If a material was passed, update it directly
                    if (material) {
                        material.map = t;
                        material.needsUpdate = true;
                    }
                });
            };

            loadTexture();

        }

        return canvasTex;
    }

    function placeCovers() {
        const coverW = 1.5;
        const coverH = 2;
        const coverGeo = new THREE.PlaneGeometry(coverW, coverH);

        // Helper for manual placement
        function placeManualCover(index, x, z, rot) {
            const group = new THREE.Group();
            group.position.set(x, CONFIG.eyeHeight, z);
            group.rotation.y = rot;

            const frame = createFrame(coverW, coverH, index);
            frame.position.z = 0;
            group.add(frame);

            const mat = new THREE.MeshStandardMaterial({
                roughness: 0.4,
                color: 0xffffff,
                emissive: 0x000000,
                transparent: true,
                opacity: 1.0
            });

            mat.map = createCoverTexture(index, false, mat);
            mat.needsUpdate = true;
            const mesh = new THREE.Mesh(coverGeo, mat);
            mesh.userData = { id: index, viewed: false };
            mesh.position.z = 0.11;
            group.add(mesh);

            scene.add(group);
            state.covers.push(mesh);
        }

        // --- SPECIAL PLACEMENT FOR COVERS 0, 1, 2 ---
        // Room 1 South Wall (Inner)
        // Wall width is 8m (from x=-4 to x=4)

        // Cover 2 (Left)
        placeManualCover(2, -2.5, 19.65, Math.PI);

        // Cover 1 (Center)
        placeManualCover(1, 0, 19.65, Math.PI);

        // Cover 0 (Right)
        placeManualCover(0, 2.5, 19.65, Math.PI);

        // Start automatic placement from Index 3
        let coverIndex = 3;

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

                const frame = createFrame(coverW, coverH, coverIndex);
                frame.position.z = 0;
                group.add(frame);

                // Create material for the cover
                const mat = new THREE.MeshStandardMaterial({
                    roughness: 0.4,
                    color: 0xffffff,
                    emissive: 0x000000,
                    transparent: true,
                    opacity: 1.0
                });

                // Use createCoverTexture to generate placeholder immediately and load image asynchronously
                mat.map = createCoverTexture(coverIndex, false, mat);
                mat.needsUpdate = true;
                const mesh = new THREE.Mesh(coverGeo, mat);
                mesh.userData = { id: coverIndex, viewed: false };
                mesh.position.z = 0.11;
                group.add(mesh);

                scene.add(group);
                state.covers.push(mesh);
                coverIndex++;
            }
        }

        // --- REMAINING 97 COVERS (Indices 3-99) ---

        // Room 1 (NW) - Other Walls
        // West Wall (Outer): x=-9.65, z: 20->0. (9 covers - Reversed to match flow)
        placeRow(-9.65, 20, -9.65, 0, Math.PI / 2, 9);
        // North Wall (Outer): z=0.35, x: -10->10. (9 covers)
        placeRow(-10, 0.35, 10, 0.35, 0, 9);
        // East Wall (Inner Solid): x=9.65, z: 0->10. (4 covers)
        placeRow(9.65, 0, 9.65, 10, -Math.PI / 2, 4);

        // Room 2 (NE)
        // North Wall (Outer): z=0.35, x: 10->30. (8 covers - Reduced from 9)
        placeRow(10, 0.35, 30, 0.35, 0, 8);
        // East Wall Part 1 (Outer): x=29.65, z=0->6. (2 covers)
        placeRow(29.65, 0, 29.65, 6, -Math.PI / 2, 2);
        // Staircase Wall (West facing): x=23.9, z=5->15. (5 covers)
        placeRow(23.9, 5, 23.9, 15, -Math.PI / 2, 5, 1.0);
        // East Wall Part 2 (Outer): x=29.65, z=14->20. (2 covers)
        placeRow(29.65, 14, 29.65, 20, -Math.PI / 2, 2);
        // South Wall (Inner Solid): z=19.65, x: 15->25. (4 covers - Increased from 3)
        placeRow(25, 19.65, 15, 19.65, Math.PI, 4);
        // West Wall (Inner Solid): x=10.35, z: 0->10. (4 covers)
        placeRow(10.35, 10, 10.35, 0, Math.PI / 2, 4);

        // Room 3 (SE)
        // East Wall (Outer): x=29.65, z: 20->40. (8 covers - Reduced from 9)
        placeRow(29.65, 20, 29.65, 40, -Math.PI / 2, 8);
        // South Wall (Outer): z=39.65, x: 10->30. (9 covers)
        placeRow(30, 39.65, 10, 39.65, Math.PI, 9);
        // West Wall (Inner Solid): x=10.35, z: 30->40. (4 covers - Increased from 3)
        placeRow(10.35, 40, 10.35, 30, Math.PI / 2, 4);
        // North Wall (Inner Solid): z=20.35, x: 15->25. (4 covers)
        placeRow(15, 20.35, 25, 20.35, 0, 4);

        // Room 4 (SW)
        // South Wall (Outer): z=39.65, x: -10->10. (9 covers)
        placeRow(10, 39.65, -10, 39.65, Math.PI, 9);
        // West Wall (Outer): x=-9.65, z: 20->40. (9 covers)
        placeRow(-9.65, 40, -9.65, 20, Math.PI / 2, 9);
        // North Wall (Inner Solid): z=20.35, x: -5->5. (3 covers - Reversed to match flow)
        placeRow(-5, 20.35, 5, 20.35, 0, 3);
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
        state.currentCoverId = cover.userData.id;

        // Reset manual close flag since we are opening it
        if (cover.userData.manuallyClosed) {
            cover.userData.manuallyClosed = false;
        }

        if (!isIOS && document.exitPointerLock) {
            document.exitPointerLock();
        }

        const coverIndex = cover.userData.id;

        // Track that this cover has been opened
        if (!state.openedCovers.has(coverIndex)) {
            state.openedCovers.add(coverIndex);

            // Update progress bar based on opened covers
            const pct = Math.floor((state.openedCovers.size / CONFIG.totalCovers) * 100);
            document.getElementById('completion-rate').innerText = `${pct}%`;
            document.getElementById('progress-fill').style.width = `${pct}%`;

            // Check for 5 covers achievement
            if (state.openedCovers.size === 5) {
                // Will show achievement when overlay closes
                state.pendingAchievement = 'fiveCoversOpened';
            }

            // Check for all covers achievement
            if (state.openedCovers.size === CONFIG.totalCovers) {
                // Will show achievement when overlay closes
                state.pendingAchievement = 'allCoversOpened';
            }
        }

        const coverData = typeof COVERS_DATA !== 'undefined' && COVERS_DATA[coverIndex];

        // Use custom data if available, otherwise use defaults
        const title = coverData ? coverData.title : `Magazine Issue #${coverIndex + 1}`;
        const description = coverData ? coverData.description : `This is the special 100th Anniversary Edition cover number ${coverIndex + 1}.`;

        document.getElementById('overlay-title').innerText = title;
        document.getElementById('overlay-desc').innerHTML = description;

        const container = document.getElementById('overlay-image-container');
        container.innerHTML = '';

        // Generate image for overlay with progressive loading
        const img = document.createElement('img');

        if (coverData) {
            // Progressive loading: Show low-res first, then upgrade to high-res
            if (coverData.lowRes) {
                // Show low-res immediately
                img.src = coverData.lowRes;
                img.style.filter = 'blur(2px)'; // Slight blur on low-res
            }

            // Load high-res in background
            if (coverData.highRes) {
                if (state.highResCache.has(coverIndex)) {
                    // Use cached high-res immediately
                    img.src = state.highResCache.get(coverIndex);
                    img.style.filter = 'none';
                } else {
                    // Load high-res asynchronously
                    const highResImg = new Image();
                    highResImg.onload = () => {
                        state.highResCache.set(coverIndex, coverData.highRes);
                        // Only update if this overlay is still open for this cover
                        if (state.isOverlayOpen && state.currentCoverId === coverIndex) {
                            img.src = coverData.highRes;
                            img.style.filter = 'none'; // Remove blur when high-res loads
                        }
                    };
                    highResImg.src = coverData.highRes;
                }
            } else {
                // No high-res available, remove blur from low-res
                img.style.filter = 'none';
            }
        } else {
            // Fallback to procedural texture (low-res)
            const lowResTex = createCoverTexture(coverIndex, false);
            img.src = lowResTex.image.src || lowResTex.image.toDataURL();
        }

        img.style.width = '100%';
        img.style.height = 'auto';
        container.appendChild(img);

        const overlay = document.getElementById('cover-overlay');
        if (overlay) {
            overlay.classList.remove('hidden');
            overlay.style.setProperty('opacity', '1', 'important');
            overlay.style.setProperty('visibility', 'visible', 'important');
            overlay.style.setProperty('pointer-events', 'auto', 'important');
        }

        // Hide mobile controls while overlay is open
        const mobileControls = document.getElementById('mobile-controls');
        if (mobileControls) {
            mobileControls.style.display = 'none';
        }
    }

    function closeOverlay() {
        // console.log('closeOverlay called, current state.isOverlayOpen:', state.isOverlayOpen);

        // Set flag on the current cover to prevent immediate auto-reopen
        if (state.currentCoverId !== null) {
            const cover = state.covers.find(c => c.userData.id === state.currentCoverId);
            if (cover) {
                cover.userData.manuallyClosed = true;
            }
        }

        state.isOverlayOpen = false;
        state.lastClosedCoverId = state.currentCoverId;
        state.currentCoverId = null;

        const overlay = document.getElementById('cover-overlay');
        overlay.classList.add('hidden');
        // Reset inline styles to allow CSS to take over
        overlay.style.opacity = '';
        overlay.style.visibility = '';
        overlay.style.pointerEvents = '';

        // Restore mobile controls visibility
        const mobileControls = document.getElementById('mobile-controls');
        if (mobileControls) {
            mobileControls.style.display = '';
        }

        if (!isIOS && document.body.requestPointerLock) {
            document.body.requestPointerLock();
        }

        // Remove focus from close button so Enter key works for interaction
        if (document.activeElement instanceof HTMLElement) {
            document.activeElement.blur();
        }

        // Trigger pending achievement after overlay closes
        if (state.pendingAchievement) {
            const achievementId = state.pendingAchievement;
            state.pendingAchievement = null;
            // Small delay to ensure overlay is fully closed
            setTimeout(() => {
                unlockAchievement(achievementId);
            }, 100);
        }
        // console.log('closeOverlay complete, state.isOverlayOpen:', state.isOverlayOpen);
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
            document.getElementById('video-close-btn').classList.add('hidden');
        }
    }

    function updateMovement() {
        // Movement is allowed even when overlay is open (so auto-close can detect movement away)

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

        // Track navigation start time and show first success screen after 1.5 seconds
        if ((moveStep !== 0 || rotChange !== 0) && !state.hasNavigated) {
            if (state.navigationStartTime === null) {
                state.navigationStartTime = performance.now();
            } else if (!state.firstSuccessShown && (performance.now() - state.navigationStartTime) >= 1500) {
                // Show first success screen after 1.5 seconds of navigation
                const firstSuccessScreen = document.getElementById('first-success-screen');
                if (firstSuccessScreen) {
                    firstSuccessScreen.classList.remove('hidden');
                    state.firstSuccessShown = true;
                }
            }
        }

        // Block all navigation while first success screen or achievement screen is shown
        const firstSuccessScreen = document.getElementById('first-success-screen');
        const achievementScreen = document.getElementById('achievement-screen');
        if ((firstSuccessScreen && !firstSuccessScreen.classList.contains('hidden')) ||
            (achievementScreen && !achievementScreen.classList.contains('hidden'))) {
            return; // Don't allow any movement until "Weiter" is clicked
        }

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

            // Try full movement first
            if (!checkCollision(nextX, nextZ, targetY)) {
                player.x = nextX;
                player.z = nextZ;
                player.y = targetY;
            } else {
                // Collision sliding: try moving along X axis only
                const targetYX = getGroundHeight(nextX, player.z);
                if (!checkCollision(nextX, player.z, targetYX)) {
                    player.x = nextX;
                    player.y = targetYX;
                } else {
                    // Try moving along Z axis only
                    const targetYZ = getGroundHeight(player.x, nextZ);
                    if (!checkCollision(player.x, nextZ, targetYZ)) {
                        player.z = nextZ;
                        player.y = targetYZ;
                    }
                    // If both fail, player stays in place (hard collision)
                }
            }
        }

        camera.position.x = player.x;
        camera.position.z = player.z;
        camera.position.y = player.y + CONFIG.eyeHeight;
        camera.rotation.y = player.rot;

        if (player.y > 4.0) {
            unlockAchievement('floorFound');
        }

        const frustum = new THREE.Frustum();
        frustum.setFromProjectionMatrix(new THREE.Matrix4().multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse));

        // Auto-view logic - open when very close, close when moving away
        if (performance.now() > 2000) {
            // console.log('Auto-view check running, covers count:', state.covers.length, 'isOverlayOpen:', state.isOverlayOpen);
            let closest = null;
            let minDist = 1.5; // Increased slightly for better UX

            state.covers.forEach(cover => {
                const worldPos = new THREE.Vector3();
                cover.getWorldPosition(worldPos);
                const dist = worldPos.distanceTo(camera.position);

                // Reset debounce flag when player moves far enough away
                if (cover.userData.manuallyClosed && dist > 2.5) {
                    cover.userData.manuallyClosed = false;
                }

                // Find closest cover for auto-open (only if overlay is not already open and not manually closed)
                if (!state.isOverlayOpen && dist < minDist && !cover.userData.manuallyClosed) {
                    const dir = new THREE.Vector3();
                    camera.getWorldDirection(dir);
                    const toCover = worldPos.clone().sub(camera.position).normalize();
                    const dot = dir.dot(toCover);

                    // console.log(`Cover ${cover.userData.id}: dist=${dist.toFixed(2)}m, dot=${dot.toFixed(3)}, threshold=0.85, lastClosed=${state.lastClosedCoverId}`);

                    // Require looking directly at the cover
                    if (dot > 0.85) {
                        // Raycast to check for wall occlusion
                        const raycaster = new THREE.Raycaster(camera.position, toCover);
                        // Check intersection with walls
                        const intersects = raycaster.intersectObjects(state.wallMeshes || []);

                        // If a wall is hit and it is closer than the cover, it is blocking the view
                        if (intersects.length > 0 && intersects[0].distance < dist) {
                            return; // Wall is blocking view
                        }

                        closest = cover;
                        minDist = dist;
                    }
                    // console.log(`  → This is the closest qualifying cover!`);
                }

                // Mark as viewed if seen (separate from auto-open) - only for visual feedback
                if (!cover.userData.viewed && dist < 8 && frustum.containsPoint(worldPos)) {
                    const raycaster = new THREE.Raycaster();
                    const dir = worldPos.clone().sub(camera.position).normalize();
                    raycaster.set(camera.position, dir);
                    const intersects = raycaster.intersectObjects(scene.children, true);
                    if (intersects.length > 0) {
                        const firstHit = intersects[0];
                        if (firstHit.object === cover || firstHit.distance >= dist - 0.5) {
                            cover.userData.viewed = true;
                            state.viewedCovers.add(cover.userData.id);
                            // Visual feedback only - no progress bar update
                            cover.material.emissive.setHex(0x050505); // Subtle glow
                        }
                    }
                }
            });

            // Auto-open overlay when very close to a cover
            if (closest && !state.isOverlayOpen) {
                // console.log('Auto-opening overlay for cover:', closest.userData.id);
                openOverlay(closest);
            }

            // Auto-close overlay when player moves away or looks away from the current cover
            if (state.isOverlayOpen && state.currentCoverId !== null) {
                const currentCover = state.covers.find(c => c.userData.id === state.currentCoverId);
                if (currentCover) {
                    const worldPos = new THREE.Vector3();
                    currentCover.getWorldPosition(worldPos);
                    const dist = worldPos.distanceTo(camera.position);

                    const dir = new THREE.Vector3();
                    camera.getWorldDirection(dir);
                    const toCover = worldPos.clone().sub(camera.position).normalize();
                    const dot = dir.dot(toCover);

                    // console.log(`Auto-close check: cover=${state.currentCoverId}, dist=${dist.toFixed(2)}, dot=${dot.toFixed(2)}, thresholds: dist>2.5 OR dot<0.5`);

                    // Close if player moves too far away OR looks away significantly
                    if (dist > 2.5 || dot < 0.5) {
                        // console.log('Auto-closing overlay - dist:', dist.toFixed(2), 'dot:', dot.toFixed(2));

                        closeOverlay();
                    }
                }
            }
        }
    }

    // Helper function to find the closest interactable object
    function findClosestInteractable() {
        let closest = null;
        let minDist = CONFIG.interactionDist;
        const raycaster = new THREE.Raycaster();

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
                    // Raycast to check if there's a wall between camera and cover
                    raycaster.set(camera.position, toCover);
                    const intersects = raycaster.intersectObjects(scene.children, true);

                    // Check if the first intersection is the cover itself (not a wall)
                    let blocked = false;
                    for (const intersect of intersects) {
                        if (intersect.object === cover) {
                            // Found the cover first, not blocked
                            break;
                        }
                        // Check if this is a wall (not a cover and closer than the target)
                        if (intersect.distance < dist && !state.covers.includes(intersect.object)) {
                            blocked = true;
                            break;
                        }
                    }

                    if (!blocked) {
                        closest = cover;
                        minDist = dist;
                    }
                }
            }
        });

        state.interactables.forEach(obj => {
            // Skip treasure chest if player is on ground floor
            if (obj.userData.type === 'treasure' && player.y < 4.0) {
                return;
            }

            const dist = obj.position.distanceTo(camera.position);
            // Larger interaction distance for treasure chest and video screens
            let maxDist = minDist;
            if (obj.userData.type === 'treasure') maxDist = 4.5;
            else if (obj.userData.videoSrc || obj.userData.videoId) maxDist = 10.0; // Much larger range for video

            if (dist < maxDist) {
                const dir = new THREE.Vector3();
                camera.getWorldDirection(dir);
                const toObj = obj.position.clone().sub(camera.position).normalize();
                const dot = dir.dot(toObj);

                // More forgiving angle for treasure chest and video
                let angleThreshold = 0.8;
                if (obj.userData.type === 'treasure') angleThreshold = 0.6;
                else if (obj.userData.videoSrc || obj.userData.videoId) angleThreshold = 0.5; // Very wide angle for video
                if (dot > angleThreshold) {
                    // Raycast check for interactables too
                    raycaster.set(camera.position, toObj);
                    const intersects = raycaster.intersectObjects(scene.children, true);

                    let blocked = false;
                    for (const intersect of intersects) {
                        // Check if the intersected object is the target or a child of the target
                        let isTarget = false;
                        let current = intersect.object;
                        while (current) {
                            if (current === obj) {
                                isTarget = true;
                                break;
                            }
                            current = current.parent;
                        }

                        if (isTarget) {
                            break; // We hit the target, so it's not blocked
                        }

                        if (intersect.distance < dist) {
                            blocked = true;
                            break;
                        }
                    }

                    if (!blocked) {
                        closest = obj;
                        minDist = dist;
                    }
                }
            }
        });

        return closest;
    }

    function checkInteraction() {
        // console.log('🔍 checkInteraction called. isOverlayOpen:', state.isOverlayOpen, 'closestInteractable:', state.closestInteractable?.userData);
        if (state.isOverlayOpen) return;

        // Prevent interaction if achievement was just closed (within 200ms)
        if (state.lastAchievementClosed && (performance.now() - state.lastAchievementClosed) < 200) {
            return;
        }

        // Use the cached interactable that triggered the prompt
        // This ensures WYSIWYG: If the prompt is visible, the action works.
        // We fallback to findClosestInteractable() only if cache is missing (shouldn't happen if prompt is visible)
        const closest = state.closestInteractable || findClosestInteractable();
        // console.log('🎯 checkInteraction - closest object:', closest?.userData, 'type:', closest?.userData?.type);

        if (closest) {
            if (closest.userData.type === 'switch') {
                toggleLights();
            } else if (closest.userData.type === 'treasure') {
                // Handle treasure chest
                try {
                    unlockAchievement('treasureFound');
                } catch (e) {
                    console.error('❌ Error unlocking achievement:', e);
                }

                // Show treasure success screen
                const treasureScreen = document.getElementById('treasure-screen');
                if (treasureScreen) {
                    if (treasureScreen.innerHTML.trim() === '') {
                        treasureScreen.innerHTML = '<div style="color:white; font-size:20px; padding:20px;">Error: Screen content missing. Reload page.</div>';
                    }
                    treasureScreen.classList.remove('hidden');
                    treasureScreen.classList.add('force-visible');
                    state.isOverlayOpen = true;

                    // Focus first button for keyboard navigation
                    setTimeout(() => {
                        const bonusBtn = document.getElementById('treasure-bonus-btn');
                        if (bonusBtn) bonusBtn.focus();
                    }, 150);

                    // Double check visibility
                    setTimeout(() => {
                        const style = window.getComputedStyle(treasureScreen);
                        if (style.display === 'none' || style.visibility === 'hidden' || style.opacity === '0') {
                            alert('Schatztruhe geöffnet! (Screen rendering failed)');
                        }
                    }, 100);
                } else {
                    alert('Schatztruhe geöffnet! (Screen element missing)');
                }

                // Release pointer lock
                if (!isIOS && document.exitPointerLock) {
                    document.exitPointerLock();
                }
            } else if (closest.userData.type === 'remote' || closest.userData.type === 'podcast' || closest.userData.videoId || closest.userData.podcastId || closest.userData.videoSrc) {
                // Handle remote, podcast headphones, or covers with video/podcast
                const videoId = closest.userData.videoId || closest.userData.podcastId;
                const videoSrc = closest.userData.videoSrc;

                if (state.isVideoPlaying) {
                    // Stop video/podcast
                    closeVideo();
                } else {
                    // Start video/podcast directly in fullscreen
                    const videoIframe = document.getElementById('video-screen');
                    if (videoSrc) {
                        // Add autoplay parameter to custom video sources if not already present
                        if (!videoSrc.includes('autoplay=')) {
                            const separator = videoSrc.includes('?') ? '&' : '?';
                            videoIframe.src = `${videoSrc}${separator}autoplay=1`;
                        } else {
                            videoIframe.src = videoSrc;
                        }
                        state.playingVideoType = 'custom';
                    } else {
                        videoIframe.src = `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&enablejsapi=1`;
                        state.playingVideoType = 'youtube';
                    }
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

                    // Focus iframe to allow native player controls
                    videoIframe.focus();

                    // Release pointer lock when video starts
                    if (!isIOS && document.exitPointerLock) {
                        document.exitPointerLock();
                    }
                    document.getElementById('video-close-btn').classList.remove('hidden');
                }
            } else {
                // console.log('📖 Opening overlay for cover:', closest.userData.id);
                openOverlay(closest);
            }
        }
    }

    // Expose checkInteraction to global scope for button click handler
    window.checkInteraction = checkInteraction;

    function updateInteractionPrompt() {
        if (state.isOverlayOpen) {
            document.getElementById('interaction-prompt').classList.add('hidden');
            return;
        }

        const closest = findClosestInteractable();

        // Cache it for other uses (checkInteraction)
        state.closestInteractable = closest;

        const prompt = document.getElementById('interaction-prompt');
        if (closest) {
            if (closest.userData.type === 'switch') {
                prompt.innerText = 'Licht ändern';
                // Unlock achievement when player first finds the light switch
                unlockAchievement('lightFound');
            } else if (closest.userData.type === 'treasure') {
                prompt.innerText = 'Öffnen';
            } else if (closest.userData.type === 'remote') {
                prompt.innerText = state.isVideoPlaying ? 'Video stoppen' : 'Video abspielen';
            } else if (closest.userData.type === 'podcast') {
                prompt.innerText = state.isVideoPlaying ? 'Podcast stoppen' : 'Podcast anhören';
            } else if (closest.userData.videoId || closest.userData.videoSrc) {
                // Cover with video
                prompt.innerText = state.isVideoPlaying ? 'Video stoppen' : 'Video abspielen';
            } else if (closest.userData.podcastId) {
                // Cover with podcast
                prompt.innerText = state.isVideoPlaying ? 'Podcast stoppen' : 'Podcast anhören';
            } else {
                prompt.innerText = 'Ansehen';
                // Unlock achievement when player first sees cover 1 (id 0)
                if (closest.userData.id === 0) {
                    unlockAchievement('firstFound');
                }
            }
            // console.log('✅ Showing prompt:', prompt.innerText, 'for object:', closest.userData);
            prompt.classList.remove('hidden');

            // Auto-open treasure chest if very close (only once)
            if (closest.userData.type === 'treasure') {
                const dist = camera.position.distanceTo(closest.position);
                if (dist < 2.5 && !state.isOverlayOpen && !state.treasureOpened) {
                    state.treasureOpened = true;
                    checkInteraction();
                }
            }
        } else {
            prompt.classList.add('hidden');
        }
    }

    let hasLoggedError = false;
    let frameCount = 0;
    function animate() {
        requestAnimationFrame(animate);
        try {
            if (!scene || !camera || !renderer) return;

            // Update interaction prompt always (to hide it when overlay is open)
            updateInteractionPrompt();

            // Skip movement and rendering when overlay is open
            if (state.isOverlayOpen) {
                return;
            }

            updateMovement();

            if (composer) {
                composer.render();
            } else {
                renderer.render(scene, camera);
            }

            if (cssRenderer) {
                cssRenderer.render(cssScene, camera);
            }

            frameCount++;
            if (frameCount % 60 === 0) {
                // console.log(`Frame ${frameCount}: Camera at (${camera.position.x.toFixed(2)}, ${camera.position.y.toFixed(2)}, ${camera.position.z.toFixed(2)}), Scene children: ${scene.children.length}`);
            }
        } catch (e) {
            if (!hasLoggedError) {
                // console.error('❌ Error in animation loop:', e);
                hasLoggedError = true;
            }
        }
    }

    function onWindowResize() {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(state.isLowPerf ? 1 : Math.min(window.devicePixelRatio, 2));
        if (composer) composer.setSize(window.innerWidth, window.innerHeight);
        cssRenderer.setSize(window.innerWidth, window.innerHeight);
    }


    animate();
}

// Post-Processing Global
let composer;

// Wait for DOM to be ready before starting init
document.addEventListener('DOMContentLoaded', () => {
    init();

    // Add click handler for interaction prompt button
    const interactionPrompt = document.getElementById('interaction-prompt');
    if (interactionPrompt) {
        interactionPrompt.addEventListener('click', (e) => {
            e.preventDefault();
            // Call the checkInteraction function from the init scope
            if (window.checkInteraction) {
                window.checkInteraction();
            }
        });
    }

    // Add click handler for continue button (first success screen)
    const continueBtn = document.getElementById('continue-btn');
    if (continueBtn) {
        continueBtn.addEventListener('click', () => {
            const firstSuccessScreen = document.getElementById('first-success-screen');
            if (firstSuccessScreen) {
                firstSuccessScreen.classList.add('hidden');
                state.isOverlayOpen = false;
                state.hasNavigated = true; // Allow navigation to continue
            }
        });
    }

    // Add click handler for achievement continue button
    const achievementContinueBtn = document.getElementById('achievement-continue-btn');
    if (achievementContinueBtn) {
        achievementContinueBtn.addEventListener('click', () => {
            const achievementScreen = document.getElementById('achievement-screen');
            if (achievementScreen) {
                achievementScreen.classList.add('hidden');
                state.isOverlayOpen = false;
                state.lastAchievementClosed = performance.now();
            }
        });
    }

    // Add click handler for treasure continue button
    const treasureContinueBtn = document.getElementById('treasure-continue-btn');
    if (treasureContinueBtn) {
        treasureContinueBtn.addEventListener('click', (e) => {
            if (e) e.stopPropagation();
            const treasureScreen = document.getElementById('treasure-screen');
            if (treasureScreen) {
                treasureScreen.classList.add('hidden');
                treasureScreen.classList.remove('force-visible');
                // Reset inline styles
                treasureScreen.style.display = '';
                treasureScreen.style.opacity = '';
                treasureScreen.style.visibility = '';
                treasureScreen.style.zIndex = '';

                state.isOverlayOpen = false;
                state.lastAchievementClosed = performance.now();
            }
        });
    }

    // Add click handler for treasure shop button
    const treasureShopBtn = document.getElementById('treasure-shop-btn');
    if (treasureShopBtn) {
        // Make button focusable
        treasureShopBtn.setAttribute('tabindex', '0');

        treasureShopBtn.addEventListener('click', (e) => {
            if (e) {
                e.preventDefault();
                e.stopPropagation();
            }
            window.open('http://shop-wirtschaftswoche.de/', '_blank');
        });

        // Add keyboard support (Enter/Space)
        treasureShopBtn.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                window.open('http://shop-wirtschaftswoche.de/', '_blank');
            } else if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
                e.preventDefault();
                const continueBtn = document.getElementById('treasure-continue-btn');
                if (continueBtn) continueBtn.focus();
            }
        });
    }

    // Make treasure continue button focusable and add keyboard support
    const treasureContinueBtn2 = document.getElementById('treasure-continue-btn');
    if (treasureContinueBtn2) {
        treasureContinueBtn2.setAttribute('tabindex', '0');

        treasureContinueBtn2.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ' || e.key === 'Escape') {
                e.preventDefault();
                treasureContinueBtn2.click();
            } else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
                e.preventDefault();
                const shopBtn = document.getElementById('treasure-shop-btn');
                if (shopBtn) shopBtn.focus();
            }
        });
    }

    // Add click handler for final screen continue button
    const finalContinueBtn = document.getElementById('final-continue-btn');
    if (finalContinueBtn) {
        finalContinueBtn.addEventListener('click', () => {
            const finalScreen = document.getElementById('final-screen');
            if (finalScreen) {
                finalScreen.classList.add('hidden');
                state.isOverlayOpen = false;
                state.lastAchievementClosed = performance.now();
            }
        });
    }

    // Add click handler for light success screen
    const lightContinueBtn = document.getElementById('light-continue-btn');
    if (lightContinueBtn) {
        lightContinueBtn.addEventListener('click', () => {
            const screen = document.getElementById('light-success-screen');
            if (screen) {
                screen.classList.add('hidden');
                state.isOverlayOpen = false;
                state.lastAchievementClosed = performance.now();
            }
        });
    }

    // Add click handler for five covers success screen
    const fiveContinueBtn = document.getElementById('five-covers-continue-btn');
    if (fiveContinueBtn) {
        fiveContinueBtn.addEventListener('click', () => {
            const screen = document.getElementById('five-covers-screen');
            if (screen) {
                screen.classList.add('hidden');
                state.isOverlayOpen = false;
                state.lastAchievementClosed = performance.now();
            }
        });
    }

    // Add click handler for floor success screen
    const floorContinueBtn = document.getElementById('floor-continue-btn');
    if (floorContinueBtn) {
        floorContinueBtn.addEventListener('click', () => {
            const screen = document.getElementById('floor-success-screen');
            if (screen) {
                screen.classList.add('hidden');
                state.isOverlayOpen = false;
                state.lastAchievementClosed = performance.now();
            }
        });
    }

    // Add keydown handler for screens (close on any key except navigation)
    document.addEventListener('keydown', (e) => {
        // Allow arrow keys on treasure screen for button navigation
        const treasureScreen = document.getElementById('treasure-screen');
        if (treasureScreen && !treasureScreen.classList.contains('hidden')) {
            return; // Let treasure screen handle its own keyboard events
        }

        const navKeys = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'w', 'a', 's', 'd', 'W', 'A', 'S', 'D'];
        if (navKeys.includes(e.key)) return;

        const screens = [
            'first-success-screen',
            'achievement-screen',
            'treasure-screen',
            'final-screen',
            'light-success-screen',
            'five-covers-screen',
            'floor-success-screen'
        ];

        for (const id of screens) {
            const screen = document.getElementById(id);
            if (screen && !screen.classList.contains('hidden')) {
                screen.classList.add('hidden');
                // Reset inline styles
                screen.style.display = '';
                screen.style.opacity = '';
                screen.style.visibility = '';
                screen.style.zIndex = '';

                state.isOverlayOpen = false; // Reset overlay state
                state.lastAchievementClosed = performance.now();
                if (id === 'first-success-screen') {
                    state.hasNavigated = true;
                }
                return;
            }
        }
    });

    // Debug: Add global functions to test success screens
    window.testSuccessScreen = function (screenName) {
        const screens = {
            'welcome': 'welcome-screen',
            'first': 'first-success-screen',
            'achievement': 'achievement-screen',
            'light': 'light-success-screen',
            'five': 'five-covers-screen',
            'floor': 'floor-success-screen',
            'treasure': 'treasure-screen',
            'final': 'final-screen'
        };

        const screenId = screens[screenName];
        if (screenId) {
            const screen = document.getElementById(screenId);
            if (screen) {
                screen.classList.remove('hidden');
            } else {
                console.error(`❌ Screen not found: ${screenId}`);
            }
        } else {
        }
    };

    window.hideAllScreens = function () {
        const screenIds = [
            'welcome-screen',
            'first-success-screen',
            'achievement-screen',
            'light-success-screen',
            'five-covers-screen',
            'floor-success-screen',
            'treasure-screen',
            'final-screen'
        ];

        screenIds.forEach(id => {
            const screen = document.getElementById(id);
            if (screen) {
                screen.classList.add('hidden');
            }
        });
    };

});

