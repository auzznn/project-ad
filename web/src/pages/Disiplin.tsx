import "./TypeManagement.css";
import ManagementType from "../components/TypeManagement";

export default function DisiplinPage() {
  return (
    <ManagementType
      title="Pengurusan Disiplin"
      fetchUrl="https://backend.eduqr.cloud/api/discipline/type/"
      saveUrl={(id) =>
        id
          ? `https://backend.eduqr.cloud/api/discipline/type/${id}/`
          : "https://backend.eduqr.cloud/api/discipline/type/"
      }
      deleteUrl={(id) => `https://backend.eduqr.cloud/api/discipline/type/${id}/`}
      serverPagination
      pageSize={20}
    />
  );
}
