## Summary
This PR adds comprehensive feature management and device registration system improvements.

### Features Added

#### 1. Feature Management System (Role-Based Access Control)
- **Backend**: Added `Feature` and `RoleFeature` models to define available features
- **Backend**: Added `UserFeature` model for individual user feature overrides
- **Backend**: API endpoints for CRUD operations on features
- **Frontend**: New "Feature Management" page at `/admin/feature-management`
- **SuperAdmin** can now:
  - Assign features to roles (Admin gets which features)
  - Override features for individual users
  - Features are cached in sessionStorage for performance

#### 2. Device Registration System (Fixed)
- **New Users**: First device is auto-approved
- **Existing Users**: New devices are registered as PENDING (needs admin approval)
- **Proper Error Messages**: Clear feedback for blocked/rejected/pending devices

#### 3. Previous Improvements
- Skeleton loaders for all admin/employee pages
- AdvancedFilter component with expandable filters
- useDebounce hook for search inputs
- Scalable API system with retry, rate limit, offline queue
- Consolidated duplicate correction pages
- Clean up unused imports and fix React hooks dependencies

### Files Changed

#### Backend (7 files)
- `apps/organization/models.py` - Added Feature, RoleFeature, UserFeature models
- `apps/organization/serializers.py` - Added serializers for new models
- `apps/organization/views.py` - Added FeatureViewSet, RoleFeatureViewSet, UserFeatureViewSet
- `apps/organization/urls.py` - Added routes for feature APIs
- `apps/organization/management/commands/seed_features.py` - Added seed command
- `apps/accounts/serializers.py` - Fixed device registration flow
- `apps/organization/migrations/0009_add_feature_models.py` - Migration
- `apps/organization/migrations/0010_add_user_feature_model.py` - Migration

#### Frontend (15 files)
- `src/modules/admin/pages/FeatureManagement.jsx` - New page
- `src/core/services/api.js` - Added feature API methods
- `src/core/layouts/AppLayout.jsx` - Dynamic menu based on features
- `src/App.jsx` - Added FeatureManagement route
- Various optimization fixes (skeleton loaders, debounce, imports)

### API Endpoints Added

```
GET    /organization/features/                    - List all features
GET    /organization/role-features/by_role/      - Get role features
POST   /organization/role-features/toggle/       - Toggle role feature
POST   /organization/role-features/bulk_update/ - Bulk update role features
GET    /organization/user-features/by_user/      - Get user features
GET    /organization/user-features/by_role/       - List users with features
POST   /organization/user-features/toggle/       - Toggle user feature
POST   /organization/user-features/bulk_update/ - Bulk update user features
```

### Testing
- Build: `npm run build` - Compiles successfully
- Deploy: Live at https://mishra-naveen-dev.github.io/tas-frontend

### Setup Commands (Backend)
```bash
python manage.py migrate
python manage.py seed_features
```
