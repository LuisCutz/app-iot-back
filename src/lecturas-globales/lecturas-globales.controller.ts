import { Controller, Get } from '@nestjs/common';
import { LecturasGlobalesService } from './lecturas-globales.service';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('lecturas-globales')
@Controller('lecturas-globales')
export class LecturasGlobalesController {
  constructor(private readonly lecturasGlobalesService: LecturasGlobalesService) {}

  @Get()
  @ApiOperation({ summary: 'Obtener histórico de lecturas globales' })
  @ApiResponse({ status: 200, description: 'Retorna el histórico de lecturas' })
  async obtenerHistorico() {
    return this.lecturasGlobalesService.obtenerHistorico();
  }

  @Get('actual')
  @ApiOperation({ summary: 'Obtener y almacenar lectura actual' })
  @ApiResponse({ status: 200, description: 'Retorna la lectura actual' })
  async obtenerLecturaActual() {
    return this.lecturasGlobalesService.obtenerYAlmacenarLecturas();
  }

  @Get('parcelas')
  @ApiOperation({ summary: 'Obtener parcelas con su última lectura' })
  @ApiResponse({ status: 200, description: 'Retorna las parcelas con sus últimas lecturas' })
  async obtenerParcelas() {
    return this.lecturasGlobalesService.obtenerParcelasConUltimaLectura();
  }
}