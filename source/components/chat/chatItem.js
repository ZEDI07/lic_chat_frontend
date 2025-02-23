import { default as React, useContext, useEffect, useRef } from "react";
import { Image, Platform, Pressable, Text, View } from "react-native";
import { GestureHandlerRootView, Swipeable } from "react-native-gesture-handler";
import { useSelector } from "react-redux";
import { CHAT_TYPE, CONTENT_TYPE, SCREEN } from "../../constant";
import { archiveIcon, lockIcon, markReadIcon, markUnreadIcon, moreIcon, mute, optionButtonIcon, pin, unPin, unarchiveIcon, unmute } from "../../constant/icons";
import { AppContext } from "../../context/app";
import { AuthContext } from "../../context/auth";
import { ChatContext } from "../../context/chat";
import { chatArchive, chatMarkRead, chatMarkUnRead, chatUnarchive, chatUnmute, chatUnpin } from "../../services/chat";
import { fontSize, formatDate } from "../../utils/helper";
import MessageContentType from "../messageContentType";
import MessageStatus from "../messageStatus";

const ChatItem = React.memo(({ item, openSwipeableId, setOpenSwipeableId }) => {
  const { USER_ID } = useContext(AuthContext);
  const { handleNavigate, users, setOpenOption, handleChatNavigation } = useContext(ChatContext);
  const { handleChatPin, setMuteOpen, translation, Styles } = useContext(AppContext);
  const swipeableRef = useRef(null);
  const chatOpens = useSelector((state) => state.chats.opens);

  useEffect(() => {
    if (openSwipeableId !== item.chat._id) swipeableRef.current.close();
  }, [openSwipeableId]);

  const handleSwipeable = (open = true) =>
    setOpenSwipeableId(open ? item.chat._id : null);

  const renderRightActions = () =>
    Platform.OS !== "web" ? (
      <View style={Styles.chatListItemswipoption}>
        <Pressable
          onPress={() => {
            setOpenOption(item);
            handleSwipeable(false);
          }}
          style={{
            ...Styles.chatListItemswipoptionItem,
            ...Styles.itemCenter,
            backgroundColor: "#A9A9A9",
          }}
        >
          <View style={{ ...Styles.chatListItemswipoptionItemicon }}>
            {moreIcon(Styles.iconwhite)}
          </View>
          <Text style={Styles.chatListItemswipoptionItemtext}>
            {translation.more}
          </Text>
        </Pressable>
        {!item.archive ? (
          <Pressable
            onPress={() => {
              item.pin
                ? chatUnpin(item.chat._id)
                : handleChatPin(item.chat._id);
              handleSwipeable(false);
            }}
            style={{
              ...Styles.chatListItemswipoptionItem,
              ...Styles.itemCenter,
              backgroundColor: "#057EFC",
            }}
          >
            <View
              style={{
                ...Styles.chatListItemswipoptionItemicon,
                ...Styles.itemCenter,
              }}
            >
              {item.pin
                ? unPin({ ...Styles.iconwhite, ...Styles.icon18 })
                : pin({ ...Styles.iconwhite, ...Styles.icon18 })}
            </View>
            <Text style={Styles.chatListItemswipoptionItemtext}>
              {item.pin ? translation.unpin : translation.pin}
            </Text>
          </Pressable>
        ) : null}
        <Pressable
          onPress={() => {
            item.archive
              ? chatUnarchive([item.chat._id])
              : chatArchive([item.chat._id]);
            handleSwipeable(false);
          }}
          style={{
            ...Styles.chatListItemswipoptionItem,
            ...Styles.itemCenter,
            backgroundColor: "#A034FE",
          }}
        >
          <View style={{ ...Styles.chatListItemswipoptionItemicon }}>
            {item.archive
              ? unarchiveIcon(Styles.iconwhite)
              : archiveIcon(Styles.iconwhite)}
          </View>
          <Text style={Styles.chatListItemswipoptionItemtext}>
            {item.archive ? translation.unArchive : translation.archive}
          </Text>
        </Pressable>
      </View>
    ) : null;

  const renderLeftActions = () =>
    Platform.OS !== "web" ? (
      <View style={Styles.chatListItemswipoption}>
        <Pressable
          onPress={() => {
            item.unread !== 0
              ? chatMarkRead([
                { chat: item.chat._id, chatType: item.chat.chatType },
              ])
              : chatMarkUnRead([
                { chat: item.chat._id, chatType: item.chat.chatType },
              ]);
            handleSwipeable(false);
          }}
          style={{
            ...Styles.chatListItemswipoptionItem,
            ...Styles.itemCenter,
            backgroundColor: "#057EFC",
          }}
        >
          <View style={{ ...Styles.chatListItemswipoptionItemicon }}>
            {item.unread !== 0
              ? markReadIcon(Styles.iconwhite)
              : markUnreadIcon(Styles.iconwhite)}
          </View>
          <Text style={Styles.chatListItemswipoptionItemtext}>
            {item.unread !== 0 ? translation.markRead : translation.markUnread}
          </Text>
        </Pressable>
        {!item.archive ? (
          <Pressable
            onPress={() => {
              item.mute
                ? chatUnmute({ chat: [item.chat._id] })
                : setMuteOpen(item.chat._id);
              handleSwipeable(false);
            }}
            style={{
              ...Styles.chatListItemswipoptionItem,
              ...Styles.itemCenter,
              backgroundColor: "#A034FE",
            }}
          >
            <View style={{ ...Styles.chatListItemswipoptionItemicon }}>
              {item.mute ? unmute(Styles.iconwhite) : mute(Styles.iconwhite)}
            </View>
            <Text style={Styles.chatListItemswipoptionItemtext}>
              {item.mute ? translation.unmute : translation.mute}
            </Text>
          </Pressable>
        ) : null}
      </View>
    ) : null;

  return (
    <GestureHandlerRootView>
      <Swipeable
        enabled={!item.chat?.protected}
        ref={swipeableRef}
        renderRightActions={renderRightActions}
        renderLeftActions={renderLeftActions}
        rightThreshold={1}
        leftThreshold={1}
        onSwipeableWillOpen={() => handleSwipeable(true)}
        useNativeAnimations
      >
        <View
          style={{
            ...Styles.chatListItem,
            backgroundColor:
              Platform.OS == "web" &&
                chatOpens.some((chat) => chat.split("_")[0] == item.chat._id)
                ? Styles.bgprimarySoft.backgroundColor
                : Styles.bg.backgroundColor,
          }}
        // onPointerDown={(e) => {
        //   // console.log(e.nativeEvent.button)
        //   if (e.nativeEvent.button == 2) {
        //     e.preventDefault();
        //     setOpenOption(item)
        //   }
        // }}
        >
          <View style={Styles.chatListItemInner}>
            <Pressable
              onPress={() =>
                handleChatNavigation({
                  item,
                  screen:
                    item.chat.chatType == CHAT_TYPE.user
                      ? SCREEN.profile
                      : SCREEN.groupProfile,
                })
              }
              style={Styles.chatListItemthumb}
            >
              <Image
                style={{ ...Styles.thumbImg, ...Styles.chatListItemthumbImg }}
                source={{
                  uri: users[item.chat._id]
                    ? users[item.chat._id].avatar
                    : item.chat.avatar,
                }}
              />
              {users[item.chat._id]?.active && (
                <View style={Styles.chatListItemStatus}></View>
              )}
            </Pressable>
            <Pressable
              onLongPress={() =>
                Platform.OS !== "web" &&
                !item.chat?.protected &&
                setOpenOption(item)
              }
              onPress={() =>
                handleChatNavigation({ item, screen: SCREEN.message })
              }
              style={Styles.chatListIteminfo}
            >
              <View style={Styles.chatListIteminfoTop}>
                <View style={{ ...Styles.chatListIteminfoTitle }}>
                  <Text style={{ ...Styles.chatListIteminfoTitletxt }} numberOfLines={1}>
                    {item.chat.name}
                  </Text>
                </View>
                <View style={Styles.chatListItemOptions}>
                  {item.lastMessage?.createdAt ? (
                    <Text style={Styles.chatListItemTime}>
                      {formatDate(
                        item.lastMessage.createdAt,
                        translation.yesterday
                      )}
                    </Text>
                  ) : null}
                  {Platform.OS == "web" && (
                    <Pressable
                      onPress={() => {
                        if (
                          item.chat.chatType == CHAT_TYPE.group &&
                          item.chat.protected
                        ) {
                          handleChatNavigation({
                            item: item,
                            screen: "options",
                          });
                        } else setOpenOption(item);
                      }}
                      style={{ ...Styles.icon, ...Styles.icon18 }}
                    >
                      {optionButtonIcon(Styles.icondefault)}
                    </Pressable>
                  )}
                </View>
              </View>
              <View style={Styles.chatListIteminfoBtm}>
                {item?.action?.typing ? (
                  <Text
                    style={{
                      ...Styles.chatListIteminfoMsg,
                      color: "rgb(14, 208, 14)",
                    }}
                  >
                    {item.chat.chatType == CHAT_TYPE.group
                      ? `${item?.action?.user.name.split(" ")[0]} ${translation.typing
                      }...`
                      : ` ${translation.typing}...`}
                  </Text>
                ) : (
                  <>
                    {item.lastMessage?._id &&
                      item.lastMessage.contentType !==
                      CONTENT_TYPE.notification &&
                      item.lastMessage.contentType !== CONTENT_TYPE.deleted &&
                      !item.chat?.protected &&
                      item.lastMessage.sender == USER_ID ? (
                      <View style={{ ...Styles.icon, ...Styles.icon16 }}>
                        <MessageStatus
                          status={item.lastMessage.status}
                        />
                      </View>
                    ) : null}
                    {item.chat?.protected ? (
                      <>
                        <View style={{ ...Styles.icon, ...Styles.icon16 }}>
                          {lockIcon(Styles.iconlight)}
                        </View>
                        <Text style={Styles.chatListIteminfoMsg}>
                          {translation.protectedGroup}
                        </Text>
                      </>
                    ) : item.lastMessage && item.lastMessage._id ? (
                      <MessageContentType message={item.lastMessage} />
                    ) : null}
                  </>
                )}
                {item.pin && (
                  <View style={{ ...Styles.icon, ...Styles.icon16 }}>
                    {pin(Styles.icondefault)}
                  </View>
                )}
                {item.mute && (
                  <View
                    style={{
                      ...Styles.icon,
                      ...Styles.icon18,
                      ...Styles.itemCenter,
                    }}
                  >
                    {mute(Styles.iconlight)}
                  </View>
                )}

                {(item.unread > 0 || item.unread == -1) && (
                  <View style={Styles.badge}>
                    {item.unread != -1 && (
                      <Text
                        style={{
                          ...Styles.font,
                          color: "#fff",
                          fontSize: fontSize(11),
                          textAlign: "center",
                        }}
                      >
                        {item.unread > 9 ? "9+" : item.unread}
                      </Text>
                    )}
                  </View>
                )}
              </View>
            </Pressable>
          </View>
        </View>
      </Swipeable>
    </GestureHandlerRootView>
  );
});

export default ChatItem;
