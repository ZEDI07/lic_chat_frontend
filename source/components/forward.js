/* eslint-disable react-hooks/exhaustive-deps */

import Constants from "expo-constants";
import moment from "moment";
import React, { useContext, useEffect, useState } from "react";
import { Dimensions, Image, Modal, Platform, Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { CHAT_TYPE, CONTENT_TYPE } from "../constant";
import { checkcircleIcon, closeIcon, search, sendWhite } from "../constant/icons";
import { AppContext } from "../context/app";
import { forwardMessage, sendMessage } from "../services/message";
import { webStyle } from "../styles";
import LoadingShimmer from "./chat/loadingShimmer";
import { AuthContext } from "../context/auth";
import { deleteRefMessage, newMessage } from "../store/reducer";

const ForwardModel = () => {
  const { chats, getNewChat, forwardOpen, setForwardOpen, translation, Styles, setToastNotification } = useContext(AppContext);
  const { USER_ID, user } = useContext(AuthContext)
  const users = useSelector((state) => state.chats.users);
  const chatData = useSelector((state) => state.chats.data);
  const [frequentlyContacted, setFrequentlyContacted] = useState([]);
  const [loading, setLoading] = useState(false);
  const [seleted, setSelected] = useState({});
  const [text, setText] = useState("");
  const dispatch = useDispatch();

  useEffect(() => {
    if (text) setFrequentlyContacted([]);
    else {
      const chats = Object.values(chatData)
        .filter((chat) =>
          !chat.chat?.protected && moment(chat.lastMessage?.createdAt)
            .startOf("D")
            .isSame(moment().startOf("D"))
        )
        .sort(
          (a, b) =>
            new Date(b?.lastMessage?.createdAt) -
            new Date(a?.lastMessage?.createdAt)
        )
        .slice(0, 2)
        .map((ele) => ele.chat);
      setFrequentlyContacted(chats);
    }
  }, [chatData, text]);

  useEffect(() => {
    setLoading(true);
    getNewChat().then(() => setLoading(false));
  }, []);

  const onClose = () => {
    setForwardOpen(null);
    setSelected({});
  };

  const handleSelected = (item) => {
    setSelected((prev) => ({ ...prev, ...{ [item._id]: item } }));
  };

  const handleRemove = (id) => {
    setSelected((prev) => {
      const store = { ...prev };
      delete store[id];
      return store;
    });
  };

  const handleForward = () => {
    switch (forwardOpen.type) {
      case CONTENT_TYPE.message:
        const data = {
          messages: forwardOpen.messages,
          users: Object.values(seleted).map((select) => ({
            to: select._id,
            receiverType: select?.chatType || CHAT_TYPE.user,
          })),
        };
        forwardMessage(data);
        break;
      case CONTENT_TYPE.text:
        Object.values(seleted).forEach(select => {
          const data = new FormData();
          data.append("to", select._id);
          data.append("receiverType", select.chatType);
          data.append("type", "text");
          data.append("text", forwardOpen.text);
          const refId = `${USER_ID}_${String(Date.now())}`;
          data.append("refId", refId);
          const tempMsg = {
            _id: refId,
            sender: USER_ID,
            receiver: select._id,
            receiverType: select.chatType,
            edited: false,
            deleted: false,
            createdAt: new Date(),
            user: user,
            status: 0,
            mediaDetails: {},
            contentType: CONTENT_TYPE.text,
            text: forwardOpen.text,
            forward: false,
            fromMe: true,
            starred: false,
            reactions: [],
            mentions: [],
          };
          dispatch(newMessage({ chatId: select._id, message: tempMsg, fromMe: true }));
          sendMessage(data).then((response) => {
            if (!response.success) {
              dispatch(deleteRefMessage({ chat: select._id, refId: refId }))
              setToastNotification({ type: TOAST_TYPE.error, message: "Error while Frowarding Link" })
            }
          });
        })
        break;
    }
    onClose();
  };

  const regex = new RegExp(text, "i");
  const filterChat = text
    ? chats.filter((chat) => regex.test(chat.name))
    : chats;

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={forwardOpen ? true : false}
      onRequestClose={onClose}
      statusBarTranslucent
      style={{
        height:
          Platform.OS == "web"
            ? "auto"
            : Dimensions.get("window").height -
            (Platform.OS == "ios" ? Constants.statusBarHeight : "100%"),
      }}
    >
      <View style={Styles.modalContainer}>
        <View style={Styles.modalmain}>
          <View style={Styles.modalheader}>
            <Pressable onPress={onClose} style={Styles.modalheaderOption}>
              <View style={Styles.modalheaderOptionicon}>
                <View style={{ ...Styles.icon, ...Styles.icon24 }}>
                  {closeIcon(Styles.icondefault)}
                </View>
              </View>
            </Pressable>
            <View style={Styles.modalheaderinfo}>
              <Text style={Styles.modalheadertitle}>
                {translation.forwardMessage}
              </Text>
            </View>
            <View style={Styles.modalheaderOptionicon}>
              <View style={{ ...Styles.icon, ...Styles.icon24 }}></View>
            </View>
          </View>
          {/* Search */}
          <View style={{ ...Styles.modalsearch }}>
            <View style={{ ...Styles.icon, ...Styles.icon24 }}>
              {search(Styles.icondefault)}
            </View>
            <View style={{ ...Styles.searchboxtextbox }}>
              <View style={{ ...Styles.searchboxtext }} />
              <TextInput
                autoFocus={Platform.OS == "web"}
                style={{ ...Styles.forminputText, ...webStyle }}
                onChangeText={(text) => setText(text)}
                value={text}
                placeholder="Search"
                placeholderTextColor={Styles.fontlight.color}
              />
            </View>
            {text ? (
              <Pressable
                onPress={() => setText("")}
                style={{ ...Styles.icon, ...Styles.icon24 }}
              >
                {closeIcon(Styles.icondefault)}
              </Pressable>
            ) : null}
          </View>
          {/* Selected Users */}
          {/* <ScrollView style={Styles.onlineUsers} horizontal={true}>
            {Object.values(seleted).map((item) => (
              <View
                key={`select_user_forward_${item._id}`}
                style={Styles.onlineUserItem}
              >
                <View style={Styles.onlineUserIteminner}>
                  <Image
                    style={{ height: 50, width: 50, borderRadius: 50 }}
                    source={{ uri: item.avatar }}
                  />
                  <Pressable
                    onPress={() => handleRemove(item._id)}
                    style={{ ...Styles.onlineUserItemClose, ...Styles.icon20 }}
                  >
                    {closeIcon(Styles.icondefault)}
                  </Pressable>
                </View>
                <Text style={Styles.onlineUserItemName} numberOfLines={1}>
                  {item.name}
                </Text>
              </View>
            ))}
          </ScrollView> */}
          <ScrollView
            style={{
              ...Styles.appStyle,
              ...Styles.modalcontent,
              // ...Styles.apprightspace,
            }}
          >
            {frequentlyContacted.length ? (
              <>
                <View style={{ ...Styles.searchresultsep }}></View>
                <View style={{ ...Styles.searchresultcontainer }}>
                  <View style={{ ...Styles.searchresulthead }}>
                    <Text style={{ ...Styles.fontBold, ...Styles.fontlight }}>
                      {translation.frequentlyContacted}
                    </Text>
                  </View>
                </View>
                {frequentlyContacted.map((chat) => (
                  <Pressable
                    onPress={() =>
                      seleted[chat._id]
                        ? handleRemove(chat._id)
                        : handleSelected(chat)
                    }
                    key={`frequent_contact_${chat._id}`}
                    style={Styles.chatListItem}
                  >
                    <View style={Styles.chatListItemInner}>
                      <View style={Styles.chatListItemthumb}>
                        <Image
                          style={{ ...Styles.thumbImg, ...Styles.chatListItemthumbImg }}
                          source={{ uri: chat.avatar }}
                        />
                        {/* {users[chat._id]?.active && <View style={Styles.chatListItemStatus}></View>} */}
                      </View>
                      <View style={Styles.chatListIteminfo}>
                        <View style={Styles.chatListIteminfoTop}>
                          <View style={{ ...Styles.chatListIteminfoTitle }}>
                            <Text style={Styles.chatListIteminfoTitletxt} numberOfLines={1}>
                              {chat.name}
                            </Text>
                          </View>
                        </View>
                        {chat.about ? (
                          <View style={Styles.chatListIteminfoBtm}>
                            <Text
                              numberOfLines={1}
                              ellipsizeMode="tail"
                              style={Styles.chatListIteminfoMsg}
                            >
                              {chat.about.about}
                            </Text>
                          </View>
                        ) : null}
                      </View>
                      {seleted[chat._id] ? (
                        <View style={Styles.chatListItemRighticon}>
                          <View
                            style={{
                              ...Styles.radioactive,
                              ...Styles.itemCenter,
                            }}
                          >
                            {checkcircleIcon({ fill: "#fff", ...Styles.icon16 })}
                          </View>
                        </View>
                      ) : (
                        <View style={Styles.chatListItemRighticon}>
                          <View
                            style={{ ...Styles.radio, ...Styles.itemCenter }}
                          ></View>
                        </View>
                      )}
                    </View>
                  </Pressable>
                ))}
              </>
            ) : null}

            {filterChat.map((item, index, chats) => {
              return (
                <View key={`forward_chat_${item._id}`}>
                  {(index == 0 ||
                    chats[index].name[0].toLowerCase() !==
                    chats[index - 1].name[0].toLowerCase()) && (
                      <View style={{ ...Styles.searchresultsep }}>
                        <Text
                          style={{
                            ...Styles.searchresultseptext,
                            ...Styles.fontBold,
                          }}
                        >
                          {item.name[0].toUpperCase()}
                        </Text>
                      </View>
                    )}
                  <Pressable
                    onPress={() =>
                      seleted[item._id]
                        ? handleRemove(item._id)
                        : handleSelected({ ...item, chatType: CHAT_TYPE.user })
                    }
                    style={Styles.chatListItem}
                  >
                    <View
                      style={{ ...Styles.chatListItemInner }}
                    >
                      <View style={Styles.chatListItemthumb}>
                        <Image
                          style={{ ...Styles.thumbImg, ...Styles.chatListItemthumbImg }}
                          source={{ uri: item.avatar }}
                        />
                        {users[item._id]?.active && (
                          <View style={Styles.chatListItemStatus}></View>
                        )}
                      </View>
                      <View style={Styles.chatListIteminfo}>
                        <View style={Styles.chatListIteminfoTop}>
                          <View style={{ ...Styles.chatListIteminfoTitle }}>
                            <Text style={Styles.chatListIteminfoTitletxt} numberOfLines={1}>
                              {item.name}
                            </Text>
                          </View>
                        </View>
                        {item.about ? (
                          <View style={Styles.chatListIteminfoBtm}>
                            <Text
                              numberOfLines={1}
                              ellipsizeMode="tail"
                              style={Styles.chatListIteminfoMsg}
                            >
                              {item.about.about}
                            </Text>
                          </View>
                        ) : null}
                      </View>
                      {seleted[item._id] ? (
                        <View style={Styles.chatListItemRighticon}>
                          <View
                            style={{
                              ...Styles.radioactive,
                              ...Styles.itemCenter,
                            }}
                          >
                            {checkcircleIcon({ fill: "#fff", ...Styles.icon16 })}
                          </View>
                        </View>
                      ) : (
                        <View style={Styles.chatListItemRighticon}>
                          <View
                            style={{ ...Styles.radio, ...Styles.itemCenter }}
                          ></View>
                        </View>
                      )}
                    </View>
                  </Pressable>
                </View>
              );
            })}
            {loading ? <LoadingShimmer /> : null}
          </ScrollView>
          {Object.values(seleted).length ? (
            <View style={Styles.forwardMsgselectedusers}>
              <Text
                numberOfLines={1}
                ellipsizeMode="tail"
                style={Styles.chatListIteminfoMsg}
              >
                {Object.values(seleted)
                  .map((item) => item.name)
                  .join(", ")}
              </Text>
              {Object.keys(seleted).length ? (
                <Pressable onPress={handleForward}>
                  {/* <Text style={Styles.forwardMsgbtn}>{translation.forward}</Text> */}
                  <View style={{ ...Styles.btnrounded, ...Styles.btnPrimary }}>
                    <View style={{ ...Styles.icon16, ...Styles.mr_3 }}>
                      {sendWhite({ ...Styles.iconwhite })}
                    </View>
                  </View>
                </Pressable>
              ) : null}
            </View>
          ) : null}

          {/* {Platform.OS !== "web" && <View style={Styles.alphabeticalFilters}>
						<View style={Styles.alphabeticalFiltersInner}>
							<Text style={Styles.alphabeticalFiltersitem}>A</Text>
							<Text style={Styles.alphabeticalFiltersitem}>B</Text>
							<Text style={Styles.alphabeticalFiltersitem}>C</Text>
							<Text style={Styles.alphabeticalFiltersitem}>D</Text>
							<Text style={Styles.alphabeticalFiltersitem}>E</Text>
							<Text style={Styles.alphabeticalFiltersitem}>F</Text>
							<Text style={Styles.alphabeticalFiltersitem}>G</Text>
							<Text style={Styles.alphabeticalFiltersitem}>H</Text>
							<Text style={Styles.alphabeticalFiltersitem}>I</Text>
							<Text style={Styles.alphabeticalFiltersitem}>J</Text>
							<Text style={Styles.alphabeticalFiltersitem}>K</Text>
							<Text style={Styles.alphabeticalFiltersitem}>L</Text>
							<Text style={Styles.alphabeticalFiltersitem}>M</Text>
							<Text style={Styles.alphabeticalFiltersitem}>N</Text>
							<Text style={Styles.alphabeticalFiltersitem}>O</Text>
							<Text style={Styles.alphabeticalFiltersitem}>P</Text>
							<Text style={Styles.alphabeticalFiltersitem}>Q</Text>
							<Text style={Styles.alphabeticalFiltersitem}>R</Text>
							<Text style={Styles.alphabeticalFiltersitem}>S</Text>
							<Text style={Styles.alphabeticalFiltersitem}>T</Text>
							<Text style={Styles.alphabeticalFiltersitem}>U</Text>
							<Text style={Styles.alphabeticalFiltersitem}>V</Text>
							<Text style={Styles.alphabeticalFiltersitem}>W</Text>
							<Text style={Styles.alphabeticalFiltersitem}>X</Text>
							<Text style={Styles.alphabeticalFiltersitem}>Y</Text>
							<Text style={Styles.alphabeticalFiltersitem}>Z</Text>
						</View>
					</View>} */}
        </View>
      </View>
    </Modal>
  );
};

export default ForwardModel;
