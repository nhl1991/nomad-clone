import { styled } from "styled-components";
import type { iTweet } from "./timeline";
import { auth, db, storage } from "../firebase";
import { deleteDoc, doc } from "firebase/firestore";
import { deleteObject, ref } from "firebase/storage";
import { useState, type MouseEvent } from "react";
import EditTweet from "./edit-tweet";


const Wrapper = styled.div`
    display: grid;
    grid-template-columns: 3fr 1fr;
    padding: 20px;
    border: 1px solid rgba(255, 255, 255, 0.5);
    border-radius:  15px;

`;

const Column = styled.div``;

const Photo = styled.img`
    width: 100px;
    height: 100px;
    border-radius: 15px;
    &:hover {
        cursor: pointer;
    }
`;

const Username = styled.span`
font-weight: 600;
font-size:  15px;
`;
const Timestamp = styled.span`
font-weight: 600;
font-size:  12px;
padding: 10px 20px;
color: rgba(255, 255, 255, 0.5);
`;

const Payload = styled.p`
    margin: 10px 0px;
    font-size: 18px;
`;

const DeleteButton = styled.button`
    background-color: transparent;
    color: white;
    font-weight: 600;
    border: 0;
    font-size: 12px;
    margin: 15px 0px;
    padding: 5px 10px;
    text-transform: uppercase;
    border-radius: 5px;
    cursor: pointer;
`;

const EditButton = styled.button`
    background-color: transparent;
    color: white;
    font-weight: 600;
    border: 0;
    font-size: 12px;
    margin: 15px 0px;
    padding: 5px 10px;
    text-transform: uppercase;
    border-radius: 5px;
    cursor: pointer;
`;

const ButtonWrapper = styled.span`
    display: flex;
    gap: 10px;
`;

export default function Tweet({ username, photo, tweet, userId, id, createdAt }: iTweet) {
    const user = auth.currentUser;
    const [ isEdit, setIsEdit ] = useState(false);

    const onDelete = async () => {
        const ok = confirm("Are you sure you want to delete this tweet?");
        if(!ok || user?.uid !== userId) return;

        try {
            await deleteDoc(doc(db, "tweets/", id))
            if(photo){
                const photoRef = ref(storage, `tweets/${user.uid}/${id}`);
                await deleteObject(photoRef);
            }
        }catch(e){
            console.log(e)
        }finally{

        }
    }

    const onEdit = async () => {
        setIsEdit(true);
    }
    const elapsedMinutes = (createdAt:number)=>{
        const elapsed = (Date.now() - createdAt); // result is minutes
        const second = 1000;
        const minute = 1000*60;
        const hour = minute * 60;
        const day = hour * 24;
        const year = day * 365;

        if(elapsed > year){
            return `${(elapsed/year).toFixed(0)} ${(elapsed/year) < 2 ? "year" : "years"} ago`;
        }else if(elapsed > day){
            //day
            return `${(elapsed/day).toFixed(0)} ${(elapsed/day) < 2 ? "day" : "days"} ago`;
        }else if(elapsed > hour){
            //hour
            return `${(elapsed/hour).toFixed(0)} ${(elapsed/hour) < 2 ? "hour" : "hours"} ago`;
        }else if(elapsed > minute){
            return `${(elapsed/minute).toFixed(0)} ${elapsed/minute < 2 ? "minute": "minutes"} ago`;
        }else {
            return `${(elapsed/second).toFixed(0)} ${elapsed/second < 2 ? "second": "seconds"} ago`
            }
    }

    const onClick = (e:MouseEvent<HTMLImageElement>) => {
        window.open(e.currentTarget.src, "_blank", "popup");
    }

    return <Wrapper>
        {isEdit ?  <EditTweet setIsEdit={setIsEdit} id={id} userId={userId} tweet={tweet} photo={photo ? true: false} username={username} />: null}
        <Column>
            <Username>
                {username}<Timestamp>{elapsedMinutes(createdAt)}</Timestamp>
            </Username>
            <Payload>
                {tweet}
            </Payload>
            
        </Column>
        <Column>
            {photo ?
                <Photo src={photo} onClick={onClick} />
                : null}
        </Column>
        {user?.uid === userId ? <ButtonWrapper><DeleteButton onClick={onDelete}>Delete</DeleteButton>
                                    <EditButton onClick={onEdit}>Edit</EditButton></ButtonWrapper> : null }
    </Wrapper> 
}