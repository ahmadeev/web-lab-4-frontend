import {useAuth} from "./AuthProvider.jsx";
import {useNavigate} from "react-router-dom";
import {useEffect} from "react";

function SignInForm({ from }) {
    const { login } = useAuth();
    const navigate = useNavigate();

    return (
        <>
            <form>
                <label>
                    Введите имя пользователя или электронную почту:<br/>
                    <input className="login-input" type="text"/>
                </label><br/>
                <label>
                    Введите пароль:<br/>
                    <input className="password-input" type="password"/>
                </label><br/>
                <button onClick={() => {
                    event.preventDefault();
                    login();
                    console.log("адрес перед navigate", from)
                    navigate(from, { replace: true });
                }}>Sign In</button>
            </form>
        </>
    )
}

export default SignInForm