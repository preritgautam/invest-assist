interface TableHeaderProps {
  showProjections: boolean
  holdPeriod: number
}

export function TableHeader({ showProjections, holdPeriod }: TableHeaderProps) {
  return (
    <thead className="sticky top-0 bg-gray-900 text-white z-10">
      <tr>
        <th className="sticky left-0 z-20 bg-gray-900 text-left py-3 px-4 text-xs font-semibold border-r border-gray-700 min-w-[200px]">
          Line Item
        </th>
        <th className="text-right py-3 px-3 text-xs font-semibold border-r border-gray-700 w-[130px]">
          <div className="flex flex-col items-end">
            <span>In-Place</span>
            <span className="text-[10px] text-gray-400 font-normal">T-12 Actual</span>
          </div>
        </th>
        <th className="text-right py-3 px-3 text-xs font-semibold border-r border-gray-700 w-[130px]">
          <div className="flex flex-col items-end">
            <span>Your UW</span>
            <span className="text-[10px] text-gray-400 font-normal">Adjusted</span>
          </div>
        </th>
        <th className="text-center py-3 px-3 text-xs font-semibold border-r border-gray-700 w-[110px]">
          <div className="flex flex-col items-center">
            <span>Variance</span>
            <span className="text-[10px] text-gray-400 font-normal">$ / %</span>
          </div>
        </th>
        {showProjections &&
          Array.from({ length: holdPeriod }, (_, i) => i + 1).map((year) => (
            <th key={year} className="text-right py-3 px-3 text-xs font-semibold border-r border-gray-700 w-[110px]">
              <div className="flex flex-col items-end">
                <span>Year {year}</span>
                <span className="text-[10px] text-gray-400 font-normal">Projected</span>
              </div>
            </th>
          ))}
      </tr>
    </thead>
  )
}
