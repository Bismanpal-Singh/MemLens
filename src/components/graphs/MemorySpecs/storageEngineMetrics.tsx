/* eslint-disable react-hooks/exhaustive-deps */
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import GaugeChart from "react-gauge-chart";
import { Progress } from "@/components/ui/progress";
import { Database, InfoIcon, RefreshCcw, RefreshCw } from "lucide-react";
import { useEffect, useState } from "react";
import { middlewareApi } from "@/lib/api";
import { Loader } from "@/components/ui/loader";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface LevelDbStats {
  level: number;
  files: number;
  size_mb: number;
  time_sec: number;
  read_mb: number;
  write_mb: number;
}

interface StorageMetrics {
  ext_cache_hit_ratio: number;
  level_db_approx_mem_size: number;
  level_db_stats: LevelDbStats[];
  max_resident_set_size: number;
  resident_set_size: number;
}

interface MemoryMetric {
  name: string;
  value: string | number;
  description: string;
  link: string;
}

interface CacheHitRatioProps {
  ratio: number;
}

interface LevelDbCardProps {
  levelDbSize: number;
  rssSize: number;
}

const CacheHitGauge = () => {
  const [isCalculating, setIsCalculating] = useState(false);
  const [p99Value, setP99Value] = useState(0);
  const [animatedValue, setAnimatedValue] = useState(0);

  const calculateP99 = async () => {
    setIsCalculating(true);
    setP99Value(0);
    setAnimatedValue(0);

    try {
      const response = await middlewareApi.post("/transactions/calculateP99", {
        samples: 100,
      });
      const data = response?.data;
      const finalValue = data.p99;
      setP99Value(finalValue);
      setIsCalculating(false);
    } catch (error) {
      console.error("Error calculating P99:", error);
      setIsCalculating(false);
    }
  };

  function calculatPercent() {
    return p99Value / 5000;
  }

  return (
    <Card className="flex-1">
      <CardHeader>
        <CardTitle>P99 Latency Test (Set Method)</CardTitle>
      </CardHeader>
      <CardContent className="p-6 flex flex-col items-center justify-center">
        {!isCalculating && p99Value === 0 ? (
          <Button
            onClick={calculateP99}
            className="w-32 h-32 rounded-full text-2xl font-bold"
            disabled={isCalculating}
          >
            GO
          </Button>
        ) : (
          <div className="w-full h-64 relative">
            <GaugeChart
              id="p99-gauge-chart"
              nrOfLevels={10}
              colors={["#10B981", "#FBBF24", "#EF4444"]}
              percent={calculatPercent()}
              textColor="#000000"
              needleColor="#5C6BC0"
              needleBaseColor="#3949AB"
              arcWidth={0.2}
              formatTextValue={() => ""}
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-xl font-bold">
                {isCalculating
                  ? `${animatedValue.toFixed(1)}s`
                  : `${p99Value.toFixed(1)}ms`}
              </div>
            </div>
          </div>
        )}
        {isCalculating && (
          <p className="mt-1 text-center text-muted-foreground">
            Calculating P99 latency...
          </p>
        )}
        {!isCalculating && p99Value > 0 && (
          <Button onClick={calculateP99} className="mt-1">
            Recalculate
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

export function StorageEngineMetrics() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [refresh, setRefresh] = useState(false);
  const [data, setData] = useState<StorageMetrics>(null);

  useEffect(() => {
    fetchTransactionData();
  }, [refresh]);

  async function fetchTransactionData() {
    try {
      setLoading(true);
      const response = await middlewareApi.post(
        "/statsExporter/getTransactionData"
      );
      console.log(response?.data);
      setData(response?.data);
      setLoading(false);
    } catch (error) {
      setLoading(false);
      setError(error);
    }
  }

  return (
    <Card className="flex-1 w-full max-w-8xl mx-auto bg-gradient-to-br from-slate-900 to-slate-950 text-white shadow-xl">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div className="flex items-center gap-2">
          <Database className="w-6 h-6 text-blue-400" />
          <CardTitle className="text-2xl font-bold">
            {" "}
            Storage Engine Metrics
          </CardTitle>
        </div>
        <div className="flex flex-row items-center justify-between space-x-4">
          <Button
            onClick={() => setRefresh((prev) => !prev)}
            variant="outline"
            size="icon"
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  className="p-2 bg-slate-700 text-slate-400 hover:text-white hover:bg-slate-600 transition-colors duration-200 ease-in-out rounded"
                  onClick={() => window.open("https://gmail.com", "_blank")}
                >
                  <InfoIcon size={12} />
                </button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Click for more information about these metrics</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </CardHeader>
      {loading ? (
        <Loader className="h-[400px]" />
      ) : (
        <CardContent>
          <div className="flex flex-row justify-between space-x-2">
            <CacheHitRatio ratio={data?.ext_cache_hit_ratio} />
            <LevelDbCard
              levelDbSize={data?.level_db_approx_mem_size}
              rssSize={data?.resident_set_size}
            />
            <CacheHitGauge />
          </div>
        </CardContent>
      )}
    </Card>
  );
}

export function CacheHitRatio({ ratio }: CacheHitRatioProps) {
  const percentage = Math.round(ratio * 100);
  return (
    <Card className="w-full max-w-md flex-1">
      <CardHeader>
        <CardTitle>Cache Hit Ratio</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium">Hit Rate</span>
          <span className="text-2xl font-bold">{percentage}%</span>
        </div>
        <Progress value={percentage} className="h-2" />
        <p className="mt-2 text-sm text-muted-foreground">
          {percentage}% of requests are served from the LRU cache.
        </p>
      </CardContent>
    </Card>
  );
}

//TODO: refactor
export function LevelDbCard({ levelDbSize, rssSize }: LevelDbCardProps) {
  const size = Math.round(levelDbSize / 1000);

  const memoryMetrics: MemoryMetric[] = [
    {
      name: "Level DB Approx Size",
      value: String(size) + " KB",
      description: "Estimated size of the LevelDB database",
      link: "https://github.com/google/leveldb",
    },
    {
      name: "RSS",
      value: String(rssSize) + " MB",
      description: "Current Resident Set Size (physical memory used)",
      link: "https://en.wikipedia.org/wiki/Resident_set_size",
    },
  ];

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle>Memory Footprint</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Metric</TableHead>
              <TableHead>Value</TableHead>
              <TableHead>Info</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {memoryMetrics.map((metric) => (
              <TableRow key={metric.name}>
                <TableCell>{metric.name}</TableCell>
                <TableCell>{metric.value}</TableCell>
                <TableCell>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Link
                          to={metric.link}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <InfoIcon className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                        </Link>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{metric.description}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}