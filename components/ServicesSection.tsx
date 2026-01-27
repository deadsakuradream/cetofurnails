'use client';

import { useState } from 'react';
import { Service, Category } from '@prisma/client';
import { formatPrice } from '@/lib/utils';

type ServiceWithCategory = Service & { category: Category | null };

interface ServicesSectionProps {
    services: ServiceWithCategory[];
}

export default function ServicesSection({ services }: ServicesSectionProps) {
    // Group services by category
    const groupedServices = services.reduce((acc, service) => {
        const categoryName = service.category?.name || 'Другое';
        if (!acc[categoryName]) {
            acc[categoryName] = [];
        }
        acc[categoryName].push(service);
        return acc;
    }, {} as Record<string, ServiceWithCategory[]>);

    // Sort categories: "Другое" should be last
    const sortedCategories = Object.keys(groupedServices).sort((a, b) => {
        if (a === 'Другое') return 1;
        if (b === 'Другое') return -1;
        return a.localeCompare(b);
    });

    // State for expanded categories
    const [expandedCategories, setExpandedCategories] = useState<string[]>(sortedCategories);

    const toggleCategory = (category: string) => {
        setExpandedCategories(prev =>
            prev.includes(category)
                ? prev.filter(c => c !== category)
                : [...prev, category]
        );
    };

    return (
        <section className="mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-8 text-gray-900">
                Услуги
            </h2>

            <div className="space-y-6 max-w-4xl mx-auto">
                {sortedCategories.length > 0 ? (
                    sortedCategories.map((category) => (
                        <div key={category} className="bg-white rounded-lg shadow-md overflow-hidden">
                            <button
                                onClick={() => toggleCategory(category)}
                                className="w-full flex justify-between items-center px-6 py-4 bg-gray-50 hover:bg-gray-100 transition text-left"
                            >
                                <h3 className="text-xl font-bold text-gray-900">{category}</h3>
                                <svg
                                    className={`w-6 h-6 text-gray-500 transform transition-transform duration-200 ${expandedCategories.includes(category) ? 'rotate-180' : ''
                                        }`}
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                            </button>

                            <div
                                className={`transition-all duration-300 ease-in-out ${expandedCategories.includes(category)
                                        ? 'max-h-[2000px] opacity-100'
                                        : 'max-h-0 opacity-0 overflow-hidden'
                                    }`}
                            >
                                <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-gray-100">
                                    {groupedServices[category].map((service) => (
                                        <div
                                            key={service.id}
                                            className="p-4 border border-gray-100 rounded-lg hover:border-primary-100 hover:bg-primary-50 transition"
                                        >
                                            <div className="flex justify-between items-start mb-2">
                                                <h4 className="font-semibold text-gray-900">{service.name}</h4>
                                                <span className="font-bold text-primary-600 whitespace-nowrap ml-4">
                                                    {formatPrice(service.price)}
                                                </span>
                                            </div>
                                            {service.description && (
                                                <p className="text-sm text-gray-600">{service.description}</p>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="col-span-full text-center text-gray-500 py-8">
                        Услуги пока не добавлены
                    </div>
                )}
            </div>
        </section>
    );
}
