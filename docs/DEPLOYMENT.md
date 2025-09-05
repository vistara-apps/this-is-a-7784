# KnowYourRights Card - Deployment Guide

This guide covers the complete deployment process for the KnowYourRights Card application.

## 📋 Prerequisites

Before deploying, ensure you have:

- Node.js 18+ installed
- Git installed
- Accounts for all required services (see below)

## 🔧 Required Services Setup

### 1. Supabase Setup

1. **Create a Supabase Project**
   - Go to [supabase.com](https://supabase.com)
   - Create a new project
   - Note your project URL and anon key

2. **Database Setup**
   - Go to SQL Editor in your Supabase dashboard
   - Copy and run the contents of `database/schema.sql`
   - Verify all tables are created successfully

3. **Row Level Security (RLS)**
   - RLS policies are included in the schema
   - Verify they're active in the Authentication > Policies section

4. **Edge Functions**
   - Install Supabase CLI: `npm install -g supabase`
   - Login: `supabase login`
   - Deploy functions: `supabase functions deploy`

### 2. Stripe Setup

1. **Create Stripe Account**
   - Go to [stripe.com](https://stripe.com)
   - Create an account and complete verification

2. **Create Products and Prices**
   ```bash
   # Create Premium product
   stripe products create \
     --name "KnowYourRights Card Premium" \
     --description "Full access to all features"
   
   # Create recurring price (replace PRODUCT_ID)
   stripe prices create \
     --product PRODUCT_ID \
     --unit-amount 499 \
     --currency usd \
     --recurring interval=month
   ```

3. **Configure Webhooks**
   - Go to Developers > Webhooks in Stripe Dashboard
   - Add endpoint: `https://your-supabase-project.supabase.co/functions/v1/stripe-webhook`
   - Select events:
     - `customer.subscription.created`
     - `customer.subscription.updated`
     - `customer.subscription.deleted`
     - `invoice.payment_succeeded`
     - `invoice.payment_failed`
     - `checkout.session.completed`

4. **Customer Portal**
   - Go to Settings > Billing > Customer portal
   - Activate customer portal
   - Configure allowed features (cancel subscription, update payment method)

### 3. OpenAI Setup

1. **Get API Key**
   - Go to [platform.openai.com](https://platform.openai.com)
   - Create an account and get API key
   - Set usage limits and monitoring

2. **Configure Usage**
   - Set monthly spending limits
   - Enable usage notifications
   - Monitor costs regularly

### 4. Pinata IPFS Setup

1. **Create Pinata Account**
   - Go to [pinata.cloud](https://pinata.cloud)
   - Create account and verify email

2. **Generate API Keys**
   - Go to API Keys section
   - Create new key with pinning permissions
   - Note the API Key, Secret, and JWT

3. **Configure Gateway**
   - Set up custom gateway if needed
   - Configure CORS settings

### 5. Optional Services

#### Twilio (for SMS alerts)
1. Create Twilio account
2. Get phone number and API credentials
3. Configure messaging service

#### Resend (for email alerts)
1. Create Resend account
2. Verify domain
3. Get API key

## 🚀 Deployment Options

### Option 1: Vercel (Recommended)

1. **Install Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **Deploy**
   ```bash
   # Build the project
   npm run build
   
   # Deploy to Vercel
   vercel --prod
   ```

3. **Environment Variables**
   - Add all environment variables in Vercel dashboard
   - Go to Project Settings > Environment Variables

### Option 2: Netlify

1. **Build Project**
   ```bash
   npm run build
   ```

2. **Deploy**
   - Drag and drop `dist/` folder to Netlify
   - Or connect GitHub repository for automatic deployments

3. **Environment Variables**
   - Add variables in Site Settings > Environment Variables

### Option 3: Docker

1. **Create Dockerfile**
   ```dockerfile
   FROM node:18-alpine
   
   WORKDIR /app
   COPY package*.json ./
   RUN npm ci --only=production
   
   COPY . .
   RUN npm run build
   
   EXPOSE 3000
   CMD ["npm", "run", "preview"]
   ```

2. **Build and Run**
   ```bash
   docker build -t knowyourrights-card .
   docker run -p 3000:3000 knowyourrights-card
   ```

## 🔐 Environment Variables

Create a `.env` file with all required variables:

```env
# Supabase
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key

# Stripe
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_your_key
VITE_STRIPE_PREMIUM_PRICE_ID=price_your_price_id

# OpenAI
VITE_OPENAI_API_KEY=sk-your_openai_key

# Pinata
VITE_PINATA_JWT=your_pinata_jwt

# App Config
VITE_APP_URL=https://your-domain.com
VITE_APP_NAME=KnowYourRights Card

# Optional
VITE_GOOGLE_ANALYTICS_ID=G-XXXXXXXXXX
VITE_SENTRY_DSN=https://your_sentry_dsn
```

## 🔧 Post-Deployment Setup

### 1. Domain Configuration

1. **Custom Domain**
   - Configure custom domain in your hosting provider
   - Set up SSL certificate (usually automatic)

2. **DNS Configuration**
   - Point domain to hosting provider
   - Set up any required CNAME records

### 2. Content Generation

1. **Generate Initial Content**
   - Use the admin interface to generate state-specific content
   - Start with major states (CA, NY, TX, FL)
   - Gradually expand to all 50 states

2. **Content Review**
   - Have legal experts review generated content
   - Make necessary adjustments
   - Ensure accuracy and compliance

### 3. Testing

1. **Functionality Testing**
   - Test user registration and authentication
   - Test recording functionality
   - Test alert system with test contacts
   - Test subscription flow

2. **Payment Testing**
   - Use Stripe test cards
   - Test subscription creation and cancellation
   - Verify webhook handling

3. **Performance Testing**
   - Test app performance on mobile devices
   - Check loading times
   - Verify offline functionality (if implemented)

### 4. Monitoring Setup

1. **Error Tracking**
   - Set up Sentry for error monitoring
   - Configure alerts for critical errors

2. **Analytics**
   - Set up Google Analytics
   - Track key user actions
   - Monitor conversion rates

3. **Uptime Monitoring**
   - Set up uptime monitoring service
   - Configure alerts for downtime

## 🔒 Security Checklist

- [ ] All API keys are properly secured
- [ ] Environment variables are not exposed in client code
- [ ] HTTPS is enforced
- [ ] CORS is properly configured
- [ ] Rate limiting is implemented
- [ ] Input validation is in place
- [ ] SQL injection protection is active (RLS)
- [ ] XSS protection is implemented
- [ ] Content Security Policy is configured

## 📊 Performance Optimization

1. **Frontend Optimization**
   - Enable gzip compression
   - Optimize images and assets
   - Implement lazy loading
   - Use CDN for static assets

2. **Database Optimization**
   - Ensure proper indexing
   - Monitor query performance
   - Set up connection pooling

3. **API Optimization**
   - Implement caching where appropriate
   - Optimize API response sizes
   - Use pagination for large datasets

## 🚨 Backup and Recovery

1. **Database Backups**
   - Supabase provides automatic backups
   - Set up additional backup strategy if needed

2. **Code Backups**
   - Ensure code is backed up in Git
   - Tag releases for easy rollback

3. **Recovery Plan**
   - Document recovery procedures
   - Test recovery process regularly

## 📈 Scaling Considerations

1. **Database Scaling**
   - Monitor database performance
   - Consider read replicas for high traffic
   - Implement connection pooling

2. **File Storage Scaling**
   - Monitor IPFS storage costs
   - Implement file cleanup policies
   - Consider CDN for frequently accessed files

3. **API Scaling**
   - Monitor API usage and costs
   - Implement rate limiting
   - Consider caching strategies

## 🔄 Maintenance

1. **Regular Updates**
   - Keep dependencies updated
   - Monitor security advisories
   - Update legal content as laws change

2. **Performance Monitoring**
   - Monitor app performance metrics
   - Track user engagement
   - Optimize based on usage patterns

3. **Legal Compliance**
   - Review content accuracy regularly
   - Update privacy policy and terms
   - Ensure compliance with local laws

## 📞 Support

For deployment issues:

1. Check the troubleshooting section in README.md
2. Review service provider documentation
3. Contact support through GitHub issues
4. Join our Discord community for help

---

**⚠️ Important**: Always test thoroughly in a staging environment before deploying to production. Keep backups of all critical data and configurations.
