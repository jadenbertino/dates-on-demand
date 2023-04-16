import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { Link } from "react-router-dom";

// auth
import { useAuthContext } from "../../hooks/useAuthContext";
import { useSignOut } from "../../hooks/useSignOut";

// firestore
import { useSubcollection } from "../../hooks/useSubcollection";
import { doc } from "firebase/firestore";
import { db } from "../../firebase/init";

// styles
import "./Home.css";
import avatar from "./avatar.jpg";

export default function Home() {
  const { user } = useAuthContext();
  const nav = useNavigate();
  const { signout } = useSignOut();
  const [userDocRef, setUserDocRef] = useState(null)
  const { docs: conversations } = useSubcollection(userDocRef, 'conversations')
  
  useEffect(() => {
    // redirect user to sign in page if not signed in
    if (!user) {
      nav("/signin")
      return
    }

    const userDocRef = doc(db, 'users', user.uid)
    setUserDocRef(userDocRef)
  }, [user, nav]);

  return (
    <section className="home">
      <div className="container">
        <nav>
          <button className="btn signout" onClick={signout}>
            sign out
          </button>
        </nav>
        <main>
          <h1>Select A Conversation:</h1>
          <div className="conversations">
            {conversations
              ? conversations.map(({ id, name, profilePhoto }) => (
                  <Link
                    className="conversation"
                    key={id}
                    to={`/conversations/${id}`}
                  >
                    <img src={profilePhoto || avatar} alt="" />
                    <p className="name">{name}</p>
                  </Link>
                ))
              : null}
            <Link className="conversation" to="/create">
              <i className="fa-solid fa-plus"></i>
              <p>New Conversation</p>
            </Link>
          </div>
        </main>
      </div>
    </section>
  );
}
