import "./PapanPendahulu.css";
import LeaderboardBase from "../components/PapanPendahulu";

export default function PendahuluSahsiah() {
  return (
    <LeaderboardBase
      title="Papan Pendahulu Sahsiah"
      leaderboardBaseUrl="http://localhost:8080/api/sahsiah/leaderboard/"
      leaderboardByGradeUrl={(g) =>
        `http://localhost:8080/api/sahsiah/leaderboard/${g}/`
      }
      leaderboardByGradeClassUrl={(g, c) =>
        `http://localhost:8080/api/sahsiah/leaderboard/${g}/${c}/`
      }
      studentRecordUrl={(id) =>
        `http://localhost:8080/api/sahsiah/record/student/${id}`
      }
      typeListUrl="http://localhost:8080/api/sahsiah/type/"
      recordTypeKey="sahsiah_type"
    />
  );
}
