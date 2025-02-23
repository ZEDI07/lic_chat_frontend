
import { useContext, useEffect, useState } from "react";
import { ActivityIndicator, Image, Platform, Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { GroupMemberPopupOptions } from "../components/group/option";
import { MEMBER_GROUP_ROLE, SCREEN, USER_STATUS } from "../constant";
import { backIcon, closeIcon, optionButtonIcon, search } from "../constant/icons";
import { AppContext } from "../context/app";
import { AuthContext } from "../context/auth";
import { GroupContext, GroupProvider } from "../context/group";
import { chatNavigation } from "../store/reducer";
import { appStyle, mainStyle, webStyle } from "../styles";

const GroupMembers = ({ navigation, route, id }) => {
  const dispatch = useDispatch();
  id = route?.params?.id || id;
  const { translation, getGroupDetails, Styles } = useContext(AppContext);
  const { selectedMember, setSelectedMember } = useContext(GroupContext);
  const { USER_ID } = useContext(AuthContext)
  const group = useSelector((state) => state.groups[id]);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [enableSearch, setEnableSearch] = useState(false);
  const [text, setText] = useState("");
  const [filterMembers, setFilterMembers] = useState(members);

  useEffect(() => {
    if (text) {
      const regex = new RegExp(text, "i");
      const filterMembers = text
        ? members.filter((member) => regex.test(member.user.name))
        : members;
      setFilterMembers(filterMembers)
    } else setFilterMembers(members)
  }, [members, text])

  const handleBackNavigation = () => {
    Platform.OS !== "web"
      ? navigation.goBack()
      : dispatch(chatNavigation({ id, screen: SCREEN.profile }));
  };

  useEffect(() => {
    if (group) {
      const members = group.members.filter(member => member.status == USER_STATUS.active && member.user.status == USER_STATUS.active)
      setMembers(members)
    }
  }, [group])

  useEffect(() => {
    if (!group) {
      setLoading(true);
      getGroupDetails(id)
        .finally(() => setLoading(false))
    };
  }, []);

  return (
    <View style={mainStyle}>
      <View style={{ ...Styles.chatBubble, ...appStyle }}>
        <View style={{ ...Styles.chatBubbleHeader }}>
          {enableSearch ? (
            <View style={{ ...Styles.searchbox, width: "100%" }}>
              <Pressable
                onPress={() => setEnableSearch(false)}
                style={{
                  ...Styles.searchboxback,
                  ...Styles.icon,
                  ...Styles.icon24,
                }}
              >
                {backIcon(Styles.icondefault)}
              </Pressable>

              <View style={{ ...Styles.searchboxtextbox }}>
                <TextInput
                  style={{
                    ...Styles.forminputText,
                    ...webStyle,
                  }}
                  autoFocus
                  onChangeText={(text) => setText(text)}
                  value={text}
                  placeholder={translation.search}
                  placeholderTextColor={Styles.fontlight.color}
                />
              </View>
              {text.length ? (
                <Pressable
                  onPress={() => setText("")}
                  style={{ ...Styles.icon, ...Styles.icon24 }}
                >
                  {closeIcon(Styles.icondefault)}
                </Pressable>
              ) : null}
            </View>
          ) : (
            <>
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
              <View style={Styles.chatBubbleHeaderInfo}>
                <Text
                  style={{
                    ...Styles.chatBubbleHeaderTitle,
                    ...Styles.textcenter,
                  }}
                >
                  {`${translation.members} (${members?.length})`}
                </Text>
              </View>
              <Pressable
                onPress={() => setEnableSearch(true)}
                style={Styles.chatBubbleHeaderOptionIcon}
              >
                <View style={{ ...Styles.icon, ...Styles.icon24 }}>
                  {search(Styles.icondefault)}
                </View>
              </Pressable>
            </>
          )}
        </View>
        <View style={{ flex: 1, ...appStyle }}>
          {loading || !group ? (
            <View style={{ ...Styles.itemCenter, flex: 1 }}><ActivityIndicator size={"large"} color="#6a6f75" /></View>
          ) : (
            <ScrollView>
              {filterMembers.map((member) => (
                <View
                  key={`member_${member.user._id}`}
                  style={Styles.chatListItem}
                >
                  <View
                    style={{ ...Styles.chatListItemInner, borderTopWidth: 0 }}
                  >
                    <View style={Styles.chatListItemthumb}>
                      <Image
                        style={{ ...Styles.thumbImg, ...Styles.chatListItemthumbImg }}
                        source={{
                          uri: member.user.avatar,
                        }}
                      />
                      {/* <View style={Styles.chatListItemStatus}></View> */}
                    </View>
                    <View style={Styles.chatListIteminfo}>
                      <View style={Styles.chatListIteminfoTop}>
                        <View style={{ ...Styles.chatListIteminfoTitle }}>
                          <Text style={Styles.chatListIteminfoTitletxt} numberOfLines={1}>
                            {member.user.name}
                          </Text>
                        </View>
                      </View>
                      {/* <View style={Styles.chatListIteminfoBtm}>
                      <Text
                        numberOfLines={1}
                        ellipsizeMode="tail"
                        style={Styles.chatListIteminfoMsg}
                      >
                        You can now call each other and view of the lake.
                      </Text>
                    </View> */}
                    </View>
                    {[
                      MEMBER_GROUP_ROLE.superAdmin,
                      MEMBER_GROUP_ROLE.admin,
                    ].includes(member.role) ? (
                      <View style={{ ...Styles.userinfolinkiconright }}>
                        <Text
                          style={{
                            ...Styles.fontsizesmall,
                            ...Styles.fontlight,
                          }}
                        >
                          { member.role == MEMBER_GROUP_ROLE.superAdmin ? translation.superAdmin : translation.admin }
                        </Text>
                      </View>
                    ) : null}
                    {(member.showOption || group.admin) && member.user._id !== USER_ID ? (
                      <Pressable
                        onPress={() => setSelectedMember(member)}
                        style={{ ...Styles.icon, ...Styles.icon18 }}
                      >
                        {optionButtonIcon(Styles.icondefault)}
                      </Pressable>
                    ) : null}
                  </View>
                </View>
              ))}
            </ScrollView>
          )}
        </View>
      </View>
      {selectedMember ? <GroupMemberPopupOptions /> : null}
    </View>
  );
};

export default (props) => (
  <GroupProvider {...props}>
    <GroupMembers {...props} />
  </GroupProvider>
);
