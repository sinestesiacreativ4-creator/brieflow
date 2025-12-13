import { useState } from 'react';
import { useAuthStore } from '@/lib/auth';
import { agencyApi } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
    Building,
    Palette,
    CreditCard,
    Bell,
    CheckCircle2,
} from 'lucide-react';

const settingsSchema = z.object({
    name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
    primaryColor: z.string(),
});

type SettingsFormData = z.infer<typeof settingsSchema>;

const COLORS = [
    { value: '#6366f1', name: 'Indigo' },
    { value: '#8b5cf6', name: 'Violeta' },
    { value: '#ec4899', name: 'Rosa' },
    { value: '#ef4444', name: 'Rojo' },
    { value: '#f97316', name: 'Naranja' },
    { value: '#eab308', name: 'Amarillo' },
    { value: '#22c55e', name: 'Verde' },
    { value: '#14b8a6', name: 'Teal' },
    { value: '#0ea5e9', name: 'Celeste' },
    { value: '#3b82f6', name: 'Azul' },
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
            primaryColor: agency?.primaryColor || '#6366f1',
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

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Configuración</h1>
                <p className="text-gray-600 mt-1">Gestiona la configuración de tu agencia</p>
            </div>

            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList>
                    <TabsTrigger value="profile">
                        <Building className="w-4 h-4 mr-2" />
                        Perfil
                    </TabsTrigger>
                    <TabsTrigger value="billing">
                        <CreditCard className="w-4 h-4 mr-2" />
                        Facturación
                    </TabsTrigger>
                    <TabsTrigger value="notifications">
                        <Bell className="w-4 h-4 mr-2" />
                        Notificaciones
                    </TabsTrigger>

                </TabsList>

                {/* Profile Tab */}
                <TabsContent value="profile">
                    <Card>
                        <CardHeader>
                            <CardTitle>Perfil de la Agencia</CardTitle>
                            <CardDescription>
                                Personaliza la información y apariencia de tu agencia
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {success && (
                                <div className="mb-6 p-4 bg-green-50 border border-green-100 rounded-xl text-sm text-green-600 flex items-center gap-2">
                                    <CheckCircle2 className="w-4 h-4" />
                                    Configuración guardada correctamente
                                </div>
                            )}

                            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                                <div>
                                    <label className="label">Nombre de la Agencia</label>
                                    <Input
                                        {...register('name')}
                                        placeholder="Mi Agencia Creativa"
                                        disabled={!isAdmin}
                                        error={errors.name?.message}
                                    />
                                    {errors.name && (
                                        <p className="mt-1 text-sm text-red-500">{errors.name.message}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="label">Subdominio</label>
                                    <Input
                                        value={agency?.subdomain || ''}
                                        disabled
                                        className="bg-gray-100"
                                    />
                                    <p className="mt-1 text-xs text-gray-500">
                                        El subdominio no puede ser modificado
                                    </p>
                                </div>

                                <div>
                                    <label className="label">Color Primario</label>
                                    <div className="flex flex-wrap gap-3 mt-2">
                                        {COLORS.map((color) => (
                                            <button
                                                key={color.value}
                                                type="button"
                                                onClick={() => setValue('primaryColor', color.value)}
                                                disabled={!isAdmin}
                                                className={`w-10 h-10 rounded-xl transition-all ${selectedColor === color.value
                                                    ? 'ring-2 ring-offset-2 ring-gray-900 scale-110'
                                                    : 'hover:scale-105'
                                                    }`}
                                                style={{ backgroundColor: color.value }}
                                                title={color.name}
                                            />
                                        ))}
                                    </div>
                                </div>

                                {isAdmin && (
                                    <div className="pt-4">
                                        <Button type="submit" loading={isSubmitting}>
                                            Guardar Cambios
                                        </Button>
                                    </div>
                                )}
                            </form>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Billing Tab */}
                <TabsContent value="billing">
                    <Card>
                        <CardHeader>
                            <CardTitle>Facturación y Suscripción</CardTitle>
                            <CardDescription>
                                Gestiona tu plan y métodos de pago
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="p-6 rounded-xl border border-indigo-200 bg-gradient-to-br from-indigo-50 to-purple-50 mb-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-indigo-600 font-medium">Plan Actual</p>
                                        <p className="text-2xl font-bold text-gray-900 mt-1">Pro</p>
                                        <p className="text-sm text-gray-500 mt-1">$79/mes • Facturación mensual</p>
                                    </div>
                                    <Button variant="outline">Cambiar Plan</Button>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <h4 className="font-medium text-gray-900">Método de Pago</h4>
                                <div className="flex items-center justify-between p-4 border border-gray-200 rounded-xl">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-7 bg-gradient-to-r from-blue-600 to-blue-800 rounded flex items-center justify-center text-white text-xs font-bold">
                                            VISA
                                        </div>
                                        <div>
                                            <p className="font-medium text-gray-900">•••• •••• •••• 4242</p>
                                            <p className="text-xs text-gray-500">Expira 12/25</p>
                                        </div>
                                    </div>
                                    <Button variant="ghost" size="sm">Editar</Button>
                                </div>
                            </div>

                            <div className="mt-8 space-y-4">
                                <h4 className="font-medium text-gray-900">Historial de Facturas</h4>
                                <div className="border border-gray-200 rounded-xl divide-y divide-gray-100">
                                    {[
                                        { date: 'Dic 2024', amount: '$79.00', status: 'Pagado' },
                                        { date: 'Nov 2024', amount: '$79.00', status: 'Pagado' },
                                        { date: 'Oct 2024', amount: '$79.00', status: 'Pagado' },
                                    ].map((invoice, i) => (
                                        <div key={i} className="flex items-center justify-between p-4">
                                            <div>
                                                <p className="font-medium text-gray-900">{invoice.date}</p>
                                                <p className="text-sm text-gray-500">{invoice.amount}</p>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full">
                                                    {invoice.status}
                                                </span>
                                                <Button variant="ghost" size="sm">Descargar</Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Notifications Tab */}
                <TabsContent value="notifications">
                    <Card>
                        <CardHeader>
                            <CardTitle>Preferencias de Notificaciones</CardTitle>
                            <CardDescription>
                                Configura cómo y cuándo quieres recibir notificaciones
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-6">
                                {[
                                    { title: 'Brief completado', description: 'Cuando un cliente completa un brief', enabled: true },
                                    { title: 'Nuevo mensaje', description: 'Cuando recibes un mensaje en el chat', enabled: true },
                                    { title: 'Archivo subido', description: 'Cuando se sube un nuevo archivo a un proyecto', enabled: false },
                                    { title: 'Cambio de estado', description: 'Cuando un proyecto cambia de estado', enabled: true },
                                    { title: 'Recordatorios', description: 'Recordatorios de proyectos pendientes', enabled: false },
                                ].map((notification, i) => (
                                    <div key={i} className="flex items-center justify-between">
                                        <div>
                                            <p className="font-medium text-gray-900">{notification.title}</p>
                                            <p className="text-sm text-gray-500">{notification.description}</p>
                                        </div>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input
                                                type="checkbox"
                                                defaultChecked={notification.enabled}
                                                className="sr-only peer"
                                            />
                                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                                        </label>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>


            </Tabs>
        </div>
    );
}
