import { useState, useRef, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { FileText, Pen, Check, Loader2, AlertCircle } from 'lucide-react';
import { contractsApi } from '@/lib/api';
import { Button } from '@/components/ui/button';

export default function SignContractPage() {
    const { contractId } = useParams<{ contractId: string }>();
    const [contract, setContract] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [signing, setSigning] = useState(false);
    const [signed, setSigned] = useState(false);
    const [error, setError] = useState('');
    const [clientSignature, setClientSignature] = useState<string | null>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [isDrawing, setIsDrawing] = useState(false);

    useEffect(() => {
        if (contractId) loadContract();
    }, [contractId]);

    const loadContract = async () => {
        try {
            // Use public endpoint (no auth required)
            const response = await contractsApi.getPublic(contractId!);
            setContract(response.data);
            if (response.data.status === 'SIGNED') {
                setSigned(true);
            }
        } catch (err: any) {
            setError(err.response?.data?.error || 'Contrato no encontrado');
        } finally {
            setLoading(false);
        }
    };

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
            setClientSignature(canvas.toDataURL());
        }
    };

    const clearSignature = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        setClientSignature(null);
    };

    // Touch events for mobile
    const startDrawingTouch = (e: React.TouchEvent<HTMLCanvasElement>) => {
        e.preventDefault();
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        setIsDrawing(true);
        const rect = canvas.getBoundingClientRect();
        const touch = e.touches[0];
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
        ctx.beginPath();
        ctx.moveTo((touch.clientX - rect.left) * scaleX, (touch.clientY - rect.top) * scaleY);
    };

    const drawTouch = (e: React.TouchEvent<HTMLCanvasElement>) => {
        e.preventDefault();
        if (!isDrawing) return;
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        const rect = canvas.getBoundingClientRect();
        const touch = e.touches[0];
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
        ctx.lineTo((touch.clientX - rect.left) * scaleX, (touch.clientY - rect.top) * scaleY);
        ctx.strokeStyle = '#00d4ff';
        ctx.lineWidth = 3;
        ctx.lineCap = 'round';
        ctx.stroke();
    };

    const signContract = async () => {
        if (!clientSignature || !contractId) return;
        setSigning(true);
        try {
            await contractsApi.signPublic(contractId, clientSignature);
            setSigned(true);
        } catch (err: any) {
            setError(err.response?.data?.error || 'Error al firmar');
        } finally {
            setSigning(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#050507] flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-cyan-500/20 border-t-cyan-500 rounded-full animate-spin" />
                    <p className="text-white/50">Cargando contrato...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-[#050507] flex items-center justify-center p-4">
                <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-8 max-w-md w-full text-center">
                    <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-4">
                        <AlertCircle className="w-8 h-8 text-red-500" />
                    </div>
                    <h2 className="text-xl font-bold text-white mb-2">Error al cargar contrato</h2>
                    <p className="text-white/60 mb-6">{error}</p>
                    <p className="text-white/30 text-xs">
                        Si acabas de generar el contrato, espera unos minutos a que el sistema se actualice.
                    </p>
                    <Button onClick={() => window.location.reload()} className="mt-4 bg-white/10 hover:bg-white/20">
                        Reintentar
                    </Button>
                </div>
            </div>
        );
    }



    if (signed) {
        return (
            <div className="min-h-screen bg-[#050507] flex items-center justify-center p-4">
                <div className="bg-gray-900 border border-green-500/30 rounded-2xl p-8 max-w-md text-center">
                    <div className="w-20 h-20 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-6">
                        <Check className="w-10 h-10 text-green-400" />
                    </div>
                    <h1 className="text-2xl font-bold text-white mb-2">¡Contrato Firmado!</h1>
                    <p className="text-white/50 mb-6">El contrato ha sido firmado exitosamente. Ya puedes cerrar esta página.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#050507] p-4 md:p-8">
            <div className="max-w-2xl mx-auto">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 flex items-center justify-center mx-auto mb-4">
                        <FileText className="w-8 h-8 text-cyan-400" />
                    </div>
                    <h1 className="text-2xl font-bold text-white">Firma de Contrato</h1>
                    <p className="text-white/50 mt-2">Por favor revisa y firma el siguiente contrato</p>
                </div>

                {/* Contract Details Card */}
                <div className="bg-gray-900/50 border border-white/10 rounded-2xl p-6 mb-6">
                    <h2 className="text-lg font-semibold text-white mb-4">Detalles del Contrato</h2>

                    <div className="space-y-4 text-sm">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <span className="text-white/50">Cliente:</span>
                                <p className="text-white font-medium">{contract?.clientName}</p>
                            </div>
                            <div>
                                <span className="text-white/50">Empresa:</span>
                                <p className="text-white font-medium">{contract?.clientCompany || 'N/A'}</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <span className="text-white/50">Proyecto:</span>
                                <p className="text-white font-medium">{contract?.projectName}</p>
                            </div>
                            <div>
                                <span className="text-white/50">Tipo:</span>
                                <p className="text-white font-medium">{contract?.projectType?.replace(/_/g, ' ')}</p>
                            </div>
                        </div>

                        <div>
                            <span className="text-white/50">Entregables:</span>
                            <p className="text-white">{contract?.deliverables || 'Por definir'}</p>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <span className="text-white/50">Presupuesto:</span>
                                <p className="text-cyan-400 font-semibold">{contract?.budget || 'Por definir'}</p>
                            </div>
                            <div>
                                <span className="text-white/50">Timeline:</span>
                                <p className="text-white">{contract?.timeline || 'Por definir'}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Terms and Conditions - More prominent */}
                {contract?.terms && (
                    <div className="bg-gray-900/50 border border-cyan-500/20 rounded-2xl p-4 sm:p-6 mb-6">
                        <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                            <FileText className="w-5 h-5 text-cyan-400" />
                            Términos y Condiciones
                        </h2>
                        <div className="bg-gray-800/50 rounded-xl p-4 mb-4 max-h-[40vh] overflow-y-auto text-white/70 text-sm whitespace-pre-wrap leading-relaxed">
                            {contract.terms}
                        </div>
                        <p className="text-xs text-cyan-400/70 text-center">
                            👆 Desplázate para leer todos los términos
                        </p>
                    </div>
                )}

                {/* Agency Signature Preview */}
                {contract?.agencySignature && (
                    <div className="bg-gray-900/50 border border-white/10 rounded-2xl p-6 mb-6">
                        <h2 className="text-lg font-semibold text-white mb-4">Firma de la Agencia</h2>
                        <img src={contract.agencySignature} alt="Firma Agencia" className="h-20 object-contain" />
                    </div>
                )}

                {/* Client Signature Area */}
                <div className="bg-gray-900/50 border border-white/10 rounded-2xl p-6 mb-6">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                            <Pen className="w-5 h-5 text-cyan-400" />
                            Tu Firma
                        </h2>
                        {clientSignature && (
                            <button onClick={clearSignature} className="text-sm text-red-400 hover:text-red-300">
                                Limpiar
                            </button>
                        )}
                    </div>

                    <canvas
                        ref={canvasRef}
                        width={500}
                        height={150}
                        className="bg-gray-800 rounded-lg border-2 border-dashed border-cyan-500/30 cursor-crosshair w-full touch-none"
                        onMouseDown={startDrawing}
                        onMouseMove={draw}
                        onMouseUp={stopDrawing}
                        onMouseLeave={stopDrawing}
                        onTouchStart={startDrawingTouch}
                        onTouchMove={drawTouch}
                        onTouchEnd={stopDrawing}
                    />
                    <p className="text-xs text-white/40 mt-2">Dibuja tu firma con el dedo o mouse</p>
                </div>

                {/* Sign Button */}
                <Button
                    onClick={signContract}
                    disabled={!clientSignature || signing}
                    className="w-full bg-cyan-500 hover:bg-cyan-600 text-black py-6 text-lg"
                >
                    {signing ? (
                        <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Firmando...</>
                    ) : (
                        <><Check className="w-5 h-5 mr-2" /> Firmar Contrato</>
                    )}
                </Button>

                <p className="text-center text-white/30 text-xs mt-4">
                    Al firmar, aceptas los términos y condiciones del contrato.
                </p>
            </div>
        </div>
    );
}
