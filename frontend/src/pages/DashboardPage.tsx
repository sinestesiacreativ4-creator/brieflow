import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { dashboardApi } from '@/lib/api';
import { useAuthStore } from '@/lib/auth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
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
            <div className="space-y-8 animate-pulse">
                <div className="h-8 bg-gray-200 rounded w-1/3" />
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                    {[...Array(4)].map((_, i) => (
                        <div key={i} className="h-32 bg-gray-200 rounded-2xl" />
                    ))}
                </div>
                <div className="h-64 bg-gray-200 rounded-2xl" />
            </div>
        );
    }

    const statCards = metrics?.isClient
        ? [
            {
                title: 'Proyectos Activos',
                value: metrics?.activeProjects || 0,
                icon: FolderKanban,
                bgColor: 'bg-blue-50',
                iconBg: 'bg-blue-500',
                iconColor: 'text-white',
            },
            {
                title: 'Briefs Pendientes',
                value: metrics?.pendingBriefs || 0,
                icon: FileText,
                bgColor: 'bg-amber-50',
                iconBg: 'bg-amber-500',
                iconColor: 'text-white',
            },
            {
                title: 'Completados',
                value: metrics?.completedProjects || 0,
                icon: CheckCircle2,
                bgColor: 'bg-green-50',
                iconBg: 'bg-green-500',
                iconColor: 'text-white',
            },
        ]
        : [
            {
                title: 'Proyectos Activos',
                value: metrics?.activeProjects || 0,
                icon: FolderKanban,
                bgColor: 'bg-blue-50',
                iconBg: 'bg-blue-500',
                iconColor: 'text-white',
            },
            {
                title: 'Briefs Pendientes',
                value: metrics?.pendingBriefs || 0,
                icon: FileText,
                bgColor: 'bg-amber-50',
                iconBg: 'bg-amber-500',
                iconColor: 'text-white',
            },
            {
                title: 'Clientes Totales',
                value: metrics?.totalClients || 0,
                icon: Users,
                bgColor: 'bg-purple-50',
                iconBg: 'bg-purple-500',
                iconColor: 'text-white',
            },
            {
                title: 'Completados este mes',
                value: metrics?.completedThisMonth || 0,
                icon: CheckCircle2,
                bgColor: 'bg-green-50',
                iconBg: 'bg-green-500',
                iconColor: 'text-white',
            },
        ];

    // Customize dashboard for clients
    if (metrics?.isClient) {
        return (
            <div className="space-y-8">
                {/* Client Welcome Header */}
                <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-3xl p-8 text-white shadow-xl shadow-blue-500/20">
                    <h1 className="text-3xl font-bold mb-2">
                        ¡Hola, {user?.name?.split(' ')[0]}! 👋
                    </h1>
                    <p className="text-blue-100 text-lg">
                        Aquí tienes un resumen de la actividad de tu agencia
                    </p>
                </div>

                {/* Stats for Client */}
                <div className="grid gap-6 md:grid-cols-3">
                    {statCards.map((stat, index) => (
                        <Card key={index} hover>
                            <CardContent className="p-6">
                                <div className="flex items-center gap-4">
                                    <div className={`p-3 rounded-xl ${stat.iconBg}`}>
                                        <stat.icon className={`w-6 h-6 ${stat.iconColor}`} />
                                    </div>
                                    <div>
                                        <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                                        <p className="text-sm text-gray-500">{stat.title}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Action Required Section */}
                {metrics?.pendingBriefs > 0 && (
                    <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center">
                                <FileText className="w-6 h-6 text-amber-600" />
                            </div>
                            <div>
                                <h3 className="font-bold text-amber-900 text-lg">Tienes briefs pendientes</h3>
                                <p className="text-amber-700 text-sm">Completa la información para iniciar tus proyectos.</p>
                            </div>
                        </div>
                        <Link to="/projects?filter=pending">
                            <Button variant="accent">
                                Completar ahora
                                <ArrowRight className="w-4 h-4" />
                            </Button>
                        </Link>
                    </div>
                )}

                {/* Recent Projects List */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle>Mis Proyectos</CardTitle>
                        <Link to="/projects">
                            <Button variant="ghost" size="sm" className="text-blue-600">
                                Ver todos <ArrowRight className="w-4 h-4 ml-1" />
                            </Button>
                        </Link>
                    </CardHeader>
                    <CardContent>
                        {metrics?.recentProjects?.length === 0 ? (
                            <div className="text-center py-12">
                                <FolderKanban className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                                <p className="text-gray-500">No tienes proyectos aún</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {metrics?.recentProjects?.map((project) => (
                                    <Link
                                        key={project.id}
                                        to={`/projects/${project.id}`}
                                        className="flex items-center justify-between p-4 rounded-xl hover:bg-gray-50 transition-colors border border-gray-100 group"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
                                                <FolderKanban className="w-6 h-6 text-blue-600" />
                                            </div>
                                            <div>
                                                <p className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                                                    {project.name}
                                                </p>
                                                <p className="text-sm text-gray-500">
                                                    {getProjectTypeLabel(project.type)}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <StatusBadge status={project.status} />
                                            <div className="flex items-center gap-1.5 text-sm text-gray-400">
                                                <Clock className="w-4 h-4" />
                                                {formatDate(project.deadline || project.createdAt)}
                                            </div>
                                            <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-blue-600 transition-colors" />
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        );
    }

    // Agency Dashboard
    return (
        <div className="space-y-8">
            {/* Welcome Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                        {user?.name?.split(' ')[0]} <span className="text-2xl">👋</span>
                    </h1>
                    <p className="text-gray-500 mt-1">Aquí tienes un resumen de la actividad de tu agencia</p>
                </div>
                <Link to="/projects/new">
                    <Button>
                        <Plus className="w-4 h-4" />
                        Nuevo Proyecto
                    </Button>
                </Link>
            </div>

            {/* Stats Grid */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                {statCards.map((stat, index) => (
                    <Card key={index} hover>
                        <CardContent className="p-6">
                            <div className="flex items-start justify-between">
                                <div className={`p-3 rounded-xl ${stat.iconBg}`}>
                                    <stat.icon className={`w-6 h-6 ${stat.iconColor}`} />
                                </div>

                            </div>
                            <div className="mt-4">
                                <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                                <p className="text-sm text-gray-500 mt-1">{stat.title}</p>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Recent Projects */}
            <Card>
                <CardHeader className="flex flex-row items-center justify-between border-b border-gray-100">
                    <CardTitle>Proyectos Recientes</CardTitle>
                    <Link to="/projects">
                        <Button variant="ghost" size="sm" className="text-blue-600">
                            Ver todos <ArrowRight className="w-4 h-4 ml-1" />
                        </Button>
                    </Link>
                </CardHeader>
                <CardContent className="p-0">
                    {metrics?.recentProjects?.length === 0 ? (
                        <div className="text-center py-16">
                            <div className="w-16 h-16 rounded-2xl bg-blue-100 flex items-center justify-center mx-auto mb-4">
                                <FolderKanban className="w-8 h-8 text-blue-600" />
                            </div>
                            <h3 className="font-semibold text-gray-900 mb-2">No hay proyectos aún</h3>
                            <p className="text-gray-500 mb-6">Crea tu primer proyecto para empezar</p>
                            <Link to="/projects/new">
                                <Button>
                                    <Plus className="w-4 h-4" />
                                    Crear Proyecto
                                </Button>
                            </Link>
                        </div>
                    ) : (
                        <div className="divide-y divide-gray-100">
                            {metrics?.recentProjects?.map((project) => (
                                <Link
                                    key={project.id}
                                    to={`/projects/${project.id}`}
                                    className="flex items-center justify-between p-5 hover:bg-gray-50 transition-colors group"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
                                            <FolderKanban className="w-6 h-6 text-blue-600" />
                                        </div>
                                        <div>
                                            <p className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                                                {project.name}
                                            </p>
                                            <p className="text-sm text-gray-500">
                                                {project.client?.name} • {getProjectTypeLabel(project.type)}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <StatusBadge status={project.status} />
                                        <div className="flex items-center gap-1.5 text-sm text-gray-400">
                                            <Clock className="w-4 h-4" />
                                            {formatDate(project.deadline || project.createdAt)}
                                        </div>
                                        <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-blue-600 transition-colors" />
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
