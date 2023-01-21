import 'dotenv/config'

import { App } from './app';
import PostsController from './posts/post.controller';
import { validateEnv } from '../src/utils/validateEnv';
import AuthenticationController from './authentication/authentication.controller';

validateEnv();

const app = new App(
  [
    new PostsController(),
    new AuthenticationController()
  ]
);

app.listen();