/* eslint-disable react-hooks/exhaustive-deps */

import { useContext, useEffect, useRef } from "react";
import { Platform } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { CALL, CALL_MODE, CHAT_TYPE, CONTENT_TYPE, MESSAGE_STATUS, SOCKET_EVENTS } from "../constant";
import { AppContext } from "../context/app";
import { AuthContext } from "../context/auth";
import { useSocket } from "../context/socket";
import { fetchChat } from "../services/chat";
import { add, addUser, archiveCount, chatArchive, chatBlock, chatBlockMe, chatClose, chatDeleted, chatMute, chatPin, chatReadCount, messageDeleted, messageDeletedEveryone, messageReaction, messageReceived, messageSeen, messageStarred, messageUpdate, newMessage, userAction, userStatus } from "../store/reducer";
import { actions as GroupAction } from "../store/reducer/group";
import { actions as CallAction } from "../store/reducer/call";

const Socket = ({ children, setCall }) => {
  const socket = useSocket();
  const { USER_ID } = useContext(AuthContext);
  const chats = useSelector((state) => state.chats);
  const dispatch = useDispatch();
  const chatRef = useRef(chats);
  const { setPermissions, getGroupDetails, fetchUnreadCount, generalSettings } = useContext(AppContext);

  useEffect(() => {
    chatRef.current = chats;
  }, [chats]);

  const refetchChats = async (chatId) => {
    const response = await fetchChat(chatId);
    response.success && dispatch(add({ chats: [response.data] }));
  };

  const handleNotification = (message) => {
    try {
      // console.log("inside socket notification", message);
      getGroupDetails(message.receiver);

      // switch (message.action) {
      //   case NOTIFICATION_ACTION.group_setting_changed:
      //   case NOTIFICATION_ACTION.left:
      //   case NOTIFICATION_ACTION.added:
      //     getGroupDetails(message.receiver);
      //     break;
      //   default:
      //     console.log("inside socket notification", message.action);
      // }
    } catch (error) {
      console.log("error while handling notification event", error);
    }
  };

  const handleNewMessage = (message) => {
    if (message.sender !== USER_ID)
      socket.emit(SOCKET_EVENTS.message_received, message._id);
    const chatId =
      message.receiverType == CHAT_TYPE.group
        ? message.receiver
        : message.sender === USER_ID
          ? message.receiver
          : message.sender;
    const chat = chatRef.current.data[chatId];
    if (!chat) {
      refetchChats(chatId);
      fetchUnreadCount();
    } else {
      message.contentType == CONTENT_TYPE.notification &&
        handleNotification(message);
      dispatch(
        newMessage({
          chatId: chatId,
          fromMe: message.sender == USER_ID,
          message: {
            ...message,
            status:
              message.sender == USER_ID ? MESSAGE_STATUS.sent : null,
            fromMe: message.sender == USER_ID ? true : false,
            new: message.sender == USER_ID ? false : true,
          },
        })
      );
    }
  };

  const handleMessageUpdate = (message) => {
    if (message.sender !== USER_ID)
      socket.emit(SOCKET_EVENTS.message_received, message._id);
    const chatId =
      message.receiverType == CHAT_TYPE.group
        ? message.receiver
        : message.sender === USER_ID
          ? message.receiver
          : message.sender;
    const chat = chatRef.current.data[chatId];
    if (!chat) {
      return
    } else {
      dispatch(
        messageUpdate({
          chatId: chatId,
          message,
        })
      );
    }
  }

  const handleMessageReceived = (data) =>
    dispatch(messageReceived({ ...data, status: MESSAGE_STATUS.received }));

  const handleMessageSeen = (data) =>
    dispatch(messageSeen({ ...data, status: MESSAGE_STATUS.seen }));

  const handleUserStatus = (data) => {
    const users = chatRef.current.users;
    if (users[data._id]) dispatch(userStatus(data));
    else dispatch(addUser({ users: [data] }));
  };

  const handlePrivacyUpdate = (data) => {
    const users = chatRef.current.users;
    if (data.friends && users[data.chat._id]) dispatch(userStatus(data.chat))
    data.groups.forEach(group => dispatch(GroupAction.updateMember({ group, user: data.chat })))
  };

  const handleUserAction = (data) => {
    dispatch(userAction({ ...data, status: true }));
    setTimeout(() => {
      dispatch(userAction({ ...data, status: false }));
    }, 2000);
  };

  const handleChatPin = (data) => {
    const chatId = data.chat;
    const chats = chatRef.current;
    if (!chats.data[chatId]) refetchChats(chatId);
    else {
      dispatch(chatPin(data));
    }
  };

  const handleChatRead = (data) => {
    dispatch(chatReadCount({ chats: [data.chat], count: 0 }));
  };

  const handleChatArchive = (data) => {
    const chats = chatRef.current;
    const chatIds = data.chats;
    if (data.status) dispatch(archiveCount(chats.archive + chatIds.length));
    else dispatch(archiveCount(chats.archive - chatIds.length));
    chatIds.forEach((chat) => {
      if (!chats.data[chat]) refetchChats(chat);
      else {
        dispatch(chatArchive({ chat, status: data.status }));
      }
    });
  };

  const handleChatUnread = (data) => {
    dispatch(chatReadCount({ ...data, count: -1 }));
  };

  const handleChatMute = (data) => {
    const chats = chatRef.current;
    data.chats.forEach((chat) => {
      if (chats.data[chat]) dispatch(chatMute({ chat, status: data.status }));
    });
  };

  const handleMessageReaction = (data) => {
    const chats = chatRef.current;
    if (chats.data[data.chat]?.messages?.data?.[data.message])
      dispatch(messageReaction(data));
  };

  const handleBlock = (data) => {
    const chats = chatRef.current;
    if (chats.data[data.chat]) dispatch(chatBlock(data));
  };

  const handleBlockedMe = (data) => {
    const chats = chatRef.current;
    if (chats.data[data.chat])
      dispatch(chatBlockMe(data));
  };

  const handleChatDelete = (data) => {
    const chats = chatRef.current;
    data.chats.forEach((chat) => {
      const chatData = chats.data[chat];
      if (chatData) {
        dispatch(chatDeleted({ chat }));
      }
      Platform.OS == "web" &&
        chats.data[chat].chat.chatType == CHAT_TYPE.user &&
        dispatch(chatClose(chat));
    });
  };

  const handleMessageDeleted = (data) => {
    const chatData = chatRef.current.data[data.chat];
    if (chatData) {
      data.messages.forEach((message) => {
        if (chatData.messages.data[message]) {
          dispatch(messageDeleted({ chat: data.chat, message: message }));
          if (chatData.lastMessage?._id == message) refetchChats(data.chat);
        }
      });
    }
  };

  const handleMessageDeletedEveryone = (data) => {
    const chatData = chatRef.current.data[data.chat];
    if (chatData) dispatch(messageDeletedEveryone(data));
  };

  const handleMessageStarred = (data) => {
    const chatData = chatRef.current.data[data.chat];
    if (chatData) dispatch(messageStarred(data));
  };

  const handlePermissionUpdate = (data) => setPermissions(data);

  const handleGroupUpdate = (data) => {
    dispatch(GroupAction.update(data));
  };

  const postWindowClose = () => {
    if (Platform.OS == "web")
      window.top.postMessage(
        {
          type: "closeCallWindow",
        },
        "*")
    else setCall(prev => ({ ...prev, ended: true }))
  }

  const handleCall = (data) => {
    switch (data.type) {
      case CALL.new_call:
        dispatch(CallAction.addCall(data))
        if (Platform.OS == "web") {
          if (data.callMode == CALL_MODE.incoming && !data.joined) {
            setCall({
              chat: data.chat._id,
              callType: data.callType,
              channel: data.channel,
              callMode: data.callMode,
            })
          } else
            window.open(`${generalSettings.domain}/chat-call?chat=${data.chat._id}&callType=${data.callType}&channel=${data.channel}&callMode=${data.callMode}`, "__blank", "width=1180,height=675");
        }
        else
          setCall({
            chat: data.chat._id,
            callType: data.callType,
            channel: data.channel,
            callMode: data.callMode,
            fullView: false
          });
        break;
      case CALL.received:
        dispatch(CallAction.updateCall(data));
        break;
      case CALL.accept:
        dispatch(CallAction.updateCall(data));
        if (Platform.OS == "web" && data.callMode == CALL_MODE.incoming) {
          setCall(null)
          window.open(`${generalSettings.domain}/chat-call?chat=${data.chatId}&callType=${data.callType}&channel=${data.channel}&callMode=${data.callMode}`, "__blank", "width=1180,height=675");
        }
        break;
      case CALL.rejected:
        dispatch(CallAction.updateCall(data));
        if (Platform.OS == "web" && data.callMode == CALL_MODE.incoming) {
          setCall(null);
          postWindowClose();
        } else
          postWindowClose()
        break;
      case CALL.ended:
        dispatch(CallAction.updateCall(data));
        if (Platform.OS == "web" && data.callMode == CALL_MODE.incoming) {
          setCall(null);
          postWindowClose();
        } else
          postWindowClose();
        break;
      case CALL.switch:
        data.switch = true;
        dispatch(CallAction.updateCall(data));
        break;
      case CALL.approved:
        dispatch(CallAction.updateCall((data)))
        break;
      default:
        console.log("inside default", data)
    }
  }

  useEffect(() => {
    socket.on(SOCKET_EVENTS.new_message, handleNewMessage);
    socket.on(SOCKET_EVENTS.message_update, handleMessageUpdate)
    socket.on(SOCKET_EVENTS.message_received, handleMessageReceived);
    socket.on(SOCKET_EVENTS.message_seen, handleMessageSeen);
    socket.on(SOCKET_EVENTS.message_reaction, handleMessageReaction);
    socket.on(SOCKET_EVENTS.message_deleted, handleMessageDeleted);
    socket.on(SOCKET_EVENTS.message_deleted_everyone, handleMessageDeletedEveryone);
    socket.on(SOCKET_EVENTS.message_starred, handleMessageStarred);

    socket.on(SOCKET_EVENTS.user_status, handleUserStatus);
    socket.on(SOCKET_EVENTS.user_action, handleUserAction);
    socket.on(SOCKET_EVENTS.blocked_me, handleBlockedMe);

    socket.on(SOCKET_EVENTS.chat_pin, handleChatPin);
    socket.on(SOCKET_EVENTS.chat_read, handleChatRead);
    socket.on(SOCKET_EVENTS.chat_unread, handleChatUnread);
    socket.on(SOCKET_EVENTS.chat_archived, handleChatArchive);
    socket.on(SOCKET_EVENTS.chat_archived, handleChatArchive);
    socket.on(SOCKET_EVENTS.chat_mute, handleChatMute);
    socket.on(SOCKET_EVENTS.chat_deleted, handleChatDelete);
    socket.on(SOCKET_EVENTS.chat_block, handleBlock);
    socket.on(SOCKET_EVENTS.permission_updated, handlePermissionUpdate);
    socket.on(SOCKET_EVENTS.group_updates, handleGroupUpdate);
    socket.on(SOCKET_EVENTS.privacy_update, handlePrivacyUpdate);
    socket.on(SOCKET_EVENTS.call, handleCall)

    return () => {
      socket.off(SOCKET_EVENTS.new_message, handleNewMessage);
      socket.off(SOCKET_EVENTS.message_received, handleMessageReceived);
      socket.off(SOCKET_EVENTS.message_seen, handleMessageSeen);
      socket.off(SOCKET_EVENTS.message_reaction, handleMessageReaction);
      socket.off(SOCKET_EVENTS.message_deleted, handleMessageDeleted);
      socket.off(SOCKET_EVENTS.message_deleted_everyone, handleMessageDeletedEveryone);
      socket.off(SOCKET_EVENTS.message_starred, handleMessageStarred);

      socket.off(SOCKET_EVENTS.user_status, handleUserStatus);
      socket.off(SOCKET_EVENTS.user_action, handleUserAction);
      socket.off(SOCKET_EVENTS.blocked_me, handleBlockedMe);

      socket.off(SOCKET_EVENTS.chat_pin, handleChatPin);
      socket.off(SOCKET_EVENTS.chat_read, handleChatRead);
      socket.off(SOCKET_EVENTS.chat_unread, handleChatUnread);
      socket.off(SOCKET_EVENTS.chat_archived, handleChatArchive);
      socket.off(SOCKET_EVENTS.chat_mute, handleChatMute);
      socket.off(SOCKET_EVENTS.chat_deleted, handleChatDelete);
      socket.off(SOCKET_EVENTS.chat_block, handleBlock);
      socket.off(SOCKET_EVENTS.permission_updated, handlePermissionUpdate);
      socket.off(SOCKET_EVENTS.group_updates, handleGroupUpdate);
      socket.off(SOCKET_EVENTS.privacy_update, handlePrivacyUpdate);
      socket.off(SOCKET_EVENTS.call, handleCall)
    };
  }, []);

  return children; // You can return any UI components you want here
};

export default Socket;
