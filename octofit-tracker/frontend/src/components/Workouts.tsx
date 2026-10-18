import { CapabilityCard } from './CapabilityCard.js';

type WorkoutItem = { _id?: string; title: string; focus: string; minutes: number; reason: string };

export default function Workouts() {
  return <CapabilityCard<WorkoutItem>
    title="Workout suggestions"
    description="Recommend workouts from activity patterns."
    endpoint="/api/workouts/suggestions/mona%40example.com"
    itemsKey="suggestions"
    emptyMessage="No workout suggestions available."
    itemKey={(workout, index) => workout._id ?? `${workout.title}-${index}`}
    renderItem={(workout) => <><strong>{workout.title}</strong> <span>{workout.focus} · {workout.minutes} minutes</span><p className="mb-0">{workout.reason}</p></>}
  />;
}
