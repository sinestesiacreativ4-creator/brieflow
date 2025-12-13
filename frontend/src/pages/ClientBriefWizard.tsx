import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { projectsApi, briefsApi } from '@/lib/api';
import { useAuthStore } from '@/lib/auth';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    ArrowLeft,
    ArrowRight,
    Check,
    FileText,
    Target,
    Users,
    MessageSquare,
    Package,
    Clipboard,
    Send,
    Palette,
    Globe,
    Megaphone,
    Video,
    Share2,
    Upload,
    File,
    X,
    Image as ImageIcon
} from 'lucide-react';

// Configuration for each project type
const PROJECT_TYPE_CONFIG: Record<string, {
    icon: any;
    color: string;
    steps: { id: number; title: string; icon: any }[];
    fields: Record<number, { label: string; name: string; type: string; placeholder: string; options?: string[] }[]>;
    deliverables: string[];
}> = {
    BRANDING: {
        icon: Palette,
        color: 'from-purple-500 to-pink-500',
        steps: [
            { id: 1, title: 'Sobre tu Marca', icon: FileText },
            { id: 2, title: 'Personalidad', icon: MessageSquare },
            { id: 3, title: 'Competencia', icon: Target },
            { id: 4, title: 'Archivos', icon: Upload },
            { id: 5, title: 'Entregables', icon: Package },
            { id: 6, title: 'Resumen', icon: Clipboard },
        ],
        fields: {
            1: [
                { label: '¿Cuál es el nombre de tu marca/empresa?', name: 'brandName', type: 'input', placeholder: 'Ej: TechFlow Solutions' },
                { label: '¿A qué se dedica tu empresa?', name: 'businessDescription', type: 'textarea', placeholder: 'Describe brevemente qué hace tu empresa, qué productos o servicios ofrece...' },
                { label: '¿Cuál es la misión de tu marca?', name: 'mission', type: 'textarea', placeholder: 'El propósito fundamental de tu empresa...' },
                { label: '¿Cuál es la visión?', name: 'vision', type: 'textarea', placeholder: 'Dónde quieres que esté tu marca en 5-10 años...' },
            ],
            2: [
                { label: '¿Cómo describirías la personalidad de tu marca?', name: 'brandPersonality', type: 'select', placeholder: 'Selecciona', options: ['Profesional y Seria', 'Amigable y Cercana', 'Innovadora y Moderna', 'Elegante y Premium', 'Juvenil y Dinámica', 'Tradicional y Confiable'] },
                { label: '¿Qué valores representa tu marca?', name: 'brandValues', type: 'textarea', placeholder: 'Ej: Innovación, Confianza, Calidad, Sostenibilidad...' },
                { label: '¿Cómo quieres que los clientes se sientan al interactuar con tu marca?', name: 'desiredEmotion', type: 'textarea', placeholder: 'Ej: Inspirados, Seguros, Emocionados, Tranquilos...' },
            ],
            3: [
                { label: '¿Quiénes son tus principales competidores?', name: 'competitors', type: 'textarea', placeholder: 'Menciona 3-5 competidores directos y qué hacen...' },
                { label: '¿Qué te diferencia de ellos?', name: 'differentiator', type: 'textarea', placeholder: '¿Cuál es tu propuesta de valor única?' },
                { label: '¿Hay alguna marca (no competidora) que admires?', name: 'brandInspiration', type: 'textarea', placeholder: 'Marcas que te inspiran por su imagen, comunicación o valores...' },
            ],
        },
        deliverables: ['Logo principal', 'Versiones del logo', 'Paleta de colores', 'Tipografías', 'Manual de identidad', 'Papelería básica', 'Firma de email', 'Plantillas para redes'],
    },
    WEB_DESIGN: {
        icon: Globe,
        color: 'from-blue-500 to-cyan-500',
        steps: [
            { id: 1, title: 'Objetivos', icon: Target },
            { id: 2, title: 'Contenido', icon: FileText },
            { id: 3, title: 'Funcionalidades', icon: Package },
            { id: 4, title: 'Archivos', icon: Upload },
            { id: 5, title: 'Referencias', icon: MessageSquare },
            { id: 6, title: 'Resumen', icon: Clipboard },
        ],
        fields: {
            1: [
                { label: '¿Cuál es el objetivo principal del sitio web?', name: 'websiteGoal', type: 'select', placeholder: 'Selecciona', options: ['Vender productos online', 'Generar leads/contactos', 'Mostrar portafolio', 'Informar sobre servicios', 'Blog/Contenido', 'Aplicación web'] },
                { label: 'Describe en detalle qué necesitas lograr', name: 'goalDetails', type: 'textarea', placeholder: 'Explica con más detalle los objetivos del sitio...' },
                { label: '¿Tienes un sitio web actualmente?', name: 'currentWebsite', type: 'input', placeholder: 'URL del sitio actual (si existe)' },
            ],
            2: [
                { label: '¿Qué secciones/páginas necesitas?', name: 'websitePages', type: 'textarea', placeholder: 'Ej: Inicio, Nosotros, Servicios, Blog, Contacto, FAQ...' },
                { label: '¿Ya tienes el contenido (textos, imágenes)?', name: 'contentReady', type: 'select', placeholder: 'Selecciona', options: ['Sí, todo listo', 'Parcialmente', 'No, necesito ayuda', 'Necesito fotografía profesional'] },
                { label: '¿Necesitas funcionalidades especiales?', name: 'specialFeatures', type: 'textarea', placeholder: 'Ej: Chat en vivo, Reservas online, Calculadora, Blog, E-commerce...' },
            ],
            3: [
                { label: '¿Necesitas integrar algo específico?', name: 'integrations', type: 'textarea', placeholder: 'Ej: CRM, Email marketing, Pagos online, Redes sociales, Analytics...' },
                { label: '¿Quién administrará el sitio?', name: 'siteAdmin', type: 'select', placeholder: 'Selecciona', options: ['Yo mismo (necesito CMS fácil)', 'Mi equipo de marketing', 'Prefiero que ustedes lo hagan', 'Equipo técnico interno'] },
                { label: '¿Tienes preferencias de plataforma?', name: 'platformPreference', type: 'select', placeholder: 'Selecciona', options: ['No tengo preferencia', 'WordPress', 'Shopify', 'Webflow', 'Desarrollo a medida', 'Otro'] },
            ],
            4: [
                { label: '¿Hay sitios web que te gusten como referencia?', name: 'websiteReferences', type: 'textarea', placeholder: 'URLs de sitios que te inspiran y por qué...' },
                { label: '¿Hay algo que definitivamente NO quieres?', name: 'websiteDislikes', type: 'textarea', placeholder: 'Estilos, colores, o elementos que prefieres evitar...' },
            ],
        },
        deliverables: ['Diseño responsive', 'Página de inicio', 'Páginas internas', 'Formularios de contacto', 'Blog', 'SEO básico', 'Integración analytics', 'Hosting y dominio'],
    },
    ADVERTISING_CAMPAIGN: {
        icon: Megaphone,
        color: 'from-orange-500 to-red-500',
        steps: [
            { id: 1, title: 'Campaña', icon: Target },
            { id: 2, title: 'Audiencia', icon: Users },
            { id: 3, title: 'Mensaje', icon: MessageSquare },
            { id: 4, title: 'Archivos', icon: Upload },
            { id: 5, title: 'Canales', icon: Package },
            { id: 6, title: 'Resumen', icon: Clipboard },
        ],
        fields: {
            1: [
                { label: '¿Cuál es el objetivo de la campaña?', name: 'campaignGoal', type: 'select', placeholder: 'Selecciona', options: ['Aumentar ventas', 'Generar leads', 'Awareness de marca', 'Lanzar producto', 'Promoción especial', 'Evento'] },
                { label: '¿Qué producto/servicio promocionarás?', name: 'productService', type: 'textarea', placeholder: 'Describe lo que quieres promocionar...' },
                { label: '¿Cuánto tiempo durará la campaña?', name: 'campaignDuration', type: 'input', placeholder: 'Ej: 2 semanas, 1 mes, temporada navideña...' },
            ],
            2: [
                { label: 'Describe tu público objetivo', name: 'targetAudience', type: 'textarea', placeholder: 'Edad, género, ubicación, intereses, comportamientos...' },
                { label: '¿Qué problema resuelve tu producto para ellos?', name: 'audiencePain', type: 'textarea', placeholder: 'El problema principal que tu producto/servicio soluciona...' },
            ],
            3: [
                { label: '¿Cuál es el mensaje principal?', name: 'keyMessage', type: 'textarea', placeholder: 'El mensaje que quieres que recuerde tu audiencia...' },
                { label: '¿Tienes un slogan o tagline?', name: 'tagline', type: 'input', placeholder: 'Frase corta y memorable (si la tienes)' },
                { label: '¿Qué acción quieres que tomen?', name: 'callToAction', type: 'select', placeholder: 'Selecciona', options: ['Comprar ahora', 'Solicitar información', 'Visitar tienda', 'Descargar app', 'Registrarse', 'Llamar'] },
            ],
            4: [
                { label: '¿En qué canales quieres anunciar?', name: 'adChannels', type: 'textarea', placeholder: 'Ej: Facebook, Instagram, Google, TikTok, YouTube, TV, Radio...' },
                { label: '¿Tienes presupuesto de medios definido?', name: 'mediaBudget', type: 'input', placeholder: 'Ej: $5,000 USD' },
            ],
        },
        deliverables: ['Concepto creativo', 'Artes para redes', 'Banners digitales', 'Video corto', 'Copies/textos', 'Landing page', 'Email marketing', 'Reporte de resultados'],
    },
    VIDEO_PRODUCTION: {
        icon: Video,
        color: 'from-red-500 to-pink-500',
        steps: [
            { id: 1, title: 'Concepto', icon: Target },
            { id: 2, title: 'Producción', icon: FileText },
            { id: 3, title: 'Archivos', icon: Upload },
            { id: 4, title: 'Detalles', icon: Package },
            { id: 5, title: 'Resumen', icon: Clipboard },
        ],
        fields: {
            1: [
                { label: '¿Qué tipo de video necesitas?', name: 'videoType', type: 'select', placeholder: 'Selecciona', options: ['Comercial/Spot', 'Video corporativo', 'Testimoniales', 'Producto', 'Tutorial/Explainer', 'Evento', 'Redes sociales'] },
                { label: '¿Cuál es el objetivo del video?', name: 'videoGoal', type: 'textarea', placeholder: 'Qué quieres lograr con este video...' },
                { label: '¿Cuánto debería durar?', name: 'videoDuration', type: 'select', placeholder: 'Selecciona', options: ['15 segundos', '30 segundos', '1 minuto', '2-3 minutos', '5+ minutos'] },
            ],
            2: [
                { label: '¿Dónde se grabará?', name: 'location', type: 'textarea', placeholder: 'Ubicación de la grabación (oficina, estudio, exteriores...)' },
                { label: '¿Necesitas actores/talento?', name: 'talent', type: 'select', placeholder: 'Selecciona', options: ['No, usaremos personal interno', 'Sí, necesito actores', 'Locutor/voz en off solamente', 'Animación (sin personas)'] },
                { label: '¿Tienes guión o idea del mensaje?', name: 'script', type: 'textarea', placeholder: 'Si tienes un guión o idea general, compártela aquí...' },
            ],
            3: [
                { label: '¿Dónde se publicará el video?', name: 'videoDistribution', type: 'textarea', placeholder: 'Ej: YouTube, redes sociales, TV, sitio web, presentaciones...' },
                { label: '¿Necesitas música original o licenciada?', name: 'musicNeeds', type: 'select', placeholder: 'Selecciona', options: ['Música de stock está bien', 'Necesito música original', 'Ya tengo música', 'Lo dejo a su criterio'] },
            ],
        },
        deliverables: ['Video final', 'Versiones cortas', 'Subtítulos', 'Archivos originales', 'Música licenciada', 'Optimización para redes'],
    },
    SOCIAL_MEDIA: {
        icon: Share2,
        color: 'from-pink-500 to-rose-500',
        steps: [
            { id: 1, title: 'Objetivos', icon: Target },
            { id: 2, title: 'Plataformas', icon: Share2 },
            { id: 3, title: 'Contenido', icon: FileText },
            { id: 4, title: 'Archivos', icon: Upload },
            { id: 5, title: 'Resumen', icon: Clipboard },
        ],
        fields: {
            1: [
                { label: '¿Cuál es tu objetivo principal en redes?', name: 'socialGoal', type: 'select', placeholder: 'Selecciona', options: ['Aumentar seguidores', 'Generar engagement', 'Tráfico al sitio web', 'Ventas directas', 'Awareness de marca', 'Servicio al cliente'] },
                { label: '¿Tienes presencia actual en redes?', name: 'currentPresence', type: 'textarea', placeholder: 'Comparte tus @handles y número de seguidores actuales...' },
                { label: '¿Con qué frecuencia publicas actualmente?', name: 'postFrequency', type: 'select', placeholder: 'Selecciona', options: ['No publico', 'Esporádicamente', '1-2 veces por semana', '3-5 veces por semana', 'Diariamente'] },
            ],
            2: [
                { label: '¿En qué plataformas quieres enfocarte?', name: 'platforms', type: 'textarea', placeholder: 'Ej: Instagram, Facebook, TikTok, LinkedIn, Twitter, YouTube...' },
                { label: '¿Cuántas publicaciones al mes necesitas?', name: 'postsPerMonth', type: 'select', placeholder: 'Selecciona', options: ['8-12 posts', '12-20 posts', '20-30 posts', '30+ posts'] },
            ],
            3: [
                { label: '¿Qué tipo de contenido te interesa?', name: 'contentType', type: 'textarea', placeholder: 'Ej: Fotos de producto, videos, carruseles, stories, reels...' },
                { label: '¿Necesitas que gestionemos las cuentas?', name: 'communityManagement', type: 'select', placeholder: 'Selecciona', options: ['Solo necesito el contenido', 'Sí, gestión completa', 'Gestión parcial (solo publicar)'] },
            ],
        },
        deliverables: ['Estrategia de contenido', 'Calendario editorial', 'Diseños para posts', 'Copies/textos', 'Hashtag research', 'Stories/Reels', 'Reportes mensuales'],
    },
    PACKAGING: {
        icon: Package,
        color: 'from-emerald-500 to-teal-500',
        steps: [
            { id: 1, title: 'Producto', icon: Package },
            { id: 2, title: 'Diseño', icon: Palette },
            { id: 3, title: 'Detalles', icon: FileText },
            { id: 4, title: 'Archivos', icon: Upload },
            { id: 5, title: 'Resumen', icon: Clipboard },
        ],
        fields: {
            1: [
                { label: '¿Qué producto vas a empacar?', name: 'productDescription', type: 'textarea', placeholder: 'Describe el producto físico, su tamaño, peso, etc.' },
                { label: '¿Es un producto nuevo o rediseño?', name: 'isRedesign', type: 'select', placeholder: 'Selecciona', options: ['Producto nuevo', 'Rediseño de packaging existente'] },
                { label: '¿Dónde se venderá el producto?', name: 'salesChannel', type: 'textarea', placeholder: 'Ej: Supermercados, tienda online, boutiques, exportación...' },
            ],
            2: [
                { label: '¿Tienes imagen de marca ya definida?', name: 'brandIdentity', type: 'select', placeholder: 'Selecciona', options: ['Sí, tengo manual de identidad', 'Tengo logo pero no manual', 'No tengo nada aún'] },
                { label: '¿Qué estilo visual buscas?', name: 'visualStyle', type: 'select', placeholder: 'Selecciona', options: ['Minimalista', 'Colorido y llamativo', 'Premium/Elegante', 'Orgánico/Natural', 'Moderno/Geométrico', 'Vintage/Retro'] },
                { label: '¿Hay referencias de packaging que te gusten?', name: 'packagingReferences', type: 'textarea', placeholder: 'Describe o comparte links de packagings que admires...' },
            ],
            3: [
                { label: '¿Tienes restricciones de material?', name: 'materialRestrictions', type: 'textarea', placeholder: 'Ej: Solo materiales reciclables, presupuesto limitado, etc.' },
                { label: '¿Qué información debe incluir?', name: 'requiredInfo', type: 'textarea', placeholder: 'Ej: Ingredientes, instrucciones, certificaciones, código de barras...' },
            ],
        },
        deliverables: ['Diseño de empaque', 'Artes finales', 'Mockups 3D', 'Guía de producción', 'Etiquetas', 'Caja de envío'],
    },
    OTHER: {
        icon: FileText,
        color: 'from-gray-500 to-slate-500',
        steps: [
            { id: 1, title: 'Descripción', icon: FileText },
            { id: 2, title: 'Detalles', icon: Package },
            { id: 3, title: 'Archivos', icon: Upload },
            { id: 4, title: 'Resumen', icon: Clipboard },
        ],
        fields: {
            1: [
                { label: '¿Qué tipo de proyecto necesitas?', name: 'projectDescription', type: 'textarea', placeholder: 'Describe detalladamente qué necesitas...' },
                { label: '¿Cuál es el objetivo principal?', name: 'projectGoals', type: 'textarea', placeholder: 'Qué esperas lograr con este proyecto...' },
            ],
            2: [
                { label: '¿Tienes referencias o ejemplos?', name: 'references', type: 'textarea', placeholder: 'Links o descripciones de trabajos similares que te gusten...' },
                { label: '¿Hay restricciones o consideraciones especiales?', name: 'restrictions', type: 'textarea', placeholder: 'Cualquier limitación o requerimiento especial...' },
            ],
        },
        deliverables: ['Según proyecto'],
    },
};

const BUDGETS = [
    { value: 'less-1k', label: 'Menos de $1,000 USD' },
    { value: '1k-5k', label: '$1,000 - $5,000 USD' },
    { value: '5k-10k', label: '$5,000 - $10,000 USD' },
    { value: '10k-25k', label: '$10,000 - $25,000 USD' },
    { value: 'more-25k', label: 'Más de $25,000 USD' },
];

export default function ClientBriefWizard() {
    const { projectId } = useParams<{ projectId: string }>();
    const navigate = useNavigate();
    const { agency } = useAuthStore();
    const [step, setStep] = useState(1);
    const [project, setProject] = useState<any>(null);
    const [brief, setBrief] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [selectedDeliverables, setSelectedDeliverables] = useState<string[]>([]);
    const [files, setFiles] = useState<File[]>([]);

    const { register, watch, setValue, getValues } = useForm();

    useEffect(() => {
        if (projectId) loadProject();
    }, [projectId]);

    const loadProject = async () => {
        try {
            const response = await projectsApi.getOne(projectId!);
            setProject(response.data);

            if (response.data.brief) {
                setBrief(response.data.brief);
                Object.keys(response.data.brief).forEach((key) => {
                    if (response.data.brief[key]) {
                        setValue(key as any, response.data.brief[key]);
                    }
                });
                if (response.data.brief.deliverables) {
                    setSelectedDeliverables(response.data.brief.deliverables.split(', '));
                }
            }
        } catch (error) {
            console.error('Error loading project:', error);
            navigate('/dashboard');
        } finally {
            setLoading(false);
        }
    };

    const getConfig = () => {
        const type = project?.type || 'OTHER';
        return PROJECT_TYPE_CONFIG[type] || PROJECT_TYPE_CONFIG.OTHER;
    };

    // Helper to map dynamic wizard fields to DB schema fields
    const mapFormDataToBrief = (data: any, type: string) => {
        const mapped: any = { ...data };

        // Common mappings
        if (data.budget) mapped.budget = data.budget;
        if (data.timeline) mapped.timeline = data.timeline;
        if (data.deliverables) mapped.deliverables = Array.isArray(data.deliverables) ? data.deliverables.join(', ') : data.deliverables;
        if (data.additionalNotes) mapped.additionalNotes = data.additionalNotes;

        // Type specific mappings
        switch (type) {
            case 'BRANDING':
                if (data.brandName) mapped.projectName = data.brandName;

                // Merge description fields into projectGoals
                const goalsParts = [];
                if (data.businessDescription) goalsParts.push(`--- A qué se dedica ---\n${data.businessDescription}`);
                if (data.mission) goalsParts.push(`--- Misión ---\n${data.mission}`);
                if (data.vision) goalsParts.push(`--- Visión ---\n${data.vision}`);
                if (goalsParts.length) mapped.projectGoals = goalsParts.join('\n\n');

                // Merge tone fields
                const toneParts = [];
                if (data.brandPersonality) toneParts.push(`Personalidad: ${data.brandPersonality}`);
                if (data.brandValues) toneParts.push(`Valores: ${data.brandValues}`);
                if (data.desiredEmotion) toneParts.push(`Emoción deseada: ${data.desiredEmotion}`);
                if (toneParts.length) mapped.communicationTone = toneParts.join('\n\n');

                // Merge competitors
                const compParts = [];
                if (data.competitors) compParts.push(`--- Competencia ---\n${data.competitors}`);
                if (data.differentiator) compParts.push(`--- Diferenciador ---\n${data.differentiator}`);
                if (data.brandInspiration) compParts.push(`--- Inspiración ---\n${data.brandInspiration}`);
                if (compParts.length) mapped.competitors = compParts.join('\n\n');
                break;

            case 'WEB_DESIGN':
                // Goals
                const webGoals = [];
                if (data.websiteGoal) webGoals.push(`Objetivo Ppal: ${data.websiteGoal}`);
                if (data.goalDetails) webGoals.push(`Detalles: ${data.goalDetails}`);
                if (data.currentWebsite) webGoals.push(`Sitio Actual: ${data.currentWebsite}`);
                if (webGoals.length) mapped.projectGoals = webGoals.join('\n\n');

                // Content & Specs -> Key Message (using as specs container)
                const specs = [];
                if (data.websitePages) specs.push(`--- Secciones ---\n${data.websitePages}`);
                if (data.contentReady) specs.push(`Contenido: ${data.contentReady}`);
                if (data.specialFeatures) specs.push(`--- Funcionalidades ---\n${data.specialFeatures}`);
                if (data.integrations) specs.push(`--- Integraciones ---\n${data.integrations}`);
                if (specs.length) mapped.keyMessage = specs.join('\n\n');

                // Tech specs -> Brand Guidelines (using as tech container)
                const tech = [];
                if (data.siteAdmin) tech.push(`Admin: ${data.siteAdmin}`);
                if (data.platformPreference) tech.push(`Plataforma: ${data.platformPreference}`);
                if (tech.length) mapped.brandGuidelines = tech.join('\n\n');

                // References
                const refs = [];
                if (data.websiteReferences) refs.push(`--- Referencias ---\n${data.websiteReferences}`);
                if (data.websiteDislikes) refs.push(`--- NO gusta ---\n${data.websiteDislikes}`);
                if (refs.length) mapped.competitors = refs.join('\n\n');
                break;

            case 'ADVERTISING_CAMPAIGN':
                if (data.campaignGoal) mapped.projectGoals = `Objetivo: ${data.campaignGoal}\n\nProducto: ${data.productService || ''}\nDuración: ${data.campaignDuration || ''}`;
                if (data.targetAudience) mapped.targetAudience = data.targetAudience + (data.audiencePain ? `\n\nPain Point: ${data.audiencePain}` : '');
                if (data.keyMessage) mapped.keyMessage = data.keyMessage + (data.tagline ? `\n\nTagline: ${data.tagline}` : '') + (data.callToAction ? `\nCTA: ${data.callToAction}` : '');
                if (data.adChannels) mapped.communicationTone = `Canales: ${data.adChannels}\nMedia Budget: ${data.mediaBudget || ''}`;
                break;

            case 'VIDEO_PRODUCTION': {
                const videoGoals = [];
                if (data.videoType) videoGoals.push(`Tipo de Video: ${data.videoType}`);
                if (data.videoGoal) videoGoals.push(`Objetivo: ${data.videoGoal}`);
                if (data.videoDuration) videoGoals.push(`Duración: ${data.videoDuration}`);
                if (videoGoals.length) mapped.projectGoals = videoGoals.join('\n\n');

                const videoProd = [];
                if (data.location) videoProd.push(`Ubicación: ${data.location}`);
                if (data.talent) videoProd.push(`Talento: ${data.talent}`);
                if (data.script) videoProd.push(`--- Guión/Idea ---\n${data.script}`);
                if (videoProd.length) mapped.keyMessage = videoProd.join('\n\n');

                const videoDist = [];
                if (data.videoDistribution) videoDist.push(`Distribución: ${data.videoDistribution}`);
                if (data.musicNeeds) videoDist.push(`Música: ${data.musicNeeds}`);
                if (videoDist.length) mapped.communicationTone = videoDist.join('\n\n');
                break;
            }

            case 'SOCIAL_MEDIA': {
                const socialGoals = [];
                if (data.socialGoal) socialGoals.push(`Objetivo: ${data.socialGoal}`);
                if (data.currentPresence) socialGoals.push(`--- Presencia Actual ---\n${data.currentPresence}`);
                if (data.postFrequency) socialGoals.push(`Frecuencia actual: ${data.postFrequency}`);
                if (socialGoals.length) mapped.projectGoals = socialGoals.join('\n\n');

                const socialPlatforms = [];
                if (data.platforms) socialPlatforms.push(`Plataformas: ${data.platforms}`);
                if (data.postsPerMonth) socialPlatforms.push(`Posts/Mes: ${data.postsPerMonth}`);
                if (socialPlatforms.length) mapped.targetAudience = socialPlatforms.join('\n\n');

                const socialContent = [];
                if (data.contentType) socialContent.push(`Tipo de Contenido: ${data.contentType}`);
                if (data.communityManagement) socialContent.push(`Gestión: ${data.communityManagement}`);
                if (socialContent.length) mapped.keyMessage = socialContent.join('\n\n');
                break;
            }

            case 'PACKAGING': {
                const packGoals = [];
                if (data.productDescription) packGoals.push(`--- Producto ---\n${data.productDescription}`);
                if (data.isRedesign) packGoals.push(`Tipo: ${data.isRedesign}`);
                if (data.salesChannel) packGoals.push(`--- Canal de Venta ---\n${data.salesChannel}`);
                if (packGoals.length) mapped.projectGoals = packGoals.join('\n\n');

                const packDesign = [];
                if (data.brandIdentity) packDesign.push(`Identidad de Marca: ${data.brandIdentity}`);
                if (data.visualStyle) packDesign.push(`Estilo Visual: ${data.visualStyle}`);
                if (data.packagingReferences) packDesign.push(`--- Referencias ---\n${data.packagingReferences}`);
                if (packDesign.length) mapped.communicationTone = packDesign.join('\n\n');

                const packDetails = [];
                if (data.materialRestrictions) packDetails.push(`--- Materiales ---\n${data.materialRestrictions}`);
                if (data.requiredInfo) packDetails.push(`--- Info Requerida ---\n${data.requiredInfo}`);
                if (packDetails.length) mapped.keyMessage = packDetails.join('\n\n');
                break;
            }

            case 'OTHER':
            default: {
                // For OTHER and unknown types: capture all fields
                const otherGoals = [];
                if (data.projectDescription) otherGoals.push(`--- Descripción ---\n${data.projectDescription}`);
                if (data.projectGoals) otherGoals.push(`--- Objetivos ---\n${data.projectGoals}`);
                if (otherGoals.length) mapped.projectGoals = otherGoals.join('\n\n');

                if (data.references) mapped.competitors = `--- Referencias ---\n${data.references}`;
                if (data.restrictions) mapped.keyMessage = `--- Restricciones ---\n${data.restrictions}`;
                break;
            }
        }

        return mapped;
    };

    const saveBrief = async () => {
        if (!brief?.id) return;
        setSaving(true);
        try {
            const data = getValues();
            // In a real app, we would upload files here and get URLs
            // For now, we'll append file names to additional notes
            const filesNote = files.length > 0 ? `\n\nArchivos adjuntos: ${files.map(f => f.name).join(', ')}` : '';

            // Map wizard data into DB schema
            const mappedData = mapFormDataToBrief(data, project?.type);

            await briefsApi.update(brief.id, {
                ...mappedData,
                deliverables: selectedDeliverables.join(', '),
                additionalNotes: (data.additionalNotes || '') + filesNote,
            });
        } catch (error) {
            console.error('Error saving brief:', error);
        } finally {
            setSaving(false);
        }
    };

    const nextStep = async () => {
        await saveBrief();
        setStep(Math.min(step + 1, getConfig().steps.length));
    };

    const prevStep = () => {
        setStep(Math.max(step - 1, 1));
    };

    const submitBrief = async () => {
        if (!brief?.id) return;
        setSubmitting(true);
        try {
            await saveBrief();
            await briefsApi.submit(brief.id);
            navigate('/dashboard');
        } catch (error) {
            console.error('Error submitting brief:', error);
        } finally {
            setSubmitting(false);
        }
    };

    const toggleDeliverable = (item: string) => {
        setSelectedDeliverables((prev) =>
            prev.includes(item) ? prev.filter((d) => d !== item) : [...prev, item]
        );
    };

    const handleFileDrop = (e: React.DragEvent) => {
        e.preventDefault();
        const droppedFiles = Array.from(e.dataTransfer.files);
        setFiles(prev => [...prev, ...droppedFiles]);
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const selectedFiles = Array.from(e.target.files);
            setFiles(prev => [...prev, ...selectedFiles]);
        }
    };

    const removeFile = (index: number) => {
        setFiles(prev => prev.filter((_, i) => i !== index));
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-amber-50/30 flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
                    <p className="text-gray-500">Cargando...</p>
                </div>
            </div>
        );
    }

    const config = getConfig();
    const progress = (step / config.steps.length) * 100;
    const Icon = config.icon;
    const isLastStep = step === config.steps.length;
    const currentStepConfig = config.steps[step - 1];
    const isFilesStep = currentStepConfig?.title === 'Archivos';
    const isDeliverablesStep = currentStepConfig?.title === 'Entregables';

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-amber-50/30">
            {/* Header */}
            <header className="bg-white/80 backdrop-blur-xl border-b border-gray-100 sticky top-0 z-10">
                <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
                    <Link to="/dashboard" className="flex items-center gap-3">
                        <img src="/logo.png" alt="BriefFlow" className="w-8 h-8 rounded-lg" />
                        <span className="font-bold text-gray-900">{agency?.name}</span>
                    </Link>

                    <div className="text-sm text-gray-500 flex items-center gap-2">
                        {saving && <span className="text-blue-600 animate-pulse">Guardando...</span>}
                        <span>Paso {step} de {config.steps.length}</span>
                    </div>
                </div>
            </header>

            <main className="max-w-4xl mx-auto px-4 py-8">
                {/* Progress Bar */}
                <div className="mb-8">
                    <Progress value={progress} className="h-2" />

                    {/* Step Indicators */}
                    <div className="flex justify-between mt-4">
                        {config.steps.map((s) => {
                            const StepIcon = s.icon;
                            let stepColor = 'text-gray-400';
                            let iconBg = 'bg-gray-100';
                            let iconText = 'text-gray-400';

                            if (step > s.id) {
                                stepColor = 'text-blue-600';
                                iconBg = 'bg-blue-600';
                                iconText = 'text-white';
                            } else if (step === s.id) {
                                stepColor = 'text-blue-600';
                                iconBg = 'bg-blue-100 ring-2 ring-blue-600';
                                iconText = 'text-blue-600';
                            }

                            return (
                                <div
                                    key={s.id}
                                    className={`flex flex-col items-center ${stepColor}`}
                                >
                                    <div
                                        className={`w-10 h-10 rounded-full flex items-center justify-center mb-1 transition-all ${iconBg} ${iconText}`}
                                    >
                                        {step > s.id ? <Check className="w-5 h-5" /> : <StepIcon className="w-5 h-5" />}
                                    </div>
                                    <span className="text-xs hidden md:block">{s.title}</span>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Project Title */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gray-100 mb-4">
                        <div className={`w-6 h-6 rounded-lg bg-gradient-to-br ${config.color} flex items-center justify-center text-white`}>
                            <Icon className="w-4 h-4" />
                        </div>
                        <span className="text-sm font-medium text-gray-700">{project?.type?.replace(/_/g, ' ')}</span>
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900">Brief: {project?.name}</h1>
                    <p className="text-gray-500 mt-1">Completa la información para iniciar tu proyecto</p>
                </div>

                {/* Form Card */}
                <Card className="animate-fade-in">
                    {/* Sections Header */}
                    <CardHeader>
                        <CardTitle>{currentStepConfig?.title}</CardTitle>
                        <CardDescription>
                            {isFilesStep
                                ? 'Comparte referencias visuales, manuales de marca o documentos importantes'
                                : isDeliverablesStep
                                    ? 'Selecciona qué necesitas y define tu presupuesto'
                                    : isLastStep
                                        ? 'Revisa la información antes de enviar'
                                        : 'Completa la información de esta sección'}
                        </CardDescription>
                    </CardHeader>

                    <CardContent className="space-y-6">
                        {/* Dynamic Fields */}
                        {!isLastStep && !isDeliverablesStep && !isFilesStep && config.fields[step] && (
                            <>
                                {config.fields[step].map((field) => (
                                    <div key={field.name}>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            {field.label}
                                        </label>
                                        {field.type === 'input' && (
                                            <Input
                                                {...register(field.name)}
                                                placeholder={field.placeholder}
                                            />
                                        )}
                                        {field.type === 'textarea' && (
                                            <Textarea
                                                {...register(field.name)}
                                                placeholder={field.placeholder}
                                                className="min-h-[120px]"
                                            />
                                        )}
                                        {field.type === 'select' && field.options && (
                                            <Select
                                                value={watch(field.name)}
                                                onValueChange={(v) => setValue(field.name, v)}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder={field.placeholder} />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {field.options.map((opt) => (
                                                        <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        )}
                                    </div>
                                ))}
                            </>
                        )}

                        {/* Files Upload Step */}
                        {isFilesStep && (
                            <div className="space-y-6">
                                <div
                                    onDragOver={(e) => e.preventDefault()}
                                    onDrop={handleFileDrop}
                                    className="border-2 border-dashed border-gray-200 rounded-2xl p-8 text-center hover:bg-gray-50 transition-colors cursor-pointer relative"
                                >
                                    <input
                                        type="file"
                                        multiple
                                        onChange={handleFileSelect}
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                    />
                                    <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <Upload className="w-8 h-8 text-blue-500" />
                                    </div>
                                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                        Arrastra tus archivos aquí
                                    </h3>
                                    <p className="text-gray-500 text-sm max-w-sm mx-auto mb-4">
                                        Sube imágenes de referencia, manuales de marca (PDF), logos (SVG, PNG) o cualquier documento relevante.
                                    </p>
                                    <Button variant="outline" type="button">
                                        Explorar archivos
                                    </Button>
                                </div>

                                {files.length > 0 && (
                                    <div className="space-y-3">
                                        <h4 className="font-medium text-gray-900">Archivos seleccionados ({files.length})</h4>
                                        {files.map((file, index) => (
                                            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100">
                                                <div className="flex items-center gap-3 overflow-hidden">
                                                    <div className="w-10 h-10 rounded-lg bg-white border border-gray-200 flex items-center justify-center flex-shrink-0">
                                                        {file.type.startsWith('image/') ? (
                                                            <ImageIcon className="w-5 h-5 text-purple-500" />
                                                        ) : (
                                                            <File className="w-5 h-5 text-blue-500" />
                                                        )}
                                                    </div>
                                                    <div className="min-w-0">
                                                        <p className="text-sm font-medium text-gray-900 truncate">{file.name}</p>
                                                        <p className="text-xs text-gray-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                                                    </div>
                                                </div>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => removeFile(index)}
                                                    className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                                >
                                                    <X className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                <div className="p-4 bg-amber-50 rounded-xl border border-amber-100 text-sm text-amber-800">
                                    <p className="flex items-center gap-2 font-medium mb-1">
                                        <FileText className="w-4 h-4" /> Note sobre privacidad
                                    </p>
                                    Tus archivos serán compartidos de forma segura con la agencia y solo se usarán para fines de este proyecto.
                                </div>
                            </div>
                        )}

                        {/* Deliverables Step */}
                        {isDeliverablesStep && (
                            <>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-3">
                                        ¿Qué entregables necesitas?
                                    </label>
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                        {config.deliverables.map((item) => (
                                            <button
                                                key={item}
                                                type="button"
                                                onClick={() => toggleDeliverable(item)}
                                                className={`p-3 rounded-xl border text-sm font-medium transition-all text-left ${selectedDeliverables.includes(item)
                                                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                                                    : 'border-gray-200 hover:border-gray-300 text-gray-700'
                                                    }`}
                                            >
                                                {selectedDeliverables.includes(item) && (
                                                    <Check className="w-4 h-4 inline mr-2" />
                                                )}
                                                {item}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Presupuesto estimado
                                    </label>
                                    <Select
                                        value={watch('budget')}
                                        onValueChange={(v) => setValue('budget', v)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Selecciona un rango" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {BUDGETS.map((b) => (
                                                <SelectItem key={b.value} value={b.label}>
                                                    {b.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Timeline deseado
                                    </label>
                                    <Input
                                        {...register('timeline')}
                                        placeholder="Ej: 4 semanas, 2 meses..."
                                    />
                                </div>
                            </>
                        )}

                        {/* Summary Step */}
                        {isLastStep && (
                            <>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Notas adicionales (opcional)
                                    </label>
                                    <Textarea
                                        {...register('additionalNotes')}
                                        placeholder="¿Hay algo más que debamos saber?"
                                        className="min-h-[100px]"
                                    />
                                </div>

                                {files.length > 0 && (
                                    <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                                        <p className="text-sm font-medium text-gray-900 mb-3 flex items-center gap-2">
                                            <Upload className="w-4 h-4" /> Archivos adjuntos
                                        </p>
                                        <div className="flex flex-wrap gap-2">
                                            {files.map((f, i) => (
                                                <div key={i} className="flex items-center gap-2 px-3 py-1.5 bg-white rounded-lg border border-gray-200 text-sm text-gray-600">
                                                    <File className="w-3 h-3" />
                                                    {f.name}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {selectedDeliverables.length > 0 && (
                                    <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
                                        <p className="text-sm font-medium text-blue-800 mb-2">Entregables seleccionados</p>
                                        <div className="flex flex-wrap gap-2">
                                            {selectedDeliverables.map((d) => (
                                                <span
                                                    key={d}
                                                    className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm"
                                                >
                                                    {d}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {watch('budget') && (
                                    <div className="p-4 bg-amber-50 rounded-xl border border-amber-100">
                                        <p className="text-sm font-medium text-amber-800">Presupuesto: {watch('budget')}</p>
                                    </div>
                                )}
                            </>
                        )}
                    </CardContent>

                    {/* Navigation */}
                    <div className="flex justify-between p-6 border-t border-gray-100">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={prevStep}
                            disabled={step === 1}
                        >
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Anterior
                        </Button>

                        {!isLastStep ? (
                            <Button type="button" onClick={nextStep}>
                                Siguiente
                                <ArrowRight className="w-4 h-4 ml-2" />
                            </Button>
                        ) : (
                            <Button onClick={submitBrief} loading={submitting}>
                                <Send className="w-4 h-4 mr-2" />
                                Enviar Brief
                            </Button>
                        )}
                    </div>
                </Card>
            </main>
        </div>
    );
}
