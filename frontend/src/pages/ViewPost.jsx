import { Link, useParams } from "react-router-dom";
import Header from "../components/Header";
import { useEffect, useState } from "react";
import { useConnection } from "@arweave-wallet-kit/react";
import { dryrun, message, result } from "@permaweb/aoconnect";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.bubble.css";
import { createDataItemSigner } from "@permaweb/aoconnect";
import { FaHeart } from 'react-icons/fa'; // Import heart icon

const ViewPost = () => {
  const { postId } = useParams();
  const { connected } = useConnection();
  const [isFetching, setIsFetching] = useState(false);
  const [postContent, setPostContent] = useState();
  const [comment, setComment] = useState("");

  const processId = "CB7fhKGaFWmkjj-IX7tXjfTwYaPBs0Q-SkLYtTzei9A";

  const syncPost = async () => {
    if (!connected) {
      return;
    }

    try {
      const result = await dryrun({
        process: processId,
        data: "",
        tags: [
          { name: "Action", value: "Get" },
          { name: "Post-Id", value: postId },
        ],
        anchor: "1234",
      });
      console.log("Dry run result", result);
      const filteredResult = JSON.parse(result.Messages[0].Data);
      console.log("Filtered result", filteredResult);
      setPostContent(filteredResult);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    setIsFetching(true);
    syncPost();
    setIsFetching(false);
  }, [connected]);

  const likePost = async () => {
    const res = await message({
      process: processId,
      tags: [{ name: "Action", value: "Like" }, { name: "PID", value: postId }],
      data: "",
      signer: createDataItemSigner(window.arweaveWallet),
    });
    await result({ process: processId, message: res });
    syncPost(); // Refresh post data to update likes count
  };

  const commentOnPost = async () => {
    const res = await message({
      process: processId,
      tags: [{ name: "Action", value: "Comment" }, { name: "PID", value: postId }],
      data: comment, // Ensure comment data is sent correctly
      signer: createDataItemSigner(window.arweaveWallet),
    });
    await result({ process: processId, message: res });
    setComment(""); // Clear the comment input
    syncPost(); // Refresh post data to update comments
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white pt-16">
      <Header />
      <main className="flex flex-col items-center justify-center w-full max-w-4xl p-4">
        {postContent && (
          <div className="w-full bg-gray-100 p-6 rounded-lg shadow-md">
            <h2 className="text-4xl font-bold mb-4 text-black">{postContent.Title}</h2>
            <p className="text-gray-700 mb-2">Author: {postContent.Author}</p>
            <p className="text-gray-700 mb-4">ID: {postContent.ID}</p>
            <Link to="/view" className="text-white no-underline">
              <button className="px-6 py-3 bg-blue-500 text-white rounded-full text-lg mb-4">Back</button>
            </Link>
            <hr className="border-t w-full my-4" />
            <ReactQuill value={postContent.Body} readOnly theme="bubble" className="w-full mb-4" style={{ minHeight: '300px' }} />
            <button className="flex items-center btn btn-primary mt-4 bg-blue-500 text-white rounded-full px-6 py-3" onClick={likePost}>
              <FaHeart className="mr-2" /> {postContent.Likes}
            </button>
            <textarea
              className="textarea textarea-bordered mt-4 w-full border-2 border-gray-300 rounded p-2"
              placeholder="Add a comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            ></textarea>
            <button className="btn btn-primary mt-2 bg-blue-500 text-white rounded-full px-6 py-3" onClick={commentOnPost}>Comment</button>
            <div className="mt-4">
              <h3 className="text-2xl font-bold mb-2">Comments</h3>
              {postContent.Comments && postContent.Comments.map((comment, index) => (
                <div key={index} className="border-b border-gray-300 py-2">
                  <p className="text-gray-700"><strong>{comment.Author}:</strong> {comment.Comment}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default ViewPost;
