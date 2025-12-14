import { useState, useEffect } from 'react';
import {
    Bell,
    BellOff,
    Smartphone,
    Monitor,
    CheckCircle2,
    AlertTriangle,
    Loader2,
    Zap,
    Shield,
    Wifi,
    Send
} from 'lucide-react';
import { usePushNotifications } from '@/hooks/usePushNotifications';

export function NotificationSettings() {
    const { subscribe, sendTestNotification, permission, isSubscribed } = usePushNotifications();
    const [loading, setLoading] = useState(false);
    const [testSent, setTestSent] = useState(false);
    const [isIOS, setIsIOS] = useState(false);
    const [isPWA, setIsPWA] = useState(false);
    const [animateSuccess, setAnimateSuccess] = useState(false);

    useEffect(() => {
        const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
        setIsIOS(iOS);
        const isStandalone = window.matchMedia('(display-mode: standalone)').matches ||
            (window.navigator as any).standalone === true;
        setIsPWA(isStandalone);
    }, []);

    const handleSubscribe = async () => {
        setLoading(true);
        try {
            await subscribe();
            setAnimateSuccess(true);
            setTimeout(() => setAnimateSuccess(false), 2000);
        } finally {
            setLoading(false);
        }
    };

    const handleTest = async () => {
        setLoading(true);
        try {
            await sendTestNotification();
            setTestSent(true);
            setTimeout(() => setTestSent(false), 4000);
        } finally {
            setLoading(false);
        }
    };

    const isActive = permission === 'granted' && isSubscribed;
    const isBlocked = permission === 'denied';

    return (
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 border border-gray-700/50 shadow-2xl">
            {/* Decorative background elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-24 -right-24 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl" />
                <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-purple-500/10 rounded-full blur-3xl" />
                {isActive && (
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl animate-pulse" />
                )}
            </div>

            <div className="relative p-6">
                {/* Header */}
                <div className="flex items-start justify-between mb-8">
                    <div className="flex items-center gap-4">
                        <div className={`relative p-4 rounded-2xl transition-all duration-500 ${isActive
                                ? 'bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg shadow-emerald-500/25'
                                : isBlocked
                                    ? 'bg-gradient-to-br from-red-500 to-rose-600 shadow-lg shadow-red-500/25'
                                    : 'bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg shadow-indigo-500/25'
                            }`}>
                            {isActive ? (
                                <Bell className="w-7 h-7 text-white" />
                            ) : isBlocked ? (
                                <BellOff className="w-7 h-7 text-white" />
                            ) : (
                                <Bell className="w-7 h-7 text-white" />
                            )}
                            {isActive && (
                                <span className="absolute -top-1 -right-1 flex h-4 w-4">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                                    <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-500 border-2 border-gray-900" />
                                </span>
                            )}
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-white tracking-tight">
                                Notificaciones Push
                            </h3>
                            <div className="flex items-center gap-2 mt-1">
                                <span className={`inline-flex items-center gap-1.5 text-sm font-medium ${isActive ? 'text-emerald-400' : isBlocked ? 'text-red-400' : 'text-gray-400'
                                    }`}>
                                    <span className={`w-2 h-2 rounded-full ${isActive ? 'bg-emerald-400' : isBlocked ? 'bg-red-400' : 'bg-gray-500'
                                        }`} />
                                    {isActive ? 'Activas' : isBlocked ? 'Bloqueadas' : 'Inactivas'}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Status Cards */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className={`group relative p-4 rounded-xl border transition-all duration-300 ${!isIOS && isActive
                            ? 'bg-emerald-500/10 border-emerald-500/30 hover:bg-emerald-500/15'
                            : 'bg-gray-800/50 border-gray-700/50 hover:bg-gray-800/70'
                        }`}>
                        <div className="flex items-center gap-3">
                            <div className={`p-2.5 rounded-lg ${!isIOS && isActive ? 'bg-emerald-500/20' : 'bg-gray-700/50'
                                }`}>
                                <Monitor className={`w-5 h-5 ${!isIOS && isActive ? 'text-emerald-400' : 'text-gray-400'
                                    }`} />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold text-white">Escritorio</p>
                                <p className={`text-xs ${!isIOS && isActive ? 'text-emerald-400/80' : 'text-gray-500'
                                    }`}>
                                    {!isIOS && isActive ? 'Conectado' : 'Sin conectar'}
                                </p>
                            </div>
                            {!isIOS && isActive && (
                                <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                            )}
                        </div>
                    </div>

                    <div className={`group relative p-4 rounded-xl border transition-all duration-300 ${((isIOS && isPWA) || !isIOS) && isActive
                            ? 'bg-emerald-500/10 border-emerald-500/30 hover:bg-emerald-500/15'
                            : 'bg-gray-800/50 border-gray-700/50 hover:bg-gray-800/70'
                        }`}>
                        <div className="flex items-center gap-3">
                            <div className={`p-2.5 rounded-lg ${((isIOS && isPWA) || !isIOS) && isActive ? 'bg-emerald-500/20' : 'bg-gray-700/50'
                                }`}>
                                <Smartphone className={`w-5 h-5 ${((isIOS && isPWA) || !isIOS) && isActive ? 'text-emerald-400' : 'text-gray-400'
                                    }`} />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold text-white">Móvil</p>
                                <p className={`text-xs ${((isIOS && isPWA) || !isIOS) && isActive ? 'text-emerald-400/80' : 'text-gray-500'
                                    }`}>
                                    {((isIOS && isPWA) || !isIOS) && isActive ? 'Conectado' : 'Sin conectar'}
                                </p>
                            </div>
                            {((isIOS && isPWA) || !isIOS) && isActive && (
                                <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                            )}
                        </div>
                    </div>
                </div>

                {/* iOS Warning */}
                {isIOS && !isPWA && (
                    <div className="mb-6 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20">
                        <div className="flex gap-3">
                            <div className="p-2 rounded-lg bg-amber-500/20 h-fit">
                                <AlertTriangle className="w-4 h-4 text-amber-400" />
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-amber-300">Instala la app</p>
                                <p className="text-xs text-amber-400/70 mt-1 leading-relaxed">
                                    Para notificaciones en iPhone: Toca <strong>Compartir</strong> → <strong>Agregar a inicio</strong>
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Blocked Warning */}
                {isBlocked && (
                    <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20">
                        <div className="flex gap-3">
                            <div className="p-2 rounded-lg bg-red-500/20 h-fit">
                                <Shield className="w-4 h-4 text-red-400" />
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-red-300">Permisos bloqueados</p>
                                <p className="text-xs text-red-400/70 mt-1 leading-relaxed">
                                    Habilita las notificaciones en la configuración de tu navegador.
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Features list when not active */}
                {!isActive && !isBlocked && (
                    <div className="mb-6 space-y-3">
                        <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">Recibirás alertas de:</p>
                        <div className="grid grid-cols-1 gap-2">
                            {[
                                { icon: <Zap className="w-4 h-4" />, text: 'Nuevos mensajes' },
                                { icon: <Wifi className="w-4 h-4" />, text: 'Actualizaciones de proyectos' },
                                { icon: <Bell className="w-4 h-4" />, text: 'Briefs completados' },
                            ].map((item, i) => (
                                <div key={i} className="flex items-center gap-3 p-2.5 rounded-lg bg-gray-800/30 border border-gray-700/30">
                                    <span className="text-indigo-400">{item.icon}</span>
                                    <span className="text-sm text-gray-300">{item.text}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Action Buttons */}
                <div className="space-y-3">
                    {!isActive && !isBlocked && (
                        <button
                            onClick={handleSubscribe}
                            disabled={loading}
                            className={`relative w-full group overflow-hidden rounded-xl font-semibold text-white transition-all duration-300 ${animateSuccess
                                    ? 'bg-emerald-500'
                                    : 'bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500 bg-[length:200%_auto] hover:bg-right'
                                }`}
                        >
                            <div className="relative flex items-center justify-center gap-3 px-6 py-4">
                                {loading ? (
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                ) : animateSuccess ? (
                                    <>
                                        <CheckCircle2 className="w-5 h-5" />
                                        <span>¡Activadas!</span>
                                    </>
                                ) : (
                                    <>
                                        <Bell className="w-5 h-5" />
                                        <span>Activar Notificaciones</span>
                                    </>
                                )}
                            </div>
                            {!loading && !animateSuccess && (
                                <div className="absolute inset-0 -translate-x-full group-hover:translate-x-0 bg-gradient-to-r from-transparent via-white/10 to-transparent transition-transform duration-500" />
                            )}
                        </button>
                    )}

                    {isActive && (
                        <button
                            onClick={handleTest}
                            disabled={loading}
                            className={`relative w-full overflow-hidden rounded-xl font-semibold transition-all duration-300 ${testSent
                                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                    : 'bg-gray-800 hover:bg-gray-700 text-white border border-gray-700'
                                }`}
                        >
                            <div className="relative flex items-center justify-center gap-3 px-6 py-4">
                                {loading ? (
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                ) : testSent ? (
                                    <>
                                        <CheckCircle2 className="w-5 h-5" />
                                        <span>¡Notificación enviada!</span>
                                    </>
                                ) : (
                                    <>
                                        <Send className="w-5 h-5" />
                                        <span>Enviar Prueba</span>
                                    </>
                                )}
                            </div>
                        </button>
                    )}
                </div>

                {/* Footer info */}
                <div className="mt-6 pt-4 border-t border-gray-700/50">
                    <p className="text-center text-xs text-gray-500">
                        {isActive
                            ? 'Las notificaciones llegarán aunque la app esté cerrada'
                            : 'Mantente informado en tiempo real'
                        }
                    </p>
                </div>
            </div>
        </div>
    );
}
