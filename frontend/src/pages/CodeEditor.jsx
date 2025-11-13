import { FileCode } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';

const CodeEditor = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Code Editor</h1>
        <p className="text-muted-foreground">Write and execute code in multiple languages</p>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Monaco Editor</CardTitle>
          <CardDescription>Integration in progress</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="bg-muted rounded-lg p-12 text-center">
            <FileCode className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <p className="font-medium">Monaco Editor Integration Coming Soon</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CodeEditor;
