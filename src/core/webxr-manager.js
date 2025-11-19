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
            requiredFeatures: ['local-floor', 'hit-test'],
            optionalFeatures: ['hand-tracking']
        });
        await this.renderer.xr.setSession(this.xrSession);

        // Setup hit test source
        this.viewerSpace = await this.xrSession.requestReferenceSpace('viewer');
        this.hitTestSource = await this.xrSession.requestHitTestSource({ space: this.viewerSpace });
    }

    getHitTestResults(frame) {
        if (!this.hitTestSource) return null;
        const hitTestResults = frame.getHitTestResults(this.hitTestSource);
        if (hitTestResults.length > 0) {
            return hitTestResults[0];
        }
        return null;
    }

    async endSession() {
        if (this.hitTestSource) this.hitTestSource.cancel();
        this.hitTestSource = null;
        if (this.xrSession) await this.xrSession.end();
    }
}
