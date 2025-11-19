import * as THREE from 'three';

export class PortalRenderer {
    constructor(scene, renderer) {
        this.scene = scene;
        this.renderer = renderer;
        this.portalMesh = null;
        this.virtualGroup = new THREE.Group(); // Group for virtual objects

        // Stencil Reference ID
        this.STENCIL_REF = 1;

        this.init();
    }

    init() {
        // Enable stencil in renderer
        this.renderer.shadowMap.enabled = true;

        // Create the Portal Window (The "Hole")
        this.createPortalMesh();

        // Add the virtual group to the scene
        this.scene.add(this.virtualGroup);
    }

    createPortalMesh() {
        // A simple plane for the portal window
        const geometry = new THREE.PlaneGeometry(1.5, 2); // 1.5m wide, 2m tall

        // Material that writes to Stencil Buffer but renders nothing visible
        const material = new THREE.MeshBasicMaterial({
            color: 0x000000,
            colorWrite: false, // Don't draw pixels
            depthWrite: false, // Don't write to depth buffer (optional, depends on effect)
            stencilWrite: true,
            stencilFunc: THREE.AlwaysStencilFunc,
            stencilRef: this.STENCIL_REF,
            stencilZPass: THREE.ReplaceStencilOp
        });

        this.portalMesh = new THREE.Mesh(geometry, material);
        this.portalMesh.position.set(0, 1.5, -2); // 2 meters in front
        this.scene.add(this.portalMesh);

        // Optional: Add a frame so we can see where the portal is
        const frameGeo = new THREE.EdgesGeometry(geometry);
        const frameMat = new THREE.LineBasicMaterial({ color: 0xffffff, linewidth: 4 });
        const frame = new THREE.LineSegments(frameGeo, frameMat);
        this.portalMesh.add(frame);
        this.portal = this.portalMesh;
    }

    placePortal(position, quaternion) {
        if (this.portalMesh) {
            this.portalMesh.position.copy(position);
            // Optional: align to wall normal if quaternion provided
            if (quaternion) this.portalMesh.quaternion.copy(quaternion);
        }
    }

    // Call this to add objects that should ONLY be visible through the portal
    addVirtualObject(object) {
        // Traverse object to set stencil comparison
        object.traverse((child) => {
            if (child.isMesh) {
                child.material.stencilWrite = true;
                child.material.stencilFunc = THREE.EqualStencilFunc;
                child.material.stencilRef = this.STENCIL_REF;
            }
        });
        this.virtualGroup.add(object);
    }
}
