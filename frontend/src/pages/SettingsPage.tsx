import { useState } from 'react';
import { useAuthStore } from '@/lib/auth';
import { NotificationSettings } from '@/components/NotificationSettings';
import {
    User,
    Bell,
    CreditCard,
    Save,
    Loader2,
} from 'lucide-react';

export default function SettingsPage() {
    const { user } = useAuthStore();
    const [activeTab, setActiveTab] = useState('profile');
    const [saving, setSaving] = useState(false);

    const tabs = [
        { id: 'profile', label: 'Perfil', icon: User },
        { id: 'notifications', label: 'Notificaciones', icon: Bell },
        { id: 'billing', label: 'Facturación', icon: CreditCard },
    ];

    const handleSave = async () => {
        setSaving(true);
        await new Promise(resolve => setTimeout(resolve, 1000));
        setSaving(false);
    };

    return (
        <div className="space-y-8">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-white">Configuración</h1>
                <p className="text-white/50 mt-2">Administra tu cuenta y preferencias</p>
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
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Profile Tab */}
            {activeTab === 'profile' && (
                <div className="card-luxury p-8 animate-fade-in">
                    <h2 className="text-xl font-bold text-white mb-6">Información del Perfil</h2>

                    <div className="flex items-center gap-6 mb-8 p-6 rounded-xl bg-white/[0.02] border border-white/5">
                        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-cyan-400 to-cyan-600 flex items-center justify-center text-gray-950 font-bold text-2xl shadow-xl shadow-cyan-500/30">
                            {user?.name?.charAt(0).toUpperCase()}
                        </div>
                        <div>
                            <h3 className="font-semibold text-white text-lg">{user?.name}</h3>
                            <p className="text-white/40">{user?.email}</p>
                            <p className="text-xs text-cyan-400 mt-1">
                                {user?.role === 'CLIENT' ? 'Cliente' : user?.role === 'AGENCY_ADMIN' ? 'Administrador' : 'Miembro'}
                            </p>
                        </div>
                    </div>

                    <div className="space-y-5">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div>
                                <label className="label">Nombre</label>
                                <input
                                    type="text"
                                    defaultValue={user?.name}
                                    className="input-luxury"
                                />
                            </div>
                            <div>
                                <label className="label">Email</label>
                                <input
                                    type="email"
                                    defaultValue={user?.email}
                                    className="input-luxury"
                                    disabled
                                />
                            </div>
                        </div>
                        <div>
                            <label className="label">Biografía</label>
                            <textarea
                                placeholder="Escribe algo sobre ti..."
                                rows={3}
                                className="input-luxury min-h-[100px] resize-none"
                            />
                        </div>
                    </div>

                    <div className="flex justify-end mt-8">
                        <button onClick={handleSave} disabled={saving} className="btn-luxury">
                            {saving ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Guardando...
                                </>
                            ) : (
                                <>
                                    <Save className="w-4 h-4" />
                                    Guardar cambios
                                </>
                            )}
                        </button>
                    </div>
                </div>
            )}

            {/* Notifications Tab */}
            {activeTab === 'notifications' && (
                <div className="space-y-6 animate-fade-in">
                    <NotificationSettings />

                    <div className="card-luxury p-8">
                        <h2 className="text-xl font-bold text-white mb-6">Preferencias de Email</h2>

                        <div className="space-y-4">
                            {[
                                { label: 'Nuevos proyectos', desc: 'Cuando se te asigne un nuevo proyecto' },
                                { label: 'Actualizaciones de brief', desc: 'Cuando un cliente complete o modifique un brief' },
                                { label: 'Mensajes del chat', desc: 'Cuando recibas un nuevo mensaje' },
                                { label: 'Resumen semanal', desc: 'Resumen de actividad cada lunes' },
                            ].map((item, i) => (
                                <div key={i} className="flex items-center justify-between p-4 rounded-xl bg-white/[0.02] border border-white/5 hover:border-cyan-500/20 transition-colors">
                                    <div>
                                        <p className="font-medium text-white">{item.label}</p>
                                        <p className="text-sm text-white/40">{item.desc}</p>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input type="checkbox" defaultChecked className="sr-only peer" />
                                        <div className="w-11 h-6 bg-white/10 rounded-full peer peer-checked:bg-cyan-500 peer-checked:shadow-[0_0_12px_rgba(6,182,212,0.4)] transition-all after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full"></div>
                                    </label>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Billing Tab */}
            {activeTab === 'billing' && (
                <div className="card-luxury p-8 animate-fade-in">
                    <h2 className="text-xl font-bold text-white mb-6">Información de Facturación</h2>

                    <div className="p-6 rounded-xl bg-gradient-to-r from-cyan-500/10 to-purple-500/10 border border-cyan-500/20 mb-8">
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <h3 className="font-semibold text-white text-lg">Plan Pro</h3>
                                <p className="text-white/50 text-sm">Facturación mensual</p>
                            </div>
                            <span className="badge-cyan">Activo</span>
                        </div>
                        <div className="flex items-baseline gap-1">
                            <span className="text-4xl font-bold text-white">$49</span>
                            <span className="text-white/40">/mes</span>
                        </div>
                    </div>

                    <div className="space-y-5">
                        <div>
                            <label className="label">Nombre de la empresa</label>
                            <input
                                type="text"
                                placeholder="Tu empresa S.A."
                                className="input-luxury"
                            />
                        </div>
                        <div>
                            <label className="label">RFC / NIT</label>
                            <input
                                type="text"
                                placeholder="XXXX000000XXX"
                                className="input-luxury"
                            />
                        </div>
                        <div>
                            <label className="label">Dirección de facturación</label>
                            <textarea
                                placeholder="Dirección completa..."
                                rows={2}
                                className="input-luxury min-h-[80px] resize-none"
                            />
                        </div>
                    </div>

                    <div className="flex justify-end mt-8">
                        <button onClick={handleSave} disabled={saving} className="btn-luxury">
                            {saving ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Guardando...
                                </>
                            ) : (
                                <>
                                    <Save className="w-4 h-4" />
                                    Guardar cambios
                                </>
                            )}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
