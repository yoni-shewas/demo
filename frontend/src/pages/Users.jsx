import { User, Plus } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';

const Users = () => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">User Management</h1>
          <p className="text-muted-foreground">Manage system users and roles</p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Add User
        </Button>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>User Administration</CardTitle>
          <CardDescription>Feature in development</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="bg-muted rounded-lg p-12 text-center">
            <User className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <p className="font-medium">User Administration Coming Soon</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Users;
