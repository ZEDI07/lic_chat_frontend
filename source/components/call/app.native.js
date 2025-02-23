import Constants from "expo-constants";
import { LightSensor } from 'expo-sensors';
import React, { useContext, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Image, PermissionsAndroid, Platform, Pressable, ScrollView, Text, Vibration, View } from 'react-native';
import createAgoraRtcEngine, { ChannelProfileType, ClientRoleType, RemoteAudioState, RemoteVideoState, RtcSurfaceView } from 'react-native-agora';
import InCallManager from 'react-native-incall-manager';
import { CALL_STATUS, CALL_TYPE, CHAT_TYPE } from '../../constant';
import { callAudioMuteIcon, callEndIcon, callIcon } from '../../constant/icons';
import { AppContext } from '../../context/app';
import { AuthContext } from '../../context/auth';
import CallProvider, { CallContext } from "../../context/call";
import { Controller } from './common';


export const CallModule = () => {
  const { Styles, generalSettings, translation, height, width, getMaxGrid } = useContext(AppContext);
  const { user } = useContext(AuthContext);
  const { callData, connected, members, calling, chatData, handleCallAccept, handleCallDisconnect } = useContext(CallContext)
  const [callType, setCallType] = useState(callData.callType);
  const [fullView, setFullView] = useState(false);
  const [illuminance, setIlluminance] = useState(12);

  const agoraEngine = useRef(createAgoraRtcEngine()).current; // IRtcEngine instance
  const [speakerEnabled, setSpeakerEnabled] = useState(agoraEngine.isSpeakerphoneEnabled());

  const engineStarted = useRef(false)
  const [remoteUsers, setRemoteUsers] = useState({ [user.uid]: { id: user.uid, enableAudio: true, enableVideo: callType == CALL_TYPE.video ? true : false } })

  const userContainerHeight = height - 40 - Constants.statusBarHeight;
  const usersLength = Object.keys(remoteUsers).length;

  const hooks = {
    onJoinChannelSuccess: () => {
      console.log('Successfully joined the channel: ');
    },
    onUserJoined: (_connection, Uid) => {
      console.log('Remote user ' + Uid + ' has joined');
      setRemoteUsers(prev => ({ ...prev, [Uid]: { id: Uid, enableAudio: true, enableVideo: callType == CALL_TYPE.video ? true : false } }));
    },
    onUserOffline: (_connection, Uid) => {
      console.log('Remote user ' + Uid + ' has left the channel');
      setRemoteUsers(prev => {
        const users = { ...prev };
        delete users[Uid];
        return users
      });
    },
    onError: (err, msg) => { console.log("error while connection", err, msg) },
    onRemoteVideoStateChanged: (connection, Uid, state) => {
      console.log('Remote user ' + Uid + 'state camera', state);
      setRemoteUsers(prev => {
        const users = { ...prev };
        const user = users[Uid];
        if (user) {
          user.enableVideo = state == RemoteVideoState.RemoteVideoStateStopped ? false : true;
        }
        return users
      })
    },
    onRemoteAudioStateChanged: (connection, Uid, state) => {
      console.log('Remote user ' + Uid + 'state Audio', state);
      setRemoteUsers(prev => {
        const users = { ...prev };
        const user = users[Uid];
        if (user) {
          users[Uid].enableAudio = state == RemoteAudioState.RemoteAudioStateStopped ? false : true;
        }
        return users
      })
    },
  }

  useEffect(() => {
    if (!connected && !calling) {
      InCallManager.setSpeakerphoneOn(true);
      InCallManager.startRingtone("_DEFAULT_", 0, "default",); // or _DEFAULT_ or system filename with extension
      Vibration.vibrate([0, 500, 200, 500], true,)
      return () => {
        InCallManager.stopRingtone();
        InCallManager.setSpeakerphoneOn(false)
        Vibration.cancel();
      };
    }
  }, [connected]);

  useEffect(() => {
    if (connected && callType == CALL_TYPE.audio) {
      LightSensor.addListener(({ illuminance }) => {
        setIlluminance(illuminance)
      })
      return () => {
        try {
          LightSensor?.removeAllListeners();
        } catch (error) {
          console.log("error")
        }
        InCallManager.turnScreenOn()
      };
    }
  }, [connected, callType])

  useEffect(() => {
    if (illuminance < 10) {
      InCallManager.turnScreenOff();
    } else
      InCallManager.turnScreenOn()
  }, [illuminance])

  const setupEngine = async () => {
    if (Platform.OS === 'android') {
      await PermissionsAndroid.requestMultiple([
        PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
        PermissionsAndroid.PERMISSIONS.CAMERA
      ]);
    }
    agoraEngine.registerEventHandler({ ...hooks });
    agoraEngine.initialize({
      appId: generalSettings.agora,
      channelProfile: ChannelProfileType.ChannelProfileCommunication
    });
    agoraEngine.joinChannel(callData.token, callData.channel, user.uid, { clientRoleType: ClientRoleType.ClientRoleBroadcaster });
    engineStarted.current = true
  }

  useEffect(() => {
    agoraEngine.setEnableSpeakerphone(speakerEnabled);
  }, [speakerEnabled])

  useEffect(() => {
    if (connected) {
      setupEngine();
      return () => {
        console.log("inside leave channel ================")
        agoraEngine.leaveChannel()
        agoraEngine.unregisterEventHandler(hooks);
        agoraEngine.release()
      }
    }
  }, [connected]);

  useEffect(() => {
    if (callData.callType == CALL_TYPE.video && callType == CALL_TYPE.audio) {
      setRemoteUsers(prev => {
        const users = { ...prev }
        users[user.uid].enableVideo = true
        return users
      })
    }
    setCallType(callData.callType);
  }, [callData.callType])

  useEffect(() => {
    if (engineStarted.current && callType == CALL_TYPE.video) {
      agoraEngine.enableVideo();
      agoraEngine.startPreview();
    } else {
      agoraEngine.disableVideo();
      agoraEngine.stopPreview()
    }
  }, [engineStarted.current, callType]);

  // useEffect(() => {
  //   if (connected) {
  //     const senser = LightSensor.addListener((sensorData) => {
  //       console.log("senser data", sensorData)
  //     })
  //     return () => senser.remove();
  //   }
  // }, [connected])

  useEffect(() => {
    if (engineStarted.current)
      agoraEngine.muteLocalAudioStream(!remoteUsers[user.uid].enableAudio)
  }, [engineStarted, remoteUsers[user.uid].enableAudio])

  useEffect(() => {
    if (engineStarted.current) {
      agoraEngine.muteLocalVideoStream(!remoteUsers[user.uid].enableVideo);
    }
  }, [engineStarted, remoteUsers[user.uid].enableVideo, callType])

  // useEffect(() => {
  //   if (callMode == CALL_MODE.incoming) {
  //     socket.emit(SOCKET_EVENTS.call, { type: CALL.received, chat, channel })
  //   } else {
  //     setConnected(true)
  //   }
  // }, [])

  // const handleCallAccept = async () => {
  //   socket.emit(SOCKET_EVENTS.call, { type: CALL.accept, chat, channel, callType: callType, receiverType: chatData.chat.chatType });
  //   // setConnected(true);
  // };

  // const handleCallReject = () => {
  //   socket.emit(SOCKET_EVENTS.call, { type: CALL.rejected, chat, channel, receiverType: chatData.chat.chatType });
  // }

  // const handleDisconnect = async () => {
  //   setConnected(false)
  //   socket.emit(SOCKET_EVENTS.call, { type: CALL.ended, chat, channel, receiverType: chatData.chat.chatType });
  // }

  // const fetchCallDetails = async () => {
  //   const response = await callDetails(channel);
  //   if (response.success)
  //     dispatch(actions.addCall(response.data))
  // }


  // useEffect(() => {
  //   if (callData && callData.joined) {
  //     setConnected(true)
  //   } else if (callData && callData.status == CALL_STATUS.ended)
  //     setConnected(false)
  // }, [callData])

  // useEffect(() => {
  //   if (!chatData) {
  //     fetchChatDetails(chat)
  //   } else if (chatData) {
  //     if (chatData.chat.chatType == CHAT_TYPE.group && !Object.keys(members).length) {
  //       groupMembers({ id: chatData.chat._id }).then((response) => {
  //         if (response.success) {
  //           response.data.users.forEach(member => {
  //             members[member.user.uid] = member.user;
  //           })
  //         }
  //       })
  //     }
  //     fetchCallDetails();
  //   }
  // }, [chatData]);

  const getVideoStyle = () => {
    const rowColumns = getMaxGrid();
    const rows = Math.min(rowColumns.rows, Math.ceil(Math.sqrt(usersLength)));
    const cols = Math.min(rowColumns.columns, Math.ceil(usersLength / rows));
    return { height: userContainerHeight / rows, width: (width - 6) / cols };
  };


  // if (!chatData || !callData) {
  //   return <View style={{ ...Styles.callContainer }}>
  //     <View style={{ ...Styles.callitemcenter, height: "100vh" }}>
  //       <ActivityIndicator />
  //     </View>
  //   </View>
  // }

  if (!calling && !callData.joined && !fullView) {
    return <Pressable style={Styles.calltoasttminwrap} onPress={() => setFullView(true)} >
      <View style={Styles.calltoasttmin}>
        <View style={{ ...Styles.chatListItem, paddingHorizontal: 0 }}>
          <View style={{ ...Styles.chatListItemInner, borderTopWidth: 0, paddingVertical: 0 }}>
            <View style={Styles.chatListItemthumb}>
              <Image style={{ ...Styles.chatListItemthumbImg, ...Styles.thumbImg }} source={{ uri: chatData.chat.avatar }} />
            </View>
            <View style={Styles.chatListIteminfo}>
              <View style={Styles.chatListIteminfoTop}>
                <View style={{ ...Styles.chatListIteminfoTitle }}>
                  <Text style={Styles.chatListIteminfoTitletxt} numberOfLines={1}>
                    {chatData.chat.name}
                  </Text>
                </View>
              </View>

              <View style={Styles.chatListIteminfoBtm}>
                <Text
                  numberOfLines={1}
                  ellipsizeMode="tail"
                  style={Styles.chatListIteminfoMsg}
                >
                  {callData.callType == CALL_TYPE.audio ? translation.voiceCall : translation.videoCall}
                </Text>
              </View>
            </View>
            <View style={Styles.chatListItemsbtns}>
              <Pressable onPress={handleCallDisconnect} style={{ ...Styles.btnrounded, ...Styles.chatListItemsbtn, ...Styles.bgdanger }}>
                <View style={{ ...Styles.icon24 }}>{callEndIcon(Styles.iconwhite)}</View>
              </Pressable>
              <Pressable onPress={handleCallAccept} style={{ ...Styles.btnrounded, ...Styles.chatListItemsbtn, ...Styles.btnSuccess }}>
                <View style={{ ...Styles.icon24 }}>{callIcon(Styles.iconwhite)}</View>
              </Pressable>
            </View>
          </View>
        </View>
      </View>
    </Pressable>
  }
  return (
    <View style={{ ...Styles.callContainerMain }}>
      {!Object.keys(remoteUsers).length || !calling && !connected && callData.status != CALL_STATUS.ended ?
        <View style={{ ...Styles.AudioCallBox }} >
          <View style={{ ...Styles.AudioCallBoxUser, flex: 1 }}>
            <View style={{ ...Styles.callUserImgWrap }}>
              <Image
                style={{ ...Styles.callUserImg }}
                source={{ uri: chatData.chat.avatar }}
              />
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
                  <Text style={{ ...Styles.fontwhite, ...Styles.textcenter, ...Styles.incomingCallButtonsbtntxt, }}>
                    {translation.answer}
                  </Text>
                </View>
              </Pressable>
              <Pressable onPress={handleCallDisconnect} style={{ ...Styles.incomingCallButtonsItem }}>
                <View style={{ ...Styles.callBtnDanger, ...Styles.incomingCallButtonsbtn }} >
                  <Text
                    style={{ ...Styles.fontwhite, ...Styles.textcenter, ...Styles.incomingCallButtonsbtntxt }} >
                    {translation.reject}
                  </Text>
                </View>
              </Pressable>
            </View>
            : null}
        </View> :
        <ScrollView contentContainerStyle={{ ...Styles.callgroupcontainer, height: "auto" }}>
          {
            chatData && chatData.chat.chatType == CHAT_TYPE.group && !Object.keys(members).length ?
              <View style={{ ...Styles.callContainer }}>
                <View style={{ ...Styles.callitemcenter, height: "100vh" }}>
                  <ActivityIndicator />
                </View>
              </View>
              : Object.values(remoteUsers).map((remoteUser) => {
                return (
                  <View className="user" key={remoteUser.id} style={[{ ...Styles.callUserItem }, getVideoStyle()]}>
                    {remoteUser.enableVideo ?
                      <RtcSurfaceView style={{
                        ...Styles.callUserItemMedia
                      }} canvas={{ uid: Number(remoteUser.id) == Number(user.uid) ? 0 : remoteUser.id, renderMode: 2 }} /> :
                      <View style={{ ...Styles.callUserItemMedia, ...Styles.callitemcenter }}>
                        <Image
                          style={{ ...Styles.callUserItemThumb }}
                          source={{ uri: chatData.chat.chatType == CHAT_TYPE.user ? remoteUser.id == user.uid ? user.avatar : chatData?.chat.avatar : members[remoteUser.id].avatar || defaultPeopleImg }}
                          alt="No Image"
                        />
                      </View>}
                    {!remoteUser.enableAudio ? <View style={{ ...Styles.callUserItemOptions }}>
                      <View style={{ ...Styles.callUserItemOptionsIcon, ...Styles.callIcon24 }}>
                        {callAudioMuteIcon(Styles.callIconwhite)}
                      </View>
                    </View> : null}
                    <Text style={Styles.callUserName}>{chatData.chat.chatType == CHAT_TYPE.user ? remoteUser.id == user.uid ? user.name : chatData?.chat.name : members[remoteUser.id].name}</Text>
                  </View>
                )
              })

          }
        </ScrollView>}
      {
        calling || connected ? <Controller speakerEnabled={speakerEnabled} setSpeakerEnabled={() => setSpeakerEnabled(prev => !prev)} cameraOn={remoteUsers[user.uid].enableVideo} micOn={remoteUsers[user.uid].enableAudio} setCamera={() => setRemoteUsers((prev) => {
          const newValue = { ...prev };
          newValue[user.uid].enableVideo = !newValue[user.uid].enableVideo;
          return newValue;
        })}
          setMic={() => setRemoteUsers((prev) => {
            const newValue = { ...prev };
            newValue[user.uid].enableAudio = !newValue[user.uid].enableAudio;
            return newValue;
          })} />
          : null
      }
    </View >
    // </View >
  );
}

export default ({ route, call }) => {
  route = route?.params;
  const callMode = route?.callMode || call.callMode;
  const chat = route?.chat || call.chat;
  const channel = route?.channel || call.channel;
  return <CallProvider chat={chat} callType={route?.callType || call.callType} channel={channel} callMode={callMode}>
    <CallModule />
  </CallProvider>
};
