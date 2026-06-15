import { useEffect, useState } from "react";
import "./App.css";
import Login from "./pages/Login";
import Register from "./pages/Register";

const API = "http://localhost:8000";

function App() {
  const [user, setUser] = useState(null);
  const [authPage, setAuthPage] = useState("login");
  const [page, setPage] = useState("posts");

  const [posts, setPosts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [likes, setLikes] = useState({});
  const [comments, setComments] = useState({});

  const [search, setSearch] = useState("");
  const [searchResults, setSearchResults] = useState([]);

  const [post, setPost] = useState({
    title: "",
    content: "",
    userId: 1,
    categoryId: "",
    visibility: "PUBLIC",
  });

  const [category, setCategory] = useState({
    name: "",
    slug: "",
    description: "",
  });

  useEffect(() => {
    const savedUser = localStorage.getItem("user");

    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const fetchPosts = async () => {
    try {
      const response = await fetch(`${API}/posts`);
      const data = await response.json();
      setPosts(data);
    } catch {
      setPosts([]);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch(`${API}/categories`);
      const data = await response.json();
      setCategories(data);
    } catch {
      setCategories([]);
    }
  };

  useEffect(() => {
    fetchPosts();
    fetchCategories();
  }, []);

  const createPost = async (e) => {
    e.preventDefault();

    await fetch(`${API}/posts`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify({
        ...post,
        userId: user.id,
        status: user.role === "ADMIN" ? "APPROVED" : "PENDING",
      }),
    });

    alert(
      user.role === "ADMIN"
        ? "Post created successfully"
        : "Post sent to admin for approval"
    );

    setPost({
      title: "",
      content: "",
      userId: user.id,
      categoryId: "",
      visibility: "PUBLIC",
    });

    fetchPosts();
    setPage("posts");
  };

  const createCategory = async (e) => {
    e.preventDefault();

    await fetch(`${API}/categories`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify(category),
    });

    setCategory({
      name: "",
      slug: "",
      description: "",
    });

    fetchCategories();
    setPage("posts");
  };

  const deletePost = async (id) => {
    await fetch(`${API}/posts/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });

    fetchPosts();
  };

  const approvePost = async (id) => {
    await fetch(`${API}/posts/${id}/approve`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });

    alert("Post approved successfully");
    fetchPosts();
  };

  const likePost = (postId) => {
    setLikes({
      ...likes,
      [postId]: (likes[postId] || 0) + 1,
    });
  };

  const addComment = (postId) => {
    const text = comments[postId]?.input || "";

    if (!text.trim()) {
      alert("Please write a comment");
      return;
    }

    const oldComments = comments[postId]?.list || [];

    setComments({
      ...comments,
      [postId]: {
        input: "",
        list: [...oldComments, text],
      },
    });
  };

  const searchPosts = async () => {
    const response = await fetch(`${API}/search?q=${search}`);
    const data = await response.json();
    setSearchResults(data);
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    setAuthPage("login");
  };

  if (!user && authPage === "login") {
    return <Login setIsLoggedIn={setUser} setPage={setAuthPage} />;
  }

  if (!user && authPage === "register") {
    return <Register setPage={setAuthPage} />;
  }

  const visiblePosts =
    user.role === "ADMIN"
      ? posts
      : posts.filter(
          (p) =>
            p.status === "APPROVED" &&
            (p.visibility === "PUBLIC" || p.userId === user.id)
        );

  return (
    <div className="dashboard">
      <div className="sidebar">
        <h2>Forum</h2>

        <button onClick={() => setPage("posts")}>Post Feed</button>
        <button onClick={() => setPage("createPost")}>Create Post</button>

        {user.role === "ADMIN" && (
          <button onClick={() => setPage("createCategory")}>
            Create Category
          </button>
        )}

        <button onClick={() => setPage("search")}>Search</button>
        <button onClick={logout}>Logout</button>
      </div>

      <div className="main-content">
        <div className="container">
          <h1>Discussion Forum</h1>

          {page === "createPost" && (
            <form className="create-post" onSubmit={createPost}>
              <h2>Create Post</h2>

              <input
                type="text"
                placeholder="Enter title"
                value={post.title}
                onChange={(e) =>
                  setPost({
                    ...post,
                    title: e.target.value,
                  })
                }
                required
              />

              <textarea
                placeholder="Enter content"
                value={post.content}
                onChange={(e) =>
                  setPost({
                    ...post,
                    content: e.target.value,
                  })
                }
                required
              />

              <select
                value={post.categoryId}
                onChange={(e) =>
                  setPost({
                    ...post,
                    categoryId: e.target.value,
                  })
                }
                required
              >
                <option value="">Select Category</option>

                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>

              <select
                value={post.visibility}
                onChange={(e) =>
                  setPost({
                    ...post,
                    visibility: e.target.value,
                  })
                }
                required
              >
                <option value="PUBLIC">Public</option>
                <option value="PRIVATE">Private</option>
              </select>

              <button className="create-btn" type="submit">
                Create Post
              </button>
            </form>
          )}

          {page === "createCategory" && user.role === "ADMIN" && (
            <form className="create-post" onSubmit={createCategory}>
              <h2>Create Category</h2>

              <input
                type="text"
                placeholder="Category name"
                value={category.name}
                onChange={(e) =>
                  setCategory({
                    ...category,
                    name: e.target.value,
                  })
                }
                required
              />

              <input
                type="text"
                placeholder="Category slug"
                value={category.slug}
                onChange={(e) =>
                  setCategory({
                    ...category,
                    slug: e.target.value,
                  })
                }
                required
              />

              <textarea
                placeholder="Category description"
                value={category.description}
                onChange={(e) =>
                  setCategory({
                    ...category,
                    description: e.target.value,
                  })
                }
                required
              />

              <button className="create-btn" type="submit">
                Create Category
              </button>
            </form>
          )}

          {page === "search" && (
            <div className="create-post">
              <h2>Search Discussions</h2>

              <input
                type="text"
                placeholder="Search..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />

              <button className="create-btn" onClick={searchPosts}>
                Search
              </button>

              {searchResults.map((post) => (
                <div className="post-card" key={post.id}>
                  <h3>{post.title}</h3>
                  <p>{post.content}</p>
                </div>
              ))}
            </div>
          )}

          {page === "posts" && (
            <div className="posts-section">
              <h2>Post Feed</h2>

              {visiblePosts.map((post) => (
                <div className="post-card" key={post.id}>
                  <h3>{post.title}</h3>
                  <p>{post.content}</p>

                  <span className="category">
                    Category ID: {post.categoryId}
                  </span>

                  <p>
                    <b>Status:</b> {post.status || "PENDING"}
                  </p>

                  <p>
                    <b>Visibility:</b> {post.visibility || "PUBLIC"}
                  </p>

                  <br />

                  {user.role === "ADMIN" && post.status === "PENDING" && (
                    <button
                      className="approve-btn"
                      onClick={() => approvePost(post.id)}
                    >
                      Approve Post
                    </button>
                  )}

                  {user.role === "ADMIN" && (
                    <button
                      className="delete-btn"
                      onClick={() => deletePost(post.id)}
                    >
                      Delete Post
                    </button>
                  )}

                  {user.role === "USER" && (
                    <button
                      className="like-btn"
                      onClick={() => likePost(post.id)}
                    >
                      Like 👍 {likes[post.id] || 0}
                    </button>
                  )}

                  <div className="comment-section">
                    <textarea
                      className="comment-box"
                      placeholder="Write a comment..."
                      value={comments[post.id]?.input || ""}
                      onChange={(e) =>
                        setComments({
                          ...comments,
                          [post.id]: {
                            input: e.target.value,
                            list: comments[post.id]?.list || [],
                          },
                        })
                      }
                    />

                    <button
                      className="comment-btn"
                      onClick={() => addComment(post.id)}
                    >
                      Add Comment
                    </button>

                    {(comments[post.id]?.list || []).map((comment, index) => (
                      <p className="comment-text" key={index}>
                        {comment}
                      </p>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;