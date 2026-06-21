const THREE_URL = "https://cdn.jsdelivr.net/npm/three@0.166.1/build/three.module.js";

const shell = document.querySelector("[data-theme-shell]");
const canvas = document.querySelector("[data-theme-canvas]");
const worksShell = document.querySelector("[data-works-shell]");
const worksCanvas = document.querySelector("[data-works-canvas]");
const header = document.querySelector("[data-site-header]");
const menuToggle = document.querySelector("[data-menu-toggle]");
const menuPanel = document.querySelector("[data-menu-panel]");

const setScrolledHeader = () => {
    if (!header) {
        return;
    }
    header.classList.toggle("is-scrolled", window.scrollY > 12);
};

const closeMenu = () => {
    if (!menuToggle || !menuPanel || !header) {
        return;
    }
    menuToggle.classList.remove("is-open");
    menuToggle.setAttribute("aria-expanded", "false");
    menuToggle.setAttribute("aria-label", "Open menu");
    menuPanel.classList.remove("is-open");
    menuPanel.setAttribute("aria-hidden", "true");
    header.classList.remove("is-menu-open");
    document.body.classList.remove("menu-locked");
};

const toggleMenu = () => {
    if (!menuToggle || !menuPanel || !header) {
        return;
    }
    const isOpen = !menuPanel.classList.contains("is-open");
    menuToggle.classList.toggle("is-open", isOpen);
    menuToggle.setAttribute("aria-expanded", String(isOpen));
    menuToggle.setAttribute("aria-label", isOpen ? "Close menu" : "Open menu");
    menuPanel.classList.toggle("is-open", isOpen);
    menuPanel.setAttribute("aria-hidden", String(!isOpen));
    header.classList.toggle("is-menu-open", isOpen);
    document.body.classList.toggle("menu-locked", isOpen);
};

menuToggle?.addEventListener("click", toggleMenu);
menuPanel?.addEventListener("click", (event) => {
    const target = event.target;
    if (target instanceof Element && target.closest("[data-menu-link]")) {
        closeMenu();
    }
});
window.addEventListener("scroll", setScrolledHeader, { passive: true });
setScrolledHeader();

if (canvas && shell) {
    import(THREE_URL)
        .then((THREE) => createRoom(THREE))
        .catch(() => {
            shell.classList.add("is-webgl-fallback");
        });
}

if (worksCanvas && worksShell) {
    import(THREE_URL)
        .then((THREE) => createWorksGallery(THREE))
        .catch(() => {
            worksCanvas.closest(".works-gallery")?.classList.add("is-fallback");
        });
}

function createRoom(THREE) {
    const renderer = new THREE.WebGLRenderer({
        canvas,
        antialias: true,
        alpha: true,
        powerPreference: "high-performance",
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    const scene = new THREE.Scene();
    scene.fog = new THREE.Fog(0x16100d, 18, 42);

    const camera = new THREE.PerspectiveCamera(42, window.innerWidth / window.innerHeight, 0.1, 100);
    camera.position.set(0, 2.8, 10.5);

    const room = new THREE.Group();
    room.position.set(1.4, -0.55, 0);
    scene.add(room);

    const mat = {
        wall: new THREE.MeshStandardMaterial({ color: 0x4c3324, roughness: 0.88 }),
        floor: new THREE.MeshStandardMaterial({ color: 0x6c452f, roughness: 0.76 }),
        trim: new THREE.MeshStandardMaterial({ color: 0x2a1b14, roughness: 0.68 }),
        paper: new THREE.MeshStandardMaterial({ color: 0xf5dfb9, roughness: 0.58 }),
        sofa: new THREE.MeshStandardMaterial({ color: 0xd9d4c9, roughness: 0.72 }),
        cushion: new THREE.MeshStandardMaterial({ color: 0xf0c0a8, roughness: 0.7 }),
        rose: new THREE.MeshStandardMaterial({ color: 0xe7a58d, roughness: 0.72 }),
        throw: new THREE.MeshStandardMaterial({ color: 0x728978, roughness: 0.82 }),
        wood: new THREE.MeshStandardMaterial({ color: 0x8f6040, roughness: 0.7 }),
        darkWood: new THREE.MeshStandardMaterial({ color: 0x3d281c, roughness: 0.72 }),
        leaf: new THREE.MeshStandardMaterial({ color: 0x7fa65b, roughness: 0.78 }),
        sky: new THREE.MeshStandardMaterial({ color: 0x9bc6d5, roughness: 0.5 }),
        brass: new THREE.MeshStandardMaterial({ color: 0xf1bf62, metalness: 0.24, roughness: 0.38 }),
        ink: new THREE.MeshStandardMaterial({ color: 0x2a1c15, roughness: 0.62 }),
        glow: new THREE.MeshStandardMaterial({ color: 0xffe6a6, emissive: 0xffc76d, emissiveIntensity: 0.75, roughness: 0.45 }),
    };

    const wall = new THREE.Mesh(new THREE.PlaneGeometry(16, 9), mat.wall);
    wall.position.set(0, 3.2, -4.2);
    wall.receiveShadow = true;
    room.add(wall);

    const floor = new THREE.Mesh(new THREE.PlaneGeometry(18, 13), mat.floor);
    floor.rotation.x = -Math.PI / 2;
    floor.position.set(0, -0.95, 1.3);
    floor.receiveShadow = true;
    room.add(floor);

    addBaseboard(THREE, room, mat);
    addSofa(THREE, room, mat);
    addWindow(THREE, room, mat);
    addGalleryWall(THREE, room, mat);
    addDesk(THREE, room, mat);
    addBookshelf(THREE, room, mat);
    addLampAndPlant(THREE, room, mat);
    addRug(THREE, room, mat);
    addClock(THREE, room, mat);

    const ambient = new THREE.HemisphereLight(0xfff0d4, 0x2a1c15, 1.15);
    scene.add(ambient);

    const sun = new THREE.DirectionalLight(0xfff1cf, 2.2);
    sun.position.set(-4, 7, 6);
    sun.castShadow = true;
    sun.shadow.mapSize.set(1024, 1024);
    scene.add(sun);

    const lampLight = new THREE.PointLight(0xffc76d, 16, 12);
    lampLight.position.set(5.25, 2.25, -1.3);
    scene.add(lampLight);

    const pointer = new THREE.Vector2(0, 0);
    const target = new THREE.Vector2(0, 0);
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const clock = new THREE.Clock();

    const resize = () => {
        renderer.setSize(window.innerWidth, window.innerHeight);
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.position.z = window.innerWidth < 760 ? 13.5 : 10.5;
        camera.position.x = window.innerWidth < 760 ? 0.5 : 0;
        room.position.x = window.innerWidth < 760 ? 0.6 : 1.4;
        room.scale.setScalar(window.innerWidth < 760 ? 0.88 : 1);
        camera.updateProjectionMatrix();
    };

    const onPointerMove = (event) => {
        target.x = (event.clientX / window.innerWidth - 0.5) * 2;
        target.y = (event.clientY / window.innerHeight - 0.5) * 2;
    };

    window.addEventListener("resize", resize);
    window.addEventListener("pointermove", onPointerMove, { passive: true });
    resize();

    function animate() {
        const elapsed = clock.getElapsedTime();
        pointer.lerp(target, 0.055);

        room.rotation.y = pointer.x * 0.045;
        room.rotation.x = -pointer.y * 0.018;
        camera.position.y = 2.8 - pointer.y * 0.28;
        camera.lookAt(0.8, 1.85, -2.2);

        if (!reducedMotion) {
            room.getObjectByName("pendulum").rotation.z = Math.sin(elapsed * 1.6) * 0.18;
            room.getObjectByName("curtain-left").position.x = -3.94 + Math.sin(elapsed * 0.7) * 0.035;
            room.getObjectByName("curtain-right").position.x = -1.66 - Math.sin(elapsed * 0.7) * 0.035;
            room.getObjectByName("lamp-glow").scale.setScalar(1 + Math.sin(elapsed * 1.8) * 0.035);
        }

        renderer.render(scene, camera);
        requestAnimationFrame(animate);
    }

    animate();
}

function box(THREE, size, position, material, group, name) {
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(size[0], size[1], size[2]), material);
    mesh.position.set(position[0], position[1], position[2]);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    if (name) {
        mesh.name = name;
    }
    group.add(mesh);
    return mesh;
}

function roundedBox(THREE, size, position, material, group) {
    const mesh = box(THREE, size, position, material, group);
    mesh.scale.set(1, 1, 1);
    return mesh;
}

function addBaseboard(THREE, room, mat) {
    box(THREE, [16.4, 0.18, 0.16], [0, -0.52, -4.08], mat.trim, room);
    for (let i = 0; i < 9; i += 1) {
        box(THREE, [0.06, 0.02, 12], [-7.8 + i * 1.95, -0.93, 1.25], mat.darkWood, room);
    }
}

function addSofa(THREE, room, mat) {
    const sofa = new THREE.Group();
    sofa.position.set(-1.2, -0.34, -1.7);
    room.add(sofa);

    roundedBox(THREE, [4.3, 0.55, 1.15], [0, 0, 0], mat.sofa, sofa);
    roundedBox(THREE, [4.55, 1.2, 0.42], [0, 0.72, -0.48], mat.sofa, sofa);
    roundedBox(THREE, [0.42, 1, 1.1], [-2.35, 0.35, 0], mat.sofa, sofa);
    roundedBox(THREE, [0.42, 1, 1.1], [2.35, 0.35, 0], mat.sofa, sofa);
    roundedBox(THREE, [1.05, 0.48, 0.22], [-0.85, 0.55, 0.43], mat.paper, sofa);
    roundedBox(THREE, [0.9, 0.5, 0.22], [1.05, 0.58, 0.44], mat.cushion, sofa);
    roundedBox(THREE, [0.72, 1.1, 0.1], [1.55, 0.2, 0.62], mat.throw, sofa).rotation.z = -0.18;
    for (const x of [-1.8, 1.8]) {
        box(THREE, [0.18, 0.45, 0.18], [x, -0.48, 0.42], mat.wood, sofa);
    }
}

function addWindow(THREE, room, mat) {
    const windowGroup = new THREE.Group();
    windowGroup.position.set(-2.8, 3, -4.06);
    room.add(windowGroup);
    box(THREE, [2.65, 1.65, 0.08], [0, 0, 0], mat.sky, windowGroup);
    box(THREE, [2.95, 1.95, 0.16], [0, 0, 0.02], mat.wood, windowGroup);
    box(THREE, [2.55, 1.55, 0.18], [0, 0, 0.08], mat.sky, windowGroup);
    box(THREE, [0.1, 1.68, 0.2], [0, 0, 0.14], mat.paper, windowGroup);
    box(THREE, [2.58, 0.1, 0.2], [0, 0, 0.14], mat.paper, windowGroup);
    box(THREE, [0.42, 2.05, 0.18], [-1.42, 0, 0.22], mat.rose, windowGroup, "curtain-left");
    box(THREE, [0.42, 2.05, 0.18], [1.42, 0, 0.22], mat.rose, windowGroup, "curtain-right");
    for (let i = 0; i < 8; i += 1) {
        const hill = new THREE.Mesh(new THREE.SphereGeometry(0.26 + i * 0.012, 18, 12), mat.leaf);
        hill.position.set(-1.05 + i * 0.3, -0.65 + Math.sin(i) * 0.06, 0.22);
        hill.scale.y = 0.32;
        windowGroup.add(hill);
    }
}

function addGalleryWall(THREE, room, mat) {
    const frames = [
        [-5.55, 2.85, 0.92, 1.15, mat.paper],
        [-4.55, 1.72, 0.72, 0.92, mat.rose],
        [0.2, 2.85, 0.9, 1.1, mat.paper],
        [1.28, 2.35, 0.65, 0.78, mat.leaf],
    ];

    for (const item of frames) {
        const [x, y, w, h, fill] = item;
        box(THREE, [w + 0.18, h + 0.18, 0.14], [x, y, -4.02], mat.wood, room);
        box(THREE, [w, h, 0.16], [x, y, -3.91], fill, room);
    }
}

function addDesk(THREE, room, mat) {
    const desk = new THREE.Group();
    desk.position.set(3.8, -0.45, -1.9);
    room.add(desk);
    box(THREE, [3, 0.22, 1.05], [0, 0.62, 0], mat.wood, desk);
    for (const x of [-1.25, 1.25]) {
        box(THREE, [0.18, 1.15, 0.18], [x, 0.02, 0.38], mat.darkWood, desk);
        box(THREE, [0.18, 1.15, 0.18], [x, 0.02, -0.38], mat.darkWood, desk);
    }
    box(THREE, [0.82, 0.1, 0.62], [-0.62, 0.82, 0.05], mat.paper, desk);
    box(THREE, [0.42, 0.08, 0.52], [0.1, 0.84, 0.08], mat.leaf, desk);
    const phone = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.28, 0.16, 28), mat.ink);
    phone.position.set(0.72, 0.82, 0.08);
    phone.rotation.x = Math.PI / 2;
    phone.castShadow = true;
    desk.add(phone);
    box(THREE, [0.52, 0.12, 0.18], [0.72, 0.98, 0.1], mat.ink, desk);
}

function addBookshelf(THREE, room, mat) {
    const shelf = new THREE.Group();
    shelf.position.set(5.9, 1.18, -3.45);
    room.add(shelf);
    box(THREE, [1.55, 3.15, 0.3], [0, 0, 0], mat.darkWood, shelf);
    for (let y = -1.1; y <= 1.1; y += 1.1) {
        box(THREE, [1.45, 0.1, 0.36], [0, y, 0.12], mat.wood, shelf);
    }
    for (let i = 0; i < 16; i += 1) {
        const h = 0.42 + (i % 5) * 0.08;
        const x = -0.58 + (i % 8) * 0.16;
        const y = i < 8 ? -0.54 : 0.55;
        const material = [mat.paper, mat.rose, mat.leaf, mat.sky][i % 4];
        box(THREE, [0.1, h, 0.16], [x, y, 0.34], material, shelf);
    }
}

function addLampAndPlant(THREE, room, mat) {
    const lamp = new THREE.Group();
    lamp.position.set(5.25, -0.32, -1.2);
    room.add(lamp);
    box(THREE, [0.16, 1.65, 0.16], [0, 0.72, 0], mat.brass, lamp);
    const shade = new THREE.Mesh(new THREE.ConeGeometry(0.62, 0.76, 32, 1, true), mat.glow);
    shade.name = "lamp-glow";
    shade.position.set(0, 1.72, 0);
    shade.castShadow = true;
    lamp.add(shade);

    const plant = new THREE.Group();
    plant.position.set(-5.75, -0.6, -1.35);
    room.add(plant);
    const pot = new THREE.Mesh(new THREE.CylinderGeometry(0.36, 0.48, 0.55, 28), mat.rose);
    pot.castShadow = true;
    plant.add(pot);
    for (let i = 0; i < 9; i += 1) {
        const leaf = new THREE.Mesh(new THREE.SphereGeometry(0.24, 18, 12), mat.leaf);
        const angle = (i / 9) * Math.PI * 2;
        leaf.position.set(Math.cos(angle) * 0.35, 0.45 + Math.sin(i) * 0.16, Math.sin(angle) * 0.25);
        leaf.scale.set(0.65, 1.25, 0.3);
        leaf.rotation.z = angle;
        leaf.castShadow = true;
        plant.add(leaf);
    }
}

function addRug(THREE, room, mat) {
    const rug = new THREE.Mesh(new THREE.CircleGeometry(2.35, 64), mat.rose);
    rug.position.set(-0.2, -0.92, 0.75);
    rug.rotation.x = -Math.PI / 2;
    rug.scale.set(1.65, 0.72, 1);
    rug.receiveShadow = true;
    room.add(rug);
}

function addClock(THREE, room, mat) {
    const clock = new THREE.Group();
    clock.position.set(3.05, 3.15, -3.92);
    room.add(clock);

    const face = new THREE.Mesh(new THREE.CircleGeometry(0.48, 48), mat.paper);
    face.castShadow = true;
    clock.add(face);
    const rim = new THREE.Mesh(new THREE.TorusGeometry(0.49, 0.035, 12, 48), mat.wood);
    rim.position.z = 0.04;
    clock.add(rim);
    box(THREE, [0.06, 0.32, 0.04], [0, 0.04, 0.08], mat.ink, clock);
    box(THREE, [0.26, 0.05, 0.04], [0.12, 0, 0.09], mat.ink, clock);
    const pendulum = new THREE.Group();
    pendulum.name = "pendulum";
    pendulum.position.set(0, -0.52, 0.08);
    clock.add(pendulum);
    box(THREE, [0.035, 0.72, 0.035], [0, -0.25, 0], mat.brass, pendulum);
    const bob = new THREE.Mesh(new THREE.SphereGeometry(0.13, 24, 16), mat.brass);
    bob.position.set(0, -0.65, 0);
    bob.castShadow = true;
    pendulum.add(bob);
}

function createWorksGallery(THREE) {
    const gallery = worksCanvas.closest(".works-gallery");
    const dataNode = document.querySelector("[data-works-items]");
    const counter = document.querySelector("[data-works-counter]");
    const parsedItems = dataNode ? JSON.parse(dataNode.textContent || "[]") : [];
    const items = Array.isArray(parsedItems) ? parsedItems : JSON.parse(parsedItems);

    if (!gallery || items.length === 0) {
        gallery?.classList.add("is-fallback");
        return;
    }

    const renderer = new THREE.WebGLRenderer({
        canvas: worksCanvas,
        antialias: true,
        alpha: true,
        powerPreference: "high-performance",
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;

    const scene = new THREE.Scene();
    scene.fog = new THREE.Fog(0x17100c, 12, 36);

    const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 100);
    camera.position.set(0, 0.4, 8.2);

    const rig = new THREE.Group();
    scene.add(rig);

    const panels = items.map((item, index) => {
        const group = new THREE.Group();
        group.position.x = index * 4.4;
        group.userData.url = item.url;

        const texture = makePreviewTexture(THREE, item);
        const material = new THREE.MeshStandardMaterial({
            map: texture,
            roughness: 0.52,
            metalness: 0.05,
        });
        const panel = new THREE.Mesh(new THREE.PlaneGeometry(3.35, 4.55), material);
        panel.castShadow = true;
        panel.receiveShadow = true;
        group.add(panel);

        const frameMaterial = new THREE.MeshStandardMaterial({
            color: 0x2d201a,
            roughness: 0.7,
        });
        const top = new THREE.Mesh(new THREE.BoxGeometry(3.55, 0.08, 0.14), frameMaterial);
        top.position.y = 2.31;
        const bottom = top.clone();
        bottom.position.y = -2.31;
        const left = new THREE.Mesh(new THREE.BoxGeometry(0.08, 4.65, 0.14), frameMaterial);
        left.position.x = -1.76;
        const right = left.clone();
        right.position.x = 1.76;
        group.add(top, bottom, left, right);

        rig.add(group);
        return group;
    });

    const loader = new THREE.TextureLoader();
    items.forEach((item, index) => {
        if (!item.image) {
            return;
        }

        loader.load(
            item.image,
            (texture) => {
                texture.colorSpace = THREE.SRGBColorSpace;
                texture.anisotropy = 4;
                texture.wrapS = THREE.ClampToEdgeWrapping;
                texture.wrapT = THREE.ClampToEdgeWrapping;
                const panel = panels[index].children.find((child) => child.isMesh && child.material?.map);
                if (panel) {
                    panel.material.map.dispose();
                    panel.material.map = texture;
                    panel.material.needsUpdate = true;
                }
            },
            undefined,
            () => {}
        );
    });

    const floor = new THREE.Mesh(
        new THREE.PlaneGeometry(Math.max(18, items.length * 5), 8),
        new THREE.MeshStandardMaterial({ color: 0x2b1d16, roughness: 0.82 })
    );
    floor.rotation.x = -Math.PI / 2;
    floor.position.set((items.length - 1) * 2.2, -2.55, -0.8);
    floor.receiveShadow = true;
    scene.add(floor);

    scene.add(new THREE.HemisphereLight(0xfff0d4, 0x211510, 1.2));
    const key = new THREE.DirectionalLight(0xfff0d4, 2.2);
    key.position.set(-3.5, 5, 6);
    scene.add(key);
    const rim = new THREE.PointLight(0xe7a58d, 9, 16);
    rim.position.set(5, 1, 4);
    scene.add(rim);

    let target = 0;
    let current = 0;
    let isDragging = false;
    let lastX = 0;
    const max = Math.max(0, (items.length - 1) * 4.4);
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const clock = new THREE.Clock();

    const clampTarget = () => {
        target = Math.max(0, Math.min(max, target));
    };

    const updateCounter = () => {
        if (!counter) {
            return;
        }
        const index = Math.min(items.length - 1, Math.max(0, Math.round(current / 4.4)));
        counter.textContent = `${String(index + 1).padStart(2, "0")} / ${String(items.length).padStart(2, "0")}`;
    };

    const resize = () => {
        const rect = gallery.getBoundingClientRect();
        renderer.setSize(rect.width, rect.height);
        camera.aspect = rect.width / rect.height;
        camera.position.z = rect.width < 760 ? 9.8 : 8.2;
        camera.updateProjectionMatrix();
    };

    const onWheel = (event) => {
        event.preventDefault();
        target += (Math.abs(event.deltaX) > Math.abs(event.deltaY) ? event.deltaX : event.deltaY) * 0.012;
        clampTarget();
    };

    const onPointerDown = (event) => {
        isDragging = true;
        lastX = event.clientX;
        gallery.setPointerCapture?.(event.pointerId);
    };

    const onPointerMove = (event) => {
        if (!isDragging) {
            return;
        }
        target += (lastX - event.clientX) * 0.018;
        lastX = event.clientX;
        clampTarget();
    };

    const onPointerUp = (event) => {
        isDragging = false;
        gallery.releasePointerCapture?.(event.pointerId);
    };

    const onClick = (event) => {
        if (Math.abs(target - current) > 0.18) {
            return;
        }
        const rect = gallery.getBoundingClientRect();
        const pointer = new THREE.Vector2(
            ((event.clientX - rect.left) / rect.width) * 2 - 1,
            -(((event.clientY - rect.top) / rect.height) * 2 - 1)
        );
        const raycaster = new THREE.Raycaster();
        raycaster.setFromCamera(pointer, camera);
        const hits = raycaster.intersectObjects(panels, true);
        const hit = hits.find((entry) => entry.object.parent?.userData.url);
        if (hit) {
            window.location.href = hit.object.parent.userData.url;
        }
    };

    gallery.addEventListener("wheel", onWheel, { passive: false });
    gallery.addEventListener("pointerdown", onPointerDown);
    gallery.addEventListener("pointermove", onPointerMove);
    gallery.addEventListener("pointerup", onPointerUp);
    gallery.addEventListener("pointercancel", onPointerUp);
    gallery.addEventListener("click", onClick);
    window.addEventListener("resize", resize);
    resize();

    function animate() {
        const elapsed = clock.getElapsedTime();
        current += (target - current) * 0.08;
        rig.position.x = -current;

        panels.forEach((panel, index) => {
            const distance = index * 4.4 - current;
            panel.rotation.y = THREE.MathUtils.clamp(-distance * 0.045, -0.35, 0.35);
            panel.position.y = reducedMotion ? 0 : Math.sin(elapsed * 0.9 + index) * 0.04;
            panel.scale.setScalar(1 - Math.min(Math.abs(distance) * 0.018, 0.12));
        });

        updateCounter();
        renderer.render(scene, camera);
        requestAnimationFrame(animate);
    }

    animate();
}

function makePreviewTexture(THREE, item) {
    const canvas = document.createElement("canvas");
    canvas.width = 1024;
    canvas.height = 1400;
    const ctx = canvas.getContext("2d");
    const color = item.color || "#d9a66f";
    const accent = item.accent || "#7fa65b";

    ctx.fillStyle = color;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    gradient.addColorStop(0, "rgba(255, 247, 234, 0.52)");
    gradient.addColorStop(1, "rgba(22, 16, 13, 0.38)");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.strokeStyle = "rgba(42, 28, 21, 0.18)";
    ctx.lineWidth = 3;
    const gap = item.pattern === "stripes" ? 90 : 120;
    for (let x = -canvas.height; x < canvas.width; x += gap) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x + canvas.height, canvas.height);
        ctx.stroke();
    }

    ctx.fillStyle = accent;
    ctx.globalAlpha = 0.9;
    drawRoundRect(ctx, 96, 130, 832, 520, 34);
    ctx.fill();
    ctx.globalAlpha = 1;

    ctx.fillStyle = "rgba(255, 247, 234, 0.86)";
    ctx.beginPath();
    ctx.arc(800, 260, 82, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#2a1c15";
    ctx.font = "800 54px Inter, system-ui, sans-serif";
    ctx.fillText(item.kicker || "Work", 96, 870);
    ctx.font = "900 108px Inter, system-ui, sans-serif";
    wrapText(ctx, item.title || "Untitled", 96, 1010, 780, 116);

    ctx.fillStyle = "rgba(42, 28, 21, 0.72)";
    ctx.font = "800 34px Inter, system-ui, sans-serif";
    ctx.fillText("THREE.JS / PREVIEW", 96, 1280);

    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.anisotropy = 4;
    return texture;
}

function wrapText(ctx, text, x, y, maxWidth, lineHeight) {
    const words = String(text).split(" ");
    let line = "";
    for (const word of words) {
        const testLine = line ? `${line} ${word}` : word;
        if (ctx.measureText(testLine).width > maxWidth && line) {
            ctx.fillText(line, x, y);
            line = word;
            y += lineHeight;
        } else {
            line = testLine;
        }
    }
    ctx.fillText(line, x, y);
}

function drawRoundRect(ctx, x, y, width, height, radius) {
    if (typeof ctx.roundRect === "function") {
        ctx.beginPath();
        ctx.roundRect(x, y, width, height, radius);
        return;
    }

    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
}
