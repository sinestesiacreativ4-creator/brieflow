import { useState, useRef, useEffect } from 'react';
import { X, FileText, Download, Send, Pen, Check, Loader2 } from 'lucide-react';
import { contractsApi } from '@/lib/api';
import { Button } from '@/components/ui/button';

interface ContractGeneratorProps {
    project: any;
    isOpen: boolean;
    onClose: () => void;
    onGenerated?: () => void;
}

export default function ContractGenerator({ project, isOpen, onClose, onGenerated }: ContractGeneratorProps) {
    const [step, setStep] = useState<'preview' | 'sign' | 'success'>('preview');
    const [loading, setLoading] = useState(false);
    const [contract, setContract] = useState<any>(null);
    const [agencySignature, setAgencySignature] = useState<string | null>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [isDrawing, setIsDrawing] = useState(false);

    useEffect(() => {
        if (isOpen && project) {
            checkExistingContract();
        }
    }, [isOpen, project]);

    const checkExistingContract = async () => {
        try {
            const response = await contractsApi.get(project.id);
            setContract(response.data);
        } catch {
            // No contract exists yet
            setContract(null);
        }
    };

    const generateContract = async () => {
        setLoading(true);
        try {
            const response = await contractsApi.generate(project.id, {
                agencySignature: agencySignature || undefined
            });
            setContract(response.data);
            setStep('success');
            onGenerated?.();
        } catch (error: any) {
            console.error('Error generating contract:', error);
            alert(error.response?.data?.error || 'Error al generar contrato');
        } finally {
            setLoading(false);
        }
    };

    // Canvas drawing functions
    const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        setIsDrawing(true);
        const rect = canvas.getBoundingClientRect();
        ctx.beginPath();
        ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
    };

    const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
        if (!isDrawing) return;
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const rect = canvas.getBoundingClientRect();
        ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
        ctx.strokeStyle = '#00d4ff';
        ctx.lineWidth = 2;
        ctx.lineCap = 'round';
        ctx.stroke();
    };

    const stopDrawing = () => {
        setIsDrawing(false);
        const canvas = canvasRef.current;
        if (canvas) {
            setAgencySignature(canvas.toDataURL());
        }
    };

    const clearSignature = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        setAgencySignature(null);
    };

    const downloadContract = () => {
        // Generate a simple HTML contract that can be printed/saved as PDF
        const contractHTML = `
<!DOCTYPE html>
<html>
<head>
    <title>Contrato - ${project.name}</title>
    <style>
        body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 40px; color: #333; }
        h1 { color: #0891b2; border-bottom: 2px solid #0891b2; padding-bottom: 10px; }
        h2 { color: #0891b2; margin-top: 30px; }
        .header { display: flex; justify-content: space-between; margin-bottom: 40px; }
        .section { margin-bottom: 20px; }
        .label { font-weight: bold; color: #666; }
        .value { margin-left: 10px; }
        .terms { background: #f5f5f5; padding: 20px; border-radius: 8px; white-space: pre-wrap; }
        .signatures { display: flex; justify-content: space-between; margin-top: 50px; }
        .signature-box { width: 45%; text-align: center; }
        .signature-line { border-top: 1px solid #333; margin-top: 60px; padding-top: 10px; }
        .signature-img { max-width: 200px; height: 80px; object-fit: contain; }
    </style>
</head>
<body>
    <h1>CONTRATO DE SERVICIOS CREATIVOS</h1>
    
    <div class="header">
        <div>
            <strong>Fecha:</strong> ${new Date().toLocaleDateString('es-ES')}
        </div>
        <div>
            <strong>Contrato #:</strong> ${contract?.id?.substring(0, 8).toUpperCase() || 'NUEVO'}
        </div>
    </div>

    <h2>1. PARTES</h2>
    <div class="section">
        <p><span class="label">Cliente:</span><span class="value">${project.client?.name || 'N/A'}</span></p>
        <p><span class="label">Empresa:</span><span class="value">${project.client?.company || 'N/A'}</span></p>
        <p><span class="label">Email:</span><span class="value">${project.client?.email || 'N/A'}</span></p>
    </div>

    <h2>2. PROYECTO</h2>
    <div class="section">
        <p><span class="label">Nombre:</span><span class="value">${project.name}</span></p>
        <p><span class="label">Tipo:</span><span class="value">${project.type?.replace(/_/g, ' ')}</span></p>
    </div>

    <h2>3. ENTREGABLES</h2>
    <div class="section">
        <p>${project.brief?.deliverables || 'Por definir'}</p>
    </div>

    <h2>4. PRESUPUESTO Y TIMELINE</h2>
    <div class="section">
        <p><span class="label">Presupuesto:</span><span class="value">${project.brief?.budget || 'Por definir'}</span></p>
        <p><span class="label">Timeline:</span><span class="value">${project.brief?.timeline || 'Por definir'}</span></p>
    </div>

    <h2>5. TÉRMINOS Y CONDICIONES</h2>
    <div class="terms">${contract?.terms || 'Pendiente de definir'}</div>

    <div class="signatures">
        <div class="signature-box">
            ${agencySignature ? `<img src="${agencySignature}" class="signature-img" />` : ''}
            <div class="signature-line">AGENCIA</div>
        </div>
        <div class="signature-box">
            ${contract?.clientSignature ? `<img src="${contract.clientSignature}" class="signature-img" />` : ''}
            <div class="signature-line">CLIENTE</div>
        </div>
    </div>
</body>
</html>`;

        const blob = new Blob([contractHTML], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Contrato-${project.name.replace(/\s+/g, '-')}.html`;
        a.click();
        URL.revokeObjectURL(url);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-gray-900 border border-white/10 rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-white/10">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-cyan-500/10 flex items-center justify-center">
                            <FileText className="w-5 h-5 text-cyan-400" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-white">Generar Contrato</h2>
                            <p className="text-sm text-white/50">{project.name}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="text-white/50 hover:text-white">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6">
                    {step === 'preview' && (
                        <div className="space-y-6">
                            {/* Contract Preview */}
                            <div className="bg-white/5 rounded-xl p-6 border border-white/10">
                                <h3 className="text-lg font-semibold text-white mb-4">Vista Previa del Contrato</h3>

                                <div className="space-y-4 text-sm">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <span className="text-white/50">Cliente:</span>
                                            <p className="text-white font-medium">{project.client?.name}</p>
                                        </div>
                                        <div>
                                            <span className="text-white/50">Empresa:</span>
                                            <p className="text-white font-medium">{project.client?.company || 'N/A'}</p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <span className="text-white/50">Proyecto:</span>
                                            <p className="text-white font-medium">{project.name}</p>
                                        </div>
                                        <div>
                                            <span className="text-white/50">Tipo:</span>
                                            <p className="text-white font-medium">{project.type?.replace(/_/g, ' ')}</p>
                                        </div>
                                    </div>

                                    <div>
                                        <span className="text-white/50">Entregables:</span>
                                        <p className="text-white">{project.brief?.deliverables || 'Por definir en el brief'}</p>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <span className="text-white/50">Presupuesto:</span>
                                            <p className="text-cyan-400 font-semibold">{project.brief?.budget || 'Por definir'}</p>
                                        </div>
                                        <div>
                                            <span className="text-white/50">Timeline:</span>
                                            <p className="text-white">{project.brief?.timeline || 'Por definir'}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Signature Area */}
                            <div className="bg-white/5 rounded-xl p-6 border border-white/10">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                                        <Pen className="w-5 h-5 text-cyan-400" />
                                        Tu Firma (Agencia)
                                    </h3>
                                    {agencySignature && (
                                        <button onClick={clearSignature} className="text-sm text-red-400 hover:text-red-300">
                                            Limpiar
                                        </button>
                                    )}
                                </div>

                                <canvas
                                    ref={canvasRef}
                                    width={500}
                                    height={150}
                                    className="bg-gray-800 rounded-lg border-2 border-dashed border-cyan-500/30 cursor-crosshair w-full"
                                    onMouseDown={startDrawing}
                                    onMouseMove={draw}
                                    onMouseUp={stopDrawing}
                                    onMouseLeave={stopDrawing}
                                />
                                <p className="text-xs text-white/40 mt-2">Dibuja tu firma con el mouse</p>
                            </div>
                        </div>
                    )}

                    {step === 'success' && (
                        <div className="text-center py-12">
                            <div className="w-20 h-20 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-6">
                                <Check className="w-10 h-10 text-green-400" />
                            </div>
                            <h3 className="text-2xl font-bold text-white mb-2">¡Contrato Generado!</h3>
                            <p className="text-white/50 mb-8">El contrato está listo para descargar o enviar al cliente.</p>

                            <div className="flex justify-center gap-4">
                                <Button onClick={downloadContract} className="bg-cyan-500 hover:bg-cyan-600 text-black">
                                    <Download className="w-4 h-4 mr-2" />
                                    Descargar
                                </Button>
                                <Button variant="outline" className="border-white/20 text-white hover:bg-white/5">
                                    <Send className="w-4 h-4 mr-2" />
                                    Enviar al Cliente
                                </Button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                {step === 'preview' && (
                    <div className="flex justify-between items-center p-6 border-t border-white/10">
                        <Button variant="ghost" onClick={onClose} className="text-white/50">
                            Cancelar
                        </Button>
                        <Button
                            onClick={generateContract}
                            disabled={loading}
                            className="bg-cyan-500 hover:bg-cyan-600 text-black"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Generando...
                                </>
                            ) : (
                                <>
                                    <FileText className="w-4 h-4 mr-2" />
                                    Generar Contrato
                                </>
                            )}
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
}
