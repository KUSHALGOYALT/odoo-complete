# Swap Functionality Testing Guide

## 🎯 What's Fixed

I've completely rewritten the SwapPage to use real API calls instead of mock data. Now users can actually send and receive swap requests between different accounts.

## 🧪 How to Test with Two Google Accounts

### 1. **Setup Two User Accounts**
1. **Account 1**: Register with first Google account
   - Add some offered skills (e.g., "React", "JavaScript")
   - Add some wanted skills (e.g., "Python", "Design")

2. **Account 2**: Register with second Google account
   - Add different offered skills (e.g., "Python", "Design")
   - Add different wanted skills (e.g., "React", "JavaScript")

### 2. **Test Swap Request Flow**

#### **From Account 1:**
1. Login with Account 1
2. Go to "Swap" tab
3. You should see Account 2 in the discover section
4. Click "Swipe Right" or "Super Swipe" on Account 2
5. Fill in the swap request form:
   - **Your Skill**: Select one of Account 2's wanted skills
   - **Their Skill**: Select one of Account 2's offered skills
   - **Message**: Write a friendly message
   - **Deadline**: Optional
   - **Super Swap**: Optional priority flag
6. Click "Send Request"

#### **From Account 2:**
1. Login with Account 2
2. Go to "Swap" tab
3. Check the "Pending" tab
4. You should see the swap request from Account 1
5. Click "Accept" or "Reject"

### 3. **Verify the Flow**

#### **After Accepting:**
- The swap moves to "Ongoing" tab for both users
- Status changes from "PENDING" to "ACCEPTED"

#### **After Rejecting:**
- The swap moves to "History" tab
- Status changes to "REJECTED"

## 🔧 API Endpoints Used

### **Frontend → Backend**
- `GET /api/users/available` - Get users available for swapping
- `POST /api/swaps` - Create swap request
- `GET /api/swaps/user` - Get user's swap requests
- `PUT /api/swaps/{id}/accept` - Accept swap request
- `PUT /api/swaps/{id}/reject` - Reject swap request

### **Expected Request Format**
```json
{
  "requestedUserId": "user-id-here",
  "requesterSkill": "React",
  "requestedSkill": "Python",
  "message": "Hi! I'd love to learn Python in exchange for React help.",
  "deadline": "2024-02-01T00:00:00.000Z",
  "isSuperSwap": false
}
```

## 🐛 Troubleshooting

### **If you don't see other users:**
1. Make sure both accounts have `isPublic: true`
2. Check that users are not banned (`banned: false`)
3. Verify users are active (`active: true`)

### **If swap requests fail:**
1. Check browser console for errors
2. Verify the skills exist in both users' profiles
3. Ensure all required fields are filled

### **If you can't accept/reject:**
1. Make sure you're logged in as the correct user
2. Check that the swap request is in "PENDING" status
3. Verify the API endpoints are working

## 📊 Expected Behavior

1. **Account 1 sends request** → Request appears in Account 2's pending tab
2. **Account 2 accepts** → Both users see swap in ongoing tab
3. **Account 2 rejects** → Both users see swap in history tab
4. **Real-time updates** → Refresh to see latest status

## 🚀 Quick Test Commands

```bash
# Start backend
cd backend && ./mvnw spring-boot:run

# Start frontend (new terminal)
cd frontend && npm run dev
```

## 💡 Tips for Testing

1. **Use different browsers or incognito windows** for the two accounts
2. **Make sure skills match** between offered and wanted skills
3. **Check the network tab** in browser dev tools to see API calls
4. **Look for toast notifications** for success/error messages

The swap functionality should now work perfectly between your two Google accounts! 