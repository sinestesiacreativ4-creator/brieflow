import { useEffect, useState } from 'react';
import { clientsApi } from '@/lib/api';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from '@/components/ui/dialog';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
    Plus,
    Search,
    Users,
    Mail,
    Building,
    Phone,
    FolderKanban,
} from 'lucide-react';

const clientSchema = z.object({
    name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
    email: z.string().email('Email inválido'),
    company: z.string().optional(),
    phone: z.string().optional(),
    password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
});

type ClientFormData = z.infer<typeof clientSchema>;

export default function ClientsPage() {
    const [clients, setClients] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm<ClientFormData>({
        resolver: zodResolver(clientSchema),
    });

    useEffect(() => {
        loadClients();
    }, []);

    const loadClients = async () => {
        try {
            const response = await clientsApi.getAll();
            setClients(response.data.clients || []);
        } catch (error) {
            console.error('Error loading clients:', error);
        } finally {
            setLoading(false);
        }
    };

    const onSubmit = async (data: ClientFormData) => {
        setError('');
        setIsSubmitting(true);

        try {
            await clientsApi.create(data);
            setIsModalOpen(false);
            reset();
            loadClients();
        } catch (err: any) {
            setError(err.response?.data?.error || 'Error al crear cliente');
        } finally {
            setIsSubmitting(false);
        }
    };

    const filteredClients = clients.filter(
        (client) =>
            client.name.toLowerCase().includes(search.toLowerCase()) ||
            client.email.toLowerCase().includes(search.toLowerCase()) ||
            client.company?.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Clientes</h1>
                    <p className="text-gray-500 mt-1">Gestiona los clientes de tu agencia</p>
                </div>
                <Button onClick={() => setIsModalOpen(true)}>
                    <Plus className="w-4 h-4" />
                    Invitar Cliente
                </Button>
            </div>

            {/* Search */}
            <Card>
                <CardContent className="p-4">
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <Input
                            placeholder="Buscar clientes..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="pl-12"
                        />
                    </div>
                </CardContent>
            </Card>

            {/* Clients List */}
            {loading ? (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {[...Array(6)].map((_, i) => (
                        <div key={i} className="h-40 bg-gray-100 rounded-2xl animate-pulse" />
                    ))}
                </div>
            ) : filteredClients.length === 0 ? (
                <Card>
                    <CardContent className="flex flex-col items-center justify-center py-16">
                        <div className="w-16 h-16 rounded-2xl bg-blue-100 flex items-center justify-center mb-4">
                            <Users className="w-8 h-8 text-blue-600" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                            {search ? 'No se encontraron clientes' : 'No tienes clientes aún'}
                        </h3>
                        <p className="text-gray-500 text-center max-w-md mb-6">
                            {search
                                ? 'Intenta con otro término de búsqueda'
                                : 'Invita a tu primer cliente para empezar a trabajar juntos'}
                        </p>
                        {!search && (
                            <Button onClick={() => setIsModalOpen(true)}>
                                <Plus className="w-4 h-4" />
                                Invitar Cliente
                            </Button>
                        )}
                    </CardContent>
                </Card>
            ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {filteredClients.map((client) => (
                        <Card key={client.id} hover>
                            <CardContent className="p-6">
                                <div className="flex items-start gap-4">
                                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-blue-500/25">
                                        {client.name.charAt(0).toUpperCase()}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-semibold text-gray-900 truncate">{client.name}</h3>
                                        <div className="flex items-center gap-1.5 text-sm text-gray-500 mt-1">
                                            <Mail className="w-3.5 h-3.5" />
                                            <span className="truncate">{client.email}</span>
                                        </div>
                                        {client.company && (
                                            <div className="flex items-center gap-1.5 text-sm text-gray-400 mt-1">
                                                <Building className="w-3.5 h-3.5" />
                                                <span className="truncate">{client.company}</span>
                                            </div>
                                        )}
                                        {client.phone && (
                                            <div className="flex items-center gap-1.5 text-sm text-gray-400 mt-1">
                                                <Phone className="w-3.5 h-3.5" />
                                                <span>{client.phone}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between text-sm">
                                    <div className="flex items-center gap-1.5 text-gray-500">
                                        <FolderKanban className="w-4 h-4" />
                                        <span>{client._count?.projects || 0} proyectos</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            {/* Create Client Modal */}
            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent className="bg-white border-gray-200">
                    <DialogHeader>
                        <DialogTitle className="text-gray-900">Invitar Cliente</DialogTitle>
                        <DialogDescription className="text-gray-500">
                            Ingresa los datos del cliente para enviarle una invitación
                        </DialogDescription>
                    </DialogHeader>

                    {error && (
                        <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">Nombre</label>
                            <Input
                                {...register('name')}
                                placeholder="Juan Pérez"
                                error={errors.name?.message}
                            />
                            {errors.name && (
                                <p className="mt-1 text-sm text-red-500">{errors.name.message}</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
                            <Input
                                {...register('email')}
                                type="email"
                                placeholder="cliente@empresa.com"
                                error={errors.email?.message}
                            />
                            {errors.email && (
                                <p className="mt-1 text-sm text-red-500">{errors.email.message}</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">Empresa (opcional)</label>
                            <Input
                                {...register('company')}
                                placeholder="Nombre de la empresa"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">Teléfono (opcional)</label>
                            <Input
                                {...register('phone')}
                                placeholder="+1 234 567 890"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">Contraseña temporal</label>
                            <Input
                                {...register('password')}
                                type="password"
                                placeholder="••••••••"
                                error={errors.password?.message}
                            />
                            {errors.password && (
                                <p className="mt-1 text-sm text-red-500">{errors.password.message}</p>
                            )}
                            <p className="mt-1 text-xs text-gray-500">
                                El cliente usará esta contraseña para acceder al portal
                            </p>
                        </div>

                        <div className="flex justify-end gap-3 pt-4">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setIsModalOpen(false)}
                            >
                                Cancelar
                            </Button>
                            <Button type="submit" loading={isSubmitting}>
                                Invitar Cliente
                            </Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
}
