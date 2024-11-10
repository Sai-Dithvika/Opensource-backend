import * as express from "express";
import { Request, Response, Express, Router } from "express";
import { UserController } from "../controllers";
import { User } from "../queries/userQueries";
const router: Router = express.Router();
import { pool } from "../config/config";
const BASE_ROUTE = "/users";
router.get("/ctest", async (_, res: Response) => {
  try {
    const client = await pool.connect();
  } catch (err) {
    console.error();
  }
});
//@ts-ignore
router.get("/all/posts", UserController.get_all_posts);
//@ts-ignore
router.get("/myposts", UserController.get_my_posts);
//@ts-ignore
router.get("/post/:id", UserController.get_post_id);
//@ts-ignore
router.get("/comments/:id", UserController.get_comment);
//@ts-ignore
router.get("/totalcomment/:id", UserController.get_count_comment);
//@ts-ignore
router.get("/totalikes/:id", UserController.total_vote);
//@ts-ignore
router.post("/initpost", UserController.create_post);
//@ts-ignore
router.post("/comment", UserController.add_comment);
//@ts-ignore
router.post("/inituser", UserController.add_user);
////
//@ts-ignore
router.post("/i-post", UserController.interact_post);
//@ts-ignore
router.post("/i-comment", UserController.interact_comment);
//router.post('/like' , UserController);
//router.post('/dislike' , UserController);

const MODULE = {
  BASE_ROUTE,
  router,
};
export default MODULE;
