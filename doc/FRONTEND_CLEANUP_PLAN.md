# 🧹 Frontend Cleanup Plan - Remove Hardcoded Data

## ✅ Completed

### 1. API Layer Created
- ✅ `frontend/src/services/api/client.ts` - Axios client with JWT interceptors
- ✅ `frontend/src/services/api/authService.ts` - Login/Logout
- ✅ `frontend/src/services/api/userService.ts` - User CRUD
- ✅ `frontend/src/services/api/projectService.ts` - Project CRUD
- ✅ `frontend/src/services/api/index.ts` - Export all services

### 2. Helpers Created
- ✅ `frontend/src/lib/helpers/budgetHelpers.ts` - Parse/Format budget
- ✅ `frontend/src/lib/helpers/userHelpers.ts` - User utility functions

---

## 🔄 To Do - Update Stores

### 1. authStore.ts
**Current**: Uses localStorage with hardcoded users  
**Target**: Use authService API

**Changes needed**:
```typescript
// OLD
export function login(userId: string, platformRole: PlatformRole): void

// NEW
export async function login(credentials: LoginRequest): Promise<AuthSession>
```

**Actions**:
- Replace `login()` function to call `authService.login()`
- Store JWT token in sessionStorage
- Update `AuthSession` type to include user details
- Remove `verifySecurityPassword()` (backend handles this)
- Remove `ensureDevSession()` (no more auto-login)

---

### 2. userStore.ts
**Current**: Uses localStorage with DEFAULT_USERS array  
**Target**: Use userService API

**Changes needed**:
- Remove `DEFAULT_USERS` array (lines 30-80)
- Remove `DEFAULT_ASSIGNMENTS` array
- Update all functions to use API calls
- Keep cache in memory (optional) for performance

**Functions to update**:
```typescript
// OLD
export function getUsers(): User[]

// NEW
export async function getUsers(): Promise<User[]>
```

**Actions**:
- Replace all CRUD functions with API calls
- Update `User` type to match backend (firstName, lastName, etc.)
- Remove localStorage operations
- Add error handling

---

### 3. projectStore.ts
**Current**: Uses localStorage with DEFAULT_PROJECTS array  
**Target**: Use projectService API

**Changes needed**:
- Remove `DEFAULT_PROJECTS` array (Lom Pangar hardcoded)
- Update `ProjectData` type to match backend `Project` type
- Use `Localisation` object instead of flat fields
- Use `Financement` object instead of string array
- Convert budget string ↔ number using helpers

**Actions**:
- Replace all functions with API calls
- Add budget conversion helpers
- Update types to match backend
- Remove localStorage operations

---

### 4. documentTrackingStore.ts
**Current**: Uses localStorage  
**Target**: Use documentService API (to be created)

**Changes needed**:
- Create `documentService.ts` first
- Map `steps` ↔ `status` (frontend vs backend)
- Use `isTrashed` flag instead of separate trash store

**Actions**:
- Create document service
- Update mapping functions
- Replace localStorage with API

---

### 5. alertStore.ts
**Current**: Uses localStorage  
**Target**: Use alertService API (to be created)

**Changes needed**:
- Create `alertService.ts` first
- Connect to backend alerts endpoint

**Actions**:
- Create alert service
- Replace localStorage with API

---

### 6. auditStore.ts
**Current**: Uses localStorage  
**Target**: Use auditService API (to be created)

**Changes needed**:
- Create `auditService.ts` first
- Backend captures IP and UserAgent automatically

**Actions**:
- Create audit service
- Replace localStorage with API

---

## 📝 Additional Services to Create

### 1. documentService.ts
```typescript
export const documentService = {
  upload(file, projectId, phase, folderName): Promise<Document>
  getAll(filters): Promise<Document[]>
  getById(id): Promise<Document>
  download(id): Promise<Blob>
  approve(id): Promise<Document>
  reject(id, reason): Promise<Document>
  trash(id, reason): Promise<void>
  restore(id): Promise<Document>
  delete(id): Promise<void>
}
```

### 2. teamService.ts
```typescript
export const teamService = {
  assign(data): Promise<TeamAssignment>
  getProjectTeam(projectId): Promise<TeamAssignment[]>
  getUserProjects(userId): Promise<TeamAssignment[]>
  deactivate(id): Promise<TeamAssignment>
  remove(id): Promise<void>
}
```

### 3. alertService.ts
```typescript
export const alertService = {
  create(data): Promise<Alert>
  getAll(): Promise<Alert[]>
  getCount(): Promise<number>
  getByProject(projectId): Promise<Alert[]>
  markAsRead(id): Promise<Alert>
  delete(id): Promise<void>
}
```

### 4. auditService.ts
```typescript
export const auditService = {
  getAll(filters): Promise<AuditLog[]>
  getByUser(userId): Promise<AuditLog[]>
  getByEntity(entity, entityId): Promise<AuditLog[]>
}
```

---

## 🔧 Helper Functions to Create

### 1. localisationHelpers.ts
```typescript
// Convert flat fields to Localisation object
export function createLocalisation(data): Localisation

// Extract region/ville from Localisation
export function getRegion(localisation): string
export function getVille(localisation): string
```

### 2. financementHelpers.ts
```typescript
// Convert string array to Financement object
export function parseFinancement(data): Financement

// Format Financement for display
export function formatFinancement(financement): string
```

### 3. documentHelpers.ts
```typescript
// Map frontend steps to backend status
export function stepsToStatus(steps): DocumentStatus
export function statusToSteps(status): TrackingSteps
```

---

## 🎯 Migration Strategy

### Phase 1: Core Services (Priority HIGH)
1. ✅ Create API client
2. ✅ Create authService
3. ✅ Create userService
4. ✅ Create projectService
5. ⏳ Update authStore
6. ⏳ Update userStore (remove DEFAULT_USERS)
7. ⏳ Update projectStore (remove DEFAULT_PROJECTS)

### Phase 2: Additional Services (Priority MEDIUM)
8. ⏳ Create documentService
9. ⏳ Create teamService
10. ⏳ Create alertService
11. ⏳ Update documentTrackingStore
12. ⏳ Update alertStore

### Phase 3: Audit & Polish (Priority LOW)
13. ⏳ Create auditService
14. ⏳ Update auditStore
15. ⏳ Add error handling everywhere
16. ⏳ Add loading states
17. ⏳ Test all flows

---

## 🚨 Breaking Changes

### 1. Login Flow
**OLD**:
```typescript
login("u1", "admin");  // Direct with userId
```

**NEW**:
```typescript
await login({ login: "admin", password: "admin123" });  // With credentials
```

### 2. User Fields
**OLD**:
```typescript
{
  prenom: "Jean",
  nom: "Mbarga",
  telephone: "+237...",
  fonction: "Ingénieur",
  departement: "Études",
  statut: "actif"
}
```

**NEW**:
```typescript
{
  firstName: "Jean",
  lastName: "Mbarga",
  phone: "+237...",
  position: "Engineer",
  department: "Studies",
  status: "active"
}
```

### 3. Project Structure
**OLD**:
```typescript
{
  region: "Région de l'Est",
  ville: "Bélabo",
  budget: "420 Mrd FCFA",  // string
  financement: ["Bailleur"],  // string array
  bailleur: "Banque Mondiale"  // string
}
```

**NEW**:
```typescript
{
  localisation: {
    region: "East Region",
    ville: "Belabo"
  },
  budget: 420000000000,  // number
  financement: {
    type: "MOP",
    bailleurs: [
      { nom: "World Bank", pourcentage: 60 }
    ]
  }
}
```

---

## 📦 Environment Variables

Add to `.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:4000/api
```

---

## ✅ Testing Checklist

After cleanup:
- [ ] Login works with real credentials
- [ ] Users list loads from API
- [ ] Create user works
- [ ] Projects list loads from API
- [ ] Create project works with new structure
- [ ] Budget conversion works correctly
- [ ] Documents upload/download works
- [ ] Team assignments work
- [ ] Alerts display correctly
- [ ] Logout clears session properly

---

## 🎯 Next Steps

1. **Update authStore** - Replace login function
2. **Update userStore** - Remove DEFAULT_USERS
3. **Update projectStore** - Remove DEFAULT_PROJECTS
4. **Create remaining services** - documents, team, alerts
5. **Test integration** - End-to-end testing
6. **Update UI components** - Handle loading/error states

---

**Estimated Time**: 4-6 hours for complete cleanup and integration

**Status**: 🟡 In Progress (30% complete)
