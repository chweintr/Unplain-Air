export class WebXRManager {
    constructor(renderer, scene, camera) {
        this.renderer = renderer;
        this.scene = scene;
        this.camera = camera;
        this.xrSession = null;
    }

    async startSession() {
        if (!navigator.xr) throw new Error('WebXR not supported');
        this.xrSession = await navigator.xr.requestSession('immersive-ar', {
            requiredFeatures: ['local-floor'],
            optionalFeatures: ['hand-tracking']
        });
        await this.renderer.xr.setSession(this.xrSession);
    }

    async endSession() {
        if (this.xrSession) await this.xrSession.end();
    }
}
