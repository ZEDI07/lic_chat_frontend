import { useContext , useState, useEffect } from "react";
import ChatMain from "../components/chat";
import PasswordConfirmation from "../components/group/password";
import { AppContext } from "../context/app";
import { ChatProvider } from "../context/chat";
import { EMPLOYEE_ENGAGEMENT_URL} from "../constant";
import axios from "axios";

const Chat = ({ navigation, route }) => {
  const { appNavigation } = useContext(AppContext);
  appNavigation.current = navigation;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchFile = async () => {
      const filePath = `${EMPLOYEE_ENGAGEMENT_URL}/employee_engagement/profanity/list?restApi=Sesapi`;
      //const filePath = "/badWords.txt";
      //console.log('fileUrl .........', filePath)
      setLoading(true);
      setError("");
      try {
        const response = await axios(filePath);
        //console.log('...........................',response)
        if (!response) {
           console.log(`Error fetching file: ${response.statusText}`)
           //new Error(`Error fetching file: ${response.statusText}`);
        } else if( response.data && response?.data?.result?.length < 1) {
          console.log(`No data Found`);
          // throw new Error(`No data Found`);
        }

        const content = response?.data?.result;
        content ? localStorage.setItem("OffensiveWords", content) : localStorage.setItem("OffensiveWords", "");

      } catch (err) {
        console.error(err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchFile();
  }, []);

  return (
    <ChatProvider
      navigation={navigation}
      archivePage={route?.params?.archive || false}
      newChatPage={route?.params?.newChat || false}
    >
      <ChatMain />
      <PasswordConfirmation />
    </ChatProvider>
  );
};

export default Chat;
