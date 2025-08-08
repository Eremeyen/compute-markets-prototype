import { ResponsiveContainer, LineChart, XAxis, YAxis, Tooltip, Line } from 'recharts';

export type PricePoint = { t: number; p: number };

type Props = {
	data: PricePoint[];
	windowSize?: number; // show only the last N points if provided
};

export function PriceChart({ data, windowSize }: Props) {
	const series = windowSize && windowSize > 0 ? data.slice(-windowSize) : data;
	return (
		<div className="h-48 md:h-64 w-full">
			<ResponsiveContainer width="100%" height="100%">
				<LineChart data={series} margin={{ left: 12, right: 12, top: 8, bottom: 8 }}>
					<XAxis dataKey="t" tick={{ fontSize: 12 }} stroke="#666" />
					<YAxis tick={{ fontSize: 12 }} stroke="#666" domain={['auto', 'auto']} />
					<Tooltip
						formatter={(v: number) => `$${(v as number).toFixed(4)}`}
						labelFormatter={(l) => `t-${l}`}
					/>
					<Line
						type="monotone"
						dataKey="p"
						stroke="#31D158"
						strokeWidth={2}
						dot={false}
					/>
				</LineChart>
			</ResponsiveContainer>
		</div>
	);
}
