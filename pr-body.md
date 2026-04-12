## Summary
- Add skeleton loaders component with various skeleton types (TableSkeleton, CardSkeleton, FormSkeleton, etc.)
- Implement skeleton loaders in all admin and employee pages
- Add AdvancedFilter component with expandable filter options
- Add useDebounce hook for search inputs
- Add React.memo optimization on components
- Add environment config (.env.example)
- Add scalable API system with cache (TTL-based, 30s expiry, max 100 entries)
- Add RetryHandler, RateLimiter, and OfflineQueue utilities
- Consolidate duplicate correction pages (AdminPunchCorrections + CorrectionApproval -> PunchCorrectionManagement)
- Remove duplicate sidebar menu items
- Clean up unused imports and fix React hooks dependencies

## Changes
- Frontend: Added skeleton loaders, debounce hook, advanced filter, cache system
- Frontend: Consolidated correction pages, removed duplicates
- Frontend: Fixed infinite loading loop in AdminDashboard
- Frontend: Fixed password management 500 error (safe role access)
- Frontend: Build compiles with no warnings
- Backend: Added Route APIs (RouteHistoryView, RouteDetailView, DailyRouteView)
- Backend: Fixed PasswordManagement 500 error

## Testing
- Build: npm run build - Compiles successfully with no warnings
- Deploy: Live at https://mishra-naveen-dev.github.io/tas-frontend
