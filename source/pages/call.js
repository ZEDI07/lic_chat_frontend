import { useContext, useEffect, useState } from "react";
import { ActivityIndicator, FlatList, Image, KeyboardAvoidingView, Platform, Pressable, Text, View } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { CallStatusIcon } from "../components/call/callStatusIcon";
import LoadingShimmer from "../components/chat/loadingShimmer";
import SearchChat from "../components/chat/searchChat";
import Header from "../components/header";
import { CallStatus } from "../components/message/content";
import NavBar from "../components/navbar";
import NoResult from "../components/noResult";
import { CALL_STATUS, CHAT_TYPE, CONTENT_TYPE, NAV_TABS, PERMISSION } from "../constant";
import { callIcon, callVideoIcon } from "../constant/icons";
import { AppContext } from "../context/app";
import { callLog as fetchlog } from "../services/call";
import { actions } from "../store/reducer/call";
import { appStyle, mainStyle } from "../styles";
import { formatDate } from "../utils/helper";

export default ({ navigation, route }) => {
    const dispatch = useDispatch()
    const { appNavigation, translation, Styles, handleCall, handleCallJoin, permissions, enableSearch, filter, setEnableSearch } = useContext(AppContext);
    appNavigation.current = navigation;
    const callLog = useSelector(state => state.calls);
    const [calls, setCalls] = useState([])
    const [loading, setloading] = useState(!callLog.fetched ? true : false);

    const fetchCallLog = async () => {
        setloading(true)
        const response = await fetchlog({ lastCall: callLog.lastCall });
        if (response.success) {
            response.data.calls.forEach(log => {
                dispatch(actions.addCall(log))
            });
            dispatch(actions.update({ lastCall: response.data.calls[response.data.calls.length - 1]?._id, more: response.data.more, fetched: true }))
        }
        setloading(false)
    };

    const handleScroll = ({ nativeEvent }) => {
        // if (nativeEvent.layoutMeasurement.height + nativeEvent.contentOffset.y >= nativeEvent.contentSize.height - 10 && !loading && callLog.more) {
        if (!loading && callLog.more) {
            fetchCallLog();
        }
    }

    useEffect(() => {
        if (!callLog.fetched)
            fetchCallLog();
    }, []);

    const handleCallLog = () => setCalls(Object.values(callLog.data).sort((a, b) => new Date(b?.createdAt) - new Date(a.createdAt)));

    useEffect(() => {
        handleCallLog()
    }, [callLog.data])

    useEffect(() => {
        if (filter) {
            const localFilter = Object.values(callLog.data).filter(call => call.chat.name.toLowerCase().includes(filter.toLowerCase())).sort((a, b) => new Date(b?.createdAt) - new Date(a.createdAt));
            setCalls(localFilter);
            setloading(true);
            const timer = setTimeout(() => {
                fetchlog({ search: filter }).then(response => {
                    if (response.success) {
                        setCalls(response.data.calls)
                    }
                }).finally(() => setloading(false));
            }, 700);
            return () => clearTimeout(timer);
        } else handleCallLog()
    }, [filter, callLog.data])

    return (
        <View style={{ ...mainStyle, marginRight: 10 }}>
            <View style={{ ...Styles.chatBubble, ...appStyle }}>
                <View style={Styles.chatBubbleHeader}>
                    {enableSearch ? (
                        <SearchChat />
                    ) : <Header name={translation[NAV_TABS.call]} />}
                </View>
                <KeyboardAvoidingView behavior={Platform.OS == "ios" ? "padding" : "height"} style={{ flex: 1 }}>
                    <FlatList
                        data={calls}
                        onScrollBeginDrag={() => { enableSearch && !filter && setEnableSearch((prev) => !prev) }}
                        ListEmptyComponent={!loading && !Object.keys(callLog.data).length ? <NoResult /> : <LoadingShimmer />}
                        renderItem={({ item }) => <View style={{ ...Styles.chatListItem }}>
                            <View style={{ ...Styles.chatListItemInner }}>
                                <View style={{ ...Styles.chatListItemthumb }}>
                                    <Image
                                        style={{ ...Styles.thumbImg, ...Styles.chatListItemthumbImg }}
                                        source={{ uri: item.chat.avatar }}
                                    />
                                </View>
                                <View style={{ ...Styles.chatListIteminfo }}>
                                    <View style={Styles.chatListIteminfoTop}>
                                        <View style={{ ...Styles.chatListIteminfoTitle }}>
                                            <Text style={Styles.chatListIteminfoTitletxt} numberOfLines={1}>
                                                {item.chat.name}
                                            </Text>
                                        </View>
                                    </View>
                                    <View style={Styles.chatListIteminfoBtm}>
                                        {item.callDetails.status == CALL_STATUS.ended ?
                                            <View style={Styles.chatListIteminfoBtmLeft}>
                                                <View style={{ ...Styles.icon, ...Styles.icon16 }}>
                                                    <CallStatusIcon callMode={item.callMode} message={item.callDetails} />
                                                </View>
                                                <Text style={Styles.chatListIteminfoMsg}>
                                                    {formatDate(item.createdAt, translation.yesterday)} &#x2022; {<CallStatus message={item.callDetails} />}
                                                </Text>
                                            </View> :
                                            <View style={Styles.chatListIteminfoBtmLeft}>
                                                <Text style={Styles.fontsuccess}>
                                                    {item.receiverType == CHAT_TYPE.group ? "ongoing call" : `${item.callMode} call`}
                                                </Text>
                                            </View>
                                        }
                                    </View>
                                </View>
                                {item.chat.enableCalling ?
                                    item.callDetails.status == CALL_STATUS.ended ?
                                        permissions.includes(item.callType == CONTENT_TYPE.audio ? PERMISSION.start_audio_call : PERMISSION.start_video_call) ? <Pressable onPress={() => handleCall({ chat: item.chat, callType: item.callType })}>
                                            <View style={{ ...Styles.btnrounded, ...Styles.btnPrimarySoft }}>
                                                <View style={{ ...Styles.icon24 }}>{item.callType == CONTENT_TYPE.audio ? callIcon(Styles.icondefault) : callVideoIcon(Styles.icondefault)}</View>
                                            </View>
                                        </Pressable> : null :
                                        <Pressable onPress={() => handleCallJoin({ chat: item.chat._id, channel: item.channel, receiverType: item.chat.chatType })} style={{ ...Styles.chatListItemsbtns }}>
                                            <View style={{ ...Styles.btnrounded, ...Styles.btnSuccess }}>
                                                <View style={{ ...Styles.icon24 }}>{item.callType == CONTENT_TYPE.audio ? callIcon(Styles.iconwhite) : callVideoIcon(Styles.iconwhite)}</View>
                                            </View>
                                        </Pressable>
                                    : null}
                            </View>
                        </View>}
                        ListFooterComponent={loading ?
                            <View style={{ ...Styles.itemCenter, flex: 1 }}>
                                <ActivityIndicator size={"small"} color="#6a6f75" />
                            </View>
                            : null}
                        keyExtractor={(item) => item._id}
                        onEndReached={handleScroll}
                        scrollEventThrottle={16}>
                    </FlatList>
                </KeyboardAvoidingView>
                <NavBar />
            </View>
        </View>
    );
};
