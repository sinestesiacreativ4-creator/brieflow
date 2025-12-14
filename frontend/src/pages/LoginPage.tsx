import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuthStore } from '@/lib/auth';
import { ArrowLeft, Mail, Lock, Sparkles, Loader2 } from 'lucide-react';

const loginSchema = z.object({
    email: z.string().email('Email inválido'),
    password: z.string().min(1, 'La contraseña es requerida'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const isClient = searchParams.get('type') === 'client';
    const { login } = useAuthStore();
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<LoginFormData>({
        resolver: zodResolver(loginSchema),
    });

    const onSubmit = async (data: LoginFormData) => {
        setError('');
        setIsLoading(true);

        try {
            await login(data.email, data.password, isClient);
            navigate(isClient ? '/client/dashboard' : '/dashboard');
        } catch (err: any) {
            setError(err.message || 'Error al iniciar sesión');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-luxury flex flex-col relative overflow-hidden">
            {/* Ambient light effects */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute -top-40 left-1/4 w-96 h-96 bg-amber-500/[0.07] rounded-full blur-[120px]" />
                <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-cyan-500/[0.05] rounded-full blur-[100px]" />
            </div>

            {/* Header */}
            <header className="relative p-6">
                <Link
                    to="/"
                    className="inline-flex items-center gap-2 text-white/50 hover:text-white transition-colors text-sm"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Volver al inicio
                </Link>
            </header>

            {/* Main Content */}
            <main className="relative flex-1 flex items-center justify-center px-4 py-12">
                <div className="w-full max-w-md animate-fade-in-up">
                    {/* Logo */}
                    <div className="text-center mb-10">
                        <Link to="/" className="inline-block">
                            <div className="relative">
                                <img
                                    src="/logo.png"
                                    alt="BriefFlow"
                                    className="w-16 h-16 rounded-2xl shadow-2xl shadow-amber-500/20 mx-auto"
                                />
                                <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-gradient-to-br from-amber-400 to-amber-500 rounded-full border-2 border-gray-900 flex items-center justify-center">
                                    <Sparkles className="w-3 h-3 text-gray-900" />
                                </div>
                            </div>
                        </Link>
                        <h1 className="mt-8 text-3xl font-bold text-white tracking-tight">
                            {isClient ? 'Portal de Cliente' : 'Bienvenido'}
                        </h1>
                        <p className="mt-3 text-white/50">
                            {isClient
                                ? 'Ingresa para ver tus proyectos'
                                : 'Inicia sesión en tu cuenta'}
                        </p>
                    </div>

                    {/* Login Tabs */}
                    <div className="flex gap-2 mb-8 p-1.5 bg-white/5 rounded-xl border border-white/10">
                        <Link
                            to="/login"
                            className={`flex-1 text-center py-3 px-4 rounded-lg text-sm font-medium transition-all ${!isClient
                                ? 'bg-gradient-to-r from-amber-500/20 to-amber-500/10 text-amber-400 border border-amber-500/30'
                                : 'text-white/50 hover:text-white/70'
                                }`}
                        >
                            Agencia
                        </Link>
                        <Link
                            to="/login?type=client"
                            className={`flex-1 text-center py-3 px-4 rounded-lg text-sm font-medium transition-all ${isClient
                                ? 'bg-gradient-to-r from-amber-500/20 to-amber-500/10 text-amber-400 border border-amber-500/30'
                                : 'text-white/50 hover:text-white/70'
                                }`}
                        >
                            Cliente
                        </Link>
                    </div>

                    {/* Form Card */}
                    <div className="card-luxury p-8">
                        {error && (
                            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-sm text-red-400 flex items-center gap-3">
                                <div className="w-2 h-2 rounded-full bg-red-400 animate-pulse" />
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                            <div>
                                <label className="label">Email</label>
                                <div className="relative">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
                                    <input
                                        {...register('email')}
                                        type="email"
                                        placeholder="tu@email.com"
                                        className="input-luxury pl-12"
                                    />
                                </div>
                                {errors.email && (
                                    <p className="mt-2 text-sm text-red-400">{errors.email.message}</p>
                                )}
                            </div>

                            <div>
                                <label className="label">Contraseña</label>
                                <div className="relative">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
                                    <input
                                        {...register('password')}
                                        type="password"
                                        placeholder="••••••••"
                                        className="input-luxury pl-12"
                                    />
                                </div>
                                {errors.password && (
                                    <p className="mt-2 text-sm text-red-400">{errors.password.message}</p>
                                )}
                            </div>

                            <div className="flex items-center justify-between text-sm">
                                <label className="flex items-center gap-2.5 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        className="w-4 h-4 rounded border-white/20 bg-white/5 text-amber-500 focus:ring-amber-500/30"
                                    />
                                    <span className="text-white/50">Recuérdame</span>
                                </label>
                                <a href="#" className="font-medium text-amber-400 hover:text-amber-300 transition-colors">
                                    ¿Olvidaste tu contraseña?
                                </a>
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="btn-luxury w-full"
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        Iniciando...
                                    </>
                                ) : (
                                    'Iniciar Sesión'
                                )}
                            </button>
                        </form>

                        {!isClient && (
                            <div className="mt-8 pt-6 border-t border-white/5 text-center">
                                <p className="text-sm text-white/40">
                                    ¿No tienes una cuenta?{' '}
                                    <Link to="/signup" className="font-medium text-amber-400 hover:text-amber-300 transition-colors">
                                        Regístrate gratis
                                    </Link>
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </main>

            {/* Footer subtle branding */}
            <footer className="relative py-6 text-center">
                <p className="text-xs text-white/20">
                    Powered by <span className="text-gradient-gold font-medium">BriefFlow</span>
                </p>
            </footer>
        </div>
    );
}
