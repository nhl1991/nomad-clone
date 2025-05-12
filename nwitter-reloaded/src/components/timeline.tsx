import { collection, limit, onSnapshot, orderBy, query } from "firebase/firestore";
import { useEffect, useState } from "react";
import { styled } from "styled-components";
import { db } from "../firebase";
import Tweet from "./tweet";
import type { Unsubscribe } from "firebase/auth";

export interface iTweet {
    id: string,
    photo?: string;
    tweet: string;
    userId: string,
    username: string,
    createdAt: number,
}

const Wrapper = styled.div`
    display: flex;
    gap: 10px;
    flex-direction: column;
`;

export default function Timeline() {

    const [tweets, setTweets] = useState<iTweet[]>([]);
    

        // const snapshot = await getDocs(tweetsQuery);
        // const tweets = snapshot.docs.map((doc) => {
        //     const { tweet, createdAt, userId, username, photo } = doc.data()

        //     return{
        //         tweet,
        //         createdAt,
        //         userId,
        //         username,
        //         photo,
        //         id: doc.id,
        //     };
        // });
    
    useEffect(() => {
        let unsubscribe : Unsubscribe | null = null;
        const fetchTweets = async () => {
            const tweetsQuery = query(
                collection(db, "tweets"),
                orderBy("createdAt", "desc"),
                limit(25)
            );

            unsubscribe = await onSnapshot(tweetsQuery, (snapshot) => {
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
                setTweets(tweets);
            })
        }

        fetchTweets();

        return () => {
            unsubscribe && unsubscribe();
        }
    }, [])

    return <Wrapper>
        {
            tweets.map((tweet) => {
                return <Tweet key={tweet.id} {...tweet} />
            })
        }
    </Wrapper>
}