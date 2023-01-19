import { Router } from "express";

export interface Controler {
  path: string;
  router: Router;
}