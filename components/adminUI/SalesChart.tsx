"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { price } from "@/lib/price";

interface ChartData {
  date: string;
  totalSales: number;
  orderCount: number;
}

interface SalesChartProps {
  data: ChartData[];
}

export function SalesChart({ data }: SalesChartProps) {
  const formatCurrency = (value: number) => price(value, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const calculateWeeklyData = () => {
    // Group the daily data into weeks
    const weeklyData: ChartData[] = [];
    for (let i = 0; i < data.length; i += 7) {
      const weekData = data.slice(i, Math.min(i + 7, data.length));
      if (weekData.length > 0) {
        const startDate = weekData[0].date;
        const endDate = weekData[weekData.length - 1].date;
        
        const totalSales = weekData.reduce((sum, day) => sum + day.totalSales, 0);
        const orderCount = weekData.reduce((sum, day) => sum + day.orderCount, 0);
        
        weeklyData.push({
          date: `${startDate} - ${endDate}`,
          totalSales,
          orderCount
        });
      }
    }
    return weeklyData;
  };

  const weeklyData = calculateWeeklyData();

  return (
    <Card className="col-span-full">
      <CardHeader>
        <CardTitle>Sales Performance</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="daily">
          <div className="flex justify-between items-center mb-4">
            <TabsList>
              <TabsTrigger value="daily">Daily</TabsTrigger>
              <TabsTrigger value="weekly">Weekly</TabsTrigger>
            </TabsList>
          </div>
          
          <TabsContent value="daily" className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={data}
                margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#8884d8" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis 
                  dataKey="date" 
                  tick={{ fontSize: 12 }}
                  tickFormatter={(value) => {
                    const date = new Date(value);
                    return `${date.getMonth() + 1}/${date.getDate()}`;
                  }}
                  minTickGap={30}
                />
                <YAxis 
                  tickFormatter={formatCurrency}
                  tick={{ fontSize: 12 }}
                />
                <CartesianGrid strokeDasharray="3 3" />
                <Tooltip 
                  formatter={(value: number) => formatCurrency(value)}
                  labelFormatter={(label) => `Date: ${label}`}
                />
                <Legend />
                <Area 
                  type="monotone" 
                  dataKey="totalSales" 
                  name="Sales" 
                  stroke="#8884d8" 
                  fillOpacity={1} 
                  fill="url(#colorSales)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </TabsContent>
          
          <TabsContent value="weekly" className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={weeklyData}
                margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="colorWeeklySales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#82ca9d" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#82ca9d" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis 
                  dataKey="date" 
                  tick={{ fontSize: 10 }}
                />
                <YAxis 
                  tickFormatter={formatCurrency}
                  tick={{ fontSize: 12 }}
                />
                <CartesianGrid strokeDasharray="3 3" />
                <Tooltip 
                  formatter={(value: number) => formatCurrency(value)}
                  labelFormatter={(label) => `Week: ${label}`}
                />
                <Legend />
                <Area 
                  type="monotone" 
                  dataKey="totalSales" 
                  name="Weekly Sales" 
                  stroke="#82ca9d" 
                  fillOpacity={1} 
                  fill="url(#colorWeeklySales)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
