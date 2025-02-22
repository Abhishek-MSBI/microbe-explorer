
import { Card } from "./ui/card";
import { Badge } from "./ui/badge";

const samples = [
  {
    id: "S001",
    name: "Soil Sample A",
    date: "2024-03-15",
    status: "Processed",
    type: "Soil",
  },
  {
    id: "S002",
    name: "Marine Sample B",
    date: "2024-03-14",
    status: "Processing",
    type: "Marine",
  },
  {
    id: "S003",
    name: "Gut Microbiome C",
    date: "2024-03-13",
    status: "Processed",
    type: "Human",
  },
];

export const SampleList = () => {
  return (
    <Card className="mt-8 p-6 bg-white/50 backdrop-blur-sm animate-fade-in">
      <h2 className="text-xl font-semibold mb-4">Recent Samples</h2>
      <div className="space-y-4">
        {samples.map((sample) => (
          <div
            key={sample.id}
            className="flex items-center justify-between p-4 rounded-lg border border-gray-100 hover:border-theme-300 transition-colors duration-300"
          >
            <div className="flex items-center space-x-4">
              <div className="w-2 h-2 rounded-full bg-theme-400" />
              <div>
                <h3 className="font-medium text-gray-900">{sample.name}</h3>
                <p className="text-sm text-gray-500">ID: {sample.id}</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Badge
                variant="secondary"
                className="bg-gray-100 text-gray-600 hover:bg-gray-200"
              >
                {sample.type}
              </Badge>
              <span className="text-sm text-gray-500">{sample.date}</span>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};
