import { styled } from "styled-components"
export default function LoadingScreen() {
    const Wrapper = styled.div`
        height: 100vh;
        display: flex;
        justify-content: center;
        align-items: center;
    `;
    const Text = styled.span`
    font-size: 24px;
    `;

    return <Wrapper>
        <Text>Loading...</Text>
    </Wrapper>

}