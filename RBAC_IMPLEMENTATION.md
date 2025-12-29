# Role-Based Access Control (RBAC) Implementation

## Overview

This document provides a comprehensive overview of the frontend-only Role-Based Access Control (RBAC) system implemented for the React Native application.

## Role Structure

### User Roles
- **Admin**: Full access to all system features including management capabilities
- **Teacher**: Same permissions as admin - full access to student management features
- **Parent**: View-only access to their children's information and reports

### Permission Matrix

| Feature | Admin | Teacher | Parent |
|----------|--------|--------|
| Scanner | ✅ | ✅ | ❌ |
| Discipline Management | ✅ | ✅ | ❌ |
| Attendance Management | ✅ | ✅ | ❌ |
| Sahsiah Management | ✅ | ✅ | ❌ |
| RMT Management | ✅ | ✅ | ❌ |
| View Leaderboard | ✅ | ✅ | ✅ |
| View Reports | ✅ | ✅ | ✅ |
| View Child Details | ✅ | ✅ | ✅ |
| System Testing | ✅ | ❌ | ❌ |

## Core Components

### 1. usePermissions Hook (`qr-system/hooks/usePermissions.ts`)

**Purpose**: Centralized permission management and role checking

**Key Features**:
- Role-based permission definitions
- Permission checking utilities
- Route access validation
- Permission hierarchy support

**Usage**:
```typescript
const { hasRole, hasPermission, canAccessRoute } = usePermissions();

// Check user role
if (hasRole('admin')) { /* Admin features */ }

// Check specific permission
if (hasPermission('manage:discipline')) { /* Discipline management */ }

// Check route access
if (canAccessRoute('scanner')) { /* Scanner access */ }
```

### 2. ProtectedRoute Component (`qr-system/components/ProtectedRoute.tsx`)

**Purpose**: Route-level protection based on user roles and permissions

**Key Features**:
- Role-based route protection
- Custom access denied messages
- Navigation callback support
- Fallback component support

**Usage**:
```tsx
<ProtectedRoute 
  allowedRoles={['admin', 'teacher']} 
  requiredPermissions={['manage:discipline']}
  showAccessDeniedMessage={true}
  onAccessDenied={() => router.back()}
>
  <ProtectedComponent />
</ProtectedRoute>
```

### 3. RoleBasedUI Component (`qr-system/components/RoleBasedUI.tsx`)

**Purpose**: Conditional UI rendering based on user roles

**Specialized Components**:
- `AdminOnly` - Admin-only content
- `TeacherOnly` - Teacher-only content
- `ParentOnly` - Parent-only content
- `AdminOrTeacher` - Admin or teacher content
- `CanScan` - Scanner permission check
- `CanManageDiscipline` - Discipline management check

**Usage**:
```tsx
<RoleBasedUI allowedRoles={['admin', 'teacher']}>
  <ManagementInterface />
</RoleBasedUI>

<ParentOnly>
  <ChildView />
</ParentOnly>
```

### 4. RoleTestPanel Component (`qr-system/components/RoleTestPanel.tsx`)

**Purpose**: Interactive testing interface for RBAC verification

**Key Features**:
- Role simulation (admin, teacher, parent)
- Permission testing visualization
- UI component visibility verification
- Permission listing by role

**Usage**:
```tsx
<RoleTestPanel onClose={() => setShowTest(false)} />
```

## Navigation Structure

### Tab Layout (`qr-system/app/(tabs)/_layout.tsx`)

**Role-Based Tab Visibility**:

| Tab | Admin | Teacher | Parent | All Users |
|------|--------|--------|-------------|
| Home | ✅ | ✅ | ✅ | ✅ |
| Scanner | ✅ | ✅ | ❌ | ❌ |
| Discipline | ✅ | ✅ | ❌ | ❌ |
| RMT | ✅ | ✅ | ❌ | ❌ |
| Attendance | ✅ | ✅ | ❌ | ❌ |
| Reports | ✅ | ✅ | ✅ | ❌ |
| Leaderboard | ✅ | ✅ | ✅ | ✅ |
| Theme | ✅ | ✅ | ✅ | ✅ |
| Profile | ✅ | ✅ | ✅ | ✅ |
| Child Details | ❌ | ❌ | ✅ | ❌ |
| Test RBAC | ✅ | ❌ | ❌ | ❌ |

## Screen Implementations

### 1. Home Screen (`qr-system/app/(tabs)/index.tsx`)

**Purpose**: Role-based dashboard with different interfaces for each user type

**Features**:
- **Admin/Teacher**: Scan QR Code action, full dashboard
- **Parent**: "My Children" section with child cards
- **All Users**: Basic dashboard with recent activity

**Parent-Specific Features**:
- Child cards with name, grade, attendance status
- Navigation to child details
- Hidden scan functionality

### 2. Student Details Page (`qr-system/app/(tabs)/student-details.tsx`)

**Purpose**: Comprehensive student information display for parents

**Features**:
- Student profile with avatar and basic info
- Attendance statistics (present/absent/late/rate)
- Discipline and sahsiah points tracking
- RMT eligibility and claim status
- Recent activity timeline
- Parent-only actions (View Attendance, Generate Report)

**Data Structure**:
```typescript
interface StudentDetails {
  id: string;
  name: string;
  grade: string;
  section: string;
  attendance: AttendanceData;
  discipline: DisciplineData;
  sahsiah: SahsiahData;
  rmt: RMTData;
  recentActivity: ActivityData[];
}
```

### 3. Discipline Screen (`qr-system/app/(tabs)/discipline.tsx`)

**Purpose**: Discipline leaderboard viewing for admin/teacher

**Features**:
- Filterable student list by grade/section
- Rank-based display with badges
- Admin/teacher-only edit actions (removed as requested)
- Clean interface focused on viewing

### 4. Scanner Screen (`qr-system/app/scanner.tsx`)

**Purpose**: QR code scanning for student check-ins

**Features**:
- Camera integration with facing toggle
- Protected route (admin/teacher only)
- Student modal management
- Debug functionality (admin/teacher only)

## Usage Patterns

### Route Protection
```tsx
// Protect entire routes
<ProtectedRoute allowedRoles={['admin', 'teacher']}>
  <ScannerScreen />
</ProtectedRoute>

// Protect UI elements
<AdminOnly>
  <DeleteButton />
</AdminOnly>
```

### Permission Checking
```typescript
// In components
const { hasPermission } = usePermissions();

// Conditional rendering
{hasPermission('manage:discipline') && (
  <DisciplineForm />
)}
```

### Navigation Integration
```typescript
// Role-based navigation
<RoleBasedUI allowedRoles={['parent']}>
  <Tabs.Screen name="student-details" />
</RoleBasedUI>

// Navigate with parameters
router.push(`/student-details?studentId=${childId}`);
```

## Security Considerations

### Current Implementation
- **Frontend-only**: UI and navigation protection only
- **User Experience**: Clean role-based interfaces
- **Testing**: Built-in testing capabilities

### Recommendations for Production
1. **Backend API Protection**: Implement role-based middleware for API endpoints
2. **Token Validation**: Verify JWT tokens contain role information
3. **Permission Caching**: Cache user permissions for performance
4. **Audit Logging**: Track access attempts and permission changes

## Testing

### Role Test Panel
- Accessible via "Test RBAC" tab (admin only)
- Simulate different user roles
- Test permission visibility
- Verify UI component rendering

### Manual Testing Checklist
- [ ] Test admin access to all features
- [ ] Test teacher access to management features
- [ ] Test parent access to child information only
- [ ] Verify scanner is hidden from parents
- [ ] Test role-based navigation
- [ ] Verify permission-based UI rendering

## File Structure

```
qr-system/
├── hooks/
│   └── usePermissions.ts          # Permission management
├── components/
│   ├── ProtectedRoute.tsx          # Route protection
│   ├── RoleBasedUI.tsx            # Conditional UI
│   └── RoleTestPanel.tsx          # Testing interface
└── app/(tabs)/
    ├── _layout.tsx                   # Navigation with RBAC
    ├── index.tsx                     # Role-based dashboard
    ├── student-details.tsx             # Parent child details
    ├── discipline.tsx                  # Management interface
    ├── scanner.tsx                    # Protected scanner
    └── role-test.tsx                  # Testing screen
```

## Conclusion

The RBAC implementation provides a comprehensive, scalable solution for role-based access control in the React Native application. It ensures users only see and interact with features appropriate to their role while maintaining a clean, intuitive user experience.

The system is designed to be easily extended with new roles and permissions as the application grows, and includes built-in testing capabilities to verify correct behavior across all user types.