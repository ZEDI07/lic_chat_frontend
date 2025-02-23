import { createContext, useContext, useEffect, useRef, useState } from "react";
import { CALL, CALL_MODE, CALL_STATUS, CHAT_TYPE, SOCKET_EVENTS } from "../constant";
import { useDispatch, useSelector } from "react-redux";
import { AppContext } from "./app";
import { useSocket } from "./socket";
import { ActivityIndicator, Platform, View } from "react-native";
import { groupMembers } from "../services/group";
import { callDetails } from "../services/call";
import { actions } from "../store/reducer/call";
import { Audio } from "expo-av"

export const CallContext = createContext();

export default CallProvider = ({ children, chat, callType, channel, callMode }) => {
  const calling = useRef(callMode == CALL_MODE.outgoing).current;
  const dispatch = useDispatch()
  const socket = useSocket();
  const { generalSettings, Styles, fetchChatDetails, setConfimationDialog } = useContext(AppContext);
  const chatData = useSelector(state => state.chats.data?.[chat]);
  const callData = useSelector(state => state.calls.data?.[channel]);
  const members = useRef({}).current;
  const [connected, setConnected] = useState(false);
  const [requestSwitch, setRequestSwitch] = useState(false)



  const handleCallAccept = async () => {
    socket.emit(SOCKET_EVENTS.call, { type: CALL.accept, chat, channel, callType: callType, receiverType: chatData.chat.chatType });
    // setConnected(true);
  };

  const handleCallReject = () => {
    socket.emit(SOCKET_EVENTS.call, { type: CALL.rejected, chat, channel, receiverType: chatData.chat.chatType });
  }

  const handleCallDisconnect = async () => {
    socket.emit(SOCKET_EVENTS.call, { type: CALL.ended, chat, channel, receiverType: chatData.chat.chatType });
  }


  const fetchCallDetails = async () => {
    const response = await callDetails(channel);
    if (response.success)
      dispatch(actions.addCall(response.data))
  }

  useEffect(() => {
    if (!connected && !calling && Platform.OS == "web") {
      console.log("inside ringing condtion")
      const sound = new Audio.Sound();
      sound.loadAsync(require("../../assets/tone/soft_romantic.mp3"), { shouldPlay: true, isLooping: true });
      return () => sound.unloadAsync();
    }
  }, [connected])


  useEffect(() => {
    if (!calling) {
      socket.emit(SOCKET_EVENTS.call, { type: CALL.received, chat, channel })
    } else {
      setConnected(true)
    };
  }, []);

  useEffect(() => {
    if (callData && callData.joined) {
      setConnected(true)
    } else if (callData && callData.status == CALL_STATUS.ended)
      setConnected(false)
    if (callData?.switch) {
      setConfimationDialog({
        heading: "Request Video Call",
        callback: () => {
          socket.emit(SOCKET_EVENTS.call, { type: CALL.approved, chat, channel, receiverType: chatData.chat.chatType });
          dispatch(actions.updateCall({ channel: channel, switch: false }))
        },
      })
    }
  }, [callData])

  useEffect(() => {
    if (!chatData) {
      fetchChatDetails(chat)
    } else if (chatData) {
      if (chatData.chat.chatType == CHAT_TYPE.group && !Object.keys(members).length) {
        groupMembers({ id: chatData.chat._id }).then((response) => {
          if (response.success) {
            response.data.users.forEach(member => {
              members[member.user.uid] = member.user;
            })
          }
        })
      }
      fetchCallDetails();
    }
  }, [chatData]);

  if (generalSettings.agora && chatData && callData)
    return <CallContext.Provider value={{ calling, handleCallAccept, handleCallReject, handleCallDisconnect, chatData, callData, members, connected, setConnected, channel, requestSwitch }}>{children}</CallContext.Provider>
  return <View style={{ ...Styles.callContainer }}>
    <View style={{ ...Styles.callitemcenter, height: "100vh" }}>
      <ActivityIndicator />
    </View>
  </View>
}