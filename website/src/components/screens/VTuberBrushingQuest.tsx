import React, { useEffect, useRef, useState, useCallback, useImperativeHandle, forwardRef } from 'react';
import { FilesetResolver, FaceLandmarker, HandLandmarker } from '@mediapipe/tasks-vision';
import * as Kalidokit from 'kalidokit';

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
    const [telemetry, _setTelemetry] = useState<string[]>([]); // Keep as silent ref if needed, or remove completely
    
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

    // Audio Unlocker for Mobile/Android (Aggressive for Android)
    const unlockAudio = useCallback(() => {
        if (audioUnlockedRef.current) return;

        log('Force Unlocking Audio for Android...');

        // 1. PRIME THE SPEECH ENGINE (Aggressive)
        if (window.speechSynthesis) {
            window.speechSynthesis.cancel();
            const primer = new SpeechSynthesisUtterance(" ");
            primer.volume = 0;
            primer.rate = 2; // Fast prime
            window.speechSynthesis.speak(primer);
        }

        // 2. PRIME THE WEB AUDIO CONTEXT
        if (!audioContextRef.current) {
            audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
        }

        if (audioContextRef.current.state === 'suspended') {
            audioContextRef.current.resume();
        }

        // 3. SILENT BUFFER UNLOCK
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

    // Lip Sync Logic
    const initAudioAnalyser = (audio: HTMLAudioElement) => {
        // PERMANENT FIX: Do NOT close the context. Reuse it to keep the hardware "hot"
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

    const updateLipSync = (): number | null => {
        if (!analyserRef.current || !modelRef.current) return null;
        const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
        analyserRef.current.getByteFrequencyData(dataArray);

        let maxVolume = 0;
        for (let i = 0; i < dataArray.length; i++) {
            if (dataArray[i] > maxVolume) maxVolume = dataArray[i];
        }

        // If practically silent (buffering or gap), return null to fallback to webcam mouth
        if (maxVolume < 10) return null;

        return Math.min(1, maxVolume / 120); // More responsive scale
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

    // OFFLINE MOCKUP DICTIONARY with Manual Audio Support
    // To use manual voices: Put MP3 files in public/sounds/tanu/
    const offlineMocks = [
        { 
            keys: ["hello", "hi ", "hey", "who"], 
            answer: "Hello there! I'm Guide Tanu, your Royal Guide to the Tooth Kingdom!", 
            audio: "/sounds/tanu/hello.mp3" 
        },
        { 
            keys: ["how", "brush", "properly", "way", "do i"], 
            answer: "Master the circular motion! Brush in small, gentle circles for two whole minutes.", 
            audio: "/sounds/tanu/brush_guide.mp3" 
        },
        { 
            keys: ["pain", "hurt", "bleed", "blood", "ache"], 
            answer: "A royal toothache! Make sure to tell your parents right away!", 
            audio: "/sounds/tanu/pain_help.mp3" 
        },
        { 
            keys: ["sugar", "candy", "sweet", "chocolate"], 
            answer: "Those sneaky Sugar Bugs love sweet treats! Always brush after eating candy!", 
            audio: "/sounds/tanu/sugar_bugs.mp3" 
        }
    ];

    const getOfflineResponseMatch = (query: string) => {
        const lower = query.toLowerCase();
        return offlineMocks.find(mock => mock.keys.some(k => lower.includes(k)));
    };

    const processAI = async (text?: string | null, audio?: string | null) => {
        setIsThinking(true);
        setAiText("Thinking...");

        // Ensure audio is unlocked
        unlockAudio();

        const isMobile = /Android|iPhone|iPad/i.test(navigator.userAgent);

        const fallbackOffline = (errMsg?: string) => {
            const match = text ? getOfflineResponseMatch(text) : null;
            const answer = match ? match.answer : "Tanu is resting! Let's brush together!";
            setAiText(answer);
            
            // PRIORITY: Use Manual Audio File if it exists, otherwise use System TTS
            if (match && match.audio) {
                // We convert path to base64 or just use it directly if it's in public
                playManualAudio(match.audio);
            } else {
                playOfflineTTS(answer);
            }
            if (errMsg) log(`Cloud AI Error: ${errMsg}`);
        };

        // --- ANDROID SMART BYPASS ---
        if (isMobile && text) {
            log("Mobile detected: Using Local Royal Brain");
            const match = getOfflineResponseMatch(text);
            const answer = match ? match.answer : "Keep brushing for a Royal Smile!";
            setAiText(answer);
            
            if (match && match.audio) {
                playManualAudio(match.audio);
            } else {
                playOfflineTTS(answer);
            }
            setIsThinking(false);
            return;
        }

        try {
            // PHASE 1: Try Google Cloud
            const cloudUrl = "https://us-central1-tooth-kingdom-adventure.cloudfunctions.net/processAI";
            log("Attempting Cloud AI...");

            let response = await fetch(cloudUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text, audio }),
                mode: 'cors'
            }).catch(() => null);

            // PHASE 2: Try Local PC Fallback (Skip on Mobile)
            if (!isMobile && (!response || !response.ok)) {
                log(`Cloud AI unavailable. Checking Local PC...`);
                const localUrl = "http://127.0.0.1:8010/ai/process";
                response = await fetch(localUrl, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ text: text || "Hello", audio: audio || "" })
                }).catch(() => null);
            }

            // PHASE 3: Offline Brain
            if (!response || !response.ok) {
                log(`Backends reachable? No. Activating Offline Royal Brain...`);
                fallbackOffline();
                return;
            }

            const data = await response.json();
            if (data.success) {
                setAiText(data.text);
                if (data.audio) {
                    playAudioResponse(data.audio);
                } else {
                    playOfflineTTS(data.text);
                }
            } else {
                fallbackOffline();
            }
        } catch (err) {
            log(`System Error. Using Royal Fallback...`);
            fallbackOffline();
        } finally {
            setIsThinking(false);
        }
    };

    // MANUAL AUDIO PLAYER (The "Guaranteed" Method)
    const playManualAudio = (src: string) => {
        if (audioRef.current) audioRef.current.pause();
        if (window.speechSynthesis) window.speechSynthesis.cancel();

        const audio = new Audio(src);
        audioRef.current = audio;
        
        // Use real frequency data for the mouth!
        initAudioAnalyser(audio);

        audio.onplay = () => { isSpeakingRef.current = true; };
        audio.onended = () => { isSpeakingRef.current = false; };
        
        audio.play().catch(err => {
            log(`Manual Audio Failed: ${err.message}`);
            playOfflineTTS("Hello!");
        });
    };

    // NATIVE BROWSER SPEECH FALLBACK
    const playOfflineTTS = (text: string) => {
        if (!window.speechSynthesis) {
            log("SpeechSynthesis not supported");
            return;
        }
        
        // Force cancel any pending speech
        window.speechSynthesis.cancel();

        const executeSpeech = () => {
            const utterance = new SpeechSynthesisUtterance(text);
            const voices = window.speechSynthesis.getVoices();

            // Find best voice
            let preferredVoice = voices.find(v =>
                v.name.includes('Zira') ||
                v.name.includes('Hazel') ||
                v.name.includes('Google UK English Female') ||
                v.name.includes('Google US English') ||
                v.name.includes('English')
            ) || voices[0];

            if (preferredVoice) utterance.voice = preferredVoice;

            utterance.pitch = 1.35;
            utterance.rate = 1.0;
            utterance.volume = 1.0;

            utterance.onstart = () => {
                log("Speech Started");
                isSpeakingRef.current = true;
            };

            utterance.onend = () => {
                log("Speech Finished");
                isSpeakingRef.current = false;
            };

            utterance.onerror = (e) => {
                log(`Speech Error: ${e.error}`);
                isSpeakingRef.current = false;
            };

            window.speechSynthesis.speak(utterance);
        };

        // Android Voice Loading Hunt
        if (window.speechSynthesis.getVoices().length === 0) {
            window.speechSynthesis.onvoiceschanged = () => {
                executeSpeech();
                window.speechSynthesis.onvoiceschanged = null;
            };
        } else {
            executeSpeech();
        }
    };

    const playAudioResponse = (base64Audio: string) => {
        if (audioRef.current) audioRef.current.pause();
        // If speechSynthesis was running, stop it
        if (window.speechSynthesis) window.speechSynthesis.cancel();

        const audio = new Audio(`data:audio/mp3;base64,${base64Audio}`);
        audioRef.current = audio;
        initAudioAnalyser(audio);
        audio.play();
    };

    // Expose methods to parent via ref (Imperial Unlock)
    useImperativeHandle(ref, () => ({
        processAI,
        startRecording,
        stopRecording,
        unlockAudio
    }), [processAI, unlockAudio]);

    const handleSend = () => {
        if (!inputText.trim()) return;
        processAI(inputText);
        setInputText("");
    };

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
                const stream = await navigator.mediaDevices.getUserMedia({
                    video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } },
                    audio: false,
                });
                if (isMounted && videoRef.current) videoRef.current.srcObject = stream;
            } catch (err: any) {
                log(`Camera Error: ${err.message}`);
            }
        };

        const initMediaPipe = async () => {
            const vision = await FilesetResolver.forVisionTasks("https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm");
            faceLandmarkerRef.current = await FaceLandmarker.createFromOptions(vision, {
                baseOptions: {
                    modelAssetPath: "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task",
                    delegate: "CPU"
                },
                outputFaceBlendshapes: true,
                runningMode: "VIDEO"
            });
            handLandmarkerRef.current = await HandLandmarker.createFromOptions(vision, {
                baseOptions: {
                    modelAssetPath: "https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task",
                    delegate: "CPU"
                },
                runningMode: "VIDEO"
            });
        };

        const initLive2D = async () => {
            if (!canvasRef.current || appRef.current) return;
            
            log("Pixi Booting...");
            // Core Pixi
            await loadScript("https://cdnjs.cloudflare.com/ajax/libs/pixi.js/7.4.2/pixi.min.js", "PIXI");
            
            // The Live2D engines are already loaded via index.html, we just need the React wrapper:
            await loadScript("https://cdn.jsdelivr.net/npm/pixi-live2d-display@0.4.0/dist/index.min.js", "PIXI.live2d");

            const PIXI = (window as any).PIXI;
            const app = new PIXI.Application({
                view: canvasRef.current,
                backgroundAlpha: 0,
                width: 800,
                height: 1200,
                antialias: true,
                autoStart: true
            });
            appRef.current = app;

            // Wait for Live2D Core to be ready
            if (!(window as any).Live2DCubismCore) {
                 log("Waiting for Live2D Core...");
                 await new Promise(r => setTimeout(r, 1000));
            }
            
            log("Model Downloading...");
            const Live2DModel = (PIXI as any).live2d.Live2DModel;
            const model = await Live2DModel.from(AVATAR_PATH, { autoInteract: false });
            if (!isMounted) { model.destroy(); app.destroy(); return; }

            modelRef.current = model;
            // @ts-ignore
            model.anchor.set(0.5, 0.5);
            // @ts-ignore
            model.x = app.screen.width / 2;
            // @ts-ignore
            const baseScale = Math.min((app.screen.width / model.width), (app.screen.height / model.height));
            // @ts-ignore
            model.y = app.screen.height * 1.5;
            // @ts-ignore
            model.scale.set(baseScale * 2.6);

            try {
                // @ts-ignore
                const internal = model.internalModel as any;

                // DISABLE IDLE PHYSICS THAT FIGHT WEBCAM TRACKING
                if (internal.motionManager) {
                    internal.motionManager.stopAllMotions();
                    internal.motionManager.update = () => false; // Nuke update loop
                    internal.motionManager.startMotion = async () => false; // Block all motions
                    internal.motionManager.startRandomMotion = async () => false;
                    // Override breath/eye blink auto-generators if present
                    if (internal.breath) internal.breath = null;
                    if (internal.eyeBlink) internal.eyeBlink = null;
                }

                internal.coreModel._partIds.forEach((id: string, index: number) => {
                    if (id.includes('ArmA')) internal.coreModel.setPartOpacityById(id, 0);
                    else if (id.includes('ArmB')) internal.coreModel.setPartOpacityById(id, 1);
                });
            } catch (e) { }

            app.stage.addChild(model);
            if (isMounted) {
                setModelLoaded(true);
                log("Avatar Online");
            }
        };

        const renderLoop = () => {
            if (!isMounted) return;

            if (!videoRef.current || !faceLandmarkerRef.current || !handLandmarkerRef.current || !modelRef.current || videoRef.current.readyState < 2) {
                if (videoRef.current && videoRef.current.readyState < 2 && Date.now() % 5000 < 50) {
                    log("Waiting for Camera readyState...");
                }
                requestRef.current = requestAnimationFrame(renderLoop);
                return;
            }

            try {
                const video = videoRef.current;
                const model = modelRef.current;
                const startTimeMs = performance.now();
                const faceResult = faceLandmarkerRef.current.detectForVideo(video, startTimeMs);
                const handResult = handLandmarkerRef.current.detectForVideo(video, startTimeMs);

                if (faceResult.faceBlendshapes?.[0] && model.internalModel) {
                    const faceRig = Kalidokit.Face.solve(faceResult.faceLandmarks[0], {
                        runtime: "mediapipe", video, imageSize: { width: video.videoWidth, height: video.videoHeight }
                    });
                    if (faceRig) {
                        const core = model.internalModel?.coreModel;
                        if (core) {
                            core.setParameterValueById('ParamAngleX', faceRig.head.degrees.y);
                            core.setParameterValueById('ParamAngleY', faceRig.head.degrees.x);
                            core.setParameterValueById('ParamAngleZ', faceRig.head.degrees.z);
                            core.setParameterValueById('ParamEyeLOpen', faceRig.eye.l);
                            core.setParameterValueById('ParamEyeROpen', faceRig.eye.r);

                            // Lip Sync Priority (MANUAL CONSTANT MOTION FIX)
                            let lipSyncValue = null;
                            
                            // If Tanu is talking (Manual MP3, Cloud Audio, or TTS), use constant rhythmic motion
                            const isTalking = (audioRef.current && !audioRef.current.paused) || isSpeakingRef.current;
                            
                            if (isTalking) {
                                // Constant "Talking" animation: Rhythmic open/close that never stops while audio is on
                                lipSyncValue = (Math.sin(performance.now() / 80) + 1) / 2 * 0.85;
                            }

                            if (lipSyncValue !== null) {
                                core.setParameterValueById('ParamMouthOpenY', lipSyncValue);
                            } else {
                                core.setParameterValueById('ParamMouthOpenY', faceRig.mouth.y);
                            }
                        }
                    }
                }

                if (handResult.landmarks && handResult.landmarks.length > 0) {
                    const finger = handResult.landmarks[0][8];
                    if (onTrackingUpdate) onTrackingUpdate({ x: 1 - finger.x, y: finger.y });
                } else if (onTrackingUpdate) {
                    onTrackingUpdate(null);
                }
            } catch (e) {
                console.warn('[VTUBER] Render Cycle skipped:', e);
            }

            if (isMounted) requestRef.current = requestAnimationFrame(renderLoop);
        };

        const init = async () => {
            try {
                log("Starting Engine...");
                await setupCamera();
                log("Camera Active");
                await initMediaPipe();
                log("Vision Ready");
                await initLive2D();
                if (isMounted) requestRef.current = requestAnimationFrame(renderLoop);
            } catch (err: any) {
                log(`Initialization Fault: ${err.message}`);
            }
        };

        init();

        return () => {
            log('Engine: Cleanup...');
            isMounted = false;
            if (requestRef.current) cancelAnimationFrame(requestRef.current);

            // 1. Destroy WebGL/WebWorker memory contexts for MediaPipe to prevent background tab crashes
            try {
                if (faceLandmarkerRef.current) {
                    faceLandmarkerRef.current.close();
                    faceLandmarkerRef.current = null;
                }
                if (handLandmarkerRef.current) {
                    handLandmarkerRef.current.close();
                    handLandmarkerRef.current = null;
                }
            } catch (err) {
                console.warn("MediaPipe GC Error:", err);
            }

            // 2. Destroy PixiJS Canvas and Purge GPU Textures safely (Leave DOM to React)
            if (appRef.current) {
                try {
                    appRef.current.ticker.stop();
                    if (modelRef.current) modelRef.current.destroy({ children: true, texture: true, baseTexture: true });
                    // Explicitly pass 'false' to prevent PixiJS from deleting the React-owned <canvas> tag
                    appRef.current.destroy(false, { children: true, texture: true, baseTexture: true });
                } catch (e) {
                    console.warn("PixiJS GC Error:", e);
                }
            }

            // 3. Kill Webcam Feed Stream
            if (videoRef.current?.srcObject) {
                (videoRef.current.srcObject as MediaStream).getTracks().forEach(t => {
                    t.stop();
                    videoRef.current!.srcObject = null;
                });
            }

            // 4. Close Audio Context explicit garbage collection to prevent the 6-instance hard browser crash
            if (audioContextRef.current) {
                audioContextRef.current.close().catch(console.warn);
                audioContextRef.current = null;
            }
        };
    }, []);

    return (
        <div className="absolute inset-0 w-full h-full rounded-3xl overflow-hidden bg-indigo-950 z-10">
            {/* New recently generated background (Corrected Asset Path & Fit) */}
            <img 
                src="/thumbnails/tooth_kingdom_throne_bg.png" 
                className="absolute inset-0 w-full h-full object-fill z-0"
                style={{ 
                    imageRendering: 'auto',
                    filter: 'contrast(1.1) saturate(1.1) brightness(1.02) drop-shadow(0 0 2px rgba(255,255,255,0.15))',
                    WebkitFontSmoothing: 'antialiased'
                }}
                alt="Tooth Kingdom Background"
            />

            <video ref={videoRef} className="hidden" playsInline autoPlay />
            <canvas
                ref={canvasRef}
                onClick={unlockAudio}
                className="absolute inset-0 w-full h-full object-contain z-10 cursor-pointer"
                style={{ opacity: modelLoaded ? 1 : 0 }}
            />

            {/* Voice Status is now handled by Parent for "Outside" positioning */}
        </div>
    );
}));
