import { Link } from 'react-router-dom';
import {
    Zap,
    CheckCircle2,
    ArrowRight,
    Layout,
    Clock,
    Shield,
    Users,
    MessageSquare,
    Play
} from 'lucide-react';

export default function LandingPage() {
    return (
        <div className="min-h-screen bg-luxury overflow-x-hidden selection:bg-cyan-500/30 selection:text-cyan-100">
            {/* Header / Nav */}
            <header className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-gray-950/80 backdrop-blur-xl">
                <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500/20 to-cyan-500/5 border border-cyan-500/20 flex items-center justify-center">
                                <Zap className="w-5 h-5 text-cyan-400" />
                            </div>
                        </div>
                        <span className="text-xl font-bold text-white tracking-tight">
                            Brief<span className="text-gradient-cyan">Flow</span>
                        </span>
                    </div>

                    <div className="flex items-center gap-4">
                        <Link to="/login" className="hidden sm:block text-sm font-medium text-white/60 hover:text-white transition-colors">
                            Iniciar Sesión
                        </Link>
                        <Link to="/signup">
                            <button className="btn-luxury px-5 py-2.5 text-sm">
                                Comenzar Gratis
                            </button>
                        </Link>
                    </div>
                </div>
            </header>

            {/* Hero Section */}
            <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
                {/* Background Effects */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-7xl pointer-events-none">
                    <div className="absolute top-20 left-1/4 w-[600px] h-[600px] bg-cyan-500/[0.04] rounded-full blur-[120px]" />
                    <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-purple-500/[0.03] rounded-full blur-[100px]" />
                </div>

                <div className="max-w-7xl mx-auto px-6 relative z-10 text-center">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-8 animate-fade-in">
                        <span className="flex h-2 w-2 rounded-full bg-cyan-400 animate-pulse"></span>
                        <span className="text-sm font-medium text-cyan-100/60">Nuevo: Gestión de pagos integrada</span>
                    </div>

                    <h1 className="text-5xl lg:text-7xl font-bold text-white tracking-tight mb-8 leading-tight max-w-4xl mx-auto animate-fade-in">
                        Optimiza tu flujo creativo <br />
                        <span className="text-gradient-cyan">sin fricción.</span>
                    </h1>

                    <p className="text-xl text-white/40 mb-10 max-w-2xl mx-auto leading-relaxed animate-fade-in" style={{ animationDelay: '100ms' }}>
                        La plataforma todo en uno para agencias creativas. Gestiona clientes, briefs, feedback y entregas en un solo lugar.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in" style={{ animationDelay: '200ms' }}>
                        <Link to="/signup" className="w-full sm:w-auto">
                            <button className="btn-luxury w-full sm:w-auto px-8 py-4 text-lg group">
                                <Zap className="w-5 h-5 mr-2 group-hover:text-gray-950 transition-colors" />
                                Empezar ahora
                                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                            </button>
                        </Link>
                        <button className="btn-secondary-luxury w-full sm:w-auto px-8 py-4 text-lg">
                            <Play className="w-5 h-5 mr-2 fill-current" />
                            Ver Demo
                        </button>
                    </div>

                    {/* Dashboard Preview */}
                    <div className="mt-20 relative mx-auto max-w-5xl rounded-2xl border border-white/10 bg-gray-900/50 backdrop-blur shadow-2xl overflow-hidden animate-fade-in" style={{ animationDelay: '400ms' }}>
                        <div className="absolute inset-0 bg-gradient-to-b from-cyan-500/5 to-transparent pointer-events-none" />
                        <div className="p-2 border-b border-white/5 flex items-center gap-2 bg-gray-950/50">
                            <div className="flex gap-1.5 ml-2">
                                <div className="w-3 h-3 rounded-full bg-red-500/20 border border-red-500/50" />
                                <div className="w-3 h-3 rounded-full bg-amber-500/20 border border-amber-500/50" />
                                <div className="w-3 h-3 rounded-full bg-emerald-500/20 border border-emerald-500/50" />
                            </div>
                        </div>
                        <div className="aspect-[16/9] bg-gray-950 p-6 flex flex-col items-center justify-center text-white/20">
                            {/* Placeholder for actual dashboard screenshot */}
                            <Layout className="w-16 h-16 mb-4 opacity-50" />
                            <p className="text-lg">Dashboard Interactivo</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Grid */}
            <section className="py-24 bg-gray-950/50 border-y border-white/5">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">Todo lo que necesitas</h2>
                        <p className="text-white/40 max-w-2xl mx-auto">
                            Herramientas potentes diseñadas específicamente para el flujo de trabajo de agencias modernas.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {[
                            {
                                icon: Layout,
                                title: 'Gestión de Proyectos',
                                desc: 'Kanban intuitivo para visualizar el progreso de cada proyecto en tiempo real.'
                            },
                            {
                                icon: MessageSquare,
                                title: 'Feedback Centralizado',
                                desc: 'Comentarios precisos sobre diseños y videos. Adiós a los emails interminables.'
                            },
                            {
                                icon: Users,
                                title: 'Portal de Clientes',
                                desc: 'Un espacio dedicado para que tus clientes aprueben briefs y entregables.'
                            },
                            {
                                icon: Clock,
                                title: 'Tiempos de Entrega',
                                desc: 'Seguimiento automático de plazos y notificaciones inteligentes.'
                            },
                            {
                                icon: Shield,
                                title: 'Seguridad Total',
                                desc: 'Tus archivos y datos protegidos con encriptación de nivel bancario.'
                            },
                            {
                                icon: Zap,
                                title: 'Automatización',
                                desc: 'Genera contratos, facturas y reportes con un solo clic.'
                            }
                        ].map((feature, i) => (
                            <div key={i} className="card-luxury p-8 hover:border-cyan-500/30 group transition-all duration-300">
                                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-500/10 to-transparent border border-cyan-500/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                                    <feature.icon className="w-7 h-7 text-cyan-400 group-hover:text-cyan-300" />
                                </div>
                                <h3 className="text-xl font-bold text-white mb-3 group-hover:text-cyan-400 transition-colors">
                                    {feature.title}
                                </h3>
                                <p className="text-white/40 leading-relaxed">
                                    {feature.desc}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-12 border-t border-white/5 bg-gray-950">
                <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-cyan-500/20 border border-cyan-500/20 flex items-center justify-center">
                            <Zap className="w-4 h-4 text-cyan-400" />
                        </div>
                        <span className="font-bold text-white">BriefFlow</span>
                    </div>
                    <p className="text-sm text-white/30">
                        © 2024 BriefFlow Inc. Todos los derechos reservados.
                    </p>
                    <div className="flex gap-6">
                        <a href="#" className="text-white/40 hover:text-cyan-400 transition-colors">Twitter</a>
                        <a href="#" className="text-white/40 hover:text-cyan-400 transition-colors">LinkedIn</a>
                        <a href="#" className="text-white/40 hover:text-cyan-400 transition-colors">Instagram</a>
                    </div>
                </div>
            </footer>
        </div>
    );
}
