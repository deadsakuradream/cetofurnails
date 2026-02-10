export default function AdminLoading() {
    return (
        <div className="animate-pulse">
            {/* Header skeleton */}
            <div className="flex justify-between items-center mb-6">
                <div className="h-8 bg-gray-200 rounded w-48"></div>
                <div className="h-10 bg-gray-200 rounded w-36"></div>
            </div>

            {/* Cards skeleton */}
            <div className="space-y-4">
                {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                        <div className="flex items-center justify-between">
                            <div className="flex-1 space-y-2">
                                <div className="h-5 bg-gray-200 rounded w-2/5"></div>
                                <div className="h-4 bg-gray-100 rounded w-3/5"></div>
                                <div className="h-4 bg-gray-100 rounded w-1/4"></div>
                            </div>
                            <div className="flex gap-2">
                                <div className="h-8 bg-gray-200 rounded w-20"></div>
                                <div className="h-8 bg-gray-200 rounded w-16"></div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
