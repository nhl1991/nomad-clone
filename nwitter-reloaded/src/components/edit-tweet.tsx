import { useState, type Dispatch, type SetStateAction } from "react";
import { styled } from "styled-components";
import { auth, db, storage } from "../firebase";
import { doc, updateDoc } from "firebase/firestore";
import { deleteObject, getDownloadURL, ref, uploadBytes } from "firebase/storage";

const Wrapper = styled.div`
    width: 100vw;
    height: 100vh;
    position: absolute;
    top: 0%;
    left: 0%;
    background-color: rgba(0, 0, 0, 0.7);
    display: flex;
    align-items: center;
    justify-content: center;

`;


const Tweet = styled.div`
    width: 50%;
    height: 30%;
    border-radius:  15px;
    padding: 10px 40px;
    height: 300px;
    background-color: rgba(0, 0, 0, 0.7);
    display: flex;
    flex-direction: column;
    align-items: end;
`;


const CloseButton = styled.button`
    background-color: transparent;
    border: 0;
svg {
        width: 30px;
        fill: white;
    }
`


const Form = styled.form`
    display: flex;
    width: 100%;
    flex-direction: column;
    gap: 10px;
`;

const TextArea = styled.textarea`
width: 100%;
    border: 2px solid white;
    padding: 20px;
    border-radius: 20px;
    font-size: 16px;
    color: white;
    background-color: black;
    width: 100%;
    resize: none;
    &::placeholder {
        font-size: 16px;
        font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
    }

    &:focus {
        outline: none;
        border-color: #1d9bf0;
    }
`;

const AttachFileButton = styled.label`
    padding: 10px 0px;
    color: #1d9bf0;
    text-align: center;
    border-radius: 20px;
    border: 1px solid #1d9bf0;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
`;

const AttachFileInput = styled.input`
    display: none;
`;
const DeleteFileButton = styled.button`
    padding: 10px 0px;
    background-color: #1d9bf0;
    color: white;
    text-align: center;
    border-radius: 20px;
    border: 1px solid #1d9bf0;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
`;


const SubmitButton = styled.input`
    background-color: #1d9bf0;
    color: white;
    border: none;
    padding: 10px 0px;
    border-radius: 20px;
    font-size: 16px;
    cursor: pointer;
    &:hover,
    &:active {
        opacity: 0.9;
    }
`;

export default function EditTweet({
    setIsEdit, photo, tweet, userId, id }: {
        setIsEdit: Dispatch<SetStateAction<boolean>>,
        username: string, //doc identifier
        photo: boolean,
        tweet: string,
        userId: string,
        id: string, //image folder identifier
    }) {

    const user = auth.currentUser;

    const [isLoading, setIsLoading] = useState(false);
    const [editTweet, setEditTweet] = useState(tweet);
    const [isFileExist, setIsFileExist] = useState(photo);
    const [file, setFile] = useState<File | null>(null);

    const onClose = () => {
        setIsEdit(false);
    }

    const onRemoveImage = async (e: React.MouseEvent<HTMLButtonElement>) => {
        //1. if image is exist?
        //2. then, will you remove it? => don't remove before edit is completed.
        e.preventDefault();
        if (isFileExist) {
            const ok = confirm("Are you sure you want to remove the image?");
            if (!ok) return;

            setIsFileExist(false);
        }
    }

    

    const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { files } = e.target;
        if (files && files[0].size > 1024 * 1024) {
            alert("You can upload less than 1MB.")
            return;
        }
        console.log(files?.length)

        if (files && files.length === 1) {
            setFile(files[0])
            
            alert("File Upload.")

        }
    }
    const onUpdateTweet = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        // save the textarea to textarea useState. 
        // final update logic will be on submit function.
        setEditTweet(e.target.value);

    }

    const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        const locationRef = ref(
            storage,
            `tweets/${user?.uid}/${id}`
        );
        console.log(locationRef);

        const target = doc(db, `/tweets/${id}`)
        //Delete image when user click delete;
        if (!isFileExist && photo) {
            if (locationRef) {
                await deleteObject(locationRef);
                await updateDoc(target, {
                    photo: null,

                });
            }
        }
        //
        console.log(user?.uid === userId);
        if (user?.uid !== userId) return;

        if (file === null) {
            console.log(target);
            try {
                setIsLoading(true);
                await updateDoc(target, {
                    tweet: editTweet,

                });

                setEditTweet("");
                setFile(null);
            } catch (e) {
                console.log(e);
            }
        } else if (file) {
            try {
                setIsLoading(true);
                const result = await uploadBytes(locationRef, file);
                const url = await getDownloadURL(result.ref);
                await updateDoc(target, {
                    tweet: editTweet,
                    photo: url
                });

                setEditTweet("");
                setFile(null);
            } catch (e) {
                console.log(e);
            } finally {
                setIsLoading(false)
            }
        }
        setIsEdit(false);
    }


    return <Wrapper>
        <Tweet>
            <CloseButton onClick={onClose} >
                {/** dataSlote => data-slot in React Component
                 * https://github.com/react-icons/react-icons/issues/931#issuecomment-2069619296
                 */}
                <svg data-slot="icon" fill="none" strokeWidth={1.5} stroke="white" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                </svg>
            </CloseButton>
            <Form onSubmit={onSubmit}>
                <TextArea
                    onChange={onUpdateTweet}
                    rows={5}
                    maxLength={180}
                    value={editTweet} />
                {isFileExist ?
                    <>
                        <DeleteFileButton onClick={onRemoveImage}>Remove Image</DeleteFileButton>
                    </> : <>
                        <AttachFileButton
                            htmlFor="editFile">{file ? "Image Added" : "Add Image"}</AttachFileButton>
                        <AttachFileInput onChange={onFileChange} type="file" id="editFile" accept="image/*" />
                    </>}
                <SubmitButton type="submit" value={isLoading ? "Posting" : "Edit Tweet"} />

            </Form>
        </Tweet>
    </Wrapper>
}