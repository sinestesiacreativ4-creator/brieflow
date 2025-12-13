import webpush from 'web-push';
import prisma from '../lib/prisma';

// Hardcoded for demo/MVP, should be env vars in production
const publicVapidKey = 'BCYxdq1SfQ80HIzkKNBPjRdy3eomYuskIuOGVKVLIXRmzGlnBH921b5vBAHndKlxbXb6buHO0BdCZFOmpA8g_W4';
const privateVapidKey = 'Bli-9U_7n31DH50WExuWYxUdd17m3duyFL13ojruzsk';

webpush.setVapidDetails(
    'mailto:alexa@briefflow.com', // Fake email for VAPID ID
    publicVapidKey,
    privateVapidKey
);

export const pushService = {
    getPublicKey: () => publicVapidKey,

    saveSubscription: async (userId: string, subscription: any) => {
        return prisma.pushSubscription.create({
            data: {
                userId,
                endpoint: subscription.endpoint,
                p256dh: subscription.keys.p256dh,
                auth: subscription.keys.auth,
            },
        });
    },

    sendNotification: async (userId: string, payload: { title: string; body: string; url?: string }) => {
        const subscriptions = await prisma.pushSubscription.findMany({
            where: { userId },
        });

        const notifications = subscriptions.map((sub) => {
            const pushSubscription = {
                endpoint: sub.endpoint,
                keys: {
                    p256dh: sub.p256dh,
                    auth: sub.auth,
                },
            };

            return webpush
                .sendNotification(pushSubscription, JSON.stringify(payload))
                .catch((error) => {
                    console.error('Error sending push notification:', error);
                    if (error.statusCode === 410 || error.statusCode === 404) {
                        // Subscription is invalid/expired, delete from DB
                        prisma.pushSubscription.delete({ where: { id: sub.id } }).catch(console.error);
                    }
                });
        });

        await Promise.all(notifications);
    },
};
