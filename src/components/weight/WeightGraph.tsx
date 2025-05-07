
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface WeightGraphProps {
  data: {
    date: string;
    weight: number;
  }[];
}

const WeightGraph = ({ data }: WeightGraphProps) => {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart
        data={data}
        margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
      >
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e5e5" />
        <XAxis 
          dataKey="date" 
          tick={{ fontSize: 12 }} 
          tickMargin={10}
          axisLine={false}
        />
        <YAxis 
          domain={['auto', 'auto']} 
          tick={{ fontSize: 12 }}
          tickMargin={10}
          axisLine={false}
        />
        <Tooltip 
          contentStyle={{ 
            backgroundColor: "white", 
            borderColor: "#e5e5e5",
            borderRadius: "8px"
          }}
        />
        <Line
          type="monotone"
          dataKey="weight"
          stroke="#333333"
          strokeWidth={2}
          dot={{ r: 4, fill: "#333333", strokeWidth: 2, stroke: "white" }}
          activeDot={{ r: 6, fill: "#333333", strokeWidth: 2, stroke: "white" }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default WeightGraph;
