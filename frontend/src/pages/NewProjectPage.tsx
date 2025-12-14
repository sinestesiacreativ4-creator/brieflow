<option value="" disabled>Selecciona un cliente</option>
{
    Array.isArray(clients) && clients.map(client => (
        <option key={client.id} value={client.id} className="bg-gray-900 text-white">
            {client.name} ({client.companyName})
        </option>
    ))
}
                                </select >

const PROJECT_TYPES = [
    { id: 'BRANDING', label: 'Branding', icon: PenTool, desc: 'Identidad de marca, logo, guidelines', color: 'text-purple-400 bg-purple-500/10 border-purple-500/20' },
    { id: 'WEB_DESIGN', label: 'Diseño Web', icon: Globe, desc: 'Websites, landing pages, apps', color: 'text-blue-400 bg-blue-500/10 border-blue-500/20' },
    { id: 'ADVERTISING_CAMPAIGN', label: 'Campaña Publicitaria', icon: Megaphone, desc: 'Anuncios, creatividades, ads', color: 'text-orange-400 bg-orange-500/10 border-orange-500/20' },
    { id: 'VIDEO_PRODUCTION', label: 'Producción de Video', icon: Video, desc: 'Videos promocionales, spots', color: 'text-red-400 bg-red-500/10 border-red-500/20' },
    { id: 'PACKAGING', label: 'Packaging', icon: Package, desc: 'Diseño de empaques y etiquetas', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' },
    { id: 'SOCIAL_MEDIA', label: 'Redes Sociales', icon: Share2, desc: 'Contenido para redes, estrategia', color: 'text-pink-400 bg-pink-500/10 border-pink-500/20' },
    { id: 'OTHER', label: 'Otro', icon: MoreHorizontal, desc: 'Otros tipos de proyectos', color: 'text-gray-400 bg-gray-500/10 border-gray-500/20' }
];

export default function NewProjectPage() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const clientFromUrl = searchParams.get('client');
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [clients, setClients] = useState<any[]>([]);

    // Form state
    const [formData, setFormData] = useState({
        name: '',
        type: '',
        clientId: clientFromUrl || '',
        description: '',
        deadline: ''
    });

    useEffect(() => {
        const loadClients = async () => {
            try {
                const response = await clientsApi.getAll();
                // Verificación de seguridad: asegurar que sea un array
                const data = response.data;
                if (Array.isArray(data)) {
                    setClients(data);
                } else if (data && Array.isArray(data.data)) {
                    setClients(data.data);
                } else {
                    console.warn('Formato de respuesta de clientes inesperado:', data);
                    setClients([]);
                }
            } catch (error) {
                console.error('Error loading clients:', error);
                setClients([]);
            }
        };
        loadClients();
    }, []);

    const handleCreateProject = async () => {
        if (!formData.name || !formData.type || !formData.clientId) {
            // Simple validation
            return;
        }

        setLoading(true);
        try {
            const response = await projectsApi.create({
                name: formData.name,
                type: formData.type,
                clientId: formData.clientId,
                description: formData.description,
                deadline: formData.deadline ? new Date(formData.deadline).toISOString() : undefined,
                status: 'BRIEFING'
            });

            navigate(`/projects/${response.data.id}`);
        } catch (error) {
            console.error('Error creating project:', error);
            // Handle error (toast, alert, etc.)
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto py-12 px-4">
            {/* Ambient background */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-20 left-1/4 w-96 h-96 bg-cyan-500/[0.03] rounded-full blur-[100px]" />
            </div>

            {/* Stepper */}
            <div className="flex items-center justify-center mb-12 relative z-10">
                <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg transition-all duration-300 ${step >= 1 ? 'bg-cyan-500 text-black shadow-lg shadow-cyan-500/20' : 'bg-gray-800 text-gray-400 border border-gray-700'
                        }`}>
                        1
                    </div>
                    <div className={`w-16 h-1 rounded-full transition-colors duration-300 ${step >= 2 ? 'bg-cyan-500' : 'bg-gray-800'
                        }`} />
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg transition-all duration-300 ${step >= 2 ? 'bg-cyan-500 text-black shadow-lg shadow-cyan-500/20' : 'bg-gray-800 text-gray-400 border border-gray-700'
                        }`}>
                        2
                    </div>
                </div>
            </div>

            <div className="card-luxury p-8 relative z-10 animate-fade-in">
                {step === 1 ? (
                    <div className="space-y-8">
                        <div className="text-center mb-8">
                            <h1 className="text-3xl font-bold text-white mb-2">Información del Proyecto</h1>
                            <p className="text-white/40">Define el nombre y tipo de proyecto para comenzar.</p>
                        </div>

                        <div className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-white/70 ml-1">Nombre del Proyecto</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="Ej: Rebranding Empresa XYZ"
                                    className="input-luxury w-full text-lg py-3"
                                    autoFocus
                                />
                            </div>

                            <div className="space-y-4">
                                <label className="text-sm font-medium text-white/70 ml-1">¿Qué tipo de proyecto necesitas?</label>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {PROJECT_TYPES.map((type) => (
                                        <button
                                            key={type.id}
                                            onClick={() => setFormData({ ...formData, type: type.id })}
                                            className={`flex items-start gap-4 p-4 rounded-xl border text-left transition-all duration-200 group relative overflow-hidden ${formData.type === type.id
                                                ? 'bg-cyan-500/10 border-cyan-500 ring-1 ring-cyan-500/50'
                                                : 'bg-gray-900/40 border-gray-800 hover:border-gray-700 hover:bg-gray-800/60'
                                                }`}
                                        >
                                            <div className={`p-3 rounded-lg ${type.color}`}>
                                                <type.icon className="w-6 h-6" />
                                            </div>
                                            <div>
                                                <h3 className={`font-semibold mb-1 transition-colors ${formData.type === type.id ? 'text-cyan-400' : 'text-white group-hover:text-white/90'}`}>
                                                    {type.label}
                                                </h3>
                                                <p className="text-sm text-white/40 leading-relaxed">
                                                    {type.desc}
                                                </p>
                                            </div>
                                            {formData.type === type.id && (
                                                <div className="absolute top-3 right-3">
                                                    <CheckCircle2 className="w-5 h-5 text-cyan-500" />
                                                </div>
                                            )}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end pt-6 border-t border-white/5">
                            <button
                                onClick={() => setStep(2)}
                                disabled={!formData.name || !formData.type}
                                className="btn-luxury px-8 py-3 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Siguiente
                                <ArrowRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-8 animate-fade-in">
                        <div className="text-center mb-8">
                            <h1 className="text-3xl font-bold text-white mb-2">Detalles y Cliente</h1>
                            <p className="text-white/40">Asigna el proyecto a un cliente y establece los plazos.</p>
                        </div>

                        <div className="space-y-6 max-w-2xl mx-auto">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-white/70 ml-1">Cliente</label>
                                <select
                                    value={formData.clientId}
                                    onChange={(e) => setFormData({ ...formData, clientId: e.target.value })}
                                    className="input-luxury w-full py-3"
                                >
                                    import {useState, useEffect} from 'react';
                                    import {useNavigate, useSearchParams} from 'react-router-dom';
                                    import {projectsApi, clientsApi} from '@/lib/api';
                                    import {
                                        Calendar,
                                        ArrowRight,
                                        Loader2,
                                        CheckCircle2,
                                        Globe,
                                        PenTool,
                                        Megaphone,
                                        Video,
                                        Package,
                                        Share2,
                                        MoreHorizontal
                                    } from 'lucide-react';
                                    {clients.map(client => (
                                        <option key={client.id} value={client.id} className="bg-gray-900 text-white">
                                            {client.name} ({client.companyName})
                                        </option>
                                    ))}
                                </select>
                                <p className="text-xs text-white/30 ml-1">
                                    ¿No encuentras al cliente? <button className="text-cyan-400 hover:underline" onClick={() => navigate('/clients')}>Crear nuevo cliente</button>
                                </p>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-white/70 ml-1">Descripción (Opcional)</label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    placeholder="Breve descripción del proyecto..."
                                    className="input-luxury w-full min-h-[120px] py-3 resize-none"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-white/70 ml-1">Fecha de Entrega Estimada (Deadline)</label>
                                <div className="relative">
                                    <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
                                    <input
                                        type="date"
                                        value={formData.deadline}
                                        onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                                        className="input-luxury w-full pl-11 py-3 text-white placeholder-white/30"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-between items-center pt-8 border-t border-white/5">
                            <button
                                onClick={() => setStep(1)}
                                className="text-white/50 hover:text-white px-4 py-2 transition-colors"
                            >
                                Atrás
                            </button>
                            <button
                                onClick={handleCreateProject}
                                disabled={loading || !formData.clientId}
                                className="btn-luxury px-8 py-3 flex items-center gap-2 min-w-[160px] justify-center"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        Creando...
                                    </>
                                ) : (
                                    <>
                                        <CheckCircle2 className="w-5 h-5" />
                                        Crear Proyecto
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
