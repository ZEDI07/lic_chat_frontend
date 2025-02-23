import moment from "moment";
import { useContext, useEffect, useState } from "react";
import { Image, KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, View } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { GENERAL_SETTING_KEY, MESSAGING_SETTING, PERMISSION, SCREEN } from "../../constant";
import { groupIcon } from "../../constant/icons";
import { AppContext } from "../../context/app";
import { newChats } from "../../services/chat";
import { newChatOpen } from "../../store/reducer";
import { appStyle } from "../../styles";
import LoadingShimmer from "../chat/loadingShimmer";
import CreateNewGroup from "../group/createGroup";
import NoResult from "../noResult";


const NewChat = () => {
  const { chats, getNewChat, appNavigation, filter, translation, newCreateGroup, setNewCreateOpen, permissions, Styles, generalSettings, enableSearch, setEnableSearch } = useContext(AppContext);
  const users = useSelector((state) => state.chats.users);
  const chatData = useSelector((state) => state.chats.data);
  const [frequentlyContacted, setFrequuentlyContacted] = useState([]);
  const [loadingNewChat, setLoadingNewChat] = useState(!Object.keys(chats).length);
  const dispatch = useDispatch();
  const [filterChat, setFilterChat] = useState(Object.values(chats));

  const handleNavigate = (chat, screen) => {
    Platform.OS !== "web"
      ? appNavigation.current.navigate(screen, { id: chat._id })
      : dispatch(newChatOpen({ id: chat._id, screen }));
  };

  useEffect(() => {
    const chats = Object.values(chatData)
      .filter(
        (chat) =>
          !chat.chat?.protected &&
          moment(chat.lastMessage?.createdAt)
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
    setFrequuentlyContacted(chats);
  }, [chatData]);

  useEffect(() => {
    if (!Object.keys(chats).length) {
      setLoadingNewChat(true);
      getNewChat().finally(() => setLoadingNewChat(false));
    }
  }, []);

  useEffect(() => {
    if (filter) {
      if (
        generalSettings?.[GENERAL_SETTING_KEY.messaging_setting] ==
        MESSAGING_SETTING.everyone
      ) {
        setLoadingNewChat(true);
        const timeout = setTimeout(() => {
          newChats(filter)
            .then((response) => {
              if (response.success) {
                setFilterChat(response.chats);
              }
            })
            .finally(() => setLoadingNewChat(false));
        }, 700);
        return () => { clearTimeout(timeout); setLoadingNewChat(false) };
      } else {
        const regex = new RegExp(filter, "i");
        const filterChat = filter
          ? chats.filter((chat) => regex.test(chat.name))
          : chats;
        setFilterChat(filterChat);
      }
    } else setFilterChat(chats);
  }, [filter, chats, generalSettings]);

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1, ...appStyle }}>
      <ScrollView
        onScrollBeginDrag={() => {
          enableSearch && !filter && setEnableSearch((prev) => !prev);
        }
        }>
        {generalSettings[GENERAL_SETTING_KEY.group] && !filter &&
          !loadingNewChat &&
          permissions.includes(PERMISSION.create_groups) ? (
          <Pressable
            onPress={() => setNewCreateOpen(true)}
            style={Styles.chatListItem}
          >
            <View style={{ ...Styles.chatListItemInner }}>
              <View
                style={{ ...Styles.chatListItemicon, ...Styles.itemCenter }}
              >
                {groupIcon({ ...Styles.icondefault, ...Styles.icon24 })}
              </View>
              <View style={Styles.chatListIteminfo}>
                <View style={Styles.chatListIteminfoTop}>
                  <View style={Styles.chatListIteminfoTitle}>
                    <Text style={Styles.chatListIteminfoTitletxt} numberOfLines={1}>
                      {translation.createNewGroup}
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          </Pressable>
        ) : null}
        {!filter && !loadingNewChat && frequentlyContacted.length ? (
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
                onPress={() => handleNavigate(chat, SCREEN.message)}
                key={`frequent_contact_${chat._id}`}
                style={Styles.chatListItem}
              >
                <View style={Styles.chatListItemInner}>
                  <View style={Styles.chatListItemthumb}>
                    <Image
                      style={{
                        ...Styles.thumbImg,
                        ...Styles.chatListItemthumbImg,
                      }}
                      source={{ uri: users[chat._id]?.avatar || chat.avatar }}
                    />
                    {/* {users[chat._id]?.active && <View style={Styles.chatListItemStatus}></View>} */}
                  </View>
                  <View style={Styles.chatListIteminfo}>
                    <View style={Styles.chatListIteminfoTop}>
                      <View style={{ ...Styles.chatListIteminfoTitle }}>
                        <Text style={Styles.chatListIteminfoTitletxt} numberOfLines={1}>{chat.name}</Text>
                      </View>
                    </View>
                    <View style={Styles.chatListIteminfoBtm}>
                      <Text
                        numberOfLines={1}
                        ellipsizeMode="tail"
                        style={Styles.chatListIteminfoMsg}
                      >
                        {users[chat._id]?.about || chat.about}
                      </Text>
                    </View>
                  </View>
                </View>
              </Pressable>
            ))}
          </>
        ) : null}
        <View style={{ ...Styles.searchresultsep }}></View>
        <View style={{ ...Styles.searchresultcontainer }}>
          <View style={{ ...Styles.searchresulthead }}>
            <Text style={{ ...Styles.fontBold, ...Styles.fontlight }}>
              {translation.chats}
            </Text>
          </View>
        </View>
        {!loadingNewChat
          ? filterChat.map((item, index) => {
            return (
              <View key={`new_chat_${item._id}`}>
                {index == 0 ||
                  (filterChat[index].name[0].toLowerCase() !==
                    filterChat[index - 1].name[0].toLowerCase() &&
                    index !== filterChat.length) ? (
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
                ) : null}
                <Pressable
                  onPress={() => handleNavigate(item, SCREEN.message)}
                  style={Styles.chatListItem}
                >
                  <View style={{ ...Styles.chatListItemInner }}>
                    <View style={Styles.chatListItemthumb}>
                      <Image
                        style={{
                          ...Styles.thumbImg,
                          ...Styles.chatListItemthumbImg,
                        }}
                        source={{
                          uri: users[item._id]?.avatar || item.avatar,
                        }}
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

                      <View style={Styles.chatListIteminfoBtm}>
                        <Text
                          numberOfLines={1}
                          ellipsizeMode="tail"
                          style={Styles.chatListIteminfoMsg}
                        >
                          {users[item._id]?.about || item.about}
                        </Text>
                      </View>
                    </View>
                  </View>
                </Pressable>
              </View>
            );
          })
          : null}
        {!filterChat.length && !loadingNewChat ? <NoResult /> : null}
        {loadingNewChat ? <LoadingShimmer /> : null}
        {!loadingNewChat && !Object.values(chats).length ? <NoResult /> : null}
        {/* <View style={{ ...Styles.searchresultsep }}>
                <Text style={{ ...Styles.fontsizeheading, ...Styles.fontBold }}>A</Text>
            </View>
            <View style={Styles.chatListItem}>
                <View style={{ ...Styles.chatListItemInner, borderTopWidth: 0 }}>
                    <View style={Styles.chatListItemthumb}>
                        <Image style={{ height: 45, width: 45, borderRadius: 50 }} source={{ uri: "https://www.mecgale.com/wp-content/uploads/2017/08/dummy-profile.png" }} />
                        <View style={Styles.chatListItemStatus}></View>
                    </View>
                    <View style={Styles.chatListIteminfo}>
                        <View style={Styles.chatListIteminfoTop}>
                            <View style={{...Styles.chatListIteminfoTitle}}>
                              <Text style={Styles.chatListIteminfoTitletxt} numberOfLines={1}>Aaron Burke</Text>
                            </View>
                        </View>
                        <View style={Styles.chatListIteminfoBtm}>
                            <Text numberOfLines={1} ellipsizeMode="tail" style={Styles.chatListIteminfoMsg}>
                                You can now call each other and view of the lake.
                            </Text>
                        </View>
                    </View>
                </View>
            </View>
            <View style={Styles.chatListItem}>
                <View style={Styles.chatListItemInner}>
                    <View style={Styles.chatListItemthumb}>
                        <Image style={{ height: 45, width: 45, borderRadius: 50 }} source={{ uri: "https://www.mecgale.com/wp-content/uploads/2017/08/dummy-profile.png" }} />
                        <View style={Styles.chatListItemStatus}></View>
                    </View>
                    <View style={Styles.chatListIteminfo}>
                        <View style={Styles.chatListIteminfoTop}>
                            <View style={{...Styles.chatListIteminfoTitle}}>
                              <Text style={Styles.chatListIteminfoTitletxt} numberOfLines={1}>Aaron Burke</Text>
                            </View>
                        </View>
                        <View style={Styles.chatListIteminfoBtm}>
                            <Text numberOfLines={1} ellipsizeMode="tail" style={Styles.chatListIteminfoMsg}>
                                You can now call each other and view of the lake.
                            </Text>
                        </View>
                    </View>
                </View>
            </View>
            <View style={{ ...Styles.searchresultsep }}>
                <Text style={{ ...Styles.fontsizeheading, ...Styles.fontBold }}>B</Text>
            </View>
            <View style={Styles.chatListItem}>
                <View style={{ ...Styles.chatListItemInner, borderTopWidth: 0 }}>
                    <View style={Styles.chatListItemthumb}>
                        <Image style={{ height: 45, width: 45, borderRadius: 50 }} source={{ uri: "https://www.mecgale.com/wp-content/uploads/2017/08/dummy-profile.png" }} />
                        <View style={Styles.chatListItemStatus}></View>
                    </View>
                    <View style={Styles.chatListIteminfo}>
                        <View style={Styles.chatListIteminfoTop}>
                            <View style={{...Styles.chatListIteminfoTitle}}>
                              <Text style={Styles.chatListIteminfoTitletxt} numberOfLines={1}>Aaron Burke</Text>
                            </View>
                        </View>
                        <View style={Styles.chatListIteminfoBtm}>
                            <Text numberOfLines={1} ellipsizeMode="tail" style={Styles.chatListIteminfoMsg}>
                                You can now call each other and view of the lake.
                            </Text>
                        </View>
                    </View>
                </View>
            </View>
            <View style={Styles.chatListItem}>
                <View style={Styles.chatListItemInner}>
                    <View style={Styles.chatListItemthumb}>
                        <Image style={{ height: 45, width: 45, borderRadius: 50 }} source={{ uri: "https://www.mecgale.com/wp-content/uploads/2017/08/dummy-profile.png" }} />
                        <View style={Styles.chatListItemStatus}></View>
                    </View>
                    <View style={Styles.chatListIteminfo}>
                        <View style={Styles.chatListIteminfoTop}>
                            <View style={{...Styles.chatListIteminfoTitle}}>
                              <Text style={Styles.chatListIteminfoTitletxt} numberOfLines={1}>Aaron Burke</Text>
                            </View>
                        </View>
                        <View style={Styles.chatListIteminfoBtm}>
                            <Text numberOfLines={1} ellipsizeMode="tail" style={Styles.chatListIteminfoMsg}>
                                You can now call each other and view of the lake.
                            </Text>
                        </View>
                    </View>
                </View>
            </View> */}
      </ScrollView >
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

      {
        newCreateGroup && (
          <CreateNewGroup
            visible={newCreateGroup}
            onClose={() => setNewCreateOpen(false)}
          />
        )
      }
    </KeyboardAvoidingView>
  );
};

export default NewChat;
