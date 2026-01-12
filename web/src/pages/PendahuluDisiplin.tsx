import "./PapanPendahulu.css";
import LeaderboardBase from "../components/PapanPendahulu";

export default function PendahuluDisiplin() {
  return (
    <LeaderboardBase
      title="Papan Pendahulu Disiplin"
      leaderboardBaseUrl="https://backend.eduqr.cloud/api/discipline/leaderboard/"
      leaderboardByGradeUrl={(g) =>
        `https://backend.eduqr.cloud/api/discipline/leaderboard/${g}/`
      }
      leaderboardByGradeClassUrl={(g, c) =>
        `https://backend.eduqr.cloud/api/discipline/leaderboard/${g}/${c}/`
      }
      studentRecordUrl={(id) =>
        `https://backend.eduqr.cloud/api/discipline/record/student/${id}`
      }
      typeListUrl="https://backend.eduqr.cloud/api/discipline/type/"
      recordTypeKey="discipline_type"
    />
  );
}
