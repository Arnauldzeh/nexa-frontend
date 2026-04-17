# 🔧 Component Update Guide - Async Integration

## 📋 Overview

This guide shows how to update all frontend components to use the new async API functions.

---

## 🎯 Pattern to Follow

### Standard Pattern for Data Fetching

```typescript
"use client";

import { useState, useEffect } from "react";
import { getDataFunction } from "@/lib/someStore";
import { getErrorMessage } from "@/services/api/client";

export default function ComponentPage() {
  const [data, setData] = useState<DataType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const result = await getDataFunction();
        setData(result);
      } catch (err: any) {
        setError(getErrorMessage(err));
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-md">
        <p className="text-red-800">Error: {error}</p>
      </div>
    );
  }

  return (
    <div>
      {/* Your component JSX */}
    </div>
  );
}
```

---

## 📝 Components to Update

### 1. Dashboard Page ⏳

**File**: `frontend/src/app/(dashboard)/dashboard/page.tsx`

**Changes needed**:
- Load project stats from API
- Load user count from API
- Load alerts count from API
- Add loading state
- Add error handling

**Functions to use**:
```typescript
import { getProjectStats } from "@/lib/projectStore";
import { getUsers } from "@/lib/userStore";
import { getUnreadCount } from "@/lib/alertStore";
```

---

### 2. Users Page ⏳

**File**: `frontend/src/app/(dashboard)/users/page.tsx`

**Changes needed**:
- Load users from API
- Update create user to use API
- Update edit user to use API
- Update delete user to use API
- Add loading state
- Add error handling

**Functions to use**:
```typescript
import { getUsers, addUser, updateUser, deleteUser } from "@/lib/userStore";
```

**Important**: Update field names:
- `prenom` → `firstName`
- `nom` → `lastName`
- `telephone` → `phone`
- `fonction` → `position`
- `departement` → `department`
- `statut` → `status`

---

### 3. Projects Page ⏳

**File**: `frontend/src/app/(dashboard)/projects/page.tsx`

**Changes needed**:
- Load projects from API
- Update create project to use API
- Update edit project to use API
- Update delete project to use API
- Add loading state
- Add error handling
- Convert budget display using helpers

**Functions to use**:
```typescript
import { getProjects, addProject, updateProject, deleteProject, formatProjectBudget } from "@/lib/projectStore";
```

**Important**: Update structure:
- Use `localisation` object instead of flat fields
- Use `financement` object instead of string array
- Budget is now a number, use `formatProjectBudget()` for display

---

### 4. Project Detail Page ⏳

**File**: `frontend/src/app/(dashboard)/projects/[code]/page.tsx`

**Changes needed**:
- Load project by code from API
- Load project team from API
- Add loading state
- Add error handling

**Functions to use**:
```typescript
import { getProjectById } from "@/lib/projectStore";
import { getProjectTeam } from "@/lib/userStore";
```

---

### 5. Documents/GED Page ⏳

**File**: `frontend/src/app/(dashboard)/*/ged/page.tsx` (or similar)

**Changes needed**:
- Load documents from API
- Update upload to use API
- Update approve/reject to use API
- Add loading state
- Add error handling

**Functions to use**:
```typescript
import { 
  getTrackedDocuments, 
  addTrackedDocument, 
  markTrackedDocumentApproved,
  rejectTrackedDocumentWithReason 
} from "@/lib/documentTrackingStore";
```

---

### 6. Alerts Page ⏳

**File**: `frontend/src/app/(dashboard)/alerts/page.tsx`

**Changes needed**:
- Load alerts from API
- Update mark as read to use API
- Update delete to use API
- Add loading state
- Add error handling

**Functions to use**:
```typescript
import { getAlerts, markAlertAsRead, deleteAlert } from "@/lib/alertStore";
```

---

## 🔄 Form Submission Pattern

### Pattern for Create/Update Forms

```typescript
const [formData, setFormData] = useState<FormType>({});
const [submitting, setSubmitting] = useState(false);
const [error, setError] = useState<string | null>(null);

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  
  try {
    setSubmitting(true);
    setError(null);
    
    await createOrUpdateFunction(formData);
    
    // Show success message
    toast.success("Success!");
    
    // Refresh data or redirect
    router.push("/list");
    
  } catch (err: any) {
    setError(getErrorMessage(err));
  } finally {
    setSubmitting(false);
  }
};
```

---

## 🗑️ Delete Pattern

### Pattern for Delete Operations

```typescript
const [deleting, setDeleting] = useState(false);

const handleDelete = async (id: string) => {
  if (!confirm("Are you sure?")) return;
  
  try {
    setDeleting(true);
    await deleteFunction(id);
    
    // Refresh data
    await fetchData();
    
    toast.success("Deleted successfully");
  } catch (err: any) {
    toast.error(getErrorMessage(err));
  } finally {
    setDeleting(false);
  }
};
```

---

## 🎨 Loading Spinner Component

Create a reusable loading spinner:

```typescript
// components/ui/LoadingSpinner.tsx
export function LoadingSpinner({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-8 w-8",
    lg: "h-12 w-12",
  };
  
  return (
    <div className="flex items-center justify-center">
      <div className={`animate-spin rounded-full border-b-2 border-blue-600 ${sizeClasses[size]}`}></div>
    </div>
  );
}
```

---

## ⚠️ Error Display Component

Create a reusable error display:

```typescript
// components/ui/ErrorDisplay.tsx
export function ErrorDisplay({ error, retry }: { error: string; retry?: () => void }) {
  return (
    <div className="p-4 bg-red-50 border border-red-200 rounded-md">
      <div className="flex items-start">
        <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 mr-3" />
        <div className="flex-1">
          <h3 className="text-sm font-medium text-red-800">Error</h3>
          <p className="text-sm text-red-700 mt-1">{error}</p>
          {retry && (
            <button
              onClick={retry}
              className="mt-2 text-sm text-red-600 hover:text-red-800 underline"
            >
              Try again
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
```

---

## 📊 Field Name Mapping

When updating components, use this mapping:

### User Fields
| Old (French) | New (English) |
|--------------|---------------|
| `prenom` | `firstName` |
| `nom` | `lastName` |
| `telephone` | `phone` |
| `fonction` | `position` |
| `departement` | `department` |
| `statut` | `status` |
| `actif` | `active` |
| `inactif` | `inactive` |

### Project Fields
| Old | New |
|-----|-----|
| `region` (flat) | `localisation.region` |
| `ville` (flat) | `localisation.ville` |
| `budget` (string) | `budget` (number) |
| `financement` (string[]) | `financement` (object) |

---

## 🧪 Testing Checklist

After updating each component:

- [ ] Component loads without errors
- [ ] Loading state displays correctly
- [ ] Data loads from API
- [ ] Error state displays correctly
- [ ] Create operation works
- [ ] Update operation works
- [ ] Delete operation works
- [ ] Form validation works
- [ ] Success messages display
- [ ] Error messages display

---

## 🎯 Priority Order

Update components in this order:

1. **High Priority** (Core functionality)
   - [ ] Dashboard page
   - [ ] Users list page
   - [ ] Projects list page
   - [ ] Login page ✅ (Already done)

2. **Medium Priority** (Important features)
   - [ ] User create/edit forms
   - [ ] Project create/edit forms
   - [ ] Project detail page
   - [ ] Documents/GED page

3. **Low Priority** (Secondary features)
   - [ ] Alerts page
   - [ ] Archives page
   - [ ] Other pages

---

## 📝 Example: Complete User List Component

```typescript
"use client";

import { useState, useEffect } from "react";
import { getUsers, deleteUser, type User } from "@/lib/userStore";
import { getErrorMessage } from "@/services/api/client";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { ErrorDisplay } from "@/components/ui/ErrorDisplay";
import { Trash2, Edit, Plus } from "lucide-react";

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getUsers();
      setUsers(data);
    } catch (err: any) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this user?")) return;
    
    try {
      setDeleting(id);
      await deleteUser(id);
      await fetchUsers(); // Refresh list
    } catch (err: any) {
      alert(getErrorMessage(err));
    } finally {
      setDeleting(null);
    }
  };

  if (loading) return <LoadingSpinner size="lg" />;
  if (error) return <ErrorDisplay error={error} retry={fetchUsers} />;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Users</h1>
        <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
          <Plus size={16} />
          Add User
        </button>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Position</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {users.map((user) => (
              <tr key={user.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    {user.firstName} {user.lastName}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {user.email}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {user.position || "-"}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    user.platformRole === "admin" 
                      ? "bg-red-100 text-red-800" 
                      : "bg-gray-100 text-gray-800"
                  }`}>
                    {user.platformRole}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    user.status === "active" 
                      ? "bg-green-100 text-green-800" 
                      : "bg-gray-100 text-gray-800"
                  }`}>
                    {user.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button className="text-blue-600 hover:text-blue-900 mr-3">
                    <Edit size={16} />
                  </button>
                  <button 
                    onClick={() => handleDelete(user.id)}
                    disabled={deleting === user.id}
                    className="text-red-600 hover:text-red-900"
                  >
                    {deleting === user.id ? (
                      <LoadingSpinner size="sm" />
                    ) : (
                      <Trash2 size={16} />
                    )}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
```

---

## 🎉 Summary

Follow these patterns to update all components:
1. Add state for data, loading, error
2. Use useEffect to fetch data on mount
3. Add loading spinner while fetching
4. Add error display with retry
5. Update field names to English
6. Make all operations async
7. Add proper error handling
8. Test thoroughly

**Good luck!** 🚀
