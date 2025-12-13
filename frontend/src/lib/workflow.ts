export const PROJECT_WORKFLOWS: Record<string, { id: string; label: string; color: string }[]> = {
    BRANDING: [
        { id: 'BRIEF_PENDING', label: 'Brief Pendiente', color: 'gray' },
        { id: 'CONCEPT', label: 'Concepto', color: 'blue' },
        { id: 'DESIGN', label: 'Diseño', color: 'purple' },
        { id: 'FEEDBACK', label: 'Feedback', color: 'amber' },
        { id: 'DELIVERY', label: 'Entrega Final', color: 'green' }
    ],
    WEB_DESIGN: [
        { id: 'BRIEF_PENDING', label: 'Brief', color: 'gray' },
        { id: 'WIREFRAME', label: 'Wireframe', color: 'blue' },
        { id: 'DESIGN', label: 'UI Design', color: 'purple' },
        { id: 'DEVELOPMENT', label: 'Desarrollo', color: 'indigo' },
        { id: 'QA', label: 'QA / Testing', color: 'orange' },
        { id: 'LAUNCH', label: 'Lanzamiento', color: 'green' }
    ],
    SOCIAL_MEDIA: [
        { id: 'BRIEF_PENDING', label: 'Planificación', color: 'gray' },
        { id: 'CREATION', label: 'Creación', color: 'blue' },
        { id: 'REVIEW', label: 'Revisión Cliente', color: 'amber' },
        { id: 'SCHEDULING', label: 'Programación', color: 'purple' },
        { id: 'PUBLISHED', label: 'Publicado', color: 'green' }
    ],
    DEFAULT: [
        { id: 'BRIEF_PENDING', label: 'Pendiente', color: 'gray' },
        { id: 'IN_PROGRESS', label: 'En Progreso', color: 'blue' },
        { id: 'IN_REVIEW', label: 'En Revisión', color: 'amber' },
        { id: 'COMPLETED', label: 'Completado', color: 'green' }
    ]
};

export function getWorkflowForType(type: string) {
    return PROJECT_WORKFLOWS[type] || PROJECT_WORKFLOWS.DEFAULT;
}
