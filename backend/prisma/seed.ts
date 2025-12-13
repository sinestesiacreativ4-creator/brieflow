import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Seeding database...');

    // Clean existing data
    await prisma.notification.deleteMany();
    await prisma.message.deleteMany();
    await prisma.projectFile.deleteMany();
    await prisma.brief.deleteMany();
    await prisma.project.deleteMany();
    await prisma.client.deleteMany();
    await prisma.user.deleteMany();
    await prisma.agency.deleteMany();

    // Create demo agency
    const agency = await prisma.agency.create({
        data: {
            name: 'Creative Studio',
            subdomain: 'creative-studio',
            primaryColor: '#6366f1',
        }
    });

    console.log('✓ Created agency:', agency.name);

    // Create admin user
    const hashedPassword = await bcrypt.hash('password123', 10);

    const admin = await prisma.user.create({
        data: {
            email: 'admin@creativestudio.com',
            password: hashedPassword,
            name: 'María García',
            role: 'AGENCY_ADMIN',
            agencyId: agency.id,
        }
    });

    console.log('✓ Created admin user:', admin.email);

    // Create team member
    const member = await prisma.user.create({
        data: {
            email: 'carlos@creativestudio.com',
            password: hashedPassword,
            name: 'Carlos Rodríguez',
            role: 'AGENCY_MEMBER',
            agencyId: agency.id,
        }
    });

    console.log('✓ Created team member:', member.email);

    // Create demo clients
    const client1 = await prisma.client.create({
        data: {
            email: 'cliente@empresa.com',
            password: hashedPassword,
            name: 'Juan Pérez',
            company: 'TechCorp',
            phone: '+1 234 567 890',
            agencyId: agency.id,
        }
    });

    const client2 = await prisma.client.create({
        data: {
            email: 'laura@startup.com',
            password: hashedPassword,
            name: 'Laura Martínez',
            company: 'Startup Labs',
            phone: '+1 987 654 321',
            agencyId: agency.id,
        }
    });

    console.log('✓ Created demo clients');

    // Create projects with briefs
    const project1 = await prisma.project.create({
        data: {
            name: 'Rebranding TechCorp 2024',
            type: 'BRANDING',
            status: 'BRIEF_PENDING',
            agencyId: agency.id,
            clientId: client1.id,
            assignedToId: member.id,
        }
    });

    await prisma.brief.create({
        data: {
            projectId: project1.id,
            agencyId: agency.id,
            projectName: 'Rebranding TechCorp 2024',
        }
    });

    const project2 = await prisma.project.create({
        data: {
            name: 'Website Startup Labs',
            type: 'WEB_DESIGN',
            status: 'BRIEF_IN_REVIEW',
            agencyId: agency.id,
            clientId: client2.id,
            assignedToId: admin.id,
        }
    });

    await prisma.brief.create({
        data: {
            projectId: project2.id,
            agencyId: agency.id,
            projectName: 'Website Startup Labs',
            projectGoals: 'Crear un sitio web moderno que refleje la innovación de nuestra empresa y atraiga inversionistas.',
            targetAudience: 'Inversionistas y empresas de tecnología interesadas en partnerships.',
            audienceAge: '30-55 años',
            audienceGender: 'Mixto',
            audienceLocation: 'Estados Unidos, Europa',
            keyMessage: 'Innovación que transforma el futuro',
            communicationTone: 'Profesional pero accesible',
            competitors: 'Stripe, Square, Plaid',
            budget: '$10,000 - $20,000 USD',
            timeline: '2 meses',
            deliverables: 'Diseño UI/UX, Desarrollo Frontend, Integración CMS',
            completedAt: new Date(),
        }
    });

    const project3 = await prisma.project.create({
        data: {
            name: 'Campaña Redes Sociales',
            type: 'SOCIAL_MEDIA',
            status: 'IN_PRODUCTION',
            agencyId: agency.id,
            clientId: client1.id,
            assignedToId: member.id,
        }
    });

    await prisma.brief.create({
        data: {
            projectId: project3.id,
            agencyId: agency.id,
            projectName: 'Campaña Redes Sociales Q1 2024',
            projectGoals: 'Aumentar engagement en redes sociales y generar leads.',
            targetAudience: 'Millennials interesados en tecnología',
            keyMessage: 'Tecnología accesible para todos',
            communicationTone: 'Juvenil y dinámico',
            budget: '$5,000 USD',
            timeline: '3 meses',
            deliverables: 'Contenido para Instagram, Twitter y LinkedIn',
            completedAt: new Date(),
        }
    });

    console.log('✓ Created demo projects with briefs');

    // Create some messages
    await prisma.message.createMany({
        data: [
            {
                content: '¡Hola! Bienvenido al proyecto. Aquí podremos comunicarnos sobre cualquier duda.',
                projectId: project2.id,
                senderId: admin.id,
            },
            {
                content: 'Gracias María. Ya completé el brief, ¿pueden revisarlo?',
                projectId: project2.id,
                senderId: member.id,
            },
            {
                content: 'Perfecto, lo revisamos esta semana y te damos feedback.',
                projectId: project2.id,
                senderId: admin.id,
            }
        ]
    });

    console.log('✓ Created demo messages');

    // Create notifications
    await prisma.notification.createMany({
        data: [
            {
                type: 'BRIEF_COMPLETED',
                title: 'Brief completado',
                message: 'Laura Martínez ha completado el brief para "Website Startup Labs"',
                userId: admin.id,
                agencyId: agency.id,
                projectId: project2.id,
            },
            {
                type: 'NEW_PROJECT',
                title: 'Nuevo proyecto asignado',
                message: 'Se te ha asignado el proyecto "Rebranding TechCorp 2024"',
                userId: member.id,
                agencyId: agency.id,
                projectId: project1.id,
            }
        ]
    });

    console.log('✓ Created demo notifications');

    console.log('\n🎉 Database seeded successfully!\n');
    console.log('📧 Demo Credentials:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('Agency Admin:  admin@creativestudio.com / password123');
    console.log('Team Member:   carlos@creativestudio.com / password123');
    console.log('Client:        cliente@empresa.com / password123');
    console.log('Client:        laura@startup.com / password123');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
}

main()
    .catch((e) => {
        console.error('Error seeding database:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
