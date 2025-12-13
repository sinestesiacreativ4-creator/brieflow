import { useState, useEffect } from 'react';
import {
    MoreHorizontal,
    Plus,
    Calendar,
    MessageSquare,
    Paperclip,
    Clock,
    Search,
    Filter,
    CheckCircle2,
    Circle,
    AlertCircle,
    FileText,
    Video,
    Film,
    Palette,
    Code2,
    Rocket,
    Lightbulb,
    Layers,
    BookOpen
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { projectsApi } from '@/lib/api';

// Tipos para nuestro tablero
type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'REVIEW' | 'DONE';

interface KanbanColumn {
    id: 'TODO' | 'IN_PROGRESS' | 'REVIEW' | 'DONE';
    title: string;
    color: string;
    bg: string;
    icon: any;
}

// Configuraciones de columnas por tipo de industria
const WORKFLOW_CONFIGS: Record<string, KanbanColumn[]> = {
    ALL: [
        { id: 'TODO', title: 'Por Hacer', color: 'text-gray-600', bg: 'bg-gray-50', icon: Circle },
        { id: 'IN_PROGRESS', title: 'En Progreso', color: 'text-blue-600', bg: 'bg-blue-50', icon: Clock },
        { id: 'REVIEW', title: 'En Revisión', color: 'text-amber-600', bg: 'bg-amber-50', icon: AlertCircle },
        { id: 'DONE', title: 'Completado', color: 'text-green-600', bg: 'bg-green-50', icon: CheckCircle2 },
    ],
    VIDEO_PRODUCTION: [
        { id: 'TODO', title: 'Pre-Producción', color: 'text-purple-600', bg: 'bg-purple-50', icon: FileText },
        { id: 'IN_PROGRESS', title: 'Producción', color: 'text-red-600', bg: 'bg-red-50', icon: Video },
        { id: 'REVIEW', title: 'Post-Producción', color: 'text-amber-600', bg: 'bg-amber-50', icon: Film },
        { id: 'DONE', title: 'Entrega Final', color: 'text-green-600', bg: 'bg-green-50', icon: CheckCircle2 },
    ],
    WEB_DESIGN: [
        { id: 'TODO', title: 'Planificación & UX', color: 'text-indigo-600', bg: 'bg-indigo-50', icon: Palette },
        { id: 'IN_PROGRESS', title: 'Desarrollo', color: 'text-blue-600', bg: 'bg-blue-50', icon: Code2 },
        { id: 'REVIEW', title: 'QA & Revisión', color: 'text-amber-600', bg: 'bg-amber-50', icon: AlertCircle },
        { id: 'DONE', title: 'Lanzamiento', color: 'text-green-600', bg: 'bg-green-50', icon: Rocket },
    ],
    BRANDING: [
        { id: 'TODO', title: 'Estrategia & Brief', color: 'text-pink-600', bg: 'bg-pink-50', icon: Lightbulb },
        { id: 'IN_PROGRESS', title: 'Diseño', color: 'text-purple-600', bg: 'bg-purple-50', icon: Palette },
        { id: 'REVIEW', title: 'Refinamiento', color: 'text-amber-600', bg: 'bg-amber-50', icon: Layers },
        { id: 'DONE', title: 'Brandbook', color: 'text-green-600', bg: 'bg-green-50', icon: BookOpen },
    ]
};

export default function WorkflowPage() {
    const [projects, setProjects] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [draggingId, setDraggingId] = useState<string | null>(null);
    const [dragOverColumn, setDragOverColumn] = useState<string | null>(null);
    const [activeTypeView, setActiveTypeView] = useState<string>('ALL');

    const currentColumns = WORKFLOW_CONFIGS[activeTypeView] || WORKFLOW_CONFIGS['ALL'];

    const handleDragStart = (e: React.DragEvent, projectId: string) => {
        setDraggingId(projectId);
        e.dataTransfer.setData('projectId', projectId);
        e.dataTransfer.effectAllowed = 'move';
    };

    const handleDragOver = (e: React.DragEvent, columnId: string) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        if (dragOverColumn !== columnId) {
            setDragOverColumn(columnId);
        }
    };

    const handleDragLeave = (e: React.DragEvent) => {
        setDragOverColumn(null);
    };

    const handleDrop = async (e: React.DragEvent, targetColumnId: string) => {
        e.preventDefault();
        setDragOverColumn(null);
        const projectId = e.dataTransfer.getData('projectId');

        if (!projectId) return;

        // Mapeo Inteligente: Traducir la columna "Visual" al estado técnico "Backend"
        let newProjectStatus = '';
        if (targetColumnId === 'TODO') newProjectStatus = 'BRIEF_APPROVED';
        else if (targetColumnId === 'IN_PROGRESS') newProjectStatus = 'IN_PRODUCTION';
        else if (targetColumnId === 'REVIEW') newProjectStatus = 'IN_REVIEW';
        else if (targetColumnId === 'DONE') newProjectStatus = 'COMPLETED';
        else return;

        // Optimistic UI Update
        const updatedProjects = projects.map(p =>
            p.id === projectId ? { ...p, status: newProjectStatus } : p
        );
        setProjects(updatedProjects);
        setDraggingId(null);

        try {
            await projectsApi.update(projectId, { status: newProjectStatus });
        } catch (error) {
            console.error('Error updating project status:', error);
            loadProjects();
        }
    };

    useEffect(() => {
        loadProjects();
    }, []);

    const loadProjects = async () => {
        try {
            const response = await projectsApi.getAll();
            const projectsData = response.data.projects || [];
            setProjects(Array.isArray(projectsData) ? projectsData : []);
        } catch (error) {
            console.error('Error loading projects:', error);
            setProjects([]);
        } finally {
            setLoading(false);
        }
    };

    const getProjectsByStatus = (columnId: string) => {
        if (!Array.isArray(projects)) return [];

        return projects.filter(p => {
            if (!p) return false;

            // 1. Filtro por Vista Activa
            if (activeTypeView !== 'ALL' && p.type !== activeTypeView) return false;

            // 2. Mapeo de Estado Técnico a Columna Visual
            let isInColumn = false;
            if (columnId === 'TODO') {
                isInColumn = ['BRIEF_PENDING', 'BRIEF_SUBMITTED', 'BRIEF_APPROVED'].includes(p.status);
            } else if (columnId === 'IN_PROGRESS') {
                isInColumn = ['IN_PRODUCTION'].includes(p.status);
            } else if (columnId === 'REVIEW') {
                isInColumn = ['BRIEF_IN_REVIEW', 'IN_REVISION', 'IN_REVIEW'].includes(p.status);
            } else if (columnId === 'DONE') {
                isInColumn = ['COMPLETED', 'DELIVERED'].includes(p.status);
            }

            if (!isInColumn) return false;

            // 3. Filtro de Búsqueda
            if (!searchQuery.trim()) return true;
            const query = searchQuery.toLowerCase();
            return (
                p.name?.toLowerCase().includes(query) ||
                p.client?.name?.toLowerCase().includes(query) ||
                p.type?.toLowerCase().includes(query)
            );
        });
    };

    const formatDate = (dateString: string) => {
        if (!dateString) return '';
        return new Date(dateString).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
    };

    // Tipos de proyecto disponibles para el filtro
    const VIEW_TYPES = [
        { id: 'ALL', label: 'General' },
        { id: 'VIDEO_PRODUCTION', label: 'Audiovisual' },
        { id: 'WEB_DESIGN', label: 'Web & App' },
        { id: 'BRANDING', label: 'Branding' },
    ];

    return (
        <div className="h-full flex flex-col">
            {/* Header Adaptive */}
            <div className="mb-6 flex flex-col gap-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Flujo de Trabajo</h1>
                        <p className="text-gray-500">
                            {activeTypeView === 'ALL' ? 'Vista General de Proyectos' :
                                activeTypeView === 'VIDEO_PRODUCTION' ? 'Pipeline de Producción Audiovisual' :
                                    activeTypeView === 'WEB_DESIGN' ? 'Ciclo de Desarrollo Web' :
                                        'Gestión de Marca'}
                        </p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3">
                        <div className="relative flex-1 sm:flex-none">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <Input
                                placeholder="Buscar..."
                                className="pl-9 w-full sm:w-64 bg-white"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <Button onClick={() => window.location.href = '/projects/new'}>
                            <Plus className="w-4 h-4 mr-2" />
                            Nueva Tarea
                        </Button>
                    </div>
                </div>

                {/* Type Selector Tabs */}
                <div className="flex overflow-x-auto pb-2 gap-2 hide-scrollbar">
                    {VIEW_TYPES.map(type => (
                        <button
                            key={type.id}
                            onClick={() => setActiveTypeView(type.id)}
                            className={`px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap
                                ${activeTypeView === type.id
                                    ? 'bg-gray-900 text-white shadow-md transform scale-105'
                                    : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'}
                            `}
                        >
                            {type.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Loading Skeleton */}
            {loading ? (
                <div className="flex gap-6 overflow-hidden p-4">
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} className="flex-1 min-w-[280px]">
                            <div className="h-12 bg-gray-100 rounded-xl mb-3 animate-pulse" />
                            <div className="space-y-3">
                                <div className="h-32 bg-gray-100 rounded-xl animate-pulse" />
                                <div className="h-24 bg-gray-100 rounded-xl animate-pulse" />
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                /* Kanban Board Adaptive */
                <div className="flex-1 -mx-4 px-4 lg:mx-0 lg:px-0 overflow-y-auto lg:overflow-y-hidden lg:overflow-x-auto">
                    <div className="flex flex-col lg:flex-row gap-6 h-full pb-4 lg:min-w-[1000px]">
                        {currentColumns.map((col) => {
                            const colProjects = getProjectsByStatus(col.id);
                            const ColIcon = col.icon;
                            const isDragOver = dragOverColumn === col.id;

                            return (
                                <div
                                    key={col.id}
                                    className={`flex-shrink-0 w-full lg:w-80 flex flex-col h-auto lg:h-full transition-all duration-200 rounded-xl
                                        ${isDragOver ? 'bg-blue-50/50 ring-2 ring-blue-500/20' : ''}
                                    `}
                                    onDragOver={(e) => handleDragOver(e, col.id)}
                                    onDragLeave={handleDragLeave}
                                    onDrop={(e) => handleDrop(e, col.id)}
                                >
                                    {/* Column Header */}
                                    <div className={`flex items-center justify-between p-3 rounded-xl mb-3 ${col.bg} border border-transparent hover:border-gray-200 transition-colors shadow-sm`}>
                                        <div className="flex items-center gap-2 font-semibold text-gray-700">
                                            <ColIcon className={`w-4 h-4 ${col.color}`} />
                                            <span>{col.title}</span>
                                            <span className="bg-white/50 px-2 py-0.5 rounded-full text-xs text-gray-500">
                                                {colProjects.length}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <Button variant="ghost" size="icon" className="h-6 w-6">
                                                <Plus className="w-3 h-3 text-gray-500" />
                                            </Button>
                                        </div>
                                    </div>

                                    {/* Cards Container */}
                                    <div className={`flex-1 overflow-y-auto pr-2 space-y-3 transition-colors rounded-xl p-2 min-h-[150px] ${draggingId ? 'bg-gray-50/30 border-2 border-dashed border-gray-200' : ''}`}>
                                        {colProjects.map((project) => (
                                            <div
                                                key={project.id}
                                                draggable
                                                onDragStart={(e) => handleDragStart(e, project.id)}
                                                onClick={() => window.location.href = `/projects/${project.id}`}
                                                className={`group bg-white p-4 rounded-xl border border-gray-100 shadow-sm hover:shadow-md hover:border-blue-100 transition-all cursor-grab active:cursor-grabbing relative select-none
                                                    ${draggingId === project.id ? 'opacity-40 rotate-2 scale-95 grayscale' : ''}
                                                `}
                                            >
                                                {/* Priority Badge */}
                                                <div className="flex justify-between items-start mb-2">
                                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide
                                                        ${project.type === 'BRANDING' ? 'bg-purple-50 text-purple-600' :
                                                            project.type === 'WEB_DESIGN' ? 'bg-blue-50 text-blue-600' :
                                                                project.type === 'VIDEO_PRODUCTION' ? 'bg-red-50 text-red-600' :
                                                                    'bg-gray-100 text-gray-600'
                                                        }
                                                    `}>
                                                        {project.type ? project.type.replace(/_/g, ' ') : 'OTRO'}
                                                    </span>
                                                    <Button variant="ghost" size="icon" className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity -mr-2 -mt-2">
                                                        <MoreHorizontal className="w-3 h-3 text-gray-400" />
                                                    </Button>
                                                </div>

                                                <h3 className="font-semibold text-gray-900 mb-1 leading-tight line-clamp-2">
                                                    {project.name || 'Proyecto sin nombre'}
                                                </h3>

                                                {project.client ? (
                                                    <p className="text-xs text-gray-500 mb-3 truncate">{project.client.name}</p>
                                                ) : (
                                                    <p className="text-xs text-gray-400 mb-3">Cliente no asignado</p>
                                                )}

                                                {/* Footer Info */}
                                                <div className="flex items-center justify-between pt-3 border-t border-gray-50 text-xs text-gray-400">
                                                    <div className="flex items-center gap-3">
                                                        <span className="flex items-center gap-1">
                                                            <Calendar className="w-3 h-3" />
                                                            {formatDate(project.createdAt)}
                                                        </span>
                                                        {(project._count?.messages > 0) && (
                                                            <span className="flex items-center gap-1 text-amber-500 bg-amber-50 px-1.5 py-0.5 rounded">
                                                                <MessageSquare className="w-3 h-3" />
                                                                {project._count.messages}
                                                            </span>
                                                        )}
                                                        {(project._count?.files > 0) && (
                                                            <span className="flex items-center gap-1 text-blue-500 bg-blue-50 px-1.5 py-0.5 rounded">
                                                                <Paperclip className="w-3 h-3" />
                                                                {project._count.files}
                                                            </span>
                                                        )}
                                                    </div>

                                                    {/* Avatars */}
                                                    <div className="flex -space-x-2">
                                                        <div className="w-5 h-5 rounded-full bg-blue-100 border border-white flex items-center justify-center text-[8px] font-bold text-blue-600 ring-2 ring-white">
                                                            {project.assignedTo ? project.assignedTo.name.charAt(0) : (project.client?.name?.charAt(0) || '?')}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}

                                        {/* Add Card Button */}
                                        <button
                                            onClick={() => window.location.href = '/projects/new'}
                                            className="w-full py-2 flex items-center justify-center gap-2 text-sm text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg border border-dashed border-gray-200 transition-colors opacity-60 hover:opacity-100"
                                        >
                                            <Plus className="w-4 h-4" />
                                            Añadir tarjeta
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
}
