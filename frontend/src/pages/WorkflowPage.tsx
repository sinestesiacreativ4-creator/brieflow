import { useState, useEffect } from 'react';
import {
    MoreHorizontal,
    Plus,
    Calendar,
    MessageSquare,
    Paperclip,
    Clock,
    Search,
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
    BookOpen,
    Zap,
} from 'lucide-react';
import { projectsApi } from '@/lib/api';

interface KanbanColumn {
    id: 'TODO' | 'IN_PROGRESS' | 'REVIEW' | 'DONE';
    title: string;
    color: string;
    bg: string;
    borderColor: string;
    icon: any;
}

const WORKFLOW_CONFIGS: Record<string, KanbanColumn[]> = {
    ALL: [
        { id: 'TODO', title: 'Por Hacer', color: 'text-white/60', bg: 'bg-white/5', borderColor: 'border-white/10', icon: Circle },
        { id: 'IN_PROGRESS', title: 'En Progreso', color: 'text-cyan-400', bg: 'bg-cyan-500/10', borderColor: 'border-cyan-500/20', icon: Clock },
        { id: 'REVIEW', title: 'En Revisión', color: 'text-amber-400', bg: 'bg-amber-500/10', borderColor: 'border-amber-500/20', icon: AlertCircle },
        { id: 'DONE', title: 'Completado', color: 'text-emerald-400', bg: 'bg-emerald-500/10', borderColor: 'border-emerald-500/20', icon: CheckCircle2 },
    ],
    VIDEO_PRODUCTION: [
        { id: 'TODO', title: 'Pre-Producción', color: 'text-purple-400', bg: 'bg-purple-500/10', borderColor: 'border-purple-500/20', icon: FileText },
        { id: 'IN_PROGRESS', title: 'Producción', color: 'text-red-400', bg: 'bg-red-500/10', borderColor: 'border-red-500/20', icon: Video },
        { id: 'REVIEW', title: 'Post-Producción', color: 'text-amber-400', bg: 'bg-amber-500/10', borderColor: 'border-amber-500/20', icon: Film },
        { id: 'DONE', title: 'Entrega Final', color: 'text-emerald-400', bg: 'bg-emerald-500/10', borderColor: 'border-emerald-500/20', icon: CheckCircle2 },
    ],
    WEB_DESIGN: [
        { id: 'TODO', title: 'Planificación & UX', color: 'text-indigo-400', bg: 'bg-indigo-500/10', borderColor: 'border-indigo-500/20', icon: Palette },
        { id: 'IN_PROGRESS', title: 'Desarrollo', color: 'text-cyan-400', bg: 'bg-cyan-500/10', borderColor: 'border-cyan-500/20', icon: Code2 },
        { id: 'REVIEW', title: 'QA & Revisión', color: 'text-amber-400', bg: 'bg-amber-500/10', borderColor: 'border-amber-500/20', icon: AlertCircle },
        { id: 'DONE', title: 'Lanzamiento', color: 'text-emerald-400', bg: 'bg-emerald-500/10', borderColor: 'border-emerald-500/20', icon: Rocket },
    ],
    BRANDING: [
        { id: 'TODO', title: 'Estrategia & Brief', color: 'text-pink-400', bg: 'bg-pink-500/10', borderColor: 'border-pink-500/20', icon: Lightbulb },
        { id: 'IN_PROGRESS', title: 'Diseño', color: 'text-purple-400', bg: 'bg-purple-500/10', borderColor: 'border-purple-500/20', icon: Palette },
        { id: 'REVIEW', title: 'Refinamiento', color: 'text-amber-400', bg: 'bg-amber-500/10', borderColor: 'border-amber-500/20', icon: Layers },
        { id: 'DONE', title: 'Brandbook', color: 'text-emerald-400', bg: 'bg-emerald-500/10', borderColor: 'border-emerald-500/20', icon: BookOpen },
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

    const handleDragLeave = () => {
        setDragOverColumn(null);
    };

    const handleDrop = async (e: React.DragEvent, targetColumnId: string) => {
        e.preventDefault();
        setDragOverColumn(null);
        const projectId = e.dataTransfer.getData('projectId');

        if (!projectId) return;

        let newProjectStatus = '';
        if (targetColumnId === 'TODO') newProjectStatus = 'BRIEF_APPROVED';
        else if (targetColumnId === 'IN_PROGRESS') newProjectStatus = 'IN_PRODUCTION';
        else if (targetColumnId === 'REVIEW') newProjectStatus = 'IN_REVIEW';
        else if (targetColumnId === 'DONE') newProjectStatus = 'COMPLETED';
        else return;

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
            if (activeTypeView !== 'ALL' && p.type !== activeTypeView) return false;

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

    const VIEW_TYPES = [
        { id: 'ALL', label: 'General' },
        { id: 'VIDEO_PRODUCTION', label: 'Audiovisual' },
        { id: 'WEB_DESIGN', label: 'Web & App' },
        { id: 'BRANDING', label: 'Branding' },
    ];

    return (
        <div className="h-full flex flex-col">
            {/* Header */}
            <div className="mb-8 flex flex-col gap-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-white">Flujo de Trabajo</h1>
                        <p className="text-white/50 mt-2">
                            {activeTypeView === 'ALL' ? 'Vista General de Proyectos' :
                                activeTypeView === 'VIDEO_PRODUCTION' ? 'Pipeline de Producción Audiovisual' :
                                    activeTypeView === 'WEB_DESIGN' ? 'Ciclo de Desarrollo Web' :
                                        'Gestión de Marca'}
                        </p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3">
                        <div className="relative flex-1 sm:flex-none">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                            <input
                                placeholder="Buscar..."
                                className="input-luxury pl-11 w-full sm:w-64"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <button
                            onClick={() => window.location.href = '/projects/new'}
                            className="btn-luxury"
                        >
                            <Plus className="w-4 h-4" />
                            Nueva Tarea
                        </button>
                    </div>
                </div>

                {/* Type Selector Tabs */}
                <div className="flex overflow-x-auto pb-2 gap-2 hide-scrollbar">
                    {VIEW_TYPES.map(type => (
                        <button
                            key={type.id}
                            onClick={() => setActiveTypeView(type.id)}
                            className={`px-5 py-2.5 rounded-xl text-sm font-medium transition-all whitespace-nowrap
                                ${activeTypeView === type.id
                                    ? 'bg-gradient-to-r from-cyan-500/20 to-cyan-500/10 text-cyan-400 border border-cyan-500/30'
                                    : 'bg-white/5 text-white/50 hover:text-white/80 border border-white/10 hover:border-white/20'}
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
                            <div className="h-12 bg-white/5 rounded-xl mb-3 animate-pulse" />
                            <div className="space-y-3">
                                <div className="h-32 bg-white/5 rounded-xl animate-pulse" />
                                <div className="h-24 bg-white/5 rounded-xl animate-pulse" />
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                /* Kanban Board */
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
                                        ${isDragOver ? 'bg-cyan-500/10 ring-2 ring-cyan-500/30' : ''}
                                    `}
                                    onDragOver={(e) => handleDragOver(e, col.id)}
                                    onDragLeave={handleDragLeave}
                                    onDrop={(e) => handleDrop(e, col.id)}
                                >
                                    {/* Column Header */}
                                    <div className={`flex items-center justify-between p-4 rounded-xl mb-3 ${col.bg} border ${col.borderColor}`}>
                                        <div className="flex items-center gap-2.5 font-semibold text-white">
                                            <ColIcon className={`w-4 h-4 ${col.color}`} />
                                            <span>{col.title}</span>
                                            <span className="bg-white/10 px-2.5 py-0.5 rounded-full text-xs text-white/60">
                                                {colProjects.length}
                                            </span>
                                        </div>
                                        <button className="p-1.5 rounded-lg hover:bg-white/10 transition-colors">
                                            <Plus className="w-4 h-4 text-white/40" />
                                        </button>
                                    </div>

                                    {/* Cards Container */}
                                    <div className={`flex-1 overflow-y-auto space-y-3 transition-colors rounded-xl p-2 min-h-[150px] 
                                        ${draggingId ? 'bg-white/[0.02] border-2 border-dashed border-white/10' : ''}`}
                                    >
                                        {colProjects.map((project, index) => (
                                            <div
                                                key={project.id}
                                                draggable
                                                onDragStart={(e) => handleDragStart(e, project.id)}
                                                onClick={() => window.location.href = `/projects/${project.id}`}
                                                className={`group card-luxury p-4 cursor-grab active:cursor-grabbing select-none animate-fade-in
                                                    ${draggingId === project.id ? 'opacity-40 rotate-1 scale-95' : 'hover:border-cyan-500/30'}
                                                `}
                                                style={{ animationDelay: `${index * 50}ms` }}
                                            >
                                                {/* Type Badge */}
                                                <div className="flex justify-between items-start mb-3">
                                                    <span className={`text-[10px] font-bold px-2 py-1 rounded-lg uppercase tracking-wider
                                                        ${project.type === 'BRANDING' ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30' :
                                                            project.type === 'WEB_DESIGN' ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30' :
                                                                project.type === 'VIDEO_PRODUCTION' ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                                                                    project.type === 'PACKAGING' ? 'bg-teal-500/20 text-teal-400 border border-teal-500/30' :
                                                                        project.type === 'ADVERTISING_CAMPAIGN' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                                                                            'bg-white/10 text-white/60 border border-white/20'
                                                        }
                                                    `}>
                                                        {project.type ? project.type.replace(/_/g, ' ') : 'OTHER'}
                                                    </span>
                                                    <button className="p-1 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-white/10 transition-all">
                                                        <MoreHorizontal className="w-4 h-4 text-white/40" />
                                                    </button>
                                                </div>

                                                <h3 className="font-semibold text-white mb-1 leading-tight line-clamp-2 group-hover:text-cyan-400 transition-colors">
                                                    {project.name || 'Proyecto sin nombre'}
                                                </h3>

                                                <p className="text-xs text-white/40 mb-3 truncate">
                                                    {project.client?.name || 'Cliente no asignado'}
                                                </p>

                                                {/* Footer */}
                                                <div className="flex items-center justify-between pt-3 border-t border-white/5 text-xs text-white/30">
                                                    <div className="flex items-center gap-3">
                                                        <span className="flex items-center gap-1">
                                                            <Calendar className="w-3 h-3" />
                                                            {formatDate(project.createdAt)}
                                                        </span>
                                                        {(project._count?.messages > 0) && (
                                                            <span className="flex items-center gap-1 text-cyan-400 bg-cyan-500/10 px-1.5 py-0.5 rounded">
                                                                <MessageSquare className="w-3 h-3" />
                                                                {project._count.messages}
                                                            </span>
                                                        )}
                                                        {(project._count?.files > 0) && (
                                                            <span className="flex items-center gap-1 text-purple-400 bg-purple-500/10 px-1.5 py-0.5 rounded">
                                                                <Paperclip className="w-3 h-3" />
                                                                {project._count.files}
                                                            </span>
                                                        )}
                                                    </div>

                                                    {/* Avatar */}
                                                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-cyan-400 to-cyan-600 flex items-center justify-center text-[9px] font-bold text-gray-950">
                                                        {project.assignedTo ? project.assignedTo.name.charAt(0) : (project.client?.name?.charAt(0) || '?')}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}

                                        {/* Add Card Button */}
                                        <button
                                            onClick={() => window.location.href = '/projects/new'}
                                            className="w-full py-3 flex items-center justify-center gap-2 text-sm text-white/30 hover:text-cyan-400 hover:bg-cyan-500/5 rounded-xl border border-dashed border-white/10 hover:border-cyan-500/30 transition-all"
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
