import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  // Возвращает тестовое приветствие от сервера
  getHello(): string {
    return 'Hello World!';
  }
}
