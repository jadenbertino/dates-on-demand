import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuthContext } from "../../hooks/useAuthContext";
import { useSignUp } from '../../hooks/useSignUp'

// styles
import "./auth.css";

export default function SignIn() {
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { user } = useAuthContext();
  const nav = useNavigate();
  const { signup, error } = useSignUp()

  // redirect user to home page if signed in
  useEffect(() => {
    if (user) {
      nav("/");
    }
  }, [user, nav]);

  function handleSubmit(e) {
    e.preventDefault()
    signup(username, email, password)
  }

  return (
    <div className="container">
      <div className="row jcc aic">
        <div className="col">
          <form className="auth" onSubmit={handleSubmit}>
            <h2 className="header">claim your rizz robot 👇</h2>
            <input
              type="text"
              value={username}
              placeholder="username"
              onChange={(e) => setUsername(e.target.value)}
            />
            <input
              type="email"
              value={email}
              placeholder="email"
              onChange={(e) => setEmail(e.target.value)}
            />
            <input
              type="password"
              placeholder="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            {error && <div className='error'>{error}</div>}
            <button className="btn">sign up</button>
            <span>
              have an account already?&nbsp;
              <Link className="redirect" to="/signin">sign in here</Link>
            </span>
          </form>
        </div>
      </div>
    </div>
  );
}