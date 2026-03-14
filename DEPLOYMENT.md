# 🚀 Splitwise Backend Deployment Guide

## 📋 Prerequisites
- MongoDB Atlas connection string configured in `.env`
- Backend code ready in `/server` directory

## 🌐 Deployment Options

### Option 1: Render (Recommended - Free)
1. Go to [render.com](https://render.com)
2. Sign up/Login with GitHub
3. Click "New +" → "Web Service"
4. Connect GitHub repository
5. Build Command: `npm install && npm start`
6. Start Command: `npm start`
7. Add Environment Variables:
   - `MONGODB_URI`: Your Atlas connection string
   - `JWT_SECRET`: Your JWT secret
   - `NODE_ENV`: `production`
8. Deploy!

### Option 2: Railway (Free)
1. Go to [railway.app](https://railway.app)
2. Click "New Project"
3. Import from GitHub
4. Template: Node.js
5. Add Environment Variables from your `.env`
6. Deploy!

### Option 3: Vercel Serverless
1. Create `client/api/` directory
2. Move server files to `client/api/`
3. Convert to serverless functions
4. Deploy with existing Vercel project

### Option 4: Heroku (Requires Verification)
1. Verify account at https://heroku.com/verify
2. Create app: `heroku create splitwise-api`
3. Deploy: `git subtree push --prefix server heroku main`
4. Set environment variables

### Option 5: DigitalOcean App Platform
1. Go to [digitalocean.com](https://digitalocean.com)
2. Create App Platform account
3. Connect GitHub repository
4. Deploy with Node.js template

## 🔧 Environment Variables Setup

Copy these from your `.env` file:

```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/splitwise?retryWrites=true&w=majority
JWT_SECRET=your_secure_jwt_secret_key_minimum_32_characters
NODE_ENV=production
PORT=5000
```

## 🌍 Testing Deployment

After deployment, test:
1. Frontend: https://splitwise-nkod9vupc-patro-subrat-devs-projects.vercel.app
2. Backend API: `https://your-backend-url.com/api`
3. Test registration/login
4. Create groups and expenses
5. Check real-time updates

## 📱 Frontend Configuration

Update frontend to use deployed backend:

```javascript
// client/src/api/axios.js or similar
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
```

## ✅ Success Checklist

- [ ] MongoDB Atlas configured
- [ ] Backend deployed
- [ ] Environment variables set
- [ ] Frontend updated with backend URL
- [ ] Full-stack testing complete
- [ ] Real-time features working

## 🆘 Troubleshooting

### CORS Issues
Add backend URL to Vercel environment:
```bash
vercel env add REACT_APP_API_URL=https://your-backend-url.com
```

### Database Connection
Ensure MongoDB Atlas network access allows all IPs (0.0.0.0/0)

### Build Failures
Check Node.js version compatibility (use Node 18+)

## 🎯 Recommended Deployment Flow

1. **Use Render** for easiest deployment
2. **Update frontend** with backend URL
3. **Test full integration**
4. **Monitor logs** for any issues
