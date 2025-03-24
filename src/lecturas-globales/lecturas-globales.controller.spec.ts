import { Test, TestingModule } from '@nestjs/testing';
import { LecturasGlobalesController } from './lecturas-globales.controller';

describe('LecturasGlobalesController', () => {
  let controller: LecturasGlobalesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LecturasGlobalesController],
    }).compile();

    controller = module.get<LecturasGlobalesController>(LecturasGlobalesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
