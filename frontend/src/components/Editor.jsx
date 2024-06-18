import { useConnection } from "@arweave-wallet-kit/react";
import { createDataItemSigner, message, result } from "@permaweb/aoconnect";
import { useState } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";

const Editor = () => {
  const [draftContent, setDraftContent] = useState("");
  const [title, setTitle] = useState("");
  const [isPosting, setIsPosting] = useState(false);

  const { connected } = useConnection();
  const processId = "DMqjF8F9x-XR9ePJBr429ybVOxbyPSjnI_P5yEBNCzA";

  const createPost = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!connected) {
      return;
    }

    setIsPosting(true);

    try {
      const res = await message({
        process: processId,
        tags: [
          { name: "Action", value: "Create-Post" },
          { name: "Content-Type", value: "text/html" },
          { name: "Title", value: title },
        ],
        data: draftContent,
        signer: createDataItemSigner(window.arweaveWallet),
      });

      console.log("Post result", res);

      const postResult = await result({
        process: processId,
        message: res,
      });

      console.log("Post Created successfully", postResult);

      setDraftContent("");
      setTitle("");
    } catch (error) {
      console.log(error);
    }

    setIsPosting(false);
  };

  return (
    <form className="flex flex-col items-center w-full">
      <input
        type="text"
        placeholder="Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        required
        className="mb-4 w-full border-2 border-gray-300 rounded p-2"
      />
      <ReactQuill
        theme="snow"
        value={draftContent}
        onChange={setDraftContent}
        className="w-full mb-4"
      />
      {isPosting && <div className="text-black">Posting...</div>}
      <button
        className="px-6 py-3 bg-black text-white rounded-full text-lg"
        type="submit"
        disabled={isPosting || (title === "" && draftContent === "")}
        onClick={(e) => createPost(e)}
      >
        Create Post
      </button>
    </form>
  );
};

export default Editor;
