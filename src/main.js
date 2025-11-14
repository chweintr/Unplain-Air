import * as THREE from 'three';
import { PortalRenderer } from './core/portal-renderer.js';
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
        
        const cube = new THREE.Mesh(
            new THREE.BoxGeometry(0.5, 0.5, 0.5),
            new THREE.MeshStandardMaterial({ color: 0x667eea })
        );
        cube.position.set(0, 1.6, -2);
        this.scene.add(cube);
        
        this.portalRenderer = new PortalRenderer(this.scene, this.renderer);
        
        const xrSupported = await this.checkXRSupport();
        if (xrSupported) {
            this.xrManager = new WebXRManager(this.renderer, this.scene, this.camera);
            this.handControls = new HandControls(this.scene, this.renderer);
            this.enterButton.addEventListener('click', () => this.enterXR());
            this.statusEl.textContent = 'Ready!';
        } else {
            this.statusEl.textContent = 'WebXR not supported';
        }
        
        window.addEventListener('resize', () => this.onResize());
        this.renderer.setAnimationLoop(() => this.render());
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

    render() {
        if (this.renderer.xr.isPresenting && this.handControls) {
            this.handControls.update();
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
