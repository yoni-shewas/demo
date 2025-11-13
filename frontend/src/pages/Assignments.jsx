import { ClipboardList, Plus } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';

const Assignments = () => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Assignments</h1>
          <p className="text-muted-foreground">Manage and create assignments</p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Create Assignment
        </Button>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Assignment Management</CardTitle>
          <CardDescription>Feature in development</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="bg-muted rounded-lg p-12 text-center">
            <ClipboardList className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <p className="font-medium">Assignment List Coming Soon</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Assignments;
