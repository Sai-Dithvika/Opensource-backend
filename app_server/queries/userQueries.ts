export const User = {
  create_user: `insert into users (github_id , user_email , avatar_url , tags_of_interest ) values ($1 , $2 , $3 , $4);`,
  create_post: `insert into posts (user_id , title , content , tags, imageurl) values($1 , $2 , $3 , $4, $5);`,
  get_all_posts: `SELECT * FROM posts ORDER BY created_at DESC;`,
  get_post_by_id: `select * from posts where post_id = $1;`,
  get_my_posts: `select * from posts where user_id = $1;`,
  add_comment: `insert into comments (post_id , user_id , content, parent_comment ) values ($1 , $2 , $3 , $4);`,
  get_comment_id: `select * from comments where post_id = $1;`,
  get_total_comment: `select count(*) from comments where post_id = $1;`,
  like_post: `update posts set total_likes = total_likes + 1 where post_id = $1`,
  get_count_vote_post: `select total_likes from posts where post_id =$1;`,
  dislike_post: `update posts set total_dislikes = total_dislikes + 1 where post_id = $1`,
  like_comment: `update comments set likes = likes + 1 where post_id = $1 and comment_id = $2`,
  dislike_comment: `update comments set dislikes = dislikes + 1 where post_id = $1 and comment_id = $2`,
  get_latest_post:`select post_id  from posts where user_id = $1 order by created_at desc limit 1;` , 
  get_top_posts : `select * from posts p order by(p.total_likes - p.total_dislikes) desc , p.total_comments desc limit 10;` ,
  get_explore : ``

};
