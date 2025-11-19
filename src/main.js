import * as THREE from 'three';
import { PortalRenderer } from './core/portal-renderer.js';
import { EnvironmentManager } from './core/environment-manager.js';
import { WebXRManager } from './core/webxr-manager.js';
import { HandControls } from './ui/hand-controls.js';

class UnplainAir {
    constructor() {
        this.canvas = document.getElementById('renderCanvas');
        this.statusEl = document.getElementById('status');
        this.enterButton = document.getElementById('enterXR');
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.init();
    }

    async init() {
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x000000);

        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.camera.position.set(0, 1.6, 3);

        this.renderer = new THREE.WebGLRenderer({ canvas: this.canvas, antialias: true, alpha: true });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.xr.enabled = true;

        const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
        this.scene.add(ambientLight);

        // Initialize Systems
        this.portalRenderer = new PortalRenderer(this.scene, this.renderer);
        this.environmentManager = new EnvironmentManager(this.scene, this.portalRenderer);

        // Reticle for placement
        this.reticle = new THREE.Mesh(
            new THREE.RingGeometry(0.15, 0.2, 32).rotateX(-Math.PI / 2),
            new THREE.MeshBasicMaterial({ color: 0xffffff })
        );
        this.reticle.matrixAutoUpdate = false;
        this.reticle.visible = false;
        this.scene.add(this.reticle);

        const xrSupported = await this.checkXRSupport();
        if (xrSupported) {
            this.xrManager = new WebXRManager(this.renderer, this.scene, this.camera);
            this.handControls = new HandControls(this.scene, this.renderer);
            this.enterButton.addEventListener('click', () => this.enterXR());
            this.statusEl.textContent = 'Ready! Tap to Place Portal';

            // Add select listener for placement
            const controller = this.renderer.xr.getController(0);
            controller.addEventListener('select', () => {
                if (this.reticle.visible) {
                    const position = new THREE.Vector3();
                    const quaternion = new THREE.Quaternion();
                    this.reticle.matrix.decompose(position, quaternion, new THREE.Vector3());
                    this.portalRenderer.placePortal(position, quaternion);
                }
            });
        } else {
            this.statusEl.textContent = 'WebXR not supported';
        }

        window.addEventListener('resize', () => this.onResize());
        this.renderer.setAnimationLoop((timestamp, frame) => this.render(timestamp, frame));
    }

    async checkXRSupport() {
        if (!navigator.xr) return false;
        try {
            return await navigator.xr.isSessionSupported('immersive-ar');
        } catch (error) {
            return false;
        }
    }

    async enterXR() {
        try {
            await this.xrManager.startSession();
            document.getElementById('ui-overlay').style.display = 'none';
        } catch (error) {
            console.error('XR error:', error);
        }
    }

    render(timestamp, frame) {
        if (this.renderer.xr.isPresenting) {
            if (this.handControls) this.handControls.update();

            // Handle Hit Test
            if (frame && this.xrManager) {
                const hitTestResults = this.xrManager.getHitTestResults(frame);
                if (hitTestResults) {
                    const pose = hitTestResults.getPose(this.renderer.xr.getReferenceSpace());
                    this.reticle.visible = true;
                    this.reticle.matrix.fromArray(pose.transform.matrix);
                } else {
                    this.reticle.visible = false;
                }
            }
        }
        this.renderer.render(this.scene, this.camera);
    }

    onResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }
}

new UnplainAir();
