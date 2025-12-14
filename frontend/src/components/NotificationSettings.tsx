import { useState, useEffect } from 'react';
import { Bell, BellOff, Smartphone, Monitor, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { usePushNotifications } from '@/hooks/usePushNotifications';

export function NotificationSettings() {
    const { subscribe, sendTestNotification, permission, isSubscribed } = usePushNotifications();
    const [loading, setLoading] = useState(false);
    const [testSent, setTestSent] = useState(false);
    const [isIOS, setIsIOS] = useState(false);
    const [isPWA, setIsPWA] = useState(false);

    useEffect(() => {
        // Detect iOS
        const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
        setIsIOS(iOS);

        // Detect if running as PWA
        const isStandalone = window.matchMedia('(display-mode: standalone)').matches ||
            (window.navigator as any).standalone === true;
        setIsPWA(isStandalone);
    }, []);

    const handleSubscribe = async () => {
        setLoading(true);
        try {
            await subscribe();
        } finally {
            setLoading(false);
        }
    };

    const handleTest = async () => {
        setLoading(true);
        try {
            await sendTestNotification();
            setTestSent(true);
            setTimeout(() => setTestSent(false), 3000);
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = () => {
        if (permission === 'granted' && isSubscribed) return 'text-green-500';
        if (permission === 'denied') return 'text-red-500';
        return 'text-yellow-500';
    };

    const getStatusText = () => {
        if (permission === 'denied') return 'Bloqueadas por el navegador';
        if (permission === 'granted' && isSubscribed) return 'Activadas ✓';
        return 'No activadas';
    };

    return (
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700/50 p-6">
            <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl">
                    <Bell className="w-6 h-6 text-white" />
                </div>
                <div>
                    <h3 className="text-lg font-semibold text-white">Notificaciones Push</h3>
                    <p className={`text-sm ${getStatusColor()}`}>{getStatusText()}</p>
                </div>
            </div>

            {/* iOS Warning */}
            {isIOS && !isPWA && (
                <div className="mb-4 p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl">
                    <div className="flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-amber-400 mt-0.5 flex-shrink-0" />
                        <div>
                            <p className="text-amber-200 font-medium text-sm">Instala la app en tu iPhone</p>
                            <p className="text-amber-300/70 text-xs mt-1">
                                Para recibir notificaciones en iOS, toca el botón de compartir en Safari y selecciona "Agregar a pantalla de inicio".
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Permission Denied Warning */}
            {permission === 'denied' && (
                <div className="mb-4 p-4 bg-red-500/10 border border-red-500/30 rounded-xl">
                    <div className="flex items-start gap-3">
                        <BellOff className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" />
                        <div>
                            <p className="text-red-200 font-medium text-sm">Notificaciones bloqueadas</p>
                            <p className="text-red-300/70 text-xs mt-1">
                                Ve a la configuración de tu navegador y permite las notificaciones para este sitio.
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Device Info */}
            <div className="grid grid-cols-2 gap-3 mb-6">
                <div className="flex items-center gap-2 p-3 bg-slate-700/30 rounded-lg">
                    <Monitor className="w-4 h-4 text-slate-400" />
                    <span className="text-sm text-slate-300">PC/Mac</span>
                    {!isIOS && isSubscribed && <CheckCircle className="w-4 h-4 text-green-500 ml-auto" />}
                </div>
                <div className="flex items-center gap-2 p-3 bg-slate-700/30 rounded-lg">
                    <Smartphone className="w-4 h-4 text-slate-400" />
                    <span className="text-sm text-slate-300">Móvil</span>
                    {isIOS && isPWA && isSubscribed && <CheckCircle className="w-4 h-4 text-green-500 ml-auto" />}
                    {!isIOS && isSubscribed && <CheckCircle className="w-4 h-4 text-green-500 ml-auto" />}
                </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-3">
                {(!isSubscribed || permission !== 'granted') && permission !== 'denied' && (
                    <button
                        onClick={handleSubscribe}
                        disabled={loading}
                        className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-medium rounded-xl transition-all disabled:opacity-50"
                    >
                        {loading ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                            <>
                                <Bell className="w-5 h-5" />
                                Activar Notificaciones
                            </>
                        )}
                    </button>
                )}

                {isSubscribed && permission === 'granted' && (
                    <button
                        onClick={handleTest}
                        disabled={loading}
                        className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-slate-700 hover:bg-slate-600 text-white font-medium rounded-xl transition-all disabled:opacity-50"
                    >
                        {loading ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                        ) : testSent ? (
                            <>
                                <CheckCircle className="w-5 h-5 text-green-400" />
                                ¡Enviada! Revisa tus notificaciones
                            </>
                        ) : (
                            <>
                                <Bell className="w-5 h-5" />
                                Enviar Notificación de Prueba
                            </>
                        )}
                    </button>
                )}
            </div>

            {/* Info */}
            <p className="mt-4 text-xs text-slate-500 text-center">
                Recibirás notificaciones de nuevos mensajes, actualizaciones de proyectos y más.
            </p>
        </div>
    );
}
