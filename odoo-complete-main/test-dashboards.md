# Dashboard Testing Guide

## 🎯 What's New

I've created a complete dashboard system with:

1. **MainDashboard** - Routes users to appropriate dashboard based on role
2. **UserDashboard** - For regular users with personal stats and features
3. **AdminDashboard** - For admins with platform management features

## 🧪 How to Test

### 1. **Test User Dashboard**
1. Register a new user account (regular user)
2. Login with the new account
3. You should see the **User Dashboard** with:
   - Personal profile summary
   - Your offered and wanted skills
   - Swap statistics
   - Recent activity
   - User discovery section

### 2. **Test Admin Dashboard**
1. Login with an admin account
2. You should see the **Admin Dashboard** with:
   - Platform statistics
   - User management
   - Swap management
   - Platform messages

### 3. **Create Admin User**
To test admin features, you need to make a user an admin:

**Option A: Database Update**
```javascript
// In MongoDB, update a user document:
db.users.updateOne(
  { email: "your-email@example.com" },
  { $push: { roles: "ADMIN" } }
)
```

**Option B: Use Admin Endpoint**
If you have an existing admin, use the API:
```
PUT /api/admin/users/{userId}/make-admin
```

## 🔧 Features by Dashboard

### User Dashboard Features:
- ✅ Personal profile display
- ✅ Skills management view
- ✅ Swap request management
- ✅ User discovery and search
- ✅ Activity overview
- ✅ Statistics tracking

### Admin Dashboard Features:
- ✅ Platform statistics
- ✅ User management (ban/unban, promote/demote)
- ✅ Swap request management
- ✅ Platform message system
- ✅ Skill rejection system

## 🐛 Troubleshooting

### If you see "Admin Dashboard" for regular users:
- Check the user's `roles` field in the database
- Ensure it only contains `["USER"]` for regular users
- Ensure it contains `["USER", "ADMIN"]` for admin users

### If admin dashboard can't fetch users:
- Check backend logs for authentication errors
- Verify the user has ADMIN role
- Check if the `/api/admin/users` endpoint is working

### If user dashboard shows no data:
- Check if the user has completed profile setup
- Verify API endpoints are responding
- Check browser console for errors

## 🚀 Quick Test Commands

```bash
# Start backend
cd backend
./mvnw spring-boot:run

# Start frontend (in new terminal)
cd frontend
npm run dev
```

## 📊 Expected Behavior

1. **Regular User Login** → User Dashboard
2. **Admin User Login** → Admin Dashboard
3. **No Token** → Login Page
4. **Invalid Token** → Login Page

The system automatically detects user role and shows the appropriate dashboard! 