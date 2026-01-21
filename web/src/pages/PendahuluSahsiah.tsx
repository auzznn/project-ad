import "./PapanPendahulu.css";
import LeaderboardBase from "../components/PapanPendahulu";

export default function PendahuluSahsiah() {
  return (
    <LeaderboardBase
      title="Papan Pendahulu Sahsiah"
      leaderboardBaseUrl="http://72.62.65.202:8080/api/sahsiah/leaderboard/"
      leaderboardByGradeUrl={(g) =>
        `http://72.62.65.202:8080/api/sahsiah/leaderboard/${g}/`
      }
      leaderboardByGradeClassUrl={(g, c) =>
        `http://72.62.65.202:8080/api/sahsiah/leaderboard/${g}/${c}/`
      }
      studentRecordUrl={(id) =>
        `http://72.62.65.202:8080/api/sahsiah/record/student/${id}`
      }
      typeListUrl="http://72.62.65.202:8080/api/sahsiah/type/"
      recordTypeKey="sahsiah_type"
    />
  );
}
