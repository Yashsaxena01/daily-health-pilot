
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, TooltipProps } from "recharts";
import { format, addDays, subDays, startOfWeek, endOfWeek, startOfMonth, endOfMonth, addWeeks, subWeeks, addMonths, subMonths } from "date-fns";

interface WeightGraphProps {
  data: {
    id?: string;
    date: string;
    weight: number;
    rawDate?: Date;
  }[];
  view?: "daily" | "weekly" | "monthly";
  currentDate?: Date;
  onDateChange?: (date: Date) => void;
  showNavigation?: boolean;
  comparativeData?: {
    date: string;
    weight: number;
    isToday?: boolean;
  }[];
}

const WeightGraph = ({ 
  data, 
  view = "weekly", 
  currentDate = new Date(),
  onDateChange,
  showNavigation = false,
  comparativeData
}: WeightGraphProps) => {
  const today = format(new Date(), "MMM d");
  
  // Use comparative data if provided, otherwise process data based on view
  const processedData = (() => {
    if (comparativeData && (view === "weekly" || view === "monthly")) {
      return comparativeData;
    }

    if (!data || data.length === 0) return [];
    
    let filteredData = data;
    
    // Filter data based on view and current date
    if (view === "weekly" && showNavigation) {
      const weekStart = startOfWeek(currentDate);
      const weekEnd = endOfWeek(currentDate);
      filteredData = data.filter(item => {
        const itemDate = item.rawDate || new Date(item.date);
        return itemDate >= weekStart && itemDate <= weekEnd;
      });
    } else if (view === "monthly" && showNavigation) {
      const monthStart = startOfMonth(currentDate);
      const monthEnd = endOfMonth(currentDate);
      filteredData = data.filter(item => {
        const itemDate = item.rawDate || new Date(item.date);
        return itemDate >= monthStart && itemDate <= monthEnd;
      });
    }
    
    if (view === "daily") {
      return filteredData.map(item => ({
        ...item,
        isToday: item.date === today
      }));
    }
    
    return filteredData.map(item => ({
      ...item,
      isToday: item.date === today
    }));
  })();

  const handlePrevious = () => {
    if (!onDateChange) return;
    
    if (view === "daily") {
      onDateChange(subDays(currentDate, 1));
    } else if (view === "weekly") {
      onDateChange(subWeeks(currentDate, 1));
    } else if (view === "monthly") {
      onDateChange(subMonths(currentDate, 1));
    }
  };

  const handleNext = () => {
    if (!onDateChange) return;
    
    if (view === "daily") {
      onDateChange(addDays(currentDate, 1));
    } else if (view === "weekly") {
      onDateChange(addWeeks(currentDate, 1));
    } else if (view === "monthly") {
      onDateChange(addMonths(currentDate, 1));
    }
  };

  const CustomTooltip = ({ active, payload, label }: TooltipProps<number, string>) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-2 border border-gray-200 shadow-sm rounded-md">
          <p className="font-medium">{label}</p>
          <p className="text-sm">{`Weight: ${payload[0].value?.toFixed(1)} lbs`}</p>
        </div>
      );
    }
    return null;
  };

  const CustomDot = (props: any) => {
    const { cx, cy, payload } = props;
    const isToday = payload?.isToday;
    
    return (
      <circle
        cx={cx}
        cy={cy}
        r={isToday ? 6 : 4}
        fill={isToday ? "#ea580c" : "#f97316"}
        stroke="white"
        strokeWidth={2}
        className={isToday ? "animate-pulse" : ""}
      />
    );
  };

  return (
    <div className="w-full h-full">
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
            stroke="#f97316"
            strokeWidth={2}
            dot={<CustomDot />}
            activeDot={{ r: 8, fill: "#ea580c", strokeWidth: 2, stroke: "white" }}
          />
        </LineChart>
      </ResponsiveContainer>
      
      {showNavigation && (
        <div className="flex justify-between items-center mt-2 text-sm">
          <button 
            onClick={handlePrevious}
            className="flex items-center text-muted-foreground hover:text-foreground transition-colors"
          >
            ← Previous
          </button>
          <div className="font-medium text-center">
            {view === "weekly" && format(currentDate, "MMM d, yyyy")}
            {view === "monthly" && format(currentDate, "MMM yyyy")}
            {view === "daily" && format(currentDate, "MMM d, yyyy")}
          </div>
          <button 
            onClick={handleNext}
            className="flex items-center text-muted-foreground hover:text-foreground transition-colors"
          >
            Next →
          </button>
        </div>
      )}
    </div>
  );
};

export default WeightGraph;
