import * as THREE from 'three';

export class HandControls {
    constructor(scene, renderer) {
        this.scene = scene;
        this.renderer = renderer;
        this.hands = { left: null, right: null };
        this.handMeshes = { left: null, right: null };
        this.init();
    }

    init() {
        this.createHandMeshes();
    }

    createHandMeshes() {
        const handGeometry = new THREE.SphereGeometry(0.05, 16, 16);
        const leftMaterial = new THREE.MeshStandardMaterial({
            color: 0x667eea,
            transparent: true,
            opacity: 0.7
        });
        const rightMaterial = new THREE.MeshStandardMaterial({
            color: 0x764ba2,
            transparent: true,
            opacity: 0.7
        });

        this.handMeshes.left = new THREE.Mesh(handGeometry, leftMaterial);
        this.handMeshes.right = new THREE.Mesh(handGeometry, rightMaterial);

        this.handMeshes.left.visible = false;
        this.handMeshes.right.visible = false;

        this.scene.add(this.handMeshes.left);
        this.scene.add(this.handMeshes.right);
    }

    update() {
        const xrManager = this.renderer.xr;
        if (!xrManager.isPresenting) return;

        const session = xrManager.getSession();
        const frame = xrManager.getFrame();
        if (!session || !frame) return;

        const inputSources = session.inputSources;
        for (const inputSource of inputSources) {
            if (inputSource.gripSpace) {
                this.updateControllerFromInputSource(inputSource, frame);
            }
        }
    }

    updateControllerFromInputSource(inputSource, frame) {
        const handedness = inputSource.handedness;
        const handMesh = this.handMeshes[handedness];
        if (!handMesh) return;

        const referenceSpace = this.renderer.xr.getReferenceSpace();
        const gripPose = frame.getPose(inputSource.gripSpace, referenceSpace);

        if (gripPose) {
            handMesh.visible = true;
            handMesh.position.copy(gripPose.transform.position);
            handMesh.quaternion.copy(gripPose.transform.orientation);
        } else {
            handMesh.visible = false;
        }
    }
}
