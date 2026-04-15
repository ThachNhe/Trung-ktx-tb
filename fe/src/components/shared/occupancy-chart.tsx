interface OccupancyDatum {
    building: string
    occupiedBeds: number
    totalCapacity: number
    rate: number
}

interface OccupancyChartProps {
    data: OccupancyDatum[]
}

export function OccupancyChart({ data }: OccupancyChartProps) {
    return (
        <div className="space-y-4">
            {data.map((item) => (
                <div key={item.building} className="rounded-[1.25rem] border border-slate-200 bg-slate-50/80 p-4">
                    <div className="flex items-center justify-between gap-3 text-sm">
                        <div>
                            <div className="font-semibold text-slate-900">{item.building}</div>
                            <div className="text-slate-500">
                                {item.occupiedBeds}/{item.totalCapacity} chỗ đang sử dụng
                            </div>
                        </div>
                        <div className="rounded-full bg-white px-3 py-1 font-semibold text-green-700 shadow-sm">
                            {item.rate}%
                        </div>
                    </div>
                    <div className="mt-4 h-3 overflow-hidden rounded-full bg-slate-200">
                        <div
                            className="h-full rounded-full bg-[linear-gradient(90deg,#15803d_0%,#22c55e_100%)]"
                            style={{ width: `${Math.min(item.rate, 100)}%` }}
                        />
                    </div>
                </div>
            ))}
        </div>
    )
}