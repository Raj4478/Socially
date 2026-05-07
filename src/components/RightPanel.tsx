import { getRandomUsers } from "@/actions/users.action";
import { currentUser } from "@clerk/nextjs/server";
import RightPanelClient from "./RightPanelClient";

export const dynamic = "force-dynamic";

async function RightPanel() {
  const authUser = await currentUser();
  const suggestions = authUser ? await getRandomUsers() : [];
  return <RightPanelClient suggestions={suggestions} isSignedIn={!!authUser} />;
}

export default RightPanel;
