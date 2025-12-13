import { Client } from '@notionhq/client';

const notion = new Client({
    auth: process.env.NOTION_API_KEY,
});

export const createNotionProject = async (project: {
    name: string;
    description?: string;
    status: string;
    clientName: string;
    type: string;
}) => {
    if (!process.env.NOTION_API_KEY || !process.env.NOTION_DATABASE_ID) {
        console.warn('⚠️ Notion integration skipped: Missing API Key or Database ID');
        return null;
    }

    try {
        const response = await notion.pages.create({
            parent: {
                database_id: process.env.NOTION_DATABASE_ID,
            },
            properties: {
                Name: {
                    title: [
                        {
                            text: {
                                content: project.name,
                            },
                        },
                    ],
                },
                Status: {
                    select: {
                        name: project.status || 'Brief Pending',
                    },
                },
                Client: {
                    rich_text: [
                        {
                            text: {
                                content: project.clientName,
                            },
                        },
                    ],
                },
                Type: {
                    select: {
                        name: project.type,
                    },
                },
            },
            // Add content inside the page
            children: [
                {
                    object: 'block',
                    type: 'heading_2',
                    heading_2: {
                        rich_text: [
                            {
                                text: {
                                    content: 'Resumen del Proyecto',
                                },
                            },
                        ],
                    },
                },
                {
                    object: 'block',
                    type: 'paragraph',
                    paragraph: {
                        rich_text: [
                            {
                                text: {
                                    content: `Proyecto de tipo ${project.type} creado desde BriefFlow.`,
                                },
                            },
                        ],
                    },
                },
            ],
        });

        console.log(`✅ Project created in Notion: ${response.id}`);
        return (response as any).url; // Return the Notion URL
    } catch (error) {
        console.error('❌ Error creating page in Notion:', error);
        return null;
    }
};
