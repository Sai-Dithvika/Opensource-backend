import dotenv from "dotenv";
dotenv.config();
import express, { NextFunction, Request, Response } from "express";
import { pool } from "../config/config";
import { userQueries } from "../queries";
import axios from "axios";
import { post_type } from "../lib/types";
// user_id ---> github_name

const flask_url = 'https://37b4-14-98-244-193.ngrok-free.app/add_post';
const flask_toxicity_url = 'https://37b4-14-98-244-193.ngrok-free.app/check';

const add_user = async (req: Request, res: Response) => {
  const { github_id, user_email, avatar_url, tags_of_interest } = req.body;
  const client = await pool.connect();
  try {
    const result = await client.query(userQueries.create_user, [ github_id,user_email, avatar_url, tags_of_interest,]);
    if (result != null) { return res.status(200).json({ statusCode: 201, msg: "user created successfully" }); }
    else { return res.status(500).json({ statusCode: 500, msg: "error while creating post" }); }
  } 
  catch (err) {
    console.error(err);
    return res.status(500).json({ statusCode: 500, msg: "internal server error" });
  } 
  finally {
    client.release();
  }
};
const create_post = async (req: Request, res: Response) => {
  const { user_id, title, content, tags, imageurl } = req.body;
  console.log(req.body);
  const client = await pool.connect();
  try {
    const result = await client.query(userQueries.create_post, [user_id,title,content,tags,]);
    if (result !== null) { 
    //
    //console.log(result);
    const post_id = await client.query(userQueries.get_latest_post , [user_id]);
    if(post_id === null) return res.status(404).json({msg : "error"});
    const p_id = post_id.rows[0].post_id;
    
    const fres = await axios.post(flask_url , {user_id : user_id , post_id : p_id , content : content , tags : tags , total_likes :  0 , total_dislikes :  0 , total_comments :  0});
    console.log(fres);
    if(fres.status === 500) return res.status(404).json({msg : "error in flsdk"});

      return res.status(201).json({ statusCode: 201, msg: "post created succcessfully" }); 


    }
    else{ return res.status(500).json({ statusCode: 500, msg: "error while creating post" }); }
    
  } 
  catch (err) {
      console.error(err);
      return res.status(500).json({statusCode: 500 , msg : `internal server error`});
  } finally {
    client.release();
  }
};


const get_all_posts = async (req: Request, res: Response,next: NextFunction ) => {
  const client = await pool.connect();
  try {
    const { rows, rowCount } = await client.query(userQueries.get_all_posts, []);

    if (rowCount === 0) {
      return res.status(404).json({ statusCode: 404, msg: "Post not found" });
    }

    //console.log(rows);
    return res.status(200).json({ statusCode: 200, msg: "Post found", post: rows});
  } 
  catch (err) {
    console.error("Error getting post:", err);
    return res.status(500).json({ statusCode: 500, msg: "Internal server error" });
  } 
  finally {
    client.release();
  }
};

const get_post_id = async (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params; // Use req.params for URL params
  //const id = 23;
  const client = await pool.connect();
  try {
    const { rows, rowCount } = await client.query(userQueries.get_post_by_id, [id]);

    if (rowCount == 0) { return res.status(404).json({ statusCode: 404, msg: "No data available" }); }

    return  res.status(200).json({ statusCode: 200, msg: "Here is your post", data: rows });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ statusCode: 500, msg: "Internal server error" });
  } 
  finally {
    client.release();
  }
};

const get_my_posts = async (req: Request, res: Response) => {
  const { user_id } = req.body;
  const client = await pool.connect();
  try {
    const { rows, rowCount } = await client.query(userQueries.get_my_posts, [
      user_id,
    ]);
    if (rowCount == 0)
      return res
        .status(403)
        .json({ statusCode: 403, msg: "no data available" });
    else
      return res
        .status(200)
        .json({ statusCode: 200, msg: "here is your posts", data: rows });
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .json({ statusCode: 500, msg: "internal server error" });
  } finally {
    client.release();
  }
};

const get_comment = async (req: Request, res: Response) => {
  const { id } = req.params;
  console.log(id);
  const client = await pool.connect();
  try {
    const result = await client.query(userQueries.get_comment_id, [id]);
    if (result != null) {
      console.log(result.rows);
      return res
        .status(200)
        .json({ statusCode: 200, msg: "comments found", data: result.rows });
    } else
      return res
        .status(404)
        .json({ statusCode: 404, msg: "no comments found" });
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .json({ statusCode: 500, msg: "internal server error" });
  } finally {
    client.release();
  }
};

const get_count_comment = async (req: Request, res: Response) => {
  const { id } = req.params;
  console.log(id);
  const client = await pool.connect();
  try {
    const result = await client.query(userQueries.get_total_comment, [id]);
    if (result != null) {
      console.log(result.rows);
      return res
        .status(200)
        .json({ statusCode: 200, msg: "comments found", data: result.rows });
    } else
      return res
        .status(404)
        .json({ statusCode: 404, msg: "no comments found" });
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .json({ statusCode: 500, msg: "internal server error" });
  } finally {
    client.release();
  }
};
const add_comment = async (req: Request, res: Response) => {
  const { post_id, user_id, content, parent_id  , user_email} = req.body;
  const client = await pool.connect();
  try {
    const isPg   = await axios.post(flask_toxicity_url , {text : content , mail_address : user_email});
    console.log(isPg);
    if(!isPg.data.toxic) {
    const result = await client.query(userQueries.add_comment, [ post_id, user_id, content, parent_id ]);
    if (result !== null) { return res.status(201).json({ statusCode: 201, msg: "comment added succcessfully" }); }
    }
    else { return res.status(403).json({ statusCode: 403, msg: "inappropiate comment" }); }
  } 
  catch (err) {
    console.error(err);
    return res.status(500).json({ statusCode: 500, msg: "internal server error" });
  } 
  finally {
    client.release();
  }
};

const interact_post = async (req: Request, res: Response) => {
  const client = await pool.connect();
  try {
    const { isL, post_id } = req.body;
    let query;
    if (isL) query = userQueries.like_post;
    else query = userQueries.dislike_post;

    const result = await client.query(query, [post_id]);
    if (result != null)
      return res.status(201).json({ statusCode: 201, msg: "post liked" });
    else
      return res.status(404).json({ statusCode: 404, msg: "some error pls" });
  } 
  catch (err) {
    console.error(err);
    return res.status(500).json({ statusCode: 500, msg: "internal server error" });
  } 
  finally {
    client.release();
  }
};

const total_vote = async (req: Request, res: Response) => {
  const { id } = req.params;
  console.log(id);
  const client = await pool.connect();

  try {
    const result = await client.query(userQueries.get_count_vote_post, [id]);

    if (result && result.rows.length > 0) {
      const totalLikes = result.rows[0].total_likes;
      return res.status(200).json({ statusCode: 200, totalLikes, msg: "Total likes fetched successfully"});
    } 
    else {
      return res.status(404).json({ statusCode: 404, msg: "Post not found" });
    }
  } 
  catch (err) {
    console.error(err);
    return res.status(500).json({ statusCode: 500, msg: "Internal server error" });
  } 
  finally {
    client.release();
  }
};

const interact_comment = async (req: Request, res: Response) => {
  const client = await pool.connect();
  try {
    const { isL, post_id, comment_id } = req.body;
    let query;
    if (isL) query = userQueries.like_comment;
    else query = userQueries.dislike_comment;

    const result = await client.query(query, [post_id, comment_id]);
    if (result != null)
      return res.status(201).json({ statusCode: 201, msg: "comment liked" });
    else
      return res.status(404).json({ statusCode: 404, msg: "some error pls" });
  } 
  catch (err) {
    console.error(err);
    return res.status(500).json({ statusCode: 500, msg: "internal server error" });
  } 
  finally {
    client.release();
  }
};
const MODULE = {
  create_post,get_my_posts,add_comment,get_comment, get_count_comment,get_post_id,  get_all_posts,total_vote,add_user,interact_post,interact_comment
};
export default MODULE;
