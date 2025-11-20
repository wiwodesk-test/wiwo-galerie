// 3D Art Gallery - Fixed Navigation and Cover Placement
console.log('Gallery JS loaded v2');

const CONFIG = {
    moveSpeed: 0.15,
    rotSpeed: 0.04,
    wallHeight: 5,
    wallThickness: 0.5,
    roomSize: 20,
    collisionRadius: 0.8,
    eyeHeight: 1.7,
    totalCovers: 100,
    interactionDist: 3.0
};

const state = {
    viewedCovers: new Set(),
    keys: { ArrowUp: false, ArrowDown: false, ArrowLeft: false, ArrowRight: false },
    walls: [],
    obstacles: [],
    covers: [],
    isOverlayOpen: false,
    textureLoader: new THREE.TextureLoader()
};

window.state = state; // Expose for debugging

let scene, camera, renderer;
// Fix: Spawn player at (5, 5) to avoid collision with bench at (0, 10)
let player = { x: 5, z: 5, rot: 0 };

function init() {
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0xdddddd);
    scene.fog = new THREE.Fog(0xdddddd, 0, 50);

    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.outputEncoding = THREE.sRGBEncoding;
    document.getElementById('canvas-container').appendChild(renderer.domElement);

    setupLighting();
    buildGallery();

    window.addEventListener('resize', onWindowResize, false);

    document.body.addEventListener('click', () => {
        if (!state.isOverlayOpen) document.body.requestPointerLock();
    });

    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('keyup', (e) => {
        if (state.keys.hasOwnProperty(e.code)) state.keys[e.code] = false;
    });

    document.getElementById('close-btn').addEventListener('click', (e) => {
        e.stopPropagation(); // Prevent click from propagating to body
        closeOverlay();
    });

    animate();
}

function onKeyDown(e) {
    if (state.isOverlayOpen) {
        if (e.code === 'Escape' || e.code.startsWith('Arrow')) {
            closeOverlay();
        }
        return;
    }

    if (state.keys.hasOwnProperty(e.code)) state.keys[e.code] = true;

    if (e.code === 'Enter') {
        checkInteraction();
    }
}

function setupLighting() {
    const hemiLight = new THREE.HemisphereLight(0xffffff, 0x444444, 0.6);
    hemiLight.position.set(0, 20, 0);
    scene.add(hemiLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
    dirLight.position.set(10, 30, 10);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 2048;
    dirLight.shadow.mapSize.height = 2048;
    scene.add(dirLight);

    const lightColor = 0xffaa77;
    const positions = [[0, 10], [20, 10], [0, 30], [20, 30]];
    positions.forEach(pos => {
        const pl = new THREE.PointLight(lightColor, 0.5, 20);
        pl.position.set(pos[0], 4, pos[1]);
        scene.add(pl);
    });
}

function createNoiseTexture(width, height, color1, color2, scale = 1) {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = color1;
    ctx.fillRect(0, 0, width, height);
    for (let i = 0; i < 5000 * scale; i++) {
        const x = Math.random() * width;
        const y = Math.random() * height;
        const size = Math.random() * 2 + 1;
        const alpha = Math.random() * 0.1;
        ctx.fillStyle = color2.replace('A', alpha);
        ctx.fillRect(x, y, size, size);
    }
    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    return tex;
}

function createWoodTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#8B4513';
    ctx.fillRect(0, 0, 512, 512);
    ctx.strokeStyle = '#654321';
    ctx.lineWidth = 2;
    for (let i = 0; i < 50; i++) {
        ctx.beginPath();
        ctx.moveTo(0, Math.random() * 512);
        ctx.bezierCurveTo(100, Math.random() * 512, 400, Math.random() * 512, 512, Math.random() * 512);
        ctx.stroke();
    }
    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(4, 4);
    return tex;
}

function createCoverTexture(index, highRes = false) {
    // Use real image for the first cover
    if (index === 0) {
        const tex = state.textureLoader.load('assets/cover1.jpg');
        tex.encoding = THREE.sRGBEncoding;
        tex.flipY = true; // Ensure correct orientation
        return tex;
    }

    const width = highRes ? 1024 : 512;
    const height = highRes ? 1360 : 680;
    const scale = highRes ? 2 : 1;

    const canvas = document.createElement('canvas');
    canvas.width = width;








    canvas.height = height;
    const ctx = canvas.getContext('2d');

    const hue = (index * 137.5) % 360;
    ctx.fillStyle = `hsl(${hue}, 40%, 20%)`;
    ctx.fillRect(0, 0, width, height);

    ctx.fillStyle = 'rgba(255,255,255,0.05)';
    for (let i = 0; i < 100 * scale; i++) {
        ctx.fillRect(
            Math.random() * width,
            Math.random() * height,
            Math.random() * 50 * scale,
            Math.random() * 50 * scale
        );
    }

    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 20 * scale;
    ctx.strokeRect(20 * scale, 20 * scale, width - 40 * scale, height - 40 * scale);

    ctx.fillStyle = '#ffffff';
    ctx.font = `bold ${80 * scale}px serif`;
    ctx.textAlign = 'center';
    ctx.fillText('MAGAZINE', width / 2, 120 * scale);
    ctx.font = `bold ${200 * scale}px sans-serif`;
    ctx.fillText(index + 1, width / 2, 400 * scale);
    ctx.font = `${40 * scale}px sans-serif`;
    ctx.fillText('Anniversary Issue', width / 2, 550 * scale);

    return new THREE.CanvasTexture(canvas);
}

function buildGallery() {
    const floorTex = createNoiseTexture(512, 512, '#888888', 'rgba(255,255,255,A)', 2);
    floorTex.repeat.set(10, 10);
    const wallTex = createNoiseTexture(512, 512, '#ffffff', 'rgba(0,0,0,A)', 1);
    wallTex.repeat.set(2, 1);
    const woodTex = createWoodTexture();

    const floorMat = new THREE.MeshStandardMaterial({ map: floorTex, roughness: 0.1, metalness: 0.1 });
    const ceilingMat = new THREE.MeshStandardMaterial({ map: woodTex, roughness: 0.8 });
    const wallMat = new THREE.MeshStandardMaterial({ map: wallTex, roughness: 0.9 });
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
        scene.add(fixture);
    }

    const floorGeo = new THREE.PlaneGeometry(100, 100);
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    scene.add(floor);

    const ceiling = new THREE.Mesh(floorGeo, ceilingMat);
    ceiling.rotation.x = Math.PI / 2;
    ceiling.position.y = CONFIG.wallHeight;
    scene.add(ceiling);

    // Fix: Place lights in center of rooms to avoid walls
    // Room centers approx: x=0, 20; z=10, 30
    const lightPositions = [
        { x: 0, z: 10 }, { x: 20, z: 10 },
        { x: 0, z: 30 }, { x: 20, z: 30 }
    ];
    lightPositions.forEach(pos => addCeilingLight(pos.x, pos.z));

    const wt = CONFIG.wallThickness;
    addWall(10, -wt / 2, 40 + wt * 2, wt);
    addWall(10, 40 + wt / 2, 40 + wt * 2, wt);
    addWall(-10 - wt / 2, 20, wt, 40 + wt * 2);
    addWall(30 + wt / 2, 20, wt, 40 + wt * 2);
    addWall(10, 5, wt, 10);
    addWall(10, 35, wt, 10);
    addWall(0, 20, 10, wt);
    addWall(20, 20, 10, wt);
    addWall(10, 20, 4, 4);

    addObstacles();
    placeCovers();
}

function addObstacles() {
    const benchGeo = new THREE.BoxGeometry(4, 0.5, 1.5);
    const benchMat = new THREE.MeshStandardMaterial({ color: 0x333333 });
    const plantGeo = new THREE.CylinderGeometry(0.5, 0.3, 1, 16);
    const plantMat = new THREE.MeshStandardMaterial({ color: 0x228B22 });
    const potGeo = new THREE.CylinderGeometry(0.4, 0.4, 0.5, 16);
    const potMat = new THREE.MeshStandardMaterial({ color: 0x8B4513 });

    function addBench(x, z, rot) {
        const bench = new THREE.Mesh(benchGeo, benchMat);
        bench.position.set(x, 0.25, z);
        bench.rotation.y = rot;
        bench.castShadow = true;
        bench.receiveShadow = true;
        scene.add(bench);
        state.obstacles.push(new THREE.Box3().setFromObject(bench));
    }

    function addPlant(x, z) {
        const group = new THREE.Group();
        const pot = new THREE.Mesh(potGeo, potMat);
        pot.position.y = 0.25;
        const plant = new THREE.Mesh(plantGeo, plantMat);
        plant.position.y = 1;
        group.add(pot);
        group.add(plant);
        group.position.set(x, 0, z);
        scene.add(group);

        const box = new THREE.Box3();
        box.min.set(x - 0.5, 0, z - 0.5);
        box.max.set(x + 0.5, 2, z + 0.5);
        state.obstacles.push(box);
    }

    addBench(0, 10, 0);
    addPlant(-8, 2);
    addBench(20, 10, Math.PI / 2);
    addPlant(28, 2);
    addBench(20, 30, 0);
    addPlant(28, 38);
    addBench(0, 30, Math.PI / 2);
    addPlant(-8, 38);
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

    const extrudeSettings = { depth: 0.1, bevelEnabled: false };
    const geometry = new THREE.ExtrudeGeometry(frameShape, extrudeSettings);
    const material = new THREE.MeshStandardMaterial({ color: 0x8B4513, roughness: 0.8 });
    return new THREE.Mesh(geometry, material);
}

function placeCovers() {
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

    const coverW = 1.5;
    const coverH = 2;
    const coverGeo = new THREE.PlaneGeometry(coverW, coverH);
    let coverIndex = 0;

    // Helper to place a sequence of covers along a wall segment
    // start: {x, z}, end: {x, z}, facing: rotation in radians
    // count: number of covers to place on this segment
    function placeRow(startX, startZ, endX, endZ, facing, count) {
        const dx = (endX - startX);
        const dz = (endZ - startZ);
        const len = Math.sqrt(dx * dx + dz * dz);

        // Margin from corners
        const margin = 2.0;
        const usableLen = len - 2 * margin;
        // If count is 1, place in middle
        if (count <= 0) return;

        for (let i = 0; i < count; i++) {
            if (coverIndex >= CONFIG.totalCovers) return;

            // Calculate position along the line
            const t = count > 1 ? i / (count - 1) : 0.5;
            // Map t to the usable range [margin, len - margin]
            const dist = margin + t * usableLen;

            // Interpolate
            const x = startX + (dx / len) * dist;
            const z = startZ + (dz / len) * dist;

            const group = new THREE.Group();
            group.position.set(x, CONFIG.eyeHeight, z);
            group.rotation.y = facing;

            // Frame: Extruded from 0 to 0.1
            // We want the back of the frame to be at Z=0 (flush with wall)
            const frame = createFrame(coverW, coverH);
            frame.position.z = 0;
            group.add(frame);

            // Cover: Plane
            // Must be in front of frame. Frame depth is 0.1.
            const mat = new THREE.MeshStandardMaterial({
                map: createCoverTexture(coverIndex),
                roughness: 0.4,
                color: 0xffffff
            });
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
    // East Wall (Outer): x=29.65, z: 0->20. (9 covers)
    placeRow(29.65, 0, 29.65, 20, -Math.PI / 2, 9);
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

function checkCollision(newX, newZ) {
    const playerBox = new THREE.Box3();
    const r = CONFIG.collisionRadius;
    playerBox.min.set(newX - r, 0, newZ - r);
    playerBox.max.set(newX + r, CONFIG.eyeHeight, newZ + r);

    for (const box of state.walls) if (playerBox.intersectsBox(box)) return true;
    for (const box of state.obstacles) if (playerBox.intersectsBox(box)) return true;
    return false;
}

function openOverlay(cover) {
    state.isOverlayOpen = true;
    document.exitPointerLock();

    const id = cover.userData.id + 1;
    document.getElementById('overlay-title').innerText = `Magazine Issue #${id}`;

    // Dynamic description
    const descriptions = [
        "A bold exploration of color and form.",
        "Celebrating our rich history and heritage.",
        "Looking forward to the future of design.",
        "An exclusive interview with the founder.",
        "The art of typography in modern media.",
        "Nature and technology in harmony.",
        "Abstract concepts visualized.",
        "A journey through the decades.",
        "Minimalism: Less is more.",
        "The impact of digital art on print."
    ];
    const desc = descriptions[cover.userData.id % descriptions.length];
    document.getElementById('overlay-desc').innerText = `${desc} This is the special 100th Anniversary Edition cover number ${id}.`;

    const container = document.getElementById('overlay-image-container');
    container.innerHTML = '';

    // Generate high-res texture for overlay
    const highResTex = createCoverTexture(cover.userData.id, true);
    const img = highResTex.image; // This is a canvas element
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

function updateMovement() {
    if (state.isOverlayOpen) return;

    let moveStep = 0;
    if (state.keys.ArrowUp) moveStep = CONFIG.moveSpeed;
    if (state.keys.ArrowDown) moveStep = -CONFIG.moveSpeed;

    if (state.keys.ArrowLeft) player.rot += CONFIG.rotSpeed;
    if (state.keys.ArrowRight) player.rot -= CONFIG.rotSpeed;

    if (moveStep !== 0) {
        const nextX = player.x - Math.sin(player.rot) * moveStep;
        const nextZ = player.z - Math.cos(player.rot) * moveStep;

        if (!checkCollision(nextX, player.z)) player.x = nextX;
        if (!checkCollision(player.x, nextZ)) player.z = nextZ;
    }

    camera.position.x = player.x;
    camera.position.z = player.z;
    camera.position.y = CONFIG.eyeHeight;
    camera.rotation.y = player.rot;

    const frustum = new THREE.Frustum();
    frustum.setFromProjectionMatrix(new THREE.Matrix4().multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse));

    state.covers.forEach(cover => {
        if (cover.userData.viewed) return;
        const worldPos = new THREE.Vector3();
        cover.getWorldPosition(worldPos);
        if (worldPos.distanceTo(camera.position) < 8 && frustum.containsPoint(worldPos)) {
            cover.userData.viewed = true;
            state.viewedCovers.add(cover.userData.id);
            cover.material.emissive.setHex(0x333333);
            const pct = Math.floor((state.viewedCovers.size / CONFIG.totalCovers) * 100);
            document.getElementById('completion-rate').innerText = `${pct}%`;
            document.getElementById('progress-fill').style.width = `${pct}%`;
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

    if (closest) {
        openOverlay(closest);
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

    const prompt = document.getElementById('interaction-prompt');
    if (closest) {
        prompt.classList.remove('hidden');
    } else {
        prompt.classList.add('hidden');
    }
}

function animate() {
    requestAnimationFrame(animate);
    updateMovement();
    updateInteractionPrompt();
    renderer.render(scene, camera);
    if (Math.random() < 0.01) console.log('Rendering...', camera.position);
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    console.log('Resized');
}

init();
console.log('Init called');
