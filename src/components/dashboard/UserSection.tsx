
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const UserSection = () => (
  <Card className="mt-6">
    <CardHeader>
      <CardTitle>Your Activity</CardTitle>
      <CardDescription>Your recent interactions with the system</CardDescription>
    </CardHeader>
    <CardContent>
      <ul className="space-y-3">
        <li className="flex items-center justify-between border-b border-border pb-2">
          <div>
            <p className="font-medium">Viewed location details</p>
            <p className="text-sm text-muted-foreground">Central Park Café</p>
          </div>
          <p className="text-xs text-muted-foreground">5 mins ago</p>
        </li>
        <li className="flex items-center justify-between border-b border-border pb-2">
          <div>
            <p className="font-medium">Searched locations</p>
            <p className="text-sm text-muted-foreground">"restaurants near downtown"</p>
          </div>
          <p className="text-xs text-muted-foreground">Yesterday</p>
        </li>
        <li className="flex items-center justify-between">
          <div>
            <p className="font-medium">Updated profile</p>
            <p className="text-sm text-muted-foreground">Changed notification settings</p>
          </div>
          <p className="text-xs text-muted-foreground">2 days ago</p>
        </li>
      </ul>
    </CardContent>
  </Card>
);

export default UserSection;
