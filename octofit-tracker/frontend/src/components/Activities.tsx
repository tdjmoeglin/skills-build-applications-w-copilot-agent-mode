import { CapabilityCard } from './CapabilityCard.js';

type ActivityItem = { _id?: string; type: string; minutes: number; points: number };

export default function Activities() {
  return <CapabilityCard<ActivityItem>
    title="Activities"
    description="Track student activity minutes and points."
    endpoint="/api/activities"
    itemsKey="activities"
    emptyMessage="No activities yet."
    itemKey={(activity, index) => activity._id ?? `${activity.type}-${index}`}
    renderItem={(activity) => <><strong>{activity.type}</strong> <span>{activity.minutes} minutes · {activity.points} points</span></>}
  />;
}
