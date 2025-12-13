import { useEffect, useRef } from 'react';

interface ParticlesProps {
    color?: string;
    count?: number;
    className?: string;
    interactive?: boolean;
}

export function ParticlesBackground({
    color = '#2563eb', // Blue-600
    count = 80,
    className = '',
    interactive = true
}: ParticlesProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const mouseRef = useRef({ x: 0, y: 0 });

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let animationFrameId: number;
        let particles: Array<{
            x: number;
            y: number;
            dx: number;
            dy: number;
            size: number;
            alpha: number;
            originalX?: number;
            originalY?: number;
        }> = [];

        // Track mouse position
        const handleMouseMove = (e: MouseEvent) => {
            const rect = canvas.getBoundingClientRect();
            mouseRef.current = {
                x: e.clientX - rect.left,
                y: e.clientY - rect.top
            };
        };

        if (interactive) {
            window.addEventListener('mousemove', handleMouseMove);
        }

        const resizeCanvas = () => {
            canvas.width = canvas.parentElement?.clientWidth || window.innerWidth;
            canvas.height = canvas.parentElement?.clientHeight || window.innerHeight;
            initParticles();
        };

        const initParticles = () => {
            particles = [];
            for (let i = 0; i < count; i++) {
                particles.push({
                    x: Math.random() * canvas.width,
                    y: Math.random() * canvas.height,
                    dx: (Math.random() - 0.5) * 1.5,
                    dy: (Math.random() - 0.5) * 1.5,
                    size: Math.random() * 3 + 2, // Larger: 2 to 5px
                    alpha: Math.random() * 0.4 + 0.4 // More visible: 0.4 to 0.8
                });
            }
        };

        const drawParticles = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // Parse color
            const hexColor = color.replace('#', '');
            const r = parseInt(hexColor.substring(0, 2), 16);
            const g = parseInt(hexColor.substring(2, 4), 16);
            const b = parseInt(hexColor.substring(4, 6), 16);

            // Connect mouse to particles
            const mouseX = mouseRef.current.x;
            const mouseY = mouseRef.current.y;

            particles.forEach((particle, i) => {
                // Update position
                particle.x += particle.dx;
                particle.y += particle.dy;

                // Bounce off edges
                if (particle.x < 0 || particle.x > canvas.width) particle.dx *= -1;
                if (particle.y < 0 || particle.y > canvas.height) particle.dy *= -1;

                // Draw particle
                ctx.beginPath();
                ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${particle.alpha})`;
                ctx.fill();

                // Connect particles to each other (The "Net" Effect)
                for (let j = i + 1; j < particles.length; j++) {
                    const other = particles[j];
                    const dx = particle.x - other.x;
                    const dy = particle.y - other.y;
                    const distance = Math.sqrt(dx * dx + dy * dy);

                    if (distance < 140) { // Increased connection distance
                        ctx.beginPath();
                        ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, ${0.35 * (1 - distance / 140)})`; // Increased opacity
                        ctx.lineWidth = 1;
                        ctx.moveTo(particle.x, particle.y);
                        ctx.lineTo(other.x, other.y);
                        ctx.stroke();
                    }
                }

                // Connect to Mouse (Interactive Effect)
                if (interactive) {
                    const dx = particle.x - mouseX;
                    const dy = particle.y - mouseY;
                    const distance = Math.sqrt(dx * dx + dy * dy);

                    if (distance < 180) { // Increased interaction radius
                        ctx.beginPath();
                        ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, ${0.5 * (1 - distance / 180)})`; // Stronger mouse connection
                        ctx.lineWidth = 1.5;
                        ctx.moveTo(particle.x, particle.y);
                        ctx.lineTo(mouseX, mouseY);
                        ctx.stroke();

                        // Attraction to mouse
                        if (distance > 50) {
                            particle.x -= dx * 0.03; // Stronger attraction
                            particle.y -= dy * 0.03;
                        }
                    }
                }
            });

            animationFrameId = requestAnimationFrame(drawParticles);
        };

        window.addEventListener('resize', resizeCanvas);
        resizeCanvas();
        drawParticles();

        return () => {
            window.removeEventListener('resize', resizeCanvas);
            if (interactive) {
                window.removeEventListener('mousemove', handleMouseMove);
            }
            cancelAnimationFrame(animationFrameId);
        };
    }, [color, count, interactive]);

    return (
        <canvas
            ref={canvasRef}
            className={`absolute inset-0 z-0 ${className}`}
            style={{ pointerEvents: 'none' }}
        />
    );
}
