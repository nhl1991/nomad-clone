import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { useState } from "react";
import { auth } from "../firebase";
import { Link, useNavigate } from "react-router-dom";
import { FirebaseError } from "firebase/app";
import { Error, Form, Input, Switcher, Title, Wrapper } from "./auth-components";
import GithubButton from "../components/auth-github";

export default function CreateAccount() {

    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("")

    const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const {
            target:
            { name, value } } = e;
        if (name === "name") {
            setName(value);
        } else if (name === "email") {
            setEmail(value);
        } else if (name === "password") {
            setPassword(value)
        }
    }

    const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError("");
        if (isLoading || name === "" || email === "" || password === "") return;

        try {
            setIsLoading(true);
            const credentials = await createUserWithEmailAndPassword(auth, email, password);
            console.log(credentials.user);

            await updateProfile(credentials.user, {
                displayName: name
            });
            navigate("/");
        } catch (e) {
            if (e instanceof FirebaseError)
                setError(e.message)

        }
        finally {
            setIsLoading(false);
        }

        // create an account
        // set the name of the user.
        // redirect to homepage
        console.log(name, email, password);
    }

    return (
        <Wrapper>
            <Title>Log into X</Title>
            <Form onSubmit={onSubmit}>
                <Input onChange={onChange} name="name" value={name} placeholder="Name" type="text" required /> {/* user  */}
                <Input onChange={onChange} name="email" value={email} placeholder="Email" type="email" required /> {/* email */}
                <Input onChange={onChange} name="password" value={password} placeholder="Password" type="password" required /> {/* password */}
                <Input type="submit" value={isLoading ? "Loading..." : "Create Account"} /> {/* login btn */}
            </Form>
            {error !== "" ? <Error>{error}</Error> : null}
            <Switcher>
                Already have an account? <Link to="/create-account">Log In&rarr;</Link>
            </Switcher>
            <GithubButton />
        </Wrapper>
    )
}