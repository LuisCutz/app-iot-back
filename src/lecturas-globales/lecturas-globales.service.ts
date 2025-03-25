import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { Cron } from '@nestjs/schedule';

@Injectable()
export class LecturasGlobalesService {
  private readonly logger = new Logger(LecturasGlobalesService.name);

  constructor(
    private prisma: PrismaService,
    private httpService: HttpService,
  ) {}

  private transformBigIntToNumber(data: any): any {
    if (data === null || data === undefined) {
      return data;
    }

    if (typeof data === 'bigint') {
      return Number(data);
    }

    if (data instanceof Date) {
      // Convertir a GMT-5
      const date = new Date(data);
      date.setHours(date.getHours() - 5);
      return date.toISOString();
    }

    if (Array.isArray(data)) {
      return data.map(item => this.transformBigIntToNumber(item));
    }

    if (typeof data === 'object') {
      const transformed = {};
      for (const key in data) {
        transformed[key] = this.transformBigIntToNumber(data[key]);
      }
      return transformed;
    }

    return data;
  }

  @Cron('*/5 * * * *') // Cada 5 minutos
  // La expresión cron */5 * * * * significa:
  // */5: cada 5 minutos
  // *: cualquier hora
  //*: cualquier día del mes
  //*: cualquier mes
  //*: cualquier día de la semana
  //Si quieres modificar el intervalo, puedes cambiar el número después del */. Por ejemplo:

  //*/10 * * * * - cada 10 minutos
  //*/15 * * * * - cada 15 minutos
  //*/30 * * * * - cada 30 minutos
  //0 * * * * - cada hora
  async obtenerYAlmacenarLecturas() {
    try {
      const { data } = await firstValueFrom(
        this.httpService.get('https://moriahmkt.com/iotapp/test/'),
      );

      this.logger.debug('Datos recibidos de la API:', data);

      if (!data?.sensores || !data?.parcelas) {
        throw new Error('La respuesta de la API no tiene el formato esperado');
      }

      // Obtener todas las parcelas de la base de datos
      const todasLasParcelas = await this.prisma.parcela.findMany({
        select: { id: true, nombre: true, activo: true },
      });

      // Crear mapas para facilitar la búsqueda
      const parcelasDB = new Map(todasLasParcelas.map(p => [p.id, p]));
      const idsParcelasAPI = new Set(data.parcelas.map(p => p.id));

      // Marcar como inactivas las parcelas que ya no existen en la API
      for (const [idParcela, parcela] of parcelasDB) {
        if (!idsParcelasAPI.has(idParcela) && parcela.activo) {
          await this.prisma.parcela.update({
            where: { id: idParcela },
            data: { activo: false },
          });
        }
      }

      // Almacenar lectura global
      const lecturaGlobal = await this.prisma.lecturaGlobal.create({
        data: {
          humedad: parseFloat(data.sensores.humedad),
          temperatura: parseFloat(data.sensores.temperatura),
          lluvia: parseFloat(data.sensores.lluvia),
          sol: parseFloat(data.sensores.sol),
        },
      });

      this.logger.log(
        `Nueva lectura global registrada - Humedad: ${data.sensores.humedad}%, Temperatura: ${data.sensores.temperatura}°C, Lluvia: ${data.sensores.lluvia}mm, Sol: ${data.sensores.sol}%`,
      );

      // Procesar y almacenar lecturas de parcelas
      for (const parcela of data.parcelas) {
        // Actualizar o crear parcela
        const parcelaActualizada = await this.prisma.parcela.upsert({
          where: { id: parcela.id },
          create: {
            id: parcela.id,
            nombre: parcela.nombre,
            ubicacion: parcela.ubicacion,
            responsable: parcela.responsable,
            tipo_cultivo: parcela.tipo_cultivo,
            latitud: parseFloat(parcela.latitud.toString()),
            longitud: parseFloat(parcela.longitud.toString()),
            activo: true,
          },
          update: {
            nombre: parcela.nombre,
            ubicacion: parcela.ubicacion,
            responsable: parcela.responsable,
            tipo_cultivo: parcela.tipo_cultivo,
            latitud: parseFloat(parcela.latitud.toString()),
            longitud: parseFloat(parcela.longitud.toString()),
            activo: true,
          },
        });

        // Crear lectura para la parcela
        const lecturaParcela = await this.prisma.lectura.create({
          data: {
            parcela_id: parcelaActualizada.id,
            humedad: parseFloat(parcela.sensor.humedad.toString()),
            temperatura: parseFloat(parcela.sensor.temperatura.toString()),
            lluvia: parseFloat(parcela.sensor.lluvia.toString()),
            sol: parseFloat(parcela.sensor.sol.toString()),
            ultimo_riego: parcela.ultimo_riego ? new Date(parcela.ultimo_riego) : null,
          },
        });

        this.logger.log(
          `Nueva lectura para parcela "${parcela.nombre}" - Humedad: ${parcela.sensor.humedad}%, Temperatura: ${parcela.sensor.temperatura}°C, Lluvia: ${parcela.sensor.lluvia}mm, Sol: ${parcela.sensor.sol}%`,
        );
      }

      return this.transformBigIntToNumber(lecturaGlobal);
    } catch (error) {
      this.logger.error('Error al obtener o almacenar lecturas:', error);
      if (error.response) {
        this.logger.error('Respuesta de la API:', error.response.data);
      }
      throw error;
    }
  }

  async obtenerHistorico() {
    const historico = await this.prisma.lecturaGlobal.findMany({
      orderBy: {
        fecha_lectura: 'desc',
      },
    });
    return this.transformBigIntToNumber(historico);
  }

  async obtenerParcelasConUltimaLectura() {
    const parcelas = await this.prisma.parcela.findMany({
      include: {
        lecturas: {
          orderBy: {
            fecha_lectura: 'desc',
          },
          take: 1,
        },
      },
    });
    return this.transformBigIntToNumber(parcelas);
  }
}
