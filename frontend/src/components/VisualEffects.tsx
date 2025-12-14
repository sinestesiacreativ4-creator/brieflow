import { useEffect, useRef } from 'react';
import { Zap } from 'lucide-react';

export function NeuralBackground() {
    const canvasRef = useRef<HTMLCanvasElement>(null);


    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let width = canvas.width = window.innerWidth;
        let height = canvas.height = window.innerHeight;

        const particles: Particle[] = [];
        const particleCount = Math.min(window.innerWidth / 10, 100); // Dinámico según pantalla
        const connectionDistance = 150;
        const color = '6, 182, 212'; // Cyan RGB

        class Particle {
            x: number;
            y: number;
            vx: number;
            vy: number;
            size: number;

            constructor() {
                this.x = Math.random() * width;
                this.y = Math.random() * height;
                this.vx = (Math.random() - 0.5) * 0.5;
                this.vy = (Math.random() - 0.5) * 0.5;
                this.size = Math.random() * 2 + 1;
            }

            update() {
                this.x += this.vx;
                this.y += this.vy;

                // Rebotar en bordes
                if (this.x < 0 || this.x > width) this.vx *= -1;
                if (this.y < 0 || this.y > height) this.vy *= -1;
            }

            draw() {
                if (!ctx) return;
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(${color}, 0.5)`;
                ctx.fill();
            }
        }

        // Inicializar partículas
        for (let i = 0; i < particleCount; i++) {
            particles.push(new Particle());
        }

        function animate() {
            if (!ctx) return;
            ctx.clearRect(0, 0, width, height);

            // Actualizar y dibujar partículas
            particles.forEach(p => {
                p.update();
                p.draw();
            });

            // Dibujar conexiones
            for (let i = 0; i < particles.length; i++) {
                for (let j = i + 1; j < particles.length; j++) {
                    const dx = particles[i].x - particles[j].x;
                    const dy = particles[i].y - particles[j].y;
                    const distance = Math.sqrt(dx * dx + dy * dy);

                    if (distance < connectionDistance) {
                        const opacity = 1 - (distance / connectionDistance);
                        ctx.beginPath();
                        ctx.strokeStyle = `rgba(${color}, ${opacity * 0.4})`; // Líneas sutiles
                        ctx.lineWidth = 1;
                        ctx.moveTo(particles[i].x, particles[i].y);
                        ctx.lineTo(particles[j].x, particles[j].y);
                        ctx.stroke();
                    }
                }
            }

            requestAnimationFrame(animate);
        }

        const handleResize = () => {
            width = canvas.width = window.innerWidth;
            height = canvas.height = window.innerHeight;
        };

        window.addEventListener('resize', handleResize);
        animate();

        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            className="absolute inset-0 w-full h-full pointer-events-none opacity-60"
            style={{ zIndex: 0 }}
        />
    );
}

// Logo Component

export function BriefFlowLogo({ className = "", size = "md" }: { className?: string, size?: "sm" | "md" | "lg" | "xl" }) {
    const sizeClasses = {
        sm: "w-6 h-6",
        md: "w-8 h-8",
        lg: "w-12 h-12",
        xl: "w-16 h-16"
    };

    const iconSizes = {
        sm: "w-3 h-3",
        md: "w-4 h-4",
        lg: "w-6 h-6",
        xl: "w-8 h-8"
    };

    return (
        <div className={`relative flex items-center justify-center ${className}`}>
            {/* Outer Glow Ring */}
            <div className={`absolute inset-0 rounded-xl bg-cyan-500/20 blur-md animate-pulse`} />

            {/* Main Container */}
            <div className={`relative ${sizeClasses[size]} rounded-xl bg-gradient-to-br from-gray-900 to-black border border-cyan-500/30 flex items-center justify-center shadow-[0_0_15px_rgba(6,182,212,0.3)]`}>
                {/* Neural Connections (Decoration) */}
                <div className="absolute top-1 right-1 w-1.5 h-1.5 bg-cyan-400 rounded-full animate-ping" style={{ animationDuration: '3s' }} />
                <div className="absolute bottom-1 left-1 w-1 h-1 bg-cyan-600 rounded-full" />

                {/* Core Icon */}
                <div className="relative z-10">
                    <Zap className={`${iconSizes[size]} text-cyan-400 fill-cyan-400/20`} />
                </div>

                {/* Inner Glow */}
                <div className="absolute inset-0 bg-gradient-to-tr from-cyan-500/10 to-transparent rounded-xl" />
            </div>
        </div>
    );
}
