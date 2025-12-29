import "./PapanPendahulu.css";
import LeaderboardBase from "../components/PapanPendahulu";

export default function PendahuluDisiplin() {
  return (
    <LeaderboardBase
      title="Papan Pendahulu Disiplin"
      leaderboardBaseUrl="http://localhost:8080/api/discipline/leaderboard/"
      leaderboardByGradeUrl={(g) =>
        `http://localhost:8080/api/discipline/leaderboard/${g}/`
      }
      leaderboardByGradeClassUrl={(g, c) =>
        `http://localhost:8080/api/discipline/leaderboard/${g}/${c}/`
      }
      studentRecordUrl={(id) =>
        `http://localhost:8080/api/discipline/record/student/${id}`
      }
      typeListUrl="http://localhost:8080/api/discipline/type/"
      recordTypeKey="discipline_type"
    />
  );
}
