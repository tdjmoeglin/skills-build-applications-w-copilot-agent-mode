import { CapabilityCard } from './CapabilityCard.js';

type TeamItem = { _id?: string; name: string; mascot?: string; members: string[] };

export default function Teams() {
  return <CapabilityCard<TeamItem>
    title="Teams"
    description="Manage teams and members."
    endpoint="/api/teams"
    itemsKey="teams"
    emptyMessage="No teams yet."
    itemKey={(team, index) => team._id ?? `${team.name}-${index}`}
    renderItem={(team) => <><strong>{team.name}</strong>{team.mascot ? ` · ${team.mascot}` : ''} <span>({team.members.length} members)</span></>}
  />;
}
