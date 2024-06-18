import { useActiveAddress, useConnection } from "@arweave-wallet-kit/react";
import Header from "../components/Header";
import {
    createDataItemSigner,
    dryrun,
    message,
    result,
} from "@permaweb/aoconnect";
import { useEffect, useState } from "react";
import Editor from "../components/Editor";

const Create = () => {
    const { connected } = useConnection();
    const processId = "3mHxrn7Pm45J1D_9EFV_RorOz9kgOLFMTpZQW3ar1S0";
    const [isFetching, setIsFetching] = useState(false);
    const [authorList, setAuthorList] = useState([]);
    const [isRegistered, setIsRegistered] = useState(false);

    const activeAddress = useActiveAddress();

    const syncAllAuthors = async () => {
        if (!connected) {
            return;
        }

        try {
            const res = await dryrun({
                process: processId,
                data: "",
                tags: [{ name: "Action", value: "AuthorList" }],
                anchor: "1234",
            });
            console.log("Dry run Author result", res);
            const filteredResult = res.Messages.map((message) => {
                const parsedData = JSON.parse(message.Data);
                return parsedData;
            });
            console.log("Filtered Author result", filteredResult);
            setAuthorList(filteredResult[0]);
            setIsRegistered(filteredResult[0].some((author) => author.PID === activeAddress));
        } catch (error) {
            console.log(error);
        }
    };

    const registerAuthor = async () => {
        const res = await message({
            process: processId,
            tags: [{ name: "Action", value: "Register" }],
            data: "",
            signer: createDataItemSigner(window.arweaveWallet),
        });

        console.log("Register Author result", res);

        const registerResult = await result({
            process: processId,
            message: res,
        });

        console.log("Registered successfully", registerResult);

        if (registerResult.Messages[0].Data === "Successfully Registered." || registerResult.Messages[0].Data === "Already Registered") {
            setIsRegistered(true);
            syncAllAuthors();
        }
    };

    useEffect(() => {
        setIsFetching(true);
        syncAllAuthors();
        console.log("This is active address", activeAddress);
        console.log(
            "Includes author",
            authorList.some((author) => author.PID == activeAddress)
        );

        setIsFetching(false);
    }, [connected]);

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 pt-16">
            <Header />
            <main className="flex flex-col items-center justify-center w-full max-w-2xl p-4">
                <h2 className="text-4xl font-bold mb-8 text-black">Welcome to Creator</h2>
                {isFetching && <div className="text-black">Fetching posts...</div>}
                <hr className="border-t w-full my-4" />
                {!isRegistered && (
                    <button className="px-6 py-3 bg-black text-white rounded-full text-lg mb-4" onClick={registerAuthor}>Register</button>
                )}
                {isRegistered && <Editor />}
            </main>
        </div>
    );
};

export default Create;
