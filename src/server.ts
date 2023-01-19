import 'dotenv/config'

import { App } from './app';
import PostsController from './posts/post.controller';
import { validateEnv } from '../src/utils/validateEnv';

validateEnv();

const app = new App(
  [
    new PostsController(),
  ]
);

app.listen();