import * as express from 'express';
import { Post } from './post.interface';
import postModel from './post.model';
import PostNotFoundException from '../exceptions/PostNotFoundException';
import validationMiddleware from '../middlewares/validation.middleware';
import { CreatePostDto } from './post.dto';
class PostsController {
  public path = '/posts';
  public router = express.Router();
  private post = postModel;

  constructor() {
    this.intializeRoutes();
  }

  private intializeRoutes() {
    this.router.get(this.path, this.getAllPosts);
    this.router.post(this.path, validationMiddleware(CreatePostDto), this.createAPost);
    this.router.get(`${this.path}/:id`, this.getPostById);
    this.router.patch(`${this.path}/:id`, validationMiddleware(CreatePostDto, true), this.modifyPost);
    this.router.delete(`${this.path}/:id`, this.deletePost);
  }

  getAllPosts = (req: express.Request, res: express.Response) => {
    this.post.find()
      .then(posts => {
        res.send(posts)
      })
  }

  getPostById = (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const id = req.params.id;
    this.post.findById(id)
      .then(post => {
        if(post) 
          res.send(post);
        else 
          next(new PostNotFoundException(id));
      })
  }

  createAPost = (req: express.Request, res: express.Response) => {
    const postData : Post = req.body;
    const createdPost = new postModel(postData);

    createdPost.save()
      .then(savedPost => {
        res.send({
          "message": "successful",
          "record": savedPost
        })
      })
  }

  deletePost = (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const id = req.params.id;

    this.post.findByIdAndDelete(id)
      .then(successResponse => {
        if(successResponse)
          res.send(200)
      })
      .catch(() => next(new PostNotFoundException(id)))
  }

  modifyPost = (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const id = req.params.id;
    const postData: Post = req.body;

    this.post.findByIdAndUpdate(id, postData, {new: true})
      .then(post => {
        res.send(post);
      })
      .catch(() => next(new PostNotFoundException(id)))
  }
}

export default PostsController;
