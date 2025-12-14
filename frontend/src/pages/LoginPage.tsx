import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/lib/auth';
import { Zap, Loader2, Building2, User } from 'lucide-react';

export default function LoginPage() {
    const navigate = useNavigate();
    const { login } = useAuthStore();
    const [userType, setUserType] = useState<'agency' | 'client'>('agency');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const isClient = userType === 'client';
            await login(email, password, isClient);

            if (isClient) {
                navigate('/client/dashboard');
            } else {
                navigate('/dashboard');
            }
        } catch (err: any) {
            setError(err.message || 'Error de autenticación');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-luxury flex items-center justify-center p-4 relative overflow-hidden">
            {/* Ambient light effects */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-cyan-500/[0.05] rounded-full blur-[120px]" />
                <div className="absolute bottom-0 left-1/4 w-[500px] h-[300px] bg-cyan-500/[0.03] rounded-full blur-[100px]" />
                <div className="absolute top-1/3 right-0 w-[400px] h-[400px] bg-purple-500/[0.02] rounded-full blur-[100px]" />
            </div>

            <div className="w-full max-w-md relative z-10 animate-fade-in">
                {/* Logo */}
                <div className="text-center mb-10">
                    <div className="flex items-center justify-center gap-3 mb-4">
                        <div className="relative">
                            <img
                                src="/logo.png"
                                alt="BriefFlow"
                                className="w-14 h-14 rounded-2xl shadow-2xl shadow-cyan-500/20"
                            />
                            <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-gradient-to-br from-cyan-400 to-cyan-600 rounded-full border-2 border-gray-950 flex items-center justify-center">
                                <Zap className="w-2.5 h-2.5 text-gray-950" />
                            </div>
                        </div>
                    </div>
                    <h1 className="text-3xl font-bold text-white">
                        Brief<span className="text-gradient-cyan">Flow</span>
                    </h1>
                    <p className="text-white/40 mt-2">Gestión creativa simplificada</p>
                </div>

                {/* Card */}
                <div className="card-luxury p-8">
                    {/* User Type Toggle */}
                    <div className="flex gap-2 p-1.5 mb-8 bg-white/5 rounded-xl border border-white/10">
                        <button
                            type="button"
                            onClick={() => setUserType('agency')}
                            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg text-sm font-medium transition-all
                                ${userType === 'agency'
                                    ? 'bg-gradient-to-r from-cyan-500/20 to-cyan-500/10 text-cyan-400 shadow-lg border border-cyan-500/30'
                                    : 'text-white/50 hover:text-white/80'}`}
                        >
                            <Building2 className="w-4 h-4" />
                            Agencia
                        </button>
                        <button
                            type="button"
                            onClick={() => setUserType('client')}
                            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg text-sm font-medium transition-all
                                ${userType === 'client'
                                    ? 'bg-gradient-to-r from-cyan-500/20 to-cyan-500/10 text-cyan-400 shadow-lg border border-cyan-500/30'
                                    : 'text-white/50 hover:text-white/80'}`}
                        >
                            <User className="w-4 h-4" />
                            Cliente
                        </button>
                    </div>

                    {error && (
                        <div className="p-4 mb-6 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label className="label">Email</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="tu@email.com"
                                required
                                className="input-luxury"
                            />
                        </div>

                        <div>
                            <label className="label">Contraseña</label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                required
                                className="input-luxury"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="btn-luxury w-full justify-center"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Iniciando sesión...
                                </>
                            ) : (
                                'Iniciar Sesión'
                            )}
                        </button>
                    </form>

                    <p className="text-center text-sm text-white/30 mt-8">
                        ¿No tienes cuenta?{' '}
                        <a href="/signup" className="text-cyan-400 hover:text-cyan-300 transition-colors font-medium">
                            Registra tu agencia
                        </a>
                    </p>
                </div>

                {/* Footer */}
                <p className="text-center text-xs text-white/20 mt-8">
                    © 2024 BriefFlow. Todos los derechos reservados.
                </p>
            </div>
        </div>
    );
}
