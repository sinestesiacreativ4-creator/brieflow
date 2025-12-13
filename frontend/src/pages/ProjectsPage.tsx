import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { projectsApi } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { StatusBadge } from '@/components/ui/badge';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { formatDate, getProjectTypeLabel } from '@/lib/utils';
import {
    Plus,
    Search,
    FolderKanban,
    ArrowRight,
    Filter,
    Clock,
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
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Proyectos</h1>
                    <p className="text-gray-600 mt-1">Gestiona todos tus proyectos creativos</p>
                </div>
                <Link to="/projects/new">
                    <Button>
                        <Plus className="w-4 h-4" />
                        Nuevo Proyecto
                    </Button>
                </Link>
            </div>

            {/* Filters */}
            <Card>
                <CardContent className="p-4">
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <Input
                                placeholder="Buscar proyectos..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                        <div className="flex gap-3">
                            <Select value={statusFilter} onValueChange={(v) => handleFilterChange('status', v)}>
                                <SelectTrigger className="w-[180px]">
                                    <Filter className="w-4 h-4 mr-2 text-gray-400" />
                                    <SelectValue placeholder="Estado" />
                                </SelectTrigger>
                                <SelectContent>
                                    {PROJECT_STATUSES.map((status) => (
                                        <SelectItem key={status.value} value={status.value}>
                                            {status.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <Select value={typeFilter} onValueChange={(v) => handleFilterChange('type', v)}>
                                <SelectTrigger className="w-[180px]">
                                    <SelectValue placeholder="Tipo" />
                                </SelectTrigger>
                                <SelectContent>
                                    {PROJECT_TYPES.map((type) => (
                                        <SelectItem key={type.value} value={type.value}>
                                            {type.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Projects List */}
            {loading ? (
                <div className="space-y-4">
                    {[...Array(3)].map((_, i) => (
                        <div key={i} className="h-24 bg-gray-100 rounded-2xl animate-pulse" />
                    ))}
                </div>
            ) : filteredProjects.length === 0 ? (
                <Card>
                    <CardContent className="flex flex-col items-center justify-center py-16">
                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center mb-4">
                            <FolderKanban className="w-8 h-8 text-indigo-600" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                            No se encontraron proyectos
                        </h3>
                        <p className="text-gray-500 text-center max-w-md mb-6">
                            {search || statusFilter !== 'all' || typeFilter !== 'all'
                                ? 'Intenta ajustar los filtros de búsqueda'
                                : 'Crea tu primer proyecto para empezar'}
                        </p>
                        <Link to="/projects/new">
                            <Button>
                                <Plus className="w-4 h-4" />
                                Nuevo Proyecto
                            </Button>
                        </Link>
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-4">
                    {filteredProjects.map((project) => (
                        <Link
                            key={project.id}
                            to={`/projects/${project.id}`}
                            className="block"
                        >
                            <Card hover className="overflow-hidden">
                                <CardContent className="p-0">
                                    <div className="flex items-center justify-between p-6 group">
                                        <div className="flex items-center gap-4">
                                            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center group-hover:from-indigo-200 group-hover:to-purple-200 transition-colors">
                                                <FolderKanban className="w-7 h-7 text-indigo-600" />
                                            </div>
                                            <div>
                                                <h3 className="font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors">
                                                    {project.name}
                                                </h3>
                                                <div className="flex items-center gap-3 mt-1 text-sm text-gray-500">
                                                    <span>{project.client?.name}</span>
                                                    <span className="w-1 h-1 rounded-full bg-gray-300" />
                                                    <span>{getProjectTypeLabel(project.type)}</span>
                                                    {project.assignedTo && (
                                                        <>
                                                            <span className="w-1 h-1 rounded-full bg-gray-300" />
                                                            <span>Asignado a: {project.assignedTo.name}</span>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <StatusBadge status={project.status} />
                                            <div className="hidden md:flex items-center gap-1 text-sm text-gray-400">
                                                <Clock className="w-4 h-4" />
                                                {formatDate(project.createdAt)}
                                            </div>
                                            <ArrowRight className="w-5 h-5 text-gray-300 group-hover:text-indigo-500 transition-colors" />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}
