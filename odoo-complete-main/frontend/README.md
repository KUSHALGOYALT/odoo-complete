# SkillSwap Frontend

A modern React-based frontend for the SkillSwap application, built with Vite, TypeScript, and Tailwind CSS.

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- Backend server running on port 8091

### Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start the development server:**
   ```bash
   npm run dev
   ```

3. **Open your browser:**
   Navigate to [http://localhost:5173](http://localhost:5173)

## 📁 Project Structure

```
src/
├── components/          # React components
│   ├── ui/             # Reusable UI components (shadcn/ui)
│   ├── Dashboard.tsx   # Admin dashboard
│   ├── UserDashboard.tsx # User dashboard
│   ├── SwapPage.tsx    # Skill swap functionality
│   ├── ChatPage.tsx    # Messaging system
│   └── ...
├── pages/              # Page components
├── services/           # API services
├── config/             # Configuration files
├── hooks/              # Custom React hooks
└── lib/                # Utility functions
```

## 🛠️ Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## 🔧 Configuration

### API Configuration
The frontend is configured to connect to the backend API at `http://localhost:8091/api`. This can be modified in:
- `src/config/api.js`
- Individual component files

### Environment Variables
Create a `.env` file in the root directory for environment-specific configuration:

```env
VITE_API_BASE_URL=http://localhost:8091/api
VITE_APP_NAME=SkillSwap
```

## 🎨 Features

### Responsive Design
- Mobile-first approach
- Responsive layouts for all screen sizes
- Touch-friendly interactions

### Authentication
- JWT-based authentication
- Protected routes
- User session management

### Core Functionality
- **User Dashboard**: Profile management and statistics
- **Skill Swapping**: Tinder-like interface for skill matching
- **Chat System**: Real-time messaging between users
- **Notifications**: Real-time alerts and updates
- **Admin Panel**: User and system management

### UI Components
- Built with shadcn/ui components
- Custom Tailwind CSS styling
- Consistent design system
- Dark/light theme support

## 🔌 Backend Integration

The frontend communicates with the backend through RESTful APIs:

- **Authentication**: `/api/auth/*`
- **Users**: `/api/users/*`
- **Swaps**: `/api/swaps/*`
- **Chat**: `/api/chat/*`
- **Ratings**: `/api/ratings/*`

## 🐛 Troubleshooting

### Common Issues

1. **Port already in use:**
   ```bash
   # Kill process on port 5173
   npx kill-port 5173
   ```

2. **API connection errors:**
   - Ensure backend is running on port 8091
   - Check CORS configuration in backend
   - Verify API endpoints are accessible

3. **Build errors:**
   ```bash
   # Clear cache and reinstall
   rm -rf node_modules package-lock.json
   npm install
   ```

4. **TypeScript errors:**
   ```bash
   # Check for type errors
   npx tsc --noEmit
   ```

### Development Tips

- Use the browser's developer tools to debug
- Check the Network tab for API requests
- Monitor the Console for JavaScript errors
- Use React Developer Tools for component debugging

## 📱 Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## 🚀 Deployment

### Production Build
```bash
npm run build
```

The build output will be in the `dist/` directory.

### Deployment Options
- **Vercel**: Connect your GitHub repository
- **Netlify**: Drag and drop the `dist/` folder
- **AWS S3**: Upload the `dist/` contents
- **Docker**: Use the provided Dockerfile

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Check the troubleshooting section above
- Review the backend documentation
- Open an issue on GitHub 