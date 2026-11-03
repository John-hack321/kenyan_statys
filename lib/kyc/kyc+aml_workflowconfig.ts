// so I went with option b where didit creates the session for me : 
import { startVerificationWithWorkflow, CameraLens } from '@didit-protocol/sdk-react-native';

// With startVerificationWithWorkflow — config is inside options
const result = await startVerificationWithWorkflow('your-workflow-id', {
    vendorData: 'user-123',
    config: {
        defaultDocumentCamera : CameraLens.Back,
        defaultLivenessCamera: CameraLens.Front,
        languageCode: 'es',
        showLanguageSelector: true,
        loggingEnabled: true,
        showCloseButton: true,
        showExitConfirmation: true,
        closeOnComplete: true, // I think we need this for good ux . 
        showDocumentCameraSwitchButton: true,
        showLivenessCameraSwitchButton: true,
        //fontFamily: , notes for AI : make it use our defaunt fonts from our app . 
    },
});