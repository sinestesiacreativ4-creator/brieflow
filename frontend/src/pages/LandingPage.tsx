import { Link } from 'react-router-dom';
import {
    ArrowRight,
    Layout,
    Clock,
    Shield,
    MessageSquare,
    Play,
    Zap,
    Cpu,
    Network
} from 'lucide-react';
import { NeuralBackground, BriefFlowLogo } from '@/components/VisualEffects';

export default function LandingPage() {
    return (
        <div className="min-h-screen bg-[#050507] overflow-x-hidden selection:bg-cyan-500/30 selection:text-cyan-100 flex flex-col">
            {/* Header / Nav */}
            <header className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-[#050507]/80 backdrop-blur-xl">
                <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <BriefFlowLogo size="md" />
                        <span className="text-xl font-bold text-white tracking-tight">
                            Brief<span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-cyan-200">Flow</span>
                        </span>
                    </div>

                    <div className="flex items-center gap-4">
                        <Link to="/login" className="hidden sm:block text-sm font-medium text-white/60 hover:text-white transition-colors">
                            Iniciar Sesión
                        </Link>
                        <Link to="/signup">
                            <button className="relative group overflow-hidden rounded-xl bg-cyan-500 px-5 py-2.5 text-sm font-semibold text-black transition-all hover:bg-cyan-400">
                                <span className="relative z-10 flex items-center gap-2">
                                    Comenzar Gratis
                                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
                                </span>
                                <div className="absolute inset-0 -translate-x-full group-hover:translate-x-0 bg-white/20 transition-transform duration-300" />
                            </button>
                        </Link>
                    </div>
                </div>
            </header>

            {/* Hero Section */}
            <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden flex-1 flex flex-col justify-center min-h-[90vh]">
                {/* Neural Network Background */}
                <NeuralBackground />

                {/* Vignette Overlay for readability */}
                <div className="absolute inset-0 bg-gradient-to-b from-[#050507]/80 via-transparent to-[#050507] z-0 pointer-events-none" />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,#050507_100%)] z-0 pointer-events-none" />

                <div className="max-w-7xl mx-auto px-6 relative z-10 text-center">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cyan-500/5 border border-cyan-500/20 mb-8 animate-fade-in backdrop-blur-md shadow-[0_0_20px_rgba(6,182,212,0.1)]">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
                        </span>
                        <span className="text-sm font-medium text-cyan-200">IA Neural Core 2.0 Activado</span>
                    </div>

                    <h1 className="text-5xl lg:text-7xl font-bold text-white tracking-tight mb-8 leading-[1.1] max-w-5xl mx-auto animate-fade-in shadow-black drop-shadow-2xl">
                        Gestión Creativa Potenciada por <br className="hidden sm:block" />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-cyan-200 to-cyan-400 animate-gradient-x bg-[length:200%_auto]">Inteligencia Neural</span>
                    </h1>

                    <p className="text-xl text-white/50 mb-10 max-w-2xl mx-auto leading-relaxed animate-fade-in drop-shadow-md" style={{ animationDelay: '100ms' }}>
                        Conecta a tu equipo, clientes y proyectos en una red de productividad sin fricción. La plataforma definitiva para agencias del futuro.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in relative z-20" style={{ animationDelay: '200ms' }}>
                        <Link to="/signup" className="w-full sm:w-auto">
                            <button className="relative w-full sm:w-auto px-8 py-4 rounded-xl bg-cyan-500 font-bold text-black text-lg shadow-[0_0_30px_rgba(6,182,212,0.4)] hover:shadow-[0_0_50px_rgba(6,182,212,0.6)] hover:scale-105 transition-all duration-300">
                                <span className="flex items-center justify-center gap-2">
                                    <Zap className="w-5 h-5 fill-black" />
                                    Iniciar Red Neural
                                </span>
                            </button>
                        </Link>
                        <button className="w-full sm:w-auto px-8 py-4 rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm hover:bg-white/10 text-white font-medium text-lg transition-all flex items-center justify-center gap-2">
                            <Play className="w-5 h-5 fill-current" />
                            Ver Demo
                        </button>
                    </div>

                    {/* Tech Stack Visual */}
                    <div className="mt-24 flex justify-center gap-8 opacity-40 grayscale hover:grayscale-0 transition-all duration-500">
                        <Cpu className="w-10 h-10 animate-pulse text-cyan-500" style={{ animationDelay: '0ms' }} />
                        <Network className="w-10 h-10 animate-pulse text-purple-500" style={{ animationDelay: '500ms' }} />
                        <Zap className="w-10 h-10 animate-pulse text-amber-500" style={{ animationDelay: '1000ms' }} />
                    </div>
                </div>
            </section>

            {/* Features Grid */}
            <section className="py-24 bg-[#050507] border-t border-white/5 relative z-10">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">Arquitectura de Alto Rendimiento</h2>
                        <p className="text-white/40 max-w-2xl mx-auto">
                            Sistema diseñado para procesar flujos de trabajo complejos con velocidad de la luz.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {[
                            {
                                icon: Layout,
                                title: 'Gestión Neural',
                                desc: 'Kanban inteligente que predice cuellos de botella antes de que ocurran.'
                            },
                            {
                                icon: MessageSquare,
                                title: 'Feedback Sincronizado',
                                desc: 'Comunicación en tiempo real con latencia cero entre agencia y cliente.'
                            },
                            {
                                icon: Network,
                                title: 'Portal Interconectado',
                                desc: 'Nodos de acceso dedicados para que tus clientes aprueben entregas.'
                            },
                            {
                                icon: Clock,
                                title: 'Cronogramas Cuánticos',
                                desc: 'Seguimiento preciso de cada milisegundo invertido en tus proyectos.'
                            },
                            {
                                icon: Shield,
                                title: 'Cifrado de Grado Militar',
                                desc: 'Tus datos protegidos por capas de seguridad impenetrables.'
                            },
                            {
                                icon: Zap,
                                title: 'Automatización Flash',
                                desc: 'Genera contratos y facturas a la velocidad del pensamiento.'
                            }
                        ].map((feature, i) => (
                            <div key={i} className="group relative p-8 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-cyan-500/30 transition-all duration-300 overflow-hidden">
                                <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                                <div className="relative z-10">
                                    <div className="w-14 h-14 rounded-2xl bg-gray-900 border border-white/10 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:border-cyan-500/50 group-hover:shadow-[0_0_20px_rgba(6,182,212,0.2)] transition-all duration-300">
                                        <feature.icon className="w-7 h-7 text-white/50 group-hover:text-cyan-400 transition-colors" />
                                    </div>
                                    <h3 className="text-xl font-bold text-white mb-3 group-hover:text-cyan-400 transition-colors">
                                        {feature.title}
                                    </h3>
                                    <p className="text-white/40 leading-relaxed group-hover:text-white/60 transition-colors">
                                        {feature.desc}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-12 border-t border-white/5 bg-[#030304]">
                <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="flex items-center gap-2">
                        <BriefFlowLogo size="sm" />
                        <span className="font-bold text-white">
                            Brief<span className="text-cyan-400">Flow</span>
                        </span>
                    </div>
                    <p className="text-sm text-white/30">
                        © 2024 BriefFlow System. Todos los derechos reservados.
                    </p>
                    <div className="flex gap-6">
                        <a href="#" className="text-white/40 hover:text-cyan-400 transition-colors hover:scale-110 transform">X</a>
                        <a href="#" className="text-white/40 hover:text-cyan-400 transition-colors hover:scale-110 transform">Link</a>
                        <a href="#" className="text-white/40 hover:text-cyan-400 transition-colors hover:scale-110 transform">Ig</a>
                    </div>
                </div>
            </footer>
        </div>
    );
}
