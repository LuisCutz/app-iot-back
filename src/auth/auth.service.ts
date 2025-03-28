import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async register(registerDto: RegisterDto) {
    const existingUser = await this.prisma.usuario.findUnique({
      where: { email: registerDto.email },
    });

    if (existingUser) {
      throw new UnauthorizedException('El email ya está registrado');
    }

    const hashedPassword = await bcrypt.hash(registerDto.password, 10);

    const user = await this.prisma.usuario.create({
      data: {
        email: registerDto.email,
        nombre: registerDto.nombre,
        password: hashedPassword,
      },
    });

    // Convert BigInt to number before signing
    const token = this.jwtService.sign({
      sub: Number(user.id),
      email: user.email,
      nombre: user.nombre, // Incluir el nombre en el token
    });

    return {
      message: 'Usuario registrado exitosamente',
      access_token: token,
      user: {
        id: Number(user.id),
        email: user.email,
        nombre: user.nombre,
      },
    };
  }

  async login(loginDto: LoginDto) {
    const user = await this.prisma.usuario.findUnique({
      where: { email: loginDto.email },
    });

    if (!user) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const isPasswordValid = await bcrypt.compare(loginDto.password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    // Convert BigInt to number before signing
    const token = this.jwtService.sign({
      sub: Number(user.id),
      email: user.email,
      nombre: user.nombre, // Incluir el nombre en el token
    });

    return {
      message: 'Login exitoso',
      access_token: token,
      user: {
        id: Number(user.id),
        email: user.email,
        nombre: user.nombre,
      },
    };
  }
}