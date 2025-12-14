import { Link } from 'react-router-dom';
import {
    ArrowRight,
    Layout,
    Clock,
    Shield,
    MessageSquare,
    Play,
    Zap,
    Network,
    Check
} from 'lucide-react';
import { NeuralBackground } from '@/components/VisualEffects';

export default function LandingPage() {
    return (
        <div className="min-h-screen bg-[#050507] overflow-x-hidden selection:bg-cyan-500/30 selection:text-cyan-100 flex flex-col font-sans">
            {/* Header / Nav */}
            <header className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-[#050507]/80 backdrop-blur-xl">
                <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <img src="/logo.png" alt="BriefFlow Logo" className="w-8 h-8 object-contain drop-shadow-[0_0_10px_rgba(6,182,212,0.5)]" />
                        <span className="text-xl font-bold text-white tracking-tight">
                            Brief<span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-cyan-200">Flow</span>
                        </span>
                    </div>

                    <nav className="hidden md:flex items-center gap-8">
                        <a href="#features" className="text-sm font-medium text-white/60 hover:text-white transition-colors">Características</a>
                        <a href="#how-it-works" className="text-sm font-medium text-white/60 hover:text-white transition-colors">Cómo funciona</a>
                        <a href="#pricing" className="text-sm font-medium text-white/60 hover:text-white transition-colors">Precios</a>
                    </nav>

                    <div className="flex items-center gap-4">
                        <Link to="/login" className="hidden sm:block text-sm font-medium text-white/60 hover:text-white transition-colors">
                            Iniciar Sesión
                        </Link>
                        <Link to="/signup">
                            <button className="relative group overflow-hidden rounded-xl bg-cyan-500 px-5 py-2.5 text-sm font-semibold text-black transition-all hover:bg-cyan-400 hover:shadow-[0_0_20px_rgba(6,182,212,0.4)]">
                                <span className="relative z-10 flex items-center gap-2">
                                    Comenzar Gratis
                                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
                                </span>
                            </button>
                        </Link>
                    </div>
                </div>
            </header>

            {/* Hero Section */}
            <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden flex flex-col justify-center min-h-[90vh]">
                {/* Neural Network Background Restored */}
                <NeuralBackground />

                {/* Vignette Overlay */}
                <div className="absolute inset-0 bg-gradient-to-b from-[#050507]/80 via-transparent to-[#050507] z-0 pointer-events-none" />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,#050507_100%)] z-0 pointer-events-none" />

                <div className="max-w-7xl mx-auto px-6 relative z-10 text-center">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cyan-500/5 border border-cyan-500/20 mb-8 animate-fade-in backdrop-blur-md shadow-[0_0_20px_rgba(6,182,212,0.1)]">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
                        </span>
                        <span className="text-sm font-medium text-cyan-200">Plataforma Inteligente v2.0 (Live)</span>
                    </div>

                    <h1 className="text-5xl lg:text-7xl font-bold text-white tracking-tight mb-8 leading-[1.1] max-w-5xl mx-auto animate-fade-in text-shadow-glow">
                        Tu Agencia Creativa, <br className="hidden sm:block" />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-cyan-200 to-cyan-400 animate-gradient-x bg-[length:200%_auto]">Sincronizada al Máximo.</span>
                    </h1>

                    <p className="text-xl text-white/50 mb-10 max-w-2xl mx-auto leading-relaxed animate-fade-in">
                        Centraliza briefs, feedback, entregas y clientes en un solo ecosistema inteligente. Deja el caos y enfócate en crear.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in relative z-20">
                        <Link to="/signup" className="w-full sm:w-auto">
                            <button className="w-full sm:w-auto px-8 py-4 rounded-xl bg-cyan-500 font-bold text-black text-lg hover:bg-cyan-400 hover:scale-105 transition-all duration-300 shadow-[0_0_30px_rgba(6,182,212,0.3)]">
                                Iniciar Prueba Gratis
                            </button>
                        </Link>
                        <button className="w-full sm:w-auto px-8 py-4 rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm hover:bg-white/10 text-white font-medium text-lg transition-all flex items-center justify-center gap-2">
                            <Play className="w-5 h-5 fill-current" />
                            Ver Demo en 1 min
                        </button>
                    </div>

                    {/* Stats */}
                    <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto border-t border-white/5 pt-8 animate-fade-in" style={{ animationDelay: '300ms' }}>
                        {[
                            { label: 'Agencias', value: '500+' },
                            { label: 'Proyectos', value: '12k+' },
                            { label: 'Ahorro Tiempo', value: '40%' },
                            { label: 'Soporte', value: '24/7' },
                        ].map((stat, i) => (
                            <div key={i}>
                                <div className="text-2xl font-bold text-white">{stat.value}</div>
                                <div className="text-sm text-cyan-500/60 uppercase tracking-wider font-semibold">{stat.label}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Features Grid */}
            <section id="features" className="py-24 bg-[#050507] border-t border-white/5 relative z-10">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">Arquitectura de Alto Rendimiento</h2>
                        <p className="text-white/40 max-w-2xl mx-auto">
                            Todo lo que necesitas para escalar tu agencia, integrado en una interfaz premium.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {[
                            {
                                icon: Layout,
                                title: 'Gestión Neural de Proyectos',
                                desc: 'Kanban inteligente que visualiza el estado de cada tarea al instante.'
                            },
                            {
                                icon: MessageSquare,
                                title: 'Feedback Sincronizado',
                                desc: 'Elimina cadenas de correos. Comentarios directos en cada asset.'
                            },
                            {
                                icon: Network,
                                title: 'Portal Cliente Interconectado',
                                desc: 'Un espacio VIP para que tus clientes aprueben entregas sin registrarse.'
                            },
                            {
                                icon: Clock,
                                title: 'Cronogramas Precisos',
                                desc: 'Control total de deadlines con notificaciones automáticas inteligentes.'
                            },
                            {
                                icon: Shield,
                                title: 'Seguridad Blindada',
                                desc: 'Encriptación de punta a punta para proteger la propiedad intelectual.'
                            },
                            {
                                icon: Zap,
                                title: 'Automatización Flash',
                                desc: 'Genera contratos y facturas en segundos, no horas.'
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

            {/* How it Works Section */}
            <section id="how-it-works" className="py-24 bg-[#030304] border-t border-white/5">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="flex flex-col lg:flex-row items-center gap-16">
                        <div className="lg:w-1/2">
                            <h2 className="text-3xl lg:text-4xl font-bold text-white mb-6">
                                Flujo de trabajo <span className="text-cyan-400">sin interrupciones</span>
                            </h2>
                            <div className="space-y-8">
                                {[
                                    {
                                        step: '01',
                                        title: 'Crea el Proyecto',
                                        desc: 'Define el brief, asigna al equipo y establece los plazos en segundos.'
                                    },
                                    {
                                        step: '02',
                                        title: 'Colabora en Tiempo Real',
                                        desc: 'Sube archivos, recibe feedback del cliente y ajusta diseños en el mismo lugar.'
                                    },
                                    {
                                        step: '03',
                                        title: 'Entrega y Factura',
                                        desc: 'Obtén la aprobación final y genera la factura automáticamente.'
                                    }
                                ].map((item, i) => (
                                    <div key={i} className="flex gap-6 relative">
                                        {i !== 2 && <div className="absolute left-[19px] top-10 bottom-[-32px] w-[2px] bg-white/5" />}
                                        <div className="w-10 h-10 rounded-full bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 font-bold shrink-0">
                                            {item.step}
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-bold text-white mb-2">{item.title}</h3>
                                            <p className="text-white/40">{item.desc}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="lg:w-1/2 relative">
                            <div className="absolute -inset-4 bg-cyan-500/20 rounded-3xl blur-3xl opacity-30" />
                            <div className="relative rounded-2xl border border-white/10 bg-[#050507] p-2 shadow-2xl">
                                <div className="aspect-[4/3] rounded-xl bg-gray-900 border border-white/5 flex items-center justify-center overflow-hidden relative">
                                    <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 via-transparent to-transparent" />
                                    {/* Abstract Visualization of Workflow */}
                                    <div className="w-3/4 h-3/4 bg-[#0A0A0C] rounded-lg border border-white/10 p-4 relative">
                                        <div className="flex gap-4 mb-4">
                                            <div className="w-1/3 h-24 bg-white/5 rounded animate-pulse" />
                                            <div className="w-1/3 h-24 bg-white/5 rounded animate-pulse" style={{ animationDelay: '100ms' }} />
                                            <div className="w-1/3 h-24 bg-white/5 rounded animate-pulse" style={{ animationDelay: '200ms' }} />
                                        </div>
                                        <div className="h-2 bg-cyan-500/20 rounded w-1/2 mb-2" />
                                        <div className="h-2 bg-white/10 rounded w-full" />

                                        <div className="absolute bottom-4 right-4 px-3 py-1 bg-cyan-500 text-black text-xs font-bold rounded-full">
                                            Aprobado
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Pricing Section */}
            <section id="pricing" className="py-24 bg-[#050507] border-t border-white/5 relative bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(to_bottom,white,transparent)]">
                <div className="max-w-7xl mx-auto px-6 relative z-10">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">Planes para cada etapa</h2>
                        <p className="text-white/40">Comienza gratis y escala a medida que creces.</p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                        {/* Starter Plan */}
                        <div className="p-8 rounded-2xl bg-[#0A0A0C] border border-white/5 flex flex-col items-start hover:border-white/10 transition-colors">
                            <h3 className="text-lg font-medium text-white mb-2">Freelancer</h3>
                            <div className="text-3xl font-bold text-white mb-6">$0 <span className="text-sm font-normal text-white/40">/mes</span></div>
                            <ul className="space-y-4 mb-8 flex-1">
                                <li className="flex items-center gap-3 text-white/60 text-sm">
                                    <Check className="w-4 h-4 text-cyan-400" /> 1 Usuario
                                </li>
                                <li className="flex items-center gap-3 text-white/60 text-sm">
                                    <Check className="w-4 h-4 text-cyan-400" /> 2 Proyectos Activos
                                </li>
                                <li className="flex items-center gap-3 text-white/60 text-sm">
                                    <Check className="w-4 h-4 text-cyan-400" /> 1GB Almacenamiento
                                </li>
                            </ul>
                            <button className="w-full py-3 rounded-xl border border-white/10 text-white font-medium hover:bg-white/5 transition-colors">
                                Empezar Gratis
                            </button>
                        </div>

                        {/* Pro Plan (Featured) */}
                        <div className="p-8 rounded-2xl bg-[#0A0A0C] border border-cyan-500/50 relative shadow-[0_0_30px_rgba(6,182,212,0.1)] scale-105">
                            <div className="absolute top-0 right-0 px-3 py-1 bg-cyan-500 text-black text-xs font-bold rounded-bl-xl rounded-tr-lg">
                                POPULAR
                            </div>
                            <h3 className="text-lg font-medium text-white mb-2">Estudio</h3>
                            <div className="text-3xl font-bold text-white mb-6">$29 <span className="text-sm font-normal text-white/40">/mes</span></div>
                            <ul className="space-y-4 mb-8 flex-1">
                                <li className="flex items-center gap-3 text-white text-sm">
                                    <Check className="w-4 h-4 text-cyan-400" /> 5 Usuarios
                                </li>
                                <li className="flex items-center gap-3 text-white text-sm">
                                    <Check className="w-4 h-4 text-cyan-400" /> Proyectos Ilimitados
                                </li>
                                <li className="flex items-center gap-3 text-white text-sm">
                                    <Check className="w-4 h-4 text-cyan-400" /> Portal de Clientes
                                </li>
                                <li className="flex items-center gap-3 text-white text-sm">
                                    <Check className="w-4 h-4 text-cyan-400" /> 50GB Almacenamiento
                                </li>
                            </ul>
                            <button className="w-full py-3 rounded-xl bg-cyan-500 text-black font-bold hover:bg-cyan-400 transition-colors shadow-lg shadow-cyan-500/20">
                                Prueba de 14 días
                            </button>
                        </div>

                        {/* Agency Plan */}
                        <div className="p-8 rounded-2xl bg-[#0A0A0C] border border-white/5 flex flex-col items-start hover:border-white/10 transition-colors">
                            <h3 className="text-lg font-medium text-white mb-2">Agencia</h3>
                            <div className="text-3xl font-bold text-white mb-6">$99 <span className="text-sm font-normal text-white/40">/mes</span></div>
                            <ul className="space-y-4 mb-8 flex-1">
                                <li className="flex items-center gap-3 text-white/60 text-sm">
                                    <Check className="w-4 h-4 text-cyan-400" /> Usuarios Ilimitados
                                </li>
                                <li className="flex items-center gap-3 text-white/60 text-sm">
                                    <Check className="w-4 h-4 text-cyan-400" /> Marca Blanca (Tu Logo)
                                </li>
                                <li className="flex items-center gap-3 text-white/60 text-sm">
                                    <Check className="w-4 h-4 text-cyan-400" /> API Access
                                </li>
                                <li className="flex items-center gap-3 text-white/60 text-sm">
                                    <Check className="w-4 h-4 text-cyan-400" /> 1TB Almacenamiento
                                </li>
                            </ul>
                            <button className="w-full py-3 rounded-xl border border-white/10 text-white font-medium hover:bg-white/5 transition-colors">
                                Contactar Ventas
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Final */}
            <section className="py-32 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-t from-cyan-900/10 to-[#050507]" />
                <div className="max-w-4xl mx-auto px-6 relative z-10 text-center">
                    <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6 tracking-tight">
                        ¿Listo para transformar tu agencia?
                    </h2>
                    <p className="text-xl text-white/50 mb-10">
                        Únete a las agencias que ya están operando al siguiente nivel. Sin tarjeta de crédito requerida.
                    </p>
                    <Link to="/signup">
                        <button className="px-10 py-5 rounded-2xl bg-white text-black font-bold text-xl hover:bg-cyan-50 transition-all shadow-[0_0_40px_rgba(255,255,255,0.1)] hover:scale-105">
                            Comenzar Ahora Gratis
                        </button>
                    </Link>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-12 border-t border-white/5 bg-[#030304]">
                <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="flex items-center gap-2">
                        <img src="/logo.png" alt="BriefFlow Logo" className="w-8 h-8 object-contain opacity-80 grayscale hover:grayscale-0 transition-all" />
                        <span className="font-bold text-white">BriefFlow</span>
                    </div>
                    <p className="text-sm text-white/30">
                        © 2024 BriefFlow System. Todos los derechos reservados.
                    </p>
                    <div className="flex gap-6">
                        <a href="#" className="text-white/40 hover:text-cyan-400 transition-colors hover:scale-110 transform">X</a>
                        <a href="#" className="text-white/40 hover:text-cyan-400 transition-colors hover:scale-110 transform">LinkedIn</a>
                        <a href="#" className="text-white/40 hover:text-cyan-400 transition-colors hover:scale-110 transform">Instagram</a>
                    </div>
                </div>
            </footer>
        </div>
    );
}
