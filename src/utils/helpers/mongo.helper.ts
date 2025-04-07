import { MongooseModuleOptions } from '@nestjs/mongoose';

import { config } from '../../config/app.config';

export const getMongooseConfig = (): MongooseModuleOptions => ({
  uri: config.mongoUri,
});
