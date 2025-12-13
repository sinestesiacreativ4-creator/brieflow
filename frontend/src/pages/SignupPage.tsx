import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuthStore } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Mail, Lock, User, Building, Globe } from 'lucide-react';

const signupSchema = z.object({
    agencyName: z.string().min(2, 'El nombre de la agencia debe tener al menos 2 caracteres'),
    subdomain: z
        .string()
        .min(3, 'El subdominio debe tener al menos 3 caracteres')
        .regex(/^[a-z0-9-]+$/, 'Solo letras minúsculas, números y guiones'),
    name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
    email: z.string().email('Email inválido'),
    password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
    confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
    message: 'Las contraseñas no coinciden',
    path: ['confirmPassword'],
});

type SignupFormData = z.infer<typeof signupSchema>;

export default function SignupPage() {
    const navigate = useNavigate();
    const { signup } = useAuthStore();
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const {
        register,
        handleSubmit,
        watch,
        formState: { errors },
    } = useForm<SignupFormData>({
        resolver: zodResolver(signupSchema),
    });

    const subdomain = watch('subdomain');

    const onSubmit = async (data: SignupFormData) => {
        setError('');
        setIsLoading(true);

        try {
            await signup({
                agencyName: data.agencyName,
                subdomain: data.subdomain,
                name: data.name,
                email: data.email,
                password: data.password,
            });
            navigate('/dashboard');
        } catch (err: any) {
            setError(err.message || 'Error al crear la cuenta');
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
                            Crea tu agencia
                        </h1>
                        <p className="mt-2 text-gray-600">
                            Empieza tu prueba gratis de 14 días
                        </p>
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
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">Nombre de tu agencia</label>
                                <div className="relative">
                                    <Building className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <Input
                                        {...register('agencyName')}
                                        placeholder="Mi Agencia Creativa"
                                        className="pl-12"
                                        error={errors.agencyName?.message}
                                    />
                                </div>
                                {errors.agencyName && (
                                    <p className="mt-1 text-sm text-red-500">{errors.agencyName.message}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">Subdominio</label>
                                <div className="relative">
                                    <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <Input
                                        {...register('subdomain')}
                                        placeholder="mi-agencia"
                                        className="pl-12"
                                        error={errors.subdomain?.message}
                                    />
                                </div>
                                {subdomain && (
                                    <p className="mt-1 text-xs text-gray-500">
                                        Tu URL será: <span className="font-medium text-blue-600">{subdomain}.briefflow.com</span>
                                    </p>
                                )}
                                {errors.subdomain && (
                                    <p className="mt-1 text-sm text-red-500">{errors.subdomain.message}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">Tu nombre</label>
                                <div className="relative">
                                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <Input
                                        {...register('name')}
                                        placeholder="Juan Pérez"
                                        className="pl-12"
                                        error={errors.name?.message}
                                    />
                                </div>
                                {errors.name && (
                                    <p className="mt-1 text-sm text-red-500">{errors.name.message}</p>
                                )}
                            </div>

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

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">Confirmar contraseña</label>
                                <div className="relative">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <Input
                                        {...register('confirmPassword')}
                                        type="password"
                                        placeholder="••••••••"
                                        className="pl-12"
                                        error={errors.confirmPassword?.message}
                                    />
                                </div>
                                {errors.confirmPassword && (
                                    <p className="mt-1 text-sm text-red-500">{errors.confirmPassword.message}</p>
                                )}
                            </div>

                            <Button type="submit" className="w-full" loading={isLoading}>
                                Crear cuenta gratis
                            </Button>

                            <p className="text-xs text-center text-gray-500">
                                Al crear una cuenta, aceptas nuestros{' '}
                                <a href="#" className="text-blue-600 hover:underline">
                                    Términos de servicio
                                </a>{' '}
                                y{' '}
                                <a href="#" className="text-blue-600 hover:underline">
                                    Política de privacidad
                                </a>
                            </p>
                        </form>

                        <div className="mt-6 text-center">
                            <p className="text-sm text-gray-600">
                                ¿Ya tienes una cuenta?{' '}
                                <Link to="/login" className="font-medium text-blue-600 hover:text-blue-500">
                                    Inicia sesión
                                </Link>
                            </p>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
