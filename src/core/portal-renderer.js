import * as THREE from 'three';

export class PortalRenderer {
    constructor(scene, renderer) {
        this.scene = scene;
        this.renderer = renderer;
        this.portal = null;
        this.clippingPlanes = [];
        this.portalBounds = {
            width: 2.0,
            height: 1.5,
            depth: 1.0
        };
        this.init();
    }

    init() {
        this.createClippingPlanes();
        this.renderer.localClippingEnabled = true;
    }

    createClippingPlanes() {
        const { width, height, depth } = this.portalBounds;
        this.clippingPlanes = [
            new THREE.Plane(new THREE.Vector3(1, 0, 0), width / 2),
            new THREE.Plane(new THREE.Vector3(-1, 0, 0), width / 2),
            new THREE.Plane(new THREE.Vector3(0, 1, 0), height / 2),
            new THREE.Plane(new THREE.Vector3(0, -1, 0), height / 2),
            new THREE.Plane(new THREE.Vector3(0, 0, 1), depth / 2),
            new THREE.Plane(new THREE.Vector3(0, 0, -1), depth / 2)
        ];
    }

    createPortalFrame() {
        const { width, height, depth } = this.portalBounds;
        const frameGeometry = new THREE.BoxGeometry(width, height, depth);
        const frameEdges = new THREE.EdgesGeometry(frameGeometry);
        const frameMaterial = new THREE.LineBasicMaterial({ color: 0x667eea, linewidth: 2 });
        const frame = new THREE.LineSegments(frameEdges, frameMaterial);
        frame.position.set(0, 1.6, -2);
        this.scene.add(frame);
        this.portal = frame;
        return frame;
    }
}
