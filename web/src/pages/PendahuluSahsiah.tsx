import "./PapanPendahulu.css";
import LeaderboardBase from "../components/PapanPendahulu";

export default function PendahuluSahsiah() {
  return (
    <LeaderboardBase
      title="Papan Pendahulu Sahsiah"
      leaderboardBaseUrl="https://backend.eduqr.cloud/api/sahsiah/leaderboard/"
      leaderboardByGradeUrl={(g) =>
        `https://backend.eduqr.cloud/api/sahsiah/leaderboard/${g}/`
      }
      leaderboardByGradeClassUrl={(g, c) =>
        `https://backend.eduqr.cloud/api/sahsiah/leaderboard/${g}/${c}/`
      }
      studentRecordUrl={(id) =>
        `https://backend.eduqr.cloud/api/sahsiah/record/student/${id}`
      }
      typeListUrl="https://backend.eduqr.cloud/api/sahsiah/type/"
      recordTypeKey="sahsiah_type"
    />
  );
}
