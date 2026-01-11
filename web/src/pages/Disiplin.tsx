import "./TypeManagement.css";
import ManagementType from "../components/TypeManagement";

const categories = [
  "Merosak Alam",
  "Mengabaikan Pelajaran",
  "Mengabaikan Tanggungjawab",
  "Akhlak Buruk",
];

export default function DisiplinPage() {
  return (
    <ManagementType
      title="Pengurusan Disiplin"
      fetchUrl="http://72.62.65.202:8080/api/discipline/type/"
      saveUrl={(id) =>
        id
          ? `http://72.62.65.202:8080/api/discipline/type/${id}/`
          : "http://72.62.65.202:8080/api/discipline/type/"
      }
      deleteUrl={(id) => `http://72.62.65.202:8080/api/discipline/type/${id}/`}
      categories={categories}
      serverPagination
      pageSize={20}
    />
  );
}
