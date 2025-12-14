import { useEffect, useState } from 'react';
import { teamApi } from '@/lib/api';
import { useAuthStore } from '@/lib/auth';
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
    Mail,
    Shield,
    FolderKanban,
    Trash2,
    Crown,
    UserCircle,
    Loader2,
} from 'lucide-react';

const memberSchema = z.object({
    name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
    email: z.string().email('Email inválido'),
    role: z.enum(['AGENCY_ADMIN', 'AGENCY_MEMBER']),
    password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
});

type MemberFormData = z.infer<typeof memberSchema>;

export default function TeamPage() {
    const { user } = useAuthStore();
    const [members, setMembers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');

    const isAdmin = user?.role === 'AGENCY_ADMIN';

    const {
        register,
        handleSubmit,
        reset,
        setValue,
        watch,
        formState: { errors },
    } = useForm<MemberFormData>({
        resolver: zodResolver(memberSchema),
        defaultValues: {
            role: 'AGENCY_MEMBER',
        },
    });

    const selectedRole = watch('role');

    useEffect(() => {
        loadTeam();
    }, []);

    const loadTeam = async () => {
        try {
            const response = await teamApi.getAll();
            setMembers(response.data || []);
        } catch (error) {
            console.error('Error loading team:', error);
        } finally {
            setLoading(false);
        }
    };

    const onSubmit = async (data: MemberFormData) => {
        setError('');
        setIsSubmitting(true);

        try {
            await teamApi.invite(data);
            setIsModalOpen(false);
            reset();
            loadTeam();
        } catch (err: any) {
            setError(err.response?.data?.error || 'Error al invitar miembro');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteMember = async (memberId: string) => {
        if (!confirm('¿Estás seguro de eliminar este miembro?')) return;
        try {
            await teamApi.remove(memberId);
            loadTeam();
        } catch (error) {
            console.error('Error removing member:', error);
        }
    };

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white">Equipo</h1>
                    <p className="text-white/50 mt-2">Gestiona los miembros de tu agencia</p>
                </div>
                {isAdmin && (
                    <button onClick={() => setIsModalOpen(true)} className="btn-luxury">
                        <Plus className="w-4 h-4" />
                        Invitar Miembro
                    </button>
                )}
            </div>

            {/* Team List */}
            {loading ? (
                <div className="space-y-4">
                    {[...Array(3)].map((_, i) => (
                        <div key={i} className="h-24 bg-white/5 rounded-2xl animate-pulse" />
                    ))}
                </div>
            ) : members.length === 0 ? (
                <div className="card-luxury p-16 text-center">
                    <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-cyan-500/20 to-cyan-500/5 border border-cyan-500/20 flex items-center justify-center mx-auto mb-6">
                        <UserCircle className="w-10 h-10 text-cyan-400" />
                    </div>
                    <h3 className="text-xl font-semibold text-white mb-2">
                        Sin miembros de equipo
                    </h3>
                    <p className="text-white/40 max-w-md mx-auto mb-8">
                        Invita a tu equipo para colaborar en proyectos
                    </p>
                    {isAdmin && (
                        <button onClick={() => setIsModalOpen(true)} className="btn-luxury">
                            <Plus className="w-4 h-4" />
                            Invitar Miembro
                        </button>
                    )}
                </div>
            ) : (
                <div className="space-y-4">
                    {members.map((member, index) => (
                        <div
                            key={member.id}
                            className="card-luxury p-6 hover:border-cyan-500/30 transition-all animate-fade-in group"
                            style={{ animationDelay: `${index * 50}ms` }}
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-purple-500/20">
                                        {member.name.charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <h3 className="font-semibold text-white group-hover:text-cyan-400 transition-colors">
                                                {member.name}
                                            </h3>
                                            {member.role === 'AGENCY_ADMIN' && (
                                                <Crown className="w-4 h-4 text-amber-400" />
                                            )}
                                            {member.id === user?.id && (
                                                <span className="badge-cyan text-xs">Tú</span>
                                            )}
                                        </div>
                                        <div className="flex flex-wrap items-center gap-3 text-sm text-white/40 mt-1">
                                            <div className="flex items-center gap-1">
                                                <Mail className="w-3.5 h-3.5" />
                                                {member.email}
                                            </div>
                                            <span className="w-1 h-1 rounded-full bg-white/20 hidden sm:block" />
                                            <div className="flex items-center gap-1">
                                                <Shield className="w-3.5 h-3.5" />
                                                {member.role === 'AGENCY_ADMIN' ? 'Admin' : 'Miembro'}
                                            </div>
                                            <span className="w-1 h-1 rounded-full bg-white/20 hidden sm:block" />
                                            <div className="flex items-center gap-1">
                                                <FolderKanban className="w-3.5 h-3.5" />
                                                {member._count?.projects || 0} proyectos
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                {isAdmin && member.id !== user?.id && (
                                    <button
                                        onClick={() => handleDeleteMember(member.id)}
                                        className="p-2.5 rounded-lg text-red-400 hover:bg-red-500/10 transition-colors"
                                    >
                                        <Trash2 className="w-5 h-5" />
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Invite Member Modal */}
            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent className="bg-gray-950 border-cyan-500/20">
                    <DialogHeader>
                        <DialogTitle className="text-white">Invitar Miembro</DialogTitle>
                        <DialogDescription className="text-white/50">
                            Agrega un nuevo miembro a tu equipo
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
                                placeholder="Nombre completo"
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
                                placeholder="email@agencia.com"
                                className="input-luxury"
                            />
                            {errors.email && (
                                <p className="mt-2 text-sm text-red-400">{errors.email.message}</p>
                            )}
                        </div>

                        <div>
                            <label className="label">Rol</label>
                            <select
                                value={selectedRole}
                                onChange={(e) => setValue('role', e.target.value as any)}
                                className="input-luxury"
                            >
                                <option value="AGENCY_MEMBER">Miembro</option>
                                <option value="AGENCY_ADMIN">Administrador</option>
                            </select>
                            <p className="mt-2 text-xs text-white/30">
                                {selectedRole === 'AGENCY_ADMIN'
                                    ? 'Puede gestionar equipo, clientes y configuración'
                                    : 'Puede ver y trabajar en proyectos asignados'}
                            </p>
                        </div>

                        <div>
                            <label className="label">Contraseña</label>
                            <input
                                {...register('password')}
                                type="password"
                                placeholder="••••••••"
                                className="input-luxury"
                            />
                            {errors.password && (
                                <p className="mt-2 text-sm text-red-400">{errors.password.message}</p>
                            )}
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
                                    'Invitar Miembro'
                                )}
                            </button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
}
