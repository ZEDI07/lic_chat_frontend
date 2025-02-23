import AgoraRTC, { AgoraRTCProvider, LocalUser, RemoteUser, useJoin, useLocalCameraTrack, useLocalMicrophoneTrack, usePublish, useRemoteUsers, } from "agora-rtc-react";
import { useContext, useEffect, useState } from "react";
import { ActivityIndicator, Image, Modal, Platform, Pressable, ScrollView, Text, View } from "react-native";
import { CALL_STATUS, CHAT_TYPE, CONTENT_TYPE, defaultPeopleImg } from "../../constant";
import { callAudioMuteIcon } from "../../constant/icons";
import { AppContext } from "../../context/app";
import { AuthContext } from "../../context/auth";
import CallProvider, { CallContext } from "../../context/call";
import { Controller } from "./common";

const client = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" });
AgoraRTC.setLogLevel(3);

const CallModule = () => {
    const { user } = useContext(AuthContext);
    const { Styles, generalSettings, height: winHeight, width: winWidth, getMaxGrid, translation } = useContext(AppContext);
    const { calling, chatData, callData, connected, handleDisconnect, channel, members, handleCallAccept, handleCallReject, handleCallDisconnect } = useContext(CallContext);
    const [duration, setDuration] = useState(0);
    const remoteUsers = useRemoteUsers();

    const [micOn, setMic] = useState(true);
    const [cameraOn, setCamera] = useState(callData.callType == CONTENT_TYPE.video ? true : false);

    const { localMicrophoneTrack } = useLocalMicrophoneTrack(micOn);
    const { localCameraTrack } = useLocalCameraTrack(cameraOn);

    const getVideoStyle = () => {
        const rowColumns = getMaxGrid();
        const cols = Math.min(rowColumns.columns, Math.ceil(Math.sqrt(remoteUsers.length + 1)));
        const rows = Math.min(rowColumns.rows, Math.ceil((remoteUsers.length + 1) / cols));
        const width = (winWidth - 6) / cols;
        const height = (winHeight - 66) / rows;
        return { height, width };
    };

    const callStyle = getVideoStyle();

    useJoin({ appid: generalSettings.agora, channel: channel, uid: user.uid, token: callData && callData?.token ? callData.token : null }, connected);
    usePublish([localMicrophoneTrack, localCameraTrack], connected);

    useEffect(() => {
        if (Platform.OS == "web") {
            window.addEventListener("beforeunload", () => handleDisconnect())
        }
    }, [])

    useEffect(() => {
        setCamera(callData.callType == CONTENT_TYPE.video ? true : false)
    }, [callData.callType])

    if (!calling && !connected) {
        return <Modal
            animationType="fade"
            transparent={true}
            visible
            statusBarTranslucent>
            <View style={Styles.modalContainer}>
                <View style={Styles.webincomingcallContainer}>
                    <View style={{ ...Styles.callContainer, height: "100%", width: "100%" }}>
                        {(calling && !remoteUsers.length) || (!calling && !connected) ?
                            <View style={{ ...Styles.AudioCallBox, height: "100%", width: "100%" }}>
                                <View style={{ ...Styles.AudioCallBoxUser }}>
                                    <View style={{ ...Styles.callUserImgWrap }}>
                                        <Image style={{ ...Styles.callUserImg }} source={{ uri: chatData.chat.avatar }} />
                                    </View>
                                    <Text style={{ ...Styles.AudioCallBoxName }}>
                                        {chatData.chat.name}
                                    </Text>
                                    <Text style={{ ...Styles.AudioCallBoxRing }}>
                                        {!calling ? "Incoming..." : callData.receiverType == CHAT_TYPE.group ? "Waiting other to join..." : remoteUsers.length ? duration : callData.status == CALL_STATUS.ringing ? "Ringing..." : "Calling..."}
                                    </Text>
                                </View>
                                {!calling && !connected ?
                                    <View style={{ ...Styles.incomingCallButtons }}>
                                        <Pressable onPress={handleCallAccept} style={{ ...Styles.incomingCallButtonsItem }}>
                                            <View style={{ ...Styles.callBtnPrimary, ...Styles.incomingCallButtonsbtn }} >
                                                <Text style={{ ...Styles.fontwhite, ...Styles.textcenter, ...Styles.incomingCallButtonsbtntxt, }}>{translation.answer}</Text>
                                            </View>
                                        </Pressable>
                                        <Pressable onPress={handleCallDisconnect} style={{ ...Styles.incomingCallButtonsItem }}>
                                            <View style={{ ...Styles.callBtnDanger, ...Styles.incomingCallButtonsbtn }} >
                                                <Text style={{ ...Styles.fontwhite, ...Styles.textcenter, ...Styles.incomingCallButtonsbtntxt }}>{translation.reject}</Text>
                                            </View>
                                        </Pressable>
                                    </View> : null}
                            </View> : null}
                    </View>
                </View>
            </View>
        </Modal>
    }
    else
        return (
            <View style={{ ...Styles.callContainerMain }}>
                {/* {!calling && !connected ?
                    <View style={{ ...Styles.incomingCallButtons }}>
                        <Pressable onPress={handleCallAccept} style={{ ...Styles.incomingCallButtonsItem }}>
                            <View style={{ ...Styles.callBtnPrimary, ...Styles.incomingCallButtonsbtn }} >
                                <Text style={{ ...Styles.fontwhite, ...Styles.textcenter, ...Styles.incomingCallButtonsbtntxt, }}>Answer</Text>
                            </View>
                        </Pressable>
                        <Pressable onPress={handleCallDisconnect} style={{ ...Styles.incomingCallButtonsItem }}>
                            <View style={{ ...Styles.callBtnDanger, ...Styles.incomingCallButtonsbtn }} >
                                <Text style={{ ...Styles.fontwhite, ...Styles.textcenter, ...Styles.incomingCallButtonsbtntxt }} >Reject</Text>
                            </View>
                        </Pressable>
                    </View>
                    : */}
                <ScrollView contentContainerStyle={{ ...Styles.callUserSection, height: "auto", width: winWidth }}>
                    {chatData.chat.chatType == CHAT_TYPE.group && !Object.keys(members).length ?
                        <View style={{ ...Styles.callContainer }}>
                            <View style={{ ...Styles.callitemcenter, height: "100vh" }}>
                                <ActivityIndicator />
                            </View>
                        </View> :
                        <>
                            <View style={[{ ...Styles.callUserItem }, callStyle]}>
                                <LocalUser
                                    style={{ ...Styles.callUserItemMedia }}
                                    cameraOn={cameraOn}
                                    micOn={micOn}
                                    videoTrack={localCameraTrack}
                                    audioTrack={localMicrophoneTrack}
                                    cover={user.avatar}
                                    playAudio={false}
                                >
                                    <Text style={{ ...Styles.callUserName }}>{user.name}</Text>
                                </LocalUser>
                                {!micOn ? <View style={{ ...Styles.callUserItemOptions }}>
                                    <View style={{ ...Styles.callUserItemOptionsIcon, ...Styles.callIcon24 }}>
                                        {callAudioMuteIcon(Styles.callIconwhite)}
                                    </View>
                                </View> : null}
                            </View>
                            {remoteUsers.map((remoteUser) => {
                                return (
                                    <View className="user" key={remoteUser.uid} style={[{
                                        ...Styles.callUserItem
                                    }, callStyle]}>
                                        <RemoteUser cover={chatData.chat.chatType == CHAT_TYPE.user ? chatData?.chat.avatar : members[remoteUser.uid].avatar || defaultPeopleImg} user={remoteUser}
                                            style={{ ...Styles.callUserItemMedia }} videoPlayerConfig={{ fit: "contain" }}>
                                            <Text style={{ ...Styles.callUserName }}>{chatData.chat.chatType == CHAT_TYPE.user ? chatData.chat.name : members[remoteUser.uid].name}</Text>
                                            {remoteUser._audio_muted_ ?
                                                <View style={{ ...Styles.callUserItemOptions }}>
                                                    <View style={{ ...Styles.callUserItemOptionsIcon, ...Styles.callIcon24 }}>
                                                        {callAudioMuteIcon(Styles.callIconwhite)}
                                                    </View>
                                                </View> : null}
                                        </RemoteUser>
                                    </View>
                                )
                            })}
                        </>
                    }
                </ScrollView>
                {/* } */}
                {
                    calling || connected ?
                        <Controller cameraOn={cameraOn} micOn={micOn} setCamera={() => setCamera(prev => !prev)} setMic={() => setMic(prev => !prev)} /> : null
                }
            </View>
        );
}

export default (props) => {
    // const { chat, channel } = props;
    // const dispatch = useDispatch()
    // const { generalSettings, Styles, fetchChatDetails } = useContext(AppContext);
    // const chatData = useSelector(state => state.chats.data?.[chat]);
    // const callData = useSelector(state => state.calls.data?.[channel]);
    // const members = useRef({}).current;

    // const fetchCallDetails = async () => {
    //     const response = await callDetails(channel);
    //     if (response.success)
    //         dispatch(actions.addCall(response.data))
    // }

    // useEffect(() => {
    //     if (!chatData) {
    //         fetchChatDetails(chat)
    //     } else if (chatData) {
    //         if (chatData.chat.chatType == CHAT_TYPE.group && !Object.keys(members).length) {
    //             groupMembers({ id: chatData.chat._id }).then((response) => {
    //                 if (response.success) {
    //                     response.data.users.forEach(member => {
    //                         members[member.user.uid] = member.user;
    //                     })
    //                 }
    //             })
    //         }
    //         fetchCallDetails();
    //         // fetchChannelDetails();
    //     }
    // }, [chatData]);

    return <CallProvider {...props} >
        <AgoraRTCProvider client={client}>
            <CallModule />
        </AgoraRTCProvider>
    </CallProvider>

    // else
    //     return <View style={{ ...Styles.callContainer }}>
    //         <View style={{ ...Styles.callitemcenter, height: "100vh" }}>
    //             <ActivityIndicator />
    //         </View>
    //     </View>
}