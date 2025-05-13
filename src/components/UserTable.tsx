
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { 
  Table, 
  TableHeader, 
  TableRow, 
  TableHead, 
  TableBody, 
  TableCell 
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { MoreHorizontal, UserCheck, UserX } from "lucide-react";

interface User {
  id: string;
  username: string;
  telegramId: string;
  role: "admin" | "user" | "blocked";
  requestsToday: number;
  lastActive: string;
  joinDate: string;
}

const mockUsers: User[] = [
  {
    id: "1",
    username: "alex_smith",
    telegramId: "12345678",
    role: "admin",
    requestsToday: 15,
    lastActive: "2 mins ago",
    joinDate: "2023-05-10",
  },
  {
    id: "2",
    username: "maria_garcia",
    telegramId: "23456789",
    role: "user",
    requestsToday: 42,
    lastActive: "15 mins ago",
    joinDate: "2023-08-22",
  },
  {
    id: "3",
    username: "john_doe",
    telegramId: "34567890",
    role: "user",
    requestsToday: 7,
    lastActive: "1 hour ago",
    joinDate: "2023-12-05",
  },
  {
    id: "4",
    username: "spammer123",
    telegramId: "45678901",
    role: "blocked",
    requestsToday: 0,
    lastActive: "30 days ago",
    joinDate: "2024-01-15",
  },
  {
    id: "5",
    username: "lisa_wong",
    telegramId: "56789012",
    role: "user",
    requestsToday: 28,
    lastActive: "45 mins ago",
    joinDate: "2024-02-19",
  },
];

const UserTable = () => {
  const [users, setUsers] = useState<User[]>(mockUsers);

  const getRoleBadge = (role: User['role']) => {
    switch (role) {
      case 'admin':
        return <Badge className="bg-blue-500">Admin</Badge>;
      case 'user':
        return <Badge className="bg-green-500">User</Badge>;
      case 'blocked':
        return <Badge variant="destructive">Blocked</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const toggleUserBlock = (userId: string) => {
    setUsers(users.map(user => {
      if (user.id === userId) {
        return {
          ...user,
          role: user.role === 'blocked' ? 'user' : 'blocked'
        };
      }
      return user;
    }));
  };

  return (
    <div className="border border-border rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Username</TableHead>
            <TableHead>Telegram ID</TableHead>
            <TableHead>Role</TableHead>
            <TableHead className="text-right">Requests Today</TableHead>
            <TableHead>Last Active</TableHead>
            <TableHead>Join Date</TableHead>
            <TableHead className="w-[80px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map(user => (
            <TableRow key={user.id}>
              <TableCell className="font-medium">{user.username}</TableCell>
              <TableCell>{user.telegramId}</TableCell>
              <TableCell>{getRoleBadge(user.role)}</TableCell>
              <TableCell className="text-right">{user.requestsToday}</TableCell>
              <TableCell>{user.lastActive}</TableCell>
              <TableCell>{user.joinDate}</TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => toggleUserBlock(user.id)}>
                      {user.role === 'blocked' ? (
                        <>
                          <UserCheck className="mr-2 h-4 w-4" />
                          <span>Unblock User</span>
                        </>
                      ) : (
                        <>
                          <UserX className="mr-2 h-4 w-4" />
                          <span>Block User</span>
                        </>
                      )}
                    </DropdownMenuItem>
                    <DropdownMenuItem>View Details</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default UserTable;
