
import { useContext, useEffect, useState } from "react";
import { ActivityIndicator, Image, Platform, Pressable, ScrollView, Text, View } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { SCREEN, TOAST_TYPE } from "../constant";
import { backIcon, copydefault, forwardIcon, qrIcon } from "../constant/icons";
import { AppContext } from "../context/app";
import { chatNavigation } from "../store/reducer";
import { appStyle, mainStyle } from "../styles";
import { groupLink, groupResetLink } from "../services/group";
import * as Clipboard from "expo-clipboard"

const GroupInvite = ({ navigation, route, id }) => {
    const dispatch = useDispatch();
    id = route?.params?.id || id;
    const group = useSelector((state) => state.groups[id]);
    const { translation, getGroupDetails, Styles, setForwardOpen } = useContext(AppContext);
    const [loading, setLoading] = useState(true);
    const [link, setLink] = useState();
    const { setToastNotification } = useContext(AppContext)

    const handleBackNavigation = () => {
        Platform.OS !== "web"
            ? navigation.goBack()
            : dispatch(chatNavigation({ id, screen: SCREEN.groupProfile }));
    };

    const handleNavigation = (screen) => {
        Platform.OS !== "web"
            ? navigation.navigate(screen, { id: id })
            : dispatch(chatNavigation({ id, screen }));
    };

    const getGrouplink = () => {
        groupLink(id).then(response => {
            if (response.success) {
                setLink(response.data)
            }
        }).finally(() => setLoading(false))
    }

    const handleResetLink = () => {
        setLoading(true);
        groupResetLink(id).then(response => {
            if (response.success) {
                setLink(response.data)
            }
        }).finally(() => setLoading(false))
    };

    const handleCopyLink = () => {
        Clipboard.setStringAsync(link);
        setToastNotification({
            type: TOAST_TYPE.success,
            message: "Link copied successfully."
        })
    }

    useEffect(() => {
        if (!group) getGroupDetails(id);
        getGrouplink();
    }, []);


    return (
        <View style={mainStyle}>
            <View style={{ ...Styles.chatBubble, ...appStyle, ...Styles.userinfo }}>
                <View style={{ ...Styles.chatBubbleHeader }}>
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
                        <Text style={{ ...Styles.chatBubbleHeaderTitle }}>
                            {translation.groupInvite}
                        </Text>
                    </View>
                </View>
                {!group ? (
                    <View style={{ ...Styles.itemCenter, flex: 1 }}><ActivityIndicator size={"large"} color="#6a6f75" /></View>
                ) : (
                    <ScrollView style={{ width: "100%" }}>
                        <View style={{ flex: 1, ...appStyle, ...Styles.userinfowrap }}>
                            {/* Invite Code Start */}
                            <View style={{ ...Styles.userselfinfotop, ...Styles.block, marginBottom: 0, }}>
                                <View style={{ ...Styles.thumbImg, ...Styles.userselfinfotopthumb }}>
                                    <Image style={Styles.userselfinfotopthumbimg} source={{ uri: group.avatar }} />
                                </View>
                                <View style={Styles.userselfinfotopinfo}>
                                    <Text
                                        style={{
                                            ...Styles.userselfinfotopname,
                                            ...Styles.fontsizetitle,
                                            ...Styles.fontprimary
                                        }}
                                    >
                                        {group.name}
                                    </Text>
                                    {
                                        loading ? <View style={{ ...Styles.itemCenter, flex: 1 }}><ActivityIndicator size={"small"} color="#6a6f75" /></View>
                                            : <Text style={{ ...Styles.userinfostatus, ...Styles.fontlight, ...Styles.fontsizesmall, ...Styles.mtop2 }} numberOfLine={2}>{link}</Text>
                                    }

                                </View>
                            </View>
                            {group.settings.admin.approveMember ? <View>
                                <Text style={{ ...Styles.fontlight, ...Styles.fontsizesmall }}>
                                    {translation.memberNeedPermission} <Text onPress={() => handleNavigation(SCREEN.groupSetting)} style={Styles.fontlink}>{translation.groupSettings}</Text>.
                                </Text>
                            </View> : null}
                            <View style={{ ...Styles.userinfolinks, ...Styles.block, marginTop: 15, }}>
                                <Pressable onPress={() => setForwardOpen({ type: "text", text: link })} style={{ ...Styles.userinfolinkitem, borderTopWidth: 0 }}>
                                    <View style={{ ...Styles.userinfolinkicon }}>
                                        <View style={{ ...Styles.icon20 }}>{forwardIcon(Styles.icondefault)}</View>
                                    </View>
                                    <Text style={{ ...Styles.userinfolinktext }}>{translation.linkSendByChat}</Text>
                                </Pressable>
                                {/* <View style={{ ...Styles.userinfolinkitem }}>
                                    <View style={{ ...Styles.userinfolinkicon }}>
                                        <View style={{ ...Styles.icon16 }}>{shareIcon(Styles.icondefault)}</View>
                                    </View>
                                    <Text style={{ ...Styles.userinfolinktext }}>Share Link</Text>
                                </View> */}
                                <Pressable onPress={handleCopyLink} style={{ ...Styles.userinfolinkitem }}>
                                    <View style={{ ...Styles.userinfolinkicon }}>
                                        <View style={{ ...Styles.icon20 }}>{copydefault(Styles.icondefault)}</View>
                                    </View>
                                    <Text style={{ ...Styles.userinfolinktext }}>{translation.copyLink}</Text>
                                </Pressable>
                                <Pressable onPress={() => handleNavigation(SCREEN.groupQR)} style={{ ...Styles.userinfolinkitem }}>
                                    <View style={{ ...Styles.userinfolinkicon }}>
                                        <View style={{ ...Styles.icon20 }}>{qrIcon(Styles.icondefault)}</View>
                                    </View>
                                    <Text style={{ ...Styles.userinfolinktext }}>{translation.groupQr}</Text>
                                </Pressable>
                            </View>
                            <Pressable onPress={() => handleResetLink} style={{ ...Styles.userinfolinks, ...Styles.block }}>
                                <View style={{ ...Styles.userinfolinkitem, borderTopWidth: 0 }}>
                                    <Text style={{ ...Styles.userinfolinktext, ...Styles.fontdanger }}>{translation.resetLink}</Text>
                                </View>
                            </Pressable>
                            {/* Invite Code End */}
                        </View>
                    </ScrollView>
                )}
            </View>
        </View>
    );
};

export default GroupInvite;
