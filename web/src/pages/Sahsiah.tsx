import "./TypeManagement.css";
import ManagementType from "../components/TypeManagement";

export default function SahsiahPage() {
  return (
    <ManagementType
      title="Pengurusan Sahsiah"
      fetchUrl="https://backend.eduqr.cloud/api/sahsiah/type/"
      saveUrl={(id) =>
        id
          ? `https://backend.eduqr.cloud/api/sahsiah/type/${id}/`
          : "https://backend.eduqr.cloud/api/sahsiah/type/"
      }
      deleteUrl={(id) => `https://backend.eduqr.cloud/api/sahsiah/type/${id}/`}
    />
  );
}
