import { useEffect, useState } from 'react';
import { clientsApi } from '@/lib/api';
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
    Loader2,
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
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white">Clientes</h1>
                    <p className="text-white/50 mt-2">Gestiona los clientes de tu agencia</p>
                </div>
                <button onClick={() => setIsModalOpen(true)} className="btn-luxury">
                    <Plus className="w-4 h-4" />
                    Invitar Cliente
                </button>
            </div>

            {/* Search */}
            <div className="card-luxury p-5">
                <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
                    <input
                        placeholder="Buscar clientes..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="input-luxury pl-12"
                    />
                </div>
            </div>

            {/* Clients List */}
            {loading ? (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {[...Array(6)].map((_, i) => (
                        <div key={i} className="h-48 bg-white/5 rounded-2xl animate-pulse" />
                    ))}
                </div>
            ) : filteredClients.length === 0 ? (
                <div className="card-luxury p-16 text-center">
                    <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-cyan-500/20 to-cyan-500/5 border border-cyan-500/20 flex items-center justify-center mx-auto mb-6">
                        <Users className="w-10 h-10 text-cyan-400" />
                    </div>
                    <h3 className="text-xl font-semibold text-white mb-2">
                        {search ? 'No se encontraron clientes' : 'No tienes clientes aún'}
                    </h3>
                    <p className="text-white/40 max-w-md mx-auto mb-8">
                        {search
                            ? 'Intenta con otro término de búsqueda'
                            : 'Invita a tu primer cliente para empezar a trabajar juntos'}
                    </p>
                    {!search && (
                        <button onClick={() => setIsModalOpen(true)} className="btn-luxury">
                            <Plus className="w-4 h-4" />
                            Invitar Cliente
                        </button>
                    )}
                </div>
            ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {filteredClients.map((client, index) => (
                        <div
                            key={client.id}
                            className="card-luxury p-6 hover:border-cyan-500/30 transition-all animate-fade-in group"
                            style={{ animationDelay: `${index * 50}ms` }}
                        >
                            <div className="flex items-start gap-4">
                                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-cyan-400 to-cyan-600 flex items-center justify-center text-gray-950 font-bold text-xl shadow-lg shadow-cyan-500/30">
                                    {client.name.charAt(0).toUpperCase()}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-semibold text-white truncate group-hover:text-cyan-400 transition-colors">
                                        {client.name}
                                    </h3>
                                    <div className="flex items-center gap-1.5 text-sm text-white/50 mt-1">
                                        <Mail className="w-3.5 h-3.5" />
                                        <span className="truncate">{client.email}</span>
                                    </div>
                                    {client.company && (
                                        <div className="flex items-center gap-1.5 text-sm text-white/40 mt-1">
                                            <Building className="w-3.5 h-3.5" />
                                            <span className="truncate">{client.company}</span>
                                        </div>
                                    )}
                                    {client.phone && (
                                        <div className="flex items-center gap-1.5 text-sm text-white/40 mt-1">
                                            <Phone className="w-3.5 h-3.5" />
                                            <span>{client.phone}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between text-sm">
                                <div className="flex items-center gap-1.5 text-white/40">
                                    <FolderKanban className="w-4 h-4" />
                                    <span>{client._count?.projects || 0} proyectos</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Create Client Modal */}
            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent className="bg-gray-950 border-cyan-500/20">
                    <DialogHeader>
                        <DialogTitle className="text-white">Invitar Cliente</DialogTitle>
                        <DialogDescription className="text-white/50">
                            Ingresa los datos del cliente para enviarle una invitación
                        </DialogDescription>
                    </DialogHeader>

                    {error && (
                        <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-sm text-red-400">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                        <div>
                            <label className="label">Nombre</label>
                            <input
                                {...register('name')}
                                placeholder="Juan Pérez"
                                className="input-luxury"
                            />
                            {errors.name && (
                                <p className="mt-2 text-sm text-red-400">{errors.name.message}</p>
                            )}
                        </div>

                        <div>
                            <label className="label">Email</label>
                            <input
                                {...register('email')}
                                type="email"
                                placeholder="cliente@empresa.com"
                                className="input-luxury"
                            />
                            {errors.email && (
                                <p className="mt-2 text-sm text-red-400">{errors.email.message}</p>
                            )}
                        </div>

                        <div>
                            <label className="label">Empresa (opcional)</label>
                            <input
                                {...register('company')}
                                placeholder="Nombre de la empresa"
                                className="input-luxury"
                            />
                        </div>

                        <div>
                            <label className="label">Teléfono (opcional)</label>
                            <input
                                {...register('phone')}
                                placeholder="+1 234 567 890"
                                className="input-luxury"
                            />
                        </div>

                        <div>
                            <label className="label">Contraseña temporal</label>
                            <input
                                {...register('password')}
                                type="password"
                                placeholder="••••••••"
                                className="input-luxury"
                            />
                            {errors.password && (
                                <p className="mt-2 text-sm text-red-400">{errors.password.message}</p>
                            )}
                            <p className="mt-2 text-xs text-white/30">
                                El cliente usará esta contraseña para acceder al portal
                            </p>
                        </div>

                        <div className="flex justify-end gap-3 pt-4">
                            <button
                                type="button"
                                onClick={() => setIsModalOpen(false)}
                                className="btn-secondary-luxury"
                            >
                                Cancelar
                            </button>
                            <button type="submit" disabled={isSubmitting} className="btn-luxury">
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        Invitando...
                                    </>
                                ) : (
                                    'Invitar Cliente'
                                )}
                            </button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
}
