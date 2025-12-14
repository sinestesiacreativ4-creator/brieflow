import { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/lib/auth';
import {
    LayoutDashboard,
    FolderKanban,
    Kanban,
    Users,
    UserCircle,
    Settings,
    LogOut,
    Menu,
    X,
    ChevronDown,
    Zap,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { usePushNotifications } from '@/hooks/usePushNotifications';
import { NotificationBell } from '@/components/NotificationBell';

const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Proyectos', href: '/projects', icon: FolderKanban },
    { name: 'Flujo de Trabajo', href: '/workflow', icon: Kanban },
    { name: 'Clientes', href: '/clients', icon: Users },
    { name: 'Equipo', href: '/team', icon: UserCircle },
    { name: 'Configuración', href: '/settings', icon: Settings },
];

export default function DashboardLayout() {
    const location = useLocation();
    const navigate = useNavigate();
    const { user, agency, logout } = useAuthStore();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [userMenuOpen, setUserMenuOpen] = useState(false);
    const { subscribe, permission } = usePushNotifications();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <div className="min-h-screen bg-luxury">
            {/* Ambient light effects - Cyan */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden">
                <div className="absolute -top-40 -left-40 w-[500px] h-[500px] bg-cyan-500/[0.03] rounded-full blur-[120px]" />
                <div className="absolute top-1/3 -right-40 w-96 h-96 bg-cyan-500/[0.04] rounded-full blur-[100px]" />
                <div className="absolute -bottom-40 left-1/3 w-[600px] h-[400px] bg-cyan-500/[0.02] rounded-full blur-[100px]" />
            </div>

            {/* Mobile sidebar backdrop */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside
                className={cn(
                    'fixed top-0 left-0 z-50 h-full w-72 transition-transform duration-300 lg:translate-x-0',
                    'bg-gradient-to-b from-gray-950/98 via-gray-950 to-black backdrop-blur-xl',
                    'border-r border-cyan-500/10',
                    sidebarOpen ? 'translate-x-0' : '-translate-x-full'
                )}
            >
                {/* Logo area */}
                <div className="h-20 flex items-center justify-between px-6 border-b border-cyan-500/10">
                    <Link to="/dashboard" className="flex items-center gap-3 group">
                        <div className="relative">
                            <img
                                src="/logo.png"
                                alt="BriefFlow"
                                className="w-11 h-11 rounded-xl shadow-lg shadow-cyan-500/20 transition-transform group-hover:scale-105"
                            />
                            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-gradient-to-br from-cyan-400 to-cyan-500 rounded-full border-2 border-gray-950 flex items-center justify-center">
                                <Zap className="w-2 h-2 text-gray-950" />
                            </div>
                        </div>
                        <div>
                            <span className="font-bold text-xl tracking-tight text-white">
                                Brief<span className="text-gradient-cyan">Flow</span>
                            </span>
                            <p className="text-[10px] text-cyan-400/60 font-semibold tracking-[0.2em] uppercase">
                                Pro Edition
                            </p>
                        </div>
                    </Link>
                    <button
                        className="lg:hidden p-2.5 rounded-xl hover:bg-cyan-500/10 text-white/60 hover:text-cyan-400 transition-colors"
                        onClick={() => setSidebarOpen(false)}
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Navigation */}
                <nav className="p-4 space-y-1.5">
                    <p className="px-3 py-2 text-[10px] font-semibold text-cyan-400/40 uppercase tracking-[0.15em]">
                        Menú principal
                    </p>
                    {navigation.filter(item => {
                        if (user?.role === 'CLIENT') {
                            return ['Dashboard', 'Proyectos', 'Configuración'].includes(item.name);
                        }
                        return true;
                    }).map((item, index) => {
                        let linkTo = item.href;
                        if (user?.role === 'CLIENT' && item.href === '/dashboard') {
                            linkTo = '/client/dashboard';
                        }

                        const isActive = location.pathname === linkTo ||
                            (linkTo !== '/dashboard' && linkTo !== '/client/dashboard' && location.pathname.startsWith(linkTo));

                        return (
                            <Link
                                key={item.name}
                                to={linkTo}
                                className={cn(
                                    'relative flex items-center gap-3.5 px-4 py-3 rounded-xl text-[0.9375rem] font-medium transition-all duration-200',
                                    'animate-fade-in',
                                    isActive
                                        ? 'bg-gradient-to-r from-cyan-500/15 to-cyan-500/5 text-cyan-400'
                                        : 'text-white/50 hover:bg-cyan-500/[0.05] hover:text-white/90'
                                )}
                                style={{ animationDelay: `${index * 50}ms` }}
                                onClick={() => setSidebarOpen(false)}
                            >
                                {isActive && (
                                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-6 bg-gradient-to-b from-cyan-400 to-cyan-500 rounded-r-full shadow-[0_0_12px_rgba(6,182,212,0.5)]" />
                                )}
                                <item.icon className={cn(
                                    'w-5 h-5 transition-colors',
                                    isActive ? 'text-cyan-400' : 'text-white/40'
                                )} />
                                {item.name}
                            </Link>
                        );
                    })}
                </nav>

                {/* User section at bottom */}
                <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-cyan-500/10 bg-gray-950/80">
                    <div className="relative">
                        <button
                            onClick={() => setUserMenuOpen(!userMenuOpen)}
                            className={cn(
                                'w-full flex items-center gap-3 p-3 rounded-xl transition-all duration-200',
                                'hover:bg-cyan-500/[0.05] border border-transparent hover:border-cyan-500/20'
                            )}
                        >
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-400 to-cyan-600 flex items-center justify-center text-gray-950 font-bold text-sm shadow-lg shadow-cyan-500/30">
                                {user?.name?.charAt(0).toUpperCase()}
                            </div>
                            <div className="flex-1 text-left">
                                <p className="text-sm font-semibold text-white truncate">{user?.name}</p>
                                <p className="text-xs text-white/40 truncate">{user?.email}</p>
                            </div>
                            <ChevronDown className={cn(
                                'w-4 h-4 text-cyan-400/50 transition-transform duration-200',
                                userMenuOpen && 'rotate-180'
                            )} />
                        </button>

                        {/* User dropdown menu */}
                        {userMenuOpen && (
                            <div className="absolute bottom-full left-0 right-0 mb-2 bg-gray-950/98 backdrop-blur-xl rounded-xl shadow-2xl border border-cyan-500/20 py-2 animate-fade-in overflow-hidden">
                                <div className="px-4 py-3 border-b border-cyan-500/10">
                                    <p className="text-xs text-white/40">Conectado como</p>
                                    <p className="text-sm font-medium text-white truncate">{user?.email}</p>
                                </div>
                                <button
                                    onClick={handleLogout}
                                    className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-400 hover:bg-red-500/10 transition-colors"
                                >
                                    <LogOut className="w-4 h-4" />
                                    Cerrar sesión
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </aside>

            {/* Main content */}
            <div className="lg:pl-72 relative">
                {/* Top bar */}
                <header className="sticky top-0 z-30 h-16 bg-gray-950/90 backdrop-blur-xl border-b border-cyan-500/10">
                    <div className="h-full px-4 lg:px-8 flex items-center justify-between">
                        <button
                            className="lg:hidden p-2.5 rounded-xl hover:bg-cyan-500/10 text-white/60 hover:text-cyan-400 transition-colors"
                            onClick={() => setSidebarOpen(true)}
                        >
                            <Menu className="w-5 h-5" />
                        </button>

                        {/* Agency name on desktop */}
                        <div className="hidden lg:flex items-center gap-2">
                            <span className="text-sm text-white/40">Agencia:</span>
                            <span className="text-sm font-semibold text-white">{agency?.name || 'BriefFlow'}</span>
                        </div>

                        <div className="flex-1" />

                        {/* Actions */}
                        <div className="flex items-center gap-3">
                            {permission === 'default' && (
                                <button
                                    onClick={subscribe}
                                    className="hidden sm:flex items-center gap-2 px-4 py-2 text-sm font-medium text-cyan-400 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 rounded-lg transition-all hover:shadow-[0_0_20px_rgba(6,182,212,0.15)]"
                                >
                                    <Zap className="w-4 h-4" />
                                    Activar Alertas
                                </button>
                            )}
                            <NotificationBell />
                        </div>
                    </div>
                </header>

                {/* Page content */}
                <main className="p-4 lg:p-8 min-h-[calc(100vh-4rem)]">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}
