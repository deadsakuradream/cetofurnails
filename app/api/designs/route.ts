import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';

export const dynamic = 'force-dynamic';

const getDesignsSchema = z.object({
    includeInactive: z.string().optional(),
});

const createDesignSchema = z.object({
    name: z.string().min(1, 'Название обязательно'),
    price: z.number().min(0, 'Цена не может быть отрицательной'),
    isActive: z.boolean().optional(),
});

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const includeInactive = searchParams.get('includeInactive') === 'true';

        const where = includeInactive ? {} : { isActive: true };

        const designs = await prisma.design.findMany({
            where,
            orderBy: { name: 'asc' },
        });

        return NextResponse.json(designs);
    } catch (error) {
        console.error('Error fetching designs:', error);
        return NextResponse.json(
            { message: 'Ошибка при получении дизайнов' },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const data = createDesignSchema.parse(body);

        const design = await prisma.design.create({
            data: {
                name: data.name,
                price: data.price,
                isActive: data.isActive ?? true,
            },
        });

        return NextResponse.json(design, { status: 201 });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { message: 'Неверные данные', errors: error.errors },
                { status: 400 }
            );
        }

        console.error('Error creating design:', error);
        return NextResponse.json(
            { message: 'Ошибка при создании дизайна' },
            { status: 500 }
        );
    }
}
