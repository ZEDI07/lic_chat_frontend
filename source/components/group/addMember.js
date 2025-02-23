import Constants from "expo-constants";
import React, { useContext, useEffect, useState } from "react";
import { ActivityIndicator, Image, KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { useSelector } from "react-redux";
import { checkcircleIcon, closeIcon, search } from "../../constant/icons";
import { AppContext } from "../../context/app";
import { addMember, addNewMember } from "../../services/group";
import { webStyle } from "../../styles/index";
const statusBarHeight = Constants.statusBarHeight;

const AddMemberGroup = ({ id }) => {
  const { chats, translation, Styles, addMemberGroup, setAddMemberGroup } =
    useContext(AppContext);
  const users = useSelector((state) => state.chats.users);
  const [selected, setSelected] = useState({});
  const [text, setText] = useState("");
  const group = useSelector((state) => state.groups[id]);
  const [loading, setLoading] = useState(false);
  const [newMembers, setNewMembers] = useState(
    chats?.filter(
      (chat) =>
        !group.members.some((member) => member.user._id == chat._id) &&
        chat.createGroup
    )
  );

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

  const onClose = () => setAddMemberGroup(null);

  const handleAddMembers = async () => {
    addMember({ group: id, users: Object.keys(selected) });
    onClose();
  };

  useEffect(() => {
    if (text) {
      setLoading(true);
      const timeout = setTimeout(() => {
        addNewMember(id, text)
          .then((response) => {
            if (response.success) setNewMembers(response.data);
          })
          .finally(() => setLoading(false));
      }, 700);
      return () => clearTimeout(timeout);
    } else
      setNewMembers(
        chats?.filter(
          (chat) =>
            !group.members.some((member) => member.user._id == chat._id) &&
            chat.createGroup
        )
      );
  }, [text]);

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={addMemberGroup ? true : false}
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
                {translation.addMember}
              </Text>
            </View>
            <Pressable
              style={Styles.modalheaderOption}
              onPress={() =>
                Object.values(selected).length && handleAddMembers()
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
                  {translation.done}
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
                    fontSize: 16,
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
              {loading ? (
                <View style={{ marginVertical: 10 }}>
                  <ActivityIndicator size="small" color="#6a6f75" />
                </View>
              ) : (
                newMembers.map((item, index) => {
                  return (
                    <View key={`new_chat_${item._id}`}>
                      {(index == 0 ||
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
                        )}
                      <Pressable
                        onPress={() =>
                          selected[item._id]
                            ? handleRemove(item._id)
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
                          {selected[item._id] ? (
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
                })
              )}
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
                          uri: item.avatar,
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
                      {item.name}
                    </Text>
                  </View>
                ))}
              </ScrollView>
            ) : null}
            {/* {Platform.OS !== "web" && (
                <View style={Styles.alphabeticalFilters}>
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
                </View>
              )} */}
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
};

export default AddMemberGroup;
