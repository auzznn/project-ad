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
      fetchUrl="localhost/api/discipline/type/"
      saveUrl={(id) =>
        id
          ? `http://localhost:8080/api/discipline/type/${id}/`
          : "http://localhost:8080/api/discipline/type/"
      }
      deleteUrl={(id) => `localhost/api/discipline/type/${id}/`}
      categories={categories}
      serverPagination
      pageSize={20}
    />
  );
}
