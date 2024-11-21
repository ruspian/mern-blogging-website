import { useParams } from "react-router-dom";

const BlogPage = () => {
  let { blog_id } = useParams();

  return (
    <div>
      <h1>Blog Page - {blog_id}</h1>
    </div>
  );
};

export default BlogPage;
