import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { dashboardApi } from '@/lib/api';
import { useAuthStore } from '@/lib/auth';
import { StatusBadge } from '@/components/ui/badge';
import { formatDate, getProjectTypeLabel } from '@/lib/utils';
import {
    FolderKanban,
    FileText,
    Users,
    CheckCircle2,
    Plus,
    ArrowRight,
    Clock,
    TrendingUp,
    Sparkles,
    Zap,
} from 'lucide-react';

interface Metrics {
    activeProjects: number;
    pendingBriefs: number;
    totalClients: number;
    completedThisMonth: number;
    completedProjects?: number;
    recentProjects: any[];
    isClient: boolean;
}

export default function DashboardPage() {
    const { user, agency } = useAuthStore();
    const [metrics, setMetrics] = useState<Metrics | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadMetrics();
    }, []);

    const loadMetrics = async () => {
        try {
            const response = await dashboardApi.getMetrics();
            setMetrics(response.data);
        } catch (error) {
            console.error('Error loading metrics:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="space-y-8">
                {/* Loading skeleton */}
                <div className="h-10 bg-white/5 rounded-lg w-1/3 animate-pulse" />
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                    {[...Array(4)].map((_, i) => (
                        <div key={i} className="h-36 bg-white/5 rounded-2xl animate-pulse" />
                    ))}
                </div>
                <div className="h-80 bg-white/5 rounded-2xl animate-pulse" />
            </div>
        );
    }

    const statCards = metrics?.isClient
        ? [
            {
                title: 'Proyectos Activos',
                value: metrics?.activeProjects || 0,
                icon: FolderKanban,
                gradient: 'from-cyan-500/20 to-cyan-500/5',
                iconColor: 'text-cyan-400',
                borderColor: 'border-cyan-500/20',
            },
            {
                title: 'Briefs Pendientes',
                value: metrics?.pendingBriefs || 0,
                icon: FileText,
                gradient: 'from-amber-500/20 to-amber-500/5',
                iconColor: 'text-amber-400',
                borderColor: 'border-amber-500/20',
            },
            {
                title: 'Completados',
                value: metrics?.completedProjects || 0,
                icon: CheckCircle2,
                gradient: 'from-emerald-500/20 to-emerald-500/5',
                iconColor: 'text-emerald-400',
                borderColor: 'border-emerald-500/20',
            },
        ]
        : [
            {
                title: 'Proyectos Activos',
                value: metrics?.activeProjects || 0,
                icon: FolderKanban,
                gradient: 'from-cyan-500/20 to-cyan-500/5',
                iconColor: 'text-cyan-400',
                borderColor: 'border-cyan-500/20',
            },
            {
                title: 'Briefs Pendientes',
                value: metrics?.pendingBriefs || 0,
                icon: FileText,
                gradient: 'from-amber-500/20 to-amber-500/5',
                iconColor: 'text-amber-400',
                borderColor: 'border-amber-500/20',
            },
            {
                title: 'Clientes Totales',
                value: metrics?.totalClients || 0,
                icon: Users,
                gradient: 'from-purple-500/20 to-purple-500/5',
                iconColor: 'text-purple-400',
                borderColor: 'border-purple-500/20',
            },
            {
                title: 'Completados este mes',
                value: metrics?.completedThisMonth || 0,
                icon: TrendingUp,
                gradient: 'from-emerald-500/20 to-emerald-500/5',
                iconColor: 'text-emerald-400',
                borderColor: 'border-emerald-500/20',
            },
        ];

    // Client Dashboard
    if (metrics?.isClient) {
        return (
            <div className="space-y-8">
                {/* Client Welcome Header */}
                <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 border border-white/10 p-8">
                    <div className="absolute inset-0 pointer-events-none">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl" />
                        <div className="absolute bottom-0 left-0 w-48 h-48 bg-cyan-500/10 rounded-full blur-3xl" />
                    </div>
                    <div className="relative">
                        <div className="flex items-center gap-3 mb-2">
                            <span className="text-4xl">👋</span>
                            <h1 className="text-3xl font-bold text-white">
                                Hola, <span className="text-gradient-gold">{user?.name?.split(' ')[0]}</span>
                            </h1>
                        </div>
                        <p className="text-white/60 text-lg">
                            Aquí tienes un resumen de tus proyectos
                        </p>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid gap-6 md:grid-cols-3">
                    {statCards.map((stat, index) => (
                        <div
                            key={index}
                            className={`card-luxury p-6 border ${stat.borderColor} animate-fade-in`}
                            style={{ animationDelay: `${index * 100}ms` }}
                        >
                            <div className="flex items-center gap-4">
                                <div className={`p-3 rounded-xl bg-gradient-to-br ${stat.gradient} border ${stat.borderColor}`}>
                                    <stat.icon className={`w-6 h-6 ${stat.iconColor}`} />
                                </div>
                                <div>
                                    <p className="text-4xl font-bold text-white">{stat.value}</p>
                                    <p className="text-sm text-white/50 mt-1">{stat.title}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Pending Briefs Alert */}
                {metrics?.pendingBriefs > 0 && (
                    <div className="card-luxury p-6 border border-amber-500/30 bg-gradient-to-r from-amber-500/10 to-transparent animate-fade-in">
                        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                            <div className="flex items-center gap-4">
                                <div className="w-14 h-14 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center">
                                    <Zap className="w-7 h-7 text-amber-400" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-white text-lg">Tienes briefs pendientes</h3>
                                    <p className="text-amber-400/70 text-sm">Completa la información para iniciar tus proyectos</p>
                                </div>
                            </div>
                            <Link to="/projects?filter=pending">
                                <button className="btn-luxury">
                                    Completar ahora
                                    <ArrowRight className="w-4 h-4" />
                                </button>
                            </Link>
                        </div>
                    </div>
                )}

                {/* Projects List */}
                <div className="card-luxury overflow-hidden">
                    <div className="p-6 border-b border-white/5 flex items-center justify-between">
                        <h2 className="text-lg font-bold text-white">Mis Proyectos</h2>
                        <Link to="/projects" className="btn-ghost-luxury text-amber-400 hover:text-amber-300">
                            Ver todos <ArrowRight className="w-4 h-4 ml-1" />
                        </Link>
                    </div>

                    {metrics?.recentProjects?.length === 0 ? (
                        <div className="text-center py-16">
                            <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mx-auto mb-4">
                                <FolderKanban className="w-8 h-8 text-white/30" />
                            </div>
                            <p className="text-white/40">No tienes proyectos aún</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-white/5">
                            {metrics?.recentProjects?.map((project, index) => (
                                <Link
                                    key={project.id}
                                    to={`/projects/${project.id}`}
                                    className="flex items-center justify-between p-5 hover:bg-white/[0.02] transition-colors group animate-fade-in"
                                    style={{ animationDelay: `${index * 75}ms` }}
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500/20 to-cyan-500/5 border border-cyan-500/20 flex items-center justify-center">
                                            <FolderKanban className="w-5 h-5 text-cyan-400" />
                                        </div>
                                        <div>
                                            <p className="font-semibold text-white group-hover:text-amber-400 transition-colors">
                                                {project.name}
                                            </p>
                                            <p className="text-sm text-white/40">
                                                {getProjectTypeLabel(project.type)}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <StatusBadge status={project.status} />
                                        <div className="hidden sm:flex items-center gap-1.5 text-sm text-white/30">
                                            <Clock className="w-4 h-4" />
                                            {formatDate(project.createdAt)}
                                        </div>
                                        <ArrowRight className="w-4 h-4 text-white/20 group-hover:text-amber-400 transition-colors" />
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        );
    }

    // Agency Dashboard
    return (
        <div className="space-y-8">
            {/* Welcome Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                        <span className="text-3xl">👋</span>
                        Hola, <span className="text-gradient-gold">{user?.name?.split(' ')[0]}</span>
                    </h1>
                    <p className="text-white/50 mt-2">Resumen de actividad de tu agencia</p>
                </div>
                <Link to="/projects/new">
                    <button className="btn-luxury">
                        <Plus className="w-4 h-4" />
                        Nuevo Proyecto
                    </button>
                </Link>
            </div>

            {/* Stats Grid */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                {statCards.map((stat, index) => (
                    <div
                        key={index}
                        className={`relative overflow-hidden card-luxury p-6 border ${stat.borderColor} animate-fade-in group cursor-default`}
                        style={{ animationDelay: `${index * 100}ms` }}
                    >
                        {/* Background glow */}
                        <div className={`absolute -top-6 -right-6 w-24 h-24 bg-gradient-to-br ${stat.gradient} rounded-full blur-2xl opacity-50 group-hover:opacity-75 transition-opacity`} />

                        <div className="relative">
                            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.gradient} border ${stat.borderColor} flex items-center justify-center mb-4`}>
                                <stat.icon className={`w-5 h-5 ${stat.iconColor}`} />
                            </div>
                            <p className="text-4xl font-bold text-white">{stat.value}</p>
                            <p className="text-sm text-white/40 mt-1">{stat.title}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Recent Projects */}
            <div className="card-luxury overflow-hidden">
                <div className="p-6 border-b border-white/5 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500/20 to-amber-500/5 border border-amber-500/20 flex items-center justify-center">
                            <Sparkles className="w-5 h-5 text-amber-400" />
                        </div>
                        <h2 className="text-lg font-bold text-white">Proyectos Recientes</h2>
                    </div>
                    <Link to="/projects" className="btn-ghost-luxury text-amber-400 hover:text-amber-300">
                        Ver todos <ArrowRight className="w-4 h-4 ml-1" />
                    </Link>
                </div>

                {metrics?.recentProjects?.length === 0 ? (
                    <div className="text-center py-20">
                        <div className="w-20 h-20 rounded-3xl bg-white/5 flex items-center justify-center mx-auto mb-6">
                            <FolderKanban className="w-10 h-10 text-white/20" />
                        </div>
                        <h3 className="font-semibold text-white text-lg mb-2">No hay proyectos aún</h3>
                        <p className="text-white/40 mb-8">Crea tu primer proyecto para empezar</p>
                        <Link to="/projects/new">
                            <button className="btn-luxury">
                                <Plus className="w-4 h-4" />
                                Crear Proyecto
                            </button>
                        </Link>
                    </div>
                ) : (
                    <div className="divide-y divide-white/5">
                        {metrics?.recentProjects?.map((project, index) => (
                            <Link
                                key={project.id}
                                to={`/projects/${project.id}`}
                                className="flex flex-col sm:flex-row sm:items-center justify-between p-5 hover:bg-white/[0.02] transition-all group gap-4 animate-fade-in"
                                style={{ animationDelay: `${index * 75}ms` }}
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-cyan-500/20 to-cyan-500/5 border border-cyan-500/20 flex items-center justify-center">
                                        <FolderKanban className="w-6 h-6 text-cyan-400" />
                                    </div>
                                    <div>
                                        <p className="font-semibold text-white group-hover:text-amber-400 transition-colors text-lg">
                                            {project.name}
                                        </p>
                                        <p className="text-sm text-white/40">
                                            {project.client?.name} • {getProjectTypeLabel(project.type)}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between w-full sm:w-auto gap-4">
                                    <StatusBadge status={project.status} />
                                    <div className="flex items-center gap-1.5 text-sm text-white/30">
                                        <Clock className="w-4 h-4" />
                                        {formatDate(project.createdAt)}
                                    </div>
                                    <ArrowRight className="w-5 h-5 text-white/20 group-hover:text-amber-400 transition-colors hidden sm:block" />
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
