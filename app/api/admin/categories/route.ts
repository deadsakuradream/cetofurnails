import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';

export async function GET() {
    try {
        const categories = await prisma.category.findMany({
            orderBy: { createdAt: 'desc' },
            include: {
                _count: {
                    select: { services: true }
                }
            }
        });
        return NextResponse.json(categories);
    } catch (error) {
        return NextResponse.json({ message: 'Ошибка при получении категорий' }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const user = await getCurrentUser();
        if (!user) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        const { name } = await req.json();

        if (!name) {
            return NextResponse.json({ message: 'Название обязательно' }, { status: 400 });
        }

        const category = await prisma.category.create({
            data: { name },
        });

        return NextResponse.json(category);
    } catch (error) {
        return NextResponse.json({ message: 'Ошибка при создании категории' }, { status: 500 });
    }
}
