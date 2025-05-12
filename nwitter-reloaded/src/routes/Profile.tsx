import { styled } from "styled-components";
import { auth, db, storage } from "../firebase"
import { useEffect, useState, type ChangeEvent } from "react";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { updateProfile } from "firebase/auth";
import { collection, getDocs, limit, orderBy, query, where } from "firebase/firestore";
import Tweet from "../components/tweet";
import type { iTweet } from "../components/timeline";

const Wrapper = styled.div`
    display: flex;
    gap: 20px;
    flex-direction: column;
    align-items: center;
`;
const AvatarUpload = styled.label`
    width: 80px;
    overflow: hidden;
    height: 80px;
    border-radius: 50%;
    background-color: #1d9bf0;
    cursor: pointer;
    display: flex;
    justify-content: center;
    align-items: center;
    svg {
        width: 50px;

    }
`;
const AvatarImage = styled.img`
    width: 100%;
    object-fit: cover;
`;
const AvatarInput = styled.input`
    display: none;
`;

const Name = styled.span`
    font-size: 22px;
`;

const Tweets = styled.div`
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: 10px;
`;
const EditUserNameButton = styled.button`
    background-color: transparent;
    border: 0;
    svg {
        width: 20px;
        fill: white;
    }
    `;

const EditUserNameInput = styled.input`
    padding: 2px 10px;
    font-size: 22px;
    border-radius: 50px;
    width: min-content;
    border: none;
    text-align: center;
    background-color: black;
    color: white;

    &[type="submit"]{
        cursor: pointer;
        &:hover {
            opacity: 0.8;
        }
    }
`;
const UsernameEditWrapper = styled.span``;


export default function Profile() {

    const user = auth.currentUser;
    const [avatar] = useState(user?.photoURL);
    const [tweets, setTweets] = useState<iTweet[]>([]);
    const [isEditUsername, setIsEditUsername] = useState<boolean>(false);
    const [username, setUsername] = useState<string>("");

    const fetchTweet = async () => {
        const tweetQuery = query(
            collection(db, "tweets"),
            where("userId", "==", user?.uid),
            orderBy("createdAt", "desc"),
            limit(25)
        )

        const snapshot = await getDocs(tweetQuery);
        const tweets = snapshot.docs.map((doc) => {
            const { tweet, createdAt, userId, username, photo } = doc.data();
            return {
                tweet,
                createdAt,
                userId,
                username,
                photo,
                id: doc.id,
            };
        })
        setTweets(tweets)
    }

    useEffect(() => {
        fetchTweet();
    }, [])

    const onAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const { files } = e.target;
        if (!user) return;
        if (files && files.length === 1) {
            const file = files[0];
            const locationRef = ref(storage, `avatars/${user?.uid}`);
            const result = await uploadBytes(locationRef, file);
            const avatarUrl = await getDownloadURL(result.ref);

            await updateProfile(user, {
                photoURL: avatarUrl,
            })
        }
    }

    const onEditUserName = async () => {
        if (!user) return;

        if (isEditUsername) {
            //finish edit
            try {
                if (username != "" && user)
                    await updateProfile(user, { displayName: username })
                else
                    await updateProfile(user, { displayName: "Anonymous" })
            } catch (e) {
                console.log(e);
            } finally {
                setIsEditUsername(false);
            }

        } else {
            //start edit
            setIsEditUsername(true);

        }
    }

    const onChange = (e: ChangeEvent<HTMLInputElement>) => {
        setUsername(e.currentTarget.value)
    }

    return (
        <Wrapper>
            <AvatarUpload htmlFor="avatar">
                {Boolean(avatar) ? <AvatarImage src={avatar} /> : <svg data-slot="icon" fill="none" strokeWidth={1.5} stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
                </svg>}
            </AvatarUpload>
            <AvatarInput onChange={onAvatarChange} id="avatar" type="file" accept="image/*" />
            <UsernameEditWrapper>
                {isEditUsername ? <EditUserNameInput onChange={onChange} placeholder={user?.displayName ?? "Anonymous"}></EditUserNameInput> : <Name>
                    {user?.displayName ?? "Anonymous"}

                </Name>}
                <EditUserNameButton onClick={onEditUserName}>
                    <svg data-slot="icon" fill="none" strokeWidth={1.5} stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
                    </svg>
                </EditUserNameButton>
            </UsernameEditWrapper>
            <Tweets>
                {
                    tweets.map((tweet) => {
                        return <Tweet key={tweet.id} {...tweet}></Tweet>
                    })
                }
            </Tweets>
        </Wrapper>
    )
}