# HeartMail - Next.js 14 Application

A complete HeartMail application built with Next.js 14, TypeScript, Tailwind CSS, and modern React patterns.

## 🚀 Features

- **Modern Tech Stack**: Next.js 14 with App Router, TypeScript, Tailwind CSS
- **UI Components**: Shadcn/ui components with custom HeartMail theming
- **State Management**: Zustand for global state management
- **Forms**: React Hook Form with validation
- **Responsive Design**: Mobile-first design with Tailwind CSS
- **Authentication**: Login, signup, and password recovery pages
- **Dashboard**: Complete dashboard with recipients, templates, and scheduling
- **Letter Library**: Template marketplace with categories and previews
- **Brand Consistency**: Purple gradient theme with floating hearts animation

## 🎨 Design System

- **Primary Color**: HeartMail Pink (#E63365)
- **Gradient Backgrounds**: Purple to pink gradients
- **Typography**: Inter font family
- **Animations**: Floating hearts and smooth transitions
- **Components**: Custom Shadcn/ui components with HeartMail theming

## 📁 Project Structure

```
HeartMail-site/
├── app/                          # Next.js 14 App Router
│   ├── dashboard/                # Dashboard pages
│   ├── letter-library/           # Letter Library pages
│   ├── login/                    # Authentication pages
│   ├── signup/
│   └── page.tsx                  # Home page
├── components/                   # React components
│   ├── auth/                     # Authentication components
│   ├── dashboard/                # Dashboard components
│   ├── layout/                   # Layout components
│   ├── letter-library/           # Letter Library components
│   ├── sections/                 # Home page sections
│   └── ui/                       # Shadcn/ui components
├── lib/                          # Utilities and store
│   ├── store.ts                  # Zustand store
│   └── utils.ts                  # Utility functions
└── styles/                       # Global styles
```

## 🛠️ Installation

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Run the development server**:
   ```bash
   npm run dev
   ```

3. **Open your browser**:
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📱 Pages

### Home Page
- Hero section with floating hearts animation
- Features section with 6 key features
- About section with company story and stats
- Pricing section with 3 plans
- Call-to-action section

### Letter Library
- Hero section with search functionality
- Categories grid with 6 template categories
- Featured templates with preview functionality
- Template preview modals

### Authentication
- Login page with form validation
- Signup page with password strength indicator
- Forgot password page with success states
- Floating hearts background on all auth pages

### Dashboard
- Responsive sidebar navigation
- Quick actions grid
- Statistics overview
- Recent activity feed
- Mobile-friendly design

## 🎯 Key Components

### Layout Components
- `Navbar`: Responsive navigation with HeartMail branding
- `Footer`: Company links and information
- `DashboardLayout`: Sidebar navigation for dashboard pages

### UI Components
- Custom Shadcn/ui components with HeartMail theming
- Button variants with HeartMail colors
- Card components for content display
- Input components with icons

### State Management
- Zustand store for global state
- User management
- Template management
- Recipient management

## 🎨 Styling

- **Tailwind CSS**: Utility-first CSS framework
- **Custom Classes**: HeartMail-specific utility classes
- **Responsive Design**: Mobile-first approach
- **Animations**: CSS animations for floating hearts
- **Gradients**: Purple to pink gradient backgrounds

## 🔧 Development

### Available Scripts
- `npm run dev`: Start development server
- `npm run build`: Build for production
- `npm run start`: Start production server
- `npm run lint`: Run ESLint

### Tech Stack
- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Components**: Shadcn/ui
- **State**: Zustand
- **Forms**: React Hook Form
- **Icons**: Lucide React
- **Animations**: Framer Motion

## 🚀 Deployment

The application is ready for deployment on Vercel, Netlify, or any other Next.js-compatible platform.

1. **Build the application**:
   ```bash
   npm run build
   ```

2. **Deploy to your platform**:
   - Vercel: Connect your GitHub repository
   - Netlify: Deploy from build folder
   - Other platforms: Follow Next.js deployment guides

## 💖 HeartMail Branding

- **Logo**: Heart icon with HeartMail text
- **Colors**: Pink (#E63365) primary, purple gradients
- **Theme**: Love, connection, family
- **Animation**: Floating hearts on hero sections
- **Typography**: Inter font for modern, clean look

## 📞 Support

For questions or support, please contact the HeartMail team.

---

Built with ❤️ for keeping hearts connected, one email at a time.
