# UI Components - Usage Examples

## Complete Examples for All Components

### Button Examples

```javascript
import { Button } from './components/ui';
import { Plus, Download, Trash2 } from 'lucide-react';

// Primary action
<Button variant="primary" icon={Plus}>
  Add User
</Button>

// Loading state
<Button variant="primary" loading={isSubmitting}>
  Saving...
</Button>

// Danger action
<Button variant="danger" icon={Trash2} onClick={handleDelete}>
  Delete
</Button>

// Full width
<Button variant="primary" fullWidth>
  Continue
</Button>

// Different sizes
<Button size="sm">Small</Button>
<Button size="md">Medium</Button>
<Button size="lg">Large</Button>
<Button size="xl">Extra Large</Button>

// Icon positions
<Button icon={Download} iconPosition="left">Download</Button>
<Button icon={Download} iconPosition="right">Download</Button>
```

### Input Examples

```javascript
import { Input, Textarea, Select } from './components/ui';
import { User, Mail, Lock } from 'lucide-react';

// Text input with icon
<Input
  label="Username"
  icon={User}
  placeholder="Enter username"
  value={username}
  onChange={(e) => setUsername(e.target.value)}
  required
/>

// Input with error
<Input
  label="Email"
  icon={Mail}
  type="email"
  value={email}
  error="Invalid email address"
/>

// Input with helper text
<Input
  label="Password"
  icon={Lock}
  type="password"
  helperText="Must be at least 8 characters"
/>

// Textarea
<Textarea
  label="Description"
  rows={4}
  placeholder="Enter description..."
  value={description}
  onChange={(e) => setDescription(e.target.value)}
/>

// Select dropdown
<Select
  label="Role"
  options={[
    { value: '', label: 'Select Role' },
    { value: 'admin', label: 'Administrator' },
    { value: 'instructor', label: 'Instructor' },
    { value: 'student', label: 'Student' }
  ]}
  value={role}
  onChange={(e) => setRole(e.target.value)}
  required
/>
```

### Card Examples

```javascript
import { Card, CardHeader, CardBody, CardFooter, Button } from './components/ui';

// Simple card
<Card title="User Profile" subtitle="Manage your account">
  <p>Card content goes here</p>
</Card>

// Card with actions
<Card
  title="Settings"
  actions={
    <>
      <Button size="sm" variant="outline">Cancel</Button>
      <Button size="sm">Save</Button>
    </>
  }
>
  <p>Settings content</p>
</Card>

// Hoverable card
<Card hoverable onClick={handleClick}>
  <p>Click me!</p>
</Card>

// Card with sections
<Card>
  <CardHeader>
    <h3 className="text-lg font-bold">Custom Header</h3>
  </CardHeader>
  <CardBody>
    <p>Main content area</p>
  </CardBody>
  <CardFooter>
    <Button fullWidth>Action</Button>
  </CardFooter>
</Card>
```

### Modal Examples

```javascript
import { Modal, Button, Input } from './components/ui';

const [isOpen, setIsOpen] = useState(false);

// Basic modal
<Modal
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  title="Add New User"
>
  <p>Modal content here</p>
</Modal>

// Modal with form
<Modal
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  title="Create Assignment"
  size="lg"
  footer={
    <div className="flex space-x-3">
      <Button variant="outline" onClick={() => setIsOpen(false)}>
        Cancel
      </Button>
      <Button onClick={handleSubmit}>
        Create
      </Button>
    </div>
  }
>
  <form className="space-y-4">
    <Input label="Title" required />
    <Textarea label="Description" rows={4} />
    <Input label="Due Date" type="datetime-local" />
  </form>
</Modal>

// Full screen modal
<Modal
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  title="Large Content"
  size="full"
>
  <p>Full screen content</p>
</Modal>
```

### Table Examples

```javascript
import { Table, Badge, Button } from './components/ui';
import { Edit2, Trash2 } from 'lucide-react';

const columns = [
  {
    header: 'Name',
    accessor: 'name',
    render: (row) => (
      <div>
        <div className="font-medium text-gray-900">{row.name}</div>
        <div className="text-sm text-gray-500">{row.email}</div>
      </div>
    )
  },
  {
    header: 'Role',
    accessor: 'role',
    render: (row) => (
      <Badge variant={row.role === 'ADMIN' ? 'danger' : 'primary'}>
        {row.role}
      </Badge>
    )
  },
  {
    header: 'Status',
    accessor: 'status',
    align: 'center',
    render: (row) => (
      <Badge variant={row.active ? 'success' : 'default'}>
        {row.active ? 'Active' : 'Inactive'}
      </Badge>
    )
  },
  {
    header: 'Actions',
    align: 'right',
    render: (row) => (
      <div className="flex items-center justify-end space-x-2">
        <Button size="sm" variant="ghost" icon={Edit2} />
        <Button size="sm" variant="ghost" icon={Trash2} />
      </div>
    )
  }
];

<Table
  columns={columns}
  data={users}
  onRowClick={(row) => console.log('Clicked:', row)}
  emptyMessage="No users found"
/>
```

### FileUpload Examples

```javascript
import { FileUpload } from './components/ui';

// Single file upload
<FileUpload
  label="Upload PDF"
  accept=".pdf"
  maxSize={5 * 1024 * 1024}  // 5MB
  value={file}
  onChange={setFile}
  helperText="PDF files only, max 5MB"
/>

// Multiple files
<FileUpload
  label="Upload Documents"
  accept=".pdf,.doc,.docx"
  multiple
  value={files}
  onChange={setFiles}
/>

// With error
<FileUpload
  label="Upload Image"
  accept="image/*"
  value={image}
  onChange={setImage}
  error="File size exceeds maximum limit"
/>
```

### Loader Examples

```javascript
import { Loader, Spinner } from './components/ui';

// Full screen loader
<Loader size="lg" text="Loading..." fullScreen />

// Inline loader
<Loader size="md" text="Processing..." />

// Simple spinner
<Spinner size="sm" />

// In a component
{loading && <Loader size="md" text="Loading data..." />}
```

### Skeleton Examples

```javascript
import { Skeleton, SkeletonCard, SkeletonTable, SkeletonList } from './components/ui';

// Basic skeleton
<Skeleton width="200px" height="20px" />

// Card skeleton
{loading ? <SkeletonCard /> : <Card>...</Card>}

// Table skeleton
{loading ? <SkeletonTable rows={5} columns={4} /> : <Table>...</Table>}

// List skeleton
{loading ? <SkeletonList items={3} /> : <UserList />}

// Custom skeleton
<div className="space-y-4">
  <Skeleton variant="circular" width="48px" height="48px" />
  <Skeleton variant="text" width="60%" />
  <Skeleton variant="rectangular" height="200px" />
</div>
```

### Badge Examples

```javascript
import { Badge } from './components/ui';

// Status badges
<Badge variant="success">Active</Badge>
<Badge variant="danger">Inactive</Badge>
<Badge variant="warning">Pending</Badge>
<Badge variant="info">Draft</Badge>

// Different sizes
<Badge size="sm">Small</Badge>
<Badge size="md">Medium</Badge>
<Badge size="lg">Large</Badge>

// In a table
<Badge variant={user.active ? 'success' : 'default'}>
  {user.active ? 'Active' : 'Inactive'}
</Badge>
```

### Alert Examples

```javascript
import { Alert } from './components/ui';

// Success alert
<Alert variant="success" title="Success!">
  Your changes have been saved successfully.
</Alert>

// Error alert
<Alert variant="error" title="Error">
  Failed to save changes. Please try again.
</Alert>

// Info alert
<Alert variant="info">
  Your session will expire in 5 minutes.
</Alert>

// Warning with close button
<Alert 
  variant="warning" 
  title="Warning"
  onClose={() => setShowAlert(false)}
>
  This action cannot be undone.
</Alert>
```

## Complete Form Example

```javascript
import { useState } from 'react';
import { 
  Card, 
  Input, 
  Textarea, 
  Select, 
  Button, 
  FileUpload,
  Alert 
} from './components/ui';

const CreateAssignmentForm = () => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    section: '',
    dueDate: '',
    maxPoints: 100,
  });
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    // Submit logic
  };

  return (
    <Card title="Create Assignment" subtitle="Set up a new assignment for students">
      {error && (
        <Alert variant="error" onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="space-y-4 mt-4">
        <Input
          label="Assignment Title"
          placeholder="Enter assignment title"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          required
        />

        <Select
          label="Section"
          options={[
            { value: '', label: 'Select Section' },
            { value: '1', label: 'Section A' },
            { value: '2', label: 'Section B' }
          ]}
          value={formData.section}
          onChange={(e) => setFormData({ ...formData, section: e.target.value })}
          required
        />

        <Textarea
          label="Description"
          placeholder="Enter assignment description"
          rows={4}
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          required
        />

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Due Date"
            type="datetime-local"
            value={formData.dueDate}
            onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
            required
          />
          <Input
            label="Max Points"
            type="number"
            value={formData.maxPoints}
            onChange={(e) => setFormData({ ...formData, maxPoints: e.target.value })}
            required
          />
        </div>

        <FileUpload
          label="Attachment (Optional)"
          accept=".pdf,.doc,.docx"
          value={file}
          onChange={setFile}
          helperText="Upload assignment materials"
        />

        <div className="flex space-x-3 pt-4">
          <Button type="submit" variant="primary" loading={loading} fullWidth>
            Create Assignment
          </Button>
          <Button type="button" variant="outline" fullWidth>
            Cancel
          </Button>
        </div>
      </form>
    </Card>
  );
};
```

## Complete Dashboard Example

```javascript
import { 
  Card, 
  Button, 
  Table, 
  Badge, 
  Loader,
  SkeletonCard 
} from './components/ui';
import { Users, Plus } from 'lucide-react';

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);

  const columns = [
    { header: 'Name', accessor: 'name' },
    { 
      header: 'Status', 
      render: (row) => (
        <Badge variant={row.active ? 'success' : 'default'}>
          {row.active ? 'Active' : 'Inactive'}
        </Badge>
      )
    },
    { header: 'Email', accessor: 'email' }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <Button variant="primary" icon={Plus}>
          Add User
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {loading ? (
          <>
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </>
        ) : (
          <>
            <Card>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Users</p>
                  <p className="text-2xl font-bold mt-2">1,234</p>
                </div>
                <Users className="h-8 w-8 text-blue-500" />
              </div>
            </Card>
            {/* More cards... */}
          </>
        )}
      </div>

      {/* Users Table */}
      <Card title="Recent Users">
        {loading ? (
          <Loader text="Loading users..." />
        ) : (
          <Table columns={columns} data={users} />
        )}
      </Card>
    </div>
  );
};
```

---

These examples demonstrate how to use all UI components in real-world scenarios. Copy and adapt them for your specific needs!
