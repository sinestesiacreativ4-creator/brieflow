import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { projectsApi, briefsApi, filesApi } from '@/lib/api';
import { useAuthStore } from '@/lib/auth';
import { useSocket } from '@/hooks/useSocket';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { StatusBadge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
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
} from 'lucide-react';
import { Layout } from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import { getWorkflowForType } from '@/lib/workflow';

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
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Real-time chat & status
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

    // Sync initial messages with realtime
    useEffect(() => {
        if (project?.messages) {
            setRealtimeMessages(project.messages);
        }
    }, [project?.messages]);

    const loadProject = async () => {
        try {
            const response = await projectsApi.getOne(id!);
            setProject(response.data);
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

    if (loading) {
        return (
            <div className="space-y-6 animate-pulse">
                <div className="h-8 bg-gray-200 rounded w-1/3" />
                <div className="h-64 bg-gray-200 rounded-2xl" />
            </div>
        );
    }

    if (!project) return null;

    const isClient = user?.role === 'CLIENT';
    const briefCompleted = project.brief?.completedAt != null;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                <div>
                    <Button variant="ghost" onClick={() => navigate('/projects')} className="mb-2">
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Volver
                    </Button>
                    <h1 className="text-2xl font-bold text-gray-900">{project.name}</h1>
                    <div className="flex items-center gap-3 mt-2 text-sm text-gray-500">
                        <span>{project.client?.name}</span>
                        <span>•</span>
                        <span>{getProjectTypeLabel(project.type)}</span>
                        <span>•</span>
                        <StatusBadge status={project.status} />
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList>
                    <TabsTrigger value="workflow">
                        <Layout className="w-4 h-4 mr-2" />
                        Workflow
                    </TabsTrigger>
                    <TabsTrigger value="brief">
                        <FileText className="w-4 h-4 mr-2" />
                        Brief
                    </TabsTrigger>
                    <TabsTrigger value="chat">
                        <MessageSquare className="w-4 h-4 mr-2" />
                        Chat
                        {project.messages?.length > 0 && (
                            <span className="ml-2 bg-indigo-100 text-indigo-600 text-xs px-2 py-0.5 rounded-full">
                                {project.messages.length}
                            </span>
                        )}
                    </TabsTrigger>
                    <TabsTrigger value="files">
                        <Upload className="w-4 h-4 mr-2" />
                        Archivos
                        {project.files?.length > 0 && (
                            <span className="ml-2 bg-indigo-100 text-indigo-600 text-xs px-2 py-0.5 rounded-full">
                                {project.files.length}
                            </span>
                        )}
                    </TabsTrigger>
                </TabsList>

                {/* Workflow Tab (NEW) */}
                <TabsContent value="workflow">
                    <Card>
                        <CardHeader>
                            <CardTitle>Flujo de Trabajo: {getProjectTypeLabel(project.type)}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="relative py-8 px-4">
                                {/* Progress Bar Background */}
                                <div className="absolute top-1/2 left-0 w-full h-1 bg-gray-100 -translate-y-1/2 rounded-full" />

                                {/* Active Progress */}
                                <div
                                    className="absolute top-1/2 left-0 h-1 bg-blue-600 -translate-y-1/2 rounded-full transition-all duration-500"
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
                                                    className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 z-10 ${isActive
                                                            ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-500/30 scale-110'
                                                            : 'bg-white border-gray-300 text-gray-400 hover:border-blue-400'
                                                        } ${!isClient && 'cursor-pointer hover:scale-105'}`}
                                                    title={isClient ? 'Solo la agencia puede cambiar el estado' : 'Click para cambiar estado'}
                                                >
                                                    {isActive ? <CheckCircle2 className="w-5 h-5" /> : <div className="w-3 h-3 rounded-full bg-gray-300" />}
                                                </button>

                                                <div className={`absolute top-14 text-xs font-semibold px-2 py-1 rounded transition-colors whitespace-nowrap ${isCurrent ? 'bg-blue-100 text-blue-700' : 'text-gray-500'
                                                    }`}>
                                                    {step.label}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            <div className="mt-20 bg-gray-50 rounded-xl p-6 border border-gray-100 flex items-start gap-4">
                                <div className="p-3 bg-blue-100 rounded-lg">
                                    <Layout className="w-6 h-6 text-blue-600" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-gray-900 mb-1">Estado Actual: {workflowSteps[currentStepIndex]?.label}</h3>
                                    <p className="text-sm text-gray-500">
                                        {isClient
                                            ? 'Tu agencia actualizará el estado a medida que avance el proyecto.'
                                            : 'Haz clic en los círculos de arriba para avanzar o retroceder el estado del proyecto. El cliente será notificado automáticamente.'}
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Brief Tab */}
                <TabsContent value="brief">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle>Brief del Proyecto</CardTitle>
                                {briefCompleted && (
                                    <p className="text-sm text-gray-500 mt-1">
                                        Completado el {formatDate(project.brief.completedAt)}
                                    </p>
                                )}
                            </div>
                            {!isClient && briefCompleted && project.status === 'BRIEF_IN_REVIEW' && (
                                <div className="flex gap-2">
                                    <Button variant="outline" onClick={handleRequestChanges}>
                                        <XCircle className="w-4 h-4 mr-2" />
                                        Solicitar cambios
                                    </Button>
                                    <Button onClick={handleApproveBrief} loading={approvingBrief}>
                                        <CheckCircle2 className="w-4 h-4 mr-2" />
                                        Aprobar Brief
                                    </Button>
                                </div>
                            )}
                        </CardHeader>
                        <CardContent>
                            {!briefCompleted ? (
                                <div className="text-center py-12">
                                    <div className="w-16 h-16 rounded-2xl bg-amber-100 flex items-center justify-center mx-auto mb-4">
                                        <Clock className="w-8 h-8 text-amber-600" />
                                    </div>
                                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                        Esperando Brief del Cliente
                                    </h3>
                                    <p className="text-gray-500 max-w-md mx-auto">
                                        El cliente aún no ha completado el brief. Recibirás una notificación cuando lo haga.
                                    </p>
                                    {isClient && (
                                        <Button
                                            className="mt-6"
                                            onClick={() => navigate(`/client/brief/${project.id}`)}
                                        >
                                            Completar Brief
                                        </Button>
                                    )}
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    {project.brief.projectGoals && (
                                        <div>
                                            <h4 className="text-sm font-medium text-gray-500 mb-2">Objetivos del Proyecto</h4>
                                            <p className="text-gray-900 whitespace-pre-wrap">{project.brief.projectGoals}</p>
                                        </div>
                                    )}
                                    {project.brief.targetAudience && (
                                        <div>
                                            <h4 className="text-sm font-medium text-gray-500 mb-2">Público Objetivo</h4>
                                            <p className="text-gray-900 whitespace-pre-wrap">{project.brief.targetAudience}</p>
                                        </div>
                                    )}
                                    {project.brief.keyMessage && (
                                        <div>
                                            <h4 className="text-sm font-medium text-gray-500 mb-2">Mensaje Clave</h4>
                                            <p className="text-gray-900 whitespace-pre-wrap">{project.brief.keyMessage}</p>
                                        </div>
                                    )}
                                    {project.brief.communicationTone && (
                                        <div>
                                            <h4 className="text-sm font-medium text-gray-500 mb-2">Tono de Comunicación</h4>
                                            <p className="text-gray-900">{project.brief.communicationTone}</p>
                                        </div>
                                    )}
                                    {project.brief.competitors && (
                                        <div>
                                            <h4 className="text-sm font-medium text-gray-500 mb-2">Competidores/Referencias</h4>
                                            <p className="text-gray-900 whitespace-pre-wrap">{project.brief.competitors}</p>
                                        </div>
                                    )}
                                    {project.brief.budget && (
                                        <div>
                                            <h4 className="text-sm font-medium text-gray-500 mb-2">Presupuesto</h4>
                                            <p className="text-gray-900">{project.brief.budget}</p>
                                        </div>
                                    )}
                                    {project.brief.timeline && (
                                        <div>
                                            <h4 className="text-sm font-medium text-gray-500 mb-2">Timeline</h4>
                                            <p className="text-gray-900">{project.brief.timeline}</p>
                                        </div>
                                    )}
                                    {project.brief.deliverables && (
                                        <div>
                                            <h4 className="text-sm font-medium text-gray-500 mb-2">Entregables</h4>
                                            <p className="text-gray-900 whitespace-pre-wrap">{project.brief.deliverables}</p>
                                        </div>
                                    )}
                                    {project.brief.additionalNotes && (
                                        <div>
                                            <h4 className="text-sm font-medium text-gray-500 mb-2">Notas Adicionales</h4>
                                            <p className="text-gray-900 whitespace-pre-wrap">{project.brief.additionalNotes}</p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Chat Tab */}
                <TabsContent value="chat">
                    <Card className="h-[600px] flex flex-col">
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle>Chat del Proyecto</CardTitle>
                            <div className="flex items-center gap-2">
                                <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-gray-300'}`} />
                                <span className="text-xs text-gray-500">
                                    {isConnected ? 'En línea' : 'Conectando...'}
                                </span>
                            </div>
                        </CardHeader>
                        <CardContent className="flex-1 flex flex-col overflow-hidden">
                            {/* Messages */}
                            <div className="flex-1 overflow-y-auto space-y-4 mb-4 scrollbar-hide">
                                {realtimeMessages.length === 0 ? (
                                    <div className="text-center py-12 text-gray-500">
                                        No hay mensajes aún. ¡Inicia la conversación!
                                    </div>
                                ) : (
                                    realtimeMessages.map((msg: any) => {
                                        const isOwn = msg.senderId === user?.id;
                                        return (
                                            <div
                                                key={msg.id}
                                                className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                                            >
                                                <div
                                                    className={`max-w-[70%] rounded-2xl px-4 py-3 ${isOwn
                                                        ? 'bg-indigo-600 text-white rounded-br-md'
                                                        : 'bg-gray-100 text-gray-900 rounded-bl-md'
                                                        }`}
                                                >
                                                    {!isOwn && (
                                                        <p className="text-xs font-medium mb-1 opacity-70">
                                                            {msg.sender?.name}
                                                        </p>
                                                    )}
                                                    <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                                                    <p className={`text-xs mt-1 ${isOwn ? 'text-indigo-200' : 'text-gray-400'}`}>
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
                                <div className="flex items-center gap-2 mb-2 text-sm text-gray-500">
                                    <div className="flex gap-1">
                                        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                                    </div>
                                    <span>{typingUsers.map(u => u.userName).join(', ')} está escribiendo...</span>
                                </div>
                            )}

                            {/* Message Input */}
                            <div className="flex gap-2">
                                <Textarea
                                    value={message}
                                    onChange={(e) => {
                                        setMessage(e.target.value);
                                        setTyping(e.target.value.length > 0);
                                    }}
                                    onBlur={() => setTyping(false)}
                                    placeholder="Escribe un mensaje..."
                                    className="min-h-[60px] resize-none"
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
                                <Button
                                    disabled={!message.trim() || !isConnected}
                                    onClick={() => {
                                        if (message.trim() && isConnected) {
                                            sendSocketMessage(message.trim());
                                            setMessage('');
                                            setTyping(false);
                                        }
                                    }}
                                >
                                    <Send className="w-4 h-4" />
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Files Tab */}
                <TabsContent value="files">
                    <Card>
                        <CardHeader>
                            <CardTitle>Archivos del Proyecto</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {/* Upload Zone */}
                            <div
                                {...getRootProps()}
                                className={`border-2 border-dashed rounded-xl p-8 text-center transition-all cursor-pointer ${isDragActive
                                    ? 'border-indigo-500 bg-indigo-50'
                                    : 'border-gray-200 hover:border-indigo-300 hover:bg-gray-50'
                                    }`}
                            >
                                <input {...getInputProps()} />
                                {uploadingFile ? (
                                    <div className="flex flex-col items-center">
                                        <Loader2 className="w-8 h-8 text-indigo-600 animate-spin mb-3" />
                                        <p className="text-gray-600">Subiendo archivo...</p>
                                    </div>
                                ) : (
                                    <>
                                        <Upload className="w-8 h-8 text-gray-400 mx-auto mb-3" />
                                        <p className="text-gray-600">
                                            {isDragActive
                                                ? 'Suelta los archivos aquí'
                                                : 'Arrastra archivos aquí o haz clic para seleccionar'}
                                        </p>
                                        <p className="text-sm text-gray-400 mt-1">Máximo 10MB por archivo</p>
                                    </>
                                )}
                            </div>

                            {/* Files List */}
                            {project.files?.length > 0 && (
                                <div className="mt-6 space-y-3">
                                    {project.files.map((file: any) => {
                                        const isImage = file.mimeType.startsWith('image/');
                                        return (
                                            <div
                                                key={file.id}
                                                className="flex items-center justify-between p-4 rounded-xl border border-gray-100 hover:border-gray-200 transition-colors"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
                                                        {isImage ? (
                                                            <Image className="w-5 h-5 text-gray-500" />
                                                        ) : (
                                                            <File className="w-5 h-5 text-gray-500" />
                                                        )}
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-gray-900 text-sm">{file.name}</p>
                                                        <p className="text-xs text-gray-500">
                                                            {formatFileSize(file.size)} • {formatDate(file.uploadedAt)}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <a
                                                        href={`http://localhost:3001${file.url}`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                    >
                                                        <Button variant="ghost" size="icon">
                                                            <Download className="w-4 h-4" />
                                                        </Button>
                                                    </a>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => handleDeleteFile(file.id)}
                                                    >
                                                        <Trash2 className="w-4 h-4 text-red-500" />
                                                    </Button>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
