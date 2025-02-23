
import { createContext, useContext, useEffect, useRef, useState } from "react";
import { Platform } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { CHAT_TYPE, SCREEN } from "../constant";
import { archiveChatCount, fetchChats } from "../services/chat";
import { activeFriends } from "../services/friend";
import { add, addUser, archiveCount, chatOption, newChatOpen } from "../store/reducer";
import { AppContext } from "./app";
export const ChatContext = createContext();

export const ChatProvider = ({ children, navigation, archivePage, newChatPage }) => {
  const dispatch = useDispatch();
  const [archive, setArchive] = useState(archivePage);
  const [newChat, setNewChat] = useState(newChatPage);
  const chats = useSelector((state) => state.chats);
  const [users, setUsers] = useState(chats.users);
  const [chatsLoading, setChatsLoading] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [openOptionId, setOpenOptionId] = useState(false);
  const [searchResult, setSearchResult] = useState({});
  const [viewMore, setViewMore] = useState("");
  const [openOption, setOpenOption] = useState(false);
  const lastMessageRef = useRef({
    archive: "",
    unarchive: ""
  });
  const archiveMore = useRef(false);

  const { setPassowordDialog, appNavigation, fetched, chatsData } = useContext(AppContext);
  const [chatlist, setChatlist] = useState(
    chatsData.filter((chat) => chat.archive == archive && (chat.lastMessage || chat.chatType == CHAT_TYPE.group))
  );

  appNavigation.current = navigation;
  // Fetching Chats for next page
  const handleScroll = () => {
    if ((archive ? archiveMore.current : chats.more) && !chatsLoading)
      getChats(true)
  };

  // Function for get chats
  const getChats = async (onScroll = false) => {
    setChatsLoading(true);
    const response = await fetchChats({
      archive,
      lastMessage: onScroll ? archive ? lastMessageRef.current.archive : lastMessageRef.current.unarchive : undefined,
    });
    if (response.success) {
      fetched.current = true;
      dispatch(
        add({
          chats: response.chats,
          more: archive ? undefined : response.more,
        })
      );
      if (response.chats.length && archive) {
        archiveMore.current = response.more
        lastMessageRef.current.archive = response.chats[response.chats.length - 1].lastMessage?._id;
      } else if (response.chats.length) {
        lastMessageRef.current.unarchive = response.chats[response.chats.length - 1].lastMessage?._id;
      }
    }
    setChatsLoading(false);
  };

  const getArchiveCount = async () => {
    const response = await archiveChatCount();
    if (response.success) dispatch(archiveCount(response.count));
  };

  const getActiveFriends = async () => {
    const response = await activeFriends();
    response.success && dispatch(addUser({ users: response.users }));
  };

  const handleBack = () =>
    Platform.OS == "web"
      ? (archive && setArchive(false)) || (newChat && setNewChat(false))
      : navigation.goBack();

  const handleChatNavigation = (data) => {
    const { item, screen } = data;
    if (item.chat.protected) {
      const savedPassword =
        Platform.OS == "web"
          ? JSON.parse(localStorage.getItem("passwords"))?.[item.chat._id]
          : item.chat?.password;
      if (savedPassword) {
        if (screen == "options") {
          setOpenOption(item);
          return;
        }
        handleNavigate(item.chat._id, screen);
      } else setPassowordDialog(data);
    } else handleNavigate(item.chat._id, screen);
  };

  const handleNavigate = (id, screen) => {
    Platform.OS !== "web"
      ? navigation.navigate(screen, { id: id })
      : dispatch(newChatOpen({ id, screen }));
  };

  const handleMessageNavigate = (chat, message) => {
    handleNavigate(chat, SCREEN.message);
    dispatch(chatOption({ chat, option: { scrollMessage: message } }));
  };

  const handlePageNav = (screen, params) => {
    if (Platform.OS == "web")
      switch (screen) {
        case SCREEN.archive:
          setArchive((prev) => !prev);
          break;
        case SCREEN.newChat:
          setNewChat((prev) => !prev);
      }
    else navigation.navigate(screen, params);
  };

  // Filtering Active users...
  const activeUsers = Object.values(users).filter((user) => user.active);

  // Handling state of chats data
  useEffect(() => {
    setChatlist(
      chatsData.filter(
        (chat) =>
          chat.archive == archive && (chat.lastMessage?._id ||
            chat.chat.chatType == CHAT_TYPE.group)
      )
    );
    // const chatsData = Object.values(chats.data)
    //   .filter((chat) => chat.archive === archive && chat.lastMessage)
    //   .sort((a, b) => {
    //     if (b.pin && a.pin) {
    //       return new Date(b.pinAt) - new Date(a.pinAt);
    //     } else if (b.pin) {
    //       return 1;
    //     } else if (a.pin) {
    //       return -1;
    //     } else {
    //       return (
    //         new Date(b.lastMessage.createdAt) -
    //         new Date(a.lastMessage.createdAt)
    //       );
    //     }
    //   });
    // setchatsData(chatsData);
    // setChatsLoading(false);
  }, [chatsData, archive]);

  useEffect(() => {
    setUsers(chats.users);
  }, [chats.users]);

  useEffect(() => {
    archive && getChats();
  }, [archive]);

  useEffect(() => {
    (!Object.keys(chats.data).length || !fetched.current) && getChats();
    if (!fetched.current) {
      getArchiveCount();
      getActiveFriends()
    }
  }, []);

  return (
    <ChatContext.Provider
      value={{
        archive,
        setArchive,
        newChat,
        setNewChat,
        users,
        setUsers,
        chatsLoading,
        setChatsLoading,
        openOptionId,
        setOpenOptionId,
        searchResult,
        setSearchResult,
        handleScroll,
        handleBack,
        handleNavigate,
        handlePageNav,
        activeUsers,
        archivedCount: chats.archive,
        searchLoading,
        setSearchLoading,
        handleMessageNavigate,
        openOption,
        setOpenOption,
        viewMore,
        setViewMore,
        chatsData: chatlist,
        handleChatNavigation
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};
