import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/lib/auth';
import { authApi } from '@/lib/api';
import {
    Zap,
    Loader2,
    Building2,
    User,
    Mail,
    Lock,
    Globe,
    ArrowLeft,
} from 'lucide-react';

// Force Vercel Re-deploy: Midnight Cyan v2
export default function SignupPage() {
    const navigate = useNavigate();
    const { setAuth } = useAuthStore();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const [formData, setFormData] = useState({
        agencyName: '',
        subdomain: '',
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (formData.password !== formData.confirmPassword) {
            setError('Las contraseñas no coinciden');
            return;
        }

        setLoading(true);

        try {
            const response = await authApi.register({
                agencyName: formData.agencyName,
                subdomain: formData.subdomain,
                name: formData.name,
                email: formData.email,
                password: formData.password,
            });

            const { token, user, agency } = response.data;
            setAuth(token, user, agency);
            navigate('/dashboard');
        } catch (err: any) {
            setError(err.response?.data?.error || 'Error al crear la cuenta');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-luxury flex items-center justify-center p-4 relative overflow-hidden">
            {/* Ambient light effects */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-cyan-500/[0.04] rounded-full blur-[120px]" />
                <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-purple-500/[0.03] rounded-full blur-[100px]" />
            </div>

            {/* Back button */}
            <button
                onClick={() => navigate('/')}
                className="absolute top-8 left-8 flex items-center gap-2 text-white/40 hover:text-cyan-400 transition-colors z-20 md:hidden"
            >
                <ArrowLeft className="w-4 h-4" />
                Volver
            </button>

            <div className="w-full max-w-lg relative z-10 animate-fade-in my-8">
                {/* Logo */}
                <div className="text-center mb-10">
                    <div className="flex items-center justify-center gap-3 mb-4">
                        <div className="relative">
                            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-500/10 to-transparent border border-cyan-500/20 flex items-center justify-center shadow-lg shadow-cyan-500/10 backdrop-blur-sm">
                                <Zap className="w-8 h-8 text-cyan-400" />
                            </div>
                        </div>
                    </div>
                    <h1 className="text-3xl font-bold text-white">
                        Crea tu <span className="text-gradient-cyan">Agencia</span>
                    </h1>
                    <p className="text-white/40 mt-3 text-lg">
                        Empieza tu prueba gratis de 14 días
                    </p>
                </div>

                {/* Card */}
                <div className="card-luxury p-8">
                    {error && (
                        <div className="p-4 mb-6 rounded-xl bg-red-500/10 border border-red-500/30 flex items-start gap-3">
                            <div className="w-1.5 h-1.5 rounded-full bg-red-400 mt-2" />
                            <p className="text-sm text-red-200">{error}</p>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div className="space-y-2">
                                <label className="label">Nombre de tu agencia</label>
                                <div className="relative">
                                    <Building2 className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
                                    <input
                                        name="agencyName"
                                        value={formData.agencyName}
                                        onChange={handleChange}
                                        placeholder="Acme Studio"
                                        className="input-luxury pl-11"
                                        required
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="label">Subdominio</label>
                                <div className="relative">
                                    <Globe className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
                                    <input
                                        name="subdomain"
                                        value={formData.subdomain}
                                        onChange={handleChange}
                                        placeholder="acme"
                                        className="input-luxury pl-11"
                                        required
                                    />
                                    <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-white/20 pointer-events-none">
                                        .brieflow.com
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="label">Tu nombre completo</label>
                            <div className="relative">
                                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
                                <input
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    placeholder="Juan Pérez"
                                    className="input-luxury pl-11"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="label">Correo electrónico</label>
                            <div className="relative">
                                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    placeholder="juan@acme.com"
                                    className="input-luxury pl-11"
                                    required
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div className="space-y-2">
                                <label className="label">Contraseña</label>
                                <div className="relative">
                                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
                                    <input
                                        type="password"
                                        name="password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        placeholder="********"
                                        className="input-luxury pl-11"
                                        required
                                        minLength={6}
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="label">Confirmar contraseña</label>
                                <div className="relative">
                                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
                                    <input
                                        type="password"
                                        name="confirmPassword"
                                        value={formData.confirmPassword}
                                        onChange={handleChange}
                                        placeholder="********"
                                        className="input-luxury pl-11"
                                        required
                                        minLength={6}
                                    />
                                </div>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="btn-luxury w-full justify-center py-4 text-base font-semibold mt-4"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    Creando tu espacio...
                                </>
                            ) : (
                                <>
                                    <Zap className="w-5 h-5" />
                                    Comenzar prueba gratis
                                </>
                            )}
                        </button>
                    </form>

                    <p className="text-center text-sm text-white/30 mt-8">
                        ¿Ya tienes una cuenta?{' '}
                        <a href="/login" className="text-cyan-400 hover:text-cyan-300 transition-colors font-medium">
                            Iniciar sesión
                        </a>
                    </p>
                </div>

                <p className="text-center text-xs text-white/20 mt-8 max-w-sm mx-auto leading-relaxed">
                    Al crear una cuenta, aceptas nuestros <a href="#" className="hover:text-white/40 underline">Términos de servicio</a> y <a href="#" className="hover:text-white/40 underline">Política de privacidad</a>.
                </p>
            </div>
        </div>
    );
}
