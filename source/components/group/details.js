import { useContext } from "react";
import { Image, Pressable, Text, View } from "react-native";
import { MEMBER_GROUP_ROLE, SCREEN, USER_STATUS } from "../../constant";
import { addIcon, linkIcon, optionButtonIcon, rightArrowIcon, settingIcon, userPendingIcon } from "../../constant/icons";
import { AppContext } from "../../context/app";
import { AuthContext } from "../../context/auth";
import { GroupContext } from "../../context/group";

export default ({ group, handleNavigate }) => {
  const { translation, setAddMemberGroup, Styles } = useContext(AppContext);
  const { setSelectedMember } = useContext(GroupContext);
  const { USER_ID } = useContext(AuthContext)

  return (
    <>
      {group.superAdmin ? (
        <View style={{ ...Styles.userinfolinks, ...Styles.block }}>
          <Pressable
            onPress={() => handleNavigate(group._id, SCREEN.groupSetting)}
            style={{
              ...Styles.userinfolinkitem,
              borderTopWidth: 0,
            }}
          >
            <View style={{ ...Styles.userinfolinkicon }}>
              <View style={{ ...Styles.icon24 }}>
                {settingIcon(Styles.iconprimary)}
              </View>
            </View>
            <Text style={{ ...Styles.userinfolinktext }}>
              {translation.groupSettings}
            </Text>
            <View style={{ ...Styles.userinfolinkiconright }}>
              {rightArrowIcon({ ...Styles.icondefault, ...Styles.icon20 })}
            </View>
          </Pressable>
        </View>
      ) : null}
      <View>
        <Text
          style={{
            ...Styles.fontsizetitle,
            ...Styles.fontBold,
            ...Styles.fontdefault,
          }}
        >
          {`${group.totalMembers}  ${translation.members}`}
        </Text>
      </View>
      <View style={{ ...Styles.userinfolinks, ...Styles.block }}>
        {group.superAdmin || (group.admin && group.settings.member.addMember) ? (
          <Pressable
            onPress={() => setAddMemberGroup(group._id)}
            style={{ ...Styles.userinfolinkitem, borderTopWidth: 0 }}
          >
            <View style={{ ...Styles.userinfolinkicon }}>
              <View style={{ ...Styles.icon24 }}>
                {addIcon(Styles.iconprimary)}
              </View>
            </View>
            <Text
              style={{
                ...Styles.userinfolinktext,
                ...Styles.fontlink,
              }}
            >
              {translation.addMembers}
            </Text>
            <View style={{ ...Styles.userinfolinkiconright }}>
              {rightArrowIcon({ ...Styles.icondefault, ...Styles.icon20 })}
            </View>
          </Pressable>
        ) : null}
        {group.pendingMembers && (group.superAdmin || group.admin) ? (
          <>
            <Pressable
              onPress={() =>
                handleNavigate(group._id, SCREEN.groupPendingRequest)
              }
              style={{ ...Styles.userinfolinkitem, borderTopWidth: 0 }}
            >
              <View style={{ ...Styles.userinfolinkicon }}>
                <View style={{ ...Styles.icon18 }}>
                  {userPendingIcon(Styles.iconprimary)}
                </View>
              </View>
              <Text
                style={{
                  ...Styles.userinfolinktext,
                  ...Styles.fontlink,
                }}
              >
                {translation.pendingRequests}
              </Text>
              <View style={{ ...Styles.userinfolinkiconright }}>
                <Text style={{ ...Styles.countbadge }}>
                  {group.pendingMembers}
                </Text>
              </View>
            </Pressable>
          </>
        ) : null}

        {/* For invite user to group for member */}
        {/* ...................... HIDE INVITE user via link ...................... */}
        {/* {group.superAdmin || group.admin ? (
          <Pressable
            onPress={() => handleNavigate(group._id, SCREEN.groupInvite)}
            style={{ ...Styles.userinfolinkitem, borderTopWidth: 0 }}
          >
            <View style={{ ...Styles.userinfolinkicon }}>
              <View style={{ ...Styles.icon18 }}>
                {linkIcon(Styles.iconprimary)}
              </View>
            </View>
            <Text
              style={{
                ...Styles.userinfolinktext,
                ...Styles.fontlink,
              }}
            >
              {translation.inviteLink}
            </Text>
            <View style={{ ...Styles.userinfolinkiconright }}>
              {rightArrowIcon({ ...Styles.icondefault, ...Styles.icon20 })}
            </View>
          </Pressable>
        ) : null} */}

        {group.members.filter(member => member.status == USER_STATUS.active && member.user.status == USER_STATUS.active).slice(0, 2).map((member) => (
          <View
            key={`member_${member._id}`}
            style={{
              ...Styles.userinfolinkitem,
              borderTopWidth: 0,
            }}
          >
            <Image
              style={{ ...Styles.userinfolinkthumb }}
              source={{
                uri: member.user.avatar,
              }}
            />
            <View style={{ ...Styles.userinfolinkcont }}>
              <Text style={{ ...Styles.fontdefault, ...Styles.font500 }}>
                {member.user.name}
              </Text>
              {/* <Text
                style={{
                  ...Styles.fontlight,
                  ...Styles.fontsizesmall,
                }}
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                Lorem ipsum dolor sit amet, consectetur....
              </Text> */}
            </View>
            {[MEMBER_GROUP_ROLE.superAdmin, MEMBER_GROUP_ROLE.admin].includes(
              member.role
            ) ? (
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
            {(member.showOption || group.admin) && member.user._id !== USER_ID &&
              member.user._id !== group.member.user._id ? (
              <Pressable
                onPress={() => setSelectedMember(member)}
                style={{ ...Styles.icon, ...Styles.icon18 }}
              >
                {optionButtonIcon(Styles.icondefault)}
              </Pressable>
            ) : null}
          </View>
        ))}
        {/* <Pressable
              onPress={() => handleNavigate(group._id, SCREEN.groupSetting)}
              style={{ ...Styles.userinfolinkitem, borderTopWidth: 0 }}
            >
              <Image
                style={{ ...Styles.userinfolinkthumb }}
                source={{
                  uri: "https://www.mecgale.com/wp-content/uploads/2017/08/dummy-profile.png",
                }}
              />
              <View style={{ ...Styles.userinfolinkcont }}>
                <Text
                  style={{ ...Styles.fontdefault, ...Styles.font500 }}
                >
                  Yuvika Dutt
                </Text>
                <Text
                  style={{
                    ...Styles.fontlight,
                    ...Styles.fontsizesmall,
                  }}
                  numberOfLines={1}
                  ellipsizeMode="tail"
                >
                  Lorem ipsum dolor sit amet, consectetur....
                </Text>
              </View>
              <View style={{ ...Styles.userinfolinkiconright }}>
                <Text
                  style={{
                    ...Styles.fontsizesmall,
                    ...Styles.fontlight,
                  }}
                >
                  Admin
                </Text>
              </View>
            </Pressable>
            <Pressable
              onPress={() => handleNavigate(group._id, SCREEN.groupSetting)}
              style={{ ...Styles.userinfolinkitem, borderTopWidth: 0 }}
            >
              <Image
                style={{ ...Styles.userinfolinkthumb }}
                source={{
                  uri: "https://www.mecgale.com/wp-content/uploads/2017/08/dummy-profile.png",
                }}
              />
              <View style={{ ...Styles.userinfolinkcont }}>
                <Text
                  style={{ ...Styles.fontdefault, ...Styles.font500 }}
                >
                  Yuzika Roman
                </Text>
                <Text
                  style={{
                    ...Styles.fontlight,
                    ...Styles.fontsizesmall,
                  }}
                  numberOfLines={1}
                  ellipsizeMode="tail"
                >
                  Lorem ipsum dolor sit amet, consectetur....
                </Text>
              </View>
              <View style={{ ...Styles.userinfolinkiconright }}>
                {rightArrowIcon({ ...Styles.icondefault, ...Styles.icon20 })}
              </View>
            </Pressable> */}
        {group.totalMembers > 2 ? (
          <Pressable
            onPress={() => handleNavigate(group._id, SCREEN.groupMembers)}
            style={{ ...Styles.userinfolinkitem }}
          >
            <View style={{ ...Styles.userinfolinkcont }}>
              <Text
                style={{
                  ...Styles.fontlink,
                  ...Styles.font500,
                  ...Styles.textcenter,
                }}
              >
                {translation.seeAll}
              </Text>
            </View>
          </Pressable>
        ) : null}
      </View>
    </>
  );
};
