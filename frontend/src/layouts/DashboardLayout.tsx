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
    Bell,
    LogOut,
    Menu,
    X,
    ChevronDown,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

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

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50/30">
            {/* Mobile sidebar backdrop */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-gray-900/20 backdrop-blur-sm z-40 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside
                className={cn(
                    'fixed top-0 left-0 z-50 h-full w-72 bg-white border-r border-gray-100 shadow-xl shadow-gray-200/50 transition-transform duration-300 lg:translate-x-0',
                    sidebarOpen ? 'translate-x-0' : '-translate-x-full'
                )}
            >
                {/* Sidebar header */}
                <div className="h-20 flex items-center justify-between px-6 border-b border-gray-100">
                    <Link to="/dashboard" className="flex items-center gap-3">
                        <img src="/logo.png" alt="BriefFlow" className="w-10 h-10 rounded-xl shadow-lg shadow-blue-500/20" />
                        <div>
                            <span className="font-bold text-xl text-gray-900">Brief<span className="text-blue-600">Flow</span></span>
                            <p className="text-[10px] text-gray-400 font-medium tracking-wider uppercase">Pro Edition</p>
                        </div>
                    </Link>
                    <button
                        className="lg:hidden p-2 rounded-xl hover:bg-gray-100 text-gray-500"
                        onClick={() => setSidebarOpen(false)}
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Navigation */}
                <nav className="p-4 space-y-1">
                    {navigation.filter(item => {
                        if (user?.role === 'CLIENT') {
                            return ['Dashboard', 'Proyectos', 'Configuración'].includes(item.name);
                        }
                        return true;
                    }).map((item) => {
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
                                    'relative flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200',
                                    isActive
                                        ? 'bg-blue-50 text-blue-600'
                                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                )}
                                onClick={() => setSidebarOpen(false)}
                            >
                                {isActive && (
                                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-blue-600 rounded-r-full" />
                                )}
                                <item.icon className="w-5 h-5" />
                                {item.name}
                            </Link>
                        );
                    })}
                </nav>



                {/* User section at bottom */}
                <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-100 bg-gray-50/50">
                    <div className="relative">
                        <button
                            onClick={() => setUserMenuOpen(!userMenuOpen)}
                            className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-white transition-all border border-transparent hover:border-gray-200 hover:shadow-sm"
                        >
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-semibold text-sm shadow-md shadow-blue-500/20">
                                {user?.name?.charAt(0).toUpperCase()}
                            </div>
                            <div className="flex-1 text-left">
                                <p className="text-sm font-medium text-gray-900 truncate">{user?.name}</p>
                                <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                            </div>
                            <ChevronDown className={cn(
                                'w-4 h-4 text-gray-400 transition-transform duration-200',
                                userMenuOpen && 'rotate-180'
                            )} />
                        </button>

                        {/* User dropdown menu */}
                        {userMenuOpen && (
                            <div className="absolute bottom-full left-0 right-0 mb-2 bg-white rounded-xl shadow-xl border border-gray-100 py-2 animate-fade-in">
                                <button
                                    onClick={handleLogout}
                                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
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
            <div className="lg:pl-72">
                {/* Top bar */}
                <header className="sticky top-0 z-30 h-16 bg-white/80 backdrop-blur-xl border-b border-gray-100">
                    <div className="h-full px-4 lg:px-8 flex items-center justify-between">
                        <button
                            className="lg:hidden p-2 rounded-xl hover:bg-gray-100 text-gray-500"
                            onClick={() => setSidebarOpen(true)}
                        >
                            <Menu className="w-5 h-5" />
                        </button>

                        <div className="flex-1" />

                        {/* Notifications */}
                        <div className="flex items-center gap-3">
                            <Button variant="ghost" size="icon" className="relative">
                                <Bell className="w-5 h-5" />
                            </Button>
                        </div>
                    </div>
                </header>

                {/* Page content */}
                <main className="p-4 lg:p-8">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}
