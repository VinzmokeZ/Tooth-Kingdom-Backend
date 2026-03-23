import React, { useRef, useEffect, useState } from 'react';
import { GameProps } from './types';
import { ChevronLeft, CheckCircle } from 'lucide-react';

interface ExternalGameWrapperProps extends GameProps {
    url: string;
    chapterId?: number;
}

export function ExternalGameWrapper({ url, onComplete, onExit, chapterId }: ExternalGameWrapperProps) {
    const iframeRef = useRef<HTMLIFrameElement>(null);
    const outerRef = useRef<HTMLDivElement>(null);

    /*
     * Measure the ACTUAL container element (not window).
     */
    const [dims, setDims] = useState({ w: 375, h: 812 });

    useEffect(() => {
        const measure = () => {
            if (outerRef.current) {
                const r = outerRef.current.getBoundingClientRect();
                setDims({ w: Math.round(r.width), h: Math.round(r.height) });
            }
        };
        measure();
        const ro = new ResizeObserver(measure);
        if (outerRef.current) ro.observe(outerRef.current);
        return () => ro.disconnect();
    }, []);

    const landscapeW = dims.h;
    const landscapeH = dims.w;

    /* ── Touch-guard refs: prevent touch→click double-fire ── */
    const exitTouchFired = useRef(false);
    const claimTouchFired = useRef(false);

    /* Shared CSS for overlay pill buttons */
    const pillBase: React.CSSProperties = {
        position: 'absolute',
        zIndex: 200,
        display: 'flex',
        alignItems: 'center',
        gap: 4,
        padding: '7px 14px',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        border: '1px solid rgba(255,255,255,0.18)',
        borderRadius: 999,
        color: '#fff',
        fontWeight: 800,
        fontSize: 11,
        letterSpacing: '0.09em',
        textTransform: 'uppercase',
        cursor: 'pointer',
        minHeight: 44,
        minWidth: 44,
        transition: 'transform 0.08s, opacity 0.08s',
        WebkitTapHighlightColor: 'transparent',
        /* Critical: prevents long-press context menu & text selection */
        touchAction: 'manipulation',
        userSelect: 'none',
        WebkitUserSelect: 'none',
        // @ts-ignore
        WebkitTouchCallout: 'none',
        MozUserSelect: 'none',
        boxShadow: '0 2px 10px rgba(0,0,0,0.55)',
    };

    return (
        <div
            ref={outerRef}
            style={{
                position: 'absolute',
                inset: 0,
                overflow: 'hidden',
                backgroundColor: '#000',
            }}
        >
            {/* Inner landscape container - Dynamic based on viewport */}
            <div
                style={{
                    position: 'absolute',
                    width: dims.w >= dims.h ? '100%' : landscapeW,
                    height: dims.w >= dims.h ? '100%' : landscapeH,
                    top: dims.w >= dims.h ? '0' : '50%',
                    left: dims.w >= dims.h ? '0' : '50%',
                    transform: dims.w >= dims.h ? 'none' : 'translate(-50%, -50%) rotate(-90deg)',
                    transformOrigin: 'center center',
                    overflow: 'hidden',
                    backgroundColor: '#000',
                }}
            >
                {/* ── GAME IFRAME ── */}
                <iframe
                    ref={iframeRef}
                    src={url}
                    style={{
                        position: 'absolute',
                        inset: 0,
                        width: '100%',
                        height: '100%',
                        border: 'none',
                        backgroundColor: '#000',
                    }}
                    allow="autoplay; fullscreen; keyboard; gamepad"
                    title="Game"
                />

                {/* ── MAP button — top-left ── */}
                <button
                    onContextMenu={(e) => e.preventDefault()}
                    onTouchStart={(e) => {
                        e.stopPropagation();
                        exitTouchFired.current = false; // reset on start
                        const b = e.currentTarget as HTMLButtonElement;
                        b.style.opacity = '1';
                        b.style.transform = 'scale(0.90)';
                    }}
                    onTouchEnd={(e) => {
                        e.preventDefault(); // suppress the ghost click
                        e.stopPropagation();
                        const b = e.currentTarget as HTMLButtonElement;
                        b.style.opacity = '0.82';
                        b.style.transform = 'scale(1)';
                        exitTouchFired.current = true;
                        onExit?.();
                    }}
                    onClick={(e) => {
                        e.stopPropagation();
                        if (exitTouchFired.current) {
                            exitTouchFired.current = false;
                            return; // already handled by touch
                        }
                        onExit?.();
                    }}
                    style={{
                        ...pillBase,
                        top: 8,
                        left: 8,
                        opacity: 0.82,
                        background: 'rgba(10,16,30,0.82)',
                    }}
                >
                    <ChevronLeft style={{ width: 16, height: 16, flexShrink: 0 }} />
                    Map
                </button>

                {/* ── MOBILE CONTROLS (Chapter 6 Bridge) ── */}
                {chapterId === 6 && (
                    <div 
                        onContextMenu={(e) => e.preventDefault()}
                        style={{
                            position: 'absolute',
                            inset: 0,
                            pointerEvents: 'none',
                            userSelect: 'none',
                            WebkitUserSelect: 'none',
                            // @ts-ignore
                            WebkitTouchCallout: 'none'
                        }}
                    >
                        {/* D-PAD Container */}
                        <div style={{
                            position: 'absolute',
                            bottom: 40,
                            left: 30,
                            zIndex: 300,
                            display: 'grid',
                            gridTemplateColumns: 'repeat(3, 1fr)',
                            gap: 12,
                            pointerEvents: 'auto',
                            touchAction: 'none'
                        }}>
                            <div />
                            <ControlButton icon="⬆️" keyCode={38} iframeRef={iframeRef} />
                            <div />
                            <ControlButton icon="⬅️" keyCode={37} iframeRef={iframeRef} />
                            <div />
                            <ControlButton icon="➡️" keyCode={39} iframeRef={iframeRef} />
                            <div />
                            <ControlButton icon="⬇️" keyCode={40} iframeRef={iframeRef} />
                            <div />
                        </div>

                        {/* Action Buttons Container */}
                        <div style={{
                            position: 'absolute',
                            bottom: 40,
                            right: 40,
                            zIndex: 300,
                            display: 'flex',
                            gap: 20,
                            pointerEvents: 'auto',
                            touchAction: 'none'
                        }}>
                            <ControlButton icon="SPACE" keyCode={32} iframeRef={iframeRef} wide />
                            <ControlButton icon="⚔️" keyCode={90} isClick={true} iframeRef={iframeRef} />
                        </div>
                    </div>
                )}

                {/* ── CLAIM button — bottom-right ── */}
                <button
                    onContextMenu={(e) => e.preventDefault()}
                    onTouchStart={(e) => {
                        e.stopPropagation();
                        claimTouchFired.current = false; // reset on start
                        const b = e.currentTarget as HTMLButtonElement;
                        b.style.opacity = '1';
                        b.style.transform = 'scale(0.93)';
                    }}
                    onTouchEnd={(e) => {
                        e.preventDefault(); // suppress the ghost click
                        e.stopPropagation();
                        const b = e.currentTarget as HTMLButtonElement;
                        b.style.opacity = '0.88';
                        b.style.transform = 'scale(1)';
                        claimTouchFired.current = true;
                        onComplete?.(600, 3);
                    }}
                    onClick={(e) => {
                        e.stopPropagation();
                        if (claimTouchFired.current) {
                            claimTouchFired.current = false;
                            return; // already handled by touch
                        }
                        onComplete?.(600, 3);
                    }}
                    style={{
                        ...pillBase,
                        bottom: 8,
                        right: 8,
                        zIndex: 400,
                        opacity: 0.88,
                        background: 'rgba(22,163,74,0.88)',
                    }}
                >
                    <CheckCircle style={{ width: 15, height: 15, flexShrink: 0 }} />
                    Claim
                </button>
            </div>
        </div>
    );
}

// ── Internal Helper for Mobile Controls ──
function ControlButton({ icon, keyCode, iframeRef, wide = false, isClick = false }: {
    icon: string;
    keyCode: number;
    iframeRef: React.RefObject<HTMLIFrameElement>;
    wide?: boolean;
    isClick?: boolean;
}) {
    const [isPressed, setIsPressed] = useState(false);

    const dispatchKey = (type: 'keydown' | 'keyup') => {
        if (!iframeRef.current?.contentWindow) return;
        try {
            const event = new KeyboardEvent(type, {
                keyCode: keyCode,
                which: keyCode,
                key: keyCode === 32 ? ' ' : undefined,
                bubbles: true,
                cancelable: true
            });
            iframeRef.current.contentWindow.dispatchEvent(event);
            iframeRef.current.contentWindow.document.dispatchEvent(event);

            if (isClick && type === 'keydown') {
                const mouseEvent = new MouseEvent('mousedown', {
                    bubbles: true, cancelable: true,
                    view: iframeRef.current.contentWindow, button: 0
                });
                iframeRef.current.contentWindow.dispatchEvent(mouseEvent);
                iframeRef.current.contentWindow.document.dispatchEvent(mouseEvent);
            } else if (isClick && type === 'keyup') {
                const mouseEvent = new MouseEvent('mouseup', {
                    bubbles: true, cancelable: true,
                    view: iframeRef.current.contentWindow, button: 0
                });
                iframeRef.current.contentWindow.dispatchEvent(mouseEvent);
                iframeRef.current.contentWindow.document.dispatchEvent(mouseEvent);
            }
        } catch (e) {
            console.warn('Touch bridge restricted.');
        }
    };

    const handlePressStart = (e: React.TouchEvent | React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (isPressed) return;
        setIsPressed(true);
        dispatchKey('keydown');
    };

    const handlePressEnd = (e: React.TouchEvent | React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (!isPressed) return;
        setIsPressed(false);
        dispatchKey('keyup');
    };

    return (
        <button
            onContextMenu={(e) => {
                e.preventDefault();
                e.stopPropagation();
            }}
            onTouchStart={handlePressStart}
            onTouchEnd={handlePressEnd}
            onTouchCancel={handlePressEnd}
            onMouseDown={handlePressStart}
            onMouseUp={handlePressEnd}
            onMouseLeave={handlePressEnd}
            style={{
                width: wide ? 100 : 70,
                height: 70,
                background: isPressed ? 'rgba(255, 255, 255, 0.4)' : 'rgba(255, 255, 255, 0.15)',
                backdropFilter: 'blur(12px)',
                WebkitBackdropFilter: 'blur(12px)',
                border: isPressed ? '2px solid #fff' : '1px solid rgba(255, 255, 255, 0.3)',
                borderRadius: 20,
                color: 'white',
                fontWeight: 900,
                fontSize: wide ? 14 : 22,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                WebkitTapHighlightColor: 'transparent',
                userSelect: 'none',
                WebkitUserSelect: 'none',
                // @ts-ignore
                WebkitTouchCallout: 'none',
                touchAction: 'none',
                cursor: 'pointer',
                transform: isPressed ? 'scale(0.92)' : 'scale(1)',
                transition: 'transform 0.05s, background 0.05s',
                boxShadow: isPressed ? 'none' : '0 4px 12px rgba(0,0,0,0.3)',
            }}
        >
            {icon}
        </button>
    );
}
