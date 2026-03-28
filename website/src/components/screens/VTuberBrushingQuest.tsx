import React, { useEffect, useRef, useState, useCallback, useImperativeHandle, forwardRef } from 'react';
import { FilesetResolver, FaceLandmarker, HandLandmarker } from '@mediapipe/tasks-vision';
import * as Kalidokit from 'kalidokit';
import { CapacitorHttp, HttpResponse } from '@capacitor/core';

/**
 * VTuberBrushingQuest - Final Build V7
 * Focuses on AI tracking and rendering with perfect zoom.
 * Game logic and UI moved to parent.
 */

const AVATARS = {
    HIYORI: 'https://cdn.jsdelivr.net/gh/guansss/pixi-live2d-display@master/test/assets/hiyori/hiyori_pro_t10.model3.json',
    TANU: 'https://cdn.jsdelivr.net/gh/guansss/pixi-live2d-display@master/test/assets/haru/haru_greeter_t03.model3.json'
};

const CURRENT_MODEL_KEY: 'HIYORI' | 'TANU' = 'TANU';
const AVATAR_PATH = AVATARS[CURRENT_MODEL_KEY];

interface VTuberBrushingQuestProps {
    currentStepIndex: number;
    onStepComplete?: () => void;
    onTrackingUpdate?: (pos: { x: number, y: number } | null) => void;
    // AI External Controls
    onAIStateChange?: (state: { isRecording: boolean, isThinking: boolean, aiText: string, audioUnlocked: boolean }) => void;
    externalInput?: string;
    externalCommand?: string | null;
    onStartRecording?: () => void;
    onStopRecording?: () => void;
    onSendText?: (text: string) => void;
}

export interface VTuberQuestHandle {
    processAI: (text?: string | null, audio?: string | null) => void;
    startRecording: () => void;
    stopRecording: () => void;
    unlockAudio: () => void;
}

export const VTuberBrushingQuest = React.memo(forwardRef<VTuberQuestHandle, VTuberBrushingQuestProps>(({
    currentStepIndex,
    onStepComplete,
    onTrackingUpdate,
    onAIStateChange,
    onStartRecording,
    onStopRecording,
    onSendText
}, ref) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [modelLoaded, setModelLoaded] = useState(false);
    const appRef = useRef<any>(null);
    const modelRef = useRef<any>(null);
    const faceLandmarkerRef = useRef<FaceLandmarker | null>(null);
    const handLandmarkerRef = useRef<HandLandmarker | null>(null);
    const requestRef = useRef<number>();
    
    // AI States
    const [isRecording, setIsRecording] = useState(false);
    const [isThinking, setIsThinking] = useState(false);
    const [aiText, setAiText] = useState("");
    const isSpeakingRef = useRef(false);
    const [inputText, setInputText] = useState("");
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const audioContextRef = useRef<AudioContext | null>(null);
    const analyserRef = useRef<AnalyserNode | null>(null);
    const audioUnlockedRef = useRef(false);
    const [audioUnlocked, setAudioUnlocked] = useState(false);

    const unlockAudio = useCallback(() => {
        if (audioUnlockedRef.current) return;
        log('Force Unlocking Audio for Android...');
        if (window.speechSynthesis) {
            window.speechSynthesis.cancel();
            const primer = new SpeechSynthesisUtterance(" ");
            primer.volume = 0;
            primer.rate = 2;
            window.speechSynthesis.speak(primer);
        }
        if (!audioContextRef.current) {
            audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
        }
        if (audioContextRef.current.state === 'suspended') {
            audioContextRef.current.resume();
        }
        const silentAudio = new Audio();
        silentAudio.src = 'data:audio/wav;base64,UklGRigAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQQAAAAAAA==';
        silentAudio.play().then(() => {
            silentAudio.pause();
            audioUnlockedRef.current = true;
            setAudioUnlocked(true);
            log('Audio Hardware Unlocked');
        }).catch(e => log(`Hardware Unlock Fail: ${e.message}`));
    }, []);

    useEffect(() => {
        if (onAIStateChange) {
            onAIStateChange({ isRecording, isThinking, aiText, audioUnlocked });
        }
    }, [isRecording, isThinking, aiText, audioUnlocked, onAIStateChange]);

    const log = (msg: string) => {
        console.log(`[VTUBER] ${msg}`);
    };

    const initAudioAnalyser = (audio: HTMLAudioElement) => {
        if (!audioContextRef.current) {
            audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
        }
        const audioContext = audioContextRef.current;
        const source = audioContext.createMediaElementSource(audio);
        const analyser = audioContext.createAnalyser();
        analyser.fftSize = 256;
        source.connect(analyser);
        analyser.connect(audioContext.destination);
        analyserRef.current = analyser;
    };

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const mediaRecorder = new MediaRecorder(stream);
            mediaRecorderRef.current = mediaRecorder;
            audioChunksRef.current = [];
            mediaRecorder.ondataavailable = (event) => audioChunksRef.current.push(event.data);
            mediaRecorder.onstop = async () => {
                const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
                const reader = new FileReader();
                reader.readAsDataURL(audioBlob);
                reader.onloadend = () => {
                    const base64Audio = (reader.result as string).split(',')[1];
                    processAI(null, base64Audio);
                };
                stream.getTracks().forEach(t => t.stop());
            };
            mediaRecorder.start();
            setIsRecording(true);
        } catch (err) {
            log(`Mic Error: ${err}`);
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
        }
    };

    const offlineMocks = [
        { keys: ["hello", "hi ", "hey", "who"], answer: "Hello there! I'm Guide Tanu, your Royal Guide to the Tooth Kingdom!", audio: "/sounds/tanu/hello.mp3" },
        { keys: ["how", "brush", "properly", "way", "do i"], answer: "Master the circular motion! Brush in small, gentle circles for two whole minutes.", audio: "/sounds/tanu/brush_guide.mp3" },
        { keys: ["pain", "hurt", "bleed", "blood", "ache"], answer: "A royal toothache! Make sure to tell your parents right away!", audio: "/sounds/tanu/pain_help.mp3" },
        { keys: ["sugar", "candy", "sweet", "chocolate"], answer: "Those sneaky Sugar Bugs love sweet treats! Always brush after eating candy!", audio: "/sounds/tanu/sugar_bugs.mp3" }
    ];

    const getOfflineResponseMatch = (query: string) => {
        const lower = query.toLowerCase();
        return offlineMocks.find(mock => mock.keys.some(k => lower.includes(k)));
    };

    const processAI = async (text?: string | null, audio?: string | null) => {
        setIsThinking(true);
        setAiText("Thinking...");
        unlockAudio();
        const isMobile = /Android|iPhone|iPad/i.test(navigator.userAgent);

        if (isMobile && text) {
            const match = getOfflineResponseMatch(text);
            const answer = match ? match.answer : "Keep brushing for a Royal Smile!";
            setAiText(answer);
            if (match && match.audio) playManualAudio(match.audio);
            else playOfflineTTS(answer);
            setIsThinking(false);
            return;
        }

        try {
            const cloudUrl = "https://us-central1-tooth-kingdom-adventure.cloudfunctions.net/processAI";
            let responseData: any = null;
            try {
                const cloudOptions = { url: cloudUrl, headers: { 'Content-Type': 'application/json' }, data: { text, audio } };
                const cloudRes: HttpResponse = await CapacitorHttp.post(cloudOptions);
                if (cloudRes.status === 200 && cloudRes.data.success) responseData = cloudRes.data;
            } catch (e) { log("Cloud AI Error fallback"); }

            if (!isMobile && !responseData) {
                const localUrl = "http://127.0.0.1:8010/ai/process";
                try {
                    const localOptions = { url: localUrl, headers: { 'Content-Type': 'application/json' }, data: { text: text || "Hello", audio: audio || "" } };
                    const localRes: HttpResponse = await CapacitorHttp.post(localOptions);
                    if (localRes.status === 200 && localRes.data.success) responseData = localRes.data;
                } catch (e) { log("Local PC AI Error fallback"); }
            }

            if (!responseData) {
                const match = text ? getOfflineResponseMatch(text) : null;
                const answer = match ? match.answer : "Tanu is resting! Let's brush together!";
                setAiText(answer);
                if (match && match.audio) playManualAudio(match.audio);
                else playOfflineTTS(answer);
                return;
            }

            setAiText(responseData.text);
            if (responseData.audio) playAudioResponse(responseData.audio);
            else playOfflineTTS(responseData.text);
        } catch (err) {
            playOfflineTTS("Tanu is resting! Let's brush together!");
        } finally {
            setIsThinking(false);
        }
    };

    const playManualAudio = (src: string) => {
        if (audioRef.current) audioRef.current.pause();
        if (window.speechSynthesis) window.speechSynthesis.cancel();
        const audio = new Audio(src);
        audioRef.current = audio;
        initAudioAnalyser(audio);
        audio.onplay = () => { isSpeakingRef.current = true; };
        audio.onended = () => { isSpeakingRef.current = false; };
        audio.play().catch(err => {
            log(`Manual Audio Failed: ${err.message}`);
            playOfflineTTS("Hello!");
        });
    };

    const playOfflineTTS = (text: string) => {
        if (!window.speechSynthesis) return;
        window.speechSynthesis.cancel();
        const executeSpeech = () => {
            const utterance = new SpeechSynthesisUtterance(text);
            const voices = window.speechSynthesis.getVoices();
            let preferredVoice = voices.find(v => v.name.includes('Zira') || v.name.includes('Hazel') || v.name.includes('Google UK English Female') || v.name.includes('English')) || voices[0];
            if (preferredVoice) utterance.voice = preferredVoice;
            utterance.pitch = 1.35;
            utterance.rate = 1.0;
            utterance.onstart = () => { isSpeakingRef.current = true; };
            utterance.onend = () => { isSpeakingRef.current = false; };
            window.speechSynthesis.speak(utterance);
        };
        if (window.speechSynthesis.getVoices().length === 0) {
            window.speechSynthesis.onvoiceschanged = () => { executeSpeech(); window.speechSynthesis.onvoiceschanged = null; };
        } else { executeSpeech(); }
    };

    const playAudioResponse = (base64Audio: string) => {
        if (audioRef.current) audioRef.current.pause();
        if (window.speechSynthesis) window.speechSynthesis.cancel();
        const audio = new Audio(`data:audio/mp3;base64,${base64Audio}`);
        audioRef.current = audio;
        audio.onplay = () => { isSpeakingRef.current = true; };
        audio.onended = () => { isSpeakingRef.current = false; };
        initAudioAnalyser(audio);
        audio.play().catch(e => log(`Audio Response Play Fail: ${e.message}`));
    };

    useImperativeHandle(ref, () => ({ processAI, startRecording, stopRecording, unlockAudio }), [processAI, unlockAudio]);

    useEffect(() => {
        let isMounted = true;
        const loadScript = (url: string, globalCheck: string): Promise<void> => {
            return new Promise((resolve, reject) => {
                if ((window as any)[globalCheck]) return resolve();
                const script = document.createElement('script');
                script.src = url;
                script.async = true;
                script.onload = () => resolve();
                script.onerror = () => reject(new Error(`Failed to load: ${url}`));
                document.body.appendChild(script);
            });
        };

        const setupCamera = async () => {
            if (!videoRef.current) return;
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } }, audio: false });
                if (isMounted && videoRef.current) videoRef.current.srcObject = stream;
            } catch (err: any) { log(`Camera Error: ${err.message}`); }
        };

        const initMediaPipe = async () => {
            const vision = await FilesetResolver.forVisionTasks("https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm");
            log("Initializing Landmarkers (GPU Mode)...");
            faceLandmarkerRef.current = await FaceLandmarker.createFromOptions(vision, {
                baseOptions: { modelAssetPath: "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task", delegate: "GPU" },
                outputFaceBlendshapes: true, runningMode: "VIDEO"
            });
            handLandmarkerRef.current = await HandLandmarker.createFromOptions(vision, {
                baseOptions: { modelAssetPath: "https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task", delegate: "GPU" },
                runningMode: "VIDEO"
            });
            log("Landmarkers Ready");
        };

        const initLive2D = async () => {
            if (!canvasRef.current || appRef.current) return;
            await loadScript("https://cdnjs.cloudflare.com/ajax/libs/pixi.js/7.4.2/pixi.min.js", "PIXI");
            await loadScript("https://cdn.jsdelivr.net/npm/pixi-live2d-display@0.4.0/dist/index.min.js", "PIXI.live2d");
            const PIXI = (window as any).PIXI;
            const app = new PIXI.Application({ view: canvasRef.current, backgroundAlpha: 0, width: 800, height: 1200, antialias: true, autoStart: true });
            appRef.current = app;
            if (!(window as any).Live2DCubismCore) await new Promise(r => setTimeout(r, 1000));
            const Live2DModel = (PIXI as any).live2d.Live2DModel;
            const model = await Live2DModel.from(AVATAR_PATH, { autoInteract: false });
            if (!isMounted) { model.destroy(); app.destroy(); return; }
            modelRef.current = model;
            model.anchor.set(0.5, 0.5);
            model.x = app.screen.width / 2;
            const baseScale = Math.min((app.screen.width / model.width), (app.screen.height / model.height));
            model.y = app.screen.height * 1.5;
            model.scale.set(baseScale * 2.6);
            try {
                const internal = model.internalModel as any;
                if (internal.motionManager) {
                    internal.motionManager.stopAllMotions();
                    internal.motionManager.update = () => false;
                    internal.motionManager.startMotion = async () => false;
                    internal.motionManager.startRandomMotion = async () => false;
                    if (internal.breath) internal.breath = null;
                    if (internal.eyeBlink) internal.eyeBlink = null;
                }
                internal.coreModel._partIds.forEach((id: string) => {
                    if (id.includes('ArmA')) internal.coreModel.setPartOpacityById(id, 0);
                    else if (id.includes('ArmB')) internal.coreModel.setPartOpacityById(id, 1);
                });
            } catch (e) { }
            app.stage.addChild(model);
            if (isMounted) setModelLoaded(true);
        };

        const renderLoop = () => {
            if (!isMounted) return;
            const canTrack = videoRef.current && faceLandmarkerRef.current && handLandmarkerRef.current && modelRef.current && videoRef.current.readyState >= 2;
            try {
                const model = modelRef.current;
                if (!model) { requestRef.current = requestAnimationFrame(renderLoop); return; }
                const core = model.internalModel?.coreModel;
                if (core) {
                    const isTalking = (audioRef.current && !audioRef.current.paused) || isSpeakingRef.current;
                    const breath = (Math.sin(performance.now() / 1500) + 1) / 2;
                    core.setParameterValueById('ParamBreath', breath);
                    core.setParameterValueById('ParamAngleX', Math.sin(performance.now() / 3000) * 5);
                    core.setParameterValueById('ParamBodyAngleX', Math.sin(performance.now() / 2000) * 3);
                    if (isTalking) {
                        const lipSyncValue = (Math.sin(performance.now() / 80) + 1) / 2 * 0.85;
                        core.setParameterValueById('ParamMouthOpenY', lipSyncValue);
                    } else if (!canTrack) {
                        core.setParameterValueById('ParamMouthOpenY', 0);
                    }
                }
                if (canTrack) {
                    const video = videoRef.current!;
                    const startTimeMs = performance.now();
                    const faceResult = faceLandmarkerRef.current!.detectForVideo(video, startTimeMs);
                    const handResult = handLandmarkerRef.current!.detectForVideo(video, startTimeMs);
                    if (faceResult.faceBlendshapes?.[0] && core) {
                        const faceRig = Kalidokit.Face.solve(faceResult.faceLandmarks[0], { runtime: "mediapipe", video, imageSize: { width: video.videoWidth, height: video.videoHeight } });
                        if (faceRig) {
                            core.setParameterValueById('ParamAngleX', faceRig.head.degrees.y);
                            core.setParameterValueById('ParamAngleY', faceRig.head.degrees.x);
                            core.setParameterValueById('ParamAngleZ', faceRig.head.degrees.z);
                            core.setParameterValueById('ParamEyeLOpen', faceRig.eye.l);
                            core.setParameterValueById('ParamEyeROpen', faceRig.eye.r);
                            const isTalking = (audioRef.current && !audioRef.current.paused) || isSpeakingRef.current;
                            if (!isTalking) core.setParameterValueById('ParamMouthOpenY', faceRig.mouth.y);
                        }
                    }
                    if (handResult.landmarks && handResult.landmarks.length > 0) {
                        const finger = handResult.landmarks[0][8];
                        if (onTrackingUpdate) onTrackingUpdate({ x: 1 - finger.x, y: finger.y });
                    } else if (onTrackingUpdate) onTrackingUpdate(null);
                }
            } catch (e) { }
            if (isMounted) requestRef.current = requestAnimationFrame(renderLoop);
        };

        const init = async () => {
            try {
                await setupCamera();
                await initMediaPipe();
                await initLive2D();
                if (isMounted) requestRef.current = requestAnimationFrame(renderLoop);
            } catch (err: any) { log(`Init Fault: ${err.message}`); }
        };
        init();
        return () => {
            isMounted = false;
            if (requestRef.current) cancelAnimationFrame(requestRef.current);
            try {
                if (faceLandmarkerRef.current) { faceLandmarkerRef.current.close(); faceLandmarkerRef.current = null; }
                if (handLandmarkerRef.current) { handLandmarkerRef.current.close(); handLandmarkerRef.current = null; }
            } catch (err) { }
            if (appRef.current) {
                try {
                    appRef.current.ticker.stop();
                    if (modelRef.current) modelRef.current.destroy({ children: true, texture: true, baseTexture: true });
                    appRef.current.destroy(false, { children: true, texture: true, baseTexture: true });
                } catch (e) { }
            }
            if (videoRef.current?.srcObject) { (videoRef.current.srcObject as MediaStream).getTracks().forEach(t => t.stop()); videoRef.current!.srcObject = null; }
            if (audioContextRef.current) { audioContextRef.current.close().catch(console.warn); audioContextRef.current = null; }
        };
    }, []);

    return (
        <div className="absolute inset-0 w-full h-full rounded-3xl overflow-hidden bg-indigo-950 z-10">
            <img src="/thumbnails/tooth_kingdom_throne_bg.png" className="absolute inset-0 w-full h-full object-fill z-0" style={{ filter: 'contrast(1.1) saturate(1.1) brightness(1.02)' }} alt="Background" />
            <video ref={videoRef} className="absolute opacity-0 pointer-events-none" style={{ width: 1, height: 1 }} playsInline autoPlay />
            <canvas ref={canvasRef} onClick={unlockAudio} className="absolute inset-0 w-full h-full object-contain z-10 cursor-pointer" style={{ opacity: modelLoaded ? 1 : 0 }} />
        </div>
    );
}));
