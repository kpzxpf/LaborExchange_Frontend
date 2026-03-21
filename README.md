# 🎨 LaborExchange Frontend

<div align="center">

![Next.js](https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=for-the-badge&logo=typescript)
![React](https://img.shields.io/badge/React-18-blue?style=for-the-badge&logo=react)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3-38bdf8?style=for-the-badge&logo=tailwind-css)

**Modern Job Search Platform Frontend**

</div>

---

## 📋 Overview

Next.js 14 frontend application for the LaborExchange platform, providing interfaces for job seekers and employers.

### Key Features

✅ **Next.js App Router** - Server components and client components  
✅ **TypeScript** - Type-safe development  
✅ **Tailwind CSS** - Utility-first styling  
✅ **Authentication** - JWT-based with AuthContext  
✅ **Role-Based UI** - Different views for job seekers and employers  
✅ **Responsive Design** - Mobile-first approach  

## 🏗️ Architecture

**Port:** 3000  
**Framework:** Next.js 14 with App Router  

### Directory Structure

```
labor_exchange_frontend/
├── app/
│   ├── auth/
│   │   ├── login/
│   │   └── register/
│   ├── employer/
│   │   ├── vacancies/
│   │   ├── applications/
│   │   └── company/
│   ├── jobseeker/
│   │   ├── vacancies/
│   │   ├── resume/
│   │   └── applications/
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── ui/
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   ├── Input.tsx
│   │   └── Modal.tsx
│   ├── Header.tsx
│   ├── Footer.tsx
│   └── VacancyCard.tsx
├── contexts/
│   └── AuthContext.tsx
├── services/
│   ├── api.ts
│   ├── authService.ts
│   ├── vacancyService.ts
│   ├── resumeService.ts
│   └── applicationService.ts
├── types/
│   ├── user.ts
│   ├── vacancy.ts
│   ├── resume.ts
│   └── application.ts
└── utils/
    ├── constants.ts
    └── helpers.ts
```

## 🛠️ Technology Stack

| Category | Technology |
|----------|-----------|
| Framework | Next.js 14 |
| Language | TypeScript 5 |
| Styling | Tailwind CSS 3 |
| HTTP Client | Axios |
| Forms | React Hook Form |
| Validation | Zod |
| Animations | Framer Motion |
| Icons | Lucide React |

## 🚀 Installation

### Prerequisites

- Node.js 18+
- npm or yarn

### Setup

```bash
# Clone repository
git clone https://github.com/yourusername/laborexchange.git
cd laborexchange/labor_exchange_frontend

# Install dependencies
npm install

# Set environment variables
cp .env.example .env.local

# Edit .env.local
NEXT_PUBLIC_API_URL=http://localhost:8080
```

### Run Development Server

```bash
# Development mode
npm run dev

# Production build
npm run build
npm start

# Type checking
npm run type-check

# Linting
npm run lint
```

## ⚙️ Configuration

### Environment Variables

```env
# .env.local
NEXT_PUBLIC_API_URL=http://localhost:8080
NEXT_PUBLIC_APP_NAME=LaborExchange
```

### next.config.js

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: ['localhost'],
  },
  env: {
    API_URL: process.env.NEXT_PUBLIC_API_URL,
  },
}

module.exports = nextConfig
```

### tailwind.config.js

```javascript
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0fdf4',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
        },
      },
    },
  },
  plugins: [],
}
```

## 🔐 Authentication

### AuthContext

```typescript
// contexts/AuthContext.tsx
'use client';

import React, { createContext, useState, useContext, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { authService } from '@/services/authService';

interface User {
  id: number;
  email: string;
  role: 'JOB_SEEKER' | 'EMPLOYER' | 'ADMIN';
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();

  useEffect(() => {
    // Load user from localStorage
    const token = localStorage.getItem('token');
    if (token) {
      const decodedUser = decodeToken(token);
      setUser(decodedUser);
    }
  }, []);

  const login = async (email: string, password: string) => {
    const response = await authService.login(email, password);
    const token = response.token;
    
    localStorage.setItem('token', token);
    const decodedUser = decodeToken(token);
    setUser(decodedUser);
    
    // Redirect based on role
    if (decodedUser.role === 'EMPLOYER') {
      router.push('/employer/vacancies');
    } else {
      router.push('/jobseeker/vacancies');
    }
  };

  const register = async (data: RegisterData) => {
    const response = await authService.register(data);
    const token = response.token;
    
    localStorage.setItem('token', token);
    const decodedUser = decodeToken(token);
    setUser(decodedUser);
    
    router.push(decodedUser.role === 'EMPLOYER' ? '/employer' : '/jobseeker');
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    router.push('/auth/login');
  };

  return (
    <AuthContext.Provider value={{
      user,
      login,
      register,
      logout,
      isAuthenticated: !!user,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};

function decodeToken(token: string): User {
  const payload = JSON.parse(atob(token.split('.')[1]));
  return {
    id: payload.userId,
    email: payload.sub,
    role: payload.role,
  };
}
```

## 📡 API Services

### API Client

```typescript
// services/api.ts
import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - add JWT token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor - handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/auth/login';
    }
    return Promise.reject(error);
  }
);

export default api;
```

### Service Examples

```typescript
// services/vacancyService.ts
import api from './api';
import { Vacancy, CreateVacancyRequest } from '@/types/vacancy';

export const vacancyService = {
  async getAll(page = 0, size = 20): Promise<Vacancy[]> {
    const response = await api.get(`/api/vacancies?page=${page}&size=${size}`);
    return response.data.content;
  },

  async getById(id: number): Promise<Vacancy> {
    const response = await api.get(`/api/vacancies/${id}`);
    return response.data;
  },

  async create(data: CreateVacancyRequest): Promise<Vacancy> {
    const response = await api.post('/api/vacancies', data);
    return response.data;
  },

  async update(id: number, data: Partial<Vacancy>): Promise<Vacancy> {
    const response = await api.put(`/api/vacancies/${id}`, data);
    return response.data;
  },

  async delete(id: number): Promise<void> {
    await api.delete(`/api/vacancies/${id}`);
  },

  async publish(id: number): Promise<Vacancy> {
    const response = await api.post(`/api/vacancies/${id}/publish`);
    return response.data;
  },
};
```

## 🎨 Components

### Button Component

```typescript
// components/ui/Button.tsx
import { ButtonHTMLAttributes } from 'react';
import { cn } from '@/utils/helpers';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'sm' | 'md' | 'lg';
}

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  className,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        'rounded-lg font-medium transition-colors',
        {
          'bg-primary-600 text-white hover:bg-primary-700': variant === 'primary',
          'bg-gray-200 text-gray-800 hover:bg-gray-300': variant === 'secondary',
          'bg-red-600 text-white hover:bg-red-700': variant === 'danger',
        },
        {
          'px-3 py-1.5 text-sm': size === 'sm',
          'px-4 py-2 text-base': size === 'md',
          'px-6 py-3 text-lg': size === 'lg',
        },
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}
```

### Vacancy Card

```typescript
// components/VacancyCard.tsx
import { Vacancy } from '@/types/vacancy';
import { Button } from './ui/Button';

interface VacancyCardProps {
  vacancy: Vacancy;
  onApply?: () => void;
}

export function VacancyCard({ vacancy, onApply }: VacancyCardProps) {
  return (
    <div className="border rounded-lg p-6 hover:shadow-lg transition-shadow">
      <h3 className="text-xl font-bold mb-2">{vacancy.title}</h3>
      <p className="text-gray-600 mb-4">{vacancy.company?.name}</p>
      <p className="text-gray-700 mb-4 line-clamp-3">{vacancy.description}</p>
      <div className="flex justify-between items-center">
        <span className="text-lg font-semibold text-primary-600">
          ${vacancy.salary?.toLocaleString()}
        </span>
        {onApply && (
          <Button onClick={onApply}>Apply Now</Button>
        )}
      </div>
    </div>
  );
}
```

## 🧪 Testing

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Coverage
npm run test:coverage
```

## 🚀 Deployment

### Production Build

```bash
# Build
npm run build

# Start production server
npm start
```

### Docker

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
```

## 📊 Features by Role

### Job Seeker
- Browse vacancies
- Create/edit resume
- Apply to jobs
- Track applications
- Withdraw applications

### Employer
- Post vacancies
- Manage company profile
- View applications
- Reject/accept candidates
- Manage job postings

---

<div align="center">


</div>
