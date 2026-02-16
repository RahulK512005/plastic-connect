# PlasticConnect.AI - Setup Guide

## Backend Features Implemented

### 1. **Capture Plastic (Camera Functionality)**
- **Location**: `/components/camera-capture.tsx`
- **Features**:
  - Real-time camera access (browser permission required)
  - Front/back camera toggle
  - Photo capture with canvas
  - Base64 conversion for upload
  - Auto-save to database

**How it works**:
1. Click "Capture Plastic" button in Collector Dashboard
2. Grant camera permissions in browser
3. Frame your plastic waste in the viewfinder
4. Click "Capture Photo" to snap
5. Photo is automatically uploaded to Supabase Storage
6. Display count updates in listings

### 2. **Make Offer System**
- **Location**: `/components/make-offer-modal.tsx`
- **Features**:
  - Browse all available plastic listings
  - Make custom offers with quantity & price
  - Add notes for collectors
  - Real-time total calculation
  - Offer tracking and history

**How it works**:
1. Buyer selects a listing
2. Click "Make Offer" button
3. Fill in desired quantity and price
4. Add optional notes
5. Submit offer (stored in database)
6. Collector receives and can accept/reject

### 3. **Listing Management**
- **Location**: `/components/create-listing-modal.tsx`
- **Features**:
  - Create new plastic listings
  - Set plastic type, quantity, price
  - Add location and description
  - Automatic status tracking
  - Photo attachment support

### 4. **API Routes**

#### `/api/listings` - Manage plastic listings
```javascript
GET    - Fetch all listings or by collector
POST   - Create new listing
PATCH  - Update listing status/quantity
```

#### `/api/offers` - Manage offers
```javascript
GET    - Fetch offers by ID, buyer, or listing
POST   - Create new offer
PATCH  - Accept/reject offers
```

#### `/api/photos` - Handle photo uploads
```javascript
GET    - Fetch photos for a listing
POST   - Upload photo to Supabase Storage
```

#### `/api/users` - User management
```javascript
GET    - Fetch user by ID or all users
POST   - Create new user
```

#### `/api/earnings` - Track earnings
```javascript
GET    - Fetch collector earnings and transactions
POST   - Record transaction/payment
```

## Database Schema

### Tables Created:
1. **users** - Collector and Buyer profiles
2. **plastic_listings** - Available plastic for sale
3. **plastic_photos** - Photos attached to listings
4. **offers** - Buyer offers on listings
5. **transactions** - Payment records
6. **earnings** - Collector earnings summary
7. **esg_impact** - Environmental impact tracking

## Setup Instructions

### Step 1: Supabase Storage Setup

1. Go to Supabase Dashboard → Storage
2. Create a new bucket named: `plastic-photos`
3. Make it public by clicking the bucket and enabling public access
4. Add the following RLS policies:

```sql
-- Allow public read
CREATE POLICY "Allow public read" ON storage.objects
FOR SELECT USING (bucket_id = 'plastic-photos');

-- Allow authenticated users to upload
CREATE POLICY "Allow authenticated upload" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'plastic-photos');
```

### Step 2: Environment Variables

Add these to your `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-key
```

### Step 3: Camera Permissions

The app requests camera access when the user clicks "Capture Plastic":
- Chrome/Edge/Safari: Will prompt for permission
- Mobile: Required for app functionality
- Make sure to grant permission for photos to work

### Step 4: Testing the Features

#### Test Collector Flow:
1. Select "Collector" on landing
2. Click "New Listing" button
3. Fill in plastic type, quantity, price, location
4. Submit to create listing
5. Click "Add Photo" on the listing
6. Grant camera permissions
7. Capture a photo
8. Photo appears in listing

#### Test Buyer Flow:
1. Select "Buyer" on landing
2. View all active listings
3. Click "Make Offer" on any listing
4. Enter quantity and price
5. Submit offer
6. Offer is saved and available for collector to accept

## Icons & Components

All icons are working and use **lucide-react**:
- Camera - Photo capture
- Plus - Add/Create new
- Eye - View count
- TrendingUp - Analytics
- Droplet - Water saved
- Wind - CO₂ saved
- X - Close/Cancel
- Loader2 - Loading state
- RotateCw - Flip camera
- ShoppingCart - Shopping features
- Bookmark - Save listings
- Search - Search functionality
- Filter - Filter options

## Data Flow

```
Collector Dashboard
├── Create Listing → POST /api/listings
├── Capture Photo → POST /api/photos → Supabase Storage
└── View Earnings → GET /api/earnings

Buyer Dashboard
├── Browse Listings → GET /api/listings
├── Make Offer → POST /api/offers
└── Track Pending → GET /api/offers?buyerId=xyz
```

## Features Ready to Use

✅ Camera capture with storage  
✅ Make offer system  
✅ Listing creation  
✅ Photo management  
✅ Offer tracking  
✅ Earnings tracking  
✅ Transaction history  
✅ All icons functional  
✅ Backend API complete  
✅ Database schema established  

## Troubleshooting

### Camera not working:
- Check browser permissions
- HTTPS required (except localhost)
- Allow camera access when prompted

### Photos not uploading:
- Verify storage bucket is public
- Check RLS policies are enabled
- Ensure CORS is configured in Supabase

### Offers not saving:
- Check database connection
- Verify API is running
- Check browser console for errors

## Next Steps

1. Implement user authentication
2. Add payment integration
3. Create admin dashboard
4. Set up email notifications
5. Add review system
6. Implement messaging between users
