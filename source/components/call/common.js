import { useContext } from "react";
import { Platform, Pressable, View } from "react-native";
import { CALL, CALL_TYPE, CHAT_TYPE, SOCKET_EVENTS, TOAST_TYPE } from "../../constant";
import { callAudioIcon, callAudioMuteIcon, callEndIcon, callVideoIcon, callVideoMuteIcon, speakeroffIcon, speakeronIcon } from "../../constant/icons";
import { AppContext } from "../../context/app";
import { CallContext } from "../../context/call";
import { useSocket } from "../../context/socket";

export const Controller = ({ cameraOn, micOn, setCamera, setMic, speakerEnabled, setSpeakerEnabled }) => {
  const { setToastNotification } = useContext(AppContext)
  const { handleCallDisconnect, chatData, callData } = useContext(CallContext);
  const socket = useSocket();
  const { Styles } = useContext(AppContext);

  const handleCallSwitch = () => {
    setToastNotification({
      type: TOAST_TYPE.success,
      message: "Requested Video Call",
    });
    socket.emit(SOCKET_EVENTS.call, { type: CALL.switch, chat: chatData.chat._id, channel: callData.channel, receiverType: chatData.chat.chatType });
  }

  return <View style={{ ...Styles.callContainerBottomBar }}>
    <View style={{ ...Styles.callContainerBottomBarInner }}>
      {Platform.OS !== "web" ? <View style={{ ...Styles.callContainerBottomBarItem }}>
        <Pressable onPress={setSpeakerEnabled} style={{ ...Styles.callContainerBottomBarItemBtn, ...Styles.callitemcenter, ...Styles.callBtnSecondary }}>
          <View style={Styles.callIcon24}>
            {speakerEnabled ? speakeronIcon(Styles.callIconwhite) : speakeroffIcon(Styles.callIconwhite)}
          </View>
        </Pressable>
      </View> : null}
      {callData.callType == CALL_TYPE.video || chatData.chat.chatType == CHAT_TYPE.user ? <View style={{ ...Styles.callContainerBottomBarItem }}>
        <Pressable onPress={() => { callData.callType == CALL_TYPE.audio ? handleCallSwitch() : setCamera() }} style={{ ...Styles.callContainerBottomBarItemBtn, ...Styles.callitemcenter, ...Styles.callBtnSecondary }}>
          <View style={Styles.callIcon24}>
            {cameraOn ? callVideoIcon(Styles.callIconwhite) : callVideoMuteIcon(Styles.callIconwhite)}
          </View>
        </Pressable>
      </View> : null}

      <View style={{ ...Styles.callContainerBottomBarItem }}>
        <Pressable onPress={setMic}
          style={{
            ...Styles.callContainerBottomBarItemBtn,
            ...Styles.callitemcenter,
            ...Styles.callBtnSecondary,
          }}
        >
          <View style={Styles.callIcon24}>
            {micOn ? callAudioIcon(Styles.callIconwhite) : callAudioMuteIcon(Styles.callIconwhite)}
          </View>
        </Pressable>
      </View>

      <View style={{ ...Styles.callContainerBottomBarItem }}>
        <Pressable onPress={handleCallDisconnect} style={{ ...Styles.callContainerBottomBarItemBtn, ...Styles.callitemcenter, ...Styles.callBtnDanger }}>
          <View style={Styles.callIcon24}>
            {callEndIcon(Styles.callIconwhite)}
          </View>
        </Pressable>
      </View>
    </View>
  </View>
}