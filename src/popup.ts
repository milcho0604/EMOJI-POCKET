/**
 * 팝업 진입점
 */
import { AppController } from './controllers/AppController';

// 초기화
(async function init() {
  const app = new AppController();
  await app.initialize();
})();
