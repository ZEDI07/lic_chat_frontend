
/* eslint-disable react-hooks/exhaustive-deps */


import { useContext } from "react";
import { View } from "react-native";
import { AppContext } from "../../context/app";

const LoadingShimmer = () => {
	const { Styles } = useContext(AppContext)
	return <View key={`message_loading_shimmer_head`} style={{ ...Styles.shimmermessages }}>
		{Array(2).fill(null).map((e, index,) => <View key={`shimmer_index_${index}`}>
			<View style={{ ...Styles.shimmermessagesitem, ...Styles.shimmermessagesitemout }}>
				<View style={{gap:10}}>
					<View style={{ ...Styles.shimmermessagesitemmsg, height: 25, width: 180, ...Styles.shimmerbox }}></View>
					<View style={{ ...Styles.shimmermessagesitemmsg, height: 25, width: 180, ...Styles.shimmerbox }}></View>
				</View>
				<View style={{ ...Styles.shimmermessagesitemthumb, ...Styles.shimmerbox }}></View>
			</View>
			<View style={{ ...Styles.shimmermessagesitem, ...Styles.shimmermessagesitemout }}>
				<View style={{ ...Styles.shimmermessagesitemmsg, height: 50, flex: 1, ...Styles.shimmerbox }}></View>
				<View style={{ ...Styles.shimmermessagesitemthumb }}></View>
			</View>
			<View style={{ ...Styles.shimmermessagesitem }}>
				<View style={{ ...Styles.shimmermessagesitemmsg, height: 40, ...Styles.shimmerbox }}></View>
			</View>
			<View style={{ ...Styles.shimmermessagesitem }}>
				<View style={{ ...Styles.shimmermessagesitemmsg, height: 30, width: 150, ...Styles.shimmerbox }}></View>
			</View>
			<View style={{ ...Styles.shimmermessagesitem, ...Styles.shimmermessagesitemout }}>
				<View style={{gap:10}}>
					<View style={{ ...Styles.shimmermessagesitemmsg, height: 25, width: 180, ...Styles.shimmerbox }}></View>
					<View style={{ ...Styles.shimmermessagesitemmsg, height: 25, width: 180, ...Styles.shimmerbox }}></View>
				</View>
				<View style={{ ...Styles.shimmermessagesitemthumb, ...Styles.shimmerbox }}></View>
			</View>
			<View style={{ ...Styles.shimmermessagesitem, ...Styles.shimmermessagesitemout }}>
				<View style={{ ...Styles.shimmermessagesitemmsg, height: 45, flex: 1, ...Styles.shimmerbox }}></View>
				<View style={{ ...Styles.shimmermessagesitemthumb }}></View>
			</View>
			<View style={{ ...Styles.shimmermessagesitem, ...Styles.shimmermessagesitemout }}>
				<View style={{gap:10}}>
					<View style={{ ...Styles.shimmermessagesitemmsg, height: 25, width: 180, ...Styles.shimmerbox }}></View>
					<View style={{ ...Styles.shimmermessagesitemmsg, height: 25, width: 180, ...Styles.shimmerbox }}></View>
				</View>
				<View style={{ ...Styles.shimmermessagesitemthumb, ...Styles.shimmerbox }}></View>
			</View>
			<View style={{ ...Styles.shimmermessagesitem }}>
				<View style={{ ...Styles.shimmermessagesitemmsg, width: 180, height: 25, ...Styles.shimmerbox }}></View>
			</View>
			<View style={{ ...Styles.shimmermessagesitem }}>
				<View style={{ ...Styles.shimmermessagesitemmsg, height: 25, ...Styles.shimmerbox }}></View>
			</View>

		</View>)}
	</View>
};

export default LoadingShimmer