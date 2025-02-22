
import { Card } from "./ui/card";

export const DashboardHeader = () => {
  return (
    <div className="w-full mb-8 animate-fade-in">
      <h1 className="text-4xl font-bold tracking-tight mb-2 text-gray-900">
        Metagenomics Dashboard
      </h1>
      <p className="text-gray-500 mb-6">
        Analyze and visualize metagenomic sequencing data
      </p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <MetricCard
          title="Total Samples"
          value="24"
          description="Active samples in analysis"
        />
        <MetricCard
          title="Species Identified"
          value="1,432"
          description="Unique species found"
        />
        <MetricCard
          title="Average Diversity"
          value="3.8"
          description="Shannon diversity index"
        />
      </div>
    </div>
  );
};

const MetricCard = ({
  title,
  value,
  description,
}: {
  title: string;
  value: string;
  description: string;
}) => {
  return (
    <Card className="p-6 hover:shadow-lg transition-shadow duration-300 bg-white/50 backdrop-blur-sm border border-gray-200">
      <h3 className="font-medium text-gray-500 mb-1">{title}</h3>
      <p className="text-3xl font-bold text-gray-900 mb-1">{value}</p>
      <p className="text-sm text-gray-500">{description}</p>
    </Card>
  );
};
