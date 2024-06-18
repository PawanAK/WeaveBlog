import { Link, useParams } from "react-router-dom";
import Header from "../components/Header";
import { useEffect, useState } from "react";
import { useConnection } from "@arweave-wallet-kit/react";
import { dryrun } from "@permaweb/aoconnect";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.bubble.css";
import { useActiveAddress } from "@arweave-wallet-kit/react";
import { createDataItemSigner, message, result } from "@permaweb/aoconnect";

const ViewPost = () => {
  const { postId } = useParams();
  const { connected } = useConnection();

  const processId = "GL0nRHgMslEKpnHqp1k7BbfrDbAPV5aptkD7XDZKIfU";
  const [isFetching, setIsFetching] = useState(false);
  const [postContent, setPostContent] = useState();

  const syncAllPosts = async () => {
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
      setPostContent(filteredResult[0]);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    setIsFetching(true);
    syncAllPosts();
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
  };

  const commentOnPost = async (comment) => {
    const res = await message({
      process: processId,
      tags: [{ name: "Action", value: "Comment" }, { name: "PID", value: postId }],
      data: comment,
      signer: createDataItemSigner(window.arweaveWallet),
    });
    await result({ process: processId, message: res });
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 pt-16">
      <Header />
      <main className="flex flex-col items-center justify-center w-full max-w-2xl p-4">
        {postContent && (
          <div className="w-full">
            <h2 className="text-4xl font-bold mb-4 text-black">
              {postContent.Title}
            </h2>
            <p className="text-gray-700 mb-2">Author: {postContent.Author}</p>
            <p className="text-gray-700 mb-4">ID: {postContent.ID}</p>
            <Link to="/view" className="text-white no-underline">
              <button className="px-6 py-3 bg-black text-white rounded-full text-lg mb-4">
                Back
              </button>
            </Link>
            <hr className="border-t w-full my-4" />
            <ReactQuill
              value={postContent.Body}
              readOnly
              theme="bubble"
              className="w-full"
            />
            <button className="btn btn-primary mt-4" onClick={likePost}>Like</button>
            <textarea className="textarea textarea-bordered mt-4" placeholder="Add a comment" onBlur={(e) => commentOnPost(e.target.value)}></textarea>
          </div>
        )}
      </main>
    </div>
  );
};

export default ViewPost;
