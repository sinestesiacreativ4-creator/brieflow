import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { projectsApi, clientsApi } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    ArrowLeft,
    ArrowRight,
    Check,
    Palette,
    Globe,
    Megaphone,
    Video,
    Package,
    Share2,
    MoreHorizontal,
    Users,
    Sparkles
} from 'lucide-react';
import { useEffect } from 'react';

const projectSchema = z.object({
    name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
    type: z.string().min(1, 'Selecciona un tipo de proyecto'),
    clientId: z.string().min(1, 'Selecciona un cliente'),
    assignedToId: z.string().optional(),
});

type ProjectFormData = z.infer<typeof projectSchema>;

const PROJECT_TYPES = [
    {
        value: 'BRANDING',
        label: 'Branding',
        description: 'Identidad de marca, logo, guidelines',
        icon: Palette,
        color: 'from-purple-500 to-pink-500',
        bgColor: 'bg-purple-50',
        borderColor: 'border-purple-200',
        activeColor: 'border-purple-500 bg-purple-50 ring-2 ring-purple-500/20',
    },
    {
        value: 'WEB_DESIGN',
        label: 'Diseño Web',
        description: 'Websites, landing pages, apps',
        icon: Globe,
        color: 'from-blue-500 to-cyan-500',
        bgColor: 'bg-blue-50',
        borderColor: 'border-blue-200',
        activeColor: 'border-blue-500 bg-blue-50 ring-2 ring-blue-500/20',
    },
    {
        value: 'ADVERTISING_CAMPAIGN',
        label: 'Campaña Publicitaria',
        description: 'Anuncios, creatividades, ads',
        icon: Megaphone,
        color: 'from-orange-500 to-red-500',
        bgColor: 'bg-orange-50',
        borderColor: 'border-orange-200',
        activeColor: 'border-orange-500 bg-orange-50 ring-2 ring-orange-500/20',
    },
    {
        value: 'VIDEO_PRODUCTION',
        label: 'Producción de Video',
        description: 'Videos promocionales, spots',
        icon: Video,
        color: 'from-red-500 to-pink-500',
        bgColor: 'bg-red-50',
        borderColor: 'border-red-200',
        activeColor: 'border-red-500 bg-red-50 ring-2 ring-red-500/20',
    },
    {
        value: 'PACKAGING',
        label: 'Packaging',
        description: 'Diseño de empaques y etiquetas',
        icon: Package,
        color: 'from-emerald-500 to-teal-500',
        bgColor: 'bg-emerald-50',
        borderColor: 'border-emerald-200',
        activeColor: 'border-emerald-500 bg-emerald-50 ring-2 ring-emerald-500/20',
    },
    {
        value: 'SOCIAL_MEDIA',
        label: 'Redes Sociales',
        description: 'Contenido para redes, estrategia',
        icon: Share2,
        color: 'from-pink-500 to-rose-500',
        bgColor: 'bg-pink-50',
        borderColor: 'border-pink-200',
        activeColor: 'border-pink-500 bg-pink-50 ring-2 ring-pink-500/20',
    },
    {
        value: 'OTHER',
        label: 'Otro',
        description: 'Otros tipos de proyectos',
        icon: MoreHorizontal,
        color: 'from-gray-500 to-slate-500',
        bgColor: 'bg-gray-50',
        borderColor: 'border-gray-200',
        activeColor: 'border-gray-500 bg-gray-50 ring-2 ring-gray-500/20',
    },
];

export default function NewProjectPage() {
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [clients, setClients] = useState<any[]>([]);

    const {
        register,
        handleSubmit,
        watch,
        setValue,
        formState: { errors },
    } = useForm<ProjectFormData>({
        resolver: zodResolver(projectSchema),
    });

    const selectedType = watch('type');
    const selectedClientId = watch('clientId');

    useEffect(() => {
        loadClients();
    }, []);

    const loadClients = async () => {
        try {
            const clientsRes = await clientsApi.getAll();
            setClients(clientsRes.data.clients || []);
        } catch (error) {
            console.error('Error loading clients:', error);
        }
    };

    const onSubmit = async (data: ProjectFormData) => {
        setError('');
        setIsLoading(true);

        try {
            const response = await projectsApi.create(data);
            navigate(`/projects/${response.data.id}`);
        } catch (err: any) {
            setError(err.response?.data?.error || 'Error al crear el proyecto');
        } finally {
            setIsLoading(false);
        }
    };

    const nextStep = () => {
        if (step === 1 && !watch('name')) {
            setError('Ingresa un nombre para el proyecto');
            return;
        }
        if (step === 1 && !selectedType) {
            setError('Selecciona un tipo de proyecto');
            return;
        }
        setError('');
        setStep(step + 1);
    };

    const prevStep = () => {
        setError('');
        setStep(step - 1);
    };

    const getSelectedTypeInfo = () => PROJECT_TYPES.find(t => t.value === selectedType);

    return (
        <div className="max-w-3xl mx-auto">
            {/* Header */}
            <div className="mb-8">
                <Button variant="ghost" onClick={() => navigate('/projects')} className="mb-4">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Volver a proyectos
                </Button>
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/25">
                        <Sparkles className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Crear Nuevo Proyecto</h1>
                        <p className="text-gray-500">Configura tu proyecto en simples pasos</p>
                    </div>
                </div>
            </div>

            {/* Progress Steps */}
            <div className="flex items-center gap-4 mb-8">
                {[1, 2].map((s) => (
                    <div key={s} className="flex items-center">
                        <div
                            className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm transition-all ${step >= s
                                ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30'
                                : 'bg-gray-100 text-gray-400'
                                }`}
                        >
                            {step > s ? <Check className="w-5 h-5" /> : s}
                        </div>
                        {s < 2 && (
                            <div
                                className={`w-24 h-1 mx-3 rounded-full transition-all ${step > s ? 'bg-blue-600' : 'bg-gray-200'
                                    }`}
                            />
                        )}
                    </div>
                ))}
            </div>

            {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)}>
                {/* Step 1: Project Info */}
                {step === 1 && (
                    <Card className="animate-fade-in">
                        <CardHeader>
                            <CardTitle>Información del Proyecto</CardTitle>
                            <CardDescription>Define el nombre y tipo de proyecto</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-8">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Nombre del Proyecto</label>
                                <Input
                                    {...register('name')}
                                    placeholder="Ej: Rebranding Empresa XYZ"
                                    className="text-lg py-6"
                                    error={errors.name?.message}
                                />
                                {errors.name && (
                                    <p className="mt-2 text-sm text-red-500">{errors.name.message}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-4">
                                    ¿Qué tipo de proyecto necesitas?
                                </label>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {PROJECT_TYPES.map((type) => {
                                        const Icon = type.icon;
                                        const isSelected = selectedType === type.value;

                                        return (
                                            <button
                                                key={type.value}
                                                type="button"
                                                onClick={() => setValue('type', type.value)}
                                                className={`relative p-5 rounded-2xl border-2 text-left transition-all duration-300 group ${isSelected
                                                    ? type.activeColor
                                                    : `border-gray-200 hover:${type.borderColor} hover:${type.bgColor}`
                                                    }`}
                                            >
                                                <div className="flex items-start gap-4">
                                                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${type.color} flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform`}>
                                                        <Icon className="w-6 h-6" />
                                                    </div>
                                                    <div className="flex-1">
                                                        <p className="font-semibold text-gray-900 text-lg">{type.label}</p>
                                                        <p className="text-sm text-gray-500 mt-1">{type.description}</p>
                                                    </div>
                                                    {isSelected && (
                                                        <div className="absolute top-3 right-3 w-6 h-6 rounded-full bg-green-500 flex items-center justify-center">
                                                            <Check className="w-4 h-4 text-white" />
                                                        </div>
                                                    )}
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            <div className="flex justify-end pt-4 border-t border-gray-100">
                                <Button type="button" onClick={nextStep} size="lg">
                                    Siguiente
                                    <ArrowRight className="w-4 h-4 ml-2" />
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Step 2: Client Selection */}
                {step === 2 && (
                    <Card className="animate-fade-in">
                        <CardHeader>
                            <div className="flex items-center gap-3 mb-2">
                                {(() => {
                                    const typeInfo = getSelectedTypeInfo();
                                    if (!typeInfo) return null;
                                    const Icon = typeInfo.icon;
                                    return (
                                        <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${typeInfo.color} flex items-center justify-center text-white`}>
                                            <Icon className="w-5 h-5" />
                                        </div>
                                    );
                                })()}
                                <div>
                                    <CardTitle>Seleccionar Cliente</CardTitle>
                                    <CardDescription>Elige el cliente para este proyecto de {getSelectedTypeInfo()?.label}</CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {clients.length === 0 ? (
                                <div className="text-center py-12">
                                    <div className="w-16 h-16 rounded-2xl bg-blue-100 flex items-center justify-center mx-auto mb-4">
                                        <Users className="w-8 h-8 text-blue-600" />
                                    </div>
                                    <p className="text-gray-500 mb-4">No tienes clientes registrados</p>
                                    <Button variant="outline" onClick={() => navigate('/clients')}>
                                        Agregar cliente primero
                                    </Button>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {clients.map((client) => (
                                        <button
                                            key={client.id}
                                            type="button"
                                            onClick={() => setValue('clientId', client.id)}
                                            className={`w-full p-5 rounded-2xl border-2 text-left transition-all duration-300 ${selectedClientId === client.id
                                                ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-500/20'
                                                : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                                                }`}
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-blue-500/25">
                                                    {client.name.charAt(0).toUpperCase()}
                                                </div>
                                                <div className="flex-1">
                                                    <p className="font-semibold text-gray-900 text-lg">{client.name}</p>
                                                    <p className="text-sm text-gray-500">{client.email}</p>
                                                    {client.company && (
                                                        <p className="text-xs text-gray-400 mt-1">{client.company}</p>
                                                    )}
                                                </div>
                                                {selectedClientId === client.id && (
                                                    <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center">
                                                        <Check className="w-5 h-5 text-white" />
                                                    </div>
                                                )}
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            )}

                            <div className="flex justify-between pt-6 border-t border-gray-100">
                                <Button type="button" variant="outline" onClick={prevStep} size="lg">
                                    <ArrowLeft className="w-4 h-4 mr-2" />
                                    Anterior
                                </Button>
                                <Button type="submit" loading={isLoading} disabled={!selectedClientId} size="lg">
                                    Crear Proyecto
                                    <Sparkles className="w-4 h-4 ml-2" />
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                )}
            </form>
        </div>
    );
}
