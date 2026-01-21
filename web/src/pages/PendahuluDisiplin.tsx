import "./PapanPendahulu.css";
import LeaderboardBase from "../components/PapanPendahulu";

export default function PendahuluDisiplin() {
  return (
    <LeaderboardBase
      title="Papan Pendahulu Disiplin"
      leaderboardBaseUrl="http://72.62.65.202:8080/api/discipline/leaderboard/"
      leaderboardByGradeUrl={(g) =>
        `http://72.62.65.202:8080/api/discipline/leaderboard/${g}/`
      }
      leaderboardByGradeClassUrl={(g, c) =>
        `http://72.62.65.202:8080/api/discipline/leaderboard/${g}/${c}/`
      }
      studentRecordUrl={(id) =>
        `http://72.62.65.202:8080/api/discipline/record/student/${id}`
      }
      typeListUrl="http://72.62.65.202:8080/api/discipline/type/"
      recordTypeKey="discipline_type"
    />
  );
}
