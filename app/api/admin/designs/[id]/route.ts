import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';

const updateDesignSchema = z.object({
    name: z.string().min(1).optional(),
    description: z.string().optional(),
    price: z.number().min(0).optional(),
    isActive: z.boolean().optional(),
});

export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await params;
        const body = await request.json();
        const data = updateDesignSchema.parse(body);

        const design = await prisma.design.update({
            where: { id },
            data,
        });

        return NextResponse.json(design);
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { message: 'Неверные данные', errors: error.errors },
                { status: 400 }
            );
        }
        return NextResponse.json(
            { message: 'Ошибка при обновлении дизайна' },
            { status: 500 }
        );
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await params;

        await prisma.design.delete({
            where: { id },
        });

        return NextResponse.json({ message: 'Дизайн удален' });
    } catch (error) {
        return NextResponse.json(
            { message: 'Ошибка при удалении дизайна' },
            { status: 500 }
        );
    }
}
