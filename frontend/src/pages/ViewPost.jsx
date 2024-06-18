import { Link, useParams } from "react-router-dom";
import Header from "../components/Header";
import { useEffect, useState } from "react";
import { useConnection } from "@arweave-wallet-kit/react";
import { dryrun } from "@permaweb/aoconnect";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.bubble.css";

const ViewPost = () => {
  const { postId } = useParams();
  const { connected } = useConnection();

  const processId = "DMqjF8F9x-XR9ePJBr429ybVOxbyPSjnI_P5yEBNCzA";
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

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 pt-16">
      <Header />
      <main className="flex flex-col items-center justify-center w-full max-w-2xl p-4">
        {postContent && (
          <div className="w-full">
            <h2 className="text-4xl font-bold mb-4 text-black">{postContent.Title}</h2>
            <p className="text-gray-700 mb-2">Author: {postContent.Author}</p>
            <p className="text-gray-700 mb-4">ID: {postContent.ID}</p>
            <Link to="/view" className="text-white no-underline">
              <button className="px-6 py-3 bg-black text-white rounded-full text-lg mb-4">Back</button>
            </Link>
            <hr className="border-t w-full my-4" />
            <ReactQuill value={postContent.Body} readOnly theme="bubble" className="w-full" />
          </div>
        )}
      </main>
    </div>
  );
};

export default ViewPost;
