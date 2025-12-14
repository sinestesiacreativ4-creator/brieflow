import { useState } from 'react';
import { useAuthStore } from '@/lib/auth';
import { agencyApi } from '@/lib/api';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
    Building,
    CreditCard,
    Bell,
    CheckCircle2,
    Crown,
    Download,
    Sparkles,
    Loader2,
} from 'lucide-react';
import { NotificationSettings } from '@/components/NotificationSettings';

const settingsSchema = z.object({
    name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
    primaryColor: z.string(),
});

type SettingsFormData = z.infer<typeof settingsSchema>;

const COLORS = [
    { value: '#f59e0b', name: 'Oro' },
    { value: '#8b5cf6', name: 'Violeta' },
    { value: '#ec4899', name: 'Rosa' },
    { value: '#ef4444', name: 'Rojo' },
    { value: '#f97316', name: 'Naranja' },
    { value: '#22c55e', name: 'Verde' },
    { value: '#14b8a6', name: 'Teal' },
    { value: '#0ea5e9', name: 'Celeste' },
    { value: '#3b82f6', name: 'Azul' },
    { value: '#06b6d4', name: 'Cyan' },
];

export default function SettingsPage() {
    const { agency, user } = useAuthStore();
    const [activeTab, setActiveTab] = useState('profile');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);

    const isAdmin = user?.role === 'AGENCY_ADMIN';

    const {
        register,
        handleSubmit,
        watch,
        setValue,
        formState: { errors },
    } = useForm<SettingsFormData>({
        resolver: zodResolver(settingsSchema),
        defaultValues: {
            name: agency?.name || '',
            primaryColor: agency?.primaryColor || '#f59e0b',
        },
    });

    const selectedColor = watch('primaryColor');

    const onSubmit = async (data: SettingsFormData) => {
        setIsSubmitting(true);
        setSuccess(false);

        try {
            await agencyApi.update(data);
            setSuccess(true);
            setTimeout(() => setSuccess(false), 3000);
        } catch (error) {
            console.error('Error updating settings:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const tabs = [
        { id: 'profile', label: 'Perfil', icon: Building },
        { id: 'billing', label: 'Facturación', icon: CreditCard },
        { id: 'notifications', label: 'Notificaciones', icon: Bell },
    ];

    return (
        <div className="space-y-8">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-white">Configuración</h1>
                <p className="text-white/50 mt-2">Gestiona la configuración de tu agencia</p>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 p-1.5 bg-white/5 rounded-xl border border-white/10 w-fit">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center gap-2.5 px-5 py-3 rounded-lg text-sm font-medium transition-all ${activeTab === tab.id
                                ? 'bg-gradient-to-r from-amber-500/20 to-amber-500/10 text-amber-400 border border-amber-500/30'
                                : 'text-white/50 hover:text-white/70'
                            }`}
                    >
                        <tab.icon className="w-4 h-4" />
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Profile Tab */}
            {activeTab === 'profile' && (
                <div className="card-luxury p-8 animate-fade-in">
                    <div className="mb-8">
                        <h2 className="text-xl font-bold text-white">Perfil de la Agencia</h2>
                        <p className="text-white/50 mt-1">Personaliza la información y apariencia</p>
                    </div>

                    {success && (
                        <div className="mb-6 p-4 bg-emerald-500/15 border border-emerald-500/30 rounded-xl text-sm text-emerald-400 flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4" />
                            Configuración guardada correctamente
                        </div>
                    )}

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                        <div>
                            <label className="label">Nombre de la Agencia</label>
                            <input
                                {...register('name')}
                                placeholder="Mi Agencia Creativa"
                                disabled={!isAdmin}
                                className="input-luxury"
                            />
                            {errors.name && (
                                <p className="mt-2 text-sm text-red-400">{errors.name.message}</p>
                            )}
                        </div>

                        <div>
                            <label className="label">Subdominio</label>
                            <input
                                value={agency?.subdomain || ''}
                                disabled
                                className="input-luxury opacity-50"
                            />
                            <p className="mt-2 text-xs text-white/30">
                                El subdominio no puede ser modificado
                            </p>
                        </div>

                        <div>
                            <label className="label">Color Primario</label>
                            <div className="flex flex-wrap gap-3 mt-3">
                                {COLORS.map((color) => (
                                    <button
                                        key={color.value}
                                        type="button"
                                        onClick={() => setValue('primaryColor', color.value)}
                                        disabled={!isAdmin}
                                        className={`w-11 h-11 rounded-xl transition-all duration-200 ${selectedColor === color.value
                                                ? 'ring-2 ring-offset-2 ring-offset-gray-900 ring-white scale-110'
                                                : 'hover:scale-105 opacity-70 hover:opacity-100'
                                            }`}
                                        style={{ backgroundColor: color.value }}
                                        title={color.name}
                                    />
                                ))}
                            </div>
                        </div>

                        {isAdmin && (
                            <div className="pt-4">
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="btn-luxury"
                                >
                                    {isSubmitting ? (
                                        <>
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                            Guardando...
                                        </>
                                    ) : (
                                        'Guardar Cambios'
                                    )}
                                </button>
                            </div>
                        )}
                    </form>
                </div>
            )}

            {/* Billing Tab */}
            {activeTab === 'billing' && (
                <div className="space-y-6 animate-fade-in">
                    {/* Current Plan */}
                    <div className="card-luxury p-8 border-amber-500/20">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                            <div className="flex items-center gap-5">
                                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-500/20 to-amber-500/5 border border-amber-500/30 flex items-center justify-center">
                                    <Crown className="w-8 h-8 text-amber-400" />
                                </div>
                                <div>
                                    <p className="text-sm text-amber-400 font-medium">Plan Actual</p>
                                    <p className="text-3xl font-bold text-white mt-1">Pro</p>
                                    <p className="text-sm text-white/40 mt-1">$79/mes • Facturación mensual</p>
                                </div>
                            </div>
                            <button className="btn-secondary-luxury">
                                <Sparkles className="w-4 h-4" />
                                Cambiar Plan
                            </button>
                        </div>
                    </div>

                    {/* Payment Method */}
                    <div className="card-luxury p-8">
                        <h3 className="text-lg font-semibold text-white mb-6">Método de Pago</h3>
                        <div className="flex items-center justify-between p-5 rounded-xl border border-white/10 bg-white/[0.02]">
                            <div className="flex items-center gap-4">
                                <div className="w-14 h-9 bg-gradient-to-r from-blue-500 to-blue-700 rounded-lg flex items-center justify-center text-white text-xs font-bold tracking-wider">
                                    VISA
                                </div>
                                <div>
                                    <p className="font-medium text-white">•••• •••• •••• 4242</p>
                                    <p className="text-xs text-white/40">Expira 12/25</p>
                                </div>
                            </div>
                            <button className="btn-ghost-luxury text-amber-400">Editar</button>
                        </div>
                    </div>

                    {/* Invoice History */}
                    <div className="card-luxury overflow-hidden">
                        <div className="p-6 border-b border-white/5">
                            <h3 className="text-lg font-semibold text-white">Historial de Facturas</h3>
                        </div>
                        <div className="divide-y divide-white/5">
                            {[
                                { date: 'Dic 2024', amount: '$79.00', status: 'Pagado' },
                                { date: 'Nov 2024', amount: '$79.00', status: 'Pagado' },
                                { date: 'Oct 2024', amount: '$79.00', status: 'Pagado' },
                            ].map((invoice, i) => (
                                <div key={i} className="flex items-center justify-between p-5 hover:bg-white/[0.02] transition-colors">
                                    <div>
                                        <p className="font-medium text-white">{invoice.date}</p>
                                        <p className="text-sm text-white/40">{invoice.amount}</p>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <span className="badge-success">{invoice.status}</span>
                                        <button className="btn-ghost-luxury text-white/50 hover:text-white">
                                            <Download className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Notifications Tab */}
            {activeTab === 'notifications' && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-fade-in">
                    {/* Push Notifications Settings */}
                    <NotificationSettings />

                    {/* Email/In-App Notification Preferences */}
                    <div className="card-luxury p-8">
                        <div className="mb-8">
                            <h2 className="text-xl font-bold text-white">Preferencias</h2>
                            <p className="text-white/50 mt-1">Configura qué eventos quieres recibir</p>
                        </div>

                        <div className="space-y-6">
                            {[
                                { title: 'Brief completado', description: 'Cuando un cliente completa un brief', enabled: true },
                                { title: 'Nuevo mensaje', description: 'Cuando recibes un mensaje en el chat', enabled: true },
                                { title: 'Archivo subido', description: 'Cuando se sube un nuevo archivo', enabled: false },
                                { title: 'Cambio de estado', description: 'Cuando un proyecto cambia de estado', enabled: true },
                                { title: 'Recordatorios', description: 'Recordatorios de proyectos pendientes', enabled: false },
                            ].map((notification, i) => (
                                <div key={i} className="flex items-center justify-between">
                                    <div>
                                        <p className="font-medium text-white">{notification.title}</p>
                                        <p className="text-sm text-white/40">{notification.description}</p>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input
                                            type="checkbox"
                                            defaultChecked={notification.enabled}
                                            className="sr-only peer"
                                        />
                                        <div className="w-11 h-6 bg-white/10 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-amber-500/30 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white/30 peer-checked:after:bg-gray-900 after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
                                    </label>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
