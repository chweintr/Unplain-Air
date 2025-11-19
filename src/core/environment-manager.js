import * as THREE from 'three';

export class EnvironmentManager {
    constructor(scene, portalRenderer) {
        this.scene = scene;
        this.portalRenderer = portalRenderer;
        this.init();
    }

    init() {
        // Create a simple virtual environment
        this.createVirtualWorld();
    }

    createVirtualWorld() {
        // 1. A Skybox (Large Sphere)
        // We use a sphere instead of scene.background because we need to apply stencil to it
        const skyGeo = new THREE.SphereGeometry(50, 32, 32);
        const skyMat = new THREE.MeshBasicMaterial({
            color: 0x87CEEB, // Sky blue
            side: THREE.BackSide
        });
        const sky = new THREE.Mesh(skyGeo, skyMat);
        this.portalRenderer.addVirtualObject(sky);

        // 2. Some Terrain/Ground
        const groundGeo = new THREE.PlaneGeometry(100, 100);
        const groundMat = new THREE.MeshStandardMaterial({
            color: 0x228B22, // Forest Green
            roughness: 0.8
        });
        const ground = new THREE.Mesh(groundGeo, groundMat);
        ground.rotation.x = -Math.PI / 2;
        this.portalRenderer.addVirtualObject(ground);

        // 3. Some "Trees" (Cylinders + Cones)
        for (let i = 0; i < 20; i++) {
            this.createTree();
        }
    }

    createTree() {
        const x = (Math.random() - 0.5) * 20;
        const z = (Math.random() - 0.5) * 20 - 5; // Offset to be behind portal

        const trunkGeo = new THREE.CylinderGeometry(0.2, 0.2, 2);
        const trunkMat = new THREE.MeshStandardMaterial({ color: 0x8B4513 });
        const trunk = new THREE.Mesh(trunkGeo, trunkMat);
        trunk.position.set(x, 1, z);

        const leavesGeo = new THREE.ConeGeometry(1, 3, 8);
        const leavesMat = new THREE.MeshStandardMaterial({ color: 0x006400 });
        const leaves = new THREE.Mesh(leavesGeo, leavesMat);
        leaves.position.set(0, 2, 0);
        trunk.add(leaves);

        this.portalRenderer.addVirtualObject(trunk);
    }
}
