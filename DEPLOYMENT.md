# Deployment Guide

## Prerequisites

- MongoDB Atlas cluster
- Cloudinary account
- Email service (Gmail App Password)
- Node.js 18+ on server
- Git for version control

## Environment Variables

### Production Backend (.env)

```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/sky-solutions-prod
JWT_SECRET=generate-a-strong-random-string-min-32-chars
JWT_EXPIRE=7d

EMAIL_USER=your-production-email@gmail.com
EMAIL_PASS=your-app-specific-password
EMAIL_FROM=noreply@skysolutions.com

CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

PORT=5000
NODE_ENV=production
```

### Production Frontend (.env.local)

```
NEXT_PUBLIC_API_URL=https://api.yourdomain.com/api
```

## Vercel Deployment (Recommended)

### Frontend
1. Push code to GitHub
2. Connect repository to Vercel
3. Set environment variables in Vercel dashboard
4. Deploy automatically on push

### Backend (Alternative: Render, Railway, DigitalOcean)
1. Create account on service
2. Connect GitHub repository
3. Set environment variables
4. Configure build command: \`npm run build\`
5. Configure start command: \`npm start\`
6. Deploy

## Database Setup

### MongoDB Atlas
1. Create cluster
2. Create database user
3. Allow IP whitelist
4. Get connection string
5. Add to .env

## Security Checklist

- [ ] JWT_SECRET is strong (32+ random characters)
- [ ] Cloudinary credentials from secure source
- [ ] Email password is app-specific, not account password
- [ ] MONGODB_URI uses production cluster
- [ ] CORS configured for production domain
- [ ] Environment variables not in git (use .env)
- [ ] SSL/TLS certificate configured
- [ ] Rate limiting enabled
- [ ] File upload size limits enforced
- [ ] Sensitive data not logged

## Monitoring & Maintenance

- Monitor error logs regularly
- Set up uptime monitoring
- Regular database backups
- Email delivery status checks
- Cloudinary storage monitoring
- Monthly security audits

## Rollback Procedure

1. Revert code to previous commit
2. Keep database as-is (migrations only if needed)
3. Redeploy through CI/CD pipeline
4. Verify functionality
5. Monitor error logs

## Performance Optimization

- Enable database query optimization
- Use MongoDB connection pooling
- Cache frequently accessed data
- Optimize image sizes with Cloudinary
- Use CDN for static assets
- Enable compression on API

## Troubleshooting

**401 Unauthorized**: Check JWT_SECRET matches
**Email not sending**: Verify EMAIL_USER and EMAIL_PASS
**File upload failing**: Check Cloudinary credentials and limits
**Database connection timeout**: Whitelist server IP on MongoDB
