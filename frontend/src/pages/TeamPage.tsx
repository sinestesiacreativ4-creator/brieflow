import { useEffect, useState } from 'react';
import { teamApi } from '@/lib/api';
import { useAuthStore } from '@/lib/auth';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
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
    UserCircle,
    Mail,
    Shield,
    FolderKanban,
    Trash2,
    Crown,
} from 'lucide-react';
import { formatDate } from '@/lib/utils';

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
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Equipo</h1>
                    <p className="text-gray-600 mt-1">Gestiona los miembros de tu agencia</p>
                </div>
                {isAdmin && (
                    <Button onClick={() => setIsModalOpen(true)}>
                        <Plus className="w-4 h-4" />
                        Invitar Miembro
                    </Button>
                )}
            </div>

            {/* Team List */}
            {loading ? (
                <div className="space-y-4">
                    {[...Array(3)].map((_, i) => (
                        <div key={i} className="h-24 bg-gray-100 rounded-2xl animate-pulse" />
                    ))}
                </div>
            ) : (
                <div className="space-y-4">
                    {members.map((member) => (
                        <Card key={member.id} hover>
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white font-bold text-xl">
                                            {member.name.charAt(0).toUpperCase()}
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <h3 className="font-semibold text-gray-900">{member.name}</h3>
                                                {member.role === 'AGENCY_ADMIN' && (
                                                    <Crown className="w-4 h-4 text-amber-500" />
                                                )}
                                                {member.id === user?.id && (
                                                    <Badge variant="default" className="bg-indigo-100 text-indigo-700 border-indigo-200">
                                                        Tú
                                                    </Badge>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-3 text-sm text-gray-500 mt-1">
                                                <div className="flex items-center gap-1">
                                                    <Mail className="w-3.5 h-3.5" />
                                                    {member.email}
                                                </div>
                                                <span className="w-1 h-1 rounded-full bg-gray-300" />
                                                <div className="flex items-center gap-1">
                                                    <Shield className="w-3.5 h-3.5" />
                                                    {member.role === 'AGENCY_ADMIN' ? 'Administrador' : 'Miembro'}
                                                </div>
                                                <span className="w-1 h-1 rounded-full bg-gray-300" />
                                                <div className="flex items-center gap-1">
                                                    <FolderKanban className="w-3.5 h-3.5" />
                                                    {member._count?.projects || 0} proyectos
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    {isAdmin && member.id !== user?.id && (
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => handleDeleteMember(member.id)}
                                        >
                                            <Trash2 className="w-4 h-4 text-red-500" />
                                        </Button>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            {/* Invite Member Modal */}
            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Invitar Miembro</DialogTitle>
                        <DialogDescription>
                            Agrega un nuevo miembro a tu equipo
                        </DialogDescription>
                    </DialogHeader>

                    {error && (
                        <div className="p-4 bg-red-50 border border-red-100 rounded-xl text-sm text-red-600">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                        <div>
                            <label className="label">Nombre</label>
                            <Input
                                {...register('name')}
                                placeholder="Nombre completo"
                                error={errors.name?.message}
                            />
                            {errors.name && (
                                <p className="mt-1 text-sm text-red-500">{errors.name.message}</p>
                            )}
                        </div>

                        <div>
                            <label className="label">Email</label>
                            <Input
                                {...register('email')}
                                type="email"
                                placeholder="email@agencia.com"
                                error={errors.email?.message}
                            />
                            {errors.email && (
                                <p className="mt-1 text-sm text-red-500">{errors.email.message}</p>
                            )}
                        </div>

                        <div>
                            <label className="label">Rol</label>
                            <Select value={selectedRole} onValueChange={(v) => setValue('role', v as any)}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="AGENCY_MEMBER">Miembro</SelectItem>
                                    <SelectItem value="AGENCY_ADMIN">Administrador</SelectItem>
                                </SelectContent>
                            </Select>
                            <p className="mt-1 text-xs text-gray-500">
                                {selectedRole === 'AGENCY_ADMIN'
                                    ? 'Puede gestionar equipo, clientes y configuración'
                                    : 'Puede ver y trabajar en proyectos asignados'}
                            </p>
                        </div>

                        <div>
                            <label className="label">Contraseña</label>
                            <Input
                                {...register('password')}
                                type="password"
                                placeholder="••••••••"
                                error={errors.password?.message}
                            />
                            {errors.password && (
                                <p className="mt-1 text-sm text-red-500">{errors.password.message}</p>
                            )}
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
                                Invitar Miembro
                            </Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
}
