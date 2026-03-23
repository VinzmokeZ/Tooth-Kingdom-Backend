import React from 'react';
import { motion } from 'framer-motion';

export const AnimatedBackground = () => {
    return (
        <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
            {[...Array(4)].map((_, i) => (
                <motion.div
                    key={`global-bubble-${i}`}
                    className="absolute rounded-full blur-[100px] mix-blend-multiply dark:mix-blend-screen"
                    style={{
                        background: ['#8BE9FD', '#FFB86C', '#FF6AC1', '#C5B3E6'][i % 4],
                        opacity: 0.25,
                        width: 600 + (i * 200),
                        height: 600 + (i * 200),
                        left: i === 0 ? '-10%' : i === 1 ? '30%' : i === 2 ? '60%' : '-15%',
                        top: i === 0 ? '-15%' : i === 1 ? '50%' : i === 2 ? '-10%' : '60%',
                    }}
                    animate={{
                        x: [0, 150, 0, -150, 0],
                        y: [0, -150, 0, 150, 0],
                        scale: [1, 1.2, 1],
                        rotate: [0, 90, 180, 270, 360]
                    }}
                    transition={{
                        duration: 25 + (i * 5),
                        repeat: Infinity,
                        ease: "linear"
                    }}
                />
            ))}
        </div>
    );
};
