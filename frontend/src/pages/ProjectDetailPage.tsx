import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { projectsApi, briefsApi, filesApi, contractsApi } from '@/lib/api';
import { useAuthStore } from '@/lib/auth';
import { useSocket } from '@/hooks/useSocket';
import { StatusBadge } from '@/components/ui/badge';
import { formatDate, formatDateTime, formatFileSize, getProjectTypeLabel } from '@/lib/utils';
import {
    ArrowLeft,
    FileText,
    MessageSquare,
    Upload,
    Clock,
    CheckCircle2,
    XCircle,
    Download,
    Trash2,
    Send,
    Image,
    File,
    Loader2,
    Layout,
    Zap,
    FileSignature,
    Pen,
} from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import { getWorkflowForType } from '@/lib/workflow';
import jsPDF from 'jspdf';
import ContractGenerator from '@/components/ContractGenerator';

export default function ProjectDetailPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { user } = useAuthStore();
    const [project, setProject] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('brief');
    const [message, setMessage] = useState('');
    const [sendingMessage, setSendingMessage] = useState(false);
    const [uploadingFile, setUploadingFile] = useState(false);
    const [approvingBrief, setApprovingBrief] = useState(false);
    const [showContractModal, setShowContractModal] = useState(false);
    const [contract, setContract] = useState<any>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const {
        isConnected,
        messages: realtimeMessages,
        typingUsers,
        sendMessage: sendSocketMessage,
        setTyping,
        setMessages: setRealtimeMessages,
        updateStatus,
        lastProjectUpdate
    } = useSocket(id);

    useEffect(() => {
        if (id) loadProject();
    }, [id, lastProjectUpdate]);

    useEffect(() => {
        scrollToBottom();
    }, [project?.messages, realtimeMessages]);

    useEffect(() => {
        if (project?.messages) {
            setRealtimeMessages(project.messages);
        }
    }, [project?.messages]);

    const loadProject = async () => {
        try {
            const response = await projectsApi.getOne(id!);
            setProject(response.data);

            // Load contract if exists
            try {
                const contractRes = await contractsApi.get(id!);
                setContract(contractRes.data);
            } catch {
                setContract(null);
            }
        } catch (error) {
            console.error('Error loading project:', error);
            navigate('/projects');
        } finally {
            setLoading(false);
        }
    };

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const handleApproveBrief = async () => {
        if (!project?.brief?.id) return;
        setApprovingBrief(true);
        try {
            await briefsApi.approve(project.brief.id);
            await loadProject();
        } catch (error) {
            console.error('Error approving brief:', error);
        } finally {
            setApprovingBrief(false);
        }
    };

    const handleRequestChanges = async () => {
        if (!project?.brief?.id) return;
        try {
            await briefsApi.requestChanges(project.brief.id, 'Se requieren cambios en el brief');
            await loadProject();
        } catch (error) {
            console.error('Error requesting changes:', error);
        }
    };

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop: async (acceptedFiles) => {
            if (acceptedFiles.length === 0) return;
            setUploadingFile(true);
            try {
                for (const file of acceptedFiles) {
                    await filesApi.upload(id!, file);
                }
                await loadProject();
            } catch (error) {
                console.error('Error uploading file:', error);
            } finally {
                setUploadingFile(false);
            }
        },
        maxSize: 10 * 1024 * 1024,
    });

    const handleDeleteFile = async (fileId: string) => {
        if (!confirm('¿Estás seguro de eliminar este archivo?')) return;
        try {
            await filesApi.delete(fileId);
            await loadProject();
        } catch (error) {
            console.error('Error deleting file:', error);
        }
    };

    const workflowSteps = project ? getWorkflowForType(project.type) : [];
    const currentStepIndex = project ? workflowSteps.findIndex(s => s.id === project.status) : 0;

    const downloadBriefAsPDF = () => {
        if (!project?.brief) return;

        const doc = new jsPDF();
        const brief = project.brief;
        const pageWidth = doc.internal.pageSize.getWidth();
        let y = 20;
        const margin = 20;
        const lineHeight = 7;
        const maxWidth = pageWidth - margin * 2;

        const addText = (text: string, isBold = false) => {
            if (isBold) doc.setFont('helvetica', 'bold');
            else doc.setFont('helvetica', 'normal');
            const lines = doc.splitTextToSize(text, maxWidth);
            lines.forEach((line: string) => {
                if (y > 270) { doc.addPage(); y = 20; }
                doc.text(line, margin, y);
                y += lineHeight;
            });
        };

        doc.setFontSize(20);
        doc.setFont('helvetica', 'bold');
        doc.text(`Brief: ${project.name}`, margin, y);
        y += 12;

        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(100, 100, 100);
        doc.text(`Cliente: ${project.client?.name || 'N/A'}`, margin, y);
        y += 6;
        doc.text(`Tipo: ${getProjectTypeLabel(project.type)}`, margin, y);
        y += 6;
        doc.text(`Fecha: ${formatDate(brief.completedAt || new Date())}`, margin, y);
        y += 12;

        doc.setTextColor(0, 0, 0);
        doc.setFontSize(11);

        const fields = [
            { label: 'Objetivos del Proyecto', value: brief.projectGoals },
            { label: 'Público Objetivo', value: brief.targetAudience },
            { label: 'Mensaje Clave', value: brief.keyMessage },
            { label: 'Tono de Comunicación', value: brief.communicationTone },
            { label: 'Competidores / Referencias', value: brief.competitors },
            { label: 'Lineamientos de Marca', value: brief.brandGuidelines },
            { label: 'Presupuesto', value: brief.budget },
            { label: 'Timeline', value: brief.timeline },
            { label: 'Entregables', value: brief.deliverables },
            { label: 'Notas Adicionales', value: brief.additionalNotes },
        ];

        fields.forEach(({ label, value }) => {
            if (value) {
                y += 4;
                addText(label, true);
                addText(value, false);
                y += 4;
            }
        });

        doc.save(`Brief-${project.name.replace(/\s+/g, '_')}.pdf`);
    };

    if (loading) {
        return (
            <div className="space-y-6">
                <div className="h-8 bg-white/5 rounded w-1/3 animate-pulse" />
                <div className="h-64 bg-white/5 rounded-2xl animate-pulse" />
            </div>
        );
    }

    if (!project) return null;

    const isClient = user?.role === 'CLIENT';
    const briefCompleted = project.brief?.completedAt != null;

    const tabs = [
        { id: 'workflow', label: 'Workflow', icon: Layout },
        { id: 'brief', label: 'Brief', icon: FileText },
        { id: 'contract', label: 'Contrato', icon: FileSignature },
        { id: 'chat', label: 'Chat', icon: MessageSquare, count: project.messages?.length },
        { id: 'files', label: 'Archivos', icon: Upload, count: project.files?.length },
    ];

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col gap-4">
                <button
                    onClick={() => navigate('/projects')}
                    className="flex items-center gap-2 text-white/50 hover:text-cyan-400 transition-colors w-fit text-sm"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Volver
                </button>
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-bold text-white">{project.name}</h1>
                        <div className="flex flex-wrap items-center gap-2 sm:gap-3 mt-2 text-sm text-white/40">
                            <span>{project.client?.name}</span>
                            <span className="hidden sm:inline text-white/20">•</span>
                            <span className="hidden sm:inline">{getProjectTypeLabel(project.type)}</span>
                            <StatusBadge status={project.status} />
                        </div>
                    </div>
                    {/* Contract Button - Solo para admins */}
                    {!isClient && (
                        <button
                            onClick={() => setShowContractModal(true)}
                            className="btn-luxury flex items-center gap-2"
                        >
                            <FileSignature className="w-4 h-4" />
                            Generar Contrato
                        </button>
                    )}
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 overflow-x-auto pb-2 hide-scrollbar">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-medium transition-all whitespace-nowrap
                            ${activeTab === tab.id
                                ? 'bg-gradient-to-r from-cyan-500/15 to-cyan-500/5 text-cyan-400 border border-cyan-500/30'
                                : 'bg-white/5 text-white/50 hover:text-white/80 border border-white/10 hover:border-white/20'}
                        `}
                    >
                        <tab.icon className="w-4 h-4" />
                        <span className="hidden sm:inline">{tab.label}</span>
                        {tab.count && tab.count > 0 && (
                            <span className="bg-cyan-500/20 text-cyan-400 text-xs px-2 py-0.5 rounded-full">
                                {tab.count}
                            </span>
                        )}
                    </button>
                ))}
            </div>

            {/* Workflow Tab */}
            {activeTab === 'workflow' && (
                <div className="card-luxury p-8 animate-fade-in">
                    <h2 className="text-xl font-bold text-white mb-8">Flujo de Trabajo: {getProjectTypeLabel(project.type)}</h2>

                    <div className="relative py-12 px-4">
                        {/* Progress Bar Background */}
                        <div className="absolute top-1/2 left-0 w-full h-1 bg-white/10 -translate-y-1/2 rounded-full" />

                        {/* Active Progress */}
                        <div
                            className="absolute top-1/2 left-0 h-1 bg-gradient-to-r from-cyan-500 to-cyan-400 -translate-y-1/2 rounded-full transition-all duration-500"
                            style={{ width: `${(currentStepIndex / (workflowSteps.length - 1)) * 100}%` }}
                        />

                        {/* Steps */}
                        <div className="relative flex justify-between">
                            {workflowSteps.map((step, index) => {
                                const isActive = index <= currentStepIndex;
                                const isCurrent = index === currentStepIndex;

                                return (
                                    <div key={step.id} className="flex flex-col items-center group relative">
                                        <button
                                            onClick={() => !isClient && updateStatus(step.id)}
                                            disabled={isClient}
                                            className={`w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all duration-300 z-10
                                                ${isActive
                                                    ? 'bg-cyan-500 border-cyan-500 text-gray-950 shadow-[0_0_20px_rgba(6,182,212,0.4)]'
                                                    : 'bg-gray-900 border-white/20 text-white/40 hover:border-cyan-500/50'}
                                                ${!isClient && 'cursor-pointer hover:scale-110'}
                                            `}
                                            title={isClient ? 'Solo la agencia puede cambiar el estado' : 'Click para cambiar estado'}
                                        >
                                            {isActive ? <CheckCircle2 className="w-5 h-5" /> : <div className="w-3 h-3 rounded-full bg-white/20" />}
                                        </button>

                                        <div className={`absolute top-16 text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap
                                            ${isCurrent
                                                ? 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/30'
                                                : 'text-white/40'}`}
                                        >
                                            {step.label}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    <div className="mt-24 p-6 rounded-xl bg-cyan-500/5 border border-cyan-500/20 flex items-start gap-4">
                        <div className="p-3 bg-cyan-500/15 rounded-xl border border-cyan-500/30">
                            <Zap className="w-6 h-6 text-cyan-400" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-white mb-1">Estado Actual: {workflowSteps[currentStepIndex]?.label}</h3>
                            <p className="text-sm text-white/50">
                                {isClient
                                    ? 'Tu agencia actualizará el estado a medida que avance el proyecto.'
                                    : 'Haz clic en los círculos para cambiar el estado. El cliente será notificado automáticamente.'}
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Brief Tab */}
            {activeTab === 'brief' && (
                <div className="card-luxury p-8 animate-fade-in">
                    <div className="flex flex-col sm:flex-row items-start justify-between gap-4 mb-8">
                        <div>
                            <h2 className="text-xl font-bold text-white">Brief del Proyecto</h2>
                            {briefCompleted && (
                                <p className="text-sm text-white/40 mt-1">
                                    Completado el {formatDate(project.brief.completedAt)}
                                </p>
                            )}
                        </div>
                        <div className="flex gap-2">
                            {!isClient && briefCompleted && project.status === 'BRIEF_IN_REVIEW' && (
                                <>
                                    <button onClick={handleRequestChanges} className="btn-secondary-luxury">
                                        <XCircle className="w-4 h-4" />
                                        Solicitar cambios
                                    </button>
                                    <button onClick={handleApproveBrief} disabled={approvingBrief} className="btn-luxury">
                                        {approvingBrief ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                                        Aprobar Brief
                                    </button>
                                </>
                            )}
                            {!isClient && briefCompleted && (
                                <button onClick={downloadBriefAsPDF} className="btn-secondary-luxury">
                                    <Download className="w-4 h-4" />
                                    Descargar PDF
                                </button>
                            )}
                        </div>
                    </div>

                    {!briefCompleted ? (
                        <div className="text-center py-16">
                            <div className="w-20 h-20 rounded-3xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mx-auto mb-6">
                                <Clock className="w-10 h-10 text-amber-400" />
                            </div>
                            <h3 className="text-xl font-semibold text-white mb-2">Esperando Brief del Cliente</h3>
                            <p className="text-white/40 max-w-md mx-auto mb-6">
                                El cliente aún no ha completado el brief. Recibirás una notificación cuando lo haga.
                            </p>
                            {isClient && (
                                <button onClick={() => navigate(`/client/brief/${project.id}`)} className="btn-luxury">
                                    Completar Brief
                                </button>
                            )}
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {[
                                { label: 'Objetivos del Proyecto', value: project.brief.projectGoals },
                                { label: 'Público Objetivo', value: project.brief.targetAudience },
                                { label: 'Mensaje Clave', value: project.brief.keyMessage },
                                { label: 'Tono de Comunicación', value: project.brief.communicationTone },
                                { label: 'Competidores/Referencias', value: project.brief.competitors },
                                { label: 'Presupuesto', value: project.brief.budget },
                                { label: 'Timeline', value: project.brief.timeline },
                                { label: 'Entregables', value: project.brief.deliverables },
                                { label: 'Notas Adicionales', value: project.brief.additionalNotes },
                            ].filter(f => f.value).map((field, i) => (
                                <div key={i} className="p-5 rounded-xl bg-white/[0.02] border border-white/5">
                                    <h4 className="text-sm font-medium text-cyan-400 mb-2">{field.label}</h4>
                                    <p className="text-white/80 whitespace-pre-wrap">{field.value}</p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Chat Tab */}
            {activeTab === 'chat' && (
                <div className="card-luxury h-[500px] sm:h-[600px] flex flex-col animate-fade-in overflow-hidden">
                    <div className="p-6 border-b border-white/5 flex items-center justify-between">
                        <h2 className="text-lg font-bold text-white">Chat del Proyecto</h2>
                        <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-emerald-500 animate-pulse' : 'bg-white/30'}`} />
                            <span className="text-xs text-white/40">{isConnected ? 'En línea' : 'Conectando...'}</span>
                        </div>
                    </div>

                    <div className="flex-1 flex flex-col overflow-hidden p-6">
                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto space-y-4 mb-4">
                            {realtimeMessages.length === 0 ? (
                                <div className="text-center py-12 text-white/40">
                                    No hay mensajes aún. ¡Inicia la conversación!
                                </div>
                            ) : (
                                realtimeMessages.map((msg: any) => {
                                    const isOwn = msg.senderId === user?.id;
                                    return (
                                        <div key={msg.id} className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
                                            <div className={`max-w-[70%] rounded-2xl px-4 py-3
                                                ${isOwn
                                                    ? 'bg-gradient-to-r from-cyan-500 to-cyan-600 text-gray-950 rounded-br-md'
                                                    : 'bg-white/5 text-white border border-white/10 rounded-bl-md'}`
                                            }>
                                                {!isOwn && (
                                                    <p className="text-xs font-medium mb-1 text-cyan-400">{msg.sender?.name}</p>
                                                )}
                                                <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                                                <p className={`text-xs mt-1 ${isOwn ? 'text-cyan-900/60' : 'text-white/30'}`}>
                                                    {formatDateTime(msg.createdAt)}
                                                </p>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Typing Indicator */}
                        {typingUsers.length > 0 && (
                            <div className="flex items-center gap-2 mb-2 text-sm text-white/40">
                                <div className="flex gap-1">
                                    <span className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                    <span className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                    <span className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                                </div>
                                <span>{typingUsers.map(u => u.userName).join(', ')} está escribiendo...</span>
                            </div>
                        )}

                        {/* Message Input */}
                        <div className="flex gap-3">
                            <textarea
                                value={message}
                                onChange={(e) => {
                                    setMessage(e.target.value);
                                    setTyping(e.target.value.length > 0);
                                }}
                                onBlur={() => setTyping(false)}
                                placeholder="Escribe un mensaje..."
                                className="input-luxury min-h-[60px] resize-none flex-1"
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' && !e.shiftKey) {
                                        e.preventDefault();
                                        if (message.trim() && isConnected) {
                                            sendSocketMessage(message.trim());
                                            setMessage('');
                                            setTyping(false);
                                        }
                                    }
                                }}
                            />
                            <button
                                disabled={!message.trim() || !isConnected}
                                onClick={() => {
                                    if (message.trim() && isConnected) {
                                        sendSocketMessage(message.trim());
                                        setMessage('');
                                        setTyping(false);
                                    }
                                }}
                                className="btn-luxury h-[60px] w-[60px] !p-0"
                            >
                                <Send className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Contract Tab */}
            {activeTab === 'contract' && (
                <div className="card-luxury p-8 animate-fade-in">
                    <h2 className="text-xl font-bold text-white mb-6">Contrato del Proyecto</h2>

                    {contract ? (
                        <div className="space-y-6">
                            {/* Contract Status */}
                            <div className="flex items-center gap-4 p-4 rounded-xl bg-white/5 border border-white/10">
                                {contract.status === 'SIGNED' ? (
                                    <>
                                        <div className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center">
                                            <CheckCircle2 className="w-6 h-6 text-green-400" />
                                        </div>
                                        <div>
                                            <p className="text-white font-semibold">Contrato Firmado</p>
                                            <p className="text-white/50 text-sm">Firmado el {formatDate(contract.signedAt)}</p>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <div className="w-12 h-12 rounded-full bg-yellow-500/10 flex items-center justify-center">
                                            <Clock className="w-6 h-6 text-yellow-400" />
                                        </div>
                                        <div>
                                            <p className="text-white font-semibold">Pendiente de Firma</p>
                                            <p className="text-white/50 text-sm">Esperando firma del cliente</p>
                                        </div>
                                    </>
                                )}
                            </div>

                            {/* Contract Details */}
                            <div className="grid md:grid-cols-2 gap-6">
                                <div className="space-y-4">
                                    <h3 className="text-lg font-semibold text-white">Detalles</h3>
                                    <div className="space-y-2 text-sm">
                                        <p><span className="text-white/50">Cliente:</span> <span className="text-white">{contract.clientName}</span></p>
                                        <p><span className="text-white/50">Proyecto:</span> <span className="text-white">{contract.projectName}</span></p>
                                        <p><span className="text-white/50">Presupuesto:</span> <span className="text-cyan-400 font-semibold">{contract.budget || 'N/A'}</span></p>
                                        <p><span className="text-white/50">Timeline:</span> <span className="text-white">{contract.timeline || 'N/A'}</span></p>
                                    </div>
                                </div>

                                {/* Signatures */}
                                <div className="space-y-4">
                                    <h3 className="text-lg font-semibold text-white">Firmas</h3>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                                            <p className="text-white/50 text-xs mb-2">Agencia</p>
                                            {contract.agencySignature ? (
                                                <img src={contract.agencySignature} alt="Firma Agencia" className="h-12 object-contain" />
                                            ) : (
                                                <p className="text-white/30 text-sm">Sin firma</p>
                                            )}
                                        </div>
                                        <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                                            <p className="text-white/50 text-xs mb-2">Cliente</p>
                                            {contract.clientSignature ? (
                                                <img src={contract.clientSignature} alt="Firma Cliente" className="h-12 object-contain" />
                                            ) : (
                                                <p className="text-white/30 text-sm">Pendiente</p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex gap-4 pt-4 border-t border-white/10">
                                {isClient && contract.status !== 'SIGNED' ? (
                                    <button
                                        onClick={() => navigate(`/sign-contract/${contract.id}`)}
                                        className="btn-luxury"
                                    >
                                        <Pen className="w-4 h-4" />
                                        Firmar Contrato
                                    </button>
                                ) : (
                                    <button
                                        onClick={() => setShowContractModal(true)}
                                        className="btn-luxury"
                                    >
                                        <Download className="w-4 h-4" />
                                        {contract.status === 'SIGNED' ? 'Descargar Contrato' : 'Ver/Descargar Contrato'}
                                    </button>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="text-center py-12">
                            <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-4">
                                <FileSignature className="w-8 h-8 text-white/30" />
                            </div>
                            <p className="text-white/50 mb-4">No hay contrato para este proyecto</p>
                            {!isClient && (
                                <button
                                    onClick={() => setShowContractModal(true)}
                                    className="btn-luxury"
                                >
                                    <FileSignature className="w-4 h-4" />
                                    Generar Contrato
                                </button>
                            )}
                        </div>
                    )}
                </div>
            )}

            {/* Files Tab */}
            {activeTab === 'files' && (
                <div className="card-luxury p-8 animate-fade-in">
                    <h2 className="text-xl font-bold text-white mb-6">Archivos del Proyecto</h2>

                    {/* Upload Zone */}
                    <div
                        {...getRootProps()}
                        className={`border-2 border-dashed rounded-2xl p-10 text-center transition-all cursor-pointer
                            ${isDragActive
                                ? 'border-cyan-500 bg-cyan-500/10'
                                : 'border-white/10 hover:border-cyan-500/50 hover:bg-white/[0.02]'}`}
                    >
                        <input {...getInputProps()} />
                        {uploadingFile ? (
                            <div className="flex flex-col items-center">
                                <Loader2 className="w-10 h-10 text-cyan-400 animate-spin mb-3" />
                                <p className="text-white/60">Subiendo archivo...</p>
                            </div>
                        ) : (
                            <>
                                <Upload className="w-10 h-10 text-white/30 mx-auto mb-3" />
                                <p className="text-white/60">
                                    {isDragActive ? 'Suelta los archivos aquí' : 'Arrastra archivos aquí o haz clic para seleccionar'}
                                </p>
                                <p className="text-sm text-white/30 mt-1">Máximo 10MB por archivo</p>
                            </>
                        )}
                    </div>

                    {/* Files List */}
                    {project.files?.length > 0 && (
                        <div className="mt-8 space-y-3">
                            {project.files.map((file: any) => {
                                const isImage = file.mimeType.startsWith('image/');
                                return (
                                    <div
                                        key={file.id}
                                        className="flex items-center justify-between p-4 rounded-xl border border-white/5 bg-white/[0.02] hover:border-cyan-500/30 transition-colors"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
                                                {isImage ? <Image className="w-5 h-5 text-cyan-400" /> : <File className="w-5 h-5 text-cyan-400" />}
                                            </div>
                                            <div>
                                                <p className="font-medium text-white text-sm">{file.name}</p>
                                                <p className="text-xs text-white/40">
                                                    {formatFileSize(file.size)} • {formatDate(file.uploadedAt)}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <a
                                                href={`${window.location.hostname === 'localhost' ? 'http://localhost:3001' : 'https://brieflow.onrender.com'}${file.url}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="p-2.5 rounded-lg text-white/50 hover:text-cyan-400 hover:bg-cyan-500/10 transition-colors"
                                            >
                                                <Download className="w-5 h-5" />
                                            </a>
                                            <button
                                                onClick={() => handleDeleteFile(file.id)}
                                                className="p-2.5 rounded-lg text-white/50 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                                            >
                                                <Trash2 className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            )}

            {/* Contract Generator Modal */}
            <ContractGenerator
                project={project}
                isOpen={showContractModal}
                onClose={() => setShowContractModal(false)}
                onGenerated={() => loadProject()}
            />
        </div>
    );
}
