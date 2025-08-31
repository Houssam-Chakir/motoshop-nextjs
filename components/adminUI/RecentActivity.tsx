"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Activity, ShoppingCart, Users, Package } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { price } from "@/lib/price";

interface ActivityItem {
  type: string;
  user?: { name: string; email: string };
  timestamp: string | Date;
  data?: {
    totalAmount?: number;
    status?: string;
    orderId?: string;
  } | null;
}

interface RecentActivityProps {
  activities: ActivityItem[];
}

export function RecentActivity({ activities }: RecentActivityProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="size-5" />
          Recent Activity
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {activities.length === 0 ? (
          <div className="text-center p-4">
            <p className="text-muted-foreground">No recent activity</p>
          </div>
        ) : (
          activities.map((activity, index) => {
            // Format the timestamp
            const timeAgo = formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true });
            
            // Determine the icon and color based on activity type
            let Icon = Activity;
            let bgColor = "bg-gray-100";
            let iconColor = "text-gray-600";
            
            if (activity.type === "new_order") {
              Icon = ShoppingCart;
              bgColor = "bg-green-100";
              iconColor = "text-green-600";
            } else if (activity.type === "new_user") {
              Icon = Users;
              bgColor = "bg-purple-100";
              iconColor = "text-purple-600";
            } else if (activity.type === "new_product") {
              Icon = Package;
              bgColor = "bg-blue-100";
              iconColor = "text-blue-600";
            }
            
            return (
              <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className={`size-8 rounded-full ${bgColor} flex items-center justify-center`}>
                    <Icon className={`size-4 ${iconColor}`} />
                  </div>
                  <div>
                    {activity.type === "new_order" && (
                      <>
                        <p className="font-medium">New order received</p>
                        <p className="text-sm text-muted-foreground">
                          {activity.user?.name || "A customer"} - {price(activity.data?.totalAmount as number, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </p>
                      </>
                    )}
                    {activity.type === "new_user" && (
                      <>
                        <p className="font-medium">New customer registered</p>
                        <p className="text-sm text-muted-foreground">
                          {activity.user?.email}
                        </p>
                      </>
                    )}
                    {activity.type === "new_product" && (
                      <>
                        <p className="font-medium">Product added</p>
                        <p className="text-sm text-muted-foreground">
                          {activity.data?.status}
                        </p>
                      </>
                    )}
                  </div>
                </div>
                <Badge className="bg-gray-100 text-gray-800">{timeAgo}</Badge>
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
}
