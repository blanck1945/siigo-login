//import * as logger from '@npmtapi/tap-lib-logger';
import dotenv from 'dotenv'; //Force include dotenv node_modules when serverless
import handleSiigoLogin from '../../controllers/handleSiigoLogin';

//global.logger = logger;

export const handlerRequests = async (event, _context) =>
  await handleSiigoLogin(event);
