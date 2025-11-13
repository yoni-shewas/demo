import { Send } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';

const Submissions = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Submissions</h1>
        <p className="text-muted-foreground">Track and review student submissions</p>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Submission Management</CardTitle>
          <CardDescription>Feature in development</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="bg-muted rounded-lg p-12 text-center">
            <Send className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <p className="font-medium">Submission Management Coming Soon</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Submissions;
