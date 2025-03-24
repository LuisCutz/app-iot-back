import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { Cron } from '@nestjs/schedule';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class LecturasGlobalesService {
  private readonly logger = new Logger(LecturasGlobalesService.name);

  constructor(
    private prisma: PrismaService,
    private httpService: HttpService,
    private configService: ConfigService,
  ) {}

  @Cron('*/1 * * * *') // Cada 1 minuto
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

      // Verificar que los datos necesarios estén presentes
      if (!data?.sensores || !data?.parcelas) {
        throw new Error('La respuesta de la API no tiene el formato esperado');
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

      this.logger.log(`Nueva lectura global almacenada con ID: ${lecturaGlobal.id}`);

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
            usuario_id: 1, // Asumimos un usuario por defecto
            activo: true,
          },
          update: {
            nombre: parcela.nombre,
            ubicacion: parcela.ubicacion,
            responsable: parcela.responsable,
            tipo_cultivo: parcela.tipo_cultivo,
            latitud: parseFloat(parcela.latitud.toString()),
            longitud: parseFloat(parcela.longitud.toString()),
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

        this.logger.log(`Nueva lectura de parcela almacenada con ID: ${lecturaParcela.id}`);
      }

      return lecturaGlobal;
    } catch (error) {
      this.logger.error('Error al obtener o almacenar lecturas:', error);
      if (error.response) {
        this.logger.error('Respuesta de la API:', error.response.data);
      }
      throw error;
    }
  }

  async obtenerHistorico() {
    return this.prisma.lecturaGlobal.findMany({
      orderBy: {
        fecha_lectura: 'desc',
      },
    });
  }

  async obtenerParcelasConUltimaLectura() {
    return this.prisma.parcela.findMany({
      include: {
        lecturas: {
          orderBy: {
            fecha_lectura: 'desc',
          },
          take: 1,
        },
      },
    });
  }
}