
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, TooltipProps } from "recharts";

interface WeightGraphProps {
  data: {
    id?: string;
    date: string;
    weight: number;
  }[];
  view?: "daily" | "weekly" | "monthly";
}

const WeightGraph = ({ data, view = "daily" }: WeightGraphProps) => {
  // Process data based on view
  const processedData = (() => {
    if (view === "daily" || !data || data.length === 0) {
      return data;
    }
    
    if (view === "weekly") {
      // Group by week and calculate average
      const weeklyData: Record<string, { sum: number; count: number }> = {};
      data.forEach(item => {
        // Simple week grouping - in a real app would use date-fns getWeek
        const weekParts = item.date.split(" ");
        const weekLabel = `Week of ${weekParts[0]}`;
        
        if (!weeklyData[weekLabel]) {
          weeklyData[weekLabel] = { sum: 0, count: 0 };
        }
        weeklyData[weekLabel].sum += item.weight;
        weeklyData[weekLabel].count += 1;
      });
      
      return Object.keys(weeklyData).map(week => ({
        date: week,
        weight: parseFloat((weeklyData[week].sum / weeklyData[week].count).toFixed(1))
      }));
    }
    
    if (view === "monthly") {
      // Group by month
      const monthlyData: Record<string, { sum: number; count: number }> = {};
      data.forEach(item => {
        const month = item.date.split(" ")[0]; // Extract month
        
        if (!monthlyData[month]) {
          monthlyData[month] = { sum: 0, count: 0 };
        }
        monthlyData[month].sum += item.weight;
        monthlyData[month].count += 1;
      });
      
      return Object.keys(monthlyData).map(month => ({
        date: month,
        weight: parseFloat((monthlyData[month].sum / monthlyData[month].count).toFixed(1))
      }));
    }
    
    return data;
  })();

  const CustomTooltip = ({ active, payload, label }: TooltipProps<number, string>) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-2 border border-gray-200 shadow-sm rounded-md">
          <p className="font-medium">{label}</p>
          <p className="text-sm">{`Weight: ${payload[0].value}`}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart
        data={processedData}
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
        <Tooltip content={<CustomTooltip />} />
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
