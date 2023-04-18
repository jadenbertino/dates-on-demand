import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useAuthContext } from '../../hooks/useAuthContext';

// firestore
import { Timestamp, collection, doc, getDoc, setDoc } from '@firebase/firestore';
import { db } from '../../firebase/init';
import { useSubdocument } from '../../hooks/useSubdocument';

// components
import Modal from '../../components/Modal';
import RenderMessages from './RenderMessages';

// styles
import './Conversation.css';

export default function Conversation() {
  const { user } = useAuthContext();
  const nav = useNavigate();
  const { conversationID } = useParams();
  const [conversationsRef, setConversationsRef] = useState(null);
  const { document: conversationDoc } = useSubdocument(conversationsRef, conversationID);
  const [conversationContent, setConversationContent] = useState([]);
  const [conversationName, setConversationName] = useState('');
  const [profilePhotoSrc, setProfilePhotoSrc] = useState('./avatar.jpg');
  const [modalPrompt, setModalPrompt] = useState(null);
  const [newMessageText, setNewMessageText] = useState('');

  useEffect(() => {
    if (!user) {
      nav('/');
      return;
    }

    const userDocRef = doc(db, 'users', user.uid);
    const conversationsRef = collection(userDocRef, 'conversations');
    setConversationsRef(conversationsRef);
  }, [user, nav]);

  useEffect(() => {
    if (!conversationDoc) return;
    const { profilePhotoSrc, name, conversationContent } = conversationDoc;
    setProfilePhotoSrc(profilePhotoSrc);
    setConversationName(name);
    setConversationContent(conversationContent);
  }, [conversationDoc]);

  async function handleNewMessage(e) {
    e.preventDefault();
    try {
      const messageType = modalPrompt === 'Add Her Message' ? 'RECEIVED' : 'SENT';
      const message = {
        type: messageType,
        message: newMessageText,
        timestamp: Timestamp.now(),
      };

      // add message to firestore
      const conversationRef = doc(conversationsRef, conversationID);
      const conversationSnap = await getDoc(conversationRef);
      if (!conversationSnap.exists()) throw new Error('Invalid document ID');
      const { conversationContent } = conversationSnap.data();
      conversationContent.push(message);
      await setDoc(conversationRef, { conversationContent }, { merge: true });

      setNewMessageText('');
      closeModal();
    } catch (err) {
      console.log(err.message);
      closeModal();
    }
  }

  function closeModal() {
    setModalPrompt(null);
  }

  return (
    <div className='view-conversation container'>
      <nav>
        <img src={profilePhotoSrc} alt='' className='profile-photo' />
        <h2 className='name'>{conversationName}</h2>
        <Link to='/' className='house-icon-wrapper'>
          <i className='fa-solid fa-house'></i>
        </Link>
      </nav>
      <RenderMessages conversationContent={conversationContent} />
      <div className='new-message-btns'>
        <div className='btn received' onClick={() => setModalPrompt('Add Her Message')}>
          Add Her Message
        </div>
        <div className='btn sent' onClick={() => setModalPrompt('Add Your Message')}>
          Add Your Message
        </div>
      </div>
      <div className='generate-message'>{/* for later */}</div>
      {modalPrompt && (
        <Modal closeModal={closeModal}>
          <form
            onSubmit={handleNewMessage}
            className={`new-message-form ${
              modalPrompt === 'Add Her Message' ? 'received' : 'sent'
            }`}
          >
            <h2>{modalPrompt}</h2>
            <textarea
              onChange={(e) => setNewMessageText(e.target.value)}
              value={newMessageText}
              required
            />
            <div className='btns'>
              <button className='btn cancel' type='button' onClick={closeModal}>
                Cancel
              </button>
              <button className='btn submit'>Add New Message</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
