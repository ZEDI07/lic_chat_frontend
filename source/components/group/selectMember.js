import Constants from "expo-constants";
import React, { useContext, useEffect, useState } from "react";
import { Alert, Image, KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { useSelector } from "react-redux";
import { USER_STATUS } from "../../constant";
import { checkcircleIcon, closeIcon, search } from "../../constant/icons";
import { AppContext } from "../../context/app";
import { AuthContext } from "../../context/auth";
import { webStyle } from "../../styles/index";
const statusBarHeight = Constants.statusBarHeight;

const SelectMember = () => {
  const { translation, Styles, enableMemberSelection, setEnableMemberSelection, handleCallInitiate } = useContext(AppContext);
  const { USER_ID } = useContext(AuthContext)
  const users = useSelector((state) => state.chats.users);
  const groups = useSelector((state) => state.groups);
  const [selected, setSelected] = useState({});
  const [text, setText] = useState("");
  const [members, setMembers] = useState([])

  const handleSelected = (item) => {
    if (Object.keys(selected).length >= 29) {
      Platform.OS == "web"
        ? alert("You can only pin up to 30 Members")
        : Alert.alert("Select Member", "You can only pin up to 30 Members", [
          { text: "OK" },
        ]);
      return
    }
    setSelected((prev) => ({ ...prev, ...{ [item.user._id]: item } }));
  };

  const handleRemove = (id) => {
    setSelected((prev) => {
      const store = { ...prev };
      delete store[id];
      return store;
    });
  };

  const onClose = () => setEnableMemberSelection(null);

  const handleCall = async () => {
    handleCallInitiate({ ...enableMemberSelection, members: Object.keys(selected) })
    onClose();
  };

  // useEffect(() => {
  //   if (text) {
  //     setLoading(true);
  //     const timeout = setTimeout(() => {
  //       addNewMember(id, text)
  //         .then((response) => {
  //           if (response.success) setNewMembers(response.data);
  //         })
  //         .finally(() => setLoading(false));
  //     }, 700);
  //     return () => clearTimeout(timeout);
  //   } else
  //     setNewMembers(
  //       chats?.filter(
  //         (chat) =>
  //           !group.members.some((member) => member.user._id == chat._id) &&
  //           chat.createGroup
  //       )
  //     );
  // }, [text]);

  useEffect(() => {
    if (enableMemberSelection) {
      const group = groups[enableMemberSelection.receiver];
      setMembers(group.members.filter(member => member.status == USER_STATUS.active && member.user.status == USER_STATUS.active && member.user._id != USER_ID))
      return () => {
        setMembers([]);
        setSelected({})
      }
    };
  }, [enableMemberSelection])

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={enableMemberSelection ? true : false}
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View style={Styles.modalContainer}>
        <KeyboardAvoidingView
          style={Styles.modalmain}
          keyboardVerticalOffset={Platform.OS == "ios" ? statusBarHeight : 0}
          behavior="padding"
        >
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
                {translation.selectMember}
              </Text>
            </View>
            <Pressable
              style={Styles.modalheaderOption}
              onPress={() =>
                Object.values(selected).length && handleCall()
              }
            >
              <View>
                <Text
                  style={
                    Object.values(selected).length
                      ? Styles.fontprimary
                      : Styles.fontlight
                  }
                >
                  {translation.call}
                </Text>
                {/* <Text style={Styles.fontprimary}>Next</Text> */}
              </View>
            </Pressable>
          </View>
          <View style={{ ...Styles.appStyle, flex: 1 }}>
            {/* Search */}
            <View style={{ ...Styles.modalsearch }}>
              <View style={{ ...Styles.icon, ...Styles.icon24 }}>
                {search(Styles.icondefault)}
              </View>
              <View style={{ ...Styles.searchboxtextbox }}>
                <View style={{ ...Styles.searchboxtext }} />
                <TextInput
                  autoFocus={Platform.OS == "web"}
                  style={{
                    ...Styles.forminputText,
                    ...webStyle,
                  }}
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
            <ScrollView
              style={{
                ...Styles.appStyle,
                ...Styles.modalcontent,
                // ...Styles.apprightspace,
              }}
            >
              {members.map((item, index) => {
                return (
                  <View key={`new_chat_${item._id}`}>
                    {/* {(index == 0 ||
                        newMembers[index].name[0].toLowerCase() !==
                        newMembers[index - 1].name[0].toLowerCase()) && (
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
                        )} */}
                    <Pressable
                      onPress={() =>
                        selected[item.user._id]
                          ? handleRemove(item.user._id)
                          : handleSelected(item)
                      }
                      style={Styles.chatListItem}
                    >
                      <View
                        style={{
                          ...Styles.chatListItemInner,
                          borderTopWidth: 0,
                        }}
                      >
                        <View style={Styles.chatListItemthumb}>
                          <Image
                            style={{
                              ...Styles.thumbImg,
                              ...Styles.chatListItemthumbImg,
                            }}
                            source={{ uri: item.user.avatar }}
                          />
                          {users[item._id]?.active && (
                            <View style={Styles.chatListItemStatus}></View>
                          )}
                        </View>
                        <View style={Styles.chatListIteminfo}>
                          <View style={Styles.chatListIteminfoTop}>
                            <View style={{ ...Styles.chatListIteminfoTitle }}>
                              <Text style={Styles.chatListIteminfoTitletxt} numberOfLines={1}>
                                {item.user.name}
                              </Text>
                            </View>
                          </View>
                          {item.user.about ? (
                            <View style={Styles.chatListIteminfoBtm}>
                              <Text
                                numberOfLines={1}
                                ellipsizeMode="tail"
                                style={Styles.chatListIteminfoMsg}
                              >
                                {item.user.about}
                              </Text>
                            </View>
                          ) : null}
                        </View>
                        {selected[item.user._id] ? (
                          <View style={Styles.chatListItemRighticon}>
                            <View
                              style={{
                                ...Styles.radioactive,
                                ...Styles.itemCenter,
                              }}
                            >
                              {checkcircleIcon({
                                fill: "#fff",
                                ...Styles.icon16,
                              })}
                            </View>
                          </View>
                        ) : (
                          <View style={Styles.chatListItemRighticon}>
                            <View
                              style={{
                                ...Styles.radio,
                                ...Styles.itemCenter,
                              }}
                            ></View>
                          </View>
                        )}
                      </View>
                    </Pressable>
                  </View>
                );
              })}
            </ScrollView>
            {/* Selected Users */}
            {Object.values(selected).length ? (
              <ScrollView
                style={{
                  ...Styles.onlineUsers,
                  ...Styles.bordertop,
                  borderBottomWidth: 0,
                }}
                horizontal={true}
              >
                {Object.values(selected).map((item) => (
                  <View
                    key={`selected_${item._id}`}
                    style={Styles.onlineUserItem}
                  >
                    <View style={Styles.onlineUserIteminner}>
                      <Image
                        style={{
                          ...Styles.onlineUserItemimg,
                          ...Styles.thumbImg,
                        }}
                        source={{
                          uri: item.user.avatar,
                        }}
                      />
                      <Pressable
                        onPress={() => handleRemove(item._id)}
                        style={{
                          ...Styles.onlineUserItemClose,
                          ...Styles.icon20,
                        }}
                      >
                        {closeIcon(Styles.icondefault)}
                      </Pressable>
                    </View>
                    <Text style={Styles.onlineUserItemName} numberOfLines={1}>
                      {item.user.name}
                    </Text>
                  </View>
                ))}
              </ScrollView>
            ) : null}
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
};

export default SelectMember;
