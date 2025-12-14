import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '@/lib/auth';
import { projectsApi, statsApi } from '@/lib/api';
import {
    FolderKanban,
    FileText,
    TrendingUp,
    Clock,
    ArrowUpRight,
    Sparkles,
    CheckCircle2,
    AlertCircle,
    UserCircle,
    Zap,
} from 'lucide-react';
import { StatusBadge } from '@/components/ui/badge';
import { formatDate } from '@/lib/utils';

export default function DashboardPage() {
    const { user } = useAuthStore();
    const [stats, setStats] = useState<any>(null);
    const [recentProjects, setRecentProjects] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const isClient = user?.role === 'CLIENT';

    useEffect(() => {
        loadDashboardData();
    }, []);

    const loadDashboardData = async () => {
        try {
            const [statsRes, projectsRes] = await Promise.all([
                statsApi.getDashboard(),
                projectsApi.getAll({ limit: 5 }),
            ]);
            setStats(statsRes.data);
            setRecentProjects(projectsRes.data.projects || []);
        } catch (error) {
            console.error('Error loading dashboard:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="space-y-8">
                <div className="h-10 bg-white/5 rounded-xl w-1/3 animate-pulse" />
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[...Array(4)].map((_, i) => (
                        <div key={i} className="h-32 bg-white/5 rounded-2xl animate-pulse" />
                    ))}
                </div>
            </div>
        );
    }

    const clientStats = [
        {
            title: 'Proyectos Activos',
            value: stats?.activeProjects || 0,
            icon: FolderKanban,
            color: 'cyan',
            change: '+2 este mes',
        },
        {
            title: 'Briefs Pendientes',
            value: stats?.pendingBriefs || 0,
            icon: FileText,
            color: 'amber',
            change: 'Requieren atención',
        },
        {
            title: 'En Revisión',
            value: stats?.inReview || 0,
            icon: AlertCircle,
            color: 'purple',
            change: 'Esperando feedback',
        },
        {
            title: 'Completados',
            value: stats?.completed || 0,
            icon: CheckCircle2,
            color: 'emerald',
            change: 'Total histórico',
        },
    ];

    const agencyStats = [
        {
            title: 'Proyectos Activos',
            value: stats?.activeProjects || 0,
            icon: FolderKanban,
            color: 'cyan',
        },
        {
            title: 'Briefs por Revisar',
            value: stats?.pendingBriefs || 0,
            icon: FileText,
            color: 'amber',
        },
        {
            title: 'Clientes Activos',
            value: stats?.totalClients || 0,
            icon: UserCircle,
            color: 'purple',
        },
        {
            title: 'Completados',
            value: stats?.completed || 0,
            icon: CheckCircle2,
            color: 'emerald',
        },
    ];

    const displayStats = isClient ? clientStats : agencyStats;

    const colorClasses: Record<string, { bg: string; border: string; text: string; glow: string }> = {
        cyan: { bg: 'from-cyan-500/15 to-cyan-500/5', border: 'border-cyan-500/20', text: 'text-cyan-400', glow: 'shadow-cyan-500/20' },
        amber: { bg: 'from-amber-500/15 to-amber-500/5', border: 'border-amber-500/20', text: 'text-amber-400', glow: 'shadow-amber-500/20' },
        purple: { bg: 'from-purple-500/15 to-purple-500/5', border: 'border-purple-500/20', text: 'text-purple-400', glow: 'shadow-purple-500/20' },
        emerald: { bg: 'from-emerald-500/15 to-emerald-500/5', border: 'border-emerald-500/20', text: 'text-emerald-400', glow: 'shadow-emerald-500/20' },
    };

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <h1 className="text-3xl font-bold text-white">
                            Hola, {user?.name?.split(' ')[0]} 👋
                        </h1>
                    </div>
                    <p className="text-white/50">
                        {isClient
                            ? 'Bienvenido a tu portal de cliente'
                            : 'Aquí está el resumen de tu agencia'}
                    </p>
                </div>
                <Link to="/projects/new">
                    <button className="btn-luxury">
                        <Zap className="w-4 h-4" />
                        Nuevo Proyecto
                    </button>
                </Link>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {displayStats.map((stat, index) => {
                    const colors = colorClasses[stat.color];
                    return (
                        <div
                            key={stat.title}
                            className="card-luxury p-6 group animate-fade-in hover:border-cyan-500/30"
                            style={{ animationDelay: `${index * 100}ms` }}
                        >
                            <div className="flex items-start justify-between mb-4">
                                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${colors.bg} border ${colors.border} flex items-center justify-center shadow-lg ${colors.glow}`}>
                                    <stat.icon className={`w-5 h-5 ${colors.text}`} />
                                </div>
                                <TrendingUp className="w-4 h-4 text-white/20 group-hover:text-cyan-400 transition-colors" />
                            </div>
                            <div className="text-3xl font-bold text-white mb-1">{stat.value}</div>
                            <div className="text-sm text-white/50">{stat.title}</div>
                        </div>
                    );
                })}
            </div>

            {/* Recent Projects */}
            <div className="card-luxury p-6">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h2 className="text-xl font-bold text-white">Proyectos Recientes</h2>
                        <p className="text-sm text-white/40 mt-1">Últimos proyectos actualizados</p>
                    </div>
                    <Link
                        to="/projects"
                        className="flex items-center gap-1.5 text-sm font-medium text-cyan-400 hover:text-cyan-300 transition-colors"
                    >
                        Ver todos
                        <ArrowUpRight className="w-4 h-4" />
                    </Link>
                </div>

                {recentProjects.length === 0 ? (
                    <div className="text-center py-12">
                        <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-4">
                            <FolderKanban className="w-7 h-7 text-white/30" />
                        </div>
                        <p className="text-white/40">No hay proyectos aún</p>
                        <Link to="/projects/new" className="inline-block mt-4">
                            <button className="btn-luxury">
                                <Zap className="w-4 h-4" />
                                Crear proyecto
                            </button>
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {recentProjects.map((project, index) => (
                            <Link
                                key={project.id}
                                to={`/projects/${project.id}`}
                                className="block animate-fade-in"
                                style={{ animationDelay: `${index * 50}ms` }}
                            >
                                <div className="flex items-center justify-between p-4 rounded-xl border border-white/5 bg-white/[0.02] hover:border-cyan-500/30 hover:bg-white/[0.04] transition-all group">
                                    <div className="flex items-center gap-4 min-w-0">
                                        <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-cyan-500/15 to-cyan-500/5 border border-cyan-500/20 flex items-center justify-center group-hover:from-cyan-500/25 group-hover:to-cyan-500/10 transition-all flex-shrink-0">
                                            <FolderKanban className="w-5 h-5 text-cyan-400" />
                                        </div>
                                        <div className="min-w-0">
                                            <h3 className="font-medium text-white truncate group-hover:text-cyan-400 transition-colors">
                                                {project.name}
                                            </h3>
                                            <div className="flex items-center gap-2 text-xs text-white/40 mt-0.5">
                                                <span className="truncate">{project.client?.name}</span>
                                                <span className="w-1 h-1 rounded-full bg-white/20" />
                                                <span className="flex items-center gap-1">
                                                    <Clock className="w-3 h-3" />
                                                    {formatDate(project.updatedAt)}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <StatusBadge status={project.status} />
                                        <ArrowUpRight className="w-4 h-4 text-white/20 group-hover:text-cyan-400 transition-colors" />
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
