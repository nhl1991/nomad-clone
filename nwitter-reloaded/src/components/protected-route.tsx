import { Navigate } from "react-router-dom";
import { auth } from "../firebase";

export default function ProtectedRoute({ children } : {
    children : React.ReactNode
}){

    const user = auth.currentUser;
    if(!user){
        //send user back to login page when user is not logged in.
        return <Navigate to="/login" />
    }
    return children;
}