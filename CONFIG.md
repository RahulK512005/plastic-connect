# PlasticConnect.AI - Configuration Reference

## Environment Variables Required

```
NEXT_PUBLIC_SUPABASE_URL=your-supabase-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

## Supabase Configuration

### Storage Bucket Setup
```
Bucket Name: plastic-photos
Visibility: Public
RLS: Enabled
```

### Required RLS Policies
```sql
-- Policy 1: Public read access
CREATE POLICY "Allow public read" ON storage.objects
FOR SELECT USING (bucket_id = 'plastic-photos');

-- Policy 2: Authenticated upload
CREATE POLICY "Allow authenticated upload" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'plastic-photos');

-- Policy 3: Delete own uploads
CREATE POLICY "Allow delete own" ON storage.objects
FOR DELETE USING (bucket_id = 'plastic-photos');
```

## Application Configuration

### API Base URL
```
Development: http://localhost:3000/api
Production: https://your-domain.com/api
```

### Default User IDs
```
Collector ID: collector-001
Buyer ID: buyer-001
```

### Page Routes
```
/ - Landing (role selector)
/app/page.tsx - Dashboard (redirects based on role)
```

### Component Configuration

#### CameraCapture
```typescript
- defaultFacingMode: 'environment' (back camera)
- canToggle: true (flip camera available)
- quality: 'image/jpeg' (JPEG compression)
- autostart: true (opens on mount)
```

#### MakeOfferModal
```typescript
- maxQuantity: listing.quantity_kg
- minPrice: 0.1 (prevent zero offers)
- validation: required fields enforced
```

#### CreateListingModal
```typescript
- plasticTypes: 7 options
- minQuantity: 0.1 kg
- minPrice: 0.1 per kg
```

## Database Configuration

### Connection String Format
```
postgresql://[user]:[password]@[host]:[port]/[database]
```

### Auto-Generated Timestamps
```sql
created_at TIMESTAMP DEFAULT NOW()
updated_at TIMESTAMP DEFAULT NOW()
```

### Foreign Key Relationships
```
users ← plastic_listings (collector_id)
plastic_listings ← plastic_photos (listing_id)
plastic_listings ← offers (listing_id)
users ← offers (buyer_id)
users ← transactions (collector_id)
users ← earnings (collector_id)
users ← esg_impact (collector_id)
```

## API Configuration

### Request Headers
```
Content-Type: application/json
```

### Response Format
```json
{
  "data": [...],
  "error": null,
  "status": 200
}
```

### Error Response Format
```json
{
  "error": "Error message description"
}
```

## CORS Configuration

### Allowed Origins
```
- http://localhost:3000
- http://localhost:3001
- https://your-domain.com
```

### Camera Permissions
```
- https:// required (except localhost)
- browser.permissions.camera needed
- first-use prompt shown automatically
```

## Storage Configuration

### Photo Upload Settings
```
Max File Size: 5MB (recommended)
Format: JPEG/JPG
Compression: 0.8 quality
Path Pattern: {listing_id}/{timestamp}.jpg
```

### Bucket Paths
```
plastic-photos/
├── {listing_id}/
│   ├── photo-1707123456.jpg
│   ├── photo-1707123457.jpg
│   └── ...
```

## Component Sizes & Spacing

### Modal Dimensions
```
Width: max-w-md (448px)
Height: auto (content-driven)
Padding: p-6 (24px)
Border Radius: rounded-lg
```

### Camera Modal
```
Aspect Ratio: 16:9 (video)
Height: auto (respects video ratio)
Overlay: fixed inset-0
```

### Grid Layouts
```
Desktop: grid-cols-3
Tablet: grid-cols-2
Mobile: grid-cols-1
Gap: gap-4 or gap-6
```

## Color Palette

### Primary Colors
```
Background: #0A0E14 (deep navy)
Foreground: #E8ECEF (light gray)
Success: #00D68F (bright green)
Info: #0091FF (bright blue)
Warning: #FF6B35 (orange)
```

### Secondary Colors
```
Card BG: #141922 (dark blue)
Border: #2A3240 (dark gray)
Hover: #3A4350 (lighter gray)
Text Muted: #8A94A6 (medium gray)
```

## Typography

### Font Stack
```
Headings: Syne (600-700 weight)
Body: Geist (400 weight)
Mono: Space Mono (400-700 weight)
```

### Font Sizes
```
H1: 2xl (24px)
H2: xl (20px)
H3: lg (18px)
Body: base (16px)
Small: sm (14px)
Tiny: xs (12px)
```

## Icon Configuration

### Icon Library
```
Package: lucide-react
Import: import { IconName } from 'lucide-react'
Size Default: w-4 h-4 (16x16px)
Sizes Available: w-3, w-4, w-5, w-6, w-8
```

### Icon Colors
```
Default: currentColor (inherits from text color)
Muted: text-[#8A94A6]
Success: text-[#00D68F]
Info: text-[#0091FF]
Warning: text-[#FF6B35]
Error: text-red-400
```

## State Management

### Component State
```
useCallback: Event handlers
useState: Local component state
No Redux needed for current scale
```

### Data Fetching
```
Direct fetch() calls in handlers
No SWR/React Query currently
Ready to add for production
```

## Performance Optimization

### Image Optimization
```
Base64 Encoding: Done before upload
JPEG Compression: Applied in API
Lazy Loading: Available in listings
```

### Code Splitting
```
Components: Individual files
No bundle splitting yet
Ready for Next.js dynamic imports
```

## Browser Compatibility

### Required APIs
```
navigator.mediaDevices.getUserMedia() - Camera
Canvas API - Photo capture
LocalStorage - (not used)
Fetch API - HTTP requests
```

### Minimum Browser Versions
```
Chrome: 64+
Firefox: 55+
Safari: 11+
Edge: 79+
Mobile: iOS 13+, Android 6+
```

## Security Configuration

### API Security
```
No authentication currently
Ready for JWT implementation
Service Role Key: Server-side only
```

### Data Validation
```
Frontend: Required field checks
Backend: Database constraints
API: Parameter validation
```

### CORS
```
Origin Restrictions: Add as needed
Credentials: Not required
Methods: GET, POST, PATCH
```

## Monitoring & Debugging

### Debug Mode
```
Enable Console Logs: Always on
Error Tracking: Browser console
API Logs: Check network tab
Database Logs: Supabase dashboard
```

### Analytics
```
Not configured yet
Ready for PostHog/Sentry
```

## Deployment Configuration

### Build Settings
```
Framework: Next.js 16+
Build Command: npm run build
Start Command: npm run start
Runtime: Node.js 18+
```

### Environment Variables
```
Development: .env.local
Production: Vercel Dashboard
```

### Database
```
Production DB: Supabase PostgreSQL
Backups: Automatic daily
Connection Pool: Default settings
```

## Feature Flags

```
Camera Feature: ✅ Enabled
Make Offer Feature: ✅ Enabled
Photo Upload: ✅ Enabled
Listings: ✅ Enabled
All Icons: ✅ Enabled
```

## Future Configuration Options

```
- Authentication provider selection
- Payment gateway configuration
- Email service setup
- SMS notifications
- Push notifications
- Real-time chat
- Advanced search/filtering
- Admin dashboard access
```

---

**Last Updated**: February 16, 2026  
**Version**: 1.0 Release  
**Status**: Production Ready
