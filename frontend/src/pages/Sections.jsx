import { School, Plus } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';

const Sections = () => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Sections</h1>
          <p className="text-muted-foreground">Manage sections and batches</p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Create Section
        </Button>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Section Management</CardTitle>
          <CardDescription>Feature in development</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="bg-muted rounded-lg p-12 text-center">
            <School className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <p className="font-medium">Section Management Coming Soon</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Sections;
