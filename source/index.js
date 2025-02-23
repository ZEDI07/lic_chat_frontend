import { useContext } from "react";
import Carosel from "./components/carousel";
import ConfirmationDialog from "./components/confirmDialog";
import ContactView from './components/contactView';
import ForwardModel from "./components/forward";
import GroupJoinDialog from "./components/group/join";
import SelectMember from "./components/group/selectMember";
import MuteDialog from "./components/muteDialog";
import ToastNotification from "./components/toast";
import { AppContext } from "./context/app";

export default () => {
  const { confirmationDialog, muteOpen, showImage, forwardOpen, groupJoinDialog, contactView, enableMemberSelection, toastNotification } = useContext(AppContext);
  if (confirmationDialog)
    return <ConfirmationDialog />;
  if (muteOpen)
    return <MuteDialog />;
  if (showImage)
    return <Carosel />
  if (forwardOpen)
    return <ForwardModel />
  if (groupJoinDialog)
    return <GroupJoinDialog />
  if (contactView)
    return <ContactView />
  if (enableMemberSelection)
    return <SelectMember />
  if (toastNotification)
    return <ToastNotification />
  return null;
}