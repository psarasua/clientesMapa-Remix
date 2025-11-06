import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import type { Usuario, LoginRequest, JWTPayload, SessionUser } from '~/types/database';
import { getUserByUsername } from './database.server';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-key';
const JWT_EXPIRES_IN = '24h';

// =====================================
// FUNCIONES DE HASH DE CONTRASEÑAS
// =====================================

export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 12;
  return await bcrypt.hash(password, saltRounds);
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return await bcrypt.compare(password, hashedPassword);
}

// =====================================
// FUNCIONES JWT
// =====================================

export function generateToken(user: Usuario): string {
  const payload: JWTPayload = {
    userId: user.id,
    username: user.username,
    email: user.email,
    nombre_completo: user.nombre_completo,
  };

  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

export function verifyToken(token: string): JWTPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;
    return decoded;
  } catch (error) {
    console.error('Error verificando token JWT:', error);
    return null;
  }
}

// =====================================
// FUNCIONES DE AUTENTICACIÓN
// =====================================

export async function authenticateUser(loginData: LoginRequest): Promise<{
  success: boolean;
  user?: Usuario;
  token?: string;
  error?: string;
}> {
  try {
    const { username, password } = loginData;

    // Buscar usuario por username
    const user = await getUserByUsername(username);
    
    if (!user) {
      return {
        success: false,
        error: 'Usuario no encontrado'
      };
    }

    // Verificar contraseña
    const isValidPassword = await verifyPassword(password, user.password);
    
    if (!isValidPassword) {
      return {
        success: false,
        error: 'Contraseña incorrecta'
      };
    }

    // Generar token JWT
    const token = generateToken(user);

    return {
      success: true,
      user,
      token
    };

  } catch (error) {
    console.error('Error en autenticación:', error);
    return {
      success: false,
      error: 'Error interno del servidor'
    };
  }
}

// =====================================
// UTILIDADES PARA COOKIES
// =====================================

export function createAuthCookie(token: string): string {
  const secure = process.env.NODE_ENV === 'production';
  const sameSite = 'lax';
  const maxAge = 24 * 60 * 60; // 24 hours in seconds

  return [
    `auth_token=${token}`,
    `HttpOnly`,
    `Path=/`,
    `Max-Age=${maxAge}`,
    `SameSite=${sameSite}`,
    secure ? `Secure` : '',
  ].filter(Boolean).join('; ');
}

export function createLogoutCookie(): string {
  return [
    `auth_token=`,
    `HttpOnly`,
    `Path=/`,
    `Max-Age=0`,
    `SameSite=lax`,
  ].join('; ');
}

// =====================================
// MIDDLEWARE DE AUTENTICACIÓN
// =====================================

export function getTokenFromRequest(request: Request): string | null {
  // Intentar obtener token de cookies
  const cookieHeader = request.headers.get('Cookie');
  if (cookieHeader) {
    const cookies = cookieHeader.split(';').reduce((acc, cookie) => {
      const [name, value] = cookie.trim().split('=');
      acc[name] = value;
      return acc;
    }, {} as Record<string, string>);

    if (cookies.auth_token) {
      return cookies.auth_token;
    }
  }

  // Intentar obtener token del header Authorization
  const authHeader = request.headers.get('Authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }

  return null;
}

export function getUserFromRequest(request: Request): SessionUser | null {
  const token = getTokenFromRequest(request);
  
  if (!token) {
    return null;
  }

  const payload = verifyToken(token);
  
  if (!payload) {
    return null;
  }

  return {
    id: payload.userId,
    username: payload.username,
    email: payload.email,
    nombre_completo: payload.nombre_completo,
  };
}

// =====================================
// VERIFICACIÓN DE PERMISOS
// =====================================

export function requireAuth(request: Request): SessionUser {
  const user = getUserFromRequest(request);
  
  if (!user) {
    throw new Response('No autorizado', { status: 401 });
  }
  
  return user;
}

export function redirectIfNotAuthenticated(request: Request, redirectTo: string = '/login'): SessionUser | never {
  const user = getUserFromRequest(request);
  
  if (!user) {
    throw new Response(null, {
      status: 302,
      headers: {
        Location: redirectTo,
      },
    });
  }
  
  return user;
}

export function redirectIfAuthenticated(request: Request, redirectTo: string = '/dashboard'): void {
  const user = getUserFromRequest(request);
  
  if (user) {
    throw new Response(null, {
      status: 302,
      headers: {
        Location: redirectTo,
      },
    });
  }
}

// =====================================
// VALIDACIONES
// =====================================

export function validateLoginData(formData: FormData): {
  valid: boolean;
  data?: LoginRequest;
  errors?: Record<string, string>;
} {
  const username = formData.get('username');
  const password = formData.get('password');

  const errors: Record<string, string> = {};

  if (!username || typeof username !== 'string' || username.trim().length === 0) {
    errors.username = 'El nombre de usuario es requerido';
  }

  if (!password || typeof password !== 'string' || password.length < 4) {
    errors.password = 'La contraseña debe tener al menos 4 caracteres';
  }

  if (Object.keys(errors).length > 0) {
    return { valid: false, errors };
  }

  return {
    valid: true,
    data: {
      username: username as string,
      password: password as string,
    },
  };
}