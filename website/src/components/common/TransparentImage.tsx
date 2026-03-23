import React, { useRef, useEffect, useState } from 'react';

interface TransparentImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
    src: string;
    className?: string;
    tolerance?: number; // How close to white/grey to remove (0-255)
    locked?: boolean;
}

/**
 * A specialized component that removes 'fake transparency' checkerboards 
 * (white/grey tiles) from images in real-time using Canvas.
 */
export function TransparentImage({ src, className, tolerance = 30, ...props }: TransparentImageProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [isReady, setIsReady] = useState(false);

    useEffect(() => {
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.src = src;

        img.onload = () => {
            const canvas = canvasRef.current;
            if (!canvas) return;

            const ctx = canvas.getContext('2d', { willReadFrequently: true });
            if (!ctx) return;

            // Set canvas size to match image
            canvas.width = img.width;
            canvas.height = img.height;

            // Draw image to canvas
            ctx.drawImage(img, 0, 0);

            // Get image data
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const data = imageData.data;

            // Pixel iteration: every pixel is 4 elements (R, G, B, A)
            for (let i = 0; i < data.length; i += 4) {
                const r = data[i];
                const g = data[i + 1];
                const b = data[i + 2];

                // Target 1: Pure White (#FFFFFF)
                const isWhite = r > 240 && g > 240 && b > 240;

                // Target 2: Standard Checkerboard Grey (#CCCCCC to #EEEEEE)
                const isGrey = Math.abs(r - g) < 5 && Math.abs(g - b) < 5 && r > 180 && r < 240;

                if (isWhite || isGrey) {
                    // Set Alpha to 0 (Transparent)
                    data[i + 3] = 0;
                }
            }

            // Put the modified data back
            ctx.putImageData(imageData, 0, 0);
            setIsReady(true);
        };
    }, [src]);

    return (
        <div className={`relative ${className}`}>
            {/* Hidden source image to maintain layout sizing if needed, or for fallback */}
            <img
                src={src}
                style={{ opacity: 0, position: 'absolute', width: '100%', height: '100%' }}
                {...props}
                alt=""
            />
            <canvas
                ref={canvasRef}
                className={`w-full h-full object-contain ${isReady ? 'opacity-100' : 'opacity-0'} transition-all duration-500 ${props.locked ? 'grayscale contrast-75 brightness-75 opacity-60' : ''}`}
                style={{ display: 'block' }}
            />
        </div>
    );
}
