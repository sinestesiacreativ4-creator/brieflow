import webpush from 'web-push';
import prisma from '../lib/prisma';

// VAPID Keys - should be in .env in production
const publicVapidKey = 'BCYxdq1SfQ80HIzkKNBPjRdy3eomYuskIuOGVKVLIXRmzGlnBH921b5vBAHndKlxbXb6buHO0BdCZFOmpA8g_W4';
const privateVapidKey = 'Bli-9U_7n31DH50WExuWYxUdd17m3duyFL13ojruzsk';

webpush.setVapidDetails(
    'mailto:notifications@briefflow.com',
    publicVapidKey,
    privateVapidKey
);

console.log('✅ Push notification service initialized');

export const pushService = {
    getPublicKey: () => publicVapidKey,

    saveSubscription: async (userId: string, subscription: any) => {
        console.log(`[Push] Saving subscription for user: ${userId}`);
        console.log(`[Push] Endpoint: ${subscription.endpoint?.slice(0, 60)}...`);

        // Check if subscription already exists for this endpoint
        const existing = await prisma.pushSubscription.findFirst({
            where: {
                userId,
                endpoint: subscription.endpoint
            }
        });

        if (existing) {
            console.log('[Push] Subscription already exists, updating...');
            return prisma.pushSubscription.update({
                where: { id: existing.id },
                data: {
                    p256dh: subscription.keys.p256dh,
                    auth: subscription.keys.auth,
                }
            });
        }

        // Create new subscription
        const created = await prisma.pushSubscription.create({
            data: {
                userId,
                endpoint: subscription.endpoint,
                p256dh: subscription.keys.p256dh,
                auth: subscription.keys.auth,
            },
        });

        console.log(`[Push] New subscription created: ${created.id}`);
        return created;
    },

    sendNotification: async (userId: string, payload: { title: string; body: string; url?: string; tag?: string }) => {
        console.log(`[Push] Sending notification to user: ${userId}`);
        console.log(`[Push] Payload:`, payload);

        const subscriptions = await prisma.pushSubscription.findMany({
            where: { userId },
        });

        console.log(`[Push] Found ${subscriptions.length} subscription(s) for user`);

        if (subscriptions.length === 0) {
            console.warn('[Push] No subscriptions found for user');
            return { sent: 0, failed: 0 };
        }

        let sent = 0;
        let failed = 0;

        const notifications = subscriptions.map(async (sub) => {
            const pushSubscription = {
                endpoint: sub.endpoint,
                keys: {
                    p256dh: sub.p256dh,
                    auth: sub.auth,
                },
            };

            try {
                console.log(`[Push] Sending to endpoint: ${sub.endpoint.slice(0, 50)}...`);

                await webpush.sendNotification(
                    pushSubscription,
                    JSON.stringify({
                        ...payload,
                        tag: payload.tag || `notification-${Date.now()}`,
                        timestamp: Date.now()
                    })
                );

                console.log(`[Push] ✅ Successfully sent to subscription ${sub.id}`);
                sent++;
            } catch (error: any) {
                console.error(`[Push] ❌ Error sending to subscription ${sub.id}:`, error.message);
                failed++;

                // Remove invalid subscriptions (410 Gone, 404 Not Found)
                if (error.statusCode === 410 || error.statusCode === 404) {
                    console.log(`[Push] Removing invalid subscription ${sub.id}`);
                    await prisma.pushSubscription.delete({
                        where: { id: sub.id }
                    }).catch(console.error);
                }
            }
        });

        await Promise.all(notifications);

        console.log(`[Push] Notification summary: ${sent} sent, ${failed} failed`);
        return { sent, failed };
    },

    // Send to all users in an agency
    sendToAgency: async (agencyId: string, payload: { title: string; body: string; url?: string }) => {
        console.log(`[Push] Broadcasting to agency: ${agencyId}`);

        const users = await prisma.user.findMany({
            where: { agencyId },
            select: { id: true }
        });

        let totalSent = 0;
        let totalFailed = 0;

        for (const user of users) {
            const result = await pushService.sendNotification(user.id, payload);
            totalSent += result.sent;
            totalFailed += result.failed;
        }

        console.log(`[Push] Agency broadcast complete: ${totalSent} sent, ${totalFailed} failed`);
        return { sent: totalSent, failed: totalFailed };
    }
};

