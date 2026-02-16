# PlasticConnect.AI - Quick Start Guide

## 🚀 Get Started in 5 Minutes

### What's Already Working

✅ **Camera Capture** - Real-time photo capture from device  
✅ **Make Offers** - Create and track purchase offers  
✅ **Listings** - Create and manage plastic listings  
✅ **Database** - All data persisted in Supabase  
✅ **Icons** - All UI icons functional  
✅ **APIs** - Complete backend with 5 endpoints  

---

## 📋 Prerequisites

1. Supabase account connected (already done!)
2. Environment variables configured (already done!)
3. Database schema created (already done!)
4. Modern browser with camera support

---

## 🎯 Try It Now

### Option 1: Test as Collector

1. **Start**: Open the app and select "Collector"
2. **Create**: Click "New Listing"
   - Type: PET
   - Quantity: 100 kg
   - Price: ₹15/kg
   - Location: Your City
   - Submit
3. **Capture**: Click "Add Photo" on your listing
   - Grant camera permission
   - Capture a photo
   - Photo uploads to Supabase
4. **Track**: See your listing with photos

### Option 2: Test as Buyer

1. **Start**: Open the app and select "Buyer"
2. **Browse**: View all active listings
3. **Offer**: Click "Make Offer" on any listing
   - Quantity: 50 kg
   - Price: ₹14/kg
   - Notes: (optional)
   - Submit
4. **Track**: Offer saved to database

---

## 📱 Features Tour

### Collector Dashboard
```
┌─────────────────────────────────┐
│  PlasticConnect  [New Listing]  │
│                   [Capture]     │
├─────────────────────────────────┤
│  Hi Rajesh 👋                   │
│  Your plastic has value         │
├─────────────────────────────────┤
│  Earnings: ₹45,230              │
├─────────────────────────────────┤
│  Active Listings (3)            │
│  [PET] 500kg ₹15/kg [+Photo]   │
│  [HDPE] 300kg ₹12/kg [+Photo]   │
│  [PP] 200kg ₹18/kg [+Photo]     │
├─────────────────────────────────┤
│  Earnings Chart | Impact Metrics│
└─────────────────────────────────┘
```

### Buyer Dashboard
```
┌──────────────────────────────────┐
│  PlasticConnect   [Search]       │
│                   [Cart]         │
├──────────────────────────────────┤
│  Listings: 127 | Pending: 14     │
├──────────────────────────────────┤
│  Available Filters               │
│  [Type] [Location] [Quality]     │
├──────────────────────────────────┤
│  [♻️] PET 500kg ₹15/kg           │
│      [Make Offer]                │
│  [♻️] HDPE 300kg ₹12/kg          │
│      [Make Offer]                │
├──────────────────────────────────┤
│  Bulk Sourcing | ESG Dashboard   │
└──────────────────────────────────┘
```

---

## 🎥 Camera Feature

### How It Works:
```
Click Camera Button
    ↓
Grant Permission (First time only)
    ↓
Camera Opens in Modal
    ↓
Frame Photo + Capture
    ↓
Uploads to Supabase Storage
    ↓
Updates Listing
```

### Troubleshooting:
- **No camera?** Check browser permissions
- **CORS issue?** Use HTTPS (or localhost for testing)
- **Upload failed?** Verify storage bucket is public

---

## 💰 Make Offer Feature

### How It Works:
```
Browse Listings
    ↓
Click Make Offer
    ↓
Enter Quantity & Price
    ↓
Optional: Add Notes
    ↓
Submit Offer
    ↓
Stored in Database
    ↓
Collector Can Accept/Reject
```

### Example Offer:
```
Listing: PET, 500kg @ ₹15/kg
Your Offer:
  - Quantity: 250 kg
  - Price: ₹14/kg
  - Total: ₹3,500
  - Notes: Preferred delivery Friday
```

---

## 🔧 API Endpoints (Ready to Use)

### View Listings
```bash
curl https://your-app.com/api/listings
```

### Create Listing
```bash
curl -X POST https://your-app.com/api/listings \
  -H "Content-Type: application/json" \
  -d '{
    "collector_id": "user-001",
    "plastic_type": "PET",
    "quantity_kg": 100,
    "price_per_kg": 15,
    "location": "Mumbai"
  }'
```

### Make Offer
```bash
curl -X POST https://your-app.com/api/offers \
  -H "Content-Type: application/json" \
  -d '{
    "buyer_id": "buyer-001",
    "listing_id": "listing-001",
    "quantity_kg": 50,
    "price_per_kg": 14,
    "notes": "Bulk order"
  }'
```

### Upload Photo
```bash
curl -X POST https://your-app.com/api/photos \
  -H "Content-Type: application/json" \
  -d '{
    "listing_id": "listing-001",
    "base64_data": "data:image/jpeg;base64,...",
    "file_name": "photo.jpg"
  }'
```

---

## 📊 Database Structure

```
Users
├── Collectors (listings, earnings, impact)
└── Buyers (offers, transactions)

Plastic Listings
├── ID, Type, Quantity, Price
├── Location, Status
└── Photos (linked)

Photos
└── Supabase Storage URLs

Offers
├── Buyer, Listing, Quantity, Price
├── Status (pending/accepted/rejected)
└── Notes

Transactions
└── Payment records

Earnings
└── Collector totals
```

---

## 🧪 Testing Checklist

### ✅ Collector Flow
- [ ] Create new listing
- [ ] List appears in dashboard
- [ ] Click "Add Photo"
- [ ] Camera permission granted
- [ ] Capture photo
- [ ] Photo count updates
- [ ] View earnings

### ✅ Buyer Flow
- [ ] See listings
- [ ] Click "Make Offer"
- [ ] Modal appears
- [ ] Fill quantity/price
- [ ] Submit offer
- [ ] No error message
- [ ] Can make multiple offers

### ✅ Photo Upload
- [ ] Camera opens
- [ ] Can flip camera
- [ ] Photo captures
- [ ] Uploads without error
- [ ] URL is public

### ✅ Data Persistence
- [ ] Refresh page
- [ ] Listings still there
- [ ] Photos still there
- [ ] Offers still there

---

## 🐛 Debugging Tips

### Camera Issues:
```javascript
// Check if getUserMedia is supported
console.log(navigator.mediaDevices?.getUserMedia ? 'Supported' : 'Not supported')

// Check permissions status
navigator.permissions.query({name: 'camera'})
  .then(result => console.log(result.state))
```

### API Issues:
```javascript
// Test API endpoint
fetch('/api/listings')
  .then(r => r.json())
  .then(d => console.log('Success:', d))
  .catch(e => console.error('Error:', e))
```

### Storage Issues:
```
Go to Supabase Dashboard → Storage
- Check if "plastic-photos" bucket exists
- Check if bucket is public
- Check RLS policies are enabled
```

---

## 📝 Files Structure

```
/app
  /api
    /listings      - CRUD operations
    /offers        - Offer management
    /photos        - Upload & storage
    /users         - User profiles
    /earnings      - Payments & tracking

/components
  collector-dashboard.tsx    - Collector UI
  buyer-dashboard.tsx        - Buyer UI
  camera-capture.tsx         - Camera functionality
  make-offer-modal.tsx       - Offer form
  create-listing-modal.tsx   - Listing form
  role-selector.tsx          - Initial selection

/scripts
  001-create-tables.sql      - Database schema
  002-setup-storage.sql      - Storage buckets
```

---

## 🚨 Common Issues & Solutions

### "Camera permission denied"
**Solution**: Check browser settings for this website, ensure camera is enabled

### "Photo not uploading"
**Solution**: Check storage bucket is public and RLS policies allow uploads

### "Offers not saving"
**Solution**: Check database connection, verify API response in browser DevTools

### "Lists not loading"
**Solution**: Check database has data, try refreshing page

---

## 🎓 Learn More

- **Full Setup Guide**: Read `SETUP_GUIDE.md`
- **Backend Details**: Read `BACKEND_IMPLEMENTATION.md`
- **API Routes**: Check `/app/api/` folder
- **Components**: Check `/components/` folder

---

## 🚀 Next Steps

1. **Customize**: Update user IDs to use real auth
2. **Connect**: Add Stripe for payments
3. **Enhance**: Add user authentication
4. **Deploy**: Push to Vercel
5. **Monitor**: Track metrics and errors

---

## 💡 Tips & Tricks

### Make Offers Faster:
- Copy typical offer from previous attempt
- Buyers save favorites for bulk ordering
- Notes auto-populate from templates

### Better Photos:
- Capture in good lighting
- Clear the area around plastic
- Multiple angles improve chances
- Use zoom to show detail

### Track Earnings:
- Check dashboard daily
- View pending offers
- Accept quickly for faster sales
- Monitor transaction history

---

## 📞 Support

If something isn't working:
1. Check browser console for errors
2. Verify Supabase connection
3. Check environment variables
4. Review database tables
5. Test API endpoint directly

---

**Everything is ready to use! Start exploring now!** 🎉
