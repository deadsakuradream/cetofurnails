import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';

export async function PUT(
    req: Request,
    { params }: { params: { id: string } }
) {
    try {
        const user = await getCurrentUser();
        if (!user) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        const { name } = await req.json();
        const categoryId = params.id;

        if (!name) {
            return NextResponse.json({ message: 'Название обязательно' }, { status: 400 });
        }

        const category = await prisma.category.update({
            where: { id: categoryId },
            data: { name },
        });

        return NextResponse.json(category);
    } catch (error) {
        return NextResponse.json({ message: 'Ошибка при обновлении категории' }, { status: 500 });
    }
}

export async function DELETE(
    req: Request,
    { params }: { params: { id: string } }
) {
    try {
        const user = await getCurrentUser();
        if (!user) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        const categoryId = params.id;

        // Check if category has services
        const servicesCount = await prisma.service.count({
            where: { categoryId },
        });

        if (servicesCount > 0) {
            return NextResponse.json(
                { message: 'Нельзя удалить категорию, к которой привязаны услуги' },
                { status: 400 }
            );
        }

        await prisma.category.delete({
            where: { id: categoryId },
        });

        return NextResponse.json({ message: 'Категория удалена' });
    } catch (error) {
        return NextResponse.json({ message: 'Ошибка при удалении категории' }, { status: 500 });
    }
}
