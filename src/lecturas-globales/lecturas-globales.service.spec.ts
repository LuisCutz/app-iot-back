import { Test, TestingModule } from '@nestjs/testing';
import { LecturasGlobalesService } from './lecturas-globales.service';

describe('LecturasGlobalesService', () => {
  let service: LecturasGlobalesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [LecturasGlobalesService],
    }).compile();

    service = module.get<LecturasGlobalesService>(LecturasGlobalesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
