import React, { useEffect, useState, useRef } from 'react';

/**
 * Data statistik paket per bulan
 */
interface MonthData {
  month: string;
  value: number;
  isLatest?: boolean;
}

/**
 * Properti untuk komponen PackageAreaChart
 */
interface PackageAreaChartProps {
  /** Fungsi callback saat tombol 'Cek Data' ditekan */
  onCekData?: () => void;
}

/**
 * Komponen grafik area (Area Chart) untuk menampilkan tren jumlah paket
 * yang masuk dalam 6 bulan terakhir.
 *
 * @param {PackageAreaChartProps} props - Properti komponen
 * @returns {JSX.Element} Komponen PackageAreaChart
 */
const PackageAreaChart: React.FC<PackageAreaChartProps> = ({ onCekData }) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [animated, setAnimated] = useState(false);
  const [tooltip, setTooltip] = useState<{ x: number; y: number; value: number; month: string } | null>(null);

  // --- Build last 6 months dynamically ---
  const buildMonthLabels = (): MonthData[] => {
    const monthNames = [
      'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
      'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
    ];
    const now = new Date();
    const months: MonthData[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push({
        month: monthNames[d.getMonth()],
        value: 0,
        isLatest: i === 0,
      });
    }
    return months;
  };

  const [chartData, setChartData] = useState<MonthData[]>(buildMonthLabels());

  // --- Fetch real package data and group by month ---
  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${import.meta.env.VITE_API_URL}/packages`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const raw = await res.json();
        const packages: { createdAt: string }[] = Array.isArray(raw)
          ? raw
          : Array.isArray(raw?.data)
          ? raw.data
          : [];

        const monthLabels = buildMonthLabels();
        const now = new Date();

        // Count packages per month
        packages.forEach((pkg) => {
          if (!pkg.createdAt) return;
          const d = new Date(pkg.createdAt);
          for (let i = 0; i < 6; i++) {
            const target = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
            if (d.getFullYear() === target.getFullYear() && d.getMonth() === target.getMonth()) {
              monthLabels[i].value += 1;
            }
          }
        });

        setChartData(monthLabels);
      } catch {
        // If fetch fails, keep the initial zero state
        setChartData(buildMonthLabels());
      }
    };

    fetchData();
    setTimeout(() => setAnimated(true), 100);
  }, []);

  // --- SVG Layout ---
  const W = 780;
  const H = 230;
  const PAD_LEFT = 48;
  const PAD_RIGHT = 24;
  const PAD_TOP = 20;
  const PAD_BOTTOM = 40;

  const chartW = W - PAD_LEFT - PAD_RIGHT;
  const chartH = H - PAD_TOP - PAD_BOTTOM;

  const maxVal = Math.max(...chartData.map((d) => d.value), 10);
  const yMax = Math.ceil(maxVal / 10) * 10 + 10;
  const yTicks = [0, Math.round(yMax * 0.2), Math.round(yMax * 0.4), Math.round(yMax * 0.6), Math.round(yMax * 0.8), yMax];

  // Map data to SVG coords
  const points = chartData.map((d, i) => ({
    x: PAD_LEFT + (i / (chartData.length - 1)) * chartW,
    y: PAD_TOP + chartH - (d.value / yMax) * chartH,
    value: d.value,
    month: d.month,
    isLatest: !!d.isLatest,
  }));

  // Smooth bezier path
  const smoothPath = (pts: { x: number; y: number }[]) => {
    if (pts.length < 2) return '';
    let d = `M ${pts[0].x} ${pts[0].y}`;
    for (let i = 1; i < pts.length; i++) {
      const prev = pts[i - 1];
      const curr = pts[i];
      const cp1x = prev.x + (curr.x - prev.x) * 0.45;
      const cp1y = prev.y;
      const cp2x = prev.x + (curr.x - prev.x) * 0.55;
      const cp2y = curr.y;
      d += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${curr.x} ${curr.y}`;
    }
    return d;
  };

  const linePath = smoothPath(points);

  // Area path = line + close to bottom
  const areaPath =
    linePath +
    ` L ${points[points.length - 1].x} ${PAD_TOP + chartH}` +
    ` L ${points[0].x} ${PAD_TOP + chartH} Z`;

  return (
    <section className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h3 className="font-semibold text-gray-800 dark:text-white text-sm">
          Grafik Paket Masuk{' '}
          <span className="text-[#143C9C] dark:text-blue-400 font-semibold text-sm">(6 bulan terakhir)</span>
        </h3>
        <button
          onClick={onCekData}
          className="text-sm font-semibold text-[#143C9C] dark:text-blue-400 hover:underline"
        >
          Cek Data →
        </button>
      </div>

      {/* SVG Chart */}
      <div className="relative w-full overflow-x-auto">
        <svg
          ref={svgRef}
          viewBox={`0 0 ${W} ${H}`}
          className="w-full"
          style={{ minWidth: 320 }}
          onMouseLeave={() => setTooltip(null)}
        >
          <defs>
            {/* Gradient fill */}
            <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#5B8DEF" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#5B8DEF" stopOpacity="0.03" />
            </linearGradient>
            {/* Clip path for animation */}
            <clipPath id="chartClip">
              <rect
                x={PAD_LEFT}
                y={0}
                width={animated ? chartW : 0}
                height={H}
                style={{ transition: 'width 1.2s cubic-bezier(0.4,0,0.2,1)' }}
              />
            </clipPath>
          </defs>

          {/* --- Y-axis grid lines & labels --- */}
          {yTicks.map((tick) => {
            const yPos = PAD_TOP + chartH - (tick / yMax) * chartH;
            return (
              <g key={tick}>
                <line
                  x1={PAD_LEFT}
                  y1={yPos}
                  x2={W - PAD_RIGHT}
                  y2={yPos}
                  stroke="#E5E7EB"
                  strokeWidth="1"
                  strokeDasharray="4 4"
                />
                <text
                  x={PAD_LEFT - 8}
                  y={yPos + 4}
                  textAnchor="end"
                  fontSize="11"
                  fill="#9CA3AF"
                >
                  {tick}
                </text>
              </g>
            );
          })}

          {/* --- X-axis label lines (vertical dashed) --- */}
          {points.map((pt) => (
            <line
              key={pt.month + '-vline'}
              x1={pt.x}
              y1={PAD_TOP}
              x2={pt.x}
              y2={PAD_TOP + chartH}
              stroke="#E5E7EB"
              strokeWidth="1"
              strokeDasharray="4 4"
            />
          ))}

          {/* --- Area fill --- */}
          <path d={areaPath} fill="url(#areaGrad)" clipPath="url(#chartClip)" />

          {/* --- Line stroke --- */}
          <path
            d={linePath}
            fill="none"
            stroke="#3B72D9"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            clipPath="url(#chartClip)"
          />

          {/* --- Data points & hover zones --- */}
          {points.map((pt) => (
            <g key={pt.month}>
              {/* Invisible hit area */}
              <circle
                cx={pt.x}
                cy={pt.y}
                r={18}
                fill="transparent"
                onMouseEnter={() => setTooltip({ x: pt.x, y: pt.y, value: pt.value, month: pt.month })}
              />
              {/* Outer ring */}
              <circle cx={pt.x} cy={pt.y} r={6} fill="white" stroke="#3B72D9" strokeWidth="2" />
              {/* Inner dot */}
              <circle cx={pt.x} cy={pt.y} r={3} fill="#3B72D9" />
            </g>
          ))}

          {/* --- X-axis month labels --- */}
          {points.map((pt) => (
            <text
              key={pt.month + '-label'}
              x={pt.x}
              y={PAD_TOP + chartH + 22}
              textAnchor="middle"
              fontSize="11"
              fontWeight={pt.isLatest ? '700' : '400'}
              fill={pt.isLatest ? '#143C9C' : '#9CA3AF'}
            >
              {pt.month}
            </text>
          ))}

          {/* --- Tooltip --- */}
          {tooltip && (
            <g>
              {/* Vertical highlight line */}
              <line
                x1={tooltip.x}
                y1={PAD_TOP}
                x2={tooltip.x}
                y2={PAD_TOP + chartH}
                stroke="#3B72D9"
                strokeWidth="1.5"
                strokeDasharray="4 3"
                opacity="0.6"
              />
              {/* Tooltip box */}
              <rect
                x={Math.min(tooltip.x - 36, W - PAD_RIGHT - 80)}
                y={tooltip.y - 42}
                width={72}
                height={28}
                rx={8}
                fill="#143C9C"
              />
              <text
                x={Math.min(tooltip.x - 36, W - PAD_RIGHT - 80) + 36}
                y={tooltip.y - 23}
                textAnchor="middle"
                fontSize="12"
                fontWeight="600"
                fill="white"
              >
                {tooltip.value} paket
              </text>
            </g>
          )}
        </svg>
      </div>
    </section>
  );
};

export default PackageAreaChart;
