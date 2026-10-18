import { Activity, Team, User, Workout } from '../models/index.js';

type InputRecord = Record<string, unknown>;

function isRecord(input: unknown): input is InputRecord {
  return typeof input === 'object' && input !== null && !Array.isArray(input);
}

function httpError(status: number, message: string) {
  return Object.assign(new Error(message), { status });
}

export async function listActivities() {
  return Activity.find().sort({ occurredAt: -1 }).lean();
}

export async function createActivity(input: unknown) {
  if (!isRecord(input)) throw httpError(400, 'Activity details are required');
  const { userId, teamId, type, minutes } = input;
  if (typeof userId !== 'string' || !User.db.base.isValidObjectId(userId)) throw httpError(400, 'A valid userId is required');
  if (typeof teamId !== 'string' || !Team.db.base.isValidObjectId(teamId)) throw httpError(400, 'A valid teamId is required');
  if (typeof type !== 'string' || !type.trim()) throw httpError(400, 'Activity type is required');
  if (typeof minutes !== 'number' || !Number.isFinite(minutes) || minutes <= 0) throw httpError(400, 'Minutes must be a positive number');

  const [user, team] = await Promise.all([User.findById(userId), Team.findById(teamId)]);
  if (!user) throw httpError(404, 'User not found');
  if (!team) throw httpError(404, 'Team not found');

  return Activity.create({
    user: user._id,
    team: team._id,
    type: type.trim(),
    minutes,
    points: minutes,
    occurredAt: new Date(),
  });
}

export async function listTeams() {
  return Team.find().lean();
}

export async function createTeam(input: unknown) {
  if (!isRecord(input)) throw httpError(400, 'Team details are required');
  const { name, mascot } = input;
  const members = input.members ?? [];
  if (typeof name !== 'string' || !name.trim()) throw httpError(400, 'Team name is required');
  if (typeof mascot !== 'string' || !mascot.trim()) throw httpError(400, 'Team mascot is required');
  if (!Array.isArray(members) || members.some((member) => typeof member !== 'string' || !User.db.base.isValidObjectId(member))) {
    throw httpError(400, 'Team members must be valid user IDs');
  }

  const existingMembers = await User.find({ _id: { $in: members } }).select('_id').lean();
  if (existingMembers.length !== members.length) throw httpError(404, 'One or more team members were not found');

  return Team.create({ name: name.trim(), mascot: mascot.trim(), members });
}

export async function getLeaderboard() {
  const [teams, totals] = await Promise.all([
    Team.find().select('name').lean(),
    Activity.aggregate<{ _id: unknown; totalPoints: number }>([
      { $group: { _id: '$team', totalPoints: { $sum: '$points' } } },
    ]),
  ]);
  const pointsByTeam = new Map(totals.map((entry) => [String(entry._id), entry.totalPoints]));
  return teams
    .map((team) => ({ teamName: team.name, totalPoints: pointsByTeam.get(String(team._id)) ?? 0 }))
    .sort((left, right) => right.totalPoints - left.totalPoints || left.teamName.localeCompare(right.teamName))
    .map((team, index) => ({ ...team, rank: index + 1 }));
}

export async function suggestWorkouts(userEmail: string) {
  const user = await User.findOne({ email: userEmail }).lean();
  if (!user) throw httpError(404, 'User not found');

  const [recentActivity, workouts] = await Promise.all([
    Activity.findOne({ user: user._id }).sort({ occurredAt: -1 }).lean(),
    Workout.find().lean(),
  ]);
  const activityFocus: Record<string, string> = {
    cycle: 'endurance',
    run: 'endurance',
    strength: 'strength',
    walk: 'endurance',
  };
  const recentFocus = recentActivity ? activityFocus[recentActivity.type.toLowerCase()] : undefined;
  const hasGoalWorkout = workouts.some((workout) => workout.focus === user.fitnessGoal);
  const targetFocus = hasGoalWorkout ? user.fitnessGoal : recentFocus ?? user.fitnessGoal;

  return workouts
    .map((workout) => ({
      ...workout,
      reason: workout.focus === user.fitnessGoal
        ? `Recommended for your ${user.fitnessGoal} goal.`
        : recentActivity && workout.focus === recentFocus
          ? `Based on your recent ${recentActivity.type} activity.`
          : `A ${workout.focus} option to support your training.`,
    }))
    .sort((left, right) => Number(right.focus === targetFocus) - Number(left.focus === targetFocus));
}

export { User };
