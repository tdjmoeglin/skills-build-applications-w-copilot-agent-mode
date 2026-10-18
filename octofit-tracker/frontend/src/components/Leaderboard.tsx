import { CapabilityCard } from './CapabilityCard.js';

type LeaderboardItem = { teamName: string; totalPoints: number; rank: number };

export default function Leaderboard() {
  return <CapabilityCard<LeaderboardItem>
    title="Leaderboard"
    description="Compare team point totals."
    endpoint="/api/leaderboard"
    itemsKey="leaderboard"
    emptyMessage="No leaderboard scores yet."
    itemKey={(team, index) => `${team.rank}-${index}`}
    renderItem={(team) => <><strong>#{team.rank} {team.teamName}</strong> <span>{team.totalPoints} points</span></>}
  />;
}
