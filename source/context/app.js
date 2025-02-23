
import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants from "expo-constants";
import * as Contacts from "expo-contacts";
import { createContext, useEffect, useRef, useState } from "react";
import { Alert, Dimensions, NativeModules, Platform } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { CALL, CHAT_TYPE, GENERAL_SETTING_KEY, MODE, NAV_TABS, RUN_MODE, RUN_MODES, SCREEN, SOCKET_EVENTS, TOAST_TYPE } from "../constant";
import { initiateCall } from "../services/call";
import { chatPin, fetchChat, newChats, reaction, unreadChats } from "../services/chat";
import { getGroupInfo } from "../services/group";
import { getNotificationSetting } from "../services/setting";
import { getGeneralSetting, getPermission, getTranslations } from "../services/user";
import { add, chatClose, chatNavigation, chatUnread, newChatOpen } from "../store/reducer";
import { actions } from "../store/reducer/group";
import StyleSheet from "../styles";
import CallStyleSheet from "../styles/call";
import { useSocket } from "./socket";

export const AppContext = createContext();

export const AppProvider = ({ children, mobileView }) => {
  const dispatch = useDispatch();
  const socket = useSocket()
  const StoreChat = useSelector((state) => state.chats.data);
  const unreadCount = useSelector((state) => state.chats.unread);
  const openMessages = useSelector((state) => state.chats.opens);
  const groups = useSelector((state) => state.groups)

  const [reactions, setReaction] = useState({}); // all the reaction are fetched and stored.
  const [chats, setChats] = useState([]);  // user friends stores in this state.
  const [chatsData, setchatsData] = useState([]); // sorted users chats are stored in this state.
  const [generalSettings, setGeneralSettings] = useState({});  // all general setting by admin.
  const [styles, setStyles] = useState({}); // all styles;
  const dimensions = Dimensions.get("window")
  const [height, setHeight] = useState(dimensions.height)
  const [width, setWidth] = useState(dimensions.width);

  const navigation = useRef();
  const fetched = useRef(false); // if chats fetched first then its mark true.
  const [mode, setMode] = useState();  // store user default mode  light or dark.

  const [muteOpen, setMuteOpen] = useState(null);
  const [forwardOpen, setForwardOpen] = useState(null);
  const [focusedChat, setFocusChat] = useState(null);
  const [tabNav, setTabNav] = useState(NAV_TABS.chat);
  const [confirmationDialog, setConfimationDialog] = useState(null);
  const [showImage, setShowImage] = useState(null);
  const [openMenuOption, setOpenMenuOption] = useState(false);
  const [openReactionOption, setOpenReactionOption] = useState(null);
  const [openReaction, setOpenReaction] = useState(null);
  const [deleteOpen, setDeleteOpen] = useState(null);
  const [minimize, setMinimize] = useState(false);
  const [enableSearch, setEnableSearch] = useState(false);
  const [filter, setFilter] = useState("");
  const [selectFilter, setSelectFilter] = useState("");
  const [translation, setTranslation] = useState();
  const [permissions, setPermissions] = useState([]);
  const [searchText, setText] = useState("");
  const [newCreateGroup, setNewCreateOpen] = useState(false);
  const [addMemberGroup, setAddMemberGroup] = useState(null);
  const [passwordDialog, setPassowordDialog] = useState(null);
  const [toastNotification, setToastNotification] = useState(null);
  const [contacts, setContacts] = useState([]);
  const [audioFiles, setAudioFiles] = useState([]);
  const [contactView, setContactView] = useState();
  const [mapView, setMapView] = useState();
  const [enableMemberSelection, setEnableMemberSelection] = useState();
  const [fullView, setFullView] = useState(false);
  const [currentPlaying, setCurrentPlaying] = useState();
  const [notificationSettings, setNotificationSetting] = useState();


  const { CircuitChat } = NativeModules;
  useEffect(() => {
    if (Platform.OS !== "web") {
      const windowDimension = Dimensions.get("window");
      const screenDimension = Dimensions.get("screen");
      if (windowDimension.height == screenDimension.height) {
        const viewHeight = windowDimension.height - Constants.statusBarHeight;
        setHeight(viewHeight)
      }
    }
    Dimensions.addEventListener("change", (dimension) => {
      setHeight(dimension.window.height)
      setWidth(dimension.window.width)
    })
  }, []);

  useEffect(() => {
    if (!mode)
      AsyncStorage.getItem("mode").then((value) =>
        setMode(value || MODE.light)
      );
    if (mode) {
      AsyncStorage.setItem("mode", mode);
      setStyles(prev => ({ ...prev, ...StyleSheet(mode == MODE.dark ? true : false, height, width) }));
      setStyles(prev => ({ ...prev, ...CallStyleSheet(mode == MODE.dark ? true : false, height, width) }));
    }
  }, [mode, height, width]);

  const [privacy, setPrivacy] = useState({
    lastSeen: 3,
    online: 1,
    story: 1,
    profilePhoto: 3,
    about: 3,
    group: 3,
    readRecipts: true,
  });

  const fetchTranslation = async () => {
    const response = await getTranslations();
    if (response.success) setTranslation(response.data);
  };

  const fetchPermissions = async () => {
    const response = await getPermission();
    if (response.success) setPermissions(response.data);
  };

  const fetchReaction = async () => {
    const response = await reaction();
    if (response.success) {
      response.data.forEach((element) => {
        setReaction((prev) => ({ ...prev, [element._id]: element }));
      });
    }
  };

  const handleNavigate = (id, screen) => {
    Platform.OS !== "web"
      ? navigation.current.navigate(screen, { id: id })
      : dispatch(newChatOpen({ id, screen }));
  };

  const getNewChat = async () => {
    const response = await newChats();
    if (response.success) {
      setChats(
        response.chats.sort((a, b) =>
          a.name.localeCompare(b.name, "en", { sensitivity: "accent" })
        )
      );
      // setFrequuentlyContacted(response.data.frequentlyContacted)
    }
  };

  const syncContacts = async () => {
    const { status } = await Contacts.requestPermissionsAsync();
    if (status === 'granted') {
      const { data } = await Contacts.getContactsAsync({ fields: [Contacts.Fields.PhoneNumbers], sort: Contacts.SortTypes.FirstName })
      const contacts = data.filter(contact => contact?.phoneNumbers?.length).map(contact => {
        if (!contact.name)
          return { ...contact, name: contact.firstName + " " + contact.lastName }
        return contact;
      })
      // contacts.sort((a, b) => a.name?.localeCompare(b.name, "en", { sensitivity: "accent" }))
      setContacts(contacts);
    }
  }

  const handleChatPin = (id) => {
    if (Object.values(StoreChat).filter((chat) => chat.pin).length < 3)
      chatPin(id);
    else {
      Platform.OS == "web"
        ? alert("You can only pin up to 3 Chats")
        : Alert.alert("Pin Chat", "You can only pin up to 3 Chats", [
          { text: "OK" },
        ]);
    }
  };

  const fetchChatDetails = async (id) => {
    if (!id) return;
    if (!StoreChat[id]) {
      const response = await fetchChat(id);
      if (response.success) {
        dispatch(add({ chats: [response.data] }));
      } else if (!response.success) {
        dispatch(chatClose(id));
      }
      return response;
    }
  };

  const fetchUnreadCount = () => {
    unreadChats().then(
      (response) => response.unreads && dispatch(chatUnread(response.unreads))
    );
  };

  const getMaxGrid = () => {
    switch (true) {
      case width >= 1200:
        return { rows: 4, columns: 4 }
      case width >= 768:
        return { rows: 3, columns: 2 }
      default:
        return { rows: 2, columns: 2 }
    }
  }

  const handleSearchNav = () => setEnableSearch((prev) => !prev);

  const getChatId = (uid) =>
    Object.values(StoreChat).find((chat) => chat.chat.uid == uid);

  const getGroupDetails = async (id) => {
    const response = await getGroupInfo(id);
    if (response.success) {
      const membersObj = response.data.members.reduce((current, member) => {
        const prev = { ...current };
        prev[member.user._id] = member.user;
        return prev;
      }, {})
      dispatch(actions.addGroup({ ...response.data, membersObj }));
    }
  };

  const handleOpenNavigate = (id, screen) => {
    Platform.OS !== "web"
      ? navigation.current.navigate(screen, { id: id })
      : dispatch(newChatOpen({ id, screen }));
  };

  const handleMinimize = () => {
    window.top.postMessage(
      {
        type: "iframeSize",
        // count: openMessages.length + 1,
        height: !minimize ? 50 : 500,
        width: (openMessages.length + 1) * 310 + 1,
      },
      "*"
    );
    setMinimize((prev) => !prev);
  };

  const handleCallInitiate = async (data) => {
    const response = await initiateCall(data);
    if (!response.success) {
      setToastNotification({
        type: TOAST_TYPE.error,
        message: response.message,
      });
      return;
    };
  };

  const handleCall = async ({ callType, chat }) => {
    const data = { receiver: chat._id, receiverType: chat.chatType, callType: callType };
    if (chat.chatType == CHAT_TYPE.group) {
      const group = groups[chat._id];
      if (group && group.totalMembers >= 30) {
        setEnableMemberSelection(data)
        return
      }
    }
    handleCallInitiate(data)
  }

  const handleCallJoin = async (data) => {
    socket.emit(SOCKET_EVENTS.call, { type: CALL.join, ...data })
  }

  useEffect(() => {
    switch (true) {
      case Platform.OS == "web":
        switch (RUN_MODE) {
          case RUN_MODES.SCRIPT:
            window.dispatchEvent(new CustomEvent("script", { detail: { type: "unread_chat", count: unreadCount } }));
            break;
          default:
            window.top.postMessage({ type: "chatUnreads", count: unreadCount }, "*")
        }
        break;
      case Platform.OS == "native":
        CircuitChat?.callFunction({ type: "count", count: unreadCount });
        break;
    }
  }, [unreadCount]);

  useEffect(() => {
    if (Platform.OS == "web" && (openMenuOption || openReactionOption || openReaction)) {
      const click = (e) => {
        if (
          (!e.target.closest("a") ||
            !e.target.closest("a").classList.contains("message-menu-optn")) &&
          !e.target.classList.contains("message-menu-optn")
        )
          setOpenMenuOption(false);
        if (
          (!e.target.closest("a") ||
            !e.target.closest("a").classList.contains("reaction-menu-optn")) &&
          !e.target.classList.contains("reaction-menu-optn")
        )
          setOpenReactionOption(null);
        if (
          (!e.target.closest("a") ||
            !e.target.closest("a").classList.contains("reation-view")) &&
          !e.target.classList.contains("reation-view")
        )
          setOpenReaction(null);
      };
      document.body.addEventListener("click", click);
      return () => {
        document.body.removeEventListener("click", click);
      };
    }
  }, [openMenuOption, openReactionOption, openReaction]);

  useEffect(() => {
    fetchTranslation();
    fetchPermissions();
    fetchReaction();
    fetchUnreadCount();
    getGeneralSetting(GENERAL_SETTING_KEY.domain).then(
      (response) =>
        response.success &&
        setGeneralSettings((prev) => ({
          ...prev,
          domain: response.data.domain,
        }))
    );
    getGeneralSetting(GENERAL_SETTING_KEY.messaging_setting).then(
      (response) =>
        response.success &&
        setGeneralSettings((prev) => ({
          ...prev,
          messaging_setting: response.data.messaging_setting,
        }))
    );
    getGeneralSetting(GENERAL_SETTING_KEY.agora).then(
      (response) =>
        setGeneralSettings((prev) => ({
          ...prev,
          agora: response.success ? response.data.agora?.id : "",
        }))
    );
    getGeneralSetting(GENERAL_SETTING_KEY.group).then(
      (response) =>
        setGeneralSettings((prev) => ({
          ...prev,
          group: response.success ? response.data.group.enabled : false,
        }))
    )
    getNotificationSetting()
      .then((response) => {
        if (response.success)
          setNotificationSetting(response.data);
      })
      .catch((err) => console.log("error while getting notification"))

    /** .............Chat module by default Open.............. 
     * by default were >> if (value?.value) setMinimize(value.value);
     * changed to >>if (value?.value) setMinimize(!value.value);
    */
    if (Platform.OS == "web") {
     const value = JSON.parse(localStorage.getItem("minimize"));
     if (value?.value) setMinimize(!value.value);
    }
  }, []);

  useEffect(() => {
    if (Platform.OS == "web") {
      localStorage.setItem("minimize", JSON.stringify({ value: minimize }));
      if (minimize) {
        openMessages.forEach((open) => {
          const [id, screen] = open.split("_");
          if (screen !== SCREEN.message)
            dispatch(chatNavigation({ id, screen: SCREEN.message }));
        });
      }
    }
  }, [minimize]);

  useEffect(() => {
    const handleCommunication = async (event) => {
      if (event.data.type == "maximizeChat") {
        handleMinimize();
      }
      if (event.data.type == "newChat") {
        const { uid } = event.data;
        let chat = getChatId(uid);
        if (!chat) {
          const response = await fetchChatDetails(uid);
          if (response.success) chat = response.data;
          else return;
        }
        dispatch(newChatOpen({ id: chat.chat._id, screen: SCREEN.message }));
      }
    };
    if (Platform.OS == "web" && RUN_MODE == RUN_MODES.INTEGRATED) {
      window.addEventListener("message", handleCommunication);
      return () => window.removeEventListener("message", handleCommunication);
    }
  }, [minimize]);

  useEffect(() => {
    const handleChatCommuntication = async (e) => {
      switch (e.detail.type) {
        case "toggleChatWindowSize":
          setMinimize((prev) => !prev)
          break;
        case "newChat":
          const { uid } = e.detail;
          let chat = getChatId(uid);
          if (!chat) {
            const response = await fetchChatDetails(uid);
            if (response.success) chat = response.data;
            else return;
          }
          dispatch(newChatOpen({ id: chat.chat._id, screen: SCREEN.message }));
          break;
      }
    }
    if (Platform.OS == "web" && RUN_MODE == RUN_MODES.SCRIPT)
      window.addEventListener("circuit_chat", handleChatCommuntication);
    return () => window.removeEventListener("circuit_chat", handleChatCommuntication)
  }, [])

  useEffect(() => {
    const chatsData = Object.values(StoreChat)
      // .filter((chat) => chat.archive === archive && chat.lastMessage)
      .sort((a, b) => {
        if (b.pin && a.pin) {
          return new Date(b.pin) - new Date(a.pin);
        } else if (b.pin) {
          return 1;
        } else if (a.pin) {
          return -1;
        } else if (b.lastMessage?.createdAt && a.lastMessage?.createdAt) {
          return (
            new Date(b.lastMessage.createdAt) -
            new Date(a.lastMessage.createdAt)
          );
        } else if (b.lastMessage?.createdAt) {
          return 1;
        } else if (a.lastMessage?.createdAt) {
          return -1;
        } else new Date(b.chat.createdAt) - new Date(a.chat.createdAt);
      });
    setchatsData(chatsData);
  }, [StoreChat]);

  if (translation && permissions.length && generalSettings?.domain && notificationSettings)
    return (
      <AppContext.Provider
        value={{
          reactions,
          chats,
          setChats,
          getNewChat,
          handleChatPin,
          fetchChatDetails,
          muteOpen,
          setMuteOpen,
          forwardOpen,
          setForwardOpen,
          focusedChat,
          setFocusChat,
          tabNav,
          setTabNav,
          openMenuOption,
          setOpenMenuOption,
          openReactionOption,
          setOpenReactionOption,
          openReaction,
          setOpenReaction,
          confirmationDialog,
          setConfimationDialog,
          showImage,
          setShowImage,
          deleteOpen,
          setDeleteOpen,
          minimize,
          setMinimize,
          enableSearch,
          setEnableSearch,
          handleSearchNav,
          appNavigation: navigation,
          filter,
          setFilter,
          mobileView,
          selectFilter,
          setSelectFilter,
          handleNavigate,
          translation,
          permissions,
          setPermissions,
          fetched,
          searchText,
          setText,
          newCreateGroup,
          setNewCreateOpen,
          getChatId,
          getGroupDetails,
          addMemberGroup,
          setAddMemberGroup,
          handleOpenNavigate,
          handleMinimize,
          passwordDialog,
          setPassowordDialog,
          fetchUnreadCount,
          toastNotification,
          setToastNotification,
          privacy,
          setPrivacy,
          mode,
          setMode,
          Styles: styles,
          generalSettings,
          chatsData,
          handleCall,
          handleCallInitiate,
          handleCallJoin,
          contacts, setContacts,
          audioFiles, setAudioFiles,
          contactView, setContactView,
          syncContacts,
          mapView, setMapView,
          height, width,
          getMaxGrid,
          enableMemberSelection, setEnableMemberSelection,
          fullView, setFullView,
          currentPlaying, setCurrentPlaying,
          notificationSettings, setNotificationSetting
        }}
      >
        {children}
      </AppContext.Provider>
    );
  return null;
};
