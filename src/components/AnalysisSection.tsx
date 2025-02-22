
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

const mockData = [
  { name: "Bacteroidetes", value: 35 },
  { name: "Firmicutes", value: 28 },
  { name: "Proteobacteria", value: 15 },
  { name: "Actinobacteria", value: 12 },
  { name: "Others", value: 10 },
];

export const AnalysisSection = () => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-fade-in">
      <Card className="p-6 bg-white/50 backdrop-blur-sm">
        <h2 className="text-xl font-semibold mb-4">Taxonomic Composition</h2>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={mockData}>
              <XAxis dataKey="name" fontSize={12} />
              <YAxis fontSize={12} />
              <Tooltip />
              <Bar dataKey="value" fill="#2dd4bf" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>
      
      <Card className="p-6 bg-white/50 backdrop-blur-sm">
        <h2 className="text-xl font-semibold mb-4">Diversity Metrics</h2>
        <div className="space-y-4">
          <MetricRow label="Shannon Index" value="3.8" />
          <MetricRow label="Simpson Index" value="0.85" />
          <MetricRow label="Observed Species" value="1,432" />
          <MetricRow label="Chao1 Estimate" value="1,587" />
        </div>
        <div className="mt-6">
          <Button className="w-full bg-theme-500 hover:bg-theme-600 text-white">
            Export Analysis
          </Button>
        </div>
      </Card>
    </div>
  );
};

const MetricRow = ({ label, value }: { label: string; value: string }) => (
  <div className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0">
    <span className="text-gray-600">{label}</span>
    <span className="font-semibold text-gray-900">{value}</span>
  </div>
);
