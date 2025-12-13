import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuthStore } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Mail, Lock } from 'lucide-react';

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
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-amber-50/30 flex flex-col">
            {/* Header */}
            <header className="p-6">
                <Link to="/" className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors">
                    <ArrowLeft className="w-4 h-4" />
                    Volver al inicio
                </Link>
            </header>

            {/* Main Content */}
            <main className="flex-1 flex items-center justify-center px-4 py-12">
                <div className="w-full max-w-md">
                    {/* Logo */}
                    <div className="text-center mb-8">
                        <Link to="/" className="inline-flex items-center gap-2">
                            <img src="/logo.png" alt="BriefFlow" className="w-12 h-12 rounded-xl shadow-lg shadow-blue-500/20" />
                        </Link>
                        <h1 className="mt-6 text-2xl font-bold text-gray-900">
                            {isClient ? 'Portal de Cliente' : 'Bienvenido de nuevo'}
                        </h1>
                        <p className="mt-2 text-gray-600">
                            {isClient
                                ? 'Ingresa para ver tus proyectos'
                                : 'Inicia sesión en tu cuenta de BriefFlow'}
                        </p>
                    </div>

                    {/* Login Tabs */}
                    <div className="flex gap-2 mb-6">
                        <Link
                            to="/login"
                            className={`flex-1 text-center py-3 px-4 rounded-xl text-sm font-medium transition-all ${!isClient
                                ? 'bg-blue-100 text-blue-700'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                        >
                            Agencia
                        </Link>
                        <Link
                            to="/login?type=client"
                            className={`flex-1 text-center py-3 px-4 rounded-xl text-sm font-medium transition-all ${isClient
                                ? 'bg-blue-100 text-blue-700'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                        >
                            Cliente
                        </Link>
                    </div>

                    {/* Form Card */}
                    <div className="bg-white rounded-2xl shadow-xl shadow-gray-200/50 border border-gray-100 p-8">
                        {error && (
                            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
                                <div className="relative">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <Input
                                        {...register('email')}
                                        type="email"
                                        placeholder="tu@email.com"
                                        className="pl-12"
                                        error={errors.email?.message}
                                    />
                                </div>
                                {errors.email && (
                                    <p className="mt-1 text-sm text-red-500">{errors.email.message}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">Contraseña</label>
                                <div className="relative">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <Input
                                        {...register('password')}
                                        type="password"
                                        placeholder="••••••••"
                                        className="pl-12"
                                        error={errors.password?.message}
                                    />
                                </div>
                                {errors.password && (
                                    <p className="mt-1 text-sm text-red-500">{errors.password.message}</p>
                                )}
                            </div>

                            <div className="flex items-center justify-between text-sm">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                    />
                                    <span className="text-gray-600">Recuérdame</span>
                                </label>
                                <a href="#" className="font-medium text-blue-600 hover:text-blue-500">
                                    ¿Olvidaste tu contraseña?
                                </a>
                            </div>

                            <Button type="submit" className="w-full" loading={isLoading}>
                                Iniciar Sesión
                            </Button>
                        </form>

                        {!isClient && (
                            <div className="mt-6 text-center">
                                <p className="text-sm text-gray-600">
                                    ¿No tienes una cuenta?{' '}
                                    <Link to="/signup" className="font-medium text-blue-600 hover:text-blue-500">
                                        Regístrate gratis
                                    </Link>
                                </p>
                            </div>
                        )}
                    </div>


                </div>
            </main>
        </div>
    );
}
