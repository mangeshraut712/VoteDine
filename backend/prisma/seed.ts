import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Starting database seed...');

    // Clear existing data to avoid conflicts
    await prisma.vote.deleteMany();
    await prisma.roomRestaurant.deleteMany();
    await prisma.roomMember.deleteMany();
    await prisma.message.deleteMany();
    await (prisma as any).calendarEvent.deleteMany();
    await prisma.room.deleteMany();
    await prisma.restaurant.deleteMany();
    await (prisma as any).voiceSettings.deleteMany();
    // Do not delete users if you want to keep them, but for a clean seed it's better
    // await prisma.user.deleteMany();

    console.log('🗑️ Database cleared');

    // Create test users
    const users = await Promise.all([
        prisma.user.upsert({
            where: { username: 'alice' },
            update: {},
            create: {
                username: 'alice',
                password: '$2b$10$YourHashedPasswordHere',
            },
        }),
        prisma.user.upsert({
            where: { username: 'bob' },
            update: {},
            create: {
                username: 'bob',
                password: '$2b$10$YourHashedPasswordHere',
            },
        }),
        prisma.user.upsert({
            where: { username: 'charlie' },
            update: {},
            create: {
                username: 'charlie',
                password: '$2b$10$YourHashedPasswordHere',
            },
        }),
    ]);

    console.log(`✅ Created ${users.length} users`);

    // Create sample restaurants
    const restaurants = await Promise.all([
        prisma.restaurant.upsert({
            where: { name: 'Aurora Bistro' },
            update: {},
            create: {
                name: 'Aurora Bistro',
                yelpId: 'aurora-bistro-philly',
                imageUrl: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800',
                rating: 4.5,
                reviewCount: 342,
                price: '$$',
                cuisine: 'American',
                address: '123 Market St, Philadelphia, PA 19103',
                phone: '+1-215-555-0101',
                latitude: 39.9526,
                longitude: -75.1652,
            },
        }),
        prisma.restaurant.upsert({
            where: { name: 'Grove & Table' },
            update: {},
            create: {
                name: 'Grove & Table',
                yelpId: 'grove-and-table-philly',
                imageUrl: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800',
                rating: 4.3,
                reviewCount: 256,
                price: '$$',
                cuisine: 'Mediterranean',
                address: '456 Walnut St, Philadelphia, PA 19106',
                phone: '+1-215-555-0102',
                latitude: 39.9484,
                longitude: -75.1474,
            },
        }),
        prisma.restaurant.upsert({
            where: { name: 'Noodle Press' },
            update: {},
            create: {
                name: 'Noodle Press',
                yelpId: 'noodle-press-philly',
                imageUrl: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=800',
                rating: 4.6,
                reviewCount: 489,
                price: '$',
                cuisine: 'Asian',
                address: '789 Chestnut St, Philadelphia, PA 19107',
                phone: '+1-215-555-0103',
                latitude: 39.9496,
                longitude: -75.1503,
            },
        }),
        prisma.restaurant.upsert({
            where: { name: 'Saffron & Steam' },
            update: {},
            create: {
                name: 'Saffron & Steam',
                yelpId: 'saffron-steam-philly',
                imageUrl: 'https://images.unsplash.com/photo-1552566626-52f8b828add9?w=800',
                rating: 4.7,
                reviewCount: 521,
                price: '$$$',
                cuisine: 'Indian',
                address: '321 Broad St, Philadelphia, PA 19102',
                phone: '+1-215-555-0104',
                latitude: 39.9500,
                longitude: -75.1635,
            },
        }),
        prisma.restaurant.upsert({
            where: { name: 'Taco Temple' },
            update: {},
            create: {
                name: 'Taco Temple',
                yelpId: 'taco-temple-philly',
                imageUrl: 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=800',
                rating: 4.4,
                reviewCount: 378,
                price: '$',
                cuisine: 'Mexican',
                address: '654 South St, Philadelphia, PA 19147',
                phone: '+1-215-555-0105',
                latitude: 39.9416,
                longitude: -75.1503,
            },
        }),
    ]);

    console.log(`✅ Created ${restaurants.length} restaurants`);

    // Create sample rooms
    const room1 = await prisma.room.create({
        data: {
            name: 'Friday Night Dinner',
            code: 'FRIDAY01',
            cuisine: 'American',
            priceRange: '$$',
            isActive: true,
        },
    });

    const room2 = await prisma.room.create({
        data: {
            name: 'Team Lunch',
            code: 'TEAMLNCH',
            cuisine: 'Mediterranean',
            priceRange: '$',
            isActive: true,
        },
    });

    console.log(`✅ Created 2 rooms`);

    // Add members to rooms
    await Promise.all([
        prisma.roomMember.create({
            data: {
                roomId: room1.id,
                userId: users[0].id,
                isHost: true,
            },
        }),
        prisma.roomMember.create({
            data: {
                roomId: room1.id,
                userId: users[1].id,
                isHost: false,
            },
        }),
        prisma.roomMember.create({
            data: {
                roomId: room2.id,
                userId: users[1].id,
                isHost: true,
            },
        }),
        prisma.roomMember.create({
            data: {
                roomId: room2.id,
                userId: users[2].id,
                isHost: false,
            },
        }),
    ]);

    console.log(`✅ Added members to rooms`);

    // Add restaurants to rooms
    const roomRestaurants = await Promise.all([
        prisma.roomRestaurant.create({
            data: {
                roomId: room1.id,
                restaurantId: restaurants[0].id,
                addedBy: users[0].id,
            },
        }),
        prisma.roomRestaurant.create({
            data: {
                roomId: room1.id,
                restaurantId: restaurants[1].id,
                addedBy: users[1].id,
            },
        }),
        prisma.roomRestaurant.create({
            data: {
                roomId: room1.id,
                restaurantId: restaurants[2].id,
                addedBy: users[0].id,
            },
        }),
        prisma.roomRestaurant.create({
            data: {
                roomId: room2.id,
                restaurantId: restaurants[3].id,
                addedBy: users[1].id,
            },
        }),
        prisma.roomRestaurant.create({
            data: {
                roomId: room2.id,
                restaurantId: restaurants[4].id,
                addedBy: users[2].id,
            },
        }),
    ]);

    console.log(`✅ Added restaurants to rooms`);

    // Add votes
    await Promise.all([
        prisma.vote.create({
            data: {
                userId: users[0].id,
                restaurantId: restaurants[0].id,
                roomId: room1.id,
                voteCount: 1,
            },
        }),
        prisma.vote.create({
            data: {
                userId: users[1].id,
                restaurantId: restaurants[0].id,
                roomId: room1.id,
                voteCount: 1,
            },
        }),
        prisma.vote.create({
            data: {
                userId: users[1].id,
                restaurantId: restaurants[1].id,
                roomId: room1.id,
                voteCount: 1,
            },
        }),
        prisma.vote.create({
            data: {
                userId: users[0].id,
                restaurantId: restaurants[2].id,
                roomId: room1.id,
                voteCount: 1,
            },
        }),
        prisma.vote.create({
            data: {
                userId: users[1].id,
                restaurantId: restaurants[3].id,
                roomId: room2.id,
                voteCount: 1,
            },
        }),
        prisma.vote.create({
            data: {
                userId: users[2].id,
                restaurantId: restaurants[3].id,
                roomId: room2.id,
                voteCount: 1,
            },
        }),
    ]);

    console.log(`✅ Added votes`);

    // Create calendar events
    await Promise.all([
        (prisma as any).calendarEvent.create({
            data: {
                userId: users[0].id,
                title: 'Friday Night Dinner',
                description: 'Votedine group dinner',
                startTime: new Date(Date.now() + 86400000), // Tomorrow
                endTime: new Date(Date.now() + 86400000 + 3600000),
                location: 'Aurora Bistro',
                roomId: room1.id,
            },
        }),
        (prisma as any).calendarEvent.create({
            data: {
                userId: users[0].id,
                title: 'Team Lunch',
                description: 'Mediterranean lunch with the team',
                startTime: new Date(Date.now() + 172800000), // Day after tomorrow
                endTime: new Date(Date.now() + 172800000 + 3600000),
                location: 'Grove & Table',
                roomId: room2.id,
            },
        }),
    ]);

    console.log(`✅ Created calendar events`);

    console.log('🎉 Database seeded successfully!');
}

main()
    .catch((e) => {
        console.error('❌ Seed failed:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
