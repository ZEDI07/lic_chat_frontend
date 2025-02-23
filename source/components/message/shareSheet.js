import Checkbox from 'expo-checkbox';
import Constants from "expo-constants";
import * as Contacts from 'expo-contacts';
import { Fragment, useContext, useEffect, useState } from "react";
import { ActivityIndicator, FlatList, Image, KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { ATTACHMENT_TYPES, CONTENT_TYPE, TOAST_TYPE, defaultPeopleImg } from "../../constant";
import { callIcon, checkcircleIcon, closeIcon, emailIcon, search } from "../../constant/icons";
import { AppContext } from "../../context/app";
import { MessageContext } from "../../context/message";
import { sendMessage } from "../../services/message";
import { webStyle } from "../../styles";
import CameraScreen from '../camera';
import NoResult from "../noResult";
import ViewMap from "./mapView";
const statusBarHeight = Constants.statusBarHeight;

export const SelectedContactView = ({ view, selected, setSelected }) => {
	const { Styles, translation, contacts, setToastNotification, syncContacts } = useContext(AppContext);

	useEffect(() => {
		if (view && selected && !contacts.length) {
			syncContacts()
		}
	}, [selected, view, contacts]);

	const exist = (contact) => {
		if (!contacts.length)
			return true;
		else {
			const found = contacts.find((ele) => ele.phoneNumbers.every(elephone => contact.phoneNumbers.every(contactPhone => elephone.number == contactPhone.number)))
			if (found) return true;
			return false;
		}
	}

	if (selected && Object.keys(selected).length)
		return <ScrollView style={{ ...Styles.appStyle }}>
			{Object.values(selected).map((contact, index) => <Fragment key={`selected_${index}`}>
				<View style={{ ...Styles.contactdetailsItemtop, ...Styles.fdrow }}>
					<View style={{ ...Styles.contactdetailsItemimg, ...Styles.itemCenter }}>
						<Image source={{ uri: contact?.image?.uri || defaultPeopleImg }} style={{ height: 70, width: 70 }} />
					</View>
					<View style={{ ...Styles.fontsizetitle, flex: 1 }}>
						<Text style={{ ...Styles.fontdefault, }} placeholder={translation.title} placeholderTextColor={Styles.fontlight.color}>{contact.name} </Text>
					</View>
					{view && Platform.OS !== "web" && !exist(contact) ? <Pressable onPress={() => {
						Contacts.addContactAsync(contact).then((response) => {
							setToastNotification({ type: TOAST_TYPE.success, message: "Contact added successfully" });
							syncContacts()
						}).catch((err) => setToastNotification({ type: TOAST_TYPE.error, message: "Error while adding contact." }))
					}} style={{ ...Styles.btn, ...Styles.btnPrimary, ...Styles.contactdetailsItembtn }}>
						<Text style={{ ...Styles.btnPrimaryTxt }}>{translation.add}</Text>
					</Pressable> : true}
				</View>
				<View style={{ ...Styles.contactdetailsItembtm }}>
					{
						contact.phoneNumbers?.map((number, index) => <Fragment key={`phone_${index}`}>
							<View style={{ ...Styles.contactdetailsItemlist, ...Styles.fdrow, ...Styles.bordertop }}>
								{callIcon({ ...Styles.iconprimary, ...Styles.icon24 })}
								<Text style={{ ...Styles.fontdefault, flex: 1 }} >{number.number || number.digits}</Text>
								{!view ?
									<Checkbox
										onValueChange={(value) => {
											setSelected(prev => {
												const newValue = { ...prev };
												newValue[contact.id].phoneNumbers[index].selected = value;
												return newValue
											});
										}}
										value={number?.selected ?? true} /> : null}
							</View>
						</Fragment>)
					}
					{
						contact.emails?.map((email, index) => <Fragment key={`email_${index}`}>
							<View style={{ ...Styles.contactdetailsItemlist, ...Styles.fdrow, ...Styles.bordertop }}>
								{emailIcon({ ...Styles.iconprimary, ...Styles.icon24 })}
								<Text style={{ ...Styles.fontdefault, flex: 1 }} >{email.email}</Text>
								{!view ? <Checkbox onValueChange={(value) => {
									setSelected(prev => {
										const newValue = { ...prev };
										newValue[contact.id].emails[index].selected = value;
										return newValue
									});
								}} value={email?.selected ?? true} /> : null}
							</View>
						</Fragment>)
					}
				</View>
				<View style={{ ...Styles.searchresultsep }}></View>
			</Fragment>)}
		</ScrollView >
	return null
}

export const ShareContact = () => {
	const { chat, setEnableShare } = useContext(MessageContext);
	const { Styles, translation, contacts, syncContacts } = useContext(AppContext);
	const [selected, setSelected] = useState({});
	const [text, setText] = useState("");
	const [page, setPage] = useState(0);
	const [process, setProcess] = useState(false);
	const [loading, setLoading] = useState(false);
	const [filterContacts, setFilterContacts] = useState(contacts);
	const onClose = () => setEnableShare(null);

	const systemContacts = async () => {
		setLoading(true)
		await syncContacts()
		setLoading(false)
	}

	useEffect(() => {
		systemContacts();
	}, []);

	const handleSelected = (item) => {
		setSelected((prev) => ({ ...prev, ...{ [item.id]: item } }));
	};

	const handleRemove = (id) => {
		setSelected((prev) => {
			const store = { ...prev };
			delete store[id];
			return store;
		});
	};

	useEffect(() => {
		if (text) {
			const filter = contacts.filter(contact => {
				const name = (contact.name || contact.firstName + " " + contact.lastName || "UNKNOWN").toLowerCase();
				return name.includes(text.toLowerCase());
			});
			setFilterContacts(filter)
		} else setFilterContacts(contacts)
	}, [text, contacts]);

	const handleSelections = (contact, index, contacts) => {
		for (let key in contact) {
			if (Array.isArray(contact[key])) {
				for (let i = 0; i < contact[key].length; i++)
					handleSelections(contact[key][i], i, contact[key])
			}
			if (contact?.selected == false)
				contacts.splice(index, 1)
			else delete contact.id
		}
	}

	const handleSend = async () => {
		const contacts = [...Object.values(selected)];
		for (let i = 0; i < contacts.length; i++) {
			const contact = contacts[i];
			delete contact.id
			handleSelections(contact, i, contacts)
		};
		setProcess(true);
		const data = {
			type: CONTENT_TYPE.contact,
			to: chat._id,
			receiverType: chat.chatType,
			contact: contacts
		}
		await sendMessage(data);
		setProcess(false)
		onClose();
	}
	return <>
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
					{translation.contact}
				</Text>
			</View>
			<Pressable
				style={Styles.modalheaderOption}
				onPress={() =>
					page == 0
						? Object.values(selected).length && setPage(1)
						: handleSend()
				}
			>
				<View>
					{process ? (
						<ActivityIndicator size={"small"} color="#6a6f75" />
					) : (
						<Text
							style={
								(page == 0 && Object.values(selected).length || page == 1)
									? Styles.fontprimary
									: Styles.fontlight
							}
						>
							{page == 0 ? translation.next : translation.done}
						</Text>
					)}
				</View>
			</Pressable >
		</View >
		{page == 0 ? (
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
				<FlatList
					style={{ ...Styles.appStyle, ...Styles.modalcontent }}
					keyboardShouldPersistTaps={"always"}
					data={filterContacts}
					renderItem={({ item }) => <View>
						{/* {index == 0 ||
						(contacts[index].name?.[0]?.toLowerCase() !==
							contacts[index - 1].name?.[0]?.toLowerCase() &&
							index !== contacts.length) ? (
						<View style={{ ...Styles.searchresultsep }}>
							<Text
								style={{ ...Styles.searchresultseptext, ...Styles.fontBold }}
							>
								{item.name?.[0]?.toUpperCase() || "#"}
							</Text>
						</View>
					) : null} */}
						<Pressable
							onPress={() =>
								selected[item.id]
									? handleRemove(item.id)
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
										source={{
											uri: item?.image?.uri || defaultPeopleImg,
										}}
									/>
								</View>
								<View style={Styles.chatListIteminfo}>
									<View style={Styles.chatListIteminfoTop}>
										<View style={{ ...Styles.chatListIteminfoTitle }}>
											<Text style={Styles.chatListIteminfoTitletxt} numberOfLines={1}>
												{item.name}
											</Text>
										</View>
									</View>
								</View>
								{selected[item.id] ? (
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
					</View>}
					keyExtractor={(item, index) => `list_${index}`}
					ListFooterComponentStyle={loading ?
						<View style={{ marginVertical: 10 }}>
							<ActivityIndicator size="large" color="#6a6f75" />
						</View>
						: null}
				/>
				{!loading && !contacts.length ? <NoResult /> : null}
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
						{Object.values(selected).map((item, index) => (
							<View
								key={`selected_${index}`}
								style={Styles.onlineUserItem}
							>
								<View style={Styles.onlineUserIteminner}>
									<Image
										style={{
											...Styles.onlineUserItemimg,
											...Styles.thumbImg,
										}}
										source={{
											uri: item?.image?.uri || defaultPeopleImg,
										}}
									/>
									<Pressable
										onPress={() => handleRemove(item.id)}
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
			</View >
		) : null}
		{
			page == 1 ?
				<SelectedContactView view={false} selected={selected} setSelected={setSelected} />
				: null
		}
	</>
}

const Sheet = () => {
	const { enableShare } = useContext(MessageContext);
	switch (enableShare) {
		case ATTACHMENT_TYPES.contact:
			return <ShareContact />
		case ATTACHMENT_TYPES.location:
			return <ViewMap scrollEnabled={true} />
		case ATTACHMENT_TYPES.camera:
			return <CameraScreen />
	}
}

export default ShareSheet = () => {
	const { enableShare: share, setEnableShare } = useContext(MessageContext);
	const { Styles, setFullView } = useContext(AppContext)
	const onClose = () => setEnableShare(null);

	useEffect(() => {
		if (share) {
			setFullView(true)
			return () => setFullView(false)
		}
	}, [share])

	return <Modal
		animationType="fade"
		transparent={true}
		visible={share ? true : false}
		onRequestClose={onClose}
		statusBarTranslucent
	>
		<View style={Styles.modalContainer}>
			<KeyboardAvoidingView
				style={Styles.modalmain}
				keyboardVerticalOffset={Platform.OS == "ios" ? statusBarHeight : 0}
				behavior="padding"
			>
				<Sheet />
			</KeyboardAvoidingView>
		</View>
	</Modal>
}