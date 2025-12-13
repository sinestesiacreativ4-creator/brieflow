import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
    FileText,
    MessageSquare,
    Upload,
    CheckCircle2,
    ArrowRight,
    Star,
    Shield,
    Globe,
    Layout
} from 'lucide-react';
import { ParticlesBackground } from '@/components/ui/particles-background';

export default function LandingPage() {
    return (
        <div className="min-h-screen bg-white overflow-x-hidden selection:bg-blue-100 selection:text-blue-900">
            {/* Navigation */}
            <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100 transition-all duration-300">
                <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                    <Link to="/" className="flex items-center gap-3 group">
                        <img
                            src="/logo.png"
                            alt="BriefFlow Logo"
                            className="w-12 h-12 object-contain filter drop-shadow-md group-hover:scale-110 group-hover:drop-shadow-xl transition-all duration-300"
                        />
                        <span className="text-2xl font-bold text-gray-900 tracking-tight">Brief<span className="text-blue-600">Flow</span></span>
                    </Link>

                    <nav className="hidden md:flex items-center gap-8">
                        {['Características', 'Precios', 'Testimonios', 'FAQ'].map((item) => (
                            <a
                                key={item}
                                href={`#${item.toLowerCase()}`}
                                className="text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors relative group"
                            >
                                {item}
                                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-600 transition-all duration-300 group-hover:w-full opacity-0 group-hover:opacity-100" />
                            </a>
                        ))}
                    </nav>

                    <div className="flex items-center gap-4">
                        <Link to="/login">
                            <Button variant="ghost" className="hidden sm:flex text-gray-600 hover:text-blue-600 hover:bg-blue-50">Log in</Button>
                        </Link>
                        <Link to="/signup">
                            <Button className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/30 transition-all hover:-translate-y-0.5">
                                Empezar Gratis
                            </Button>
                        </Link>
                    </div>
                </div>
            </header>

            {/* Hero Section */}
            <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
                <ParticlesBackground color="#3b82f6" count={60} />

                {/* Background Decor */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-7xl pointer-events-none">
                    <div className="absolute top-20 left-10 w-72 h-72 bg-blue-400/10 rounded-full blur-3xl mix-blend-multiply animate-pulse" style={{ animationDuration: '4s' }} />
                    <div className="absolute top-40 right-10 w-72 h-72 bg-purple-400/10 rounded-full blur-3xl mix-blend-multiply animate-pulse" style={{ animationDuration: '6s' }} />
                </div>

                <div className="max-w-7xl mx-auto px-6 relative z-10 text-center">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 border border-blue-100 text-blue-600 text-sm font-medium mb-8 animate-fade-in">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                        </span>
                        Nuevo: Sistema de Gestión de Proyectos 2.0
                    </div>

                    <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold text-gray-900 tracking-tight mb-8 leading-[1.1] max-w-4xl mx-auto animate-fade-in px-2" style={{ animationDelay: '0.1s' }}>
                        Gestiona tus proyectos creativos{' '}
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                            sin el caos de siempre
                        </span>
                    </h1>

                    <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-10 leading-relaxed animate-fade-in" style={{ animationDelay: '0.2s' }}>
                        BriefFlow unifica briefs, feedback y entregas en un solo lugar.
                        Diseñado específicamente para agencias que quieren escalar sin perder la cabeza.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in" style={{ animationDelay: '0.3s' }}>
                        <Link to="/signup">
                            <Button size="lg" className="h-14 px-8 text-lg bg-blue-600 hover:bg-blue-700 text-white shadow-xl shadow-blue-500/30 transition-all hover:-translate-y-1">
                                Crear Cuenta Gratis
                                <ArrowRight className="w-5 h-5 ml-2" />
                            </Button>
                        </Link>

                    </div>

                    <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8 text-sm text-gray-500 animate-fade-in" style={{ animationDelay: '0.4s' }}>
                        <div className="flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4 text-green-500" /> No requiere tarjeta
                        </div>
                        <div className="flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4 text-green-500" /> Plan gratuito disponible
                        </div>
                    </div>
                </div>

                {/* Dashboard Mockup - Hidden on very small screens */}
                <div className="mt-20 px-4 animate-fade-in hidden sm:block" style={{ animationDelay: '0.5s' }}>
                    <div className="max-w-5xl mx-auto relative group">
                        <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>
                        <div className="relative bg-white rounded-2xl border border-gray-200 shadow-2xl overflow-hidden ring-1 ring-black/5">
                            {/* Browser Header */}
                            <div className="h-10 bg-gray-50 border-b border-gray-200 flex items-center px-4 gap-2">
                                <div className="flex gap-1.5">
                                    <div className="w-3 h-3 rounded-full bg-red-400" />
                                    <div className="w-3 h-3 rounded-full bg-yellow-400" />
                                    <div className="w-3 h-3 rounded-full bg-green-400" />
                                </div>
                                <div className="ml-4 flex-1 max-w-xl">
                                    <div className="h-6 bg-white rounded-md border border-gray-200 flex items-center px-3 text-xs text-gray-400 font-mono">
                                        app.briefflow.com/dashboard/active-projects
                                    </div>
                                </div>
                            </div>

                            {/* App Interface Mockup */}
                            <div className="flex h-[300px] md:h-[500px] bg-gray-50">
                                {/* Sidebar */}
                                <div className="w-64 bg-white border-r border-gray-200 p-4 hidden md:block">
                                    <div className="space-y-6">
                                        <div className="space-y-1">
                                            <div className="h-8 bg-blue-50 text-blue-600 rounded-lg flex items-center px-3 text-sm font-medium">Dashboard</div>
                                            <div className="h-8 hover:bg-gray-50 text-gray-600 rounded-lg flex items-center px-3 text-sm">Proyectos</div>
                                            <div className="h-8 hover:bg-gray-50 text-gray-600 rounded-lg flex items-center px-3 text-sm">Equipo</div>
                                        </div>
                                        <div className="pt-4 border-t border-gray-100">
                                            <div className="text-xs font-semibold text-gray-400 mb-2 uppercase">Proyectos Activos</div>
                                            <div className="space-y-2">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-2 h-2 rounded-full bg-green-500" />
                                                    <span className="text-sm text-gray-600">Redesign Web</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <div className="w-2 h-2 rounded-full bg-yellow-500" />
                                                    <span className="text-sm text-gray-600">Campaña Q4</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Main Content */}
                                <div className="flex-1 p-8 overflow-hidden">
                                    <div className="flex justify-between items-center mb-8">
                                        <div>
                                            <div className="h-6 w-32 bg-gray-200 rounded mb-2"></div>
                                            <div className="h-4 w-48 bg-gray-100 rounded"></div>
                                        </div>
                                        <div className="h-10 w-32 bg-blue-600 rounded-lg"></div>
                                    </div>

                                    {/* Kanban Board Mockup */}
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
                                        {[
                                            { title: 'Por Hacer', color: 'bg-gray-100', items: 2 },
                                            { title: 'En Progreso', color: 'bg-blue-50', items: 3 },
                                            { title: 'Revisión', color: 'bg-indigo-50', items: 1 }
                                        ].map((col, i) => (
                                            <div key={i} className="flex-1">
                                                <div className="flex items-center justify-between mb-4">
                                                    <span className="text-sm font-semibold text-gray-700">{col.title}</span>
                                                    <span className="bg-gray-100 text-gray-500 text-xs px-2 py-0.5 rounded-full">{col.items}</span>
                                                </div>
                                                <div className="space-y-3">
                                                    {[...Array(col.items)].map((_, j) => (
                                                        <div key={j} className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                                                            <div className="flex gap-2 mb-3">
                                                                <div className="h-1.5 w-12 rounded-full bg-blue-100"></div>
                                                                <div className="h-1.5 w-8 rounded-full bg-purple-100"></div>
                                                            </div>
                                                            <div className="h-4 w-3/4 bg-gray-200 rounded mb-2"></div>
                                                            <div className="h-3 w-1/2 bg-gray-100 rounded mb-4"></div>
                                                            <div className="flex justify-between items-center">
                                                                <div className="flex -space-x-2">
                                                                    <div className="w-6 h-6 rounded-full bg-gray-200 border-2 border-white"></div>
                                                                    <div className="w-6 h-6 rounded-full bg-gray-300 border-2 border-white"></div>
                                                                </div>
                                                                <div className="h-3 w-12 bg-gray-100 rounded"></div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>



            {/* Features Section */}
            <section id="características" className="py-24 px-6 lg:px-8 bg-white relative overflow-hidden">
                <div className="max-w-7xl mx-auto relative z-10">
                    <div className="text-center max-w-3xl mx-auto mb-20">
                        <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-6">
                            Todo lo que necesitas para <span className="text-blue-600">brillar</span>
                        </h2>
                        <p className="text-xl text-gray-600">
                            Olvídate de usar 5 herramientas diferentes. BriefFlow centraliza tu flujo de trabajo creativo.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {[
                            {
                                icon: FileText,
                                title: 'Briefs Inteligentes',
                                desc: 'Formularios dinámicos que guían a tu cliente para obtener la información exacta que necesitas.',
                                color: 'blue'
                            },
                            {
                                icon: MessageSquare,
                                title: 'Chat Contextual',
                                desc: 'Olvídate del "email pong". Comenta directamente sobre los entregables y archiva decisiones.',
                                color: 'indigo'
                            },
                            {
                                icon: Layout,
                                title: 'Kanban Adaptativo',
                                desc: 'Tu tablero se adapta al tipo de proyecto: Video, Web o Branding tienen flujos distintos.',
                                color: 'purple'
                            },
                            {
                                icon: Upload,
                                title: 'Archivos Centralizados',
                                desc: 'No más WeTransfer caducados. Almacenamiento seguro y organizado por proyecto.',
                                color: 'pink'
                            },
                            {
                                icon: Shield,
                                title: 'Portal de Cliente',
                                desc: 'Dales una experiencia VIP con su propio acceso para ver progresos y aprobar entregas.',
                                color: 'emerald'
                            },
                            {
                                icon: Globe,
                                title: 'Accesible 24/7',
                                desc: 'Tu oficina virtual siempre abierta. Accede desde cualquier lugar, cuando la inspiración llegue.',
                                color: 'amber'
                            },
                        ].map((feature, i) => (
                            <div key={i} className="group p-8 rounded-3xl bg-gray-50 hover:bg-white border border-gray-100 hover:border-blue-100 hover:shadow-xl hover:shadow-blue-500/5 transition-all duration-300 hover:-translate-y-1">
                                <div className={`w-14 h-14 rounded-2xl bg-${feature.color}-500/10 flex items-center justify-center mb-6 text-${feature.color}-600 group-hover:scale-110 transition-transform`}>
                                    <feature.icon className="w-7 h-7" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                                <p className="text-gray-600 leading-relaxed">{feature.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Testimonials Section */}
            <section id="testimonios" className="py-24 px-6 lg:px-8 bg-gray-900 text-white relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>

                <div className="max-w-7xl mx-auto relative z-10">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-5xl font-bold mb-6">Amado por directores creativos</h2>
                        <p className="text-xl text-gray-400">Únete a la comunidad que está cambiando la industria.</p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {[
                            {
                                text: "Antes usábamos Email + WhatsApp + Drive. Era un caos. BriefFlow nos devolvió la paz mental y 10 horas a la semana.",
                                author: "María González",
                                role: "Directora Creativa @ Studio M",
                                initial: "M"
                            },
                            {
                                text: "La función de briefs inteligentes es oro puro. Los clientes por fin nos dan la información que necesitamos a la primera.",
                                author: "Carlos Ruiz",
                                role: "Fundador @ PixelPerfect",
                                initial: "C"
                            },
                            {
                                text: "A mis clientes les encanta tener su propio portal. Se ve súper profesional y ha reducido las llamadas de '¿cómo va eso?' a cero.",
                                author: "Sofia L.",
                                role: "Freelance Senior Designer",
                                initial: "S"
                            }
                        ].map((testimonial, i) => (
                            <div key={i} className="bg-white/5 backdrop-blur-lg border border-white/10 p-8 rounded-3xl relative">
                                <div className="absolute top-6 right-8 text-blue-500 opacity-50">
                                    <Star className="w-6 h-6 fill-current" />
                                </div>
                                <p className="text-lg text-gray-300 mb-8 leading-relaxed">"{testimonial.text}"</p>
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-lg font-bold">
                                        {testimonial.initial}
                                    </div>
                                    <div>
                                        <div className="font-semibold text-white">{testimonial.author}</div>
                                        <div className="text-sm text-gray-400">{testimonial.role}</div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Pricing Section */}
            <section id="precios" className="py-24 px-6 lg:px-8 bg-gradient-to-b from-white to-blue-50/30">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center max-w-3xl mx-auto mb-16">
                        <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-6">
                            Invierte en tu tranquilidad
                        </h2>
                        <p className="text-xl text-gray-600">
                            Planes flexibles que crecen contigo. Cancela cuando quieras.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto px-4">
                        {/* Freelance Plan */}
                        <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-lg hover:shadow-xl transition-all">
                            <h3 className="text-xl font-semibold text-gray-900 mb-1">Freelance</h3>
                            <p className="text-sm text-gray-500 mb-6">Para solopreneurs</p>
                            <div className="flex items-baseline gap-1 mb-6">
                                <span className="text-4xl font-bold text-gray-900">$29</span>
                                <span className="text-gray-500">/mes</span>
                            </div>
                            <Link to="/signup" className="w-full">
                                <Button variant="outline" className="w-full mb-8 rounded-xl h-12">Empezar Gratis</Button>
                            </Link>
                            <ul className="space-y-4">
                                {['3 Proyectos activos', '1 Usuario', 'Portal de cliente básico', '1GB almacenamiento'].map((item, i) => (
                                    <li key={i} className="flex items-center gap-3 text-sm text-gray-600">
                                        <CheckCircle2 className="w-5 h-5 text-gray-400 flex-shrink-0" /> {item}
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Studio Plan */}
                        <div className="relative bg-white rounded-3xl p-8 border-2 border-blue-600 shadow-2xl shadow-blue-500/20 md:scale-105 z-10">
                            <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-blue-600 text-white px-4 py-1.5 rounded-full text-sm font-semibold shadow-lg">
                                Más Popular
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-1">Studio</h3>
                            <p className="text-sm text-blue-600 mb-6">Para equipos en crecimiento</p>
                            <div className="flex items-baseline gap-1 mb-6">
                                <span className="text-5xl font-bold text-gray-900">$79</span>
                                <span className="text-gray-500">/mes</span>
                            </div>
                            <Link to="/signup" className="w-full">
                                <Button className="w-full mb-8 rounded-xl h-12 bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/30">
                                    Comenzar prueba de 14 días
                                </Button>
                            </Link>
                            <ul className="space-y-4">
                                {['Proyectos ilimitados', '5 Miembros de equipo', 'Portal de cliente personalizado', '100GB almacenamiento', 'Soporte prioritario'].map((item, i) => (
                                    <li key={i} className="flex items-center gap-3 text-sm text-gray-900 font-medium">
                                        <CheckCircle2 className="w-5 h-5 text-blue-600 flex-shrink-0" /> {item}
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Agency Plan */}
                        <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-lg hover:shadow-xl transition-all">
                            <h3 className="text-xl font-semibold text-gray-900 mb-1">Agency</h3>
                            <p className="text-sm text-gray-500 mb-6">Para operaciones grandes</p>
                            <div className="flex items-baseline gap-1 mb-6">
                                <span className="text-4xl font-bold text-gray-900">$199</span>
                                <span className="text-gray-500">/mes</span>
                            </div>
                            <Link to="/signup" className="w-full">
                                <Button variant="outline" className="w-full mb-8 rounded-xl h-12">Contactar Ventas</Button>
                            </Link>
                            <ul className="space-y-4">
                                {['Todo ilimitado', 'SSO & Seguridad avanzada', 'API Access', 'Onboarding dedicado', 'Contrato personalizado'].map((item, i) => (
                                    <li key={i} className="flex items-center gap-3 text-sm text-gray-600">
                                        <CheckCircle2 className="w-5 h-5 text-gray-400 flex-shrink-0" /> {item}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Footer */}
            <section className="py-24 px-6 lg:px-8 bg-blue-600 text-white overflow-hidden relative">
                <div className="absolute top-0 left-0 w-full h-full">
                    <div className="absolute top-0 left-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
                    <div className="absolute bottom-0 right-0 w-96 h-96 bg-indigo-500/30 rounded-full blur-3xl translate-x-1/2 translate-y-1/2"></div>
                </div>

                <div className="max-w-4xl mx-auto text-center relative z-10">
                    <h2 className="text-4xl md:text-5xl font-bold mb-8">
                        ¿Listo para profesionalizar tu agencia?
                    </h2>
                    <p className="text-xl text-blue-100 mb-10 max-w-2xl mx-auto">
                        Únete a más de 500 agencias que gestionan sus proyectos con BriefFlow.
                    </p>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <Link to="/signup">
                            <Button size="lg" className="h-16 px-10 text-xl bg-white text-blue-600 hover:bg-blue-50 shadow-2xl border-0">
                                Empezar mi prueba gratuita
                            </Button>
                        </Link>
                    </div>
                </div>
            </section>

            {/* Simple Footer */}
            <footer className="py-12 bg-gray-50 border-t border-gray-200 text-center text-gray-500 text-sm">
                <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="flex items-center gap-3 opacity-80 hover:opacity-100 transition-opacity">
                        <img src="/logo.png" alt="BriefFlow" className="w-8 h-8 object-contain" />
                        <span className="font-semibold text-gray-700">BriefFlow</span>
                    </div>
                    <div>
                        © {new Date().getFullYear()} BriefFlow Inc. Todos los derechos reservados.
                    </div>

                </div>
            </footer>
        </div>
    );
}
