import { useContext } from "react";
import { CALL_MODE } from "../../constant";
import { callInIcon, callOutIcon, missedcallInIcon, missedcallOutIcon } from "../../constant/icons";
import { AppContext } from "../../context/app";


// export const CallStatusIcon = ({ callMode, status }) => {
//     const { Styles } = useContext(AppContext);
//     if (callMode == CALL_MODE.incoming) {
//         switch (status) {
//             case CALL_STATUS.accepted:
//             case CALL_STATUS.disconnected:
//             case CALL_STATUS.initiated:
//             case CALL_STATUS.ringing:
//                 return callInIcon(Styles.iconlight);
//             case CALL_STATUS.rejected:
//             case CALL_STATUS.busy:
//                 return missedcallInIcon(Styles.icondanger);
//         }
//     } else switch (status) {
//         case CALL_STATUS.accepted:
//         case CALL_STATUS.disconnected:
//         case CALL_STATUS.initiated:
//         case CALL_STATUS.ringing:
//             return callOutIcon(Styles.iconlight);
//         case CALL_STATUS.rejected:
//         case CALL_STATUS.busy:
//             return missedcallOutIcon(Styles.icondanger);
//     }
// }

export const CallStatusIcon = ({ message, callMode }) => {
    const { Styles } = useContext(AppContext);
    if (callMode == CALL_MODE.incoming) {
        if (!message.startedAt && message.endAt) {
            return missedcallInIcon(Styles.icondanger);
        }
        return callInIcon(Styles.iconlight)
    }
    else {
        if (!message.startedAt && message.endAt) {
            return missedcallOutIcon(Styles.icondanger);
        }
        return callOutIcon(Styles.iconlight)
    }
}