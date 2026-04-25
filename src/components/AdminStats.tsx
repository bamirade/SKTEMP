import { useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { Survey } from "@shared/schema";

interface AdminStatsProps {
  surveys: Survey[];
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{ value: number; payload: { name: string; value: number } }>;
  total: number;
}

const COLORS = [
  "#4f46e5",
  "#ec4899",
  "#f97316",
  "#10b981",
  "#6366f1",
  "#8b5cf6",
];

// Custom Tooltip Component for Bar/Pie Charts showing count and percentage
const CustomTooltip = ({ active, payload, total }: CustomTooltipProps) => {
  if (active && payload && payload.length) {
    const value = payload[0].value as number;
    const percentage = ((value / total) * 100).toFixed(1);
    return (
      <div className="bg-slate-900 text-white p-3 rounded-lg shadow-xl border border-slate-700">
        <p className="font-bold text-sm mb-1">{payload[0].payload.name}</p>
        <p className="text-xs opacity-90">Count: <span className="font-semibold">{value}</span></p>
        <p className="text-xs opacity-90">Percentage: <span className="font-semibold">{percentage}%</span></p>
      </div>
    );
  }
  return null;
};

export function AdminStats({ surveys }: AdminStatsProps) {
  const [showData, setShowData] = useState(true);

  if (surveys.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4">
        <div className="text-6xl mb-4 opacity-50">📊</div>
        <p className="text-slate-500 text-xl font-medium">No survey data available yet.</p>
        <p className="text-slate-400 text-sm mt-2">Start collecting surveys to see analytics here.</p>
      </div>
    );
  }

  // Civil Status distribution
  const statusData = Object.entries(
    surveys.reduce(
      (acc, curr) => {
        acc[curr.civilStatus] = (acc[curr.civilStatus] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    ),
  ).map(([name, value]) => ({ name, value }));

  // Age Group distribution
  const ageGroupData = Object.entries(
    surveys.reduce(
      (acc, curr) => {
        acc[curr.youthAgeGroup] = (acc[curr.youthAgeGroup] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    ),
  ).map(([name, value]) => ({ name, value }));

  // Work Status distribution
  const workStatusData = Object.entries(
    surveys.reduce(
      (acc, curr) => {
        acc[curr.workStatus] = (acc[curr.workStatus] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    ),
  ).map(([name, value]) => ({ name, value }));

  // Youth Classification distribution
  const classificationData = Object.entries(
    surveys.reduce(
      (acc, curr) => {
        acc[curr.youthClassification] =
          (acc[curr.youthClassification] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    ),
  ).map(([name, value]) => ({ name, value }));

  // Sex distribution
  const sexData = Object.entries(
    surveys.reduce(
      (acc, curr) => {
        acc[curr.sex] = (acc[curr.sex] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    ),
  ).map(([name, value]) => ({ name, value }));

  // KK Assembly Attendance
  const kkAssemblyData = [
    {
      name: "Attended",
      value: surveys.filter((s) => s.attendedKkAssembly === true).length,
    },
    {
      name: "Did Not Attend",
      value: surveys.filter((s) => s.attendedKkAssembly === false).length,
    },
  ];

  // Voter Registration statistics
  const voterData = [
    {
      name: "SK Voter",
      registered: surveys.filter((s) => s.registeredSkVoter === true).length,
      notRegistered: surveys.filter((s) => s.registeredSkVoter === false)
        .length,
    },
    {
      name: "National Voter",
      registered: surveys.filter((s) => s.registeredNationalVoter === true)
        .length,
      notRegistered: surveys.filter((s) => s.registeredNationalVoter === false)
        .length,
    },
  ];

  // Voter Registration Combinations
  const voterCombinationsData = [
    {
      name: "Both Registered",
      value: surveys.filter(
        (s) => s.registeredSkVoter === true && s.registeredNationalVoter === true
      ).length,
    },
    {
      name: "SK Only",
      value: surveys.filter(
        (s) => s.registeredSkVoter === true && s.registeredNationalVoter === false
      ).length,
    },
    {
      name: "National Only",
      value: surveys.filter(
        (s) => s.registeredSkVoter === false && s.registeredNationalVoter === true
      ).length,
    },
    {
      name: "Neither",
      value: surveys.filter(
        (s) => s.registeredSkVoter === false && s.registeredNationalVoter === false
      ).length,
    },
  ];

  // Educational Background distribution
  const educationData = Object.entries(
    surveys.reduce(
      (acc, curr) => {
        acc[curr.educationalBackground] =
          (acc[curr.educationalBackground] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    ),
  ).map(([name, value]) => ({ name, value }));

  return (
    <div className="space-y-6">
      {/* Header with total count and toggle button */}
      <div className="bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 border-2 border-blue-300 rounded-xl p-6 shadow-lg">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="space-y-2">
            <div className="flex items-baseline gap-3">
              <span className="text-5xl font-extrabold text-blue-600">
                {surveys.length}
              </span>
              <span className="text-xl text-slate-700 font-semibold">Total Youth Profiles</span>
            </div>
            <p className="text-sm text-slate-600 font-medium">
              📊 Comprehensive statistics and analytics dashboard
            </p>
          </div>
          <Button
            onClick={() => setShowData(!showData)}
            variant={showData ? "default" : "outline"}
            size="lg"
            className="rounded-lg font-semibold shadow-md hover:shadow-lg transition-all"
          >
            {showData ? "📉 Hide Detailed Data" : "📊 Show Detailed Data"}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">

        {/* Age Group Card */}
        <Card className="shadow-md hover:shadow-xl transition-all duration-300 border-indigo-200 bg-gradient-to-br from-white to-indigo-50/50 overflow-hidden">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-bold text-indigo-600 flex items-center gap-2">
              <span>👥</span>
              <span>Youth Age Groups</span>
            </CardTitle>
            <p className="text-xs text-slate-500 mt-1 font-medium">
              {ageGroupData.reduce((sum, item) => sum + item.value, 0)} respondents
            </p>
          </CardHeader>
          <CardContent className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={ageGroupData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {ageGroupData.map((_, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip
                  content={
                    <CustomTooltip
                      total={ageGroupData.reduce(
                        (sum, item) => sum + item.value,
                        0,
                      )}
                    />
                  }
                />
                <Legend verticalAlign="bottom" height={36} iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
          {showData && (
            <CardContent className="pt-4 border-t-2 border-indigo-100 bg-indigo-50/30 transition-all duration-300">
              <div className="space-y-2">
                {ageGroupData.map((item, index) => {
                  const percentage = (
                    (item.value /
                      ageGroupData.reduce((sum, i) => sum + i.value, 0)) *
                    100
                  ).toFixed(1);
                  const color = COLORS[index % COLORS.length];
                  return (
                    <div
                      key={item.name}
                      className="flex justify-between items-center text-sm p-2.5 rounded-md hover:bg-white/70 transition-colors border border-transparent hover:border-indigo-200"
                    >
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full shadow-sm flex-shrink-0"
                          style={{ backgroundColor: color }}
                        ></div>
                        <span className="text-slate-700 font-medium text-xs">
                          {item.name}
                        </span>
                      </div>
                      <span className="text-slate-800 font-bold bg-white px-2.5 py-1 rounded shadow-sm text-xs">
                        {item.value} <span className="text-indigo-600">({percentage}%)</span>
                      </span>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          )}
        </Card>

        {/* Civil Status Card */}
        <Card className="shadow-md hover:shadow-xl transition-all duration-300 border-pink-200 bg-gradient-to-br from-white to-pink-50/50 overflow-hidden">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-bold text-pink-600 flex items-center gap-2">
              <span>💑</span>
              <span>Civil Status</span>
            </CardTitle>
            <p className="text-xs text-slate-500 mt-1 font-medium">
              {statusData.reduce((sum, item) => sum + item.value, 0)} respondents
            </p>
          </CardHeader>
          <CardContent className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {statusData.map((_, index) => (
                    <Cell
                      key={`cell-status-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip
                  content={
                    <CustomTooltip
                      total={statusData.reduce(
                        (sum, item) => sum + item.value,
                        0,
                      )}
                    />
                  }
                />
                <Legend verticalAlign="bottom" height={36} iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
          {showData && (
            <CardContent className="pt-4 border-t-2 border-pink-100 bg-pink-50/30 transition-all duration-300">
              <div className="space-y-2">
                {statusData.map((item, index) => {
                  const percentage = (
                    (item.value /
                      statusData.reduce((sum, i) => sum + i.value, 0)) *
                    100
                  ).toFixed(1);
                  const color = COLORS[index % COLORS.length];
                  return (
                    <div
                      key={item.name}
                      className="flex justify-between items-center text-sm p-2.5 rounded-md hover:bg-white/70 transition-colors border border-transparent hover:border-pink-200"
                    >
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full shadow-sm flex-shrink-0"
                          style={{ backgroundColor: color }}
                        ></div>
                        <span className="text-slate-700 font-medium text-xs">
                          {item.name}
                        </span>
                      </div>
                      <span className="text-slate-800 font-bold bg-white px-2.5 py-1 rounded shadow-sm text-xs">
                        {item.value} <span className="text-pink-600">({percentage}%)</span>
                      </span>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          )}
        </Card>

        {/* Sex Distribution Card */}
        <Card className="shadow-md hover:shadow-xl transition-all duration-300 border-cyan-200 bg-gradient-to-br from-white to-cyan-50/50 overflow-hidden">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-bold text-cyan-600 flex items-center gap-2">
              <span>👫</span>
              <span>Sex Distribution</span>
            </CardTitle>
            <p className="text-xs text-slate-500 mt-1 font-medium">
              {sexData.reduce((sum, item) => sum + item.value, 0)} respondents
            </p>
          </CardHeader>
          <CardContent className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={sexData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {sexData.map((_, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip
                  content={
                    <CustomTooltip
                      total={sexData.reduce((sum, item) => sum + item.value, 0)}
                    />
                  }
                />
                <Legend verticalAlign="bottom" height={36} iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
          {showData && (
            <CardContent className="pt-4 border-t-2 border-cyan-100 bg-cyan-50/30 transition-all duration-300">
              <div className="space-y-2">
                {sexData.map((item, index) => {
                  const percentage = (
                    (item.value /
                      sexData.reduce((sum, i) => sum + i.value, 0)) *
                    100
                  ).toFixed(1);
                  const color = COLORS[index % COLORS.length];
                  return (
                    <div
                      key={item.name}
                      className="flex justify-between items-center text-sm p-2.5 rounded-md hover:bg-white/70 transition-colors border border-transparent hover:border-cyan-200"
                    >
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full shadow-sm flex-shrink-0"
                          style={{ backgroundColor: color }}
                        ></div>
                        <span className="text-slate-700 font-medium text-xs">
                          {item.name}
                        </span>
                      </div>
                      <span className="text-slate-800 font-bold bg-white px-2.5 py-1 rounded shadow-sm text-xs">
                        {item.value} <span className="text-cyan-600">({percentage}%)</span>
                      </span>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          )}
        </Card>

        {/* Work Status Card */}
        <Card className="shadow-md hover:shadow-xl transition-all duration-300 border-orange-200 bg-gradient-to-br from-white to-orange-50/50 overflow-hidden">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-bold text-orange-600 flex items-center gap-2">
              <span>💼</span>
              <span>Work Status</span>
            </CardTitle>
            <p className="text-xs text-slate-500 mt-1 font-medium">
              {workStatusData.reduce((sum, item) => sum + item.value, 0)} respondents
            </p>
          </CardHeader>
          <CardContent className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={workStatusData}
                layout="vertical"
                margin={{ left: 40 }}
              >
                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" hide />
                <YAxis
                  dataKey="name"
                  type="category"
                  width={100}
                  tick={{ fontSize: 10 }}
                />
                <Tooltip
                  content={
                    <CustomTooltip
                      total={workStatusData.reduce(
                        (sum, item) => sum + item.value,
                        0,
                      )}
                    />
                  }
                  cursor={{ fill: "transparent" }}
                />
                <Bar
                  dataKey="value"
                  fill="#f97316"
                  radius={[0, 4, 4, 0]}
                  barSize={20}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
          {showData && (
            <CardContent className="pt-4 border-t-2 border-orange-100 bg-orange-50/30 transition-all duration-300">
              <div className="space-y-2">
                {workStatusData.map((item, index) => {
                  const percentage = (
                    (item.value /
                      workStatusData.reduce((sum, i) => sum + i.value, 0)) *
                    100
                  ).toFixed(1);
                  const color = COLORS[index % COLORS.length];
                  return (
                    <div
                      key={item.name}
                      className="flex justify-between items-center text-sm p-2.5 rounded-md hover:bg-white/70 transition-colors border border-transparent hover:border-orange-200"
                    >
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full shadow-sm flex-shrink-0"
                          style={{ backgroundColor: color }}
                        ></div>
                        <span className="text-slate-700 font-medium text-xs">
                          {item.name}
                        </span>
                      </div>
                      <span className="text-slate-800 font-bold bg-white px-2.5 py-1 rounded shadow-sm text-xs">
                        {item.value} <span className="text-orange-600">({percentage}%)</span>
                      </span>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          )}
        </Card>

        {/* Youth Classification Card */}
        <Card className="shadow-md hover:shadow-xl transition-all duration-300 border-purple-200 bg-gradient-to-br from-white to-purple-50/50 overflow-hidden">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-bold text-purple-600 flex items-center gap-2">
              <span>🎓</span>
              <span>Youth Classification</span>
            </CardTitle>
            <p className="text-xs text-slate-500 mt-1 font-medium">
              {classificationData.reduce((sum, item) => sum + item.value, 0)} respondents
            </p>
          </CardHeader>
          <CardContent className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={classificationData} margin={{ top: 20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 10 }}
                  interval={0}
                  angle={-25}
                  textAnchor="end"
                  height={60}
                />
                <YAxis allowDecimals={false} />
                <Tooltip
                  content={
                    <CustomTooltip
                      total={classificationData.reduce(
                        (sum, item) => sum + item.value,
                        0,
                      )}
                    />
                  }
                  cursor={{ fill: "#f1f5f9" }}
                />
                <Bar
                  dataKey="value"
                  fill="#4f46e5"
                  radius={[4, 4, 0, 0]}
                  barSize={40}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
          {showData && (
            <CardContent className="pt-4 border-t-2 border-purple-100 bg-purple-50/30 transition-all duration-300">
              <div className="space-y-2">
                {classificationData.map((item, index) => {
                  const percentage = (
                    (item.value /
                      classificationData.reduce((sum, i) => sum + i.value, 0)) *
                    100
                  ).toFixed(1);
                  const color = COLORS[index % COLORS.length];
                  return (
                    <div
                      key={item.name}
                      className="flex justify-between items-center text-sm p-2.5 rounded-md hover:bg-white/70 transition-colors border border-transparent hover:border-purple-200"
                    >
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full shadow-sm flex-shrink-0"
                          style={{ backgroundColor: color }}
                        ></div>
                        <span className="text-slate-700 font-medium text-xs">
                          {item.name}
                        </span>
                      </div>
                      <span className="text-slate-800 font-bold bg-white px-2.5 py-1 rounded shadow-sm text-xs">
                        {item.value} <span className="text-purple-600">({percentage}%)</span>
                      </span>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          )}
        </Card>

        {/* Educational Background Card */}
        <Card className="shadow-md hover:shadow-xl transition-all duration-300 border-emerald-200 bg-gradient-to-br from-white to-emerald-50/50 overflow-hidden">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-bold text-emerald-600 flex items-center gap-2">
              <span>📚</span>
              <span>Educational Background</span>
            </CardTitle>
            <p className="text-xs text-slate-500 mt-1 font-medium">
              {educationData.reduce((sum, item) => sum + item.value, 0)} respondents
            </p>
          </CardHeader>
          <CardContent className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={educationData} margin={{ top: 20, bottom: 50 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 9 }}
                  interval={0}
                  angle={-45}
                  textAnchor="end"
                  height={70}
                />
                <YAxis allowDecimals={false} />
                <Tooltip
                  content={
                    <CustomTooltip
                      total={educationData.reduce(
                        (sum, item) => sum + item.value,
                        0,
                      )}
                    />
                  }
                  cursor={{ fill: "#f1f5f9" }}
                />
                <Bar
                  dataKey="value"
                  fill="#10b981"
                  radius={[4, 4, 0, 0]}
                  barSize={40}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
          {showData && (
            <CardContent className="pt-4 border-t-2 border-emerald-100 bg-emerald-50/30 transition-all duration-300">
              <div className="space-y-2">
                {educationData.map((item, index) => {
                  const percentage = (
                    (item.value /
                      educationData.reduce((sum, i) => sum + i.value, 0)) *
                    100
                  ).toFixed(1);
                  const color = COLORS[index % COLORS.length];
                  return (
                    <div
                      key={item.name}
                      className="flex justify-between items-center text-sm p-2.5 rounded-md hover:bg-white/70 transition-colors border border-transparent hover:border-emerald-200"
                    >
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full shadow-sm flex-shrink-0"
                          style={{ backgroundColor: color }}
                        ></div>
                        <span className="text-slate-700 font-medium text-xs">
                          {item.name}
                        </span>
                      </div>
                      <span className="text-slate-800 font-bold bg-white px-2.5 py-1 rounded shadow-sm text-xs">
                        {item.value} <span className="text-emerald-600">({percentage}%)</span>
                      </span>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          )}
        </Card>

        {/* KK Assembly Attendance Card */}
        <Card className="shadow-md hover:shadow-xl transition-all duration-300 border-violet-200 bg-gradient-to-br from-white to-violet-50/50 overflow-hidden">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-bold text-violet-600 flex items-center gap-2">
              <span>🗳️</span>
              <span>KK Assembly Attendance</span>
            </CardTitle>
            <p className="text-xs text-slate-500 mt-1 font-medium">
              {kkAssemblyData.reduce((sum, item) => sum + item.value, 0)} respondents
            </p>
          </CardHeader>
          <CardContent className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={kkAssemblyData} margin={{ top: 20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                <YAxis allowDecimals={false} />
                <Tooltip
                  content={
                    <CustomTooltip
                      total={kkAssemblyData.reduce(
                        (sum, item) => sum + item.value,
                        0,
                      )}
                    />
                  }
                  cursor={{ fill: "#f1f5f9" }}
                />
                <Bar
                  dataKey="value"
                  fill="#8b5cf6"
                  radius={[4, 4, 0, 0]}
                  barSize={60}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
          {showData && (
            <CardContent className="pt-4 border-t-2 border-violet-100 bg-violet-50/30 transition-all duration-300">
              <div className="space-y-2">
                {kkAssemblyData.map((item, index) => {
                  const percentage = (
                    (item.value /
                      kkAssemblyData.reduce((sum, i) => sum + i.value, 0)) *
                    100
                  ).toFixed(1);
                  const color = COLORS[index % COLORS.length];
                  return (
                    <div
                      key={item.name}
                      className="flex justify-between items-center text-sm p-2.5 rounded-md hover:bg-white/70 transition-colors border border-transparent hover:border-violet-200"
                    >
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full shadow-sm flex-shrink-0"
                          style={{ backgroundColor: color }}
                        ></div>
                        <span className="text-slate-700 font-medium text-xs">
                          {item.name}
                        </span>
                      </div>
                      <span className="text-slate-800 font-bold bg-white px-2.5 py-1 rounded shadow-sm text-xs">
                        {item.value} <span className="text-violet-600">({percentage}%)</span>
                      </span>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          )}
        </Card>

        {/* Voter Registration Details Card */}
        <Card className="shadow-md hover:shadow-xl transition-all duration-300 border-rose-200 bg-gradient-to-br from-white to-rose-50/50 overflow-hidden">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-bold text-rose-600 flex items-center gap-2">
              <span>✅</span>
              <span>Voter Registration Details</span>
            </CardTitle>
            <p className="text-xs text-slate-500 mt-1 font-medium">
              {surveys.length} respondents
            </p>
          </CardHeader>
          <CardContent className="h-[280px] py-6">
            <div className="flex flex-col gap-6">
              {voterData.map((voter) => {
                const totalVoters = voter.registered + voter.notRegistered;
                const registeredPct =
                  totalVoters > 0
                    ? ((voter.registered / totalVoters) * 100).toFixed(1)
                    : "0.0";
                return (
                  <div key={voter.name} className="space-y-2">
                    <p className="text-sm font-semibold text-slate-700">
                      {voter.name}
                    </p>
                    <div className="flex gap-3">
                      <div className="flex-1">
                        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg px-3 py-3 text-center border-2 border-green-300 shadow-sm">
                          <p className="text-lg text-green-700 font-extrabold">
                            {voter.registered}
                          </p>
                          <p className="text-xs text-green-600 font-semibold mt-0.5">
                            {registeredPct}% Registered
                          </p>
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-lg px-3 py-3 text-center border-2 border-red-300 shadow-sm">
                          <p className="text-lg text-red-700 font-extrabold">
                            {voter.notRegistered}
                          </p>
                          <p className="text-xs text-red-600 font-semibold mt-0.5">
                            {(100 - parseFloat(registeredPct)).toFixed(1)}% Not Reg.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
          {showData && (
            <CardContent className="pt-4 border-t-2 border-rose-100 bg-rose-50/30 transition-all duration-300">
              <div className="space-y-3">
                {voterData.map((voter, voterIndex) => {
                  const totalVoters = voter.registered + voter.notRegistered;
                  const registeredPct =
                    totalVoters > 0
                      ? ((voter.registered / totalVoters) * 100).toFixed(1)
                      : "0.0";
                  const registeredColor = COLORS[voterIndex % COLORS.length];
                  const notRegisteredColor =
                    COLORS[(voterIndex + 1) % COLORS.length];
                  return (
                    <div key={voter.name} className="space-y-2 p-3 rounded-lg hover:bg-white/60 transition-colors border border-rose-100">
                      <p className="text-sm font-bold text-slate-800">
                        {voter.name}
                      </p>
                      <div className="pl-1 space-y-2 text-xs">
                        <div className="flex justify-between items-center p-2 bg-green-50 rounded border border-green-200">
                          <div className="flex items-center gap-2">
                            <div
                              className="w-2.5 h-2.5 rounded-full shadow-sm flex-shrink-0"
                              style={{ backgroundColor: registeredColor }}
                            ></div>
                            <span className="text-slate-700 font-medium">Registered</span>
                          </div>
                          <span className="font-bold text-slate-800 bg-white px-2.5 py-1 rounded shadow-sm">
                            {voter.registered} <span className="text-green-600">({registeredPct}%)</span>
                          </span>
                        </div>
                        <div className="flex justify-between items-center p-2 bg-red-50 rounded border border-red-200">
                          <div className="flex items-center gap-2">
                            <div
                              className="w-2.5 h-2.5 rounded-full shadow-sm flex-shrink-0"
                              style={{ backgroundColor: notRegisteredColor }}
                            ></div>
                            <span className="text-slate-700 font-medium">Not Registered</span>
                          </div>
                          <span className="font-bold text-slate-800 bg-white px-2.5 py-1 rounded shadow-sm">
                            {voter.notRegistered} <span className="text-red-600">(
                            {(100 - parseFloat(registeredPct)).toFixed(1)}%)</span>
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          )}
        </Card>

        {/* Voter Registration Overview Card */}
        <Card className="shadow-md hover:shadow-xl transition-all duration-300 border-amber-200 bg-gradient-to-br from-white to-amber-50/50 overflow-hidden">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-bold text-amber-600 flex items-center gap-2">
              <span>📋</span>
              <span>Voter Registration Overview</span>
            </CardTitle>
            <p className="text-xs text-slate-500 mt-1 font-medium">
              {voterCombinationsData.reduce((sum, item) => sum + item.value, 0)} respondents
            </p>
          </CardHeader>
          <CardContent className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={voterCombinationsData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {voterCombinationsData.map((_, index) => (
                    <Cell
                      key={`cell-voter-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip
                  content={
                    <CustomTooltip
                      total={voterCombinationsData.reduce(
                        (sum, item) => sum + item.value,
                        0,
                      )}
                    />
                  }
                />
                <Legend verticalAlign="bottom" height={36} iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
          {showData && (
            <CardContent className="pt-4 border-t-2 border-amber-100 bg-amber-50/30 transition-all duration-300">
              <div className="space-y-2">
                {voterCombinationsData.map((item, index) => {
                  const percentage = (
                    (item.value /
                      voterCombinationsData.reduce((sum, i) => sum + i.value, 0)) *
                    100
                  ).toFixed(1);
                  const color = COLORS[index % COLORS.length];
                  return (
                    <div
                      key={item.name}
                      className="flex justify-between items-center text-sm p-2.5 rounded-md hover:bg-white/70 transition-colors border border-transparent hover:border-amber-200"
                    >
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full shadow-sm flex-shrink-0"
                          style={{ backgroundColor: color }}
                        ></div>
                        <span className="text-slate-700 font-medium text-xs">
                          {item.name}
                        </span>
                      </div>
                      <span className="text-slate-800 font-bold bg-white px-2.5 py-1 rounded shadow-sm text-xs">
                        {item.value} <span className="text-amber-600">({percentage}%)</span>
                      </span>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          )}
        </Card>
      </div>
    </div>
  );
}
