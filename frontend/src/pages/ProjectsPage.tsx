import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { projectsApi } from '@/lib/api';
import { StatusBadge } from '@/components/ui/badge';
import { formatDate, getProjectTypeLabel } from '@/lib/utils';
import {
    Plus,
    Search,
    FolderKanban,
    ArrowRight,
    Clock,
    Filter,
    Sparkles,
} from 'lucide-react';

const PROJECT_TYPES = [
    { value: 'all', label: 'Todos los tipos' },
    { value: 'BRANDING', label: 'Branding' },
    { value: 'WEB_DESIGN', label: 'Diseño Web' },
    { value: 'ADVERTISING_CAMPAIGN', label: 'Campaña Publicitaria' },
    { value: 'VIDEO_PRODUCTION', label: 'Producción de Video' },
    { value: 'PACKAGING', label: 'Packaging' },
    { value: 'SOCIAL_MEDIA', label: 'Redes Sociales' },
    { value: 'OTHER', label: 'Otro' },
];

const PROJECT_STATUSES = [
    { value: 'all', label: 'Todos los estados' },
    { value: 'BRIEF_PENDING', label: 'Brief Pendiente' },
    { value: 'BRIEF_IN_REVIEW', label: 'Brief en Revisión' },
    { value: 'BRIEF_APPROVED', label: 'Brief Aprobado' },
    { value: 'IN_PRODUCTION', label: 'En Producción' },
    { value: 'IN_REVIEW', label: 'En Revisión' },
    { value: 'DELIVERED', label: 'Entregado' },
    { value: 'COMPLETED', label: 'Completado' },
];

export default function ProjectsPage() {
    const [searchParams, setSearchParams] = useSearchParams();
    const [projects, setProjects] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [pagination, setPagination] = useState({ page: 1, totalPages: 1 });
    const [search, setSearch] = useState(searchParams.get('search') || '');
    const [statusFilter, setStatusFilter] = useState(searchParams.get('status') || 'all');
    const [typeFilter, setTypeFilter] = useState(searchParams.get('type') || 'all');

    useEffect(() => {
        loadProjects();
    }, [searchParams]);

    const loadProjects = async () => {
        setLoading(true);
        try {
            const params: Record<string, string> = {};
            if (statusFilter !== 'all') params.status = statusFilter;
            if (typeFilter !== 'all') params.type = typeFilter;

            const response = await projectsApi.getAll(params);
            setProjects(response.data.projects);
            setPagination(response.data.pagination);
        } catch (error) {
            console.error('Error loading projects:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleFilterChange = (key: string, value: string) => {
        const newParams = new URLSearchParams(searchParams);
        if (value === 'all') {
            newParams.delete(key);
        } else {
            newParams.set(key, value);
        }
        setSearchParams(newParams);

        if (key === 'status') setStatusFilter(value);
        if (key === 'type') setTypeFilter(value);
    };

    const filteredProjects = projects.filter(project =>
        project.name.toLowerCase().includes(search.toLowerCase()) ||
        project.client?.name.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white">Proyectos</h1>
                    <p className="text-white/50 mt-2">Gestiona todos tus proyectos creativos</p>
                </div>
                <Link to="/projects/new">
                    <button className="btn-luxury">
                        <Plus className="w-4 h-4" />
                        Nuevo Proyecto
                    </button>
                </Link>
            </div>

            {/* Filters */}
            <div className="card-luxury p-5">
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1 relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
                        <input
                            placeholder="Buscar proyectos..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="input-luxury pl-12"
                        />
                    </div>
                    <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                        <div className="relative">
                            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 pointer-events-none" />
                            <select
                                value={statusFilter}
                                onChange={(e) => handleFilterChange('status', e.target.value)}
                                className="input-luxury pl-10 pr-10 appearance-none cursor-pointer min-w-[180px]"
                            >
                                {PROJECT_STATUSES.map((status) => (
                                    <option key={status.value} value={status.value}>
                                        {status.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <select
                            value={typeFilter}
                            onChange={(e) => handleFilterChange('type', e.target.value)}
                            className="input-luxury pr-10 appearance-none cursor-pointer min-w-[180px]"
                        >
                            {PROJECT_TYPES.map((type) => (
                                <option key={type.value} value={type.value}>
                                    {type.label}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {/* Projects List */}
            {loading ? (
                <div className="space-y-4">
                    {[...Array(3)].map((_, i) => (
                        <div key={i} className="h-24 bg-white/5 rounded-2xl animate-pulse" />
                    ))}
                </div>
            ) : filteredProjects.length === 0 ? (
                <div className="card-luxury p-16 text-center">
                    <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-amber-500/20 to-amber-500/5 border border-amber-500/20 flex items-center justify-center mx-auto mb-6">
                        <FolderKanban className="w-10 h-10 text-amber-400" />
                    </div>
                    <h3 className="text-xl font-semibold text-white mb-2">
                        No se encontraron proyectos
                    </h3>
                    <p className="text-white/40 max-w-md mx-auto mb-8">
                        {search || statusFilter !== 'all' || typeFilter !== 'all'
                            ? 'Intenta ajustar los filtros de búsqueda'
                            : 'Crea tu primer proyecto para empezar'}
                    </p>
                    <Link to="/projects/new">
                        <button className="btn-luxury">
                            <Plus className="w-4 h-4" />
                            Nuevo Proyecto
                        </button>
                    </Link>
                </div>
            ) : (
                <div className="space-y-4">
                    {filteredProjects.map((project, index) => (
                        <Link
                            key={project.id}
                            to={`/projects/${project.id}`}
                            className="block animate-fade-in"
                            style={{ animationDelay: `${index * 50}ms` }}
                        >
                            <div className="card-luxury p-5 group hover:border-amber-500/30 transition-all">
                                <div className="flex flex-col items-start sm:flex-row sm:items-center justify-between gap-4">
                                    <div className="flex items-center gap-4 min-w-0 flex-1">
                                        <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-cyan-500/20 to-cyan-500/5 border border-cyan-500/20 flex items-center justify-center group-hover:from-amber-500/20 group-hover:to-amber-500/5 group-hover:border-amber-500/20 transition-all flex-shrink-0">
                                            <FolderKanban className="w-6 h-6 text-cyan-400 group-hover:text-amber-400 transition-colors" />
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <h3 className="font-semibold text-white group-hover:text-amber-400 transition-colors truncate text-lg">
                                                {project.name}
                                            </h3>
                                            <div className="flex flex-wrap items-center gap-2 sm:gap-3 mt-1 text-sm text-white/40">
                                                <span className="truncate max-w-[120px] sm:max-w-none">{project.client?.name}</span>
                                                <span className="w-1 h-1 rounded-full bg-white/20 hidden sm:block" />
                                                <span className="hidden sm:inline">{getProjectTypeLabel(project.type)}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between w-full sm:w-auto gap-3 sm:gap-4">
                                        <StatusBadge status={project.status} />
                                        <div className="hidden md:flex items-center gap-1.5 text-sm text-white/30">
                                            <Clock className="w-4 h-4" />
                                            {formatDate(project.createdAt)}
                                        </div>
                                        <ArrowRight className="w-5 h-5 text-white/20 group-hover:text-amber-400 transition-colors" />
                                    </div>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}
