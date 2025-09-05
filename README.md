# KnowYourRights Card

> **Instant legal guidance and evidence capture, right in your pocket.**

A mobile-first web application that provides users with state-specific legal rights and 'do's and don'ts' when interacting with law enforcement, along with recording and alert functionalities.

## 🚀 Features

### Core Features
- **State-Specific Rights & Scripts**: Tailored legal information and ready-to-use dialogue paths for your location
- **Record & Alert Functionality**: Discreet evidence gathering with immediate notification to trusted contacts
- **Multi-Language Support**: Available in English and Spanish
- **Mobile-Optimized**: Clean, scannable interface designed for quick access under stress

### Premium Features
- **All 50 States + DC**: Complete coverage of state-specific legal information
- **Unlimited Recording**: No time limits on evidence capture
- **Up to 10 Alert Contacts**: Comprehensive emergency notification system
- **Cloud Storage**: Secure IPFS-based storage for recordings
- **Offline Access**: Download guides for offline use

## 🛠 Tech Stack

- **Frontend**: React 18, Vite, Tailwind CSS
- **Backend**: Supabase (PostgreSQL, Auth, Edge Functions)
- **Storage**: Pinata IPFS for decentralized file storage
- **Payments**: Stripe for subscription management
- **AI**: OpenAI GPT-4 for content generation and translation
- **State Management**: Zustand
- **Forms**: React Hook Form
- **Notifications**: React Hot Toast

## 📋 Prerequisites

Before you begin, ensure you have:

- Node.js 18+ installed
- A Supabase account and project
- A Stripe account (for payments)
- An OpenAI API key
- A Pinata account (for IPFS storage)

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/vistara-apps/this-is-a-7784.git
cd this-is-a-7784
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Setup

Copy the environment template and fill in your values:

```bash
cp .env.example .env
```

Edit `.env` with your actual API keys and configuration:

```env
# Supabase
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# Stripe
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key
VITE_STRIPE_PREMIUM_PRICE_ID=price_your_premium_price_id

# OpenAI
VITE_OPENAI_API_KEY=sk-your_openai_api_key

# Pinata IPFS
VITE_PINATA_JWT=your_pinata_jwt_token
```

### 4. Database Setup

Run the SQL schema in your Supabase SQL editor:

```bash
# Copy the contents of database/schema.sql and run in Supabase
```

### 5. Start Development Server

```bash
npm run dev
```

Visit `http://localhost:5173` to see the app running.

## 🗄 Database Schema

The application uses the following main tables:

- **users**: User profiles and subscription information
- **guides**: State-specific legal rights content
- **recordings**: User recordings with IPFS storage
- **saved_guides**: User's saved legal guides

See `database/schema.sql` for the complete schema.

## 🔧 Configuration

### Supabase Setup

1. Create a new Supabase project
2. Run the SQL schema from `database/schema.sql`
3. Configure Row Level Security (RLS) policies
4. Set up Edge Functions for alerts and payments

### Stripe Setup

1. Create Stripe products and prices
2. Set up webhooks for subscription events
3. Configure customer portal settings

### OpenAI Setup

1. Get an API key from OpenAI
2. Set usage limits and monitoring
3. Configure content generation prompts

### Pinata Setup

1. Create a Pinata account
2. Generate API keys and JWT token
3. Configure IPFS gateway settings

## 📱 Usage

### For Users

1. **Access Rights Information**: Select your state to view specific legal rights
2. **Record Interactions**: Use the one-tap record button for evidence capture
3. **Send Alerts**: Quickly notify emergency contacts with location and recording links
4. **Manage Contacts**: Add and test emergency contacts in your profile

### For Developers

1. **Content Generation**: Use OpenAI integration to generate new state content
2. **Storage Management**: Recordings are automatically stored on IPFS
3. **Subscription Handling**: Stripe webhooks manage subscription status
4. **Multi-language**: Content is available in English and Spanish

## 🔒 Security & Privacy

- **End-to-End Security**: All recordings are encrypted before IPFS storage
- **Decentralized Storage**: IPFS ensures recordings can't be censored or lost
- **Row Level Security**: Database access is restricted by user authentication
- **No Tracking**: Minimal data collection focused on core functionality

## 🚀 Deployment

### Vercel (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

### Netlify

```bash
# Build the project
npm run build

# Deploy dist/ folder to Netlify
```

### Docker

```bash
# Build Docker image
docker build -t knowyourrights-card .

# Run container
docker run -p 3000:3000 knowyourrights-card
```

## 🧪 Testing

```bash
# Run tests
npm test

# Run tests with coverage
npm run test:coverage

# Run E2E tests
npm run test:e2e
```

## 📊 Monitoring

The app includes built-in monitoring for:

- **Error Tracking**: Sentry integration for error monitoring
- **Analytics**: Google Analytics for usage tracking
- **Performance**: Web Vitals monitoring
- **API Usage**: OpenAI and Pinata usage tracking

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Documentation**: Check the `/docs` folder for detailed guides
- **Issues**: Report bugs and request features via GitHub Issues
- **Community**: Join our Discord for community support
- **Email**: Contact support@knowyourrightscard.com

## 🗺 Roadmap

### Phase 1 (Current)
- ✅ Basic rights information for major states
- ✅ Recording and alert functionality
- ✅ User authentication and subscriptions
- ✅ Multi-language support (EN/ES)

### Phase 2 (Next)
- 🔄 All 50 states + DC coverage
- 🔄 Offline functionality with PWA
- 🔄 Advanced recording features (audio-only mode)
- 🔄 Integration with legal aid organizations

### Phase 3 (Future)
- 📋 Know Your Rights training modules
- 📋 Community-contributed content
- 📋 Integration with body cameras
- 📋 Legal consultation booking

## 🙏 Acknowledgments

- **Legal Experts**: Thanks to civil rights attorneys who reviewed content
- **Community**: Beta testers and feedback providers
- **Open Source**: Built on amazing open source technologies
- **Inspiration**: Dedicated to protecting civil rights for everyone

---

**⚠️ Legal Disclaimer**: This app provides general legal information and should not be considered legal advice. Always consult with a qualified attorney for specific legal situations.

**🚨 Emergency**: If you're in immediate danger, call 911 or your local emergency services.
