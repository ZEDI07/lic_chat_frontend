
import moment from "moment";
import { useContext, useEffect, useState } from "react";
import { ActivityIndicator, Image, Platform, Pressable, ScrollView, Text, View } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import AddMemberGroup from "../components/group/addMember";
import GroupDetails from "../components/group/details";
import { GroupMemberPopupOptions } from "../components/group/option";
import { CALL_TYPE, CHAT_TYPE, PERMISSION, RUN_MODE, RUN_MODES, SCREEN, TOAST_TYPE, USER_STATUS } from "../constant";
import { backIcon, blockIcon, callIcon, callVideoIcon, closeIcon, deleteIcon, groupleaveIcon, media, mute, reportFlagIcon, rightArrowIcon, starredIcon, unblockIcon, unmute } from "../constant/icons";
import { AppContext } from "../context/app";
import { GroupContext, GroupProvider } from "../context/group";
import { chatDelete, chatUnmute } from "../services/chat";
import { blockFriend, unblockFriend } from "../services/friend";
import { exitGroup } from "../services/group";
import { report } from "../services/user";
import { chatClose, chatNavigation } from "../store/reducer";
import { appStyle, mainStyle } from "../styles";

const ChatProfile = ({ navigation, route, id }) => {
  const dispatch = useDispatch();
  id = route?.params?.id || id;
  const chatData = useSelector((state) => state.chats.data[id]);
  const user = useSelector((state) => state.chats.users?.[id]);
  const group = useSelector((state) => state.groups?.[id]);
  const [loading, setLoading] = useState(false);
  const { setMuteOpen, setConfimationDialog, setShowImage, mobileView, translation, getGroupDetails, addMemberGroup, fetchChatDetails, Styles, setToastNotification, handleCall, generalSettings, permissions } = useContext(AppContext);
  const { selectedMember } = useContext(GroupContext);

  const handleChatClose = () => dispatch(chatClose(id));
  const handleBackNavigation = () => {
    Platform.OS !== "web"
      ? navigation.goBack()
      : dispatch(chatNavigation({ id, screen: SCREEN.message }));
  };

  const handleNavigate = (id, screen) => {
    Platform.OS !== "web"
      ? navigation.navigate(screen, { id: id })
      : dispatch(chatNavigation({ id, screen }));
  };

  const navigateProfile = () => {
    if (Platform.OS == "web") {
      switch (RUN_MODE) {
        case RUN_MODES.SCRIPT:
          window.dispatchEvent(new CustomEvent("script", { detail: { type: "profile_redirect", username: chatData.chat.username } }));
          break;
        default:
          window.top.postMessage({
            type: "redirect",
            link: chatData.chat.link,
          }, "*");
          break;
      }

    }
  };

  useEffect(() => {
    if (!chatData) {
      setLoading(true);
      fetchChatDetails(id).finally(() => setLoading(false));
    }
    if (chatData && chatData.chat.chatType == CHAT_TYPE.group && !group)
      getGroupDetails(chatData.chat._id);
  }, []);

  return (
    <>
      <View style={mainStyle}>
        <View style={{ ...Styles.chatBubble, ...appStyle, ...Styles.userinfo }}>
          {!chatData || loading ? (
            <View style={{ marginTop: 100 }}>
              <ActivityIndicator size="large" color="#6a6f75" />
            </View>
          ) : (
            <>
              <View
                style={{
                  ...Styles.chatBubbleHeader,
                  ...Styles.nobg,
                  ...Styles.noshadow,
                }}
              >
                <Pressable
                  onPress={handleBackNavigation}
                  style={Styles.chatBubbleHeaderOption}
                >
                  <View style={Styles.chatBubbleHeaderOptionIcon}>
                    <View style={{ ...Styles.icon, ...Styles.icon24 }}>
                      {backIcon(Styles.icondefault)}
                    </View>
                  </View>
                </Pressable>
                <View style={Styles.chatBubbleHeaderInfo}></View>
                <View style={Styles.chatBubbleHeaderOption}>
                  {Platform.OS == "web" && !mobileView ? (
                    <Pressable
                      onPress={handleChatClose}
                      style={Styles.chatBubbleHeaderOptionIcon}
                    >
                      <View style={{ ...Styles.icon, ...Styles.icon24 }}>
                        {closeIcon(Styles.icondefault)}
                      </View>
                    </Pressable>
                  ) : null}
                </View>
              </View>

              <ScrollView>
                <View style={{ flex: 1, ...appStyle, ...Styles.userinfowrap }}>
                  <View style={Styles.userinfotop}>
                    <Pressable
                      onPress={() =>
                        setShowImage({
                          media: user?.avatar || chatData.chat.avatar,
                        })
                      }
                    >
                      <Image
                        style={{ ...Styles.thumbImg, ...Styles.image150 }}
                        source={{ uri: user?.avatar || chatData?.chat?.avatar }}
                      />
                    </Pressable>
                    {Platform.OS == "web" &&
                      chatData.chat.chatType == CHAT_TYPE.user ? (
                      <Pressable onPress={navigateProfile}>
                        <Text
                          style={{
                            ...Styles.userinfoname,
                            ...Styles.fontBold,
                            ...Styles.fontprimary,
                          }}
                        >
                          {user?.name || chatData?.chat?.name}
                        </Text>
                      </Pressable>
                    ) : (
                      <View>
                        <Text
                          style={{ ...Styles.userinfoname, ...Styles.fontBold }}
                        >
                          {user?.name || chatData?.chat?.name}
                        </Text>
                      </View>
                    )}
                    {chatData.chat.about ? (
                      <Text
                        style={{
                          ...Styles.userinfostatus,
                          ...Styles.fontdefault,
                          ...Styles.textcenter,
                          marginTop: 5,
                        }}
                      >
                        {chatData.chat.about}
                      </Text>
                    ) : null}
                    <Text
                      style={{
                        ...Styles.userinfostatus,
                        ...Styles.fontlight,
                        ...Styles.textcenter,
                        color: user?.active
                          ? "rgb(14, 208, 14)"
                          : Styles.fontlight.color,
                        marginTop: 5,
                      }}
                    >
                      {chatData.chat.chatType == CHAT_TYPE.user
                        ? user?.active
                          ? translation.online
                          : user?.lastActive || chatData.chat.lastActive
                            ? `${translation.lastActive} ${moment(
                              user?.lastActive || chatData.chat.lastActive
                            ).fromNow()}`
                            : null
                        : `${translation.group} . ${group?.totalMembers || 0} ${translation.members
                        }`}
                    </Text>
                  </View>
                  <View style={Styles.userinfotoplinks}>
                    {generalSettings.agora && (chatData.chat.chatType == CHAT_TYPE.user || (chatData.chat.chatType == CHAT_TYPE.group && group && group.settings.member.call)) ?
                      <>
                        {permissions.includes(PERMISSION.start_audio_call) ? < Pressable onPress={() => handleCall({ chat: chatData.chat, callType: CALL_TYPE.audio })} style={{ ...Styles.userinfotoplinksitem, ...Styles.block }}>
                          <View style={{ ...Styles.icon, ...Styles.icon24 }}>
                            {callIcon(Styles.iconprimary)}
                          </View>
                          <Text style={{ ...Styles.userinfostatu, ...Styles.fontprimary }}>Call</Text>
                        </Pressable> : null}
                        {permissions.includes(PERMISSION.start_video_call) ? <Pressable onPress={() => handleCall({ chat: chatData.chat, callType: CALL_TYPE.video })} style={{ ...Styles.userinfotoplinksitem, ...Styles.block }}>
                          <View style={{ ...Styles.icon, ...Styles.icon24 }}>
                            {callVideoIcon(Styles.iconprimary)}
                          </View>
                          <Text style={{ ...Styles.userinfostatu, ...Styles.fontprimary }}>Call</Text>
                        </Pressable> : null}
                      </> : null
                    }
                    {/* <View style={{ ...Styles.userinfotoplinksitem, ...Styles.block }}>
                      <View style={{ ...Styles.icon, ...Styles.icon24 }}>
                        {search}
                      </View>
                      <Text style={{ ...Styles.userinfostatu, ...Styles.fontprimary }}>Search</Text>
                    </View> */}
                  </View>
                  <View style={{ ...Styles.userinfolinks, ...Styles.block }}>
                    <Pressable
                      onPress={() => handleNavigate(id, SCREEN.media)}
                      style={{ ...Styles.userinfolinkitem, borderTopWidth: 0 }}
                    >
                      <View
                        style={{
                          ...Styles.userinfolinkicon,
                          backgroundColor: "#057EFC",
                        }}
                      >
                        {media({ fill: "#fff", ...Styles.icon20 })}
                      </View>
                      <Text style={{ ...Styles.userinfolinktext }}>
                        {translation.mediaLinkDoc}
                      </Text>
                      {/* <Text style={{ ...Styles.userinfolinkcount, ...Styles.fontprimary }}>50</Text> */}
                      <View style={{ ...Styles.userinfolinkiconright }}>
                        {rightArrowIcon({
                          ...Styles.icondefault,
                          ...Styles.icon20,
                        })}
                      </View>
                    </Pressable>
                    <Pressable
                      onPress={() => handleNavigate(id, SCREEN.starred)}
                      style={{ ...Styles.userinfolinkitem }}
                    >
                      <View
                        style={{
                          ...Styles.userinfolinkicon,
                          backgroundColor: "#FF9900",
                        }}
                      >
                        {starredIcon({ fill: "#fff", ...Styles.icon20 })}
                      </View>
                      <Text style={{ ...Styles.userinfolinktext }}>
                        {translation.starredMessage}
                      </Text>
                      {/* <Text style={{ ...Styles.userinfolinkcount, ...Styles.fontprimary }}>15</Text> */}
                      <View style={{ ...Styles.userinfolinkiconright }}>
                        {rightArrowIcon({
                          ...Styles.icondefault,
                          ...Styles.icon20,
                        })}
                      </View>
                    </Pressable>
                  </View>
                  {/* ................ HIDE Chat mute / unmute option in chat profile ........
                    * Inside Inline comments // were previously commented
                    */}
                  {/* <View style={{ ...Styles.userinfolinks, ...Styles.block }}>
                    {chatData.mute ? (
                      <Pressable
                        onPress={() =>
                          setConfimationDialog({
                            heading: translation.unmuteChat,
                            message: translation.unmuteConfirmation,
                            callback: chatUnmute,
                            chat: { chat: [chatData.chat._id] },
                          })
                        }
                        style={{
                          ...Styles.userinfolinkitem,
                          borderTopWidth: 0,
                        }}
                      >
                        <View
                          style={{
                            ...Styles.userinfolinkicon,
                            backgroundColor: "#057EFC",
                          }}
                        >
                          <View style={Styles.icon24}>
                            {unmute(Styles.iconwhite)}
                          </View>
                        </View>
                        <Text style={{ ...Styles.userinfolinktext }}>
                          {translation.unmute}
                        </Text>
                        <Text
                          style={{
                            ...Styles.userinfolinkcount,
                            ...Styles.fontlight,
                          }}
                        >
                          {translation.yes}
                        </Text>
                        <View style={{ ...Styles.userinfolinkiconright }}>
                          {rightArrowIcon({
                            ...Styles.icondefault,
                            ...Styles.icon20,
                          })}
                        </View>
                      </Pressable>
                    ) : (
                      <Pressable
                        onPress={() => setMuteOpen(chatData.chat._id)}
                        style={{
                          ...Styles.userinfolinkitem,
                          borderTopWidth: 0,
                        }}
                      >
                        <View
                          style={{
                            ...Styles.userinfolinkicon,
                            backgroundColor: "#057EFC",
                          }}
                        >
                          <View style={Styles.icon24}>
                            {mute(Styles.iconwhite)}
                          </View>
                        </View>
                        <Text style={{ ...Styles.userinfolinktext }}>
                          {translation.mute}
                        </Text>
                        <Text
                          style={{
                            ...Styles.userinfolinkcount,
                            ...Styles.fontlight,
                          }}
                        >
                          {translation.no}
                        </Text>
                        <View style={{ ...Styles.userinfolinkiconright }}>
                          {rightArrowIcon({
                            ...Styles.icondefault,
                            ...Styles.icon20,
                          })}
                        </View>
                      </Pressable>
                    )}
                    // <View style={{ ...Styles.userinfolinkitem }}>
                    //             <View style={{ ...Styles.userinfolinkicon }}>
                    //                 <Image style={{ height: 20, width: 20 }} source={{ uri: '../assets/images/wallpaper.svg' }} />
                    //             </View>
                    //             <Text style={{ ...Styles.userinfolinktext }}>Wallpaper & Sound</Text>
                    //             <View style={{ ...Styles.userinfolinkiconright }}>
                    //                 {rightArrowIcon({ ...Styles.icondefault, ...Styles.icon20 })}
                    //             </View>
                    //         </View>
                    //         <View style={{ ...Styles.userinfolinkitem }}>
                    //             <View style={{ ...Styles.userinfolinkicon }}>
                    //                 <Image style={{ height: 20, width: 20 }} source={{ uri: '../assets/images/theme.svg' }} />
                    //             </View>
                    //             <Text style={{ ...Styles.userinfolinktext }}>Change Theme</Text>
                    //             <View style={{ ...Styles.userinfolinkiconright }}>
                    //                 {rightArrowIcon({ ...Styles.icondefault, ...Styles.icon20 })}
                    //             </View>
                    //         </View>
                      
                  </View> */}
                  {chatData.chat.chatType == CHAT_TYPE.group && group ? (
                    <GroupDetails
                      group={group}
                      handleNavigate={handleNavigate}
                    />
                  ) : null}

                  <View style={{ ...Styles.userinfolinks, ...Styles.block }}>
                    <Pressable
                      onPress={() =>
                        setConfimationDialog({
                          heading: translation.deleteChat,
                          message: translation.deleteDescription,
                          callback: chatDelete,
                          chat: chatData,
                        })
                      }
                      style={{ ...Styles.userinfolinkitem, borderTopWidth: 0 }}
                    >
                      <View style={{ ...Styles.userinfolinkicon }}>
                        <View style={Styles.icon24}>
                          {deleteIcon({ ...Styles.icondanger })}
                        </View>
                      </View>
                      <Text
                        style={{
                          ...Styles.userinfolinktext,
                          ...Styles.fontdanger,
                        }}
                      >
                        {translation.deleteChat}
                      </Text>
                    </Pressable>
            {/* ............... HIDE exit group option from group profile ............... */}
                    {/* {chatData.chat.chatType == CHAT_TYPE.group &&
                      group &&
                      group.member.status == USER_STATUS.active ? (
                      <Pressable
                        onPress={() => {
                          setConfimationDialog({
                            heading: translation.exitGroup,
                            message: translation.exitDescription,
                            callback: (data) =>
                              exitGroup(data).then((response) => {
                                if (response.success) {
                                  setToastNotification({
                                    type: TOAST_TYPE.success,
                                    message: "Succesfully leaved group",
                                  });
                                } else {
                                  setToastNotification({
                                    type: TOAST_TYPE.error,
                                    message: response.message,
                                  });
                                }
                              }),
                            chat: { group: chatData.chat._id },
                          });
                        }}
                        style={{ ...Styles.userinfolinkitem }}
                      >
                        <View style={{ ...Styles.userinfolinkicon }}>
                          <View style={Styles.icon20}>
                            {groupleaveIcon(Styles.icondanger)}
                          </View>
                        </View>
                        <Text
                          style={{
                            ...Styles.userinfolinktext,
                            ...Styles.fontdanger,
                          }}
                        >{`${translation.exitGroup}`}</Text>
                      </Pressable>
                    ) : null} */}
            {/* ............... HIDE block user and group from chat/group profile ............... */}
                    {/* {chatData.chat.chatType == CHAT_TYPE.user ? (
                      chatData.blocked ? (
                        <Pressable
                          onPress={() => {
                            setConfimationDialog({
                              heading: translation.unblockChat,
                              message: translation.unblockDescription,
                              callback: unblockFriend,
                              chat: chatData,
                            });
                          }}
                          style={{ ...Styles.userinfolinkitem }}
                        >
                          <View style={{ ...Styles.userinfolinkicon }}>
                            <View style={Styles.icon24}>
                              {unblockIcon(Styles.icondefault)}
                            </View>
                          </View>
                          <Text
                            style={{
                              ...Styles.userinfolinktext,
                              ...Styles.fontdefault,
                            }}
                          >{`${translation.unblock} ${chatData.chat.name}`}</Text>
                        </Pressable>
                      ) : (
                        <Pressable
                          onPress={() => {
                            setConfimationDialog({
                              heading: translation.blockChat,
                              message: translation.blockMessage,
                              callback: blockFriend,
                              chat: chatData,
                            });
                          }}
                          style={{ ...Styles.userinfolinkitem }}
                        >
                          <View style={{ ...Styles.userinfolinkicon }}>
                            <View style={Styles.icon24}>
                              {blockIcon(Styles.icondanger)}
                            </View>
                          </View>
                          <Text
                            style={{
                              ...Styles.userinfolinktext,
                              ...Styles.fontdanger,
                            }}
                          >
                            {`${translation.block} ${chatData.chat.name}`}{" "}
                          </Text>
                        </Pressable>
                      )
                    ) : null} */}
            {/* ............... HIDE report user and group from chat/group profile ............... */}
                    {/* <Pressable
                      onPress={() =>
                        setConfimationDialog({
                          heading: translation.reportChat,
                          message: translation.reportMessage,
                          callback: report,
                          chat: chatData,
                        })
                      }
                      style={{ ...Styles.userinfolinkitem }}
                    >
                      <View style={{ ...Styles.userinfolinkicon }}>
                        <View style={Styles.icon24}>
                          {reportFlagIcon(Styles.icondanger)}
                        </View>
                      </View>
                      <Text
                        style={{
                          ...Styles.userinfolinktext,
                          ...Styles.fontdanger,
                        }}
                      >{`${translation.report} ${chatData.chat.name}`}</Text>
                    </Pressable> */}
                  </View>
                </View>
              </ScrollView>
            </>
          )}
        </View>
        {selectedMember ? <GroupMemberPopupOptions /> : null}
      </View >
      {addMemberGroup && <AddMemberGroup id={addMemberGroup} />
      }
    </>
  );
};

export default (props) => (
  <GroupProvider {...props}>
    <ChatProfile {...props} />
  </GroupProvider>
);
