
import { useState } from "react";

const UsersTabContent = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="md:col-span-2">
        <div className="space-y-6">
          <div className="rounded-lg border border-border bg-card/30 p-6">
            <h2 className="text-lg font-semibold mb-4">User Activity</h2>
            <div className="h-[300px] flex items-center justify-center">
              <div className="text-muted-foreground">
                User activity chart coming soon
              </div>
            </div>
          </div>
          
          <div className="rounded-lg border bg-card p-6">
            <h2 className="text-lg font-semibold mb-4">Top Active Users</h2>
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                      {String.fromCharCode(65 + i)}
                    </div>
                    <div>
                      <div className="font-medium">User {String.fromCharCode(65 + i)}</div>
                      <div className="text-sm text-muted-foreground">user{i}@example.com</div>
                    </div>
                  </div>
                  <div className="text-sm">{100 - i * 12} requests</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      
      <div className="space-y-6">
        <div className="rounded-lg border bg-card p-6">
          <h2 className="text-lg font-semibold mb-4">User Stats</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="text-muted-foreground">Total Users</div>
              <div className="font-medium">152</div>
            </div>
            <div className="flex items-center justify-between">
              <div className="text-muted-foreground">Active Today</div>
              <div className="font-medium">28</div>
            </div>
            <div className="flex items-center justify-between">
              <div className="text-muted-foreground">New This Week</div>
              <div className="font-medium">12</div>
            </div>
          </div>
        </div>
        
        <div className="rounded-lg border bg-card p-6">
          <h2 className="text-lg font-semibold mb-4">User Types</h2>
          <div className="h-[200px]">
            <div className="flex items-center justify-center h-full text-muted-foreground">
              User type distribution chart
            </div>
          </div>
        </div>
        
        <div className="rounded-lg border bg-card p-6">
          <h2 className="text-lg font-semibold mb-4">Retention Rate</h2>
          <div className="flex flex-col items-center justify-center h-[200px]">
            <div className="text-3xl font-bold">76%</div>
            <div className="text-muted-foreground text-sm">
              Weekly retention rate
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UsersTabContent;
